import { AUTH } from '../data/credentials'
import { loginPage } from '../pages/LoginPage'
import page from '../pages/HomeScreenPage'

describe('Account picker search', function () {
  it('[TC2944/TC2945/TC2946/TC2948] Searches identities and reselects the active account', async function () {
    await loginPage.loginFlow(AUTH)
    await page.ensureIndividualAccount()
    await page.verifyAccountPickerSearch()
    await page.verifyReselectCurrentAccount()
  })
})
