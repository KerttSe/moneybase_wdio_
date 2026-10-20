import { loginPage } from '../pages/LoginPage'
import AutoTopUpPage from '../pages/AutoTopUpPage'
import { AUTH } from '../data/credentials'
import { autoTopUpRangeFixture } from '../data/autoTopUpValidation'

describe('PAY-077 [TC3348] Auto Top-Up amount below minimum', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))
  const page = new AutoTopUpPage()
  let range: ReturnType<typeof autoTopUpRangeFixture>

  before(async function () {
    range = autoTopUpRangeFixture()
    await loginPage.loginFlow(AUTH)
    await page.openFromHome()
    await page.goToAutoTopUpList()
    await page.tapAddNew()
    await page.selectCurrency('Euro')
    await page.openValidationAmountEditor()
  })

  it('PAY-077 [TC3348] Minimum is accepted, one cent below is blocked, correction re-enables Done', async function () {
    await page.enterValidationCustomAmount(range.min)
    await page.verifyValidationAmountDoneEnabled(true)
    await page.enterValidationCustomAmount(range.below)
    await page.verifyValidationAmountDoneEnabled(false)
    await page.enterValidationCustomAmount(range.min)
    await page.verifyValidationAmountDoneEnabled(true)
  })
})
