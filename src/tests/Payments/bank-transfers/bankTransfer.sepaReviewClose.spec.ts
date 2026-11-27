import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import page from '../../../pages/BankTransferSepaIndividualPage'
import vop from '../../../pages/VopPage'
import { browser } from '@wdio/globals'

describe('SEPA beneficiary and review', function () {
  it('[TC3321/TC3291] Copies beneficiary details and returns from review with the amount preserved', async function () {
    await loginPage.loginFlow(AUTH)
    await page.verifyBeneficiaryCopyAndOpenReview(11)
    if (browser.isIOS) await page.waitForSepaReviewIOS()
    else await vop.waitForVopScreen()
    await vop.close()
    await page.verifyReturningFromReviewPreservesAmount('11')
  })
})
