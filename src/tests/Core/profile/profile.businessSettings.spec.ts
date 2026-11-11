import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import { authenticationPage as settings } from '../../../pages/AuthenticationPage'

describe('Business settings', function () {
  it('[TC2963/TC2965] Hides privacy settings and blocks account closure', async function () {
    await loginPage.loginFlow(AUTH)
    await home.ensureBusinessAccount()
    await settings.verifyBusinessSettingsRestrictions()
  })
})
