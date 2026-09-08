import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import homeScreenPage from '../pages/HomeScreenPage'
import OrdersPage from '../pages/OrdersPage'
import { AUTH } from '../data/credentials'

describe('Orders (iOS/Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 800000))

  const loginPage = new LoginPage()
  const home = homeScreenPage
  const orders = new OrdersPage()
  const params = { instrumentQuery: 'BMW', initialQuantity: '5', modifiedQuantity: '15' }

  stopAfterFailedStep()

  before(async function () {
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
  })

  it('PO-1.1 Wait for Home', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await home.waitForHomeLoaded()
  })

  if (browser.isIOS) {
    it('PO-1.2 Find BMW and place buy order (iOS)', async function () {
      await orders.createSmokeBuyOrderIOS(params)
    })
  }

  if (browser.isAndroid) {
    it('PO-1.3 Find BMW and open New Buy Order (Android)', async function () {
      await orders.openSmokeBuyOrderAndroid(params)
    })

    it('PO-1.4 Place BMW buy order (Android)', async function () {
      await orders.placeSmokeBuyOrderAndroid(params)
    })

    it('PO-1.5 Verify Sell available after buying (Android)', async function () {
      await orders.verifySmokeBuyOrderAndroid(params)
    })
  }
})
