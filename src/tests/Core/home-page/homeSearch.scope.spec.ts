import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import HomeScreenPage from '../../../pages/HomeScreenPage'
import HomeSearchPage from '../../../pages/HomeSearchPage'
import { AUTH } from '../../../data/credentials'

// The primary login holds an individual (VEG40002) and a business (DER00003) account.
describe('Home search scope by account type (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()
  const search = new HomeSearchPage()

  before(async function () {
    if (!browser.isAndroid) return this.skip()
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureIndividualAccount()
  })

  it('Retail search lists beneficiaries; business search is limited to recent, transactions and instruments [TC2958]', step(async function () {
    await search.verifySearchScopeRetailVsBusiness()
  }))
})
