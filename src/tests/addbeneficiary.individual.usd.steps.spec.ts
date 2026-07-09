import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import AddBeneficiaryPage from '../pages/AddBeneficiaryPage'
import { AUTH } from '../data/credentials'
import { getUSAccountNumberForTest } from '../data/usAccounts'
import { generateUniqueSwiftBic } from '../helpers/bic.helper'

function randomBeneficiaryDetails() {
  const firstNames = ['Alex', 'Danieltest', 'Mark', 'Nina', 'Sofiatest', 'Victor']
  const surnames = ['automationtest', 'Cassar', 'test', 'Mifsud', 'Sammut', 'Zammit']
  const suffix = Array.from({ length: 2 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('')
  const pick = (values: string[]) => values[Math.floor(Math.random() * values.length)]

  const name = pick(firstNames)
  const surname = `${pick(surnames)} ${suffix}`

  return {
    name,
    surname,
    friendName: `${name} ${suffix}`,
  }
}

/**
 * Step-by-step breakdown of the USD/SWIFT Add Beneficiary flow. Each it() is a
 * checkpoint in ONE continuous session (login runs once in `before`, not per test) —
 * the steps are inherently sequential, you cannot e.g. "enter BIC" without first
 * completing country/currency selection.
 *
 * Note on ordering vs a generic checklist: name + account number + BIC/SWIFT all
 * live on the SAME screen (confirmed via real device), and there's a SEPARATE
 * address screen reached only after that screen's Continue. So "address" and the
 * second "Continue" come AFTER BIC entry here, not before account/BIC.
 */
describe('Add Beneficiary - Another person (USD) - step by step', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const loginPage = new LoginPage()
  const addBeneficiaryPage = new AddBeneficiaryPage()

  const accountNumber = getUSAccountNumberForTest()
  const { bic8: bic } = generateUniqueSwiftBic({ countryCode: 'US' })
  const beneficiary = randomBeneficiaryDetails()
  const address = {
    addressLine1: '350 5th Avenue',
    city: 'New York',
    postCode: '10118',
  }

  before(async function () {
    if (!browser.isAndroid) this.skip()
    await loginPage.loginFlow(AUTH)
  })

  it('AB-USD-1.1 Open Pay tab', async function () {
    await addBeneficiaryPage.openPayTabForBeneficiaryAndroid()
  })

  it('AB-USD-1.2 Tap New Transfer / Add button', async function () {
    await addBeneficiaryPage.tapNewTransferOrAddAndroid()
  })

  it('AB-USD-1.3 Tap Add Beneficiary', async function () {
    await addBeneficiaryPage.tapAddBeneficiaryBtnAndroid()
  })

  it('AB-USD-1.4 Select beneficiary type', async function () {
    await addBeneficiaryPage.chooseAnotherPersonAndroid()
  })

  it('AB-USD-1.5 Select country for SWIFT payment', async function () {
    await addBeneficiaryPage.selectCountryForBeneficiaryAndroid('USD')
  })

  it('AB-USD-1.6 Select USD wallet / currency', async function () {
    await addBeneficiaryPage.selectCurrencyForBeneficiaryAndroid('USD')
  })

  it('AB-USD-1.7 Enter beneficiary name', async function () {
    await addBeneficiaryPage.enterBeneficiaryNameUSAndroid(beneficiary.name, beneficiary.surname)
  })

  it('AB-USD-1.8 Enter account number', async function () {
    console.log(`[TEST] Using account number: ${accountNumber}`)
    await addBeneficiaryPage.enterBeneficiaryAccountNumberUSAndroid(accountNumber)
  })

  it('AB-USD-1.9 Enter BIC/SWIFT code and continue', async function () {
    console.log(`[TEST] Using SWIFT: ${bic}`)
    await addBeneficiaryPage.enterBeneficiaryBicUSAndroid(bic)
    await addBeneficiaryPage.continueFromDetailsAndroid()
  })

  it('AB-USD-1.10 Enter beneficiary address and continue', async function () {
    await addBeneficiaryPage.fillBeneficiaryAddressUSAndroid(address)
  })

  it('AB-USD-1.11 Confirm OTP and verify beneficiary created successfully', async function () {
    await addBeneficiaryPage.waitForOtpAndSubmitAndroid()
  })
})
