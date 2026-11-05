import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import homeScreenPage from '../pages/HomeScreenPage'
import { AUTH_SECURITY } from '../data/credentials'

describe('Authentication - Security account login (AUTH-SEC-1)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const home = homeScreenPage

  stopAfterFailedStep()

  before(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await loginPage.loginFlow(AUTH_SECURITY)
  })

  it('AUTH-SEC-1.1 Dedicated security account reaches Home', async function () {
    await home.waitForHomeLoaded()
  })
})
