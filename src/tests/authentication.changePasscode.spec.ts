import { browser } from '@wdio/globals'
import { authenticationPage } from '../pages/AuthenticationPage'
import { loginPage } from '../pages/LoginPage'
import HomeScreenPage from '../pages/HomeScreenPage'
import { AUTH_POOL, AUTH_SECURITY } from '../data/credentials'

describe('Authentication - Security', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))

  const [primaryAccount, secondaryAccount] = AUTH_POOL
  const phone = process.env.AUTH_SECURITY_MB_PHONE
  const pin = process.env.AUTH_SECURITY_MB_PIN || '2468'
  const tempPin = pin === '1111' ? '2222' : '1111'
  if (!phone) throw new Error('AUTH_SECURITY_MB_PHONE is not set')
  if (phone === primaryAccount.phone || phone === '99011190') {
    throw new Error('Authentication security specs must use a secondary/security account, not primary')
  }
  if (phone === secondaryAccount.phone) {
    throw new Error('Authentication security specs must not use the secondary smoke account')
  }

  beforeEach(async function () {
    if (!(browser.isAndroid || browser.isIOS)) this.skip()
    await loginPage.loginFlow(AUTH_SECURITY)
    await HomeScreenPage.waitForHomeLoaded()
  })

  afterEach(async function () {
    // Restore the account's configured passcode so other Authentication - Security
    // specs keep logging in with AUTH_SECURITY_MB_PIN. If this fails, the account is
    // left on tempPin and must be fixed manually before the next run.
    try {
      await authenticationPage.navigateToChangePasscodeViaSettings()
      await authenticationPage.enterCurrentAndNewPasscode(tempPin, pin)
      await authenticationPage.waitForPasscodeChangedSuccess()
    } catch {
      console.warn(`[WDIO] Could not confirm AUTH_SECURITY passcode was restored to ${pin}; verify manually before the next run.`)
    }
  })

  it('AUTH-1.4 Changing passcode via Settings succeeds with the new passcode (TC3156)', async function () {
    await authenticationPage.navigateToChangePasscodeViaSettings()
    await authenticationPage.enterCurrentAndNewPasscode(pin, tempPin)
    await authenticationPage.waitForPasscodeChangedSuccess()
  })
})
