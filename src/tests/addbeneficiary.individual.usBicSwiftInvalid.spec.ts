import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import AddBeneficiaryPage from '../pages/AddBeneficiaryPage'
import EditBeneficiaryDraftPage from '../pages/EditBeneficiaryDraftPage'
import { AUTH } from '../data/credentials'

describe('Add Beneficiary - Another person (US) - Invalid BIC/SWIFT [DRAFT]', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const loginPage = new LoginPage()
  const addBeneficiaryPage = new AddBeneficiaryPage()
  const editBeneficiaryDraftPage = new EditBeneficiaryDraftPage()

  beforeEach(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('[DRAFT] Invalid BIC/SWIFT blocks progress until corrected', async function () {
    if (!browser.isAndroid) return this.skip()

    const name = 'Test'
    const surname = 'Beneficiary'
    const accountNumber = process.env.US_ACCOUNT_NUMBER_EXAMPLE || '123'
    const invalidBicSwift = process.env.INVALID_BIC_SWIFT || 'BOFA'

    await addBeneficiaryPage.startAddBeneficiaryAndroid()
    await addBeneficiaryPage.chooseAnotherPersonAndroid()

    const redesignPresent = await editBeneficiaryDraftPage.isRedesignedCountryScreenPresentAndroid()
    if (!redesignPresent) return this.skip()

    await editBeneficiaryDraftPage.selectCountryAndCurrencyDraftAndroid('United States of America', 'USD')
    await editBeneficiaryDraftPage.enterBeneficiaryNameDraftAndroid(name, surname)
    await editBeneficiaryDraftPage.enterAccountNumberDraftAndroid(accountNumber)
    await editBeneficiaryDraftPage.enterBicSwiftDraftAndroid(invalidBicSwift)
    await editBeneficiaryDraftPage.verifyInvalidBicSwiftErrorDraftAndroid()
  })
})
