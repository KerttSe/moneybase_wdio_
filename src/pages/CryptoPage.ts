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

  /** CRYPTO-001: the avatar in the Crypto header opens the account menu for the current account. */
  async verifyAccountMenuFromAvatar(accountCode: string) {
    await this.scrollDashboardToTop()
    await this.tap(this.id('crypto_button_userAvatar'))
    await this.id('more_screen').waitForDisplayed({ timeout: 15000, timeoutMsg: 'CRYPTO-001: the avatar did not open the account menu' })
    await $(`//*[contains(@text,"${accountCode}")]`).waitForDisplayed({ timeout: 10000, timeoutMsg: `CRYPTO-001: the account menu does not show ${accountCode}` })
    for (const item of ['Personal Details', 'Settings', 'Log out']) {
      await this.text(item).waitForExist({ timeout: 5000, timeoutMsg: `CRYPTO-001: the account menu has no "${item}"` })
    }
    const close = $('//*[@content-desc="Close"]')
    if (await close.isDisplayed().catch(() => false)) await this.tap(close)
    else await browser.back()
    await this.dashboard.waitForDisplayed({ timeout: 15000 })
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
    // The dashboard widget hides itself once a watchlist is emptied in-session, so check the Watchlist screen.
    await this.openWatchlistScreen()
    await this.text('Your watchlist is empty.').waitForDisplayed({ timeout: 15000, timeoutMsg: 'CRYPTO-014: empty watchlist message missing' })
    await this.text('Browse Instruments').waitForDisplayed({ timeout: 5000, timeoutMsg: 'CRYPTO-014: Browse Instruments call to action missing' })
    await this.backToDashboard()
  }

  private async verifyWatchlistEmptyOnScreen(msg: string) {
    await this.openWatchlistScreen()
    await this.text('Your watchlist is empty.').waitForDisplayed({ timeout: 15000, timeoutMsg: msg })
    await this.backToDashboard()
  }

  private async verifyWatchlistHasOnScreen(name: string, msg: string) {
    await this.openWatchlistScreen()
    await this.watchlistRow(name).waitForDisplayed({ timeout: 15000, timeoutMsg: msg })
    await this.backToDashboard()
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
    if (await this.allCryptoScreen.isDisplayed().catch(() => false)) return
    if (!(await this.dashboard.isDisplayed().catch(() => false))) await this.backToDashboard()
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
    // The live price can tick between reading the estimate and the swap, so allow a 1% drift.
    const btc = (t: string) => Number(t.replace(/[^\d.]/g, ''))
    const swapped = await this.amountText()
    if (!(btc(estimate) > 0) || Math.abs(btc(swapped) - btc(estimate)) / btc(estimate) > 0.01) {
      throw new Error(`CRYPTO-032: swapped input "${swapped}" should match the previous estimate "${estimate}"`)
    }
    if (!/^≈\s*€/.test(await this.estimateText())) throw new Error('CRYPTO-032: after swap the estimate should be in EUR')
    await this.tap($('//*[@content-desc="Swap currencies"]'))
  }

  // Real key presses: setValue pastes the whole string and skips the field's input filter.
  private async typeAmount(value: string) {
    await this.amountInput.clearValue()
    await this.amountInput.click()
    await browser.pause(500)
    for (const ch of value) {
      await browser.pressKeyCode(ch === '.' ? 56 : 7 + Number(ch))
      await browser.pause(200)
    }
    await browser.pause(800)
  }

  /** CRYPTO-035: the amount keeps 2 decimals in EUR and the asset's 8 decimals in BTC. */
  async verifyAmountPrecision() {
    await this.typeAmount('12.3456')
    if ((await this.amountText()) !== '€ 12.34') throw new Error(`CRYPTO-035: EUR amount should stop at 2 decimals, got "${await this.amountText()}"`)
    await this.typeAmount('1')
    await browser.hideKeyboard().catch(() => {})
    await this.tap($('//*[@content-desc="Swap currencies"]'))
    await browser.waitUntil(async () => (await this.amountText()).startsWith('BTC'), {
      timeout: 10000, interval: 500, timeoutMsg: 'CRYPTO-035: swap did not switch the input to BTC',
    })
    await this.typeAmount('0.123456789')
    if ((await this.amountText()) !== 'BTC 0.12345678') throw new Error(`CRYPTO-035: BTC amount should stop at 8 decimals, got "${await this.amountText()}"`)
    await browser.hideKeyboard().catch(() => {})
    await this.tap($('//*[@content-desc="Swap currencies"]'))
    await browser.waitUntil(async () => (await this.amountText()).startsWith('€'), {
      timeout: 10000, interval: 500, timeoutMsg: 'CRYPTO-035: swap did not switch the input back to EUR',
    })
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

  /* ---------- sort, watchlist star and the Watchlist screen ---------- */

  private get watchlistScreen() { return this.id('watchlist_screen') }
  private get watchlistSearch() { return this.id('watchlist_input_search') }
  private watchlistRows() { return $$('//*[contains(@resource-id,"watchlist_widget_item")]') }
  private watchlistRow(name: string) {
    return $(`(//*[starts-with(@content-desc,"${name}:")]/ancestor-or-self::*[@clickable="true"][1] | //*[starts-with(@content-desc,"${name}:")])[1]`)
  }

  private async backToDashboard() {
    for (let i = 0; i < 4 && !(await this.dashboard.isDisplayed().catch(() => false)); i += 1) {
      await browser.back()
      await browser.pause(1200)
    }
    await this.dashboard.waitForDisplayed({ timeout: 10000 })
  }

  async openWatchlistScreen() {
    await this.backToDashboard()
    await this.scrollDashboardToTop()
    await this.tap(this.id('crypto_dashboard_market_btn'))
    await this.watchlistScreen.waitForDisplayed({ timeout: 15000 })
  }

  private async swipeRowLeft(row: ChainableElement) {
    const loc = await row.getLocation()
    const size = await row.getSize()
    const y = Math.round(loc.y + size.height / 2)
    await browser.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: Math.round(loc.x + size.width * 0.85), y }).down().pause(100)
      .move({ duration: 400, x: Math.round(loc.x + size.width * 0.15), y }).up().perform()
    await browser.pause(800)
  }

  private async tapRemoveFromWatchlist() {
    // The swipe reveals a remove icon; tapping it asks "Remove from Watchlist" with CANCEL / OK.
    const icon = $('(//*[@content-desc="Remove from watchlist"])[last()]')
    await icon.waitForDisplayed({ timeout: 5000 })
    await this.tapAndroidCenterPoint(icon)
    const ok = $('//*[@resource-id="android:id/button1" or (@text="OK" and contains(@resource-id,"button1"))]')
    await this.text('Remove from Watchlist').waitForDisplayed({ timeout: 10000, timeoutMsg: 'Remove confirmation did not appear' })
    await this.tapAndroidCenterPoint(ok)
    await ok.waitForDisplayed({ reverse: true, timeout: 10000 })
    await this.watchlistScreen.waitForDisplayed({ timeout: 10000 })
    await browser.pause(1500)
  }

  /** Leaves the watchlist empty so the empty-state checks do not depend on an earlier run. */
  async clearWatchlist() {
    await this.openWatchlistScreen()
    await browser.waitUntil(async () =>
      (await this.watchlistRows().length) > 0 || (await this.text('Your watchlist is empty.').isDisplayed().catch(() => false)),
    { timeout: 15000, interval: 500, timeoutMsg: 'Watchlist screen did not load its list or empty state' })
    for (let i = 0; i < 10 && (await this.watchlistRows().length) > 0; i += 1) {
      await this.swipeRowLeft($('(//*[contains(@resource-id,"watchlist_widget_item")])[1]'))
      await this.tapRemoveFromWatchlist()
      await browser.pause(1500)
    }
    if ((await this.watchlistRows().length) > 0) throw new Error('Could not clear the crypto watchlist')
    await this.backToDashboard()
  }


  private async allCryptoOrder() {
    return (await $$('//*[contains(@resource-id,"allCrypto_list")]//*[contains(@content-desc,", price ")]').map((el) => el.getAttribute('content-desc')))
      .map((desc) => desc.split(',')[1].trim())
  }

  /** CRYPTO-021: the sort menu defaults to Volume descending; Price reorders and a second tap flips it. */
  async verifyAllCryptoSort() {
    await this.allCryptoSearch.clearValue().catch(() => {})
    await browser.hideKeyboard().catch(() => {})
    await browser.pause(1500)
    const byVolume = await this.allCryptoOrder()
    await this.tap(this.id('allCrypto_button_filter'))
    await this.text('Volume').waitForDisplayed({ timeout: 10000 })
    await this.text('Descending').waitForDisplayed({ timeout: 5000, timeoutMsg: 'CRYPTO-021: default sort should be Volume, Descending' })
    await this.tap(this.clickableWithText('Price'))
    await browser.waitUntil(async () => (await this.allCryptoOrder()).join() !== byVolume.join(), {
      timeout: 15000, interval: 500, timeoutMsg: 'CRYPTO-021: sorting by Price did not reorder All Crypto',
    })
    const byPrice = await this.allCryptoOrder()
    await this.tap(this.id('allCrypto_button_filter'))
    await this.tap(this.clickableWithText('Price'))
    await browser.waitUntil(async () => (await this.allCryptoOrder()).join() !== byPrice.join(), {
      timeout: 15000, interval: 500, timeoutMsg: 'CRYPTO-021: tapping Price again did not flip the order',
    })
  }

  private get starButton() {
    // Details toolbar: Back, title, then the watchlist star (Compose button without a label).
    return $('(//android.widget.Button[@clickable="true"])[2]')
  }

  private async openBitcoinDetailsFromAllCrypto() {
    await this.searchAllCrypto('btc')
    await this.tap(this.allCryptoRow('Bitcoin', 'BTC'))
    await this.detailScreen.waitForDisplayed({ timeout: 15000 })
  }

  /** CRYPTO-023: the star adds the asset to the watchlist and a second tap removes it. */
  async verifyWatchlistStarToggle() {
    await this.openBitcoinDetailsFromAllCrypto()
    await this.tap(this.starButton)
    await browser.pause(1500)
    await this.verifyWatchlistHasOnScreen('Bitcoin', 'CRYPTO-023: the star did not add Bitcoin to the watchlist')

    await this.openAllCrypto()
    await this.openBitcoinDetailsFromAllCrypto()
    await this.tap(this.starButton)
    await browser.pause(1500)
    await this.verifyWatchlistEmptyOnScreen('CRYPTO-023: a second star tap did not remove Bitcoin')

    // Leave Bitcoin in the watchlist for the Watchlist screen checks.
    await this.openAllCrypto()
    await this.openBitcoinDetailsFromAllCrypto()
    await this.tap(this.starButton)
    await browser.pause(1500)
  }

  private addToggle(pair: string, state: 'Add' | 'Remove') {
    return $(state === 'Add' ? `//*[@content-desc="Add ${pair} to watchlist"]` : `//*[@content-desc="Remove ${pair} from watchlist"]`)
  }

  private async openAddToWatchlist(query: string) {
    await this.openWatchlistScreen()
    await this.tap(this.id('watchlist_button_add_to_watchlist'))
    await this.id('add_to_watchlist_screen').waitForDisplayed({ timeout: 15000, timeoutMsg: 'Add to watchlist screen did not open' })
    const search = this.id('add_to_watchlist_input_search')
    await search.click()
    await search.setValue(query)
    await browser.hideKeyboard().catch(() => {})
    await browser.pause(1500)
  }

  /** CRYPTO-047: on Add to watchlist a pair toggles between + and checked, and the watchlist follows. */
  async verifyAddToWatchlistToggle() {
    const pair = 'Ethereum / Euro'
    await this.openAddToWatchlist('eth')
    await this.tap(this.addToggle(pair, 'Add'))
    await this.addToggle(pair, 'Remove').waitForDisplayed({ timeout: 10000, timeoutMsg: `CRYPTO-047: ${pair} did not switch to added` })
    await this.tap(this.addToggle(pair, 'Remove'))
    await this.addToggle(pair, 'Add').waitForDisplayed({ timeout: 10000, timeoutMsg: `CRYPTO-047: a second tap did not remove ${pair}` })
    await this.tap(this.addToggle(pair, 'Add'))
    await this.addToggle(pair, 'Remove').waitForDisplayed({ timeout: 10000 })
    await this.verifyWatchlistHasOnScreen('Ethereum', `CRYPTO-047: ${pair} is not on the watchlist after adding it`)

    await this.openAddToWatchlist('eth')
    await this.tap(this.addToggle(pair, 'Remove'))
    await this.addToggle(pair, 'Add').waitForDisplayed({ timeout: 10000 })
    await this.openWatchlistScreen()
    await this.watchlistRow('Bitcoin').waitForDisplayed({ timeout: 15000 })
    await this.watchlistRow('Ethereum').waitForDisplayed({ reverse: true, timeout: 10000, timeoutMsg: `CRYPTO-047: ${pair} stayed on the watchlist after removing it` })
    await this.backToDashboard()
  }

  /** CRYPTO-049/048: search filters the watchlist; swipe left and Remove deletes the item. */
  async verifyWatchlistSearchAndSwipeDelete() {
    await this.openWatchlistScreen()
    await this.watchlistRow('Bitcoin').waitForDisplayed({ timeout: 15000, timeoutMsg: 'Bitcoin is not on the Watchlist screen' })
    await this.watchlistSearch.click()
    await this.watchlistSearch.setValue('sol')
    await browser.hideKeyboard().catch(() => {})
    await this.text('No results found').waitForDisplayed({ timeout: 10000, timeoutMsg: 'CRYPTO-049: "sol" should not match a Bitcoin-only watchlist' })
    await this.watchlistSearch.clearValue()
    await this.watchlistSearch.setValue('btc')
    await browser.hideKeyboard().catch(() => {})
    await this.watchlistRow('Bitcoin').waitForDisplayed({ timeout: 10000, timeoutMsg: 'CRYPTO-049: "btc" did not find Bitcoin' })
    await this.watchlistSearch.clearValue()
    await browser.hideKeyboard().catch(() => {})
    await browser.pause(1000)

    await this.swipeRowLeft(this.watchlistRow('Bitcoin'))
    await this.tapRemoveFromWatchlist()
    await this.watchlistRow('Bitcoin').waitForDisplayed({ reverse: true, timeout: 10000, timeoutMsg: 'CRYPTO-048: Bitcoin stayed on the watchlist after Remove' })
    await this.text('Your watchlist is empty.').waitForDisplayed({ timeout: 10000, timeoutMsg: 'CRYPTO-048: watchlist is not empty after Remove' })
    await this.backToDashboard()
  }
}

type ChainableElement = ReturnType<typeof $>

export default new CryptoPage()
