import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'

describe('Home Screen - Individual', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()

  stopAfterFailedStep()

  before(async function () {
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureIndividualAccount()
    await HomeScreenPage.waitForHomeLoaded()
  })

  it('HS-1.1 Verify account header', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyAccountHeader()
  })

  it('HS-1.2 Verify balance', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyBalance()
  })

  it('HS-1.3 Verify action buttons', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyActionButtons()
  })

  it('HS-1.4 Tap action buttons', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.tapActionButtons()
  })

  it('HS-1.5 Verify notification banner', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyNotificationBannerIfApplicable()
  })

  it('HS-1.6 Verify promo banners', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyPromoBanners()
  })

  it('HS-1.7 Verify pending transactions', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyPendingTransactions()
  })

  it('HS-1.8 Verify recent transactions', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyRecentTransactions()
  })

  it('HS-1.9 Verify recent activities', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyRecentActivities()
  })

  it('HS-1.10 Verify spend analytics', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifySpendAnalytics()
  })

  it('HS-1.11 Verify bottom navigation', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyBottomNavigation()
  })
})
