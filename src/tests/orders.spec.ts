import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import homeScreenPage from '../pages/HomeScreenPage'
import OrdersPage from '../pages/OrdersPage'
import { AUTH } from '../data/credentials'

describe('Orders (iOS/Android)', function () {
  this.timeout(300000)

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

    await home.ensureIndividualAccount()
    await home.waitForHomeLoaded()

    if (browser.isIOS) {
      await orders.createModifyAndCancelBuyOrderIOS({
        instrumentQuery: 'BMW',
        initialQuantity: '5',
        modifiedQuantity: '6',
      })
    } else {
      await orders.createModifyAndCancelBuyOrderAndroid({
        instrumentQuery: 'BMW',
        initialQuantity: '5',
        modifiedQuantity: '15',
      })
    }
  })
})
