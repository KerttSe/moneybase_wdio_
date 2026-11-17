import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import payees from '../../../pages/PayeesSearchPage'
import { AUTH } from '../../../data/credentials'

describe('Pay search filters (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()

  before(async function () {
    if (!browser.isAndroid) return this.skip()
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
  })

  it('A selected filter resets to All after leaving and re-entering search [TC3297]', step(async function () {
    await payees.verifyFilterResetsOnReentry()
  }))
})
