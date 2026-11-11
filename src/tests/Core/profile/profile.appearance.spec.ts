import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import { authenticationPage as settings } from '../../../pages/AuthenticationPage'

describe('Profile information and appearance', function () {
  it('[TC2984/TC2987/TC2988/TC2989/TC2979/TC2980] Checks profile information, appearance and privacy', async function () {
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
    await home.verifyAboutUsOpens()
    await settings.verifyThemePreferences()
    await settings.verifyPrivacyPreferencesAfterTheme()
  })
})
