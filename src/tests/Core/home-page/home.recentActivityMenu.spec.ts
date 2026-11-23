import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import { AUTH } from '../../../data/credentials'

// iOS only: Android opens the transaction details on long-press instead of a context menu (noted 2026-11-19).
describe('Home Recent Activity context menu (iOS)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()

  before(async function () {
    if (!browser.isIOS) return this.skip()
    await loginPage.loginFlow(AUTH)
  })

  it('Long-press on a recent transaction shows a preview with Show up to and Filter recent by wallet [TC3052]', step(async function () {
    await home.verifyRecentActivityContextMenuIOS()
  }))
})
