import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'

describe('SUPPORT-003 [TC2858] Dismiss Support', function () {
  it('Closes the Support sheet and leaves Home available', async function () {
    await loginPage.loginFlow(AUTH)
    await home.verifySupportClosesToHome()
  })
})
