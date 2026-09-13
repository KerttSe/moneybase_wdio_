import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import CardManagementPage from '../pages/CardManagementPage'
import { AUTH } from '../data/credentials'

describe('Card Management - View PIN (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const loginPage = new LoginPage()
  const cardManagementPage = CardManagementPage

  beforeEach(async function () {
    if (!browser.isAndroid) return this.skip()
    await loginPage.loginFlow(AUTH)
    await cardManagementPage.ensureIndividualAccount()
  })

  it('User can view the PIN for a specific card', async function () {
    const lastFour = process.env.CARD_MANAGEMENT_VIEW_PIN_LAST_FOUR || '8750'
    await cardManagementPage.viewCardPinForCard(lastFour, AUTH.pin)
  })
})
