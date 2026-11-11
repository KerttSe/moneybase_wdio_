import OnboardingPage from '../../../pages/OnboardingPage'

describe('KYC-003 [TC3086] Onboarding short first name', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const page = new OnboardingPage()

  before(async function () {
    await page.prepareValidationPersonalDetails()
  })

  it('KYC-003 [TC3086] Two-character first name is blocked; correction restores Next', async function () {
    await page.setValidationPersonalNames('Jo', 'Borg')
    await page.verifyValidationPersonalDetailsRejected()
    await page.setValidationPersonalNames('John', 'Borg')
    await page.verifyValidationPersonalDetailsReady()
  })
})
