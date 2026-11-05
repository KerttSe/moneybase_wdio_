import { AUTH } from '../data/credentials'
import { loginPage } from '../pages/LoginPage'
import page from '../pages/CrossBorderPaymentPage'

describe('PAY-017 [TC3288] SWIFT fee disclaimer', function () {
  it('[TC3288/TC3287] Checks the fee disclaimer and conditional exchange rate', async function () {
    await loginPage.loginFlow(AUTH)
    await page.verifySwiftFeeDisclaimer()
    await page.verifySwiftExchangeRateBreakdown()
  })
})
