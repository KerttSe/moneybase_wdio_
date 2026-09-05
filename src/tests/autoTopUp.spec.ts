import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import AutoTopUpPage from '../pages/AutoTopUpPage'
import { AUTH } from '../data/credentials'

describe('Auto Top-Up', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()

  const autoTopUpPage = new AutoTopUpPage()

  stopAfterFailedStep()

  before(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it("ATU-1.1 Open Auto Top-Up and select card and wallet", async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await autoTopUpPage.selectSmokeAutoTopUpCard({
          cardLabel: '0015',
          currency: 'Euro',
          amount: 1500,
        })
  })

  it("ATU-1.2 Set preset 500 and custom amount 1500", async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await autoTopUpPage.configureSmokeAutoTopUpAmounts({
          cardLabel: '0015',
          currency: 'Euro',
          amount: 1500,
        })
  })

  it("ATU-1.3 Save Auto Top-Up and return to Add Funds or Home", async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await autoTopUpPage.saveSmokeAutoTopUp({
          cardLabel: '0015',
          currency: 'Euro',
          amount: 1500,
        })
  })

  it("ATU-1.4 Find the rule, delete it and verify absence", async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await autoTopUpPage.verifyAndDeleteAutoTopUpFromHomeFlow({
          amount: 1500,
        })
  })
})
