import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import { AUTH } from '../../../data/credentials'

// Generates a statement for the current month on the individual EUR wallet (a read-only report).
describe('Wallet statement generation', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()

  before(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
  })

  it('Generate Statement with the default range completes without an error [TC2932]', step(async function () {
    await home.openCurrentWalletDetails()
    await home.verifyWalletStatementAction(true)
    await home.verifyGenerateStatement()
  }))
})
