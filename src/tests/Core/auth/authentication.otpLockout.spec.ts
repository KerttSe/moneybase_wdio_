import { browser } from '@wdio/globals'
import { authenticationPage } from '../../../pages/AuthenticationPage'
import { loginPage, LoginOtpRejectedError } from '../../../pages/LoginPage'
import { AUTH_POOL } from '../../../data/credentials'

describe('Authentication - Security', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))

  const [primaryAccount, secondaryAccount] = AUTH_POOL
  const pin = process.env.AUTH_SECURITY_MB_PIN || '2468'

  beforeEach(async function () {
    if (!browser.isIOS || process.env.AUTH_SECURITY_RUN_OTP_LOCKOUT !== 'true') return this.skip()
    const phone = process.env.AUTH_SECURITY_MB_PHONE
    if (!phone) throw new Error('AUTH_SECURITY_MB_PHONE is not set')
    if (phone === primaryAccount.phone || phone === '99011190') {
      throw new Error('Authentication OTP specs must use a secondary/security account, not primary')
    }
    if (phone === secondaryAccount.phone) {
      throw new Error('Authentication OTP specs must not use the secondary smoke account')
    }
    await authenticationPage.restartToLoginScreen()
    await authenticationPage.navigateToPasscodeScreen(phone)
  })

  it('[TC3142] Third incorrect OTP triggers the OTP lockout', async function () {
    const invalidOtp = process.env.AUTH_SECURITY_INVALID_OTP?.trim()
    if (!invalidOtp || !/^\d{6}$/.test(invalidOtp)) {
      throw new Error('AUTH_SECURITY_INVALID_OTP must be a known invalid six-digit code')
    }

    await authenticationPage.enterPin(pin)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await loginPage.enterOtp(invalidOtp)
        await loginPage.tapContinueAfterOtp()
      } catch (error) {
        if (!(error instanceof LoginOtpRejectedError)) throw error
      }

      if (attempt < 3) await authenticationPage.verifyIncorrectOtpFeedbackIOS()
      else await authenticationPage.waitForOtpLockoutIOS()
    }
  })
})
