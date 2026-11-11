import { PD_AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import page from '../../../pages/PersonalDetailsPage'

describe('Personal Details edit confirmations', function () {
  it('[TC2977/TC2976] Cancels mobile editing and confirms the name edit gate', async function () {
    await loginPage.loginFlow(PD_AUTH)
    await page.navigateToPersonalDetails()
    await page.verifyMobileEditCanBeCancelled()
    await page.verifyNameEditRequiresConfirmation()
  })
})
