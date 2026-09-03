import { browser } from '@wdio/globals'
import { authenticationPage } from '../pages/AuthenticationPage'
import { AUTH_POOL } from '../data/credentials'

describe('Authentication - Security', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))

  const [primaryAccount, secondaryAccount] = AUTH_POOL
  const phone = process.env.AUTH_SECURITY_MB_PHONE
  const pin = process.env.AUTH_SECURITY_MB_PIN || '2468'
  if (!phone) throw new Error('AUTH_SECURITY_MB_PHONE is not set')
  if (phone === primaryAccount.phone || phone === '99011190') {
    throw new Error('Authentication security specs must use a secondary/security account, not primary')
  }
  if (phone === secondaryAccount.phone) {
    throw new Error('Authentication security specs must not use the secondary smoke account')
  }

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
