import OnboardingPage from '../../../pages/OnboardingPage'

describe('KYC-013 [TC3096] Onboarding employment field visibility', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  it('[TC3096] Student and Unemployed hide both fields; Employed restores them', async function () {
    const page = new OnboardingPage()
    await page.prepareEmploymentValidation({
      addressLine1: '12 Republic Street', city: 'Valletta', postCode: 'VLT 1117', country: 'Malta',
    })
    await page.verifyEmploymentFieldVisibility('Employed', true)
    await page.verifyEmploymentFieldVisibility('Student', false)
    await page.verifyEmploymentFieldVisibility('Employed', true)
    await page.verifyEmploymentFieldVisibility('Unemployed', false)
    await page.verifyEmploymentFieldVisibility('Employed', true)
  })
})
