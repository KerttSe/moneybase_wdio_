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

  it('PAY-028 [TC3299] Amount 9.99 is blocked and displays the formatted 10.00 minimum', async function () {
    await page.enterAmount('9.99')
    await page.verifyContinueEnabled(false)
    await page.verifyMinimumTopUpError()
  })
})
