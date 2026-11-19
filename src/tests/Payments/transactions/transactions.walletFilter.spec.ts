import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import TransactionsPage from '../../../pages/TransactionsPage'
import { AUTH } from '../../../data/credentials'

// Filters Transactions to the USD wallet and resets the filter to All Accounts at the end.
describe('Transactions wallet filter (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()
  const page = new TransactionsPage()

  before(async function () {
    if (!browser.isAndroid) return this.skip()
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
  })

  it('USD wallet filter lists only USD transactions and is kept after reopening [TC3327]', step(async function () {
    await page.verifyWalletFilterPersistsAndroid()
  }))
})
