import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import AddFundsPage from '../pages/AddFunds'
import { AUTH } from '../data/credentials'

describe('Add Funds', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const addFundsPage = new AddFundsPage()

  stopAfterFailedStep()

  before(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('AF-1.1 Open Add Funds from Home', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await addFundsPage.openFromHome()
  })

  it('AF-1.2 Go to card top up', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await addFundsPage.goToTopUp()
  })

  it('AF-1.3 Enter amount 11', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await addFundsPage.enterAmount(11)
  })

  it('AF-1.4 Continue to 3DS', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await addFundsPage.continueTo3DS()
  })
})
