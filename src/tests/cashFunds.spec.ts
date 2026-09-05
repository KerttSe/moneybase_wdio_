import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import homeScreenPage from '../pages/HomeScreenPage'
import CashFundsPage from '../pages/CashFundsPage'
import { AUTH } from '../data/credentials'

describe('Cash Funds (Mobile)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const home = homeScreenPage
  const cashFundsPage = new CashFundsPage()

  stopAfterFailedStep()

  before(async function () {
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
    await home.waitForHomeLoaded()
  })

  it('CF-1.1 Open Cash Funds from Invest -> Discover', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await cashFundsPage.openCashFunds()
  })
})
