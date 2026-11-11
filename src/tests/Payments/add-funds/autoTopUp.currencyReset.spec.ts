import { loginPage } from '../../../pages/LoginPage'
import AutoTopUpPage from '../../../pages/AutoTopUpPage'
import { AUTH } from '../../../data/credentials'

describe('PAY-073 [TC3344] Auto Top-Up currency reset', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))
  const page = new AutoTopUpPage()
  const secondCurrency = process.env.AUTO_TOP_UP_TEST_SECOND_CURRENCY?.trim()

  before(async function () {
    if (secondCurrency && ['EUR', 'EURO'].includes(secondCurrency.toUpperCase())) throw new Error('CONFIGURATION_ERROR: second currency must differ from Euro')
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
    if (secondCurrency) await page.selectCurrency(secondCurrency)
    else await page.selectAlternativeValidationCurrency()
    await page.verifyValidationSelections(false)
    await page.verifySaveEnabled(false)
  })
})
