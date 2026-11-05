import OnboardingPage from '../pages/OnboardingPage'

describe('KYC-021 [TC3104] Onboarding keyboard layout', function () {
  it('Restores the initial Next position after keyboard dismissal', async function () {
    const page = new OnboardingPage()
    await page.openApplicantNameForm()
    await page.verifyNameFormKeyboardLayout(true)
  })
})
