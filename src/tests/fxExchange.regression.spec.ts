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
    }
  })

  // ── Error state — fresh form, GBP zero-balance wallet ───────────────────────

  it('FX-1.2 [Android] GBP (zero balance): insufficient-balance error shown and exchange button disabled', async function () {
    if (!browser.isAndroid) return this.skip()
    await fxExchangePage.selectFromWalletAndroid('GBP')
    await fxExchangePage.selectToWalletAndroid('EUR')
    await fxExchangePage.enterAmountAndroid(11)
    await fxExchangePage.verifyInsufficientBalanceErrorAndroid()
    await fxExchangePage.verifySubmitDisabledAndroid()
  })

  // ── Wallet selection + balance ───────────────────────────────────────────────

  it('FX-1.3 [Android] From wallet selector shows available balance after selecting EUR', async function () {
    if (!browser.isAndroid) return this.skip()
    await fxExchangePage.selectToWalletAndroid('USD')
    await fxExchangePage.verifyFromWalletBalanceDisplayedAndroid()
  })

  // ── Swap direction ───────────────────────────────────────────────────────────

  it('FX-1.4 [Android] Swap button reverses from/to wallets — EUR→USD becomes USD→EUR', async function () {
    if (!browser.isAndroid) return this.skip()
    await fxExchangePage.selectFromWalletAndroid('EUR')
    await fxExchangePage.selectToWalletAndroid('USD')
    await fxExchangePage.verifyFromWalletAndroid('EUR')
    await fxExchangePage.verifyToWalletAndroid('USD')
    await fxExchangePage.tapSwitchButtonAndroid()
    await fxExchangePage.verifyFromWalletAndroid('USD')
    await fxExchangePage.verifyToWalletAndroid('EUR')
  })

  // ── Other currency pairs ─────────────────────────────────────────────────────

  it('FX-1.5 [Android] EUR → GBP: exchange rate is calculated and displayed in to-amount field', async function () {
    if (!browser.isAndroid) return this.skip()
    await fxExchangePage.selectToWalletAndroid('GBP')
    await fxExchangePage.selectFromWalletAndroid('EUR')
    await fxExchangePage.enterAmountAndroid(11)
    await fxExchangePage.verifyToAmountCalculatedAndroid()
  })

  it('FX-1.6 [Android] EUR → CHF: to-amount recalculates when destination wallet changes', async function () {
    if (!browser.isAndroid) return this.skip()
    await fxExchangePage.selectToWalletAndroid('CHF')
    await fxExchangePage.enterAmountAndroid(11)
    await fxExchangePage.verifyToAmountCalculatedAndroid()
  })

  // ── Full exchange flow ───────────────────────────────────────────────────────

  it('FX-1.7 Complete EUR exchange', async function () {
    if (browser.isAndroid) {
      await fxExchangePage.completeExchangeAndroid('EUR', 'CHF', 11)
      return
    } else {
      await fxExchangePage.selectExchangePair(11)
      await fxExchangePage.submitExchange(11)
    }
    await fxExchangePage.verifyExchangeOnHome()
  })
})
