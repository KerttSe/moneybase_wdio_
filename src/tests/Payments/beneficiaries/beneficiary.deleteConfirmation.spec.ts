import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import payees from '../../../pages/PayeesSearchPage'
import { AUTH } from '../../../data/credentials'

// Opens Delete on a beneficiary and cancels; Confirm is never tapped, so nothing is deleted.
// MUM owns this spec; its known beneficiary is AUTH.swiftBeneficiaryName.
const BENEFICIARY = process.env.DELETE_CONFIRM_BENEFICIARY || AUTH.swiftBeneficiaryName || 'James Rodriquez'

describe('Beneficiary delete confirmation (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()

  before(async function () {
    if (!browser.isAndroid) return this.skip()
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
  })

  it('Delete asks for confirmation and Cancel keeps the beneficiary [TC3293]', step(async function () {
    await payees.verifyDeleteBeneficiaryNeedsConfirmation(BENEFICIARY)
  }))
})
