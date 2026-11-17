import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import TransactionsPage from '../../../pages/TransactionsPage'
import { AUTH } from '../../../data/credentials'

// Types a long personal note and leaves without saving it.
describe('Transaction personal note (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()
  const page = new TransactionsPage()

  before(async function () {
    if (!browser.isAndroid) return this.skip()
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
  })

  it('Personal note accepts more than 1000 characters [TC3334]', step(async function () {
    await page.verifyPersonalNoteHasNoLimitAndroid()
  }))
})
