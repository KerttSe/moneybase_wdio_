import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import more from '../../../pages/MoreMenuPage'
import { AUTH } from '../../../data/credentials'

// Read-only: compares the More menu of the individual and the business account of the same login.
describe('More menu business-only rows', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()

  before(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
  })

  after(async function () {
    await home.ensureIndividualAccount().catch(() => {})
  })

  it('Individual account has no Approvals or Beneficiaries rows [TC2960]', step(async function () {
    await more.verifyBusinessOnlyRows(false)
  }))

  it('Business account shows Approvals and Beneficiaries rows [TC2960]', step(async function () {
    await home.ensureBusinessAccount()
    await more.verifyBusinessOnlyRows(true)
  }))
})
