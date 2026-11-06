import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'

describe('Home Screen - Individual', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()

  const smokeStep = stopAfterFailedStep()

  before(smokeStep(async function () {
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureIndividualAccount()
    await HomeScreenPage.waitForHomeLoaded()
  }))

  it('HS-1.1 Verify account header', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyAccountHeader()
  }))

  it('HS-1.2 [TC3053 partial] Verify wallet balance format', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyWalletBalanceFormat()
  }))

  it('HS-1.3 Verify action buttons', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyActionButtons()
  }))

  it('HS-1.4 Tap action buttons', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.tapActionButtons()
  }))

  it('HS-1.4a [TC3054 partial] Details opens Wallet Details', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyWalletDetailsOpens()
  }))

  it('HS-1.5 Verify notification banner', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    if (!await HomeScreenPage.verifyNotificationBannerIfApplicable()) this.skip()
  }))

  it('HS-1.6 Verify promo banners', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyPromoBanners()
  }))

  it('HS-1.7 Verify pending transactions', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    if (!await HomeScreenPage.verifyPendingTransactions()) this.skip()
  }))

  it('HS-1.8 Verify recent transactions', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyRecentTransactions()
  }))

  it('HS-1.8a [TC3049 partial] Home shows profile, wallet balance, Total Wealth and recent transactions', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    if (process.env.MB_RUN_POPULATED_HOME !== 'true') return this.skip()

    await HomeScreenPage.verifyAccountHeader()
    await HomeScreenPage.verifyWalletBalanceFormat()
    await HomeScreenPage.verifyTotalWealthSectionVisible()
    await HomeScreenPage.verifyRecentTransactions()
  }))

  it('HS-1.9 Verify recent activities', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyRecentActivities()
  }))

  it('HS-1.10 Verify spend analytics', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifySpendAnalytics()
  }))

  it('HS-1.11 [TC3078 partial] Verify bottom navigation', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyBottomNavigation()
  }))
})
