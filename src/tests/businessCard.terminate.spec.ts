import { LoginPage } from '../pages/LoginPage'
import BusinessCardTerminatePage from '../pages/BusinessCardTerminatePage'

const BH_SELF = process.env.BH_SELF_NAME || 'Dmytro Kertys'

describe('Business Cards - Create and Terminate Own Virtual Card', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const country = process.env.BH_MB_COUNTRY || process.env.MB_COUNTRY || 'Malta'
  const phone = process.env.BH_MB_PHONE
  const pin = process.env.BH_MB_PIN || '2468'
  if (!phone) throw new Error('BH_MB_PHONE is not set')

  before(async function () {
    await loginPage.loginFlow({ country, phone, pin })
    await BusinessCardTerminatePage.ensureSeDeKEAccount()
  })

  it('BCT-2.1 Open More → Administration (TC1740/TC1741)', async function () {
    await BusinessCardTerminatePage.openAdministration()
  })

  it('BCT-2.2 Verify Manage Cards screen is displayed', async function () {
    await BusinessCardTerminatePage.openManageCards()
  })

  it('BCT-2.3 Tap Assign Card button', async function () {
    await BusinessCardTerminatePage.tapAssignCard()
  })

  it('BCT-2.4 Select Virtual Card type', async function () {
    await BusinessCardTerminatePage.selectVirtualCardType()
  })

  it(`BCT-2.5 Select self (${BH_SELF}) as assignee`, async function () {
    await BusinessCardTerminatePage.selectSelfAssignee()
  })

  it('BCT-2.6 Tap Continue to create the virtual card', async function () {
    await BusinessCardTerminatePage.tapContinue()
  })

  it('BCT-2.7 Verify card assigned successfully', async function () {
    await BusinessCardTerminatePage.verifyCardAssignedSuccess()
  })

  it('BCT-2.8 Close success sheet and return to Manage Cards', async function () {
    await BusinessCardTerminatePage.closeSuccessAndReturnToManageCards()
  })

  it('BCT-2.9 Open own virtual card once it becomes Active (wait from Pending)', async function () {
    await BusinessCardTerminatePage.openOwnVirtualCard()
  })

  it('BCT-2.10 Freeze the virtual card (required before termination)', async function () {
    await BusinessCardTerminatePage.freezeCardBeforeTerminate()
  })

  it('BCT-2.11 Terminate the virtual card (TC1740)', async function () {
    await BusinessCardTerminatePage.terminateCard()
  })

  it('BCT-2.12 Verify terminated card appears in Inactive tab (TC1741)', async function () {
    await BusinessCardTerminatePage.verifyCardInInactiveTab()
  })
})
