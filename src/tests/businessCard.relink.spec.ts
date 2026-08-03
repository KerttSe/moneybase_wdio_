import { LoginPage } from '../pages/LoginPage'
import BusinessCardRelinkPage from '../pages/BusinessCardRelinkPage'

const OTHER_USER = process.env.BH_OTHER_USER_NAME || 'Dmytri Kerteusz'

describe('Business Cards - Relink Card to Existing Wallet', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const country = process.env.BH_MB_COUNTRY || process.env.MB_COUNTRY || 'Malta'
  const phone = process.env.BH_MB_PHONE
  const pin = process.env.BH_MB_PIN || '2468'
  if (!phone) throw new Error('BH_MB_PHONE is not set')

  before(async function () {
    await loginPage.loginFlow({ country, phone, pin })
    await BusinessCardRelinkPage.ensureSeDeKEAccount()
  })

  it('BCR-3.1 Open More → Administration (TC1742/TC1743/TC1744)', async function () {
    await BusinessCardRelinkPage.openAdministration()
  })

  it('BCR-3.2 Verify Manage Cards screen is displayed', async function () {
    await BusinessCardRelinkPage.openManageCards()
  })

  it(`BCR-3.3 Open ${OTHER_USER} card details`, async function () {
    await BusinessCardRelinkPage.openOtherUserCard()
  })

  it('BCR-3.4 Tap Spend From row to open Select Wallet sheet', async function () {
    await BusinessCardRelinkPage.tapSpendFromRow()
  })

  it('BCR-3.5 Verify Select Wallet sheet is displayed', async function () {
    await BusinessCardRelinkPage.verifySelectWalletSheet()
  })

  it('BCR-3.6 Select a random wallet that is not the currently assigned one', async function () {
    await BusinessCardRelinkPage.selectRandomExistingWallet()
  })

  it('BCR-3.7 Verify Spend From on Card Details updated to the new wallet', async function () {
    await BusinessCardRelinkPage.verifySpendFromUpdated()
  })
})
