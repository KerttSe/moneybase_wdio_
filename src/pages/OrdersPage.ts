import BasePage from './BasePage'
import { $, $$, browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'

type WdioEl = ChainablePromiseElement

type BuyOrderFlowParams = {
  instrumentQuery: string
  initialQuantity: string
  modifiedQuantity: string
}

export default class OrdersPage extends BasePage {
  private byIdAndroid(name: string) {
    const rx = `.*:id/${name}$|^${name}$`
    return $(`android=new UiSelector().resourceIdMatches("${rx}")`)
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

  private iosA11y(id: string) {
    return $(`~${id}`)
  }

  private iosPredicate(predicate: string) {
    return $(`-ios predicate string:${predicate}`)
  }

  private iosClassChain(chain: string) {
    return $(`-ios class chain:${chain}`)
  }

  private predicateText(value: string) {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  }

  private dialogXPath() {
    return '//XCUIElementTypeOther[contains(@name,"діалогове") or contains(@label,"діалогове") or contains(@name,"dialog") or contains(@label,"dialog")]'
  }

  private get investTabIOS() {
    return this.iosA11y('Invest')
  }

  private get investTabAndroid() {
    return this.byIdAndroid('navigation_button_invest')
  }

  private get searchInputAndroidById() {
    return this.byIdAndroid('globalCodeInput')
  }

  private get searchInputAndroidFieldByLabel() {
    return $('//android.widget.TextView[contains(@text,"Search Instrument")]/following::android.widget.EditText[1]')
  }

  private get searchInputAndroidByInstance() {
    return $('android=new UiSelector().className("android.widget.EditText").instance(1)')
  }

  private get searchInputAndroidByHint() {
    return this.androidTextContains('Search Instrument')
  }

  private get searchInputTriggerAndroid() {
    return $('//*[@class="android.widget.EditText"]/following-sibling::android.widget.ImageButton[1]')
  }

  private get investLoadErrorTitleAndroid() {
    return this.androidTextContains('Something went wrong')
  }

  private get investTryAgainButtonAndroid() {
    return this.androidText('Try Again')
  }

  private get bmwSearchResultImageAndroid() {
    return $('//android.widget.Image[contains(@content-desc,"BMW FSE")]')
  }

  private get bmw3SearchResultImageAndroid() {
    return $('//android.widget.Image[contains(@content-desc,"BMW3 FSE")]')
  }

  private get bmwResultRowAndroid() {
    return $('//android.widget.TextView[contains(@text,"Bmw") or contains(@text,"BMW")]/ancestor::*[@clickable="true" or @focusable="true"][1]')
  }

  private get firstInstrumentResultRowAndroid() {
    return $('//android.widget.TextView[contains(@text,"Instruments")]/following::android.view.View[@clickable="true"][1]')
  }

  private get instrumentBuyButtonAndroid() {
    return $('//*[(@class="android.widget.Button" or @clickable="true" or @focusable="true") and (contains(@text,"Buy") or contains(@text,"BUY") or contains(@content-desc,"Buy") or contains(@content-desc,"buy"))]')
  }

  private get newOrderTitleAndroid() {
    return this.androidText('New Order')
  }

  private get sharesInputAndroid() {
    return $('//android.widget.TextView[contains(@text,"Shares")]/following::android.widget.EditText[1]')
  }

  private get sharesInputAndroidByContainer() {
    return '//*[@resource-id="example-tel-input-3"]//android.widget.EditText'
  }

  private get anyEditTextAndroid() {
    return $('//android.widget.EditText[1]')
  }

  private get placeBuyOrderButtonAndroid() {
    return this.androidText('Place Buy Order')
  }

  private get buyActionButtonAndroid() {
    return $('//android.widget.Button[@clickable="true" and (@text="Place Buy Order" or @text="Buy")]')
  }

  private get buyTabAndroid() {
    return $('//*[@resource-id="Buy" or (@class="android.widget.TextView" and (@text="BUY" or @text="Buy"))]')
  }

  private get previewBuyButtonAndroid() {
    return $('//android.app.AlertDialog//android.widget.Button[@clickable="true" and (@text="Buy" or @text="BUY")]')
  }

  private get orderPreviewTitleAndroid() {
    return $('//android.app.AlertDialog//*[contains(@text,"Order Preview")]')
  }

  private get orderPreviewDialogAndroid() {
    return $('//android.app.AlertDialog[.//*[contains(@text,"Order Preview")]]')
  }

  private get orderSubmitErrorTitleAndroid() {
    return this.androidTextContains('Something went wrong')
  }

  private get orderSubmitErrorTextAndroid() {
    return this.androidTextContains('Order not submitted')
  }

  private get previewConfirmBuyButtonAndroid() {
    return $('//android.app.AlertDialog//android.widget.Button[contains(@text,"Buy") or contains(@text,"BUY")]')
  }

  private get orderDetailsTitleAndroid() {
    return this.androidTextContains('Order Details')
  }

  private get modifyOrderTitleAndroid() {
    return this.androidTextContains('Modify Order')
  }

  private statusTextAndroid(status: string) {
    return this.androidText(status)
  }

  private orderDetailsQuantityCandidatesAndroid(quantity: string) {
    return [
      $(`//android.widget.TextView[@text="Quantity"]/following::android.widget.TextView[@text="${quantity}"][1]`),
      $(`//android.widget.TextView[contains(@text,"${quantity} @")]`),
      this.androidText(quantity),
    ]
  }

  private get modifyActionAndroid() {
    return this.androidText('Modify')
  }

  private get submitButtonAndroid() {
    return this.androidText('Submit')
  }

  private get saveButtonAndroid() {
    return this.androidText('Save')
  }

  private get modifyBuyOrderButtonAndroid() {
    return this.androidText('Modify Buy Order')
  }

  private get modifyOrderPreviewDialogAndroid() {
    return $('//android.app.AlertDialog[.//*[contains(@text,"Modify Order")]]')
  }

  private get modifyBuyOrderButtonInDialogAndroid() {
    return $('//android.app.AlertDialog//android.widget.Button[@clickable="true" and @text="Modify Buy Order"]')
  }

  private get cancelActionAndroid() {
    return this.androidText('Cancel')
  }

  private get cancelActionButtonAndroid() {
    return $('//android.view.View[.//*[@text="Cancel"]]//android.widget.Button[@clickable="true"]')
  }

  private get cancelActionRowAndroid() {
    return $('//android.view.View[@hint="Your plan does not allow you to edit or cancel orders." and .//*[@text="Cancel"]]')
  }

  private get cancelOrderConfirmButtonAndroid() {
    return $('//android.app.AlertDialog//android.widget.Button[@text="Cancel Order"]')
  }

  private get cancelOrderDialogTitleAndroid() {
    return $('//android.app.AlertDialog//*[contains(@text,"Cancel Order")]')
  }

  private get ordersTabInInvestAndroid() {
    return this.androidText('Orders')
  }

  private get activeOrdersTitleAndroid() {
    return this.androidText('Active Orders')
  }

  private get recentOrdersTitleAndroid() {
    return this.androidText('Recent Orders')
  }

  private get viewAllOrdersAndroid() {
    return this.androidText('View All')
  }

  private get bmwOrderRowAndroid() {
    return $('//*[contains(@text,"Bmw Ag") or contains(@text,"BMW")]/ancestor::*[@clickable="true" or @focusable="true"][1]')
  }

  private get activeOrderRowAndroid() {
    return $('//android.widget.TextView[@text="ACTIVE"]/ancestor::android.view.View[1]')
  }

  private get recentBuyOrderRowAndroid() {
    return $('//android.widget.TextView[contains(@text,"Buy") and contains(@text,"Shares")]/ancestor::android.view.View[1]')
  }

  private get recentActiveOrderRowAndroid() {
    return $('//android.view.View[.//*[contains(@text,"Buy")] and .//*[contains(@text,"ACTIVE")]][1]')
  }

  private get activeBadgeAndroid() {
    return $('//*[contains(@text,"ACTIVE")]')
  }

  private get activeRecentOrderRowAndroid() {
    return $('//android.view.View[.//android.widget.TextView[@text="ACTIVE"] and .//android.widget.TextView[contains(@text,"Buy")]][1]')
  }

  private get activeOrderRowAndroidByInstance() {
    return $('android=new UiSelector().className("android.view.View").instance(21)')
  }

  private get activeOrderRowAndroidByXPath() {
    return $('//android.view.View[@resource-id="cc-scroll-container"]/android.view.View[2]/android.view.View[3]/android.view.View[3]/android.view.View')
  }

  private get quantityBlurAreaAndroid() {
    return $('//*[@bounds="[91,1802][987,2015]"]')
  }

  private get modifyActionContainerAndroid() {
    return $('//android.view.View[.//android.view.View[@text="Modify"]]')
  }

  private get cancelActionContainerAndroid() {
    return $('//android.view.View[.//android.view.View[@text="Cancel"]]')
  }

  private get nextBtnAndroid() {
    return this.androidText('NEXT')
  }

  private get continueBtnAndroid() {
    return this.androidText('CONTINUE')
  }

  private get searchInstrumentInputIOS() {
    return this.iosA11y('Search Instrument')
  }

  private get visibleTextFieldIOS() {
    return this.iosPredicate('type == "XCUIElementTypeTextField" AND visible == 1')
  }

  private get instrumentTitleIOS() {
    return this.iosPredicate('type == "XCUIElementTypeStaticText" AND (name == "Instrument" OR label == "Instrument")')
  }

  private get bmwInstrumentTextIOS() {
    return this.iosPredicate(
      '(type == "XCUIElementTypeStaticText" OR type == "XCUIElementTypeCell" OR type == "XCUIElementTypeLink" OR type == "XCUIElementTypeButton") AND visible == 1 AND (label CONTAINS[c] "Bmw Ag" OR name CONTAINS[c] "Bmw Ag")'
    )
  }

  private get bmwTickerTextIOS() {
    return this.iosPredicate(
      'type == "XCUIElementTypeStaticText" AND visible == 1 AND (name == "(BMW)" OR label == "(BMW)" OR value == "(BMW)")'
    )
  }

  private get bmwResultRowIOS() {
    return $(
      '//XCUIElementTypeOther[' +
        './/XCUIElementTypeStaticText[contains(@name,"Bmw Ag") or contains(@label,"Bmw Ag") or contains(@value,"Bmw Ag")]' +
        ' and ' +
        './/XCUIElementTypeStaticText[@name="(BMW)" or @label="(BMW)" or @value="(BMW)"]' +
      ']'
    )
  }

  private get instrumentBuyButtonIOS() {
    return this.iosClassChain('**/XCUIElementTypeOther[`name == "основний"`]/**/XCUIElementTypeButton[`name == "Buy" OR label == "Buy"`]')
  }

  private get newOrderTitleIOS() {
    return this.iosPredicate('type == "XCUIElementTypeStaticText" AND (name == "New Order" OR label == "New Order")')
  }

  private get sharesInputIOS() {
    return $('//XCUIElementTypeStaticText[@name="Shares" or @label="Shares" or @value="Shares"]/following::XCUIElementTypeTextField[1]')
  }

  private get placeBuyOrderButtonIOS() {
    return this.iosA11y('Place Buy Order')
  }

  private get orderPreviewDialogIOS() {
    return $(this.dialogXPath())
  }

  private get buyButtonInPreviewIOS() {
    return $(`${this.dialogXPath()}//XCUIElementTypeButton[contains(@name,"Buy") or contains(@label,"Buy")]`)
  }

  private get orderDetailsTitleIOS() {
    return this.iosPredicate('type == "XCUIElementTypeStaticText" AND (name == "Order Details" OR label == "Order Details")')
  }

  private get modifyActionIOS() {
    return this.iosPredicate('type == "XCUIElementTypeStaticText" AND (name == "Modify" OR label == "Modify")')
  }

  private get submitButtonIOS() {
    return this.iosA11y('Submit')
  }

  private get saveButtonIOS() {
    return this.iosA11y('Save')
  }

  private get modifyOrderPreviewTitleIOS() {
    return $(`${this.dialogXPath()}//XCUIElementTypeStaticText[@name="Modify Order" or @label="Modify Order" or @value="Modify Order"]`)
  }

  private get modifyBuyOrderButtonIOS() {
    return this.iosA11y('Modify Buy Order')
  }

  private get orderModificationFailedDialogIOS() {
    return $(`${this.dialogXPath()}//XCUIElementTypeStaticText[@name="Something went wrong" or @label="Something went wrong" or contains(@name,"Order modification failed") or contains(@label,"Order modification failed")]`)
  }

  private get cancelActionIOS() {
    return this.iosPredicate('type == "XCUIElementTypeStaticText" AND (name == "Cancel" OR label == "Cancel")')
  }

  private get cancelOrderDialogIOS() {
    return this.iosPredicate('label CONTAINS[c] "Cancel Order" OR name CONTAINS[c] "Cancel Order"')
  }

  private get cancelOrderConfirmButtonIOS() {
    return $('//XCUIElementTypeOther[contains(@name,"Cancel Order") or contains(@label,"Cancel Order")]//XCUIElementTypeButton[@name="Cancel Order" or @label="Cancel Order"]')
  }

  private get keyboardIOS() {
    return $('//XCUIElementTypeKeyboard')
  }

  private async waitForAnyDisplayed(candidates: Array<WdioEl | WebdriverIO.Element>, timeout = 10000, label = 'element') {
    await browser.waitUntil(
      async () => {
        for (const el of candidates) {
          let resolved: WebdriverIO.Element
          try {
            resolved = (await el) as WebdriverIO.Element
          } catch {
            continue
          }
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

  private async getFirstDisplayed(candidates: Array<WdioEl | WebdriverIO.Element>, label = 'element') {
    for (const el of candidates) {
      let resolved: WebdriverIO.Element
      try {
        resolved = (await el) as WebdriverIO.Element
      } catch {
        continue
      }
      if (await resolved.isDisplayed().catch(() => false)) return resolved
    }

    throw new Error(`${label} did not appear`)
  }

  private async tapFirstDisplayed(candidates: Array<WdioEl | WebdriverIO.Element>, label = 'element') {
    const el = await this.getFirstDisplayed(candidates, label)
    await this.tapCenterOnElement(el)
  }

  private async tapIOSDisplayed(el: WdioEl | WebdriverIO.Element, timeout = 10000) {
    const resolved = (await el) as WebdriverIO.Element
    await resolved.waitForDisplayed({ timeout })
    await this.tapCenterOnElement(resolved)
  }

  private async tapCenterOnElement(el: WebdriverIO.Element) {
    if (browser.isAndroid) {
      const loc = await el.getLocation()
      const size = await el.getSize()
      const x = Math.round(loc.x + size.width / 2)
      const y = Math.round(loc.y + size.height / 2)

      await browser.performActions([
        {
          type: 'pointer',
          id: 'finger-android',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x, y },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])
      await browser.pause(350)
      return
    }

    const loc = await el.getLocation()
    const size = await el.getSize()
    const x = Math.round(loc.x + size.width / 2)
    const y = Math.round(loc.y + size.height / 2)
    await browser.execute('mobile: tap', { x, y })
    await browser.pause(450)
  }

  private async tapAt(x: number, y: number) {
    const tx = Math.round(x)
    const ty = Math.round(y)

    if (browser.isAndroid) {
      await browser.performActions([
        {
          type: 'pointer',
          id: 'finger-android-point',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: tx, y: ty },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])
      await browser.pause(350)
      return
    }

    await browser.execute('mobile: tap', { x: tx, y: ty })
    await browser.pause(450)
  }

  private async dismissBottomSheetGestureAndroid() {
    if (!browser.isAndroid) return

    // Bottom-sheet handle area from XML is around y≈1590. Tap handle and swipe down.
    await this.tapAt(540, 1596).catch(() => {})
    await browser.pause(120)

    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger-android-dismiss-sheet',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: 540, y: 1620 },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 120 },
          { type: 'pointerMove', duration: 420, x: 540, y: 2330 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]).catch(() => {})

    await browser.releaseActions().catch(() => {})
    await browser.pause(220)
  }

  private async tapSearchResultRowIOS(el: WebdriverIO.Element) {
    const loc = await el.getLocation()
    const size = await el.getSize()
    const { width } = await browser.getWindowRect()
    const centerY = Math.round(loc.y + size.height / 2)

    // Search results often expose a tiny text container instead of the whole row.
    // Keep the BMW row's Y position, but tap the screen center to hit the row itself.
    await this.tapAt(Math.round(width * 0.5), centerY)
  }

  private async isKeyboardVisibleIOS() {
    return this.keyboardIOS.isDisplayed().catch(() => false)
  }

  private async waitForKeyboardHiddenIOS(timeout = 2500) {
    return browser
      .waitUntil(async () => !(await this.isKeyboardVisibleIOS()), {
        timeout,
        interval: 250,
      })
      .then(() => true)
      .catch(() => false)
  }

  private async dismissKeyboardAfterInputIOS() {
    if (!(await this.isKeyboardVisibleIOS())) return

    const keyboardControls = [
      this.iosA11y('Done'),
      this.iosA11y('Return'),
      this.iosA11y('Go'),
      this.iosA11y('Search'),
      this.iosA11y('selected'),
      this.iosPredicate(
        'type == "XCUIElementTypeButton" AND visible == 1 AND (name == "Done" OR label == "Done" OR name == "Return" OR label == "Return" OR name == "Go" OR label == "Go" OR name == "selected" OR label == "selected")'
      ),
    ]

    for (const control of keyboardControls) {
      const el = (await control) as unknown as WebdriverIO.Element
      if (await el.isDisplayed().catch(() => false)) {
        await this.tapCenterOnElement(el)
        if (await this.waitForKeyboardHiddenIOS()) return
      }
    }

    await this.tapAt(200, 235)
    if (await this.waitForKeyboardHiddenIOS()) return

    // The webview sometimes exposes a small keyboard toolbar above the keypad.
    await this.tapAt(360, 520)
    await this.waitForKeyboardHiddenIOS()
  }

  private async scrollDownOnceIOS() {
    const { width, height } = await browser.getWindowRect()
    const startX = Math.round(width * 0.5)
    const startY = Math.round(height * 0.76)
    const endY = Math.round(height * 0.28)

    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 120 },
          { type: 'pointerMove', duration: 600, x: startX, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
    await browser.pause(500)
  }

  private async waitAndScrollToAnyIOS(candidates: Array<WdioEl | WebdriverIO.Element>, label: string, maxScrolls = 6) {
    for (let i = 0; i <= maxScrolls; i += 1) {
      const shown = await this.waitForAnyDisplayed(candidates, 2500, label)
        .then(() => true)
        .catch(() => false)
      if (shown) return
      if (i < maxScrolls) await this.scrollDownOnceIOS()
    }

    await this.debugSnapshot(`orders-ios-${label.toLowerCase().replace(/\s+/g, '-')}-missing`)
    throw new Error(`${label} did not appear`)
  }

  private async openInvestSearchIOS() {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    await this.tapIOSDisplayed(this.investTabIOS, 20000)

    const searchCandidates = [this.searchInstrumentInputIOS, this.visibleTextFieldIOS]
    await this.waitForAnyDisplayed(searchCandidates, 20000, 'Invest instrument search (iOS)')
  }

  private async dismissInvestTutorialAndroid() {
    const tutorialCandidates = [
      this.nextBtnAndroid,
      this.androidTextContains('NEXT'),
      this.continueBtnAndroid,
      this.androidTextContains('CONTINUE'),
    ]

    for (let i = 0; i < 4; i += 1) {
      const shown = await this.waitForAnyDisplayed(tutorialCandidates, 3500, 'Invest tutorial (Android)')
        .then(() => true)
        .catch(() => false)

      if (!shown) break
      await this.tapFirstDisplayed(tutorialCandidates, 'Invest tutorial (Android)')
      await browser.pause(350)
    }
  }

  private async openInvestSearchAndroid() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    const investShown = await this.investTabAndroid.waitForDisplayed({ timeout: 8000 }).then(() => true).catch(() => false)
    if (investShown) {
      await this.investTabAndroid.click()
    }

    await this.dismissInvestTutorialAndroid()
    await this.recoverInvestLoadErrorAndroid()

    const searchCandidates = [this.searchInputAndroidByInstance, this.searchInputAndroidByHint, this.searchInputAndroidById]
    const searchShown = await this.waitForAnyDisplayed(searchCandidates, 20000, 'Invest instrument search (Android)')
      .then(() => true)
      .catch(() => false)

    if (!searchShown) {
      await this.recoverInvestLoadErrorAndroid()
      await this.waitForAnyDisplayed(searchCandidates, 20000, 'Invest instrument search (Android)')
    }
  }

  private async recoverInvestLoadErrorAndroid() {
    const errorShown = await this.investLoadErrorTitleAndroid.isDisplayed().catch(() => false)
    if (!errorShown) return

    const tryAgainShown = await this.investTryAgainButtonAndroid.isDisplayed().catch(() => false)
    if (!tryAgainShown) return

    await this.tapCenterOnElement(await this.getFirstDisplayed([this.investTryAgainButtonAndroid], 'Try Again button (Android)'))
    await browser.pause(1500)
  }

  private async typeInstrumentQueryAndroid(query: string) {
    const searchCandidates = [this.searchInputAndroidByInstance, this.searchInputAndroidByHint, this.searchInputAndroidById]
    const input = await this.getFirstDisplayed(searchCandidates, 'Invest instrument search input (Android)')

    await this.tapCenterOnElement(input)
    await input.clearValue().catch(() => {})
    const typed = await input
      .setValue(query)
      .then(() => true)
      .catch(() => false)

    if (!typed) {
      const searchHint = await this.getFirstDisplayed([this.searchInputAndroidByHint], 'Search Instrument hint (Android)')
      await this.tapCenterOnElement(searchHint)
      await browser.keys(query)
    }

    await browser.keys(['Enter']).catch(() => {})
    const triggerShown = await this.searchInputTriggerAndroid.isDisplayed().catch(() => false)
    if (triggerShown) {
      const trigger = await this.getFirstDisplayed([this.searchInputTriggerAndroid], 'Search trigger (Android)')
      await this.tapCenterOnElement(trigger)
    }
    await browser.hideKeyboard().catch(() => {})

    await browser.pause(700)
  }

  private async selectInstrumentResultAndroid(query: string) {
    const resultCandidates = [
      this.bmwSearchResultImageAndroid,
      this.bmw3SearchResultImageAndroid,
      this.firstInstrumentResultRowAndroid,
      this.bmwResultRowAndroid,
      this.androidTextContains(query),
      this.androidDescContains('BMW'),
      $('//android.widget.TextView[contains(@text,"(")]/ancestor::*[@clickable="true" or @focusable="true"][1]'),
    ]

    await this.waitForAnyDisplayed(resultCandidates, 20000, `Instrument result ${query} (Android)`)

    const destinationCandidates = [this.instrumentBuyButtonAndroid, this.newOrderTitleAndroid, this.placeBuyOrderButtonAndroid]

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await this.tapFirstDisplayed(resultCandidates, `Instrument result ${query} (Android)`)

      const opened = await this.waitForAnyDisplayed(destinationCandidates, 7000, 'Instrument/New Order screen (Android)')
        .then(() => true)
        .catch(() => false)

      if (opened) return
      await browser.pause(500)
    }

    throw new Error('Instrument/New Order screen (Android) did not appear')
  }

  private async openInstrumentFromInvestLocatorAndroid(query: string) {
    await this.openInvestSearchAndroid()
    await this.typeInstrumentQueryAndroid(query)
    await this.selectInstrumentResultAndroid(query)
  }

  private async openNewBuyOrderAndroid() {
    const alreadyOnOrder = await this.newOrderTitleAndroid.isDisplayed().catch(() => false)
    if (alreadyOnOrder) return

    await this.waitForAnyDisplayed([this.instrumentBuyButtonAndroid], 20000, 'Instrument Buy button (Android)')
    await this.tapFirstDisplayed([this.instrumentBuyButtonAndroid], 'Instrument Buy button (Android)')
    await this.waitForAnyDisplayed([this.newOrderTitleAndroid, this.placeBuyOrderButtonAndroid], 20000, 'New Order screen (Android)')
  }

  private async setQuantityAndroid(quantity: string) {
    const normalizeQty = (v: string) => String(v).replace(/[^0-9.]/g, '')
    const readQty = async (el: WebdriverIO.Element) => {
      const viaAttr = String(await el.getAttribute('text').catch(() => ''))
      const viaText = String(await el.getText().catch(() => ''))
      const best = [viaAttr, viaText].sort((a, b) => b.length - a.length)[0] || ''
      return normalizeQty(best)
    }

    const findQuantityInput = async () => {
      const editTexts = await $$('//android.widget.EditText')
      let globalInput: WebdriverIO.Element | null = null

      for (const el of editTexts) {
        const shown = await el.isDisplayed().catch(() => false)
        if (!shown) continue

        const resId = String(await el.getAttribute('resource-id').catch(() => ''))
        const loc = await el.getLocation().catch(() => ({ x: 0, y: 0 }))

        if (resId.includes('globalCodeInput')) {
          globalInput = el as unknown as WebdriverIO.Element
          continue
        }

        if (loc.y < 300) continue
        return el as unknown as WebdriverIO.Element
      }

      if (globalInput) return globalInput
      return null
    }

    const waitForQuantityInput = async () => {
      await browser.waitUntil(
        async () => {
          const input = await findQuantityInput()
          return Boolean(input)
        },
        {
          timeout: 15000,
          interval: 500,
          timeoutMsg: 'Shares quantity input (Android) did not appear',
        }
      )
    }

    const refreshNewOrderScreenAndroid = async () => {
      // If quantity field is missing, refresh this screen: re-select BUY and reopen New Order.
      const buyTabShown = await this.buyTabAndroid.isDisplayed().catch(() => false)
      if (buyTabShown) {
        await this.tapCenterOnElement(await this.getFirstDisplayed([this.buyTabAndroid], 'BUY tab (Android)'))
        await browser.pause(700)
      }

      const onNewOrder = await this.newOrderTitleAndroid.isDisplayed().catch(() => false)
      if (onNewOrder) {
        await browser.back().catch(() => {})
        await browser.pause(900)

        const buyShown = await this.instrumentBuyButtonAndroid.isDisplayed().catch(() => false)
        if (buyShown) {
          await this.tapFirstDisplayed([this.instrumentBuyButtonAndroid], 'Instrument Buy button (Android)')
          await this.waitForAnyDisplayed([this.newOrderTitleAndroid, this.placeBuyOrderButtonAndroid], 12000, 'New Order screen (Android)')
        }
      }
    }

    try {
      await waitForQuantityInput()
    } catch {
      await refreshNewOrderScreenAndroid()
      await waitForQuantityInput()
    }

    const expected = normalizeQty(quantity)
    const ctaCandidates = [this.placeBuyOrderButtonAndroid, this.buyActionButtonAndroid, this.submitButtonAndroid, this.saveButtonAndroid]

    const isAnySubmitCtaEnabled = async () => {
      for (const cta of ctaCandidates) {
        const shown = await cta.isDisplayed().catch(() => false)
        if (!shown) continue
        const enabled = await cta.isEnabled().catch(() => false)
        if (enabled) return true
      }
      return false
    }

    const typeExactQuantity = async () => {
      const trimUnexpectedSuffix = async (el: WebdriverIO.Element, current: string) => {
        let actual = current

        for (let i = 0; i < 4; i += 1) {
          if (actual === expected) return true

          if (actual.length > expected.length && actual.startsWith(expected)) {
            await this.tapCenterOnElement(el).catch(() => {})
            await browser.keys('\uE003').catch(() => {})
            await browser.pause(90)
            actual = await readQty(el)
            continue
          }

          return false
        }

        return actual === expected
      }

      let lastActual = ''

      for (let attempt = 0; attempt < 2; attempt += 1) {
        const activeInput = await findQuantityInput()
        if (!activeInput) throw new Error('Shares quantity input (Android) did not appear')
        const resId = String(await activeInput.getAttribute('resource-id').catch(() => ''))
        const isGlobalCodeInput = resId.includes('globalCodeInput')

        await this.tapCenterOnElement(activeInput)
        await browser.pause(100)

        if (!isGlobalCodeInput) {
          await activeInput.clearValue().catch(() => {})
          await browser.pause(80)
          await activeInput.clearValue().catch(() => {})
          await browser.pause(80)
        } else {
          for (let i = 0; i < 6; i += 1) {
            await browser.keys('\uE003').catch(() => {})
          }
          await browser.pause(80)
        }

        await browser.keys(quantity)

        await browser.pause(120)

        let actual = await readQty(activeInput)
        if (actual && actual !== expected) {
          const fixed = await trimUnexpectedSuffix(activeInput, actual)
          if (fixed) {
            actual = await readQty(activeInput)
          }
        }
        lastActual = actual

        // Blur input so UI can recalculate CTA state.
        const blurAreaShown = await this.quantityBlurAreaAndroid.isDisplayed().catch(() => false)
        if (blurAreaShown) {
          await this.tapCenterOnElement(await this.getFirstDisplayed([this.quantityBlurAreaAndroid], 'Quantity blur area (Android)'))
        } else {
          await browser.hideKeyboard().catch(() => {})
          await this.tapAt(540, 820).catch(() => {})
        }
        await browser.pause(220)

        actual = await readQty(activeInput)
        lastActual = actual
        if (actual === expected) return

        // Some Android webview builds don't expose input text. In that case rely on CTA enabled state.
        if (!actual) {
          const ctaEnabled = await isAnySubmitCtaEnabled()
          if (ctaEnabled) return
        }
      }

      if (!lastActual) {
        const ctaEnabled = await isAnySubmitCtaEnabled()
        if (ctaEnabled) return
      }

      throw new Error(`Shares quantity value mismatch (Android): expected ${quantity}`)
    }

    await typeExactQuantity()

    const buyTabShown = await this.buyTabAndroid.isDisplayed().catch(() => false)
    if (buyTabShown) {
      await this.tapCenterOnElement(await this.getFirstDisplayed([this.buyTabAndroid], 'BUY tab (Android)'))
    }

    await browser.pause(500)
  }

  private async placeBuyOrderAndroid(quantity: string) {
    await this.setQuantityAndroid(quantity)

    const placeCandidates = [this.placeBuyOrderButtonAndroid, this.buyActionButtonAndroid]
    let placeShown = await this.waitForAnyDisplayed(placeCandidates, 6000, 'Place Buy Order button (Android)')
      .then(() => true)
      .catch(() => false)

    if (!placeShown) {
      const buyTabShown = await this.buyTabAndroid.isDisplayed().catch(() => false)
      if (buyTabShown) {
        await this.tapCenterOnElement(await this.getFirstDisplayed([this.buyTabAndroid], 'BUY tab (Android)'))
        await browser.pause(600)
        placeShown = await this.waitForAnyDisplayed(placeCandidates, 5000, 'Place Buy Order button (Android)')
          .then(() => true)
          .catch(() => false)
      }
    }

    if (!placeShown) {
      for (let i = 0; i < 2; i += 1) {
        const { width, height } = await browser.getWindowRect()
        const x = Math.round(width * 0.5)
        const fromY = Math.round(height * 0.78)
        const toY = Math.round(height * 0.36)

        await browser.performActions([
          {
            type: 'pointer',
            id: `finger-scroll-${i}`,
            parameters: { pointerType: 'touch' },
            actions: [
              { type: 'pointerMove', duration: 0, x, y: fromY },
              { type: 'pointerDown', button: 0 },
              { type: 'pause', duration: 120 },
              { type: 'pointerMove', duration: 500, x, y: toY },
              { type: 'pointerUp', button: 0 },
            ],
          },
        ])
        await browser.pause(500)

        placeShown = await this.waitForAnyDisplayed(placeCandidates, 5000, 'Place Buy Order button (Android)')
          .then(() => true)
          .catch(() => false)
        if (placeShown) break
      }
    }

    if (!placeShown) {
      throw new Error('Place Buy Order button (Android) did not appear')
    }

    const placeBtn = await this.getFirstDisplayed(
      [this.placeBuyOrderButtonAndroid, this.buyActionButtonAndroid],
      'Place Buy Order button (Android)'
    )

    await placeBtn.click().catch(async () => {
      await this.tapCenterOnElement(placeBtn)
    })
    await browser.pause(700)

    const previewOrDetailsShown = await this.waitForAnyDisplayed(
      [this.orderPreviewTitleAndroid, this.orderPreviewDialogAndroid, this.previewConfirmBuyButtonAndroid, this.orderDetailsTitleAndroid],
      7000,
      'Order Preview/Details after Place Buy (Android)'
    )
      .then(() => true)
      .catch(() => false)

    if (!previewOrDetailsShown) {
      await this.tapCenterOnElement(placeBtn)
      await browser.pause(700)
    }

    const stillOnPlace = await this.placeBuyOrderButtonAndroid.isDisplayed().catch(() => false)
    if (stillOnPlace) {
      throw new Error('Still on New Order after tapping Place Buy Order (Android)')
    }

    const previewShown = await this.waitForAnyDisplayed(
      [this.orderPreviewTitleAndroid, this.orderPreviewDialogAndroid, this.previewConfirmBuyButtonAndroid],
      12000,
      'Order Preview (Android)'
    )
      .then(() => true)
      .catch(() => false)

    if (previewShown) {
      await this.confirmPreviewBuyAndroidIfShown()
    }
  }

  private async confirmPreviewBuyAndroidIfShown() {
    const previewVisible = async () => this.waitForAnyDisplayed(
      [this.orderPreviewDialogAndroid, this.orderPreviewTitleAndroid, this.previewConfirmBuyButtonAndroid],
      1200,
      'Order Preview (Android)'
    )
      .then(() => true)
      .catch(() => false)

    let shown = await previewVisible()
    if (!shown) return

    for (let i = 0; i < 6; i += 1) {
      const buyBtn = await this.getFirstDisplayed(
        [this.previewConfirmBuyButtonAndroid, this.previewBuyButtonAndroid],
        'Preview Buy button (Android)'
      ).catch(() => null)

      if (buyBtn) {
        await buyBtn.click().catch(async () => {
          await this.tapCenterOnElement(buyBtn)
        })

        // XML-confirmed fallback: tap by the actual button bounds in preview sheet.
        const bounds = String(await buyBtn.getAttribute('bounds').catch(() => ''))
        const m = bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/)
        if (m) {
          const x = Math.round((Number(m[1]) + Number(m[3])) / 2)
          const y = Math.round((Number(m[2]) + Number(m[4])) / 2)
          await this.tapAt(x, y)
        }
      } else {
        // Some Android builds render preview CTA without discoverable button node.
        // Try to reveal and hit the bottom CTA area directly.
        await browser.performActions([
          {
            type: 'pointer',
            id: 'finger-android-preview-scroll',
            parameters: { pointerType: 'touch' },
            actions: [
              { type: 'pointerMove', duration: 0, x: 540, y: 2070 },
              { type: 'pointerDown', button: 0 },
              { type: 'pause', duration: 100 },
              { type: 'pointerMove', duration: 420, x: 540, y: 980 },
              { type: 'pointerUp', button: 0 },
            ],
          },
        ]).catch(() => {})
        await browser.releaseActions().catch(() => {})

        await this.tapAt(540, 2290).catch(() => {})
        await this.tapAt(900, 2290).catch(() => {})
      }
      await browser.pause(1200)

      await this.dismissOrderSubmitErrorAndroidIfShown()

      shown = await previewVisible()
      if (!shown) return
    }

    throw new Error('Order Preview still visible after confirming Buy (Android)')
  }

  private async dismissOrderSubmitErrorAndroidIfShown() {
    const isShown = async () => this.waitForAnyDisplayed(
      [this.orderSubmitErrorTitleAndroid, this.orderSubmitErrorTextAndroid],
      1200,
      'Order submit error (Android)'
    )
      .then(() => true)
      .catch(() => false)

    const submitErrorShown = await isShown()
    if (!submitErrorShown) return false

    // API may be slow here. Do NOT go back; tap top area and keep waiting.
    const started = Date.now()
    const maxWaitMs = 180000
    const topTapPoints: Array<[number, number]> = [
      [540, 40],
      [540, 80],
      [540, 120],
      [540, 180],
      [540, 220],
      [540, 260],
      [60, 80],
      [1020, 80],
      [420, 220],
      [660, 220],
    ]

    while (Date.now() - started < maxWaitMs) {
      for (const [x, y] of topTapPoints) {
        await this.tapAt(x, y).catch(() => {})
        await browser.pause(120)
      }
      await this.dismissBottomSheetGestureAndroid()
      await browser.pause(1200)

      const stillShown = await isShown()
      if (!stillShown) return true

      const onDetails = await this.orderDetailsTitleAndroid.isDisplayed().catch(() => false)
      const hasActive = await this.androidTextContains('ACTIVE').isDisplayed().catch(() => false)
      const hasOrdersSection = await this.activeOrdersTitleAndroid.isDisplayed().catch(() => false)
      if (onDetails || hasActive || hasOrdersSection) return true

      // Keep nudging top area aggressively when backend is slow and bottom-sheet lingers.
      await this.tapAt(540, 40).catch(() => {})
      await this.tapAt(60, 60).catch(() => {})
      await this.tapAt(1020, 60).catch(() => {})
      await this.dismissBottomSheetGestureAndroid()
    }

    const stillShownAfterWait = await isShown()
    return !stillShownAfterWait
  }

  private async confirmModifyOrderPreviewAndroidIfShown() {
    const shown = await this.waitForAnyDisplayed(
      [this.modifyOrderPreviewDialogAndroid, this.modifyOrderTitleAndroid, this.modifyBuyOrderButtonInDialogAndroid, this.modifyBuyOrderButtonAndroid],
      1500,
      'Modify Order preview (Android)'
    )
      .then(() => true)
      .catch(() => false)

    if (!shown) return false

    const confirmBtn = await this.getFirstDisplayed(
      [this.modifyBuyOrderButtonInDialogAndroid, this.modifyBuyOrderButtonAndroid],
      'Modify Buy Order button (Android)'
    )

    await confirmBtn.click().catch(async () => {
      await this.tapCenterOnElement(confirmBtn)
    })

    const bounds = String(await confirmBtn.getAttribute('bounds').catch(() => ''))
    const m = bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/)
    if (m) {
      const x = Math.round((Number(m[1]) + Number(m[3])) / 2)
      const y = Math.round((Number(m[2]) + Number(m[4])) / 2)
      await this.tapAt(x, y)
    }

    await browser.pause(900)
    return true
  }

  private async verifyOrderDetailsAndroid(status: 'ACTIVE' | 'CANCELLED', quantity?: string) {
    await this.confirmPreviewBuyAndroidIfShown()
    await this.confirmModifyOrderPreviewAndroidIfShown()
    await this.dismissOrderSubmitErrorAndroidIfShown()

    if (status === 'ACTIVE') {
      // Required flow parity with iOS: right after preview confirm, open ACTIVE order row.
      const alreadyOnDetails = await this.orderDetailsTitleAndroid.isDisplayed().catch(() => false)
      if (!alreadyOnDetails) {
        await this.openFirstActiveOrderAndroid()
      }
    }

    const timeout = status === 'CANCELLED' ? 120000 : 90000
    const expected = status.toUpperCase()

    const hasExpectedStatus = async () => {
      const textMatch = await this.waitForAnyDisplayed(
        [this.statusTextAndroid(expected), this.androidTextContains(expected), this.androidTextContains(status)],
        1500,
        `Order status ${status} (Android)`
      )
        .then(() => true)
        .catch(() => false)
      return textMatch
    }

    const found = await browser.waitUntil(hasExpectedStatus, {
      timeout,
      interval: 500,
      timeoutMsg: `Order status ${status} (Android) did not appear`,
    }).then(() => true).catch(() => false)

    if (found) return

    if (status === 'ACTIVE') {
      await browser.waitUntil(hasExpectedStatus, {
        timeout,
        interval: 500,
        timeoutMsg: `Order status ${status} (Android) did not appear after opening active order`,
      })
    } else {
      throw new Error(`Order status ${status} (Android) did not appear`)
    }

    if (quantity) {
      await this.waitForAnyDisplayed(
        this.orderDetailsQuantityCandidatesAndroid(quantity),
        12000,
        `Order details quantity ${quantity} (Android)`
      )
    }
  }

  private async openFirstActiveOrderAndroid() {
    await this.confirmModifyOrderPreviewAndroidIfShown()
    await this.dismissOrderSubmitErrorAndroidIfShown()

    const onDetailsAtStart = await this.orderDetailsTitleAndroid.isDisplayed().catch(() => false)
    if (onDetailsAtStart) return

    const ordersAnchors = [
      this.activeOrdersTitleAndroid,
      this.recentOrdersTitleAndroid,
      this.androidTextContains('ACTIVE'),
      this.androidTextContains('Active'),
    ]

    const rowCandidates = [
      this.activeOrderRowAndroidByInstance,
      this.activeOrderRowAndroidByXPath,
      this.recentActiveOrderRowAndroid,
      this.activeRecentOrderRowAndroid,
      this.activeOrderRowAndroid,
      this.recentBuyOrderRowAndroid,
      this.activeBadgeAndroid,
      $('//*[contains(@text,"ACTIVE")]/ancestor::*[@clickable="true" or @focusable="true"][1]'),
      $('//*[contains(@text,"Active")]/ancestor::*[@clickable="true" or @focusable="true"][1]'),
      $('//android.widget.TextView[@text="ACTIVE"]/ancestor::android.view.View[2]'),
    ]

    const tryOpenActiveRow = async (timeout = 3500) => {
      const rowShown = await this.waitForAnyDisplayed(rowCandidates, timeout, 'BMW active order row (Android)')
        .then(() => true)
        .catch(() => false)

      if (!rowShown) return false

      const landedOnOrderScreen = async () => this.waitForAnyDisplayed(
        [this.orderDetailsTitleAndroid, this.modifyActionAndroid, this.modifyActionContainerAndroid, this.cancelActionAndroid],
        2500,
        'Order Details/Modify/Cancel screen (Android)'
      )
        .then(() => true)
        .catch(() => false)

      for (const candidate of rowCandidates) {
        const el = (await candidate) as unknown as WebdriverIO.Element
        const shown = await el.isDisplayed().catch(() => false)
        if (!shown) continue

        await this.tapCenterOnElement(el).catch(() => {})
        await browser.pause(900)

        if (await landedOnOrderScreen()) return true
      }

      return false
    }

    const hasOrdersAnchors = async (timeout = 1500) => this.waitForAnyDisplayed(ordersAnchors, timeout, 'Active/Recent Orders section (Android)')
      .then(() => true)
      .catch(() => false)

    const hasActiveRow = async (timeout = 1500) => this.waitForAnyDisplayed(rowCandidates, timeout, 'BMW active order row (Android)')
      .then(() => true)
      .catch(() => false)

    // Do not navigate back if the row is already tappable on current screen.
    if (await tryOpenActiveRow(2500)) return

    let ordersSectionShown = await hasOrdersAnchors(5000)

    if (!ordersSectionShown) {
      const becameReady = await browser.waitUntil(async () => {
        await this.confirmModifyOrderPreviewAndroidIfShown()
        await this.dismissOrderSubmitErrorAndroidIfShown()

        const onDetails = await this.orderDetailsTitleAndroid.isDisplayed().catch(() => false)
        if (onDetails) return true

        const rowVisible = await hasActiveRow(1200)
        if (rowVisible) return true

        return hasOrdersAnchors(1200)
      }, {
        timeout: 240000,
        interval: 1200,
        timeoutMsg: 'Active/Recent Orders section (Android) did not appear',
      }).then(() => true).catch(() => false)

      if (!becameReady) {
        throw new Error('Active/Recent Orders section (Android) did not appear')
      }

      const onDetailsAfterWait = await this.orderDetailsTitleAndroid.isDisplayed().catch(() => false)
      if (onDetailsAfterWait) return

      for (let i = 0; i < 3; i += 1) {
        await this.confirmModifyOrderPreviewAndroidIfShown()
        await this.dismissOrderSubmitErrorAndroidIfShown()

        if (await tryOpenActiveRow(2200)) return

        const onModifyOrder = await this.modifyOrderTitleAndroid.isDisplayed().catch(() => false)
        const hasSubmitCta = await this.submitButtonAndroid.isDisplayed().catch(() => false)
        if (onModifyOrder || hasSubmitCta) {
          // Stay on current screen and try to open ACTIVE/BMW directly.
          if (await tryOpenActiveRow(2200)) return
        }

        const ordersShown = await this.ordersTabInInvestAndroid.isDisplayed().catch(() => false)
        if (ordersShown) {
          await this.tapCenterOnElement(await this.getFirstDisplayed([this.ordersTabInInvestAndroid], 'Orders tab (Android)'))
          await browser.pause(700)
        }

        ordersSectionShown = await hasOrdersAnchors(4000)
        if (ordersSectionShown) break

        const onNewOrder = await this.newOrderTitleAndroid.isDisplayed().catch(() => false)
        const hasPlaceCta = await this.placeBuyOrderButtonAndroid.isDisplayed().catch(() => false)
        if (onNewOrder || hasPlaceCta) {
          if (await tryOpenActiveRow(2500)) return
          continue
        }

        const investShown = await this.investTabAndroid.isDisplayed().catch(() => false)
        if (investShown) {
          await this.tapCenterOnElement(await this.getFirstDisplayed([this.investTabAndroid], 'Invest tab (Android)'))
          await browser.pause(700)
        }
      }
    }

    const onDetailsBeforeFinalWait = await this.orderDetailsTitleAndroid.isDisplayed().catch(() => false)
    if (onDetailsBeforeFinalWait) return

    await this.waitForAnyDisplayed(ordersAnchors, 12000, 'Active/Recent Orders section (Android)')

    const viewAllShown = await this.viewAllOrdersAndroid.isDisplayed().catch(() => false)
    if (viewAllShown) {
      await this.tapCenterOnElement(await this.getFirstDisplayed([this.viewAllOrdersAndroid], 'View All orders (Android)'))
      await browser.pause(700)
    }

    await tryOpenActiveRow(12000)
  }

  private async tapModifyAndroid() {
    const modifyCandidates = [this.modifyActionAndroid, this.modifyActionContainerAndroid]

    const openOrderFromListForModify = async () => {
      const activeRowForModifyCandidates = [
        this.activeOrderRowAndroidByInstance,
        this.activeOrderRowAndroidByXPath,
        this.recentActiveOrderRowAndroid,
        this.activeRecentOrderRowAndroid,
        this.activeOrderRowAndroid,
        this.recentBuyOrderRowAndroid,
        this.activeBadgeAndroid,
        $('//*[contains(@text,"ACTIVE")]/ancestor::*[@clickable="true" or @focusable="true"][1]'),
        $('//android.view.View[.//android.widget.TextView[contains(@text,"Buy")] and .//android.widget.TextView[contains(@text,"ACTIVE")]][1]'),
      ]

      for (let i = 0; i < 4; i += 1) {
        const openedByRowTap = await this.waitForAnyDisplayed(activeRowForModifyCandidates, 2500, 'ACTIVE order row for Modify (Android)')
          .then(async () => {
            await this.tapFirstDisplayed(activeRowForModifyCandidates, 'ACTIVE order row for Modify (Android)')
            await browser.pause(1000)
            return true
          })
          .catch(() => false)

        if (!openedByRowTap) {
          // XML fallback: ACTIVE rows are usually near lower half of screen on Instrument page.
          await this.tapAt(540, 1920).catch(() => {})
          await this.tapAt(870, 1965).catch(() => {})
          await browser.pause(700)
        }

        const modifyShownNow = await this.waitForAnyDisplayed(modifyCandidates, 2500, 'Modify action (Android)')
          .then(() => true)
          .catch(() => false)
        if (modifyShownNow) return true

        const onDetailsNow = await this.orderDetailsTitleAndroid.isDisplayed().catch(() => false)
        if (onDetailsNow) {
          const modifyOnDetails = await this.waitForAnyDisplayed(modifyCandidates, 8000, 'Modify action (Android)')
            .then(() => true)
            .catch(() => false)
          if (modifyOnDetails) return true
        }
      }

      return false
    }

    const modifyShown = await this.waitForAnyDisplayed([this.modifyActionAndroid, this.modifyActionContainerAndroid], 5000, 'Modify action (Android)')
      .then(() => true)
      .catch(() => false)
    if (!modifyShown) {
      const onOrderDetails = await this.orderDetailsTitleAndroid.isDisplayed().catch(() => false)
      if (onOrderDetails) {
        await browser.back().catch(() => {})
        await browser.pause(900)
      }
      await this.openFirstActiveOrderAndroid()

      const modifyShownAfterOpen = await this.waitForAnyDisplayed(modifyCandidates, 5000, 'Modify action (Android)')
        .then(() => true)
        .catch(() => false)
      if (!modifyShownAfterOpen) {
        await openOrderFromListForModify()
      }
    }
    await this.waitForAnyDisplayed([this.modifyActionAndroid, this.modifyActionContainerAndroid], 20000, 'Modify action (Android)')
    await this.tapFirstDisplayed([this.modifyActionAndroid, this.modifyActionContainerAndroid], 'Modify action (Android)')
  }

  private async submitModifiedQuantityAndroid(quantity: string) {
    await this.setQuantityAndroid(quantity)

    const submitCandidates = [this.submitButtonAndroid, this.saveButtonAndroid, this.placeBuyOrderButtonAndroid]
    await this.waitForAnyDisplayed(submitCandidates, 15000, 'Submit modified order button (Android)')

    const findEnabledSubmitBtn = async () => {
      for (const candidate of submitCandidates) {
        const el = (await candidate) as unknown as WebdriverIO.Element
        const shown = await el.isDisplayed().catch(() => false)
        if (!shown) continue

        const enabledAttr = String(await el.getAttribute('enabled').catch(() => 'true')).toLowerCase()
        const enabled = enabledAttr !== 'false'
        if (!enabled) continue

        return el
      }
      return null
    }

    let submitBtn = await findEnabledSubmitBtn()

    if (!submitBtn) {
      // Force value-change cycle to wake up disabled Submit in flaky Android webview.
      const alternate = quantity === '1' ? '2' : '1'
      await this.setQuantityAndroid(alternate)
      await this.setQuantityAndroid(quantity)
      await browser.pause(500)
      submitBtn = await findEnabledSubmitBtn()
    }

    if (!submitBtn) {
      throw new Error('Submit modified order button (Android) is disabled after quantity update')
    }

    // Re-resolve just before tap to avoid stale element from previous DOM state.
    submitBtn = await findEnabledSubmitBtn()
    if (!submitBtn) {
      throw new Error('Submit modified order button (Android) disappeared before tap')
    }

    await this.tapCenterOnElement(submitBtn)
    await browser.pause(500)
    await this.confirmModifyOrderPreviewAndroidIfShown()
  }

  private async tapCancelAndroid() {
    const cancelCandidates = [
      this.cancelActionButtonAndroid,
      this.cancelActionAndroid,
      this.cancelActionContainerAndroid,
      this.cancelActionRowAndroid,
    ]

    const cancelShown = await this.waitForAnyDisplayed(cancelCandidates, 5000, 'Cancel action (Android)')
      .then(() => true)
      .catch(() => false)

    if (!cancelShown) {
      await this.openFirstActiveOrderAndroid()
    }

    await this.waitForAnyDisplayed(cancelCandidates, 25000, 'Cancel action (Android)')
    await this.tapFirstDisplayed(cancelCandidates, 'Cancel action (Android)')
  }

  private async confirmCancelOrderAndroid() {
    await this.waitForAnyDisplayed(
      [this.cancelOrderConfirmButtonAndroid, this.cancelOrderDialogTitleAndroid],
      20000,
      'Cancel Order dialog (Android)'
    )
    await this.waitForAnyDisplayed([this.cancelOrderConfirmButtonAndroid], 20000, 'Cancel Order confirm button (Android)')
    await this.tapFirstDisplayed([this.cancelOrderConfirmButtonAndroid], 'Cancel Order confirm button (Android)')
  }

  private async typeInstrumentQueryIOS(query: string) {
    const searchCandidates = [this.searchInstrumentInputIOS, this.visibleTextFieldIOS]
    const input = await this.getFirstDisplayed(searchCandidates, 'Invest instrument search input (iOS)')

    await this.tapIOSDisplayed(input, 20000)
    await input.clearValue().catch(() => {})
    await input.setValue(query)
    await browser.pause(350)

    const returnKey = this.iosA11y('Return')
    if (await returnKey.isDisplayed().catch(() => false)) {
      await returnKey.click()
    } else {
      await browser.hideKeyboard().catch(() => {})
    }

    await browser.pause(800)
  }

  private async selectInstrumentResultIOS(query: string) {
    const q = this.predicateText(query.trim())
    await browser.hideKeyboard().catch(() => {})
    await browser.pause(600)

    const exactBmwCandidates = [
      this.bmwResultRowIOS,
      this.bmwInstrumentTextIOS,
      this.bmwTickerTextIOS,
      this.iosPredicate(
        `type == "XCUIElementTypeStaticText" AND visible == 1 AND (label CONTAINS[c] "Bmw Ag" OR name CONTAINS[c] "Bmw Ag" OR value CONTAINS[c] "Bmw Ag")`
      ),
    ]

    const fallbackCandidates = [
      this.iosPredicate(
        `(type == "XCUIElementTypeStaticText" OR type == "XCUIElementTypeCell" OR type == "XCUIElementTypeLink" OR type == "XCUIElementTypeButton") AND visible == 1 AND (label CONTAINS[c] "${q}" OR name CONTAINS[c] "${q}" OR value CONTAINS[c] "${q}")`
      ),
      this.iosClassChain('**/XCUIElementTypeCell'),
      this.iosClassChain('**/XCUIElementTypeLink'),
    ]

    const foundExactBmw = await this.waitForAnyDisplayed(exactBmwCandidates, 12000, 'BMW result row (iOS)')
      .then(() => true)
      .catch(() => false)

    const result = foundExactBmw
      ? await this.getFirstDisplayed(exactBmwCandidates, 'BMW result row (iOS)')
      : await this.getFirstDisplayed(fallbackCandidates, `Instrument result ${query} (iOS)`)

    // Avoid tapping the focused search field/header; real results are below the search bar.
    const loc = await result.getLocation()
    if (loc.y < 120) {
      await this.tapAt(90, 180)
    } else if (foundExactBmw) {
      await this.tapSearchResultRowIOS(result)
    } else {
      await this.tapCenterOnElement(result)
    }

    const instrumentAnchors = [this.instrumentTitleIOS, this.instrumentBuyButtonIOS, this.bmwInstrumentTextIOS]
    await this.waitForAnyDisplayed(instrumentAnchors, 25000, 'Instrument screen (iOS)')
  }

  private async openInstrumentFromInvestLocatorIOS(query: string) {
    await this.openInvestSearchIOS()
    await this.typeInstrumentQueryIOS(query)
    await this.selectInstrumentResultIOS(query)
  }

  private async openNewBuyOrderIOS() {
    const buyCandidates = [
      this.instrumentBuyButtonIOS,
      this.iosA11y('Buy'),
      this.iosPredicate('type == "XCUIElementTypeButton" AND (name == "Buy" OR label == "Buy")'),
    ]

    await this.waitAndScrollToAnyIOS(buyCandidates, 'Instrument Buy button (iOS)', 5)
    await this.tapFirstDisplayed(buyCandidates, 'Instrument Buy button (iOS)')

    const orderAnchors = [this.newOrderTitleIOS, this.placeBuyOrderButtonIOS, this.sharesInputIOS]
    await this.waitForAnyDisplayed(orderAnchors, 20000, 'New Order screen (iOS)')
  }

  private async setQuantityIOS(quantity: string) {
    const inputCandidates = [this.sharesInputIOS, this.visibleTextFieldIOS]
    const inputShown = await this.waitForAnyDisplayed(inputCandidates, 20000, 'Shares quantity input (iOS)')
      .then(() => true)
      .catch(() => false)

    if (!inputShown) {
      await this.scrollDownOnceIOS()
      await this.waitForAnyDisplayed(inputCandidates, 15000, 'Shares quantity input (iOS)')
    }

    const input = await this.getFirstDisplayed(inputCandidates, 'Shares quantity input (iOS)')

    await this.tapIOSDisplayed(input, 15000)
    await input.clearValue().catch(() => {})
    await browser.pause(150)
    await input.setValue(quantity)
    await browser.pause(350)

    const value = await input.getValue().catch(() => '')
    if (String(value).trim() !== quantity) {
      await input.clearValue().catch(() => {})
      await browser.pause(150)
      await input.setValue(quantity)
      await browser.pause(350)
    }

    await this.dismissKeyboardAfterInputIOS()
    await browser.pause(500)
  }

  private quantityTextIOS(quantity: string) {
    const q = this.predicateText(quantity)
    return this.iosPredicate(`type == "XCUIElementTypeStaticText" AND (name == "${q}" OR label == "${q}" OR value == "${q}")`)
  }

  private quantitySharesTextIOS(quantity: string) {
    const suffix = quantity === '1' ? 'Share' : 'Shares'
    const text = this.predicateText(`${quantity} ${suffix}`)
    return this.iosPredicate(`type == "XCUIElementTypeStaticText" AND (name == "${text}" OR label == "${text}" OR value == "${text}")`)
  }

  private detailsQuantityCandidatesIOS(quantity: string) {
    const q = this.predicateText(quantity)
    return [
      this.quantityTextIOS(quantity),
      this.quantitySharesTextIOS(quantity),
      this.iosPredicate(`type == "XCUIElementTypeStaticText" AND (name == "${q} @" OR label == "${q} @" OR value == "${q} @")`),
    ]
  }

  private async verifyPreviewQuantityIOS(quantity: string, title: WdioEl | WebdriverIO.Element, label: string) {
    await this.waitForAnyDisplayed([title], 20000, label)

    const dialog = this.dialogXPath()
    const quantityCandidates = [
      $(`${dialog}//XCUIElementTypeStaticText[@name="Quantity" or @label="Quantity" or @value="Quantity"]/following::XCUIElementTypeStaticText[@name="${quantity}" or @label="${quantity}" or @value="${quantity}"][1]`),
      $(`${dialog}//XCUIElementTypeStaticText[@name="${quantity}" or @label="${quantity}" or @value="${quantity}"]`),
      $(`${dialog}//XCUIElementTypeStaticText[contains(@name,"${quantity} @") or contains(@label,"${quantity} @") or contains(@value,"${quantity} @")]`),
      $(`${dialog}//XCUIElementTypeStaticText[contains(@name,"${quantity} Share") or contains(@label,"${quantity} Share") or contains(@value,"${quantity} Share")]`),
    ]

    await this.waitForAnyDisplayed(quantityCandidates, 12000, `${label} quantity ${quantity}`)
  }

  private async tapOrderSubmitAndWaitForDialogIOS(
    submitCandidates: Array<WdioEl | WebdriverIO.Element>,
    submitLabel: string,
    dialogAnchor: WdioEl | WebdriverIO.Element,
    dialogLabel: string
  ) {
    await this.dismissKeyboardAfterInputIOS()
    await this.waitForAnyDisplayed(submitCandidates, 15000, submitLabel)
    await this.tapFirstDisplayed(submitCandidates, submitLabel)

    const opened = await this.waitForAnyDisplayed([dialogAnchor], 8000, dialogLabel)
      .then(() => true)
      .catch(() => false)

    if (!opened) {
      await this.dismissKeyboardAfterInputIOS()
      await this.tapFirstDisplayed(submitCandidates, submitLabel)
      await this.waitForAnyDisplayed([dialogAnchor], 15000, dialogLabel)
    }
  }

  private async placeBuyOrderIOS(quantity: string) {
    await this.setQuantityIOS(quantity)

    const placeCandidates = [
      this.placeBuyOrderButtonIOS,
      this.iosPredicate('type == "XCUIElementTypeButton" AND (name == "Place Buy Order" OR label == "Place Buy Order")'),
    ]
    await this.tapOrderSubmitAndWaitForDialogIOS(
      placeCandidates,
      'Place Buy Order button (iOS)',
      this.orderPreviewDialogIOS,
      'Order Preview dialog (iOS)'
    )

    await this.verifyPreviewQuantityIOS(quantity, this.orderPreviewDialogIOS, 'Order Preview (iOS)')

    const confirmCandidates = [
      this.buyButtonInPreviewIOS,
      this.iosPredicate('type == "XCUIElementTypeButton" AND (name == "Buy" OR label == "Buy")'),
    ]
    await this.waitForAnyDisplayed(confirmCandidates, 15000, 'Preview Buy button (iOS)')
    await this.tapFirstDisplayed(confirmCandidates, 'Preview Buy button (iOS)')
  }

  private async waitForRecentActiveOrderIOS() {
    const activeCandidates = [
      this.iosA11y('ACTIVE'),
      this.iosPredicate('type == "XCUIElementTypeStaticText" AND (name == "ACTIVE" OR label == "ACTIVE")'),
    ]

    await this.waitForAnyDisplayed(activeCandidates, 30000, 'Active order status (iOS)')
  }

  private async openActiveOrderDetailsIOS() {
    const activeStatus = this.iosPredicate('type == "XCUIElementTypeStaticText" AND (name == "ACTIVE" OR label == "ACTIVE")')
    await this.waitForAnyDisplayed([activeStatus], 20000, 'Active order row (iOS)')

    const activeEl = await this.getFirstDisplayed([activeStatus], 'Active order row (iOS)')
    await this.tapCenterOnElement(activeEl)

    let opened = await this.orderDetailsTitleIOS.waitForDisplayed({ timeout: 4000 }).then(() => true).catch(() => false)
    if (!opened) {
      const loc = await activeEl.getLocation()
      const size = await activeEl.getSize()
      await this.tapAt(180, loc.y + size.height / 2)
      opened = await this.orderDetailsTitleIOS.waitForDisplayed({ timeout: 4000 }).then(() => true).catch(() => false)
    }

    if (!opened) {
      await this.tapAt(200, 680)
    }

    await this.waitForAnyDisplayed([this.orderDetailsTitleIOS], 20000, 'Order Details screen (iOS)')
  }

  private async detectOrderDetailsQuantityIOS(quantities: string[], timeout = 15000) {
    let found: string | null = null

    await browser.waitUntil(
      async () => {
        for (const quantity of quantities) {
          const candidates = this.detailsQuantityCandidatesIOS(quantity)
          for (const el of candidates) {
            const resolved = (await el) as unknown as WebdriverIO.Element
            if (await resolved.isDisplayed().catch(() => false)) {
              found = quantity
              return true
            }
          }
        }

        return false
      },
      {
        timeout,
        interval: 500,
        timeoutMsg: `Order details quantity ${quantities.join(' or ')} (iOS) did not appear`,
      }
    )

    if (!found) {
      throw new Error(`Order details quantity ${quantities.join(' or ')} (iOS) did not appear`)
    }

    return found
  }

  private async refreshOrderDetailsIOS() {
    // Try refreshing webview first if available, otherwise perform native pull-to-refresh.
    try {
      const contexts = (await browser.getContexts()) as string[]
      const webview = contexts.find((c: string) => c && c.toLowerCase().includes('webview'))
      if (webview) {
        await browser.switchContext(webview)
        await browser.refresh()
        await browser.pause(800)
        await browser.switchContext('NATIVE_APP').catch(() => {})
        return
      }
    } catch (e) {
      // fall through to native refresh
      try {
        await browser.switchContext('NATIVE_APP')
      } catch (_) {}
    }

    // Native pull-to-refresh: swipe down from near top to middle
    const { width, height } = await browser.getWindowRect()
    const startX = Math.round(width * 0.5)
    const startY = Math.round(height * 0.18)
    const endY = Math.round(height * 0.6)

    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 150 },
          { type: 'pointerMove', duration: 700, x: startX, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
    await browser.pause(900)
  }

  private async goBackIOS() {
    const back = this.iosA11y('Back')
    const shown = await (back as unknown as WebdriverIO.Element).isDisplayed().catch(() => false)
    if (shown) {
      await this.tapCenterOnElement((await back) as unknown as WebdriverIO.Element)
      await browser.pause(600)
      return
    }

    await this.tapAt(30, 75)
    await browser.pause(600)
  }

  private async openRecentOrderDetailsIOS() {
    const statusCandidates = [this.statusTextIOS('CANCELLED'), this.statusTextIOS('ACTIVE')]
    await this.waitForAnyDisplayed(statusCandidates, 20000, 'Recent order status (iOS)')
    const row = await this.getFirstDisplayed(statusCandidates, 'Recent order row (iOS)')
    await this.tapCenterOnElement(row)

    let opened = await this.orderDetailsTitleIOS.waitForDisplayed({ timeout: 4000 }).then(() => true).catch(() => false)
    if (!opened) {
      const loc = await row.getLocation()
      const size = await row.getSize()
      await this.tapAt(180, loc.y + size.height / 2)
      opened = await this.orderDetailsTitleIOS.waitForDisplayed({ timeout: 4000 }).then(() => true).catch(() => false)
    }

    if (!opened) {
      await this.tapAt(200, 680)
    }

    await this.waitForAnyDisplayed([this.orderDetailsTitleIOS], 20000, 'Order Details screen (iOS)')
  }

  private statusTextIOS(status: string) {
    const value = this.predicateText(status)
    return this.iosPredicate(`type == "XCUIElementTypeStaticText" AND (name == "${value}" OR label == "${value}" OR value == "${value}")`)
  }

  private async verifyOrderDetailsIOS(status: 'ACTIVE' | 'CANCELLED', quantity: string) {
    await this.waitForAnyDisplayed([this.orderDetailsTitleIOS], 15000, 'Order Details screen (iOS)')

    // When waiting for a cancelled status give the app more time to process
    // cancellations which may be async on the backend or reflected later in UI.
    const statusTimeout = status === 'CANCELLED' ? 45000 : 15000

    if (status === 'CANCELLED') {
      const start = Date.now()
      let foundStatus = false
      while (Date.now() - start < statusTimeout) {
        try {
          await this.waitForAnyDisplayed([this.statusTextIOS(status)], 3000, `Order status ${status} (iOS)`)
          foundStatus = true
          break
        } catch (e) {
          // Re-enter the order details: go back to the list and open recent order
          await this.goBackIOS()
          await this.openRecentOrderDetailsIOS()
        }
      }

      if (!foundStatus) throw new Error(`Order status ${status} (iOS) did not appear`)

      // Now ensure quantity is reflected; same re-enter strategy if necessary
      const quantityTimeout = 45000
      const qStart = Date.now()
      let foundQuantity = false
      while (Date.now() - qStart < quantityTimeout) {
        try {
          await this.detectOrderDetailsQuantityIOS([quantity], 3000)
          foundQuantity = true
          break
        } catch (e) {
          await this.goBackIOS()
          await this.openRecentOrderDetailsIOS()
        }
      }

      if (!foundQuantity) throw new Error(`Order details quantity ${quantity} (iOS) did not appear`)
      return
    }

    await this.waitForAnyDisplayed([this.statusTextIOS(status)], statusTimeout, `Order status ${status} (iOS)`)

    const quantityCandidates = this.detailsQuantityCandidatesIOS(quantity)
    const quantityTimeout = 15000
    await this.waitForAnyDisplayed(quantityCandidates, quantityTimeout, `Order details quantity ${quantity} (iOS)`)
  }

  private async tapModifyIOS() {
    await this.waitForAnyDisplayed([this.modifyActionIOS], 15000, 'Modify action (iOS)')
    const modify = await this.getFirstDisplayed([this.modifyActionIOS], 'Modify action (iOS)')
    const loc = await modify.getLocation()
    const size = await modify.getSize()

    await this.tapAt(loc.x + size.width / 2, Math.max(0, loc.y - 31))

    const opened = await this.waitForAnyDisplayed([this.sharesInputIOS, this.submitButtonIOS, this.placeBuyOrderButtonIOS], 15000, 'Modify order form (iOS)')
      .then(() => true)
      .catch(() => false)

    if (!opened) {
      await this.tapCenterOnElement(modify)
      await this.waitForAnyDisplayed([this.sharesInputIOS, this.submitButtonIOS, this.placeBuyOrderButtonIOS], 15000, 'Modify order form (iOS)')
    }
  }

  private async submitModifiedQuantityIOS(quantity: string) {
    await this.setQuantityIOS(quantity)

    const submitCandidates = [
      this.submitButtonIOS,
      this.saveButtonIOS,
      this.iosPredicate('type == "XCUIElementTypeButton" AND (name == "Submit" OR label == "Submit" OR name == "Save" OR label == "Save")'),
      this.placeBuyOrderButtonIOS,
    ]

    await this.tapOrderSubmitAndWaitForDialogIOS(
      submitCandidates,
      'Submit modified order button (iOS)',
      this.modifyOrderPreviewTitleIOS,
      'Modify Order preview dialog (iOS)'
    )

    await this.verifyPreviewQuantityIOS(quantity, this.modifyOrderPreviewTitleIOS, 'Modify Order preview (iOS)')

    const confirmCandidates = [
      this.modifyBuyOrderButtonIOS,
      this.iosPredicate('type == "XCUIElementTypeButton" AND (name == "Modify Buy Order" OR label == "Modify Buy Order")'),
    ]
    await this.waitForAnyDisplayed(confirmCandidates, 15000, 'Modify Buy Order button (iOS)')
    await this.tapFirstDisplayed(confirmCandidates, 'Modify Buy Order button (iOS)')
    await this.dismissOrderModificationFailedDialogIfShownIOS()
  }

  private async dismissOrderModificationFailedDialogIfShownIOS() {
    const shown = await this.waitForAnyDisplayed([this.orderModificationFailedDialogIOS], 5000, 'Order modification failed dialog (iOS)')
      .then(() => true)
      .catch(() => false)

    if (!shown) return

    // The error appears as a bottom sheet without an explicit close button.
    await this.tapAt(201, 520)
    await browser.pause(700)
  }

  private async tapCancelIOS() {
    await this.waitForAnyDisplayed([this.cancelActionIOS], 15000, 'Cancel action (iOS)')
    const cancel = await this.getFirstDisplayed([this.cancelActionIOS], 'Cancel action (iOS)')
    const loc = await cancel.getLocation()
    const size = await cancel.getSize()

    await this.tapAt(loc.x + size.width / 2, Math.max(0, loc.y - 31))

    const dialogShown = await this.waitForAnyDisplayed([this.cancelOrderDialogIOS], 8000, 'Cancel Order dialog (iOS)')
      .then(() => true)
      .catch(() => false)

    if (!dialogShown) {
      await this.tapCenterOnElement(cancel)
      await this.waitForAnyDisplayed([this.cancelOrderDialogIOS], 12000, 'Cancel Order dialog (iOS)')
    }
  }

  private async confirmCancelOrderIOS() {
    const confirmCandidates = [
      this.cancelOrderConfirmButtonIOS,
      this.iosPredicate('type == "XCUIElementTypeButton" AND (name == "Cancel Order" OR label == "Cancel Order")'),
    ]

    await this.waitForAnyDisplayed(confirmCandidates, 15000, 'Cancel Order confirm button (iOS)')
    await this.tapFirstDisplayed(confirmCandidates, 'Cancel Order confirm button (iOS)')
  }

  public async createModifyAndCancelBuyOrderIOS(params: BuyOrderFlowParams) {
    if (!browser.isIOS) {
      throw new Error('Buy order flow can only run on iOS')
    }

    await this.openInstrumentFromInvestLocatorIOS(params.instrumentQuery)
    await this.openNewBuyOrderIOS()
    await this.placeBuyOrderIOS(params.initialQuantity)

    const orderDetailsOpenedDirectly = await this.orderDetailsTitleIOS.waitForDisplayed({ timeout: 6000 }).then(() => true).catch(() => false)
    if (!orderDetailsOpenedDirectly) {
      await this.waitForRecentActiveOrderIOS()
      await this.openActiveOrderDetailsIOS()
    }

    await this.waitForAnyDisplayed([this.orderDetailsTitleIOS], 20000, 'Order Details screen (iOS)')
    await this.waitForAnyDisplayed([this.statusTextIOS('ACTIVE')], 15000, 'Order status ACTIVE (iOS)')

    const activeQuantity = await this.detectOrderDetailsQuantityIOS([params.initialQuantity, params.modifiedQuantity])
    if (activeQuantity !== params.modifiedQuantity) {
      await this.tapModifyIOS()
      await this.submitModifiedQuantityIOS(params.modifiedQuantity)
    }

    await this.verifyOrderDetailsIOS('ACTIVE', params.modifiedQuantity)

    await this.tapCancelIOS()
    await this.confirmCancelOrderIOS()
    await this.verifyOrderDetailsIOS('CANCELLED', params.modifiedQuantity)
  }

  public async createModifyAndCancelBuyOrderAndroid(params: BuyOrderFlowParams) {
    if (!browser.isAndroid) {
      throw new Error('Buy order flow can only run on Android')
    }

    await this.openInstrumentFromInvestLocatorAndroid(params.instrumentQuery)
    await this.openNewBuyOrderAndroid()
    await this.placeBuyOrderAndroid(params.initialQuantity)
    await this.verifyOrderDetailsAndroid('ACTIVE', params.initialQuantity)

    await this.tapModifyAndroid()
    await this.submitModifiedQuantityAndroid(params.modifiedQuantity)
    await this.verifyOrderDetailsAndroid('ACTIVE', params.modifiedQuantity)

    await this.tapCancelAndroid()
    await this.confirmCancelOrderAndroid()
    await this.verifyOrderDetailsAndroid('CANCELLED', params.modifiedQuantity)
  }
}
