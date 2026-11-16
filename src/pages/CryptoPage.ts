import BasePage from './BasePage'
import { $, $$, browser } from '@wdio/globals'

/**
 * Crypto tab (Android 2.27.0, Compose). Covers Crypto Home widgets, the valuation currency picker,
 * All Crypto search, asset details and the Buy screen up to (not including) the order quote.
 * Review Order is not exercised: the staging quote endpoint answers "Something went wrong".
 */
class CryptoPage extends BasePage {
  private id(name: string) {
    return $(`(//*[@resource-id="com.moneybase.qa:id/${name}"] | //*[@resource-id="${name}"] | //*[contains(@resource-id,"${name}")])[1]`)
  }

  private text(value: string) {
    return $(`(//*[@text="${value}" or @content-desc="${value}"])[1]`)
  }

  private clickableWithText(value: string) {
    return $(`(//*[@text="${value}" or @content-desc="${value}"]/ancestor-or-self::*[@clickable="true"][1])[1]`)
  }

  private get dashboard() { return this.id('crypto_dashboard') }
  private get cryptoTab() { return this.id('navigation_button_crypto') }
  private get allCryptoScreen() { return this.id('allCrypto_screen') }
  private get allCryptoSearch() { return this.id('allCrypto_input_search') }
  private get detailScreen() { return this.id('cryptoAssetDetail_screen') }
  private get tradingScreen() { return this.id('instrumentTrading_screen') }
  private get amountInput() { return this.id('trading_currency_amount_input') }
  private get allCryptoViewAll() {
    return $('//*[contains(@resource-id,"all_crypto_widget") and not(contains(@resource-id,"view_all"))]//*[contains(@resource-id,"all_crypto_widget_view_all")]')
  }

