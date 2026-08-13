import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import FXExchangePage from '../pages/FXExchangePage'

describe('FX Exchange', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const fxExchangePage = new FXExchangePage()

  before(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await loginPage.loginFlow(AUTH)
    await fxExchangePage.openFromHome()
  })

  // ── Screen load ─────────────────────────────────────────────────────────────

  it('FX-1.1 Exchange screen loads and exchange form is visible', async function () {
    if (browser.isAndroid) {
      await fxExchangePage.verifyExchangeScreenVisibleAndroid()
    } else if (browser.isIOS) {
      await fxExchangePage.verifyExchangeScreenVisibleIOS()
    }
  })

  // ── Error state — fresh form, GBP zero-balance wallet ───────────────────────

  it('FX-1.2 GBP (zero balance): insufficient-balance error shown and exchange button disabled', async function () {
    if (browser.isAndroid) {
      await fxExchangePage.selectFromWalletAndroid('GBP')
      await fxExchangePage.selectToWalletAndroid('EUR')
      await fxExchangePage.enterAmountAndroid(11)
      await fxExchangePage.verifyInsufficientBalanceErrorAndroid()
      await fxExchangePage.verifySubmitDisabledAndroid()
    } else if (browser.isIOS) {
      await fxExchangePage.selectFromWalletIOS('GBP')
      await fxExchangePage.selectToWalletIOS('CHF')
      await fxExchangePage.enterAmountIOS(11)
      await fxExchangePage.verifyInsufficientBalanceErrorIOS()
      await fxExchangePage.verifySubmitDisabledIOS()
    } else {
      return this.skip()
    }
  })

  // ── Wallet selection + balance ───────────────────────────────────────────────

  it('FX-1.3 From wallet selector shows available balance', async function () {
    if (browser.isAndroid) {
      await fxExchangePage.selectToWalletAndroid('USD')
      await fxExchangePage.verifyFromWalletBalanceDisplayedAndroid()
    } else if (browser.isIOS) {
      await fxExchangePage.selectFromWalletIOS('EUR')
      await fxExchangePage.verifyFromWalletBalanceDisplayedIOS()
    } else {
      return this.skip()
    }
  })

  // ── Swap direction ───────────────────────────────────────────────────────────

  it('FX-1.4 Swap button reverses from/to wallets — EUR→USD becomes USD→EUR', async function () {
    if (browser.isAndroid) {
      await fxExchangePage.selectFromWalletAndroid('EUR')
      await fxExchangePage.selectToWalletAndroid('USD')
      await fxExchangePage.verifyFromWalletAndroid('EUR')
      await fxExchangePage.verifyToWalletAndroid('USD')
      await fxExchangePage.tapSwitchButtonAndroid()
      await fxExchangePage.verifyFromWalletAndroid('USD')
      await fxExchangePage.verifyToWalletAndroid('EUR')
    } else if (browser.isIOS) {
      await fxExchangePage.selectFromWalletIOS('EUR')
      await fxExchangePage.selectToWalletIOS('USD')
      await fxExchangePage.verifyFromWalletIOS('EUR')
      await fxExchangePage.verifyToWalletIOS('USD')
      await fxExchangePage.tapSwitchButtonIOS()
      await fxExchangePage.verifyFromWalletIOS('USD')
      await fxExchangePage.verifyToWalletIOS('EUR')
    } else {
      return this.skip()
    }
  })

  // ── Other currency pairs ─────────────────────────────────────────────────────

  it('FX-1.5 EUR → GBP: exchange rate is calculated and displayed in to-amount field', async function () {
    if (browser.isAndroid) {
      await fxExchangePage.selectToWalletAndroid('GBP')
      await fxExchangePage.selectFromWalletAndroid('EUR')
      await fxExchangePage.enterAmountAndroid(11)
      await fxExchangePage.verifyToAmountCalculatedAndroid()
    } else if (browser.isIOS) {
      await fxExchangePage.selectToWalletIOS('GBP')
      await fxExchangePage.selectFromWalletIOS('EUR')
      await fxExchangePage.enterAmountIOS(11)
      await fxExchangePage.verifyToAmountCalculatedIOS()
    } else {
      return this.skip()
    }
  })

  it('FX-1.6 EUR → CHF: to-amount recalculates when destination wallet changes', async function () {
    if (browser.isAndroid) {
      await fxExchangePage.selectToWalletAndroid('CHF')
      await fxExchangePage.enterAmountAndroid(11)
      await fxExchangePage.verifyToAmountCalculatedAndroid()
    } else if (browser.isIOS) {
      await fxExchangePage.selectToWalletIOS('CHF')
      await fxExchangePage.enterAmountIOS(11)
      await fxExchangePage.verifyToAmountCalculatedIOS()
    } else {
      return this.skip()
    }
  })

  // ── Full exchange flow ───────────────────────────────────────────────────────

  it('FX-1.7 Complete EUR exchange', async function () {
    if (browser.isAndroid) {
      await fxExchangePage.completeExchangeAndroid('EUR', 'CHF', 11)
      return
    } else if (browser.isIOS) {
      await fxExchangePage.completeExchangeIOS('EUR', 'CHF', 11)
      return
    } else {
      await fxExchangePage.selectExchangePair(11)
      await fxExchangePage.submitExchange(11)
    }
    await fxExchangePage.verifyExchangeOnHome()
  })
})
