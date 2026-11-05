import { AUTH } from '../data/credentials'
import { loginPage } from '../pages/LoginPage'
import walletManager from '../pages/AddFundsBankTransferWalletManagerPage'

describe('WALLET-006 [TC2915] EUR IBAN bank name', function () {
  it('Hides the bank name for the EUR wallet', async function () {
    await loginPage.loginFlow(AUTH)
    await walletManager.openWalletDetailsFromManager('EUR')
    await walletManager.verifyIbanBankNameVisibility(false)
  })
})
