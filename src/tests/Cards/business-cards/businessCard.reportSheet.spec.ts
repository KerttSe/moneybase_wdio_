import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import HomeScreenPage from '../../../pages/HomeScreenPage'
import BusinessCardPage from '../../../pages/BusinessCardPage'
import { BH_AUTH } from '../../../data/credentials'

// SeDeKE (SED00004) on the secondary login holds a physical business card. Block is never tapped;
// a card that was active before the spec is unfrozen again at the end.
const REPORT_ACCOUNT = process.env.BH_REPORT_ACCOUNT_CODE || 'SED00004'

describe('Business card report sheet (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()
  let frozeHere = false

  before(async function () {
    if (!browser.isAndroid) return this.skip()
    await loginPage.loginFlow(BH_AUTH)
    await HomeScreenPage.ensureBusinessAccount(REPORT_ACCOUNT)
    await BusinessCardPage.openBusinessCardActionsAndroid()
    frozeHere = await BusinessCardPage.ensureCardFrozenAndroid()
  })

  after(async function () {
    if (browser.isAndroid && frozeHere) await BusinessCardPage.unfreezeCardAndroid().catch(() => {})
  })

  it('Report on a frozen card opens the Lost / Stolen / Damaged sheet; Cancel keeps the card [TC3254]', step(async function () {
    await BusinessCardPage.verifyReportSheetAndCancelAndroid()
  }))
})
