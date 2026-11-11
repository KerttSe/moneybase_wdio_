import { AUTH_SECURITY } from '../../../data/credentials'
import { authenticationPage as page } from '../../../pages/AuthenticationPage'
import { loginPage } from '../../../pages/LoginPage'

describe('Change passcode guards', function () {
  it('[TC3157/TC3161] Cancels from the current gate and rejects a prohibited new code', async function () {
    await loginPage.loginFlow(AUTH_SECURITY)
    await page.navigateToChangePasscodeViaSettings()
    await page.cancelChangePasscode()
    await page.verifyTooEasyNewPasscodeRejected(AUTH_SECURITY.pin)
  })
})
