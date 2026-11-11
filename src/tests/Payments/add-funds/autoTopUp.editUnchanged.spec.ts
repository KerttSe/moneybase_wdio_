import { loginPage } from '../../../pages/LoginPage'
import AutoTopUpPage from '../../../pages/AutoTopUpPage'
import { AUTH } from '../../../data/credentials'

describe('PAY-072 [TC3343] Unchanged Auto Top-Up rule', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const page = new AutoTopUpPage()

  before(async function () {
    await loginPage.loginFlow(AUTH)
    await page.prepareValidationExistingRule(AUTH.cardLastFour || '', process.env.AUTO_TOP_UP_EDIT_RULE_A11Y?.trim())
  })

  after(async function () {
    await page.cleanupValidationExistingRule()
  })

  it('PAY-072 [TC3343] Saving an existing unchanged rule changes nothing', async function () {
    // 2.27.0 keeps Save enabled on an unchanged rule; saving it must leave the rule as it was.
    await page.verifyUnchangedRuleSaveIsNoOp()
  })
})
