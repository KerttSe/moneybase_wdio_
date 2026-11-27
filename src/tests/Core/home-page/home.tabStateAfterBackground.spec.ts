import { browser } from '@wdio/globals'
import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import lifecycle from '../../../pages/AppLifecyclePage'

describe('DASH-035 [TC3083] Dashboard tab state', function () {
  before(async function () {
    if (!browser.isIOS) return this.skip()
    await loginPage.loginFlow(AUTH)
    await home.waitForHomeLoaded()
  })

  it('[TC3083] Keeps Cards selected with its content after a short background', async function () {
    await lifecycle.verifyCardsTabSurvivesBackground()
  })
})
