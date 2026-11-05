import page from '../pages/AppLifecyclePage'
import home from '../pages/HomeScreenPage'

describe('AUTH-022 [TC3152] Welcome Sign In', function () {
  it('[TC3152/TC2857] Opens mobile entry from the next carousel slide and shows Guest Support', async function () {
    if (process.env.BROWSERSTACK !== 'true' && process.env.MB_FRESH_INSTALL_WELCOME !== 'true') return this.skip()
    await page.verifyWelcomeSignInAfterAdvancing()
    await home.verifyGuestSupportOptions()
  })
})
