import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'

describe('WALLET-007 [TC2916] Business wallet statements', function () {
  it('Hides the statement action from Wallet Details', async function () {
    await loginPage.loginFlow(AUTH)
    await home.ensureBusinessAccount()
    await home.openCurrentWalletDetails()
    await home.verifyWalletStatementAction(false)
  })
})
