import { randomInt } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const BIC_REGEX = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/
const ALPHANUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export type GeneratedBic = {
  bic8: string
  bic11: string
}

const normalizeBic = (value: string) => String(value || '').replace(/\s+/g, '').toUpperCase()

const sanitizeBankCode = (value: string) =>
  String(value || '')
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase()
    .padEnd(4, 'X')
    .slice(0, 4)

const sanitizeCountryCode = (value: string) =>
  String(value || '')
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase()
    .padEnd(2, 'X')
    .slice(0, 2)

const sanitizeBranchCode = (value: string) =>
  String(value || '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .padEnd(3, 'X')
    .slice(0, 3)

const usedBicsPath = () => resolve(process.cwd(), process.env.GENERATED_BICS_FILE || '.generated/used-bics.json')

const readUsedBics = () => {
  const path = usedBicsPath()
  const used = new Set<string>()

  if (existsSync(path)) {
    try {
      const parsed = JSON.parse(readFileSync(path, 'utf8')) as unknown
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const bic = normalizeBic(String(item || ''))
          if (bic && BIC_REGEX.test(bic)) used.add(bic)
        }
      }
    } catch {
      // Ignore malformed cache and continue.
    }
  }

  for (const item of String(process.env.GENERATED_BICS_EXCLUDE || '')
    .split(',')
    .map((value) => normalizeBic(value.trim()))
    .filter(Boolean)) {
    if (BIC_REGEX.test(item)) used.add(item)
  }

  return used
}

const writeUsedBics = (used: Set<string>) => {
  const path = usedBicsPath()
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(Array.from(used).sort(), null, 2)}\n`)
}

const randomAlphanum = (length: number) =>
  Array.from({ length }, () => ALPHANUM[randomInt(0, ALPHANUM.length)]).join('')

export type GenerateSwiftBicOptions = {
  bankCode?: string
  countryCode?: string
  locationCode?: string
  branchCode?: string
}

export const generateUniqueSwiftBic = (options: GenerateSwiftBicOptions = {}): GeneratedBic => {
  const bankCode = sanitizeBankCode(options.bankCode ?? process.env.BIC_BANK_CODE ?? 'MBQA')
  const countryCode = sanitizeCountryCode(options.countryCode ?? process.env.BIC_COUNTRY_CODE ?? 'MT')
  const branchCode = sanitizeBranchCode(options.branchCode ?? process.env.BIC_BRANCH_CODE ?? 'XXX')

  const used = readUsedBics()

  // If locationCode is fixed (e.g. 'MT' for CCUHMTMT), use it directly without randomisation.
  if (options.locationCode) {
    const loc = options.locationCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase().padEnd(2, 'X').slice(0, 2)
    const bic8 = `${bankCode}${countryCode}${loc}`
    const bic11 = `${bic8}${branchCode}`
    if (!BIC_REGEX.test(bic11)) throw new Error(`Generated BIC ${bic11} does not match BIC regex`)
    used.add(bic11)
    writeUsedBics(used)
    return { bic8, bic11 }
  }

  for (let attempt = 0; attempt < 2000; attempt += 1) {
    const locationCode = randomAlphanum(2)
    const bic8 = `${bankCode}${countryCode}${locationCode}`
    const bic11 = `${bic8}${branchCode}`

    if (!BIC_REGEX.test(bic11)) continue
    if (used.has(bic11)) continue

    used.add(bic11)
    writeUsedBics(used)

    return { bic8, bic11 }
  }

  throw new Error('Could not generate a unique BIC/SWIFT code')
}
