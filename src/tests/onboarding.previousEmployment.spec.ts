import OnboardingPage from '../pages/OnboardingPage'

describe('KYC-014 [TC3097] Previous employment', function () {
  it('Pensioner and Homemaker keep the occupation field available and hide company', async function () {
    const page = new OnboardingPage()
    await page.prepareEmploymentValidation({
      addressLine1: '12 Republic Street', city: 'Valletta', postCode: 'VLT 1117', country: 'Malta',
    })

    for (const status of ['Pensioner', 'Homemaker'] as const) {
      await page.verifyPreviousEmploymentFields(status)
    }
  })
})
