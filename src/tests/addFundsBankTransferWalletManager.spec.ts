import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import AddFundsBankTransferWalletManagerPage from '../pages/AddFundsBankTransferWalletManagerPage'

describe('Add Funds - Bank Transfer - Wallet Manager', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()

  before(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('AFBT-2.1 Open Home screen', async function () {
    await AddFundsBankTransferWalletManagerPage.openHomeScreen()
  })

  it('AFBT-2.2 Open Add Funds', async function () {
    await AddFundsBankTransferWalletManagerPage.openAddFunds()
  })

  it('AFBT-2.3 Select Bank Transfer option', async function () {
    await AddFundsBankTransferWalletManagerPage.selectBankTransferOption()
  })

  it('AFBT-2.4 Open Wallet Manager from Bank Transfer screen', async function () {
    await AddFundsBankTransferWalletManagerPage.openWalletManager()
  })

  it('AFBT-2.5 Verify Wallet Manager screen loads successfully', async function () {
    await AddFundsBankTransferWalletManagerPage.verifyWalletManagerLoaded()
  })

  it('AFBT-2.6 Verify all available wallets are displayed', async function () {
    await AddFundsBankTransferWalletManagerPage.verifyAvailableWalletsDisplayed()
  })

  it('AFBT-2.7 Verify wallet currency is displayed correctly', async function () {
    await AddFundsBankTransferWalletManagerPage.verifyWalletCurrencyDisplayedCorrectly()
  })

  it('AFBT-2.8 Verify wallet balance is displayed', async function () {
    await AddFundsBankTransferWalletManagerPage.verifyWalletBalanceDisplayed()
  })

  it('AFBT-2.9 Verify wallet identifier is displayed', async function () {
    await AddFundsBankTransferWalletManagerPage.verifyWalletIdentifierDisplayed()
  })

  it('AFBT-2.10 Verify Wallet Manager screen remains stable', async function () {
    await AddFundsBankTransferWalletManagerPage.verifyWalletManagerScreenStable()
  })
})
