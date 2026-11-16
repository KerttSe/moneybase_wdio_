import { lockoutAuth } from '../../../data/lockoutAuth'
import { authenticationPage as page } from '../../../pages/AuthenticationPage'

describe('AUTH-017 [TC3147] Partial passcode', function () {
  it('Keeps the login keypad active after three digits', async function () {
    const account = lockoutAuth('partialPasscode', { consume: false })
    await page.restartToLoginScreen()
    await page.navigateToPasscodeScreen(account.phone)
    await page.verifyPartialPasscodeKeepsKeypadInteractive(account.pin)
  })
})
