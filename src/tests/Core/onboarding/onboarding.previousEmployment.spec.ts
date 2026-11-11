import { browser } from '@wdio/globals'
import OnboardingPage from '../../../pages/OnboardingPage'

describe('KYC-014 [TC3097] Previous employment', function () {
  it('Pensioner and Homemaker keep the occupation field available and hide company', async function () {
    const page = new OnboardingPage()
    await page.prepareEmploymentValidation({
      addressLine1: '12 Republic Street', city: 'Valletta', postCode: 'VLT 1117', country: 'Malta',
    })

    // Android 2.27.0 no longer lists Homemaker as an employment status.
    const statuses = browser.isAndroid ? (['Pensioner'] as const) : (['Pensioner', 'Homemaker'] as const)
    for (const status of statuses) {
      await page.verifyPreviousEmploymentFields(status)
    }
  })
})
