import { browser } from '@wdio/globals'
import OnboardingPage from '../pages/OnboardingPage'

describe('Onboarding - account creation', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const onboardingPage = new OnboardingPage()

  it('creates a new individual account through mobile verification', async function () {
    if (browser.isIOS) {
      await onboardingPage.createAccountIOS()
      return
    }

    if (browser.isAndroid) {
      await onboardingPage.createAccountAndroid()
      return
    }

    this.skip()
  })
})
