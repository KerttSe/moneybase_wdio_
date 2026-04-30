import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import homeScreenPage from '../pages/HomeScreenPage'
import PortfolioPage from '../pages/PortfolioPage'
import { AUTH } from '../data/credentials'

describe('Portfolio (iOS/Android)', function () {
  this.timeout(240000)

  const loginPage = new LoginPage()
  const home = homeScreenPage
  const portfolio = new PortfolioPage()

  before(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('opens portfolio page (from Invest)', async function () {
    if (!browser.isIOS && !browser.isAndroid) {
      this.skip()
      return
    }

    await home.ensureIndividualAccount()
    await home.waitForHomeLoaded()

    if (browser.isIOS) {
      await portfolio.openPortfolioFromInvestIOS()
    } else {
      await portfolio.openPortfolioFromInvestAndroid()
    }
  })

  it('opens 3.5% Simonds Farsons Cisk 2027 (via NEXT x2)', async function () {
    if (!browser.isIOS && !browser.isAndroid) {
      this.skip()
      return
    }

    if (browser.isIOS) {
      await portfolio.openSimondsFarsonsBondFromInvestIOS()
    } else {
      await portfolio.openSimondsFarsonsBondFromInvestAndroid()
    }
  })
})
