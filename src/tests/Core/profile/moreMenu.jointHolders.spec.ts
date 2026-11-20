import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import more from '../../../pages/MoreMenuPage'
import { AUTH } from '../../../data/credentials'

// Read-only: compares the More header of the individual and the joint account (VEG40003) of the same login.
describe('More menu joint account holders (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()

  before(async function () {
    if (!browser.isAndroid) return this.skip()
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
  })

  after(async function () {
    if (browser.isAndroid) await home.ensureIndividualAccount().catch(() => {})
  })

  it('Individual account shows a single holder [TC2875]', step(async function () {
    await more.verifyJointHolders(false)
  }))

  it('Joint account lists every holder with an initials avatar and name, with no show-more indicator for two holders [TC2875, TC2876, TC2878]', step(async function () {
    await home.ensureJointAccount()
    await more.verifyJointHolders(true)
  }))
})
