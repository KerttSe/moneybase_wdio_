import { browser } from '@wdio/globals'
import { loginPage } from '../../../pages/LoginPage'
import AddBeneficiaryPage from '../../../pages/AddBeneficiaryPage'
import { AUTH } from '../../../data/credentials'
import { beneficiaryValidationData } from '../../../data/beneficiaryValidation'

describe('PAY-036 [TC3307] Beneficiary IBAN country mismatch', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))
  const page = new AddBeneficiaryPage()
  const data = beneficiaryValidationData()

  before(async function () {
    await loginPage.loginFlow(AUTH)
    await page.openValidationBankDetails(data)
    await page.verifyNoValidationError('country')
  })

  it('PAY-036 [TC3307] Reject a checksum-valid German IBAN for a Malta beneficiary with a country error', async function () {
    if (browser.isAndroid) {
      await page.verifyForeignIbanBlocked(data.foreignIban)
      return
    }
    await page.enterValidationField('iban', data.foreignIban)
    await page.verifyBankDetailsRejected('country')
  })
})
