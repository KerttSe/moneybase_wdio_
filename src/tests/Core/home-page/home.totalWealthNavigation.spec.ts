import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'

describe('DASH-010 [TC3058] Total Wealth navigation', function () {
  it('Opens Portfolio from Investments and Savings and Wallet Manager from Cash', async function () {
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
    await home.verifyTotalWealthDestinations()
  })
})
