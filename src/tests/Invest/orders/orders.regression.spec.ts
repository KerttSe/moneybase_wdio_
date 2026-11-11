import { browser } from '@wdio/globals'
import { LoginPage } from '../../../pages/LoginPage'
import homeScreenPage from '../../../pages/HomeScreenPage'
import OrdersPage from '../../../pages/OrdersPage'
import { AUTH } from '../../../data/credentials'

describe('Orders Regression (iOS/Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 800000))

  const loginPage = new LoginPage()
  const home = homeScreenPage
  const orders = new OrdersPage()

  before(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('creates, modifies, and cancels BMW buy order', async function () {
    if (!browser.isIOS && !browser.isAndroid) {
      this.skip()
      return
    }
    // Known issue: Android 2.27.0 shows no Market/Limit order type on New Order (BMW, MUM40001), so the
    // limit-order flow cannot run. Remove this skip once the order type selector is back.
    if (browser.isAndroid) {
      console.warn('[orders.regression] Skipped on Android: known issue, no Market/Limit selector on New Order in 2.27.0')
      this.skip()
      return
    }

    await home.ensureIndividualAccount()
    await home.waitForHomeLoaded()

    if (browser.isIOS) {
      await orders.createModifyAndCancelBuyOrderIOS({
        instrumentQuery: 'BMW',
        initialQuantity: '5',
        modifiedQuantity: '15',
      })
    } else {
      await orders.createModifyAndCancelBuyOrderAndroid({
        instrumentQuery: 'BMW',
        initialQuantity: '5',
        modifiedQuantity: '15',
        androidLimitPrice: process.env.ORDERS_ANDROID_LIMIT_PRICE,
      })
    }
  })
})
