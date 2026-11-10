import { browser } from '@wdio/globals'
import { loginPage } from '../pages/LoginPage'
import AddFundsPage from '../pages/AddFunds'
import { AUTH } from '../data/credentials'

describe('Card top-up - Amount validation', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))
  const page = new AddFundsPage()

  before(async function () {
    await loginPage.loginFlow(AUTH)
    await page.openFromHome()
    await page.goToTopUp()
  })

  it('Zero top-up amount cannot continue to payment', async function () {
    await page.enterAmount('0')
    await page.verifyContinueEnabled(false)
  })

  // App 2.27.0 on Android raises a non-zero amount below the minimum to EUR 10 instead of blocking Continue.
  it('PAY-028 [TC3299] Amount 9.99 is blocked and displays the formatted 10.00 minimum', async function () {
    await page.enterAmount('9.99')
    if (browser.isAndroid) {
      await page.verifyAmountRaisedToMinimum()
      return
    }
    await page.verifyContinueEnabled(false)
    await page.verifyMinimumTopUpError()
  })
})
