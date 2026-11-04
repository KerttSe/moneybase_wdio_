import OnboardingPage from '../pages/OnboardingPage'

describe('KYC-005 [TC3088] Onboarding address with optional second line', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  it('[TC3088] Submitting a valid address without Address Line 2 advances onboarding', async function () {
    await new OnboardingPage().verifyAddressLineTwoOptional({
      addressLine1: '12 Republic Street', city: 'Valletta', postCode: 'VLT 1117', country: 'Malta',
    })
  })
})
