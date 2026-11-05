import { loginPage } from '../pages/LoginPage'
import page from '../pages/BusinessCardTerminatePage'

describe('CARD-005 [TC3392] Default Manage Cards filter', function () {
  it('[TC3392/TC3393] Opens with Active selected and requires all search words to match', async function () {
    const phone = process.env.BH_MB_PHONE
    if (!phone) throw new Error('BH_MB_PHONE is required for the business card fixture')

    await loginPage.loginFlow({
      country: process.env.BH_MB_COUNTRY || 'Malta',
      phone,
      pin: process.env.BH_MB_PIN || '2468',
    })
    await page.ensureSeDeKEAccount()
    await page.openAdministration()
    await page.openManageCards()
    await page.verifyActiveFilterSelected()
    await page.verifyManageCardsSearchRequiresEveryWord()
  })
})
