import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import page from '../../../pages/BankTransferSepaIndividualPage'

describe('PAY-010 [TC3281] Payment reference limit', function () {
  it('Keeps the reference at 140 characters', async function () {
    await loginPage.loginFlow(AUTH)
    await page.verifyPaymentReferenceLimit()
  })
})
