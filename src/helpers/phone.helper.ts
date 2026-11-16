import { randomInt } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

type GeneratedMtPhone = {
  country: string
  countryCode: string
  local: string
  international: string
  otpPhone: string
}

type OnboardedAccount = {
  phone: string
  international: string
  otpPhone: string
  pin: string
  createdAt: string
}

const onboardedAccountsPath = () =>
  resolve(process.cwd(), process.env.ONBOARDED_ACCOUNTS_FILE || '.generated/onboarded-accounts.json')

export const saveOnboardedAccount = (phone: GeneratedMtPhone, pin: string) => {
  const path = onboardedAccountsPath()
  mkdirSync(dirname(path), { recursive: true })

  const account: OnboardedAccount = {
    phone: phone.local,
    international: phone.international,
    otpPhone: phone.otpPhone,
    pin,
    createdAt: new Date().toISOString(),
  }

  writeFileSync(path, `${JSON.stringify(account, null, 2)}\n`)
  console.log(`[Onboarding] Saved onboarded account to ${path}: ${phone.otpPhone}`)
  withPoolLock(() => {
    const pool = readPool()
    if (!pool.some((a) => a.phone === account.phone)) writePool([...pool, account])
  })
}

/* ---------- onboarded account pool ----------
 * Every finished onboarding adds its account here. Auth specs that lock an account take a fresh one
 * (consume) so a lock never hits a shared login; specs that do not lock reuse any unlocked one. */

type PooledAccount = OnboardedAccount & { usedAt?: string; usedBy?: string }

const onboardedPoolPath = () =>
  resolve(process.cwd(), process.env.ONBOARDED_POOL_FILE || '.generated/onboarded-pool.json')

const readPool = (): PooledAccount[] => {
  const path = onboardedPoolPath()
  if (existsSync(path)) {
    try {
      const data = JSON.parse(readFileSync(path, 'utf8')) as unknown
      if (Array.isArray(data)) return data as PooledAccount[]
    } catch {}
    return []
  }
  // First use: seed the pool with the latest single onboarded account, if any.
  const latest = readLatestOnboardedAccount()
  return latest ? [latest] : []
}

const writePool = (pool: PooledAccount[]) => {
  const path = onboardedPoolPath()
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(pool, null, 2)}\n`)
}

// WDIO workers are separate processes: a lock directory keeps two specs from taking the same account.
const withPoolLock = <T>(fn: () => T): T => {
  const lock = `${onboardedPoolPath()}.lock`
  mkdirSync(dirname(lock), { recursive: true })
  const deadline = Date.now() + 10000
  for (;;) {
    try {
      mkdirSync(lock)
      break
    } catch {
      if (Date.now() > deadline) {
        rmSync(lock, { recursive: true, force: true })
        continue
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50)
    }
  }
  try {
    return fn()
  } finally {
    rmSync(lock, { recursive: true, force: true })
  }
}

export const takeOnboardedAccount = (usedBy: string, { consume }: { consume: boolean }): OnboardedAccount | null =>
  withPoolLock(() => {
    const pool = readPool()
    const account = pool.find((a) => !a.usedAt)
    if (!account) return null
    if (consume) {
      account.usedAt = new Date().toISOString()
      account.usedBy = usedBy
      writePool(pool)
    }
    console.log(`[Pool] ${usedBy} ${consume ? 'took' : 'reuses'} onboarded account ${account.otpPhone}; ${pool.filter((a) => !a.usedAt).length} unused left`)
    return account
  })

export const readLatestOnboardedAccount = (): OnboardedAccount | null => {
  const path = onboardedAccountsPath()
  if (!existsSync(path)) return null

  try {
    const data = JSON.parse(readFileSync(path, 'utf8')) as unknown
    if (data && typeof data === 'object' && 'phone' in (data as object)) {
      return data as OnboardedAccount
    }
  } catch {}

  return null
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

  const reservedPhoneKeys = [
    'MB_PHONE', 'MB_ALT_PHONE', 'AUTH_OTP_MB_PHONE', 'AUTH_SECURITY_MB_PHONE',
    'PD_MB_PHONE', 'BH_MB_PHONE', 'BC_ADMIN_SELF_ASSIGN_PHONE', 'ADD_BENEFICIARY_MB_PHONE',
  ]
  for (const key of reservedPhoneKeys) {
    const phone = normalizeDigits(process.env[key] || '')
    if (phone) used.add(phone.startsWith(countryCode) ? phone.slice(countryCode.length) : phone)
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
