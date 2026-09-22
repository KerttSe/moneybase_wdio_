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

  it('HS-1.2 Verify balance', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyBalance()
  }))

  it('HS-1.3 Verify action buttons', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyActionButtons()
  }))

  it('HS-1.4 Tap action buttons', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.tapActionButtons()
  }))

  it('HS-1.5 Verify notification banner', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyNotificationBannerIfApplicable()
  }))

  it('HS-1.6 Verify promo banners', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyPromoBanners()
  }))

  it('HS-1.7 Verify pending transactions', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyPendingTransactions()
  }))

  it('HS-1.8 Verify recent transactions', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
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

  it('HS-1.11 Verify bottom navigation', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyBottomNavigation()
  }))
})
