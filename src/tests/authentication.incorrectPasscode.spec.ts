import { browser } from '@wdio/globals'
import { authenticationPage } from '../pages/AuthenticationPage'
import { readLatestOnboardedAccount } from '../helpers/phone.helper'

describe('Authentication - Security', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))

  const savedAccount = readLatestOnboardedAccount()
  const phone = process.env.AUTH_SECURITY_MB_PHONE || savedAccount?.phone
  const pin = process.env.AUTH_SECURITY_MB_PIN || savedAccount?.pin || '2468'
  if (!phone) throw new Error('AUTH_SECURITY_MB_PHONE is not set and no onboarded account file found')

  beforeEach(async function () {
    if (!(browser.isAndroid || browser.isIOS)) this.skip()
    await authenticationPage.restartToLoginScreen()
    await authenticationPage.navigateToPasscodeScreen(phone)
  })

  it('AUTH-1.1 Incorrect passcode — error message is shown', async function () {
    const wrongPin = pin === '1111' ? '2222' : '1111'
    await authenticationPage.enterPin(wrongPin)
    await authenticationPage.waitForPasscodeError()
  })
})
