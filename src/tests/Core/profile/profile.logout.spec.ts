import { $, browser } from '@wdio/globals'
import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'

describe('Profile logout', function () {
  it('[TC2996/TC2995] Keeps the session on cancel and returns to entry on confirm', async function () {
    await loginPage.loginFlow(AUTH)
    await home.cancelLogoutAndVerifyHome()
    await home.confirmLogout()
    // 2.27.0 lands on the Welcome screen (Sign In) after logout; older builds opened the mobile number entry.
    const welcome = $('//*[contains(@resource-id,"welcomeToMoneybase_screen")]')
    await browser.waitUntil(
      async () => (await loginPage.mobileInput.isDisplayed().catch(() => false)) || (await welcome.isDisplayed().catch(() => false)),
      { timeout: 30000, interval: 500, timeoutMsg: 'TC2995: confirming logout should return to the sign-in entry' },
    )
  })
})
