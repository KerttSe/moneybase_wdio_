import { loginPage } from '../../../pages/LoginPage'
import AddBeneficiaryPage from '../../../pages/AddBeneficiaryPage'
import { AUTH } from '../../../data/credentials'
import { beneficiaryValidationData } from '../../../data/beneficiaryValidation'

describe('PAY-035 [TC3306] Beneficiary IBAN checksum', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))
  const page = new AddBeneficiaryPage()
  const data = beneficiaryValidationData()

  before(async function () {
    await loginPage.loginFlow(AUTH)
    await page.openValidationBankDetails(data)
    await page.verifyNoValidationError('checksum')
  })

  it('PAY-035 [TC3306] Reject a 31-character checksum-invalid IBAN with a validity error, not length error', async function () {
    await page.enterValidationField('iban', data.invalidChecksum)
    await page.verifyBankDetailsRejected('checksum')
  })
})
