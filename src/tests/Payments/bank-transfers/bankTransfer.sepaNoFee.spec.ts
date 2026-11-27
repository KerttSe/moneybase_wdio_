import { browser } from '@wdio/globals'
import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import page from '../../../pages/BankTransferSepaIndividualPage'
import vop from '../../../pages/VopPage'

describe('PAY-008 [TC3279] SEPA transfer fee', function () {
  it('Shows zero fee or no fee row on review', async function () {
    await loginPage.loginFlow(AUTH)
    await page.openSepaToReview(11)
    // TC3279 is about the fee on review. On iOS the fixture payee (a Moneybase MMEB IBAN) goes straight to
    // review without VOP, so VOP is optional here; the fee check below still has to pass.
    if (browser.isIOS) await vop.waitForVopScreen(8000).catch(() => console.warn('[sepaNoFee] no VOP screen on iOS; checking the fee on review'))
    else await vop.waitForVopScreen()
    await page.verifyNoFeeInSepaReview()
  })
})