  private async swipeUp() {
    const { width, height } = await browser.getWindowSize()
    await browser.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: Math.round(width / 2), y: Math.round(height * 0.75) }).down().pause(100)
      .move({ duration: 500, x: Math.round(width / 2), y: Math.round(height * 0.3) }).up().perform()
    await browser.pause(1000)
  }

  private async swipeDown() {
    const { width, height } = await browser.getWindowSize()
    await browser.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: Math.round(width / 2), y: Math.round(height * 0.3) }).down().pause(100)
      .move({ duration: 500, x: Math.round(width / 2), y: Math.round(height * 0.8) }).up().perform()
    await browser.pause(800)
  }

  private async scrollTo(el: ChainableElement, maxSwipes = 6) {
    for (let i = 0; i < maxSwipes && !(await el.isDisplayed().catch(() => false)); i += 1) await this.swipeUp()
    await el.waitForDisplayed({ timeout: 5000 })
  }

  private async scrollDashboardToTop() {
    for (let i = 0; i < 6 && !(await this.id('crypto_button_walletSelector').isDisplayed().catch(() => false)); i += 1) await this.swipeDown()
  }

  async openCryptoTab() {
    await this.cryptoTab.waitForDisplayed({ timeout: 20000, timeoutMsg: 'Crypto tab is not in the bottom navigation' })
    await this.tap(this.cryptoTab)
    await this.dashboard.waitForDisplayed({ timeout: 30000, timeoutMsg: 'Crypto dashboard did not open' })
    await this.scrollDashboardToTop()
  }

  /** CRYPTO-009/014 and the empty portfolio state on an account without crypto. */
  async verifyEmptyPortfolioState() {
    await this.text('Buy Crypto').waitForDisplayed({ timeout: 15000 })
    await $('//*[contains(@text,"Your portfolio is empty") or contains(@content-desc,"Your portfolio is empty")]').waitForDisplayed({ timeout: 10000 })
    await this.text('No crypto activity yet').waitForExist({ timeout: 10000 })
    await this.scrollTo(this.text('No crypto holdings yet.'))
    if (await this.id('holdings_widget').isExisting().catch(() => false)) {
      throw new Error('CRYPTO-009: Holdings widget should be hidden when the user holds no crypto')
    }
  }

  private async tradeGridTickers() {
    const grid = '//*[contains(@resource-id,"trade_widget_crypto_grid")]'
    const texts = await $$(`${grid}//android.widget.TextView`).map((el) => el.getText())
    return texts.filter((t) => /^[A-Za-z0-9 ]{2,}$/.test(t) && !/^Price (up|down)$/.test(t) && t !== 'A')
  }

  /** CRYPTO-012: switching Top Gainers/Losers and 1H/24H reloads the Trade grid. */
  async verifyTradeWidgetSwitches() {
    await this.scrollDashboardToTop()
    await this.scrollTo(this.id('trade_widget_crypto_grid'))
    const gainers = await this.tradeGridTickers()
    if (gainers.length === 0) throw new Error('Trade grid is empty on Top Gainers')
    await this.tap(this.id('trade_widget_loser_tab'))
    await browser.waitUntil(async () => (await this.tradeGridTickers()).join() !== gainers.join(), {
      timeout: 30000, interval: 1000, timeoutMsg: 'CRYPTO-012: Top Losers did not change the Trade grid',
    })
    await this.tap(this.id('trade_widget_time_1h'))
    await browser.pause(1500)
    if ((await this.tradeGridTickers()).length === 0) throw new Error('CRYPTO-012: Trade grid is empty after switching to 1 Hour')
    await this.tap(this.id('trade_widget_gainer_tab'))
    await this.tap(this.id('trade_widget_time_24h'))
  }

  /** CRYPTO-013: Trending shows five assets with prices. */
  async verifyTrendingTopFive() {
    await this.scrollTo(this.text('The crypto with the largest amount of trades on Moneybase during the selected timeframe.'))
    const items = await $$('//*[contains(@resource-id,"trending_widget_item")]').length
    if (items !== 5) throw new Error(`CRYPTO-013: Trending should list 5 assets, found ${items}`)
  }

  /** CRYPTO-014: an empty watchlist shows its message and a Browse Instruments call to action. */
  async verifyEmptyWatchlistWidget() {
    await this.scrollTo(this.text('Your watchlist is empty.'))
    await this.scrollTo(this.text('Browse Instruments'), 2)
  }

  /** CRYPTO-007/024: the valuation currency picker offers EUR, GBP and USD only. */
  async verifyValuationCurrencies() {
    await this.scrollDashboardToTop()
    await this.tap(this.id('crypto_button_walletSelector'))
    await this.id('cryptoWalletSelector_screen').waitForDisplayed({ timeout: 10000 })
    const codes = new Set(
      (await $$('//*[contains(@resource-id,"cryptoWalletSelector_screen")]//android.widget.TextView').map((el) => el.getText()))
        .filter((t) => /^[A-Z]{3}$/.test(t)),
    )
    const expected = ['EUR', 'GBP', 'USD']
    if ([...codes].sort().join() !== expected.join()) {
      throw new Error(`Valuation currencies should be ${expected.join(', ')}, got ${[...codes].join(', ')}`)
    }
    await this.tap(this.id('cryptoWalletSelector_button_close'))
    await this.id('cryptoWalletSelector_screen').waitForDisplayed({ reverse: true, timeout: 10000 })
  }

  async openAllCrypto() {
    await this.scrollTo(this.allCryptoViewAll, 8)
    await this.tap(this.allCryptoViewAll)
    await this.allCryptoScreen.waitForDisplayed({ timeout: 15000 })
  }

  private async searchAllCrypto(query: string) {
    await this.allCryptoSearch.click()
    await this.allCryptoSearch.setValue(query)
    await browser.hideKeyboard().catch(() => {})
    await browser.pause(1500)
  }

  private allCryptoRow(name: string, code: string) {
    return $(`//*[contains(@resource-id,"allCrypto_list")]//*[starts-with(@content-desc,"${name}, ${code},")]`)
  }

  /** CRYPTO-019/020: search matches code or name case-insensitively; nonsense shows no rows. */
  async verifyAllCryptoSearch() {
    for (const query of ['btc', 'Bitcoin', 'bItCoIn']) {
      await this.searchAllCrypto(query)
      await this.allCryptoRow('Bitcoin', 'BTC').waitForDisplayed({ timeout: 10000, timeoutMsg: `CRYPTO-019: "${query}" did not find Bitcoin` })
    }
    await this.searchAllCrypto('zzzznotanasset')
    await browser.waitUntil(async () => (await $$('//*[contains(@resource-id,"allCrypto_list")]//*[contains(@content-desc,", price ")]').length) === 0, {
      timeout: 10000, interval: 500, timeoutMsg: 'CRYPTO-020: a nonsense query still listed assets',
    })
  }

  /** Opens Bitcoin from All Crypto. CRYPTO-027: no "My Holding" for an asset the user does not own. */
  async openBitcoinDetailsWithoutHolding() {
    await this.searchAllCrypto('btc')
    await this.tap(this.allCryptoRow('Bitcoin', 'BTC'))
    await this.detailScreen.waitForDisplayed({ timeout: 15000 })
    await this.text('Statistics').waitForExist({ timeout: 15000 })
    for (let i = 0; i < 2; i += 1) {
      if (await this.text('My Holding').isExisting().catch(() => false)) {
        throw new Error('CRYPTO-027: "My Holding" is shown for an asset the user does not own')
      }
      await this.swipeUp()
    }
  }

  /** CRYPTO-022: Buy on the details screen opens the Buy screen for that asset. */
  async openBuyFromDetails() {
    await this.tap(this.clickableWithText('Buy'))
    await this.tradingScreen.waitForDisplayed({ timeout: 15000 })
    await this.text('Buy Bitcoin').waitForDisplayed({ timeout: 10000, timeoutMsg: 'CRYPTO-022: Buy did not open "Buy Bitcoin"' })
  }

  private async amountText() {
    return (await this.amountInput.getText().catch(() => '')).trim()
  }

  private async estimateText() {
    const texts = await $$('//*[contains(@resource-id,"instrumentTrading_screen")]//android.widget.TextView').map((el) => el.getText())
    return texts.find((t) => t.startsWith('≈')) ?? ''
  }

  /** Buy entry: a fiat amount shows a crypto estimate; swap moves the estimate into the input (CRYPTO-032). */
  async verifyBuyEstimateAndSwap() {
    await this.amountInput.click()
    await this.amountInput.setValue('100')
    await browser.hideKeyboard().catch(() => {})
    await browser.waitUntil(async () => /^≈\s*BTC\s+0\.\d+/.test(await this.estimateText()), {
      timeout: 10000, interval: 500, timeoutMsg: 'A €100 Buy amount did not show a BTC estimate',
    })
    const estimate = (await this.estimateText()).replace(/^≈\s*/, '')
    await this.tap($('//*[@content-desc="Swap currencies"]'))
    await browser.waitUntil(async () => (await this.amountText()).startsWith('BTC'), {
      timeout: 10000, interval: 500, timeoutMsg: 'CRYPTO-032: swap did not switch the input to BTC',
    })
    if ((await this.amountText()) !== estimate) {
      throw new Error(`CRYPTO-032: swapped input "${await this.amountText()}" should equal the previous estimate "${estimate}"`)
    }
    if (!/^≈\s*€/.test(await this.estimateText())) throw new Error('CRYPTO-032: after swap the estimate should be in EUR')
    await this.tap($('//*[@content-desc="Swap currencies"]'))
  }

  /** CRYPTO-044/045: the wallet picker lists All Wallets and each currency; picking USD sets it. */
  async verifySettlementWalletPicker() {
    const chip = $('(//*[contains(@text," • ") or contains(@content-desc," • ")]/ancestor-or-self::*[@clickable="true"][1])[1]')
    await this.tap(chip)
    await this.text('Select Wallet').waitForDisplayed({ timeout: 10000 })
    await this.text('All Wallets').waitForDisplayed({ timeout: 5000 })
    await this.tap(this.clickableWithText('US Dollar'))
    await this.text('Select Wallet').waitForDisplayed({ reverse: true, timeout: 10000 })
    await $('//*[starts-with(@text,"USD •") or starts-with(@content-desc,"USD •")]').waitForDisplayed({
      timeout: 10000, timeoutMsg: 'CRYPTO-045: the wallet chip did not switch to USD',
    })
    await this.tap(chip)
    await this.tap(this.clickableWithText('All Wallets'))
    await this.text('Select Wallet').waitForDisplayed({ reverse: true, timeout: 10000 })
    await $('//*[starts-with(@text,"USD •") or starts-with(@content-desc,"USD •")]').waitForDisplayed({
      reverse: true, timeout: 10000, timeoutMsg: 'CRYPTO-044: All Wallets did not clear the USD selection',
    })
  }

  async closeBuy() {
    await browser.back()
    await this.detailScreen.waitForDisplayed({ timeout: 10000 })
  }
}

type ChainableElement = ReturnType<typeof $>

export default new CryptoPage()
