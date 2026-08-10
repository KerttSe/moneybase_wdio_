import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import BankTransferSepaIndividualPage from '../pages/BankTransferSepaIndividualPage'
import VopPage from '../pages/VopPage'
import { AUTH } from '../data/credentials'

describe('VOP - SEPA (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()

  before(async function () {
    if (!browser.isAndroid) return this.skip()
    await loginPage.loginFlow(AUTH)
    await BankTransferSepaIndividualPage.openSepaToReviewPaymentAndroid(11)
  })

  it('VOP-1.1 VOP sheet is displayed after Review Payment', async function () {
    await VopPage.waitForVopScreen()
  })

  it('VOP-1.2 VOP close button is present', async function () {
    const visible = await VopPage.isCloseBtnVisible()
    if (!visible) throw new Error('VOP close button not found')
  })

  it('VOP-1.3 Close VOP sheet', async function () {
    await VopPage.close()
    const gone = await VopPage.isVopScreenVisible()
    if (gone) throw new Error('VOP sheet did not close')
  })
})
