import { AUTH } from '../data/credentials'
import { loginPage } from '../pages/LoginPage'
import page from '../pages/CrossBorderPaymentPage'

describe('PAY-015 [TC3286] Cancel SWIFT fee selection', function () {
  it('Preserves Shared Fee after closing the picker', async function () {
    await loginPage.loginFlow(AUTH)
    await page.verifyClosingFeePickerPreservesFee()
  })
})
