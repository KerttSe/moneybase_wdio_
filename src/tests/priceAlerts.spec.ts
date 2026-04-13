import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import homeScreenPage from '../pages/HomeScreenPage'
import PriceAlertsPage from '../pages/PriceAlertsPage'
import { AUTH } from '../data/credentials'

describe('Price Alerts (iOS/Android)', function () {
  this.timeout(240000)

  const loginPage = new LoginPage()
  const home = homeScreenPage
  const priceAlerts = new PriceAlertsPage()

  before(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('create and delete price alert (BMW)', async function () {
    if (!browser.isAndroid && !browser.isIOS) {
      this.skip()
      return
    }

    await home.ensureIndividualAccount()
    await home.waitForHomeLoaded()

    if (browser.isAndroid) {
      await priceAlerts.createPriceAlertAndroid({
        instrumentQuery: 'BMW',
        // If UI requires threshold/date, set them here (best-effort filling).
        // thresholdValue: '100',
        // dateValue: '01/12/2030',
      })

      await priceAlerts.deletePriceAlertAndroid('BMW')
      return
    }

    // iOS: flow provided by locators: Search Instrument -> BMW -> +1% -> Back; then BMW -> Delete.
    await priceAlerts.createPriceAlertIOS({ instrumentQuery: 'BMW', rowA11yIdIOS: 'BMW i' })
    await priceAlerts.deletePriceAlertIOS('BMW i')
  })
})
