import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import homeScreenPage from '../pages/HomeScreenPage'
import PortfolioPage from '../pages/PortfolioPage'
import { AUTH } from '../data/credentials'

describe('Portfolio (iOS/Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const home = homeScreenPage
  const portfolio = new PortfolioPage()

  stopAfterFailedStep()

  before(async function () {
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
    await home.waitForHomeLoaded()
  })

  if (browser.isAndroid) {
    it('PT-1.1 Open portfolio page from Invest (Android)', async function () {
      await portfolio.openPortfolioFromInvestAndroid()
    })

    it('PT-1.2 Open 3.5% Simonds Farsons Cisk 2027 (Android)', async function () {
      await portfolio.openSimondsFarsonsBondFromInvestAndroid()
    })
  }

  if (browser.isIOS) {
    it('PT-1.1 Open portfolio page from Invest (iOS)', async function () {
      await portfolio.openPortfolioFromInvestIOS()
    })

    it('PT-1.2 Open 3.5% Simonds Farsons Cisk 2027 (iOS)', async function () {
      await portfolio.openSimondsFarsonsBondFromInvestIOS()
    })
  }
})
