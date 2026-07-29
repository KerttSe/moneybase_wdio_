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
