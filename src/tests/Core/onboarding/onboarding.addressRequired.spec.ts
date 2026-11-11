import OnboardingPage from '../../../pages/OnboardingPage'

describe('KYC-006 [TC3089] Required onboarding address fields', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  it('[TC3089] Blank required address is rejected and a complete address advances', async function () {
    await new OnboardingPage().verifyBlankAddressRejected({
      addressLine1: '12 Republic Street', city: 'Valletta', postCode: 'VLT 1117', country: 'Malta',
    })
  })
})
