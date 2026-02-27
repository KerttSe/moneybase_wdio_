import { LoginPage } from '../pages/LoginPage'
import AddFundsPage from '../pages/AddFunds'
import { AUTH } from '../data/credentials'

describe('Add Funds', () => {
  const loginPage = new LoginPage()
  const addFundsPage = new AddFundsPage()

  beforeEach(async () => {
    await loginPage.loginFlow(AUTH)
  })

  it('User can proceed top up balance via card', async () => {
    await addFundsPage.openFromHome()
    await addFundsPage.goToTopUp()
    await addFundsPage.enterAmount(11)
    await addFundsPage.continueTo3DS()
  })
})
