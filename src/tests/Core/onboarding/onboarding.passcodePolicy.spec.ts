import OnboardingPage from '../../../pages/OnboardingPage'

describe('Onboarding passcode policy', function () {
  it('[TC3138/TC3139] Rejects prohibited codes and offers a choice for an easy code', async function () {
    const page = new OnboardingPage()
    await page.verifyTooEasyPasscodesRejected()
    await page.verifyEasyPasscodeWarning()
  })
})
