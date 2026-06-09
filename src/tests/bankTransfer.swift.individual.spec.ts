import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import BankTransferP2PIndividualPage from '../pages/BankTransferP2PIndividualPage'
import { AUTH } from '../data/credentials'

describe('Bank Transfer - Individual - SWIFT', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()

  beforeEach(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('Send SWIFT by slide (11)', async function () {
    if (!browser.isAndroid) this.skip()

    console.log('[TEST] Starting SWIFT test...')

    await browser.pause(2000)

    console.log('[TEST] Ensuring individual account...')
    await BankTransferP2PIndividualPage.ensureIndividualAccount()

    console.log('[TEST] Sending SWIFT...')
    await BankTransferP2PIndividualPage.sendSwiftBySlideAndroid(11)

    console.log('[TEST] SWIFT test completed!')
  })
})
