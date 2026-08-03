import { browser } from '@wdio/globals'
import { authenticationPage } from '../pages/AuthenticationPage'

describe('Authentication - Security', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))

  const phone = process.env.AUTH_OTP_MB_PHONE
  const pin = process.env.AUTH_OTP_MB_PIN || '2468'
  if (!phone) throw new Error('AUTH_OTP_MB_PHONE is not set')

  beforeEach(async function () {
    if (!(browser.isAndroid || browser.isIOS)) this.skip()
    await authenticationPage.restartToLoginScreen()
    await authenticationPage.navigateToPasscodeScreen(phone)
  })

  it('AUTH-1.3 OTP countdown is shown and Resend becomes active (TC204)', async function () {
    await authenticationPage.enterPin(pin)
    await authenticationPage.enterOtpNoise()
    await authenticationPage.waitForResendEnabled()
  })
})
