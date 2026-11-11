import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import page from '../../../pages/CrossBorderPaymentPage'

describe('SWIFT wallet selection', function () {
  it('[TC2920/TC2921] Ignores reselecting EUR and preserves it when closing the picker', async function () {
    await loginPage.loginFlow(AUTH)
    await page.verifyClosingWalletPickerPreservesWallet()
  })
})
