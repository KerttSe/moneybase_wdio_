import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'
import HomeSearchPage from '../pages/HomeSearchPage'

describe('Home Search - Individual', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const homeSearchPage = new HomeSearchPage()

  const smokeStep = stopAfterFailedStep()

  before(smokeStep(async function () {
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureIndividualAccount()
    await HomeScreenPage.waitForHomeLoaded()
  }))

  it('[TC3050] Hides search on downward scroll and reveals it on return', async function () {
    await homeSearchPage.verifySearchVisibilityOnScroll()
  })

  it('SEARCH-1.1 Search for a recipient read from Recent Payees or Recent Activity on Home', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await homeSearchPage.verifyHomeSearch()
  }))

  it('[TC2949/TC2950/TC2951] Checks recents and the search query threshold', smokeStep(async function () {
    await homeSearchPage.verifySearchQueryRules()
  }))

})
