import { AUTH } from '../data/credentials'
import { loginPage } from '../pages/LoginPage'
import HomeScreenPage from '../pages/HomeScreenPage'
import page from '../pages/AddFundsBankTransferWalletManagerPage'

describe('PAY-081 [TC3352] Business funding methods', function () {
  it('Shows Bank Transfer and excludes retail funding methods', async function () {
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureBusinessAccount()
    await page.verifyBusinessFundingMethods()
  })
})
