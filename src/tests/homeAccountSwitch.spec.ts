import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'

describe('Home Account Switch', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()

  beforeEach(async function () {
    if (!(browser.isAndroid || browser.isIOS)) this.skip()

    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.waitForHomeLoaded()
  })

  it('switches between available account types', async function () {
    if (!(browser.isAndroid || browser.isIOS)) this.skip()

    await HomeScreenPage.verifyAccountSwitchingAcrossTypes()
  })
})
