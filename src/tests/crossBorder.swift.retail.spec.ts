import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import CrossBorderPaymentPage from '../pages/CrossBorderPaymentPage'

describe('Cross-Border Payment - SWIFT (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()

  before(async function () {
    if (!browser.isAndroid) return this.skip()
    await loginPage.loginFlow(AUTH)
    await CrossBorderPaymentPage.openToPaymentScreenAndroid(11)
  })

  it('CB-1.1 Bank transfer screen is displayed', async function () {
    await CrossBorderPaymentPage.verifyBankTransferScreenLoaded()
  })

  it('CB-1.2 "Pay from" wallet shows USD', async function () {
    await CrossBorderPaymentPage.verifyPayFromWalletCurrency('USD')
  })

  it('CB-1.3 Balance and fee are displayed', async function () {
    await CrossBorderPaymentPage.verifyBalanceFeeDisplayed()
  })

  it('CB-1.4 Fee row is displayed with default option', async function () {
    await CrossBorderPaymentPage.verifyFeeRowDisplayed()
  })

  it('CB-1.5 Fee picker bottom sheet is shown with both options', async function () {
    await CrossBorderPaymentPage.openFeePicker()
    await CrossBorderPaymentPage.verifyFeePickerDisplayed()
  })

  it('CB-1.6 Selecting Shared Fee splits cost between parties', async function () {
    await CrossBorderPaymentPage.selectFeeOption('SHA')
    await CrossBorderPaymentPage.verifyFeeTitle('Shared Fee')
  })

  it('CB-1.7 Review Payment button is present', async function () {
    await CrossBorderPaymentPage.verifyReviewPaymentBtnPresent()
  })

  it('CB-1.8 (TC2422) Switching source wallet recalculates balance and fee', async function () {
    await CrossBorderPaymentPage.openWalletPickerAndroid()
    await CrossBorderPaymentPage.selectWalletAndroid('EUR')
    await CrossBorderPaymentPage.verifyPayFromWalletCurrency('EUR')
    await CrossBorderPaymentPage.verifyBalanceFeeDisplayed()
    await CrossBorderPaymentPage.verifyFeeRowDisplayed()
    // Revert back to USD for subsequent tests (no-op if already USD)
    await CrossBorderPaymentPage.ensureWalletCurrencyAndroid('USD')
    await CrossBorderPaymentPage.verifyPayFromWalletCurrency('USD')
  })

  it('CB-1.9 (TC2421) Review Payment screen shows SWIFT payment details', async function () {
    await CrossBorderPaymentPage.tapReviewPaymentAndroid()
    await CrossBorderPaymentPage.verifyReviewScreenSwiftType()
  })

  it('CB-1.10 (TC505) Complete SWIFT payment and verify success', async function () {
    await CrossBorderPaymentPage.completeSwiftPaymentAndroid()
  })
})
