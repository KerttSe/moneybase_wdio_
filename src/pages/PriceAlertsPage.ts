import BasePage from './BasePage'
import { $, $$, browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'

type WdioEl = ChainablePromiseElement

type CreatePriceAlertParams = {
  instrumentQuery: string
  // Optional: if the UI has a dedicated price/threshold field we can fill.
  thresholdValue?: string
  // Optional: if the UI has a date/valid-until field we can fill.
  dateValue?: string
  // Optional: iOS row a11y id in the alerts list (e.g. "BMW i").
  rowA11yIdIOS?: string
}

export default class PriceAlertsPage extends BasePage {
  private async tapIOSDisplayed(el: WdioEl | WebdriverIO.Element, timeout = 10000) {
    const resolved = (await el) as WebdriverIO.Element
    await resolved.waitForDisplayed({ timeout })
    const loc = await resolved.getLocation()
    const size = await resolved.getSize()
    const x = Math.round(loc.x + size.width / 2)
    const y = Math.round(loc.y + size.height / 2)
    await browser.execute('mobile: tap', { x, y })
  }

  private async focusSearchInstrumentIOS() {
    // iOS flake: first tap on Search Instrument can “bounce” back.
    // We keep the same locators and simply retry by re-opening Price Alerts.
    const searchCandidates = [this.searchInstrumentTextFieldIOS, this.searchInstrumentInputIOS]

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      await this.openPriceAlertsIOS()
      await this.goToNewTabIOS()

      const input = await this.getFirstDisplayed(searchCandidates, 'Search Instrument input (iOS)')
      await this.tapIOSDisplayed(input, 20000)
      await browser.pause(350)

      const stillOnScreen = await this.waitForAnyDisplayed(searchCandidates, 4000, 'Search Instrument input after tap (iOS)')
        .then(() => true)
        .catch(() => false)

      if (stillOnScreen) return input

      if (attempt < 2) {
        await browser.pause(650)
      }
    }

    await this.debugSnapshot('price-alerts-ios-search-bounced-after-tap')
    throw new Error('Search Instrument did not stay open after tap (iOS)')
  }

  private byIdAndroid(name: string) {
    const rx = `.*:id/${name}$|^${name}$`
    return $(`android=new UiSelector().resourceIdMatches("${rx}")`)
  }

  private iosA11y(id: string) {
    return $(`~${id}`)
  }

  private iosPredicate(predicate: string) {
    return $(`-ios predicate string:${predicate}`)
  }

  private iosClassChain(chain: string) {
    return $(`-ios class chain:${chain}`)
  }

  private androidText(text: string) {
    return $(`android=new UiSelector().text("${text}")`)
  }

  private androidTextContains(text: string) {
    return $(`android=new UiSelector().textContains("${text}")`)
  }

  private androidDescContains(text: string) {
    return $(`android=new UiSelector().descriptionContains("${text}")`)
  }

  private async waitForAnyDisplayed(candidates: Array<WdioEl | WebdriverIO.Element>, timeout = 10000, label = 'element') {
    await browser.waitUntil(
      async () => {
        for (const el of candidates) {
          const resolved = (await el) as WebdriverIO.Element
          if (await resolved.isDisplayed().catch(() => false)) return true
        }
        return false
      },
      {
        timeout,
        interval: 500,
        timeoutMsg: `${label} did not appear`,
      }
    )
  }

  private async tapFirstDisplayed(candidates: Array<WdioEl | WebdriverIO.Element>, label = 'element') {
    for (const el of candidates) {
      const resolved = (await el) as WebdriverIO.Element
      const visible = await resolved.isDisplayed().catch(() => false)
      if (visible) {
        await resolved.click()
        return
      }
    }

    throw new Error(`${label} did not appear`)
  }

  private async getFirstDisplayed(candidates: Array<WdioEl | WebdriverIO.Element>, label = 'element') {
    for (const el of candidates) {
      const resolved = (await el) as WebdriverIO.Element
      const visible = await resolved.isDisplayed().catch(() => false)
      if (visible) return resolved
    }

    throw new Error(`${label} did not appear`)
  }

  private get investTabAndroid() {
    return this.byIdAndroid('navigation_button_invest')
  }

  private get investTabIOS() {
    return this.iosA11y('Invest')
  }

  private get priceAlertsEntryIOS() {
    return this.iosA11y('Price Alerts')
  }

  private get overviewTabIOS() {
    return this.iosA11y('Overview')
  }

  private get newTabIOS() {
    return this.iosA11y('New')
  }

  private get priceAlertsEntryIOSByStaticText() {
    return this.iosClassChain('**/XCUIElementTypeStaticText[`label == "Price Alerts" OR name == "Price Alerts"`]')
  }

  private get priceAlertsEntryIOSByXpathStaticText() {
    return $('//XCUIElementTypeStaticText[@name="Price Alerts" or @label="Price Alerts" or @value="Price Alerts"]')
  }

  private get priceAlertsTileIOSByXpathAncestor() {
    // In the provided pageSource the tile container is XCUIElementTypeOther (accessible=false) wrapping a StaticText.
    // Tapping the ancestor container is more reliable than tapping the StaticText itself.
    return $('//XCUIElementTypeStaticText[@name="Price Alerts" or @label="Price Alerts" or @value="Price Alerts"]/parent::XCUIElementTypeOther/parent::XCUIElementTypeOther')
  }

  private get priceAlertsEntryIOSByPredicateContains() {
    return this.iosPredicate('label CONTAINS[c] "Price Alerts" OR name CONTAINS[c] "Price Alerts"')
  }

  private get searchInstrumentInputIOS() {
    return this.iosA11y('Search Instrument')
  }

  private get searchInstrumentTextFieldIOS() {
    // In pageSource there is a visible XCUIElementTypeTextField (accessible=true) with empty label.
    return this.iosPredicate('type == "XCUIElementTypeTextField" AND visible == 1')
  }

  private get backBtnIOS() {
    return this.iosA11y('Back')
  }

  private get plusOnePercentOptionIOS() {
    return this.iosA11y('+1%')
  }

  private get deleteBtnIOS() {
    return this.iosA11y('Delete')
  }

  private get addNewPriceAlertAnchorIOS() {
    return this.iosA11y('Add a New Price Alert')
  }

  private get mainContainerIOSByClassChain() {
    return this.iosClassChain('**/XCUIElementTypeOther[`name == "основний"`]/XCUIElementTypeOther[10]')
  }

  private get mainContainerIOSByXpath() {
    return $('//XCUIElementTypeOther[@name="основний"]/XCUIElementTypeOther[10]')
  }

  private get priceAlertsEntryAndroid() {
    return this.androidText('Price Alerts')
  }

  private get priceAlertsEntryAndroidByXpathAncestor() {
    return $('//android.widget.TextView[@text="Price Alerts"]/ancestor::android.view.View[@focusable="true"][1]')
  }

  private get globalCodeInputAndroidByResourceId() {
    return $('//*[@class="android.widget.EditText" and contains(@resource-id,"globalCodeInput")]')
  }

  private get globalCodeInputAndroidNumericTrigger() {
    return $('//*[@class="android.widget.EditText" and contains(@resource-id,"globalCodeInput") and @input-type="2"]')
  }

  private get investSearchOverlayInputAndroid() {
    return $('//*[@class="android.widget.EditText" and @input-type="1" and not(contains(@resource-id,"globalCodeInput"))]')
  }

  private get investSearchOverlayInputAndroidLoose() {
    return $('//*[@class="android.widget.EditText" and not(contains(@resource-id,"globalCodeInput"))]')
  }

  private get investSearchCancelAndroid() {
    return this.androidText('Cancel')
  }

  private get investSearchInstrumentsHeaderAndroid() {
    return this.androidText('Instruments')
  }

  private get investSearchLabelAndroid() {
    return this.androidText('Search Instrument')
  }

  private get priceAlertsHeaderAndroid() {
    return this.androidText('Price Alerts')
  }

  private get overviewTabAndroidByText() {
    return this.androidText('Overview')
  }

  private get overviewTabAndroidByResourceId() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/mat-tab-label-0-0$|^mat-tab-label-0-0$")')
  }

  private get newTabAndroidByText() {
    return this.androidText('New')
  }

  private get newTabAndroidByResourceId() {
    // Seen in pageSource: mat-tab-label-0-1
    return $('android=new UiSelector().resourceIdMatches(".*:id/mat-tab-label-0-1$|^mat-tab-label-0-1$")')
  }

  private get historyTabAndroidByText() {
    return this.androidText('History')
  }

  private get historyTabAndroidByResourceId() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/mat-tab-label-0-2$|^mat-tab-label-0-2$")')
  }

  private get findInstrumentInputAndroidByClassInstance() {
    // As provided: new UiSelector().className("android.widget.EditText").instance(1)
    return $('android=new UiSelector().className("android.widget.EditText").instance(1)')
  }

  private get findInstrumentInputAndroidByResourceId() {
    // Some builds expose the input as `globalCodeInput` but that same resource-id can also exist
    // for a different small header input. Gate it by hint/content-desc to avoid targeting the wrong field.
    return $('//*[@class="android.widget.EditText" and contains(@resource-id,"globalCodeInput") and (@hint="Find Instrument" or @content-desc="Find Instrument")]')
  }

  private get plusOnePercentAndroidByText() {
    return this.androidText('+1%')
  }

  private get plusOnePercentAndroidByTextContains() {
    return this.androidTextContains('+1%')
  }

  private get backBtnAndroidByDescContains() {
    return this.androidDescContains('Back')
  }

  private get backBtnAndroidByText() {
    return this.androidText('Back')
  }

  private get backBtnAndroidByResourceId() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/.*back.*$|^.*back.*$")')
  }

  private get findInstrumentInputAndroidByXpathMatTab() {
    // WebView-based layout: match the EditText inside the New tab content.
    // We've seen `mat-tab-content-0-1` (and older `mat-tab-content-1-1`) across builds.
    return $('//*[contains(@resource-id,"mat-tab-content-") and (contains(@resource-id,"0-1") or contains(@resource-id,"1-1"))]//android.widget.EditText')
  }

  private get noInstrumentsFoundAndroid() {
    return this.androidText('No Instruments Found')
  }

  private get findInstrumentInputAndroidByHint() {
    return $('//*[@class="android.widget.EditText" and (@hint="Find Instrument" or @content-desc="Find Instrument")]')
  }

  private get findInstrumentSearchTriggerAndroid() {
    return $('//*[@class="android.widget.EditText" and (@hint="Find Instrument" or @content-desc="Find Instrument")]/following-sibling::android.view.View[1]')
  }

  private get addNewPriceAlertAnchorAndroid() {
    return this.androidText('Add a New Price Alert')
  }

  private get saveBtnAndroidByText() {
    return this.androidText('Save')
  }

  private get saveBtnAndroidByDesc() {
    return $('android=new UiSelector().description("Save")')
  }

  private get saveBtnAndroidById() {
    return this.byIdAndroid('priceAlerts_button_save')
  }

  private get newOrderHeaderAndroid() {
    return this.androidText('New Order')
  }

  private get placeBuyOrderBtnAndroid() {
    return this.androidText('Place Buy Order')
  }

  private get bmwSearchResultImageAndroid() {
    return $('//android.widget.Image[contains(@content-desc,"BMW FSE")]')
  }

  private get bmw3SearchResultImageAndroid() {
    return $('//android.widget.Image[contains(@content-desc,"BMW3 FSE")]')
  }

  private get searchResultViewWithBmwTextAndroid() {
    return $('//*[contains(@text,"Bmw")]')
  }

  private get searchResultViewWithBMWTextAndroid() {
    return $('//*[contains(@text,"BMW")]')
  }

  private get alertSummaryAndroidByTextContains() {
    return this.androidTextContains('Greater than')
  }

  private get alertSummaryAndroidByXpathContains() {
    return $('//*[contains(@text,"Greater than")]')
  }

  private get alertSummaryAndroidByXpathBmw() {
    return $('//*[contains(@text,"Bmw Ag Greater than")]')
  }

  private get deleteBtnAndroidByText() {
    return this.androidText('Delete')
  }

  private get deleteBtnAndroidByDesc() {
    return this.androidDescContains('Delete')
  }

  private get deleteBtnAndroidById() {
    return this.byIdAndroid('priceAlerts_button_delete')
  }

  private get confirmBtnAndroidByTextConfirm() {
    return this.androidText('Confirm')
  }

  private get confirmBtnAndroidByTextDelete() {
    return this.androidText('Delete')
  }

  private get confirmBtnAndroidByIdButton1() {
    return $('android=new UiSelector().resourceId("android:id/button1")')
  }

  private async openPriceAlertsAndroid() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    const alreadyOnAlerts = await this.isOnPriceAlertsScreenAndroid()
    if (alreadyOnAlerts) return

    await this.investTabAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.investTabAndroid)

    const entryCandidates = [
      this.priceAlertsEntryAndroidByXpathAncestor,
      this.priceAlertsEntryAndroid,
      this.androidTextContains('Price Alerts'),
    ]

    await this.waitForAnyDisplayed(entryCandidates, 20000, 'Price Alerts entry')
    await this.tapFirstDisplayed(entryCandidates, 'Price Alerts entry')
    await this.waitForPriceAlertsScreenAndroid()
  }

  private async openInvestSearchAndroid() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    await this.investTabAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.investTabAndroid)

    const triggerCandidates = [
      this.globalCodeInputAndroidNumericTrigger,
      this.globalCodeInputAndroidByResourceId,
    ]

    const overlayCandidates = [
      this.investSearchOverlayInputAndroid,
      this.investSearchOverlayInputAndroidLoose,
      this.findInstrumentInputAndroidByXpathMatTab,
      this.findInstrumentInputAndroidByHint,
      this.findInstrumentInputAndroidByResourceId,
      this.findInstrumentInputAndroidByClassInstance,
      this.investSearchLabelAndroid,
      this.investSearchCancelAndroid,
      this.investSearchInstrumentsHeaderAndroid,
    ]

    const alreadyOpen = await this
      .waitForAnyDisplayed(overlayCandidates, 2500, 'Invest search overlay')
      .then(() => true)
      .catch(() => false)

    if (alreadyOpen) {
      await browser.pause(300)
      return
    }

    await this.waitForAnyDisplayed(triggerCandidates, 20000, 'Invest search trigger')
    const trigger = await this.getFirstDisplayed(triggerCandidates, 'Invest search trigger')
    await trigger.click()
    await browser.pause(500)

    await this.waitForAnyDisplayed(overlayCandidates, 20000, 'Invest search overlay')
    await browser.pause(500)
  }

  private async goToNewTabAndroid() {
    const newTabCandidates = [this.newTabAndroidByResourceId, this.newTabAndroidByText]
    const newTabShown = await this.waitForAnyDisplayed(newTabCandidates, 15000, 'New tab')
      .then(() => true)
      .catch(() => false)
    if (newTabShown) {
      await this.tapFirstDisplayed(newTabCandidates, 'New tab')
      await browser.pause(600)
    }
  }

  private async goToOverviewTabAndroid() {
    const overviewCandidates = [this.overviewTabAndroidByResourceId, this.overviewTabAndroidByText]
    const shown = await this.waitForAnyDisplayed(overviewCandidates, 15000, 'Overview tab')
      .then(() => true)
      .catch(() => false)
    if (shown) {
      await this.tapFirstDisplayed(overviewCandidates, 'Overview tab')
      await browser.pause(600)
    }
  }

  private async waitForFindInstrumentInputAndroid() {
    const inputCandidates = [
      this.investSearchOverlayInputAndroid,
      this.findInstrumentInputAndroidByXpathMatTab,
      this.findInstrumentInputAndroidByHint,
      this.findInstrumentInputAndroidByResourceId,
      this.findInstrumentInputAndroidByClassInstance,
    ]
    await this.waitForAnyDisplayed(inputCandidates, 20000, 'Instrument search input')
  }

  private async scrollDownOnceAndroid() {
    const { width, height } = await browser.getWindowRect()
    const startX = Math.round(width * 0.5)
    const startY = Math.round(height * 0.78)
    const endY = Math.round(height * 0.32)

    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 150 },
          { type: 'pointerMove', duration: 650, x: startX, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
    await browser.pause(450)
  }

  private async ensureVisibleByScrollingAndroid(target: WdioEl | WebdriverIO.Element, maxScrolls = 6) {
    for (let i = 0; i < maxScrolls; i++) {
      const el = (await target) as WebdriverIO.Element
      const shown = await el.isDisplayed().catch(() => false)
      if (shown) return
      await this.scrollDownOnceAndroid()
    }

    throw new Error('Target element not visible after scrolling (Android)')
  }

  private async pickPlusOnePercentAndReturnAndroid() {
    const plusCandidates = [this.plusOnePercentAndroidByText, this.plusOnePercentAndroidByTextContains]

    const shown = await this.waitForAnyDisplayed(plusCandidates, 6000, '+1% option (Android)')
      .then(() => true)
      .catch(() => false)

    if (!shown) {
      // Often below the fold
      await this.ensureVisibleByScrollingAndroid(this.plusOnePercentAndroidByTextContains, 8)
    }

    await this.tapFirstDisplayed(plusCandidates, '+1% option (Android)')
    await browser.pause(800)

    const detailAnchors = [
      this.alertSummaryAndroidByXpathBmw,
      this.alertSummaryAndroidByTextContains,
      this.alertSummaryAndroidByXpathContains,
      this.deleteBtnAndroidById,
      this.deleteBtnAndroidByText,
      this.deleteBtnAndroidByDesc,
    ]
    await this.waitForAnyDisplayed(detailAnchors, 12000, 'Created alert detail/summary (Android)')
      .catch(() => {})

    // Return back to alerts list (prefer explicit back if present; otherwise Android back)
    const backCandidates = [
      this.backBtnAndroidByDescContains,
      this.backBtnAndroidByText,
      this.backBtnAndroidByResourceId,
    ]

    const backShown = await this.waitForAnyDisplayed(backCandidates, 4000, 'Back button (Android)')
      .then(() => true)
      .catch(() => false)
    if (backShown) {
      await this.tapFirstDisplayed(backCandidates, 'Back button (Android)')
    } else {
      await browser.back()
    }

    // On Android, Back from the created alert often returns to the Invest screen.
    // Re-open the Price Alerts tile explicitly instead of assuming we are already on the tabs screen.
    await browser.pause(800)
    await this.openPriceAlertsAndroid()
  }

  private async isOnPriceAlertsScreenAndroid() {
    const anchors = [
      this.overviewTabAndroidByResourceId,
      this.overviewTabAndroidByText,
      this.newTabAndroidByResourceId,
      this.newTabAndroidByText,
      this.historyTabAndroidByResourceId,
      this.historyTabAndroidByText,
      this.addNewPriceAlertAnchorAndroid,
    ]

    for (const candidate of anchors) {
      const el = (await candidate) as unknown as WebdriverIO.Element
      if (await el.isDisplayed().catch(() => false)) return true
    }

    return false
  }

  private async waitForPriceAlertsScreenAndroid() {
    const anchors = [
      this.overviewTabAndroidByResourceId,
      this.overviewTabAndroidByText,
      this.newTabAndroidByResourceId,
      this.newTabAndroidByText,
      this.historyTabAndroidByResourceId,
      this.historyTabAndroidByText,
    ]

    await this.waitForAnyDisplayed(anchors, 20000, 'Price Alerts screen (Android)')
  }

  private async isOnNewOrderScreenAndroid() {
    const anchors = [
      this.newOrderHeaderAndroid,
      this.placeBuyOrderBtnAndroid,
      this.androidText('BUY'),
      this.androidText('SELL'),
    ]

    for (const candidate of anchors) {
      const el = (await candidate) as unknown as WebdriverIO.Element
      if (await el.isDisplayed().catch(() => false)) return true
    }

    return false
  }

  private async openPriceAlertsIOS() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    // If we are already on the Price Alerts screen (e.g. after Back), don't try to re-enter via Invest.
    const alreadyOnAlerts = await this.priceAlertsEntryIOS.isDisplayed().catch(() => false)
    if (alreadyOnAlerts) return

    await this.investTabIOS.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.investTabIOS)

    // iOS expected flow (per provided steps): after tapping Invest we land directly on
    // the Price Alerts screen that has `Search Instrument`.
    const searchCandidates = [this.searchInstrumentTextFieldIOS, this.searchInstrumentInputIOS]
    const searchShown = await this.waitForAnyDisplayed(searchCandidates, 12000, 'Search Instrument input (iOS)')
      .then(() => true)
      .catch(() => false)

    if (searchShown) return

    // Some builds show Price Alerts as a separate entry; others might land directly.
    // Also, sometimes the visible “Price Alerts” is a StaticText without accessibility.
    const alreadyOnScreen = (await this.searchInstrumentInputIOS.isDisplayed().catch(() => false)) || (await this.searchInstrumentTextFieldIOS.isDisplayed().catch(() => false))
    if (!alreadyOnScreen) {
      const entryCandidates = [
        this.priceAlertsTileIOSByXpathAncestor,
        this.priceAlertsEntryIOSByStaticText,
        this.priceAlertsEntryIOSByXpathStaticText,
        this.priceAlertsEntryIOSByPredicateContains,
      ]

      const shown = await this.waitForAnyDisplayed(entryCandidates, 20000, 'Price Alerts entry (iOS)')
        .then(() => true)
        .catch(() => false)

      if (!shown) {
        await this.debugSnapshot('price-alerts-ios-entry-missing')
        throw new Error('Price Alerts entry/button not found on iOS after tapping Invest. Likely not accessible (accessible=false) or not loaded yet.')
      }

      // If it exists but is below the fold
      const entry = await this.getFirstDisplayed(entryCandidates, 'Price Alerts entry (iOS)')
      const visibleNow = await entry.isDisplayed().catch(() => false)
      if (!visibleNow) {
        await this.ensureVisibleByScrollingIOS(entry)
      }

      // Prefer tapping the tile/container if present
      const tapCandidates = [
        this.priceAlertsTileIOSByXpathAncestor,
        this.priceAlertsEntryIOSByStaticText,
        this.priceAlertsEntryIOSByXpathStaticText,
        this.priceAlertsEntryIOSByPredicateContains,
      ]

      await this.tapFirstDisplayed(tapCandidates, 'Price Alerts entry (iOS)')
      await browser.pause(800)
    }

    // After opening Price Alerts, the search control can be a StaticText label + a real TextField.
    await this.waitForAnyDisplayed(searchCandidates, 20000, 'Search Instrument input (iOS)')
  }

  private async goToNewTabIOS() {
    const shown = await this.newTabIOS.isDisplayed().catch(() => false)
    if (!shown) return
    await this.tap(this.newTabIOS)
    await browser.pause(500)
  }

  private async goToOverviewTabIOS() {
    const shown = await this.overviewTabIOS.isDisplayed().catch(() => false)
    if (!shown) return
    await this.tap(this.overviewTabIOS)
    await browser.pause(500)
  }

  private async getSearchInstrumentFieldIOS() {
    const candidates = [this.searchInstrumentTextFieldIOS, this.searchInstrumentInputIOS]
    return await this.getFirstDisplayed(candidates, 'Search Instrument input (iOS)')
  }

  private async scrollDownOnceIOS() {
    const { width, height } = await browser.getWindowRect()
    const startX = Math.round(width * 0.5)
    const startY = Math.round(height * 0.75)
    const endY = Math.round(height * 0.3)

    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 150 },
          { type: 'pointerMove', duration: 650, x: startX, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
    await browser.pause(450)
  }

  private async ensureVisibleByScrollingIOS(target: WdioEl | WebdriverIO.Element, maxScrolls = 6) {
    for (let i = 0; i < maxScrolls; i++) {
      const el = (await target) as WebdriverIO.Element
      const shown = await el.isDisplayed().catch(() => false)
      if (shown) return
      await this.scrollDownOnceIOS()
    }

    await this.debugSnapshot('price-alerts-ios-scroll-target-not-found')
    throw new Error('Target element not visible after scrolling (iOS)')
  }

  private async typeInstrumentQueryIOS(query: string) {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    // On iOS the search lives under the "New" tab.
    await this.goToNewTabIOS()

    const inputPrimary = await this.focusSearchInstrumentIOS()

    const typeInto = async (input: WebdriverIO.Element) => {
      await this.tapIOSDisplayed(input, 20000)
      await input.clearValue().catch(() => {})
      await input.setValue(query)
      await browser.pause(350)

      const returnKey = this.iosA11y('Return')
      const returnShown = await returnKey.isDisplayed().catch(() => false)
      if (returnShown) {
        await returnKey.click()
      } else {
        await browser.hideKeyboard().catch(() => {})
      }

      await browser.pause(600)
    }

    await typeInto(inputPrimary)

    const value = await inputPrimary.getValue().catch(() => '')
    if (!value || !value.toLowerCase().includes(query.trim().toLowerCase())) {
      // Some builds expose a non-editable placeholder element first; retry with the other candidate.
      const textField = (await this.searchInstrumentTextFieldIOS) as unknown as WebdriverIO.Element
      const a11yInput = (await this.searchInstrumentInputIOS) as unknown as WebdriverIO.Element

      const inputSecondary = inputPrimary.elementId === textField.elementId ? a11yInput : textField
      const secondaryShown = await inputSecondary.isDisplayed().catch(() => false)
      if (secondaryShown) {
        await typeInto(inputSecondary)
      }
    }
  }

  private async selectFirstSearchResultIOS(query: string) {
    const q = query.trim()

    const byTextCandidates = [
      this.iosPredicate(
        `(
          type == "XCUIElementTypeCell" OR
          type == "XCUIElementTypeLink" OR
          type == "XCUIElementTypeStaticText" OR
          type == "XCUIElementTypeButton"
        ) AND (
          label CONTAINS[c] "${q}" OR name CONTAINS[c] "${q}" OR value CONTAINS[c] "${q}"
        )`
      ),
      this.iosPredicate(`label CONTAINS[c] "${q}" OR name CONTAINS[c] "${q}"`),
      this.iosPredicate(`value CONTAINS[c] "${q}"`),
    ]

    const anyResultCandidates = [this.iosClassChain('**/XCUIElementTypeCell'), this.iosClassChain('**/XCUIElementTypeLink')]

    // First, wait for a result containing the query; otherwise, fall back to any visible result container.
    const shown = await this.waitForAnyDisplayed(byTextCandidates, 25000, `Search result for ${q} (iOS)`).then(() => true).catch(() => false)
    if (shown) {
      await this.tapFirstDisplayed(byTextCandidates, `Search result for ${q} (iOS)`)
      await browser.pause(700)
      return
    }

    const anyShown = await this.waitForAnyDisplayed(anyResultCandidates, 12000, `Any search result container (iOS)`).then(() => true).catch(() => false)
    if (anyShown) {
      await this.tapFirstDisplayed(anyResultCandidates, `Any search result container (iOS)`)
      await browser.pause(700)
      return
    }

    // Fallback: tap the first visible cell-like element
    const cells = await $$('-ios class chain:**/XCUIElementTypeCell')
    for (const cell of cells) {
      const visible = await cell.isDisplayed().catch(() => false)
      if (!visible) continue
      await cell.click()
      await browser.pause(700)
      return
    }

    await this.debugSnapshot('price-alerts-ios-no-search-results')
    throw new Error(`Could not find search results for instrument query on iOS: ${q}`)
  }

  private async pickPlusOnePercentAndReturnIOS() {
    await this.ensureVisibleByScrollingIOS(this.plusOnePercentOptionIOS)
    await this.tap(this.plusOnePercentOptionIOS)

    // Validate summary text appears (best-effort; wording can vary)
    const summaryCandidates = [
      this.iosA11y('Bmw Ag Greater than'),
      this.iosPredicate('label CONTAINS[c] "Greater" AND (label CONTAINS[c] "BMW" OR label CONTAINS[c] "Bmw")'),
      this.iosPredicate('label CONTAINS[c] "Bmw Ag" AND label CONTAINS[c] "Greater"'),
    ]

    await this.waitForAnyDisplayed(summaryCandidates, 15000, 'Alert summary text (iOS)')
    await this.backBtnIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.backBtnIOS)
    await browser.pause(600)

    // After tapping Back we should land on Price Alerts screen where `~Price Alerts` exists as a header/title.
    const backAnchors = [
      this.priceAlertsEntryIOS,
      this.addNewPriceAlertAnchorIOS,
      this.searchInstrumentTextFieldIOS,
      this.searchInstrumentInputIOS,
      this.mainContainerIOSByClassChain,
      this.mainContainerIOSByXpath,
    ]
    await this.waitForAnyDisplayed(backAnchors, 20000, 'Price Alerts screen after Back (iOS)')
  }

  private async typeInstrumentQueryAndroid(query: string) {
    const inputCandidates = [
      this.investSearchOverlayInputAndroid,
      this.findInstrumentInputAndroidByXpathMatTab,
      this.findInstrumentInputAndroidByHint,
      this.findInstrumentInputAndroidByResourceId,
      this.findInstrumentInputAndroidByClassInstance,
    ]

    const input = await this.getFirstDisplayed(inputCandidates, 'Instrument search input')
    await input.click()
    await input.clearValue().catch(() => {})
    await input.setValue(query)
    await browser.pause(500)

    const typedText = [
      await input.getText().catch(() => ''),
      await input.getAttribute('text').catch(() => ''),
      await input.getAttribute('value').catch(() => ''),
    ].join(' ')

    if (!typedText.toLowerCase().includes(query.trim().toLowerCase())) {
      // Some Android WebView builds drop the first setValue.
      await input.click()
      await input.clearValue().catch(() => {})
      await input.setValue(query)
      await browser.pause(350)
    }

    // Trigger search (some builds only populate results after Enter/search action)
    await browser.keys(['Enter']).catch(() => {})
    const triggerShown = await this.findInstrumentSearchTriggerAndroid.isDisplayed().catch(() => false)
    if (triggerShown) {
      await this.findInstrumentSearchTriggerAndroid.click().catch(() => {})
    }
    await browser.pause(250)

    // Best-effort: hide keyboard so results can update.
    await browser.hideKeyboard().catch(() => {})
    await browser.pause(1200)
  }

  private async selectFirstSearchResultAndroid(query: string) {
    const q = query.trim()
    const qLower = q.toLowerCase()
    const qTitle = qLower.length ? qLower[0].toUpperCase() + qLower.slice(1) : q

    // IMPORTANT: avoid matching the input itself (it may contain the typed query).
    // Restrict to likely result containers.
    const candidates = [
      this.bmwSearchResultImageAndroid,
      this.bmw3SearchResultImageAndroid,
      this.searchResultViewWithBmwTextAndroid,
      this.searchResultViewWithBMWTextAndroid,
      $(`android=new UiSelector().className("android.widget.TextView").textContains("${q}")`),
      $(`android=new UiSelector().className("android.widget.TextView").textContains("${qTitle}")`),
      $(`android=new UiSelector().className("android.widget.TextView").textContains("${q.toUpperCase()}")`),
      $(`android=new UiSelector().className("android.view.View").descriptionContains("${q}")`),
      $(`android=new UiSelector().className("android.view.View").descriptionContains("${qTitle}")`),
      $(`//android.widget.TextView[contains(@text,"${q}")]`),
      $(`//*[contains(@text,"${q}")]`),
      $(`//*[contains(@text,"${qTitle}")]`),
      $(`//*[contains(@text,"${q.toUpperCase()}")]`),
      $(`//android.view.View[contains(@content-desc,"${q}")]`),
      $(`//*[contains(@content-desc,"${q.toUpperCase()}")]`),
    ]

    // Wait a bit for results; fall back to any clickable item in the first result list
    const shown = await this.waitForAnyDisplayed(candidates, 22000, `Search result for ${q}`).then(() => true).catch(() => false)
    if (shown) {
      await this.tapFirstDisplayed(candidates, `Search result for ${q}`)
      await browser.pause(600)
      return
    }

    const noResults = await this.noInstrumentsFoundAndroid.isDisplayed().catch(() => false)
    if (noResults) {
      await this.debugSnapshot('price-alerts-android-no-instruments-found')
      throw new Error(`No Instruments Found for query: ${q}`)
    }

    // Fallback 1: click the first displayed TextView that looks like a result
    const tvs = await $$('android.widget.TextView')
    for (const tv of tvs) {
      const visible = await tv.isDisplayed().catch(() => false)
      if (!visible) continue
      const text = (await tv.getText().catch(() => '')).trim()
      if (!text) continue
      const low = text.toLowerCase()
      if (low.includes(qLower)) {
        await tv.click()
        await browser.pause(600)
        return
      }
    }

    // Fallback 2: some webview-backed results appear as android.view.View with content-desc
    const views = await $$('android.view.View')
    for (const v of views) {
      const visible = await v.isDisplayed().catch(() => false)
      if (!visible) continue
      const desc = (await v.getAttribute('content-desc').catch(() => '')) ?? ''
      const d = String(desc).trim()
      if (!d) continue
      const low = d.toLowerCase()

      // Skip obvious non-results
      if (low.includes('price alerts') || low.includes('add a new price alert') || low === 'overview' || low === 'new' || low === 'history') continue
      if (low.includes('find instrument')) continue

      if (low.includes(qLower)) {
        await v.click().catch(() => {})
        await browser.pause(600)
        return
      }
    }

    await this.debugSnapshot('price-alerts-no-results')
    throw new Error(`Could not find search results for instrument query: ${q}`)
  }

  private async fillOptionalFieldsAndSaveAndroid(params: CreatePriceAlertParams) {
    const { thresholdValue, dateValue } = params

    const saveCandidates = [
      this.saveBtnAndroidById,
      this.saveBtnAndroidByText,
      this.saveBtnAndroidByDesc,
      this.androidTextContains('Save'),
      $('//android.widget.Button[@text="Save"]'),
    ]

    const ensureRequiredFieldsForNewRuleAndroid = async () => {
      const newRuleShown = await this.androidText('New Rule').isDisplayed().catch(() => false)
      if (!newRuleShown) return

      const isSaveEnabled = async () => {
        for (const candidate of saveCandidates) {
          const el = (await candidate) as unknown as WebdriverIO.Element
          const visible = await el.isDisplayed().catch(() => false)
          if (!visible) continue
          const enabled = await el.isEnabled().catch(() => false)
          if (enabled) return true
        }
        return false
      }

      if (await isSaveEnabled()) return

      const plusButtonCandidates = [
        $('//*[contains(@text,"Target Price")]/following::android.widget.Button[@enabled="true"][1]'),
        $('//android.view.View[contains(@text,"Target Price")]/following::android.widget.Button[@enabled="true"][1]'),
      ]

      const plusShown = await this.waitForAnyDisplayed(plusButtonCandidates, 2000, 'Target Price plus button (Android)')
        .then(() => true)
        .catch(() => false)

      if (plusShown) {
        const plusBtn = await this.getFirstDisplayed(plusButtonCandidates, 'Target Price plus button (Android)')
        await plusBtn.click().catch(() => {})
        await browser.pause(150)
      }

      if (await isSaveEnabled()) return

      const conditionFieldCandidates = [
        $('//android.view.View[@text="Select" and @clickable="true"]'),
        $('//*[contains(@text,"Condition")]/following::*[(self::android.view.View or self::android.widget.TextView) and (@text="Select" or contains(@text,"Select"))][1]'),
        $('//android.view.View[@text="Select"]'),
        $('//*[contains(@text,"Condition")]/following::android.view.View[@clickable="true"][1]'),
      ]

      const conditionFieldShown = await this.waitForAnyDisplayed(conditionFieldCandidates, 3000, 'Condition selector (Android)')
        .then(() => true)
        .catch(() => false)

      if (conditionFieldShown) {
        await this.tapFirstDisplayed(conditionFieldCandidates, 'Condition selector (Android)')
        await browser.pause(300)

        const conditionOptionCandidates = [
          $('//android.view.View[contains(@text,"Greater than")]'),
          $('//*[contains(@text,"Greater than")]'),
          $('//android.widget.CheckedTextView[contains(@text,"Greater than")]'),
          $('//android.widget.TextView[contains(@text,"Greater than")]'),
          $('//android.widget.ListView//android.widget.TextView[1]'),
          $('//android.widget.ListView//android.widget.CheckedTextView[1]'),
          $('//android.widget.CheckedTextView[1]'),
        ]

        const optionShown = await this.waitForAnyDisplayed(conditionOptionCandidates, 3000, 'Condition option (Android)')
          .then(() => true)
          .catch(() => false)

        if (optionShown) {
          await this.tapFirstDisplayed(conditionOptionCandidates, 'Condition option (Android)')
          await browser.pause(350)
        }
      }

      const targetPriceCandidates = [
        $('//*[contains(@text,"Target Price")]/following::android.widget.EditText[1]'),
        $('//android.widget.TextView[contains(@text,"Target Price")]/following::android.widget.EditText[1]'),
        $('//*[@resource-id="new-form-target-price"]//android.widget.EditText'),
      ]

      const targetShown = await this.waitForAnyDisplayed(targetPriceCandidates, 3000, 'Target Price input (Android)')
        .then(() => true)
        .catch(() => false)

      if (targetShown) {
        const targetInput = await this.getFirstDisplayed(targetPriceCandidates, 'Target Price input (Android)')
        await targetInput.click().catch(() => {})
        await targetInput.clearValue().catch(() => {})
        await targetInput.setValue(String(thresholdValue ?? '100')).catch(async () => {
          await browser.keys(String(thresholdValue ?? '100')).catch(() => {})
        })
        await browser.pause(250)
        await browser.hideKeyboard().catch(() => {})
      }
    }

    await ensureRequiredFieldsForNewRuleAndroid()

    // Best-effort fill: try a numeric threshold/price input if present
    if (thresholdValue) {
      const thresholdCandidates = [
        $('//*[contains(@text,"Target Price")]/following::android.widget.EditText[1]'),
        $('//*[@class="android.widget.EditText" and (contains(@hint,"Price") or contains(@hint,"Target") or contains(@hint,"Value") or contains(@content-desc,"Price") or contains(@content-desc,"Target"))]'),
        this.byIdAndroid('priceAlerts_input_price'),
        this.byIdAndroid('priceAlerts_input_threshold'),
      ]

      const visible = await this.waitForAnyDisplayed(thresholdCandidates, 4000, 'Threshold input').then(() => true).catch(() => false)
      if (visible) {
        const el = await this.getFirstDisplayed(thresholdCandidates, 'Threshold input')
        await el.click()
        await el.clearValue().catch(() => {})
        await el.setValue(String(thresholdValue))
        await browser.pause(300)
      }
    }

    // Best-effort fill: date/valid-until input if present
    if (dateValue) {
      const dateCandidates = [
        $('//*[@class="android.widget.EditText" and (contains(@hint,"Date") or contains(@hint,"Valid") or contains(@hint,"Until") or contains(@content-desc,"Date") or contains(@content-desc,"Valid") or contains(@content-desc,"Until"))]'),
        this.byIdAndroid('priceAlerts_input_date'),
        this.byIdAndroid('priceAlerts_input_validUntil'),
      ]

      const visible = await this.waitForAnyDisplayed(dateCandidates, 4000, 'Date input').then(() => true).catch(() => false)
      if (visible) {
        const el = await this.getFirstDisplayed(dateCandidates, 'Date input')
        await el.click()
        await browser.pause(400)

        const pickerOkVisible = await this.confirmBtnAndroidByIdButton1
          .isDisplayed()
          .catch(() => false)

        if (pickerOkVisible) {
          // If a native picker opens, at least confirm the default date.
          await this.tap(this.confirmBtnAndroidByIdButton1)
        } else {
          await el.clearValue().catch(() => {})
          await el.setValue(String(dateValue))
          await browser.pause(300)
        }
      }
    }

    await this.waitForAnyDisplayed(saveCandidates, 15000, 'Save button')

    // Prefer enabled if possible
    let tapped = false
    for (const candidate of saveCandidates) {
      const el = (await candidate) as unknown as WebdriverIO.Element
      const visible = await el.isDisplayed().catch(() => false)
      if (!visible) continue
      const enabled = await el.isEnabled().catch(() => true)
      if (!enabled) continue
      await el.click()
      tapped = true
      break
    }

    if (!tapped) {
      // One more try: in New Rule flow Save can stay disabled until required fields are populated.
      await ensureRequiredFieldsForNewRuleAndroid()

      for (const candidate of saveCandidates) {
        const el = (await candidate) as unknown as WebdriverIO.Element
        const visible = await el.isDisplayed().catch(() => false)
        if (!visible) continue
        const enabled = await el.isEnabled().catch(() => true)
        if (!enabled) continue
        await el.click()
        tapped = true
        break
      }
    }

    if (!tapped) {
      await this.debugSnapshot('price-alerts-save-disabled')
      throw new Error('Save button is visible but not enabled (missing required fields?)')
    }

    await browser.pause(1500)
  }

  private alertRowCandidatesAndroid(instrumentQuery: string) {
    const q = instrumentQuery.trim()
    const variants = [...new Set([q, q.toUpperCase(), `${q.slice(0, 1).toUpperCase()}${q.slice(1).toLowerCase()}`])]
    return [
      this.alertSummaryAndroidByXpathBmw,
      this.alertSummaryAndroidByTextContains,
      ...variants.map((variant) => this.androidTextContains(variant)),
      ...variants.map((variant) => this.androidDescContains(variant)),
      ...variants.map((variant) => $(`//*[contains(@text,"${variant}")]`)),
      ...variants.map((variant) => $(`//android.widget.TextView[contains(@text,"${variant}")]`)),
      ...variants.map((variant) => $(`//android.view.View[contains(@content-desc,"${variant}")]`)),
    ]
  }

  private alertRowOpenCandidatesAndroid(instrumentQuery: string) {
    const q = instrumentQuery.trim()
    const variants = [...new Set([q, q.toUpperCase(), `${q.slice(0, 1).toUpperCase()}${q.slice(1).toLowerCase()}`])]
    return [
      // Crash XML shows rows as android.view.View children (not TextView) and not marked clickable.
      $('//android.view.View[./android.view.View[@text="BMW"] and ./android.view.View[contains(@text,"Bmw Ag Greater than")]]'),
      $('//android.view.View[@text="BMW"]'),
      $('//android.view.View[contains(@text,"Bmw Ag Greater than")]'),

      // On Android (WebView accessibility tree), the clickable/swipable container is often the *parent* of the text cells.
      $('//*[contains(@text,"Bmw Ag Greater than")]/parent::*'),
      $('//*[contains(@text,"BMW")]/parent::*'),
      ...variants.map((variant) => $(`//*[contains(@text,"${variant}")]/parent::*`)),
      $('//*[contains(@text,"Bmw Ag Greater than")]/ancestor::*[@clickable="true" or @focusable="true"][1]'),
      $('//*[contains(@text,"BMW")]/ancestor::*[@clickable="true" or @focusable="true"][1]'),
      ...variants.map((variant) => $(`//*[contains(@text,"${variant}")]/ancestor::*[@clickable="true" or @focusable="true"][1]`)),
      ...this.alertRowCandidatesAndroid(instrumentQuery),
    ]
  }

  private alertRowSwipeCandidatesAndroid(instrumentQuery: string) {
    const q = instrumentQuery.trim()
    const variants = [...new Set([q, q.toUpperCase(), `${q.slice(0, 1).toUpperCase()}${q.slice(1).toLowerCase()}`])]
    return [
      $('//*[contains(@text,"Bmw Ag Greater than")]/parent::*'),
      $('//*[contains(@text,"BMW")]/parent::*'),
      ...variants.map((variant) => $(`//*[contains(@text,"${variant}")]/parent::*`)),
      ...this.alertRowOpenCandidatesAndroid(instrumentQuery),
      ...this.alertRowCandidatesAndroid(instrumentQuery),
    ]
  }

  public async createPriceAlertAndroid(params: CreatePriceAlertParams) {
    if (!browser.isAndroid) return

    // On Android always create from Price Alerts -> New tab.
    // Global Invest search can open Trade/New Order screen instead of Price Alerts create flow.
    await this.openPriceAlertsAndroid()
    await this.goToNewTabAndroid()
    await this.waitForFindInstrumentInputAndroid()
    await this.typeInstrumentQueryAndroid(params.instrumentQuery)
    await this.selectFirstSearchResultAndroid(params.instrumentQuery).catch(async () => {
      // Retry once from the same New tab context; search results can be flaky on Android WebView.
      await this.waitForFindInstrumentInputAndroid()
      await this.typeInstrumentQueryAndroid(params.instrumentQuery)
      await this.selectFirstSearchResultAndroid(params.instrumentQuery)
    })

    // Align sequence with iOS: prefer +1% flow if present; fallback to Save/date flow.
    const usedPlus = await this.pickPlusOnePercentAndReturnAndroid().then(() => true).catch(() => false)
    if (!usedPlus) {
      const saveCandidates = [
        this.saveBtnAndroidById,
        this.saveBtnAndroidByText,
        this.saveBtnAndroidByDesc,
        this.androidTextContains('Save'),
        $('//android.widget.Button[@text="Save"]'),
      ]

      const saveShown = await this.waitForAnyDisplayed(saveCandidates, 4000, 'Save button')
        .then(() => true)
        .catch(() => false)

      if (saveShown) {
        await this.fillOptionalFieldsAndSaveAndroid(params)
      } else {
        const onOrderScreen = await this.isOnNewOrderScreenAndroid()
        if (onOrderScreen) {
          await browser.back().catch(() => {})
          await browser.pause(700)

          // Retry once from the correct Price Alerts context.
          await this.openPriceAlertsAndroid()
          await this.goToNewTabAndroid()
          await this.waitForFindInstrumentInputAndroid()
          await this.typeInstrumentQueryAndroid(params.instrumentQuery)
          await this.selectFirstSearchResultAndroid(params.instrumentQuery)

          const usedPlusRetry = await this.pickPlusOnePercentAndReturnAndroid().then(() => true).catch(() => false)
          if (!usedPlusRetry) {
            const saveShownRetry = await this.waitForAnyDisplayed(saveCandidates, 4000, 'Save button (retry)')
              .then(() => true)
              .catch(() => false)
            if (saveShownRetry) {
              await this.fillOptionalFieldsAndSaveAndroid(params)
            } else {
              await this.debugSnapshot('price-alerts-android-no-plus-no-save-retry')
              throw new Error('Neither +1% option nor Save button appeared after selecting instrument (Android, retry)')
            }
          }
        } else {
        await this.debugSnapshot('price-alerts-android-no-plus-no-save')
        throw new Error('Neither +1% option nor Save button appeared after selecting instrument (Android)')
        }
      }
    }

    await this.openPriceAlertsAndroid()
    await this.goToOverviewTabAndroid()

    // Validate the alert appears in the list
    const rowCandidates = this.alertRowCandidatesAndroid(params.instrumentQuery)
    await this.waitForAnyDisplayed(rowCandidates, 20000, 'Created alert row')
  }

  public async createPriceAlertIOS(params: CreatePriceAlertParams) {
    if (!browser.isIOS) return

    await this.openPriceAlertsIOS()

    // Ensure we are on the "New" tab where Search Instrument exists.
    await this.goToNewTabIOS()
    await this.typeInstrumentQueryIOS(params.instrumentQuery)
    await this.selectFirstSearchResultIOS(params.instrumentQuery)

    // iOS flow provided: scroll to +1% and tap it
    await this.pickPlusOnePercentAndReturnIOS()

    // Validate the alert exists in the list (best-effort)
    const q = params.instrumentQuery.trim()
    const expectedRowA11y = params.rowA11yIdIOS ?? `${q} i`

    // Some layouts require tapping the main container before the list becomes interactable.
    const containerCandidates = [this.mainContainerIOSByClassChain, this.mainContainerIOSByXpath]
    const containerShown = await this.waitForAnyDisplayed(containerCandidates, 4000, 'Main container (iOS)')
      .then(() => true)
      .catch(() => false)
    if (containerShown) {
      await this.tapFirstDisplayed(containerCandidates, 'Main container (iOS)')
      await browser.pause(400)
    }

    // Ensure we are back on the Price Alerts screen.
    const anchors = [this.priceAlertsEntryIOS, this.addNewPriceAlertAnchorIOS, this.searchInstrumentTextFieldIOS, this.searchInstrumentInputIOS]
    await this.waitForAnyDisplayed(anchors, 20000, 'Price Alerts screen anchor (iOS)')

    // Switch to Overview to validate/operate on the created alert.
    await this.goToOverviewTabIOS()

    const rowCandidates = [
      this.iosA11y(expectedRowA11y),
      this.iosA11y(q),
      this.iosPredicate(`label CONTAINS[c] "${expectedRowA11y}" OR name CONTAINS[c] "${expectedRowA11y}"`),
      this.iosPredicate(`label CONTAINS[c] "${q}" OR name CONTAINS[c] "${q}"`),
      this.iosClassChain(`**/XCUIElementTypeCell[` +
        `label CONTAINS[c] "${expectedRowA11y}" OR name CONTAINS[c] "${expectedRowA11y}" OR ` +
        `label CONTAINS[c] "${q}" OR name CONTAINS[c] "${q}"` +
        `]`),
      this.iosPredicate('label CONTAINS[c] "Greater" AND (label CONTAINS[c] "BMW" OR label CONTAINS[c] "Bmw")'),
    ]

    // Scroll until we see the created row.
    let found = false
    for (let i = 0; i < 8; i++) {
      const shown = await this.waitForAnyDisplayed(rowCandidates, 2500, 'Created alert row (iOS)')
        .then(() => true)
        .catch(() => false)
      if (shown) {
        found = true
        break
      }
      await this.scrollDownOnceIOS()
    }

    if (!found) {
      await this.debugSnapshot('price-alerts-ios-created-row-missing')
      throw new Error('Created alert row (iOS) did not appear')
    }
  }

  private async swipeLeftOnElement(el: WebdriverIO.Element) {
    const loc = await el.getLocation()
    const size = await el.getSize()
    const startX = Math.round(loc.x + size.width * 0.85)
    const endX = Math.round(loc.x + size.width * 0.15)
    const y = Math.round(loc.y + size.height * 0.5)

    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 120 },
          { type: 'pointerMove', duration: 450, x: endX, y },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
    await browser.pause(600)
  }

  private async tapCenterOnElement(el: WebdriverIO.Element) {
    const loc = await el.getLocation()
    const size = await el.getSize()
    const x = Math.round(loc.x + size.width * 0.5)
    const y = Math.round(loc.y + size.height * 0.5)

    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 80 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
    await browser.pause(400)
  }

  public async deletePriceAlertAndroid(instrumentQuery: string) {
    if (!browser.isAndroid) return

    await this.openPriceAlertsAndroid()
    await this.goToOverviewTabAndroid()

    const rowCandidates = this.alertRowCandidatesAndroid(instrumentQuery)
    const rowOpenCandidates = this.alertRowOpenCandidatesAndroid(instrumentQuery)
    await this.waitForAnyDisplayed(rowCandidates, 15000, 'Alert row to delete')

    // Open the alert details first, same idea as on iOS: tap BMW / summary row.
    const row = await this.getFirstDisplayed(rowOpenCandidates, 'Alert row to open')
    await this.tapCenterOnElement(row)
    await browser.pause(800)

    const deleteCandidates = [
      this.deleteBtnAndroidById,
      this.deleteBtnAndroidByText,
      this.deleteBtnAndroidByDesc,
      this.androidTextContains('Delete'),
      this.androidDescContains('Delete'),
      this.byIdAndroid('priceAlerts_button_delete'),
    ]

    const deleteVisible = await this.waitForAnyDisplayed(deleteCandidates, 6000, 'Delete button')
      .then(() => true)
      .catch(() => false)

    if (deleteVisible) {
      await this.tapFirstDisplayed(deleteCandidates, 'Delete button')
    } else {
      // Fallback: attempt swipe-to-delete on a swipable row container.
      await this.openPriceAlertsAndroid()
      await this.goToOverviewTabAndroid()

      const swipeRowCandidates = this.alertRowSwipeCandidatesAndroid(instrumentQuery)
      let deletedViaSwipe = false

      for (const cand of swipeRowCandidates) {
        const el = (await cand) as unknown as WebdriverIO.Element
        const visible = await el.isDisplayed().catch(() => false)
        if (!visible) continue

        await this.swipeLeftOnElement(el)

        const deleteShownNow = await this.waitForAnyDisplayed(deleteCandidates, 1500, 'Delete button after swipe')
          .then(() => true)
          .catch(() => false)

        if (deleteShownNow) {
          await this.tapFirstDisplayed(deleteCandidates, 'Delete button after swipe')
          deletedViaSwipe = true
          break
        }
      }

      if (!deletedViaSwipe) {
        await this.debugSnapshot('price-alerts-delete-not-found-after-swipe')
        throw new Error('Delete button after swipe did not appear')
      }
    }

    // Confirm deletion if a dialog appears
    const confirmCandidates = [
      this.confirmBtnAndroidByTextDelete,
      this.confirmBtnAndroidByTextConfirm,
      this.confirmBtnAndroidByIdButton1,
      this.androidTextContains('Confirm'),
    ]

    const confirmShown = await this.waitForAnyDisplayed(confirmCandidates, 6000, 'Confirm delete')
      .then(() => true)
      .catch(() => false)

    if (confirmShown) {
      await this.tapFirstDisplayed(confirmCandidates, 'Confirm delete')
    }

    await browser.pause(1500)

    // Verify we are back on the Price Alerts screen first, same idea as on iOS.
    await this.openPriceAlertsAndroid()
    await this.waitForAnyDisplayed(
      [
        this.overviewTabAndroidByResourceId,
        this.overviewTabAndroidByText,
        this.newTabAndroidByResourceId,
        this.newTabAndroidByText,
        this.historyTabAndroidByResourceId,
        this.historyTabAndroidByText,
        this.addNewPriceAlertAnchorAndroid,
      ],
      20000,
      'Price Alerts anchor after delete (Android)'
    )
  }

  public async deletePriceAlertIOS(instrumentA11yId: string) {
    if (!browser.isIOS) return

    await this.openPriceAlertsIOS()

    // Alerts list lives under Overview.
    await this.goToOverviewTabIOS()

    const containerCandidates = [this.mainContainerIOSByClassChain, this.mainContainerIOSByXpath]
    const containerShown = await this.waitForAnyDisplayed(containerCandidates, 4000, 'Main container (iOS)').then(() => true).catch(() => false)
    if (containerShown) {
      await this.tapFirstDisplayed(containerCandidates, 'Main container (iOS)')
      await browser.pause(400)
    }

    // Row can be exposed in multiple ways depending on build:
    // - accessibility id: "BMW i" (preferred when present)
    // - only symbol "BMW" + condition text "Bmw Ag Greater than <price>" inside a cell
    const conditionBeginsWith = this.iosPredicate('name BEGINSWITH "Bmw Ag Greater than" OR label BEGINSWITH "Bmw Ag Greater than"')
    const bmwStaticText = this.iosA11y('BMW')

    const rowCandidates = [
      this.iosA11y(instrumentA11yId),
      this.iosPredicate(`label CONTAINS[c] "${instrumentA11yId}" OR name CONTAINS[c] "${instrumentA11yId}"`),
      conditionBeginsWith,
      // As a last resort, tap BMW symbol in the list.
      bmwStaticText,
      this.iosPredicate('type == "XCUIElementTypeStaticText" AND name == "BMW" AND visible == 1'),
    ]

    let found = false
    for (let i = 0; i < 8; i++) {
      const shown = await this.waitForAnyDisplayed(rowCandidates, 2500, 'Alert row to delete (iOS)')
        .then(() => true)
        .catch(() => false)
      if (shown) {
        found = true
        break
      }
      await this.scrollDownOnceIOS()
    }

    if (!found) {
      await this.debugSnapshot('price-alerts-ios-row-to-delete-missing')
      throw new Error('Alert row to delete (iOS) did not appear')
    }

    // Prefer tapping the condition text if it exists; otherwise tap the first matching row candidate.
    const conditionShown = await conditionBeginsWith.isDisplayed().catch(() => false)
    if (conditionShown) {
      await this.tap(conditionBeginsWith)
    } else {
      await this.tapFirstDisplayed(rowCandidates, 'Alert row to delete (iOS)')
    }
    await browser.pause(700)

    const deleteCandidates = [
      this.deleteBtnIOS,
      this.iosPredicate('label == "Delete" OR name == "Delete"'),
    ]
    await this.waitForAnyDisplayed(deleteCandidates, 12000, 'Delete button (iOS)')
    await this.tapFirstDisplayed(deleteCandidates, 'Delete button (iOS)')

    const confirmCandidates = [
      this.iosA11y('Confirm'),
      this.iosA11y('Delete'),
      this.iosA11y('OK'),
      this.iosA11y('Yes'),
      this.iosPredicate('label IN {"Confirm","Delete","OK","Yes"} OR name IN {"Confirm","Delete","OK","Yes"}'),
    ]
    const confirmShown = await this.waitForAnyDisplayed(confirmCandidates, 6000, 'Confirm delete (iOS)').then(() => true).catch(() => false)
    if (confirmShown) {
      await this.tapFirstDisplayed(confirmCandidates, 'Confirm delete (iOS)')
    }

    await this.addNewPriceAlertAnchorIOS.waitForDisplayed({ timeout: 20000 })
  }
}
