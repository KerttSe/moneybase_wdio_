import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import page from '../../../pages/BankTransferSepaIndividualPage'
import vop from '../../../pages/VopPage'

describe('PAY-008 [TC3279] SEPA transfer fee', function () {
  it('Shows zero fee or no fee row on review', async function () {
    await loginPage.loginFlow(AUTH)
    await page.openSepaToReview(11)
    await vop.waitForVopScreen()
    await page.verifyNoFeeInSepaReview()
  })
})
