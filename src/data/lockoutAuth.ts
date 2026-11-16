import type { AuthData } from './credentials'
import { takeOnboardedAccount } from '../helpers/phone.helper'

/**
 * Account for the auth specs that only need the login passcode/OTP screens. Takes an account created by
 * onboarding (never KYC-verified, so it stops before Home); `consume` marks it used for specs that lock it.
 * Falls back to AUTH_SECURITY when the pool is empty.
 */
export function lockoutAuth(usedBy: string, { consume }: { consume: boolean }): AuthData & { pooled: boolean } {
  const pooled = process.env.AUTH_LOCKOUT_USE_POOL === 'false' ? null : takeOnboardedAccount(usedBy, { consume })
  if (pooled) {
    return { country: 'Malta', phone: pooled.phone, pin: pooled.pin, otpPhone: pooled.otpPhone, pooled: true }
  }
  const phone = process.env.AUTH_SECURITY_MB_PHONE
  if (!phone) throw new Error('No onboarded account in the pool and AUTH_SECURITY_MB_PHONE is not set')
  return {
    country: process.env.MB_COUNTRY || 'Malta',
    phone,
    pin: process.env.AUTH_SECURITY_MB_PIN || '2468',
    otpPhone: process.env.AUTH_SECURITY_OTP_PHONE,
    pooled: false,
  }
}
