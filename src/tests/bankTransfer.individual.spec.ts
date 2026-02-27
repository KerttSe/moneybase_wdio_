import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import BankTransferIndividualPage from '../pages/BankTransferIndividualPage'
import { AUTH } from '../data/credentials'

describe('Bank Transfer - Individual', () => {
  const loginPage = new LoginPage()

  beforeEach(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('Android: send P2P by slide (11 EUR)', async function () {
  if (!browser.isAndroid) this.skip()

  console.log('[TEST] Starting P2P test...')
  
  // loginFlow вже повинен залогінити, але дамо час стабілізуватись
  await browser.pause(2000)
  
  console.log('[TEST] Ensuring individual account...')
  await BankTransferIndividualPage.ensureIndividualAccount()
  
  console.log('[TEST] Sending P2P...')
  await BankTransferIndividualPage.sendP2PBySlideAndroid(11)
  
  console.log('[TEST] ✅ Test completed!')
})
})
