import OnboardingPage from '../../../pages/OnboardingPage'

describe('KYC-020 [TC3103] Onboarding keyboard layout', function () {
  it('Moves Next above the keyboard', async function () {
    const page = new OnboardingPage()
    await page.openApplicantNameForm()
    await page.verifyNameFormKeyboardLayout(false)
  })
})
