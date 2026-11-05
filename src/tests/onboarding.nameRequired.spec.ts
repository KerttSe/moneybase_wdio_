import OnboardingPage from '../pages/OnboardingPage'

describe('KYC-011 [TC3094] Required applicant names', function () {
  it('Next requires both valid names', async function () {
    const page = new OnboardingPage()
    await page.prepareValidationPersonalDetails()

    for (const [first, last] of [['', ''], ['John', ''], ['', 'Borg']]) {
      await page.setValidationPersonalNames(first, last)
      await page.verifyValidationPersonalDetailsNext(false)
    }

    await page.setValidationPersonalNames('John', 'Borg')
    await page.verifyValidationPersonalDetailsReady()
  })
})
