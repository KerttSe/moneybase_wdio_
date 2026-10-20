import { loginPage } from '../pages/LoginPage'
import AutoTopUpPage from '../pages/AutoTopUpPage'
import { AUTH } from '../data/credentials'
import { requiredAutoTopUpFixture } from '../data/autoTopUpValidation'

describe('PAY-073 [TC3344] Auto Top-Up currency reset', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))
  const page = new AutoTopUpPage()
  let secondCurrency: string

  before(async function () {
    secondCurrency = requiredAutoTopUpFixture('AUTO_TOP_UP_TEST_SECOND_CURRENCY')
    if (['EUR', 'EURO'].includes(secondCurrency.toUpperCase())) throw new Error('CONFIGURATION_ERROR: second currency must differ from Euro')
    if (!AUTH.cardLastFour) throw new Error('CONFIGURATION_ERROR: selected account cardLastFour is required')
    await loginPage.loginFlow(AUTH)
    await page.openFromHome()
    await page.goToAutoTopUpList()
    await page.tapAddNew()
    await page.selectCard(AUTH.cardLastFour)
    await page.selectCurrency('Euro')
    await page.configureValidationAmounts('1500')
    await page.verifyValidationSelections(true)
    await page.verifySaveEnabled(true)
  })

  it('PAY-073 [TC3344] Changing currency clears both selections and disables Save', async function () {
    await page.selectCurrency(secondCurrency)
    await page.verifyValidationSelections(false)
    await page.verifySaveEnabled(false)
  })
})
