import { loginPage } from '../pages/LoginPage'
import AutoTopUpPage from '../pages/AutoTopUpPage'
import { AUTH } from '../data/credentials'
import { requiredAutoTopUpFixture } from '../data/autoTopUpValidation'

describe('PAY-072 [TC3343] Unchanged Auto Top-Up rule', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))
  const page = new AutoTopUpPage()

  before(async function () {
    const rule = requiredAutoTopUpFixture('AUTO_TOP_UP_EDIT_RULE_A11Y')
    await loginPage.loginFlow(AUTH)
    await page.openValidationExistingRule(rule)
  })

  it('PAY-072 [TC3343] Existing unchanged rule keeps Save disabled', async function () {
    await page.verifySaveEnabled(false)
  })
})
