import { randomInt } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

type GeneratedMtPhone = {
  country: string
  countryCode: string
  local: string
  international: string
  otpPhone: string
}

const normalizeDigits = (value: string) => String(value || '').replace(/\D/g, '')

const usedPhonesPath = () =>
  resolve(process.cwd(), process.env.GENERATED_PHONES_FILE || '.generated/used-mt-phone-numbers.json')

const readUsedPhones = () => {
  const path = usedPhonesPath()
  const used = new Set<string>()

  if (existsSync(path)) {
    try {
      const parsed = JSON.parse(readFileSync(path, 'utf8')) as unknown
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const digits = normalizeDigits(String(item || ''))
          if (digits) used.add(digits)
        }
      }
    } catch {
      // Ignore malformed local cache and continue with env-provided exclusions.
    }
  }

  for (const item of String(process.env.GENERATED_PHONES_EXCLUDE || '')
    .split(',')
    .map((value) => normalizeDigits(value.trim()))
    .filter(Boolean)) {
    used.add(item)
  }

  return used
}

const writeUsedPhones = (used: Set<string>) => {
  const path = usedPhonesPath()
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(Array.from(used).sort(), null, 2)}\n`)
}

const formatOtpPhone = (countryCode: string, local: string) =>
  `+${countryCode} ${local.slice(0, 4)} ${local.slice(4)}`.trim()

export const generateUniqueMalteseMobileNumber = (): GeneratedMtPhone => {
  const countryCode = normalizeDigits(process.env.ONBOARDING_PHONE_COUNTRY_CODE || '356')
  const prefix = normalizeDigits(process.env.ONBOARDING_PHONE_PREFIX || '99')
  const suffixLength = Number(process.env.ONBOARDING_PHONE_RANDOM_DIGITS || 6)
  const localLength = prefix.length + suffixLength
  const used = readUsedPhones()

  const existingLoginPhone = normalizeDigits(process.env.MB_PHONE || '')
  if (existingLoginPhone) {
    used.add(existingLoginPhone.startsWith(countryCode) ? existingLoginPhone.slice(countryCode.length) : existingLoginPhone)
  }

  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const max = 10 ** suffixLength
    const suffix = String(randomInt(0, max)).padStart(suffixLength, '0')
    const local = `${prefix}${suffix}`
    const internationalDigits = `${countryCode}${local}`

    if (local.length !== localLength) continue
    if (used.has(local) || used.has(internationalDigits)) continue

    used.add(local)
    writeUsedPhones(used)

    return {
      country: 'Malta',
      countryCode,
      local,
      international: `+${internationalDigits}`,
      otpPhone: formatOtpPhone(countryCode, local),
    }
  }

  throw new Error(`Could not generate a unique MT phone number with prefix ${prefix}`)
}
