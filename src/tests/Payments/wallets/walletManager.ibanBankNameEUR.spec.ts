import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import walletManager from '../../../pages/AddFundsBankTransferWalletManagerPage'

// App 2.27.0 shows the bank name for EUR wallets too, so TC2915 now verifies it is displayed.
describe('WALLET-006 [TC2915] EUR IBAN bank name', function () {
  it('Shows the bank name for the EUR wallet', async function () {
    await loginPage.loginFlow(AUTH)
    await walletManager.openWalletDetailsFromManager('EUR')
    await walletManager.verifyIbanBankNameVisibility(true)
  })
})
