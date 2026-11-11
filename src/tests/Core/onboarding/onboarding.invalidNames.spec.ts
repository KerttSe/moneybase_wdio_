import OnboardingPage from '../../../pages/OnboardingPage'

describe('KYC-002 [TC3085] Onboarding invalid names', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const page = new OnboardingPage()

  before(async function () {
    await page.prepareValidationPersonalDetails()
  })

  beforeEach(async function () {
    await page.setValidationPersonalNames('John', 'Borg')
    await page.verifyValidationPersonalDetailsReady()
  })

  it('KYC-002 [TC3085] Digit in first name cannot advance', async function () {
    await page.setValidationPersonalNames('John3', 'Borg')
    await page.verifyValidationPersonalDetailsRejected()
  })

  it('KYC-002 [TC3085] Symbol in surname cannot advance', async function () {
    await page.setValidationPersonalNames('John', 'Smith@Home')
    await page.verifyValidationPersonalDetailsRejected()
  })

  it('KYC-002 [TC3085] Both invalid names cannot advance', async function () {
    await page.setValidationPersonalNames('John3', 'Smith@Home')
    await page.verifyValidationPersonalDetailsRejected()
  })
})
