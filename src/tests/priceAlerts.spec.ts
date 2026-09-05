import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import homeScreenPage from '../pages/HomeScreenPage'
import PriceAlertsPage from '../pages/PriceAlertsPage'
import { AUTH } from '../data/credentials'

describe('Price Alerts (iOS/Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const home = homeScreenPage
  const priceAlerts = new PriceAlertsPage()

  stopAfterFailedStep()

  before(async function () {
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
    await home.waitForHomeLoaded()
  })

  if (browser.isAndroid) {
    it('PA-1.1 Create price alert for BMW (Android)', async function () {
      await priceAlerts.createPriceAlertAndroid({ instrumentQuery: 'BMW' })
    })

    it('PA-1.2 Delete price alert for BMW (Android)', async function () {
      await priceAlerts.deletePriceAlertAndroid('BMW')
    })
  }

  if (browser.isIOS) {
    it('PA-1.1 Create price alert for BMW (iOS)', async function () {
      await priceAlerts.createPriceAlertIOS({ instrumentQuery: 'BMW' })
    })
  }
})
