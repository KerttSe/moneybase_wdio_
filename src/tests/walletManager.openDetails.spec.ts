import { AUTH } from '../data/credentials'
import { loginPage } from '../pages/LoginPage'
import page from '../pages/AddFundsBankTransferWalletManagerPage'

describe('WALLET-002 [TC2911] Wallet Manager navigation', function () {
  it('Opens Wallet Details from the EUR wallet row', async function () {
    await loginPage.loginFlow(AUTH)
    await page.openWalletDetailsFromManager('EUR')
  })
})
