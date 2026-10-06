import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import OnboardingPage from '../pages/OnboardingPage'

describe('Onboarding - account creation', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const onboardingPage = new OnboardingPage()

  const smokeStep = stopAfterFailedStep()

  let context: Awaited<ReturnType<typeof onboardingPage.prepareSmokeOnboarding>>

  const platform = browser.isAndroid ? 'Android' : browser.isIOS ? 'iOS' : undefined

  if (platform) {
    it(`OB-1.1 Enter phone number and continue (${platform})`, smokeStep(async function () {
      context = await onboardingPage.prepareSmokeOnboarding()
    }))

    it(`OB-1.2 Enter PIN and complete OTP verification (${platform})`, smokeStep(async function () {
      await onboardingPage.verifySmokeOnboardingMobile(context)
    }))

    it(`OB-1.3 Fill personal details — name and surname (${platform})`, smokeStep(async function () {
      await onboardingPage.fillSmokeOnboardingPersonalDetails(context)
    }))

    it(`OB-1.4 Fill address and employment details (${platform})`, smokeStep(async function () {
      await onboardingPage.fillSmokeOnboardingAddress(context)
    }))

    it(`OB-1.5 Enter email, accept terms, complete verification and reach Home (${platform})`, smokeStep(async function () {
      await onboardingPage.finishSmokeOnboarding(context)
    }))
  }
})
