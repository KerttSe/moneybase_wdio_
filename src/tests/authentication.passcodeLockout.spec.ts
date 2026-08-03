import { browser } from '@wdio/globals'
import { authenticationPage } from '../pages/AuthenticationPage'
import { readLatestOnboardedAccount } from '../helpers/phone.helper'

describe('Authentication - Security', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))

  const savedAccount = readLatestOnboardedAccount()
  const phone = process.env.AUTH_SECURITY_MB_PHONE || savedAccount?.phone
  const pin = process.env.AUTH_SECURITY_MB_PIN || savedAccount?.pin || '2468'
  const otpPhone =
    process.env.AUTH_SECURITY_OTP_PHONE ||
    savedAccount?.otpPhone ||
    (phone ? `+356 ${phone.slice(0, 4)} ${phone.slice(4)}` : '')
  if (!phone) throw new Error('AUTH_SECURITY_MB_PHONE is not set and no onboarded account file found')

  beforeEach(async function () {
    if (!(browser.isAndroid || browser.isIOS)) this.skip()
    await authenticationPage.restartToLoginScreen()
    await authenticationPage.navigateToPasscodeScreen(phone)
  })

  afterEach(async function () {
    // Unlock account via OTP so subsequent test runs can use the account
    await authenticationPage.unlockViaOtp(otpPhone).catch(() => {})
  })

  it('AUTH-1.2 App locks after 3 invalid passcode attempts (TC200)', async function () {
    const wrongPin = pin === '1111' ? '2222' : '1111'

    await authenticationPage.enterPin(wrongPin)
    await authenticationPage.waitForPasscodeError()

    await authenticationPage.enterPin(wrongPin)
    await authenticationPage.waitForPasscodeError()

    await authenticationPage.enterPin(wrongPin)
    await authenticationPage.waitForAccountLocked()
  })
})
