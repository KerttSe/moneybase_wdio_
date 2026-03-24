import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import BankTransferSepaIndividualPage from '../pages/BankTransferSepaIndividualPage'
import { AUTH } from '../data/credentials'

describe('Bank Transfer - Individual - SEPA', () => {
  const loginPage = new LoginPage()

  beforeEach(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('Send SEPA by slide (11 EUR)', async function () {
    if (!(browser.isAndroid || browser.isIOS)) this.skip()

    console.log('[TEST] Starting SEPA test...')

    await browser.pause(2000)

    console.log('[TEST] Ensuring individual account...')
    await BankTransferSepaIndividualPage.ensureIndividualAccount()

    console.log('[TEST] Sending SEPA...')
    if (browser.isAndroid) {
      await BankTransferSepaIndividualPage.sendSepaBySlideAndroid(11)
    } else {
      await BankTransferSepaIndividualPage.sendSepaBySlideIOS(11)
    }

    console.log('[TEST] ✅ SEPA test completed!')
  })
})
