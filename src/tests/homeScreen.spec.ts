import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'

describe('Home Screen - Individual', function () {
  this.timeout(120000)
  const loginPage = new LoginPage()

  beforeEach(async function () {
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureIndividualAccount()
  })

  it('Home screen elements are visible', async function () {
    if (!(browser.isAndroid || browser.isIOS)) this.skip()

    await HomeScreenPage.waitForHomeLoaded()
    await HomeScreenPage.verifyAccountHeader()
    await HomeScreenPage.verifyBalance()
    await HomeScreenPage.verifyActionButtons()
    await HomeScreenPage.tapActionButtons()
    await HomeScreenPage.verifyNotificationBannerIfApplicable()
    await HomeScreenPage.verifyPromoBanners()
    await HomeScreenPage.verifyPendingTransactions()
    await HomeScreenPage.verifyRecentTransactions()
    await HomeScreenPage.verifyRecentPayees()
    await HomeScreenPage.verifySpendAnalytics()
    await HomeScreenPage.verifyBottomNavigation()
  })
})
