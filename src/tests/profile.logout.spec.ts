import { AUTH } from '../data/credentials'
import { loginPage } from '../pages/LoginPage'
import home from '../pages/HomeScreenPage'

describe('Profile logout', function () {
  it('[TC2996/TC2995] Keeps the session on cancel and returns to entry on confirm', async function () {
    await loginPage.loginFlow(AUTH)
    await home.cancelLogoutAndVerifyHome()
    await home.confirmLogout()
    await loginPage.mobileInput.waitForDisplayed({ timeout: 30000 })
  })
})
