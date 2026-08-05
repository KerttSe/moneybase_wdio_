import { LoginPage } from '../pages/LoginPage'
import BusinessCardWalletPage from '../pages/BusinessCardWalletPage'

const WALLET_NAME = `AutoWallet_${Date.now().toString().slice(-6)}`
const BH_SELF = process.env.BH_SELF_NAME || 'Dmytro Kertys'

describe('Business Cards - Create New Wallet (TC1717/TC1718/TC1719)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const country = process.env.BH_MB_COUNTRY || process.env.MB_COUNTRY || 'Malta'
  const phone = process.env.BH_MB_PHONE
  const pin = process.env.BH_MB_PIN || '2468'
  if (!phone) throw new Error('BH_MB_PHONE is not set')

  before(async function () {
    await loginPage.loginFlow({ country, phone, pin })
    await BusinessCardWalletPage.ensureSeDeKEAccount()
  })

  it('BCW-1.1 Open More → Administration (TC1717/TC1718/TC1719)', async function () {
    await BusinessCardWalletPage.openAdministration()
  })

  it('BCW-1.2 Verify Manage Cards screen is displayed', async function () {
    await BusinessCardWalletPage.openManageCards()
  })

  it('BCW-1.3 Tap Assign Card button', async function () {
    await BusinessCardWalletPage.tapAssignCard()
  })

  it('BCW-1.4 Select Virtual Card type', async function () {
    await BusinessCardWalletPage.selectVirtualCardType()
  })

  it(`BCW-1.5 Select self (${BH_SELF}) as assignee`, async function () {
    await BusinessCardWalletPage.selectSelfAssignee()
  })

  it('BCW-1.6 Open Select Wallet from Spend From', async function () {
    await BusinessCardWalletPage.openWalletPickerFromSpendFrom()
  })

  it('BCW-1.7 Verify Select Wallet sheet is displayed', async function () {
    await BusinessCardWalletPage.verifySelectWalletSheet()
  })

  it('BCW-1.8 Tap Add New Wallet', async function () {
    await BusinessCardWalletPage.tapAddNewWallet()
  })

  it('BCW-1.9 Verify New Wallet form is displayed', async function () {
    await BusinessCardWalletPage.verifyNewWalletForm()
  })

  it(`BCW-1.10 Enter wallet name "${WALLET_NAME}"`, async function () {
    await BusinessCardWalletPage.enterWalletName(WALLET_NAME)
  })

  it('BCW-1.11 Tap Add to submit', async function () {
    await BusinessCardWalletPage.tapAdd()
  })

  it('BCW-1.12 Verify "Add Wallet" dialog appears', async function () {
    await BusinessCardWalletPage.verifyAddWalletDialog()
  })

  it('BCW-1.13 Verify dialog message indicates plan wallet limit reached', async function () {
    await BusinessCardWalletPage.verifyPlanLimitMessage()
  })

})
