import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import page from '../../../pages/CardManagementPage'

describe('CARD-041 [TC3237] Card PIN timeout', function () {
  it('Closes the PIN screen without tapping Done', async function () {
    await loginPage.loginFlow(AUTH)
    await page.ensureIndividualAccount()
    const lastFour = process.env.CARD_MANAGEMENT_VIEW_PIN_LAST_FOUR || '' // empty: any card that can show its PIN
    await page.verifyCardPinClosesAutomatically(lastFour, AUTH.pin)
  })
})
