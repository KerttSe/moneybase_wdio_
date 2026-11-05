import OnboardingPage from '../pages/OnboardingPage'
import { authenticationPage } from '../pages/AuthenticationPage'

describe('KYC-024 [TC3107] Applicant OTP cooldown', function () {
  it('Allows resend after cooldown and starts another countdown', async function () {
    await new OnboardingPage().openApplicantOtpValidation()
    await authenticationPage.resendOtpAndVerifyCooldown()
  })
})
