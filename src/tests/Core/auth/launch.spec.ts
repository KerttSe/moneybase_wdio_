import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { browser, expect } from '@wdio/globals'
import { LoginPage } from '../../../pages/LoginPage'
import HomeScreenPage from '../../../pages/HomeScreenPage'
import { AUTH } from '../../../data/credentials'

describe('Matrix - Smoke', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()

  const smokeStep = stopAfterFailedStep()

  it('LAUNCH-1.1 [TC3132/TC3140] Successful OTP verification opens Home', smokeStep(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    const otpVerified = await loginPage.loginFlow(AUTH)
    expect(otpVerified).toBe(true)
    await HomeScreenPage.waitForHomeLoaded()
  }))
})
