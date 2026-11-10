import { browser } from '@wdio/globals'
import { AUTH } from '../data/credentials'
import { loginPage } from '../pages/LoginPage'
import page from '../pages/HomeScreenPage'

describe('Account picker search', function () {
  it('[TC2944/TC2945/TC2946] Searches identities', async function () {
    await loginPage.loginFlow(AUTH)
    await page.ensureIndividualAccount()
    await page.verifyAccountPickerSearch()
  })

  it('[TC2948] Reselects the active account', async function () {
    // On Android (seen in 2.27.0) the active account row is not clickable, so it cannot be reselected.
    if (browser.isAndroid) return this.skip()
    await page.verifyReselectCurrentAccount()
  })
})
