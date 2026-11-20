import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import AutoTopUpPage from '../../../pages/AutoTopUpPage'
import { AUTH } from '../../../data/credentials'

// Creates a Euro auto top-up rule, checks that a second Euro rule is blocked, and deletes the rule after.
describe('Auto Top-Up one rule per currency (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()
  const page = new AutoTopUpPage()
  const rule = { cardLabel: AUTH.cardLastFour as string, currency: 'Euro', amount: 1500 }
  let created = false

  before(async function () {
    if (!browser.isAndroid) return this.skip()
    if (!AUTH.cardLastFour) throw new Error('CONFIGURATION_ERROR: selected account cardLastFour is required')
    await loginPage.loginFlow(AUTH)
    await page.selectSmokeAutoTopUpCard(rule)
    await page.configureSmokeAutoTopUpAmounts(rule)
    await page.saveSmokeAutoTopUp(rule)
    created = true
  })

  after(async function () {
    if (!browser.isAndroid || !created) return
    await page.leaveToHomeAndroid().catch(() => {})
    await page.verifyAndDeleteAutoTopUpFromHomeFlow({ amount: rule.amount })
  })

  it('A second Euro rule warns that auto top-up is already enabled and keeps Save disabled [TC3340]', step(async function () {
    await page.verifySecondRuleForSameCurrencyBlockedAndroid()
  }))
})
