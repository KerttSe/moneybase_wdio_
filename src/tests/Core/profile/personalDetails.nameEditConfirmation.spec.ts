import { PD_AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import page from '../../../pages/PersonalDetailsPage'
import home from '../../../pages/HomeScreenPage'

describe('Personal Details edit confirmations', function () {
  it('[TC2977/TC2976] Cancels mobile editing and confirms the name edit gate', async function () {
    // The PD account asks to re-verify after its name was edited; close that screen and continue.
    loginPage.closeVerificationRequired = true
    await loginPage.loginFlow(PD_AUTH)
    // Settles Home and closes the "More menu has been moved" tip that covers the avatar.
    await home.ensureIndividualAccount()
    await page.navigateToPersonalDetails()
    await page.verifyMobileEditCanBeCancelled()
    await page.verifyNameEditRequiresConfirmation()
  })
})
