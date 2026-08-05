import { LoginPage } from '../pages/LoginPage'
import BusinessCardCardLimitsPage from '../pages/BusinessCardCardLimitsPage'

describe('Business Cards - Card Limit Reached (TC1745/TC1747)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const country = process.env.BH_MB_COUNTRY || process.env.MB_COUNTRY || 'Malta'
  const phone = process.env.BC_ADMIN_SELF_ASSIGN_PHONE || '99771031'
  const pin = process.env.BC_ADMIN_SELF_ASSIGN_PIN || '2468'

  before(async function () {
    await loginPage.loginFlow({ country, phone, pin })
    await BusinessCardCardLimitsPage.ensureSeDeKEAccount()
  })

  // ── Virtual card limit (TC1745) ───────────────────────────────────────────

  it('BCCL-1.1 Open Manage Cards', async function () {
    await BusinessCardCardLimitsPage.openManageCards()
  })

  it('BCCL-1.2 Tap Assign Card', async function () {
    await BusinessCardCardLimitsPage.tapAssignCard()
  })

  it('BCCL-1.3 Select Virtual Card type', async function () {
    await BusinessCardCardLimitsPage.selectVirtualCardType()
  })

  it('BCCL-1.4 Select Self as assignee', async function () {
    await BusinessCardCardLimitsPage.selectSelfAssigneeAndExpectLimit()
  })

  it('BCCL-1.5 Verify "User Limit Reached" for virtual cards (TC1745)', async function () {
    await BusinessCardCardLimitsPage.verifyUserLimitReached()
  })

  // ── Physical card limit (TC1747) ──────────────────────────────────────────

  it('BCCL-2.1 Dismiss limit popup and return to Assign Card form', async function () {
    await BusinessCardCardLimitsPage.dismissLimitAndReturnToAssignCardForm()
  })

  it('BCCL-2.2 Select Physical Card type', async function () {
    await BusinessCardCardLimitsPage.selectPhysicalCardType()
  })

  it('BCCL-2.3 Select Self as assignee', async function () {
    await BusinessCardCardLimitsPage.selectSelfAssigneeAndExpectLimit()
  })

  it('BCCL-2.4 Verify "User card limit reached" for physical cards (TC1747)', async function () {
    await BusinessCardCardLimitsPage.verifyUserLimitReached()
  })
})
