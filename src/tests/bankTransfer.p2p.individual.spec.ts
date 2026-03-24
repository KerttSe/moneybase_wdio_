import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import BankTransferP2PIndividualPage from '../pages/BankTransferP2PIndividualPage'
import { AUTH } from '../data/credentials'

describe('Bank Transfer - Individual', () => {
  const loginPage = new LoginPage()

  beforeEach(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('Send P2P by slide (11 EUR)', async function () {
    if (!(browser.isAndroid || browser.isIOS)) this.skip()

    console.log('[TEST] Starting P2P test...')

    // loginFlow вже повинен залогінити, але дамо час стабілізуватись
    await browser.pause(2000)

    console.log('[TEST] Ensuring individual account...')
    await BankTransferP2PIndividualPage.ensureIndividualAccount()

    console.log('[TEST] Sending P2P...')
    if (browser.isAndroid) {
      await BankTransferP2PIndividualPage.sendP2PBySlideAndroid(11)
    } else {
      await BankTransferP2PIndividualPage.sendP2PBySlideIOS(11)
    }

    console.log('[TEST] ✅ Test completed!')
  })
})
