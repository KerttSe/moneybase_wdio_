import { loginPage } from '../../../pages/LoginPage'
import AddBeneficiaryPage from '../../../pages/AddBeneficiaryPage'
import { AUTH } from '../../../data/credentials'
import { beneficiaryValidationData } from '../../../data/beneficiaryValidation'

describe('PAY-034 [TC3305] Malta beneficiary IBAN length', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))
  const page = new AddBeneficiaryPage()
  const data = beneficiaryValidationData()

  before(async function () {
    await loginPage.loginFlow(AUTH)
    await page.openValidationBankDetails(data)
  })

  beforeEach(async function () {
    await page.resetValidationBankDetails(data)
    await page.verifyNoValidationError('length')
  })

  it('PAY-034 [TC3305] Reject 30 characters with an IBAN length error', async function () {
    await page.enterValidationField('iban', data.shortIban)
    await page.verifyBankDetailsRejected('length')
  })

  it('PAY-034 [TC3305] Accept the exact 31-character length without submitting', async function () {
    await page.enterValidationField('iban', data.iban)
    await page.verifyNoValidationError('length')
    await page.verifyBankDetailsAccepted()
  })
})
