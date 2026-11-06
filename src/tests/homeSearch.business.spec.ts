import { AUTH } from '../data/credentials'
import { loginPage } from '../pages/LoginPage'
import HomeSearchPage from '../pages/HomeSearchPage'

describe('Home Search - Business', function () {
  it('[TC3051] Hides restricted search sections and statistics on Business Home', async function () {
    await loginPage.loginFlow(AUTH)
    await new HomeSearchPage().verifyBusinessHomeSearchScope()
  })
})
