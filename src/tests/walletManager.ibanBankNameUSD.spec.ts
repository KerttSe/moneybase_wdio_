import { AUTH } from '../data/credentials'
import { loginPage } from '../pages/LoginPage'
import walletManager from '../pages/AddFundsBankTransferWalletManagerPage'

describe('WALLET-005 [TC2914] USD IBAN bank name', function () {
  it('Shows the bank name for the USD wallet', async function () {
    await loginPage.loginFlow(AUTH)
    await walletManager.openWalletDetailsFromManager('USD')
    await walletManager.verifyIbanBankNameVisibility(true)
  })
})
