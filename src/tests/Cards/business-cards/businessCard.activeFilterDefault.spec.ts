import { loginPage } from '../../../pages/LoginPage'
import page from '../../../pages/BusinessCardTerminatePage'
import { BH_AUTH } from '../../../data/credentials'

describe('CARD-005 [TC3392] Default Manage Cards filter', function () {
  it('[TC3392/TC3393] Opens with Active selected and requires all search words to match', async function () {
    const phone = BH_AUTH.phone

    await loginPage.loginFlow({
      country: BH_AUTH.country,
      phone,
      pin: BH_AUTH.pin,
    })
    await page.ensureSeDeKEAccount()
    await page.openAdministration()
    await page.openManageCards()
    await page.verifyActiveFilterSelected()
    await page.verifyManageCardsSearchRequiresEveryWord()
  })
})
