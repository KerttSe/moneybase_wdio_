import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import pd from '../../../pages/PersonalDetailsPage'
import { AUTH } from '../../../data/credentials'

// Types invalid first names and leaves without saving.
describe('Personal Details name validation (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()

  before(async function () {
    if (!browser.isAndroid) return this.skip()
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
    await pd.navigateToPersonalDetails()
  })

  it('First name rejects a 1-character and a numeric value [TC2975]', step(async function () {
    await pd.verifyFirstNameValidationAndroid()
  }))
})
