import OnboardingPage from '../../../pages/OnboardingPage'

describe('KYC-009 [TC3092] Onboarding email terms gate', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  it('[TC3092] Continue requires consent and is disabled again when consent is removed', async function () {
    const page = new OnboardingPage()
    await page.prepareEmailTermsValidation()
    await page.verifyEmailContinueEnabled(false)
    await page.toggleEmailTermsForValidation()
    await page.verifyEmailContinueEnabled(true)
    await page.toggleEmailTermsForValidation()
    await page.verifyEmailContinueEnabled(false)
  })
})
