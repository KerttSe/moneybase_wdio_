import { LoginPage } from '../../../pages/LoginPage'
import BusinessCardAdminPage from '../../../pages/BusinessCardAdminPage'
import { BH_AUTH } from '../../../data/credentials'

const OTHER_USER = process.env.BH_OTHER_USER_NAME || 'Dmytri Kerteusz'

describe('Business Cards - Freeze/UnFreeze Other User Virtual Card', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()

  const country = BH_AUTH.country
  const phone = BH_AUTH.phone
  const pin = BH_AUTH.pin

  before(async function () {
    await loginPage.loginFlow({ country, phone, pin })
    await BusinessCardAdminPage.ensureSeDeKEAccount()
  })

  it('BCF-1.1 Open More → Administration (TC1738/TC1739)', async function () {
    await BusinessCardAdminPage.openAdministration()
  })

  it('BCF-1.2 Verify Manage Cards screen is displayed', async function () {
    await BusinessCardAdminPage.openManageCards()
  })

  it(`BCF-1.3 Open ${OTHER_USER} card details`, async function () {
    await BusinessCardAdminPage.openOtherUserCard()
  })

  it('BCF-1.4 Freeze the card (TC1738)', async function () {
    await BusinessCardAdminPage.freezeCard()
  })

  it('BCF-1.5 Verify card is frozen — Unfreeze button visible', async function () {
    await BusinessCardAdminPage.verifyCardFrozen()
  })

  it('BCF-1.6 Unfreeze the card (TC1739)', async function () {
    await BusinessCardAdminPage.unfreezeCard()
  })

  it('BCF-1.7 Verify card is active again — Freeze button visible', async function () {
    await BusinessCardAdminPage.verifyCardUnfrozen()
  })
})
