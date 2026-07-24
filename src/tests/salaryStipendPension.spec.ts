import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'
import SalaryStipendPensionPage from '../pages/SalaryStipendPensionPage'

describe('Add Funds – Salary, Stipend or Pension', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const loginPage = new LoginPage()
  const sspPage = new SalaryStipendPensionPage()

  before(async function () {
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureIndividualAccount()
  })

  it('SSP-1.1 Open Add Funds from home', async function () {
    await sspPage.openFromHome()
  })

  it('SSP-1.2 Select Salary, Stipend or Pension tile', async function () {
    await sspPage.tapSspTile()
  })

  it('SSP-1.3 Select full salary preference', async function () {
    await sspPage.selectFullSalaryPreference()
  })

  it('SSP-1.4 Tap Next', async function () {
    await sspPage.tapNext()
  })

  it('SSP-1.5 Verify instruction screen shows IBAN, BIC and Bank Name fields', async function () {
    await sspPage.verifyInstructionScreenContent()
  })
})
