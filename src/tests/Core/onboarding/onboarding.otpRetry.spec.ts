import OnboardingPage from '../../../pages/OnboardingPage'

describe('KYC-023 [TC3106] Applicant OTP retry', function () {
  it('Shows an inline error and clears it after editing the code', async function () {
    const page = new OnboardingPage()
    await page.openApplicantOtpValidation()
    await page.verifyApplicantOtpAllowsRetry()
  })
})
