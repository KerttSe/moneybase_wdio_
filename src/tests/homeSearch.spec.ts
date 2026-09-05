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

  stopAfterFailedStep()

  before(async function () {
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureIndividualAccount()
    await HomeScreenPage.waitForHomeLoaded()
  })

  it('SEARCH-1.1 Search "cat" and verify Carlos Cat', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await homeSearchPage.verifyHomeSearch('cat')
  })
})
