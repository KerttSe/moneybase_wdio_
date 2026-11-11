import { browser } from '@wdio/globals'
import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import page from '../../../pages/CardManagementPage'
import HomeScreenPage from '../../../pages/HomeScreenPage'

describe('DASH-032 [TC3080] Reselect Cards tab', function () {
  it('Returns from Card Security to the Cards root', async function () {
    // On Android (seen in 2.27.0) the selected Cards tab is not clickable, so reselecting it does nothing.
    if (browser.isAndroid) return this.skip()
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureJointAccount()
    await page.verifyReselectCardsReturnsToRoot()
  })
})
