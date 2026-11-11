import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import AutoTopUpPage from '../../../pages/AutoTopUpPage'
import { AUTH } from '../../../data/credentials'

describe('Auto Top-Up - Required fields', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const page = new AutoTopUpPage()
  const step = stopAfterFailedStep()
  const options = { cardLabel: AUTH.cardLastFour || '', currency: 'Euro', amount: 1500 }

  before(step(async function () {
    if (!options.cardLabel) throw new Error('Auto Top-Up validation requires the selected account cardLastFour')
    await loginPage.loginFlow(AUTH)
    await page.openFromHome()
    await page.goToAutoTopUpList()
    await page.removeLeftoverValidationRule()
    await page.tapAddNew()
  }))

  it('PAY-071 [TC3342] Missing required fields disable Save', step(async function () {
    await page.verifySaveEnabled(false)
  }))

  it('PAY-071 [TC3342] Selecting a card alone does not enable Save', step(async function () {
    await page.selectCard(options.cardLabel)
    await page.verifySaveEnabled(false)
  }))

  it('PAY-071 [TC3342] Card and currency without amounts keep Save disabled', step(async function () {
    await page.selectCurrency(options.currency)
    await page.verifySaveEnabled(false)
  }))

  it('PAY-071 [TC3342] Complete valid form enables Save without submitting a rule', step(async function () {
    await page.configureValidationAmounts(String(options.amount))
    await page.verifySaveEnabled(true)
  }))
})
