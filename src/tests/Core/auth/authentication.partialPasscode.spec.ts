import { AUTH_SECURITY } from '../../../data/credentials'
import { authenticationPage as page } from '../../../pages/AuthenticationPage'

describe('AUTH-017 [TC3147] Partial passcode', function () {
  it('Keeps the login keypad active after three digits', async function () {
    await page.restartToLoginScreen()
    await page.navigateToPasscodeScreen(AUTH_SECURITY.phone)
    await page.verifyPartialPasscodeKeepsKeypadInteractive(AUTH_SECURITY.pin)
  })
})
