import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import AddBeneficiaryPage from '../pages/AddBeneficiaryPage'
import { AUTH } from '../data/credentials'

describe('Add Beneficiary - Another person', () => {
  const loginPage = new LoginPage()
  const addBeneficiaryPage = new AddBeneficiaryPage()

  beforeEach(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('Add beneficiary (Another person)', async function () {

    console.log('[TEST] Starting Add Beneficiary test...')

    await browser.pause(2000)

    console.log('[TEST] Opening Pay tab -> New -> Add Beneficiary...')
    await addBeneficiaryPage.addBeneficiaryAnotherPerson({
      name: 'Test',
      surname: 'Aqa test',
      iban: 'MC5810096180790123456789085',
      friendName: 'Aqa test',
    })

    console.log('[TEST] ✅ Test completed!')
  })
})