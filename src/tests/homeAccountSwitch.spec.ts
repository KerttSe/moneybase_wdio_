import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'

describe('Home Account Switch', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()

  const smokeStep = stopAfterFailedStep()

  before(smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    if (process.env.MB_AUTH_SLOT !== 'secondary') return this.skip()
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.waitForHomeLoaded()
  }))

  it('HAS-1.1 Switch between available account types', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await HomeScreenPage.verifyAccountSwitchingAcrossTypes()
  }))
})
