import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import homeScreenPage from '../pages/HomeScreenPage'
import CashFundsPage from '../pages/CashFundsPage'
import { AUTH } from '../data/credentials'

describe('Cash Funds (Mobile)', function () {
  this.timeout(240000)

  const loginPage = new LoginPage()
  const home = homeScreenPage
  const cashFundsPage = new CashFundsPage()

  before(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('opens Cash Funds from Invest -> Discover', async function () {
    await home.ensureIndividualAccount()
    await home.waitForHomeLoaded()

    await cashFundsPage.openCashFunds()
  })
})
