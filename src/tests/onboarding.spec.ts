import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import OnboardingPage from '../pages/OnboardingPage'

describe('Onboarding - account creation', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const onboardingPage = new OnboardingPage()

  const smokeStep = stopAfterFailedStep()

  if (browser.isAndroid) {
    it('OB-1.1 Create new individual account (Android)', smokeStep(async function () {
      await onboardingPage.createAccountAndroid()
    }))
  }

  if (browser.isIOS) {
    it('OB-1.1 Create new individual account (iOS)', smokeStep(async function () {
      await onboardingPage.createAccountIOS()
    }))
  }
})
