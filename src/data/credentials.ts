
export interface AuthData {
  country: string
  phone: string
  pin: string
  otpPhone?: string
  individualAccountCode?: string
  individualAccountSuffix?: string
  cardLastFour?: string
}

const primaryAuth: AuthData = {
  country: process.env.MB_COUNTRY || 'Malta',
  phone: process.env.MB_PHONE || '99011190',
  pin: process.env.MB_PIN || '2468',
  otpPhone: process.env.OTP_PHONE,
  individualAccountCode: process.env.MB_INDIVIDUAL_CODE || 'VEG40002',
  individualAccountSuffix: process.env.MB_INDIVIDUAL_SUFFIX || '-1',
  cardLastFour: process.env.MB_CARD_LAST_FOUR || '0036',
}

const secondaryPhone = process.env.MB_ALT_PHONE || process.env.AUTH_OTP_MB_PHONE || '99587171'

const secondaryAuth: AuthData = {
  country: process.env.MB_ALT_COUNTRY || primaryAuth.country,
  phone: secondaryPhone,
  pin: process.env.MB_ALT_PIN || process.env.AUTH_OTP_MB_PIN || primaryAuth.pin,
  otpPhone: process.env.MB_ALT_OTP_PHONE || process.env.AUTH_OTP_OTP_PHONE,
  individualAccountCode: process.env.MB_ALT_INDIVIDUAL_CODE || 'KER40014',
  individualAccountSuffix: process.env.MB_ALT_INDIVIDUAL_SUFFIX || '-1',
  cardLastFour: process.env.MB_ALT_CARD_LAST_FOUR || '0015',
}

export const AUTH_POOL: AuthData[] = [primaryAuth, secondaryAuth]

const getWorkerIndex = () => {
  const workerId = process.env.WDIO_WORKER_ID || ''
  const match = workerId.match(/-(\d+)$/)
  const index = match ? Number(match[1]) : 0
  return Number.isFinite(index) ? index : 0
}

const getAuthBySlot = () => {
  const slot = process.env.MB_AUTH_SLOT?.trim().toLowerCase()
  if (slot === 'primary') {
    if (!process.env.MB_PHONE) throw new Error('MB_AUTH_SLOT=primary requires MB_PHONE')
    return primaryAuth
  }
  if (slot === 'secondary' || slot === 'alt') {
    if (secondaryAuth.phone === primaryAuth.phone) {
      throw new Error('MB_AUTH_SLOT=secondary must use a different account than MB_PHONE')
    }
    return secondaryAuth
  }

  return AUTH_POOL[getWorkerIndex() % AUTH_POOL.length]
}

export const AUTH: AuthData = getAuthBySlot()
