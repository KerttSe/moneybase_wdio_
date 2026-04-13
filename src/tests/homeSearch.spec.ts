import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'
import HomeSearchPage from '../pages/HomeSearchPage'

describe('Home Search - Individual', function () {
  this.timeout(120000)
  const loginPage = new LoginPage()
  const homeSearchPage = new HomeSearchPage()

  beforeEach(async function () {
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureIndividualAccount()
  })

  it('Home search returns Carlos Cat for query "cat"', async function () {
    if (!(browser.isAndroid || browser.isIOS)) this.skip()

    await HomeScreenPage.waitForHomeLoaded()
    await homeSearchPage.verifyHomeSearch('cat')
  })
})
