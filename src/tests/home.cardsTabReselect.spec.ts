import { AUTH } from '../data/credentials'
import { loginPage } from '../pages/LoginPage'
import page from '../pages/CardManagementPage'
import HomeScreenPage from '../pages/HomeScreenPage'

describe('DASH-032 [TC3080] Reselect Cards tab', function () {
  it('Returns from Card Security to the Cards root', async function () {
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureJointAccount()
    await page.verifyReselectCardsReturnsToRoot()
  })
})
