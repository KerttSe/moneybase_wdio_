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

type Rect = {
  x: number
  y: number
  width: number
  height: number
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
    return this.iosClassChain('**/XCUIElementTypeOther[`name == "main"`]/XCUIElementTypeOther[10]')
  }

  private get mainContainerIOSByXpath() {
    return $('//XCUIElementTypeOther[@name="main"]/XCUIElementTypeOther[10]')
  }

  private get priceAlertsEntryAndroid() {
    return this.androidText('Price Alerts')
  }

  private get priceAlertsEntryAndroidByXpathAncestor() {
    return $('//android.widget.TextView[@text="Price Alerts"]/ancestor::android.view.View[@focusable="true"][1]')
  }

  private get priceAlertsEntryAndroidByParent() {
    return $('//android.widget.TextView[@text="Price Alerts"]/parent::android.view.View')
  }

  private get investSearchOverlayInputAndroid() {
    return $('//*[@class="android.widget.EditText" and @input-type="1" and not(contains(@resource-id,"globalCodeInput"))]')
  }

  private get investSearchHeaderInputAndroid() {
    return $('//*[@resource-id="header-search-input"]//android.widget.EditText')
  }

  private get investSearchResultsListAndroid() {
    return $('//*[@resource-id="header-search-instruments-list"]')
  }

  private get firstInvestSearchResultAndroid() {
    return $('//*[@resource-id="header-search-instruments-list"]/android.view.View[1]')
  }

  private get firstInvestSearchResultTextAndroid() {
    return $('//*[@resource-id="header-search-instruments-list"]/android.view.View[1]//android.widget.TextView[1]')
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

  private get priceAlertAddedSuccessfullyAndroid() {
    return $('//*[contains(@text,"Added") and (contains(@text,"success") or contains(@text,"Success"))]')
  }

  private get priceAlertCreatedSuccessfullyAndroid() {
    return $('//*[contains(@text,"created") or contains(@text,"Created") or contains(@text,"successfully") or contains(@text,"Successfully")]')
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

  // New Rule form (WebView) — resource-ids from page source
  private get newRuleFormSaveBtnAndroid() {
    return $('//*[@resource-id="add-rule-save-btn"]')
  }

  private get newRuleFormConditionSelectorAndroid() {
    return $('//*[@resource-id="add-rule-condition-type"]')
  }

  private get newRuleFormTargetPricePlusBtnAndroid() {
    // Enabled (+) Button inside Target Price row (minus is enabled=false at min value)
    return $('//*[preceding-sibling::*[.//android.widget.TextView[@text="Target Price"]] or following-sibling::*[.//android.widget.TextView[@text="Target Price"]]]//android.widget.Button[@enabled="true"]')
  }

  private get instrumentLandingBuyBtnAndroid() {
    return this.byIdAndroid('instrument-landing-page-buy-btn-mobile')
  }

  private get instrumentLandingHeaderActionAndroid() {
    return $('android=new UiSelector().className("android.widget.ImageButton").instance(0)')
  }

  private get instrumentLandingFirstChartActionAndroid() {
    return $('(//android.widget.ImageButton)[2]')
  }

  private get instrumentLandingSecondChartActionAndroid() {
    return $('(//android.widget.ImageButton)[3]')
  }

  private get instrumentLandingChartTrailingActionAndroid() {
    return $('//*[@clickable="true" and @class="android.widget.TextView" and contains(@bounds,"[971,")]')
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

  private get priceAlertActionSheetAndroid() {
    return $('//*[@resource-id="bottomSheet"]')
  }

  private get priceAlertActionSheetContainerAndroid() {
    return $('//*[@resource-id="drag-bottom-container"]')
  }

  private get priceAlertActionSheetHandleAndroid() {
    return $('//*[@resource-id="drag-bottom-handle"]')
  }

  private get priceAlertActionSheetDeleteAndroid() {
    return $('//*[@resource-id="bottomSheet"]//android.widget.TextView[@text="Delete"]')
  }

  private get priceAlertActionSheetDeleteRowAndroid() {
    return $('//*[@resource-id="bottomSheet"]//android.widget.TextView[@text="Delete"]/parent::android.view.View')
  }

  private get priceAlertActionSheetViewAndroid() {
    return $('//*[@resource-id="bottomSheet"]//android.widget.TextView[@text="View"]')
  }

  private get priceAlertActionSheetEditAndroid() {
    return $('//*[@resource-id="bottomSheet"]//android.widget.TextView[@text="Edit"]')
  }

  private get priceAlertActionSheetDeactivateAndroid() {
    return $('//*[@resource-id="bottomSheet"]//android.widget.TextView[@text="Deactivate"]')
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
      this.priceAlertsEntryAndroidByParent,
      this.priceAlertsEntryAndroidByXpathAncestor,
      this.priceAlertsEntryAndroid,
      this.androidTextContains('Price Alerts'),
    ]

    await this.waitForAnyDisplayed(entryCandidates, 20000, 'Price Alerts entry')
    await this.tapFirstDisplayed(entryCandidates, 'Price Alerts entry')
    await this.waitForPriceAlertsScreenAndroid()
  }

  private async openPriceAlertsFromInvestHomeAndroid() {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    await this.closeChromeCustomTabAndroid()

    const alreadyOnAlerts = await this.isOnPriceAlertsScreenAndroid()
    if (alreadyOnAlerts) return

    await this.investTabAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.investTabAndroid)
    await browser.pause(800)

    const entryCandidates = [
      this.priceAlertsEntryAndroidByParent,
      this.priceAlertsEntryAndroidByXpathAncestor,
      this.priceAlertsEntryAndroid,
      this.androidTextContains('Price Alerts'),
    ]

    await this.waitForAnyDisplayed(entryCandidates, 20000, 'Price Alerts entry from Invest home')
    await this.tapFirstDisplayed(entryCandidates, 'Price Alerts entry from Invest home')
    await this.waitForPriceAlertsScreenAndroid()
  }

  private async returnFromCreatedAlertToPriceAlertsAndroid() {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    await this.closeChromeCustomTabAndroid()

    // After "+1%" the app shows a success/created state on the instrument surface.
    // Use OS back here; the WebView may expose unrelated Back-like elements.
    await browser.back().catch(() => {})
    await browser.pause(1200)

    await this.openPriceAlertsFromInvestHomeAndroid()
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
      this.investSearchHeaderInputAndroid,
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

  private rectsOverlap(a: Rect, b: Rect) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
  }

  private async displayedRect(el: WebdriverIO.Element): Promise<Rect | null> {
    if (!(await el.isDisplayed().catch(() => false))) return null

    const loc = await el.getLocation()
    const size = await el.getSize()
    if (!size || size.width <= 0 || size.height <= 0) return null

    return {
      x: Number(loc.x),
      y: Number(loc.y),
      width: Number(size.width),
      height: Number(size.height),
    }
  }

  private async overlapsBuySurfaceAndroid(el: WebdriverIO.Element) {
    const elRect = await this.displayedRect(el)
    if (!elRect) return false

    const buySurfaceCandidates = [
      this.instrumentLandingBuyBtnAndroid,
      this.placeBuyOrderBtnAndroid,
    ]

    for (const candidate of buySurfaceCandidates) {
      const resolved = (await candidate) as unknown as WebdriverIO.Element
      const rect = await this.displayedRect(resolved).catch(() => null)
      if (rect && this.rectsOverlap(elRect, rect)) return true
    }

    return false
  }

  private async isInChromeCustomTabAndroid() {
    if (!browser.isAndroid) return false

    const pkg = await browser.getCurrentPackage().catch(() => '')
    const activity = await browser.getCurrentActivity().catch(() => '')
    return String(pkg).includes('chrome') || String(activity).includes('CustomTabActivity')
  }

  private async closeChromeCustomTabAndroid() {
    if (!(await this.isInChromeCustomTabAndroid())) return

    await this.byIdAndroid('close_button').click().catch(async () => {
      await browser.back().catch(() => {})
    })
    await browser.pause(1000)
  }

  private async isPriceAlertCreateSurfaceAndroid() {
    // Strict anchors only — "Price Alert" text alone also matches the instrument landing page button
    const anchors = [
      this.addNewPriceAlertAnchorAndroid,           // "Add a New Price Alert"
      this.saveBtnAndroidById,                       // priceAlerts_button_save (resource-id)
      this.saveBtnAndroidByText,                     // "Save" button
      this.saveBtnAndroidByDesc,                     // "Save" description
      this.androidTextContains('New Rule'),           // form header
      this.androidTextContains('Target Price'),       // form field label (more specific than "Target")
      this.plusOnePercentAndroidByText,              // "+1%" preset button itself
      this.plusOnePercentAndroidByTextContains,
    ]

    for (const anchor of anchors) {
      const el = (await anchor) as unknown as WebdriverIO.Element
      if (await el.isDisplayed().catch(() => false)) return true
    }

    return false
  }

  private async getSafePlusOnePercentAndroid() {
    const plusCandidates = [this.plusOnePercentAndroidByText, this.plusOnePercentAndroidByTextContains]

    for (const candidate of plusCandidates) {
      const el = (await candidate) as unknown as WebdriverIO.Element
      if (!(await el.isDisplayed().catch(() => false))) continue
      if (await this.overlapsBuySurfaceAndroid(el)) continue
      return el
    }

    return null
  }

  private async ensurePlusOneVisibleByScrollingAndroid(maxScrolls = 8) {
    for (let i = 0; i < maxScrolls; i += 1) {
      if (await this.isOnNewOrderScreenAndroid()) {
        await this.debugSnapshot('price-alerts-android-new-order-before-plus-scroll')
        throw new Error('Stopped price-alert +1% scroll because New Order screen is open (Android)')
      }

      const plus = await this.getSafePlusOnePercentAndroid()
      if (plus) return

      await this.scrollDownOnceAndroid()
    }

    throw new Error('+1% option not visible outside Buy surface after scrolling price-alert instrument screen (Android)')
  }

  private async pickPlusOnePercentAndReturnAndroid() {
    // Hard stop: New Order screen must not be open at this point
    if (await this.isOnNewOrderScreenAndroid()) {
      await this.debugSnapshot('price-alerts-android-new-order-at-plus1-entry')
      throw new Error('New Order screen is open at start of +1% flow — wrong screen (Android)')
    }

    // Hard stop: must be on the price alert create surface
    const onCreateSurface = await this.isPriceAlertCreateSurfaceAndroid()
    if (!onCreateSurface) {
      await this.debugSnapshot('price-alerts-android-not-on-create-surface')
      throw new Error('Not on Price Alert create surface when trying to tap +1% (Android)')
    }

    let plus = await browser.waitUntil(
      async () => {
        // Abort immediately if New Order sneaks in during scroll
        if (await this.isOnNewOrderScreenAndroid()) {
          throw new Error('New Order screen appeared while waiting for +1% (Android)')
        }
        return this.getSafePlusOnePercentAndroid()
      },
      {
        timeout: 6000,
        interval: 500,
        timeoutMsg: '+1% option not visible on Price Alert create surface (Android)',
      }
    ).then((el) => el as WebdriverIO.Element | null).catch(() => null)

    if (!plus) {
      await this.ensurePlusOneVisibleByScrollingAndroid(8)
      plus = await this.getSafePlusOnePercentAndroid()
    }

    if (await this.isOnNewOrderScreenAndroid()) {
      await this.debugSnapshot('price-alerts-android-new-order-before-plus-tap')
      throw new Error('New Order screen appeared before tapping +1% (Android)')
    }

    if (!plus) {
      await this.debugSnapshot('price-alerts-android-plus-overlaps-buy')
      throw new Error('+1% option not safe to tap — overlaps Buy surface (Android)')
    }

    await plus.click()
    await browser.pause(800)
    if (await this.isInChromeCustomTabAndroid()) {
      await this.closeChromeCustomTabAndroid()
      throw new Error('+1% tap opened Chrome custom tab instead of Price Alert detail (Android)')
    }

    const detailAnchors = [
      this.priceAlertAddedSuccessfullyAndroid,
      this.priceAlertCreatedSuccessfullyAndroid,
      this.alertSummaryAndroidByXpathBmw,
      this.alertSummaryAndroidByTextContains,
      this.alertSummaryAndroidByXpathContains,
      this.deleteBtnAndroidById,
      this.deleteBtnAndroidByText,
      this.deleteBtnAndroidByDesc,
    ]
    await this.waitForAnyDisplayed(detailAnchors, 12000, 'Created alert detail/summary (Android)')
      .catch(() => {})

    await this.returnFromCreatedAlertToPriceAlertsAndroid()
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

  private async isOnNewRuleFormAndroid() {
    const anchors = [
      this.newRuleFormConditionSelectorAndroid,
      this.newRuleFormSaveBtnAndroid,
      this.androidText('New Rule'),
    ]
    for (const el of anchors) {
      if (await (el as unknown as WebdriverIO.Element).isDisplayed().catch(() => false)) return true
    }
    return false
  }

  private async fillNewRuleFormAndroid() {
    await this.waitForAnyDisplayed(
      [this.newRuleFormConditionSelectorAndroid, this.newRuleFormSaveBtnAndroid, this.androidText('New Rule')],
      15000,
      'New Rule form (Android)'
    )

    // Select condition (Greater than) — required to enable Save
    const conditionShown = await this.newRuleFormConditionSelectorAndroid.isDisplayed().catch(() => false)
    if (conditionShown) {
      await (this.newRuleFormConditionSelectorAndroid as unknown as WebdriverIO.Element).click()
      await browser.pause(500)

      const conditionOptions = [
        $('//*[contains(@text,"Greater than")]'),
        $('//android.widget.CheckedTextView[contains(@text,"Greater than")]'),
        $('//android.widget.TextView[contains(@text,"Greater than")]'),
        $('//android.view.View[contains(@text,"Greater than")]'),
        $('//android.widget.ListView//android.widget.CheckedTextView[1]'),
        $('//android.widget.ListView//android.widget.TextView[1]'),
      ]
      const optionShown = await this.waitForAnyDisplayed(conditionOptions, 4000, 'Condition option (Android)').then(() => true).catch(() => false)
      if (optionShown) {
        await this.tapFirstDisplayed(conditionOptions, 'Greater than condition option')
        await browser.pause(300)
      }
    }

    // Increment Target Price via + button to give Save a non-zero value
    const plusBtnXpath = '//*[@resource-id="add-rule-condition-type"]/following::android.widget.Button[@enabled="true"][1]'
    const plusBtn = $(plusBtnXpath)
    const plusShown = await (plusBtn as unknown as WebdriverIO.Element).isDisplayed().catch(() => false)
    if (plusShown) {
      for (let i = 0; i < 3; i++) {
        await (plusBtn as unknown as WebdriverIO.Element).click().catch(() => {})
        await browser.pause(120)
      }
    } else {
      // Fallback: use the getter
      const plusFallback = this.newRuleFormTargetPricePlusBtnAndroid
      const fallbackShown = await (plusFallback as unknown as WebdriverIO.Element).isDisplayed().catch(() => false)
      if (fallbackShown) {
        for (let i = 0; i < 3; i++) {
          await (plusFallback as unknown as WebdriverIO.Element).click().catch(() => {})
          await browser.pause(120)
        }
      }
    }

    // Wait for Save to become enabled then tap it
    const saveBtn = this.newRuleFormSaveBtnAndroid
    await browser.waitUntil(
      async () => (await (saveBtn as unknown as WebdriverIO.Element).isEnabled().catch(() => false)),
      { timeout: 10000, interval: 500, timeoutMsg: 'Save button did not become enabled on New Rule form (Android)' }
    ).catch(() => {})

    await (saveBtn as unknown as WebdriverIO.Element).click().catch(() => {})
    await browser.pause(1500)
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

    const listShown = await this.waitForAnyDisplayed([this.investSearchResultsListAndroid], 12000, `Search results list for ${q}`)
      .then(() => true)
      .catch(() => false)

    if (listShown) {
      const firstRow = (await this.firstInvestSearchResultAndroid) as unknown as WebdriverIO.Element
      if (await firstRow.isDisplayed().catch(() => false)) {
        await this.tapLeftCenterOnElement(firstRow)
        return
      }

      const firstRowText = (await this.firstInvestSearchResultTextAndroid) as unknown as WebdriverIO.Element
      if (await firstRowText.isDisplayed().catch(() => false)) {
        await firstRowText.click()
        await browser.pause(600)
        return
      }
    }

    // IMPORTANT: avoid matching the input itself (it may contain the typed query).
    // Restrict to likely result containers and content descriptions.
    const candidates = [
      this.bmwSearchResultImageAndroid,
      this.bmw3SearchResultImageAndroid,
      this.firstInvestSearchResultAndroid,
      $(`android=new UiSelector().className("android.view.View").descriptionContains("${q}")`),
      $(`android=new UiSelector().className("android.view.View").descriptionContains("${qTitle}")`),
      $(`//android.view.View[contains(@content-desc,"${q}")]`),
      $(`//*[contains(@content-desc,"${q.toUpperCase()}")]`),
    ]

    // Wait a bit for results; fall back to any clickable item in the first result list
    const shown = await this.waitForAnyDisplayed([this.investSearchResultsListAndroid, ...candidates], 22000, `Search result for ${q}`).then(() => true).catch(() => false)
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

    // Fallback: some webview-backed results appear as android.view.View with content-desc.
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

    // Mirror iOS: Price Alerts → New tab → Find Instrument → select → +1%
    // Do NOT go through invest home search → instrument landing (that path lands on New Order)
    await this.openPriceAlertsAndroid()
    await this.goToNewTabAndroid()

    // Type in the Find Instrument field inside the New tab (not global invest search)
    await this.waitForFindInstrumentInputAndroid()
    await this.typeInstrumentQueryAndroid(params.instrumentQuery)

    // Select the instrument from results
    await this.selectFirstSearchResultAndroid(params.instrumentQuery)
    await browser.pause(800)

    // Hard stop — selecting instrument must NOT open New Order
    if (await this.isOnNewOrderScreenAndroid()) {
      await this.debugSnapshot('price-alerts-android-new-order-after-instrument-select')
      throw new Error('Selecting instrument from Price Alerts New tab opened New Order screen (Android)')
    }

    // New Rule form (Condition + Target Price + Save) or legacy +1% preset buttons
    if (await this.isOnNewRuleFormAndroid()) {
      await this.fillNewRuleFormAndroid()
    } else {
      await this.pickPlusOnePercentAndReturnAndroid()
    }

    await this.openPriceAlertsAndroid()
    await this.goToOverviewTabAndroid()

    const rowCandidates = this.alertRowCandidatesAndroid(params.instrumentQuery)
    await this.waitForAnyDisplayed(rowCandidates, 20000, 'Created alert row (Android)')
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

  private async tapLeftCenterOnElement(el: WebdriverIO.Element) {
    const loc = await el.getLocation()
    const size = await el.getSize()
    const x = Math.round(loc.x + size.width * 0.25)
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
    await browser.pause(600)
  }

  public async deletePriceAlertAndroid(instrumentQuery: string) {
    if (!browser.isAndroid) return

    await this.openPriceAlertsFromInvestHomeAndroid()
    await this.goToOverviewTabAndroid()

    const rowCandidates = this.alertRowCandidatesAndroid(instrumentQuery)
    const rowOpenCandidates = this.alertRowOpenCandidatesAndroid(instrumentQuery)
    await this.waitForAnyDisplayed(rowCandidates, 15000, 'Alert row to delete')

    // Open the alert details first, same idea as on iOS: tap BMW / summary row.
    const row = await this.getFirstDisplayed(rowOpenCandidates, 'Alert row to open')
    await this.tapCenterOnElement(row)
    await browser.pause(800)

    const actionSheetCandidates = [
      this.priceAlertActionSheetDeleteRowAndroid,
      this.priceAlertActionSheetDeleteAndroid,
      this.priceAlertActionSheetAndroid,
      this.priceAlertActionSheetContainerAndroid,
      this.priceAlertActionSheetHandleAndroid,
      this.priceAlertActionSheetViewAndroid,
      this.priceAlertActionSheetEditAndroid,
      this.priceAlertActionSheetDeactivateAndroid,
    ]

    await this.waitForAnyDisplayed(actionSheetCandidates, 6000, 'Price alert action sheet')
      .catch(() => {})

    const deleteCandidates = [
      this.priceAlertActionSheetDeleteRowAndroid,
      this.priceAlertActionSheetDeleteAndroid,
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
      const deleteEl = await this.getFirstDisplayed(deleteCandidates, 'Delete button')
      await this.tapCenterOnElement(deleteEl)
      await browser.pause(800)
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
          const deleteEl = await this.getFirstDisplayed(deleteCandidates, 'Delete button after swipe')
          await this.tapCenterOnElement(deleteEl)
          await browser.pause(800)
          deletedViaSwipe = true
          break
        }
      }

      if (!deletedViaSwipe) {
        await this.debugSnapshot('price-alerts-delete-not-found-after-swipe')
        throw new Error('Delete button after swipe did not appear')
      }
    }

    // Confirm deletion if a dialog appears (delete may be immediate with no dialog)
    const confirmCandidates = [
      this.confirmBtnAndroidByTextConfirm,
      this.confirmBtnAndroidByIdButton1,
      this.androidTextContains('Confirm'),
    ]

    const confirmShown = await this.waitForAnyDisplayed(confirmCandidates, 4000, 'Confirm delete')
      .then(() => true)
      .catch(() => false)

    if (confirmShown) {
      await this.tapFirstDisplayed(confirmCandidates, 'Confirm delete').catch(() => {})
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
