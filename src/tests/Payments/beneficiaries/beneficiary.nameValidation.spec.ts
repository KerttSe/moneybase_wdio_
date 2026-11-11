import { loginPage } from '../../../pages/LoginPage'
import AddBeneficiaryPage from '../../../pages/AddBeneficiaryPage'
import { AUTH } from '../../../data/credentials'
import { beneficiaryValidationData } from '../../../data/beneficiaryValidation'

describe('PAY-033 [TC3304] Beneficiary name validation', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))
  const page = new AddBeneficiaryPage()
  const data = beneficiaryValidationData()

  before(async function () {
    await loginPage.loginFlow(AUTH)
    await page.openValidationBankDetails(data)
  })

  beforeEach(async function () {
    await page.resetValidationBankDetails(data)
    await page.verifyNoValidationError('name')
  })

  for (const field of ['name', 'surname'] as const) {
    for (const [kind, value] of [['short', 'Al'], ['numeric', 'Alex7'], ['emoji', 'Alex\u{1F600}']]) {
      it(`PAY-033 [TC3304] Reject ${kind} ${field}`, async function () {
        await page.enterValidationField(field, value)
        await page.verifyBankDetailsRejected('name')
      })
    }
  }

  it('PAY-033 [TC3304] Accept apostrophes and hyphens in both names without submitting', async function () {
    await page.enterValidationField('name', "O'Brien-Smith")
    await page.enterValidationField('surname', "D'Arcy-Smith")
    await page.verifyNoValidationError('name')
    await page.verifyBankDetailsAccepted()
  })
})
