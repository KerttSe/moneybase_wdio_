import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import sepaPage from '../../../pages/BankTransferSepaIndividualPage'

describe('SEPA amount rules', function () {
  it('[TC3274/TC3276/TC3278] Checks digit cap, minimum amount and Instant timing hint', async function () {
    await loginPage.loginFlow(AUTH)
    await sepaPage.verifySepaAmountRules()
  })
})
