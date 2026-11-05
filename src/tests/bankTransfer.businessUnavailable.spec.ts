import { browser } from '@wdio/globals'
import { AUTH } from '../data/credentials'
import BankTransferBusinessPage from '../pages/BankTransferBusinessPage'
import { loginPage } from '../pages/LoginPage'

describe('Bank Transfer - Unavailable Business Pay', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))

  it('[TC3079] Shows Coming soon and blocks access to Pay', async function () {
    if (!browser.isAndroid || process.env.MB_RUN_BUSINESS_PAY_UNAVAILABLE !== 'true') return this.skip()

    await loginPage.loginFlow(AUTH)
    await BankTransferBusinessPage.verifyUnavailableBusinessPayAndroid()
  })
})
