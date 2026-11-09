
export interface AuthData {
  country: string
  phone: string
  pin: string
  otpPhone?: string
  individualAccountCode?: string
  individualAccountSuffix?: string
  businessAccountCode?: string
  cardLastFour?: string
  swiftBeneficiaryName?: string
  recentPayeeName?: string
}

const primaryAuth: AuthData = {
  country: process.env.MB_COUNTRY || 'Malta',
  phone: process.env.MB_PHONE || '99011190',
  pin: process.env.MB_PIN || '2468',
  otpPhone: process.env.OTP_PHONE,
  individualAccountCode: process.env.MB_INDIVIDUAL_CODE || 'VEG40002',
  individualAccountSuffix: process.env.MB_INDIVIDUAL_SUFFIX || '-1',
  businessAccountCode: process.env.MB_BUSINESS_CODE || 'DER00003',
  cardLastFour: process.env.MB_CARD_LAST_FOUR || '0015',
}

const secondaryPhone = process.env.MB_ALT_PHONE || process.env.AUTH_OTP_MB_PHONE || '99587171'

const secondaryAuth: AuthData = {
  country: process.env.MB_ALT_COUNTRY || primaryAuth.country,
  phone: secondaryPhone,
  pin: process.env.MB_ALT_PIN || process.env.AUTH_OTP_MB_PIN || primaryAuth.pin,
  otpPhone: process.env.MB_ALT_OTP_PHONE || process.env.AUTH_OTP_OTP_PHONE,
  individualAccountCode: process.env.MB_ALT_INDIVIDUAL_CODE || 'KER40014',
  individualAccountSuffix: process.env.MB_ALT_INDIVIDUAL_SUFFIX || '-1',
  businessAccountCode: process.env.MB_ALT_BUSINESS_CODE || 'DON00003',
  cardLastFour: process.env.MB_ALT_CARD_LAST_FOUR || '0015',
}

// The only login with the Elite tier greeting, which reopens after an account switch.
export const ELITE_INDIVIDUAL_CODE = 'MUM40001'

export const AUTH_POOL: AuthData[] = [primaryAuth, secondaryAuth]

const nationalNumber = (phone: string) => phone.replace(/\D/g, '').replace(/^(?:00)?356(?=\d{8}$)/, '')

const getWorkerIndex = () => {
  const workerId = process.env.WDIO_WORKER_ID || ''
  const match = workerId.match(/-(\d+)$/)
  const index = match ? Number(match[1]) : 0
  return Number.isFinite(index) ? index : 0
}

const getAuthBySlot = () => {
  const slot = process.env.MB_AUTH_SLOT?.trim().toLowerCase()
  const namedBusinessCodes: Record<string, string> = {
    laz: 'XER00249',
    rog: 'XER00249',
    mum: 'XER00247',
    pop: 'XER00250',
  }
  const namedSwiftBeneficiaries: Record<string, string> = { mum: 'Swift Beneficiary' }
  const namedRecentPayees: Record<string, string> = { laz: 'Sengali Manta' }
  const namedCodes: Record<string, string> = {
    kat: 'KAT40008',
    mai: 'MAI40018',
    laz: 'LAZ40012',
    rog: 'ROG40015',
    mum: 'MUM40001',
    pop: 'POP40015',
  }
  if (slot && namedCodes[slot]) {
    const prefix = `MB_${slot.toUpperCase()}`
    const phone = process.env[`${prefix}_PHONE`]
    const pin = process.env[`${prefix}_PIN`]
    if (!phone || !pin) throw new Error(`${prefix}_PHONE and ${prefix}_PIN are required`)
    if (AUTH_POOL.some(account => nationalNumber(account.phone) === nationalNumber(phone))) {
      throw new Error(`${prefix}_PHONE must use a different login from primary and secondary`)
    }
    return {
      country: process.env[`${prefix}_COUNTRY`] || 'Malta',
      phone,
      pin,
      otpPhone: process.env[`${prefix}_OTP_PHONE`] || phone,
      individualAccountCode: process.env[`${prefix}_INDIVIDUAL_CODE`] || namedCodes[slot],
      individualAccountSuffix: process.env[`${prefix}_INDIVIDUAL_SUFFIX`] || '-1',
      businessAccountCode: process.env[`${prefix}_BUSINESS_CODE`] || namedBusinessCodes[slot],
      cardLastFour: process.env[`${prefix}_CARD_LAST_FOUR`],
      swiftBeneficiaryName: process.env[`${prefix}_SWIFT_BENEFICIARY_NAME`] || namedSwiftBeneficiaries[slot],
      recentPayeeName: process.env[`${prefix}_RECENT_PAYEE_NAME`] || namedRecentPayees[slot],
    }
  }
  if (slot === 'primary') {
    if (!process.env.MB_PHONE) throw new Error('MB_AUTH_SLOT=primary requires MB_PHONE')
    return primaryAuth
  }
  if (slot === 'secondary' || slot === 'alt') {
    if (nationalNumber(secondaryAuth.phone) === nationalNumber(primaryAuth.phone)) {
      throw new Error('MB_AUTH_SLOT=secondary must use a different account than MB_PHONE')
    }
    return secondaryAuth
  }

  return AUTH_POOL[getWorkerIndex() % AUTH_POOL.length]
}

export const AUTH: AuthData = getAuthBySlot()

export const AUTH_SECURITY: AuthData = {
  country: process.env.MB_COUNTRY || 'Malta',
  get phone() {
    const phone = process.env.AUTH_SECURITY_MB_PHONE
    if (!phone) throw new Error('AUTH_SECURITY_MB_PHONE is not set')
    return phone
  },
  pin: process.env.AUTH_SECURITY_MB_PIN || '2468',
  otpPhone: process.env.AUTH_SECURITY_OTP_PHONE,
}

export function getPasscodeRecoveryPhone() {
  const configured = process.env.AUTH_RECOVERY_MB_PHONE?.trim()
  if (!configured) throw new Error('AUTH_RECOVERY_MB_PHONE is required for passcode recovery')

  const phone = nationalNumber(configured)
  if (!/^\d{8}$/.test(phone)) throw new Error('AUTH_RECOVERY_MB_PHONE must be a Maltese mobile number')

  const sharedPhones = [
    primaryAuth.phone,
    secondaryAuth.phone,
    process.env.MB_ALT_PHONE,
    process.env.AUTH_OTP_MB_PHONE,
    process.env.AUTH_SECURITY_MB_PHONE,
    process.env.PD_MB_PHONE,
    process.env.BH_MB_PHONE,
    process.env.MB_KAT_PHONE,
    process.env.MB_MAI_PHONE,
    process.env.MB_LAZ_PHONE,
    process.env.MB_ROG_PHONE,
    process.env.MB_MUM_PHONE,
    process.env.MB_POP_PHONE,
  ]
  if (sharedPhones.some(shared => shared && nationalNumber(shared) === phone)) {
    throw new Error('AUTH_RECOVERY_MB_PHONE must belong to a separate recovery test account')
  }
  return phone
}

export const PD_AUTH: AuthData = {
  country: process.env.MB_COUNTRY || 'Malta',
  get phone() {
    const phone = process.env.PD_MB_PHONE
    if (!phone) throw new Error('PD_MB_PHONE is not set')
    return phone
  },
  pin: process.env.PD_MB_PIN || '1212',
  otpPhone: process.env.PD_OTP_PHONE,
}
