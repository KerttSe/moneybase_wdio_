import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import homeScreenPage from '../pages/HomeScreenPage'
import WatchlistPage from '../pages/WatchlistPage'
import { AUTH } from '../data/credentials'

describe('Watchlist (iOS/Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const home = homeScreenPage
  const watchlist = new WatchlistPage()

  const smokeStep = stopAfterFailedStep()

  before(smokeStep(async function () {
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
    await home.waitForHomeLoaded()
  }))

  if (browser.isAndroid) {
    it('WL-1.1 Add first existing instrument to watchlist (Android)', smokeStep(async function () {
      await watchlist.addFirstExistingInstrumentToWatchlistAndroid()
    }))
  }

  if (browser.isIOS) {
    it('WL-1.1 Add first existing instrument to watchlist (iOS)', smokeStep(async function () {
      await watchlist.addFirstExistingInstrumentToWatchlistIOS()
    }))
  }
})
