import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import AddBeneficiaryPage from '../pages/AddBeneficiaryPage'
import { AUTH } from '../data/credentials'
import { getMalteseIbanForTest } from '../data/ibans'
// import { generateUniqueSwiftBic } from '../helpers/bic.helper'

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

describe('Add Beneficiary - Another person', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const loginPage = new LoginPage()
  const addBeneficiaryPage = new AddBeneficiaryPage()

  beforeEach(async function () {
    // Same login logic as Add Funds: uses hardcoded 000000 by default
    await loginPage.loginFlow(AUTH)
  })

  it('Add beneficiary (Another person)', async function () {
    const iban = getMalteseIbanForTest()
    // const ibanUpper = iban.replace(/\s+/g, '').toUpperCase()
    // const { bic11 } = generateUniqueSwiftBic({ bankCode: 'CCUH', countryCode: 'MT' })
    const bic11 = 'CCUHMTMTXXX'
    
    const beneficiary = randomBeneficiaryDetails()

    console.log('[TEST] Starting Add Beneficiary test...')
    console.log(`[TEST] Using IBAN: ${iban}`)
    console.log(`[TEST] Using BIC: ${bic11}`)
    console.log(`[TEST] Using beneficiary: ${beneficiary.name} ${beneficiary.surname}`)

    await browser.pause(2000)

    console.log('[TEST] Opening Pay tab -> New -> Add Beneficiary...')
    await addBeneficiaryPage.addBeneficiaryAnotherPerson({
      name: beneficiary.name,
      surname: beneficiary.surname,
      iban,
      bic: bic11,
      friendName: beneficiary.friendName,
    })

    console.log('[TEST] ✅ Test completed!')
  })
})
