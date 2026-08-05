import { LoginPage } from '../pages/LoginPage'
import BusinessCardAdminSelfAssignPage from '../pages/BusinessCardAdminSelfAssignPage'

describe('Business Cards - Admin Self-Assign Card Blocked', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const country = process.env.BH_MB_COUNTRY || process.env.MB_COUNTRY || 'Malta'
  const phone = process.env.BC_ADMIN_SELF_ASSIGN_PHONE || '99771031'
  const pin = process.env.BC_ADMIN_SELF_ASSIGN_PIN || '2468'

  before(async function () {
    await loginPage.loginFlow({ country, phone, pin })
    await BusinessCardAdminSelfAssignPage.ensureSeDeKEAccount()
  })

  it('BCAS-1.1 Open Cards tab', async function () {
    await BusinessCardAdminSelfAssignPage.openCardsTab()
  })

  it('BCAS-1.2 Tap Add Card', async function () {
    await BusinessCardAdminSelfAssignPage.tapAddCard()
  })

  it('BCAS-1.3 Verify admin self-assign blocked popup appears', async function () {
    await BusinessCardAdminSelfAssignPage.verifyAdminSelfAssignAlert()
  })
})
