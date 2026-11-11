import { browser } from '@wdio/globals'
import { AUTH } from '../../../data/credentials'
import HomeScreenPage from '../../../pages/HomeScreenPage'
import { loginPage } from '../../../pages/LoginPage'

describe('Home - Recent Payees', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))

  before(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('[TC3063] Business Home omits Recent Payees', async function () {
    await HomeScreenPage.verifyBusinessHomeOmitsRecentPayees()
  })

  it('[TC3061] Opens details for the selected recent payee', async function () {
    const name = process.env.MB_RECENT_PAYEE_NAME?.trim()
    if (!(browser.isAndroid || browser.isIOS) || !name) return this.skip()

    await HomeScreenPage.ensureIndividualAccount()
    await HomeScreenPage.waitForHomeLoaded()
    await HomeScreenPage.verifyRecentPayeeOpensDetails(name)
  })
})
