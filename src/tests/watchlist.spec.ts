import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import homeScreenPage from '../pages/HomeScreenPage'
import WatchlistPage from '../pages/WatchlistPage'
import { AUTH } from '../data/credentials'

describe('Watchlist (iOS/Android)', function () {
  this.timeout(240000)

  const loginPage = new LoginPage()
  const home = homeScreenPage
  const watchlist = new WatchlistPage()

  before(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('adds instrument to watchlist (from existing list)', async function () {
    if (!browser.isAndroid && !browser.isIOS) {
      this.skip()
      return
    }

    await home.ensureIndividualAccount()
    await home.waitForHomeLoaded()

    if (browser.isAndroid) {
      await watchlist.addFirstExistingInstrumentToWatchlistAndroid()
      return
    }

    await watchlist.addFirstExistingInstrumentToWatchlistIOS()
  })
})
