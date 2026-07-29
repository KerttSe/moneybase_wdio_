import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'
import CardManagementPage from '../pages/CardManagementPage'

describe('Card Management - Joint account', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const loginPage = new LoginPage()

  before(async function () {
    if (!(browser.isAndroid || browser.isIOS)) this.skip()

    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureJointAccount()
  })

  afterEach(async function () {
    await CardManagementPage.closeSecurityIfOpen()
  })

  it('CARD-1.1 Verify card management actions are displayed for an existing card', async function () {
    await CardManagementPage.verifyExistingCardDisplayed()
    await CardManagementPage.verifyCardManagementActionsDisplayed()
    await CardManagementPage.verifyMoreMenuOptionsDisplayed()
  })

  it('CARD-1.2 View Card PIN', async function () {
    const passcode =
      process.env.CARD_MANAGEMENT_PASSCODE ||
      process.env.CARD_MANAGEMENT_PIN ||
      AUTH.pin
    const passcodeSource = process.env.CARD_MANAGEMENT_PASSCODE
      ? 'CARD_MANAGEMENT_PASSCODE'
      : process.env.CARD_MANAGEMENT_PIN
        ? 'CARD_MANAGEMENT_PIN'
        : 'AUTH.pin'
    const apiConfigured = Boolean(String(process.env.OTP_GET_LATEST_URL || process.env.OTP_API_BASE_URL || '').trim())
    console.log(
      `[CardManagement] View PIN passcode source: ${browser.isAndroid && apiConfigured ? 'API' : passcodeSource}; env token has ${passcode.replace(/\D/g, '').length} digits`
    )
    await CardManagementPage.verifyCardPinDisplayed(passcode)
  })

  it('CARD-1.3 Open Card Security settings', async function () {
    await CardManagementPage.verifySecurityControlsDisplayed()
  })

  it('CARD-1.4 View Card Transactions', async function () {
    await CardManagementPage.verifyFirstCardTransactionDetails()
  })

  it('CARD-1.5 Re-enable card feature', async function () {
    await CardManagementPage.reEnableSecurityControl('Swipe payments')
  })

  it('CARD-1.6 Verify physical card is primary', async function () {
    await CardManagementPage.verifyPhysicalCardIsPrimary()
  })
})
