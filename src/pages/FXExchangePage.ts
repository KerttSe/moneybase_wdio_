import BasePage from './BasePage'
import HomeScreenPage from './HomeScreenPage'
import { $, $$, browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'
import { markBrowserStackStep } from '../helpers/browserstack.helper'

type WdioEl = ChainablePromiseElement

class FXExchangePage extends BasePage {
  private get homeExchangeButton() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().resourceId("home_button_exchange")')
    }
    return $('-ios predicate string:name == "ic_exchange" OR name == "Exchange" OR label == "Exchange"')
  }

  private get exchangeSubmitButton() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().text("Exchange")')
    }
    return $('//XCUIElementTypeButton[@name="Exchange"]')
  }

  private get fxExchangeScreenCandidates(): WdioEl[] {
    if (browser.isAndroid) {
      return [
        $('android=new UiSelector().text("FX Exchange")'),
        $('android=new UiSelector().description("FX Exchange")'),
      ]
    }
    return [
      $('~Exchange'),
      $('-ios predicate string:name == "Exchange" OR label == "Exchange"'),
    ]
  }

  private get newTabButton() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().text("New")')
    }
    return $('-ios predicate string: type == "XCUIElementTypeButton" AND (name == "New" OR label == "New")')
  }

  private get newTabButtonAndroidByResId() {
    return $('//*[@resource-id="mat-tab-link-0"]')
  }

  private get historyTabButton() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().text("History")')
    }
    return $('-ios predicate string: type == "XCUIElementTypeButton" AND name == "History"')
  }

  private get fromWalletCandidates(): WdioEl[] {
    if (browser.isAndroid) {
      return [
        $('android=new UiSelector().text("From Wallet")'),
        $('android=new UiSelector().description("From Wallet")'),
      ]
    }
    return [
      $('~From Wallet'),
      $('-ios predicate string: name == "From Wallet" OR label == "From Wallet"'),
    ]
  }

  private get fromWalletField() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().text("From Wallet")')
    }
    return $('~From Wallet')
  }

  private get toWalletCandidates(): WdioEl[] {
    if (browser.isAndroid) {
      return [
        $('android=new UiSelector().text("To Wallet")'),
        $('android=new UiSelector().description("To Wallet")'),
      ]
    }
    return [
      $('~To Wallet'),
      $('-ios predicate string: name == "To Wallet" OR label == "To Wallet"'),
    ]
  }

  private get toWalletField() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().text("To Wallet")')
    }
    return $('~To Wallet')
  }

  private get activeTypingField() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().className("android.widget.EditText").instance(0)')
    }
    return $(`-ios class chain:**/XCUIElementTypeTextField[\`enabled == 1\`][1]`)
  }

  private get eurOptionCandidates(): WdioEl[] {
    if (browser.isAndroid) {
      return [
        $('android=new UiSelector().textContains("flag-EUR EUR")'),
        $('android=new UiSelector().text("EUR")'),
        $('android=new UiSelector().text("EUR Wallet")'),
        $('android=new UiSelector().description("flag-EUR")'),
      ]
    }
    return [
      $('~EUR'),
      $(`-ios class chain:**/XCUIElementTypeStaticText[\`name == "EUR"\`]`),
    ]
  }

  private get eurOption() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().textContains("flag-EUR EUR")')
    }
    return $('~EUR')
  }

  private get eurOptionFallback() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().text("EUR")')
    }
    return $(`-ios class chain:**/XCUIElementTypeStaticText[\`name == "EUR"\`]`)
  }


  private get selectedButton() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().text("selected")')
    }
    return $('~selected')
  }

  private get confirmButton() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().text("Confirm")')
    }
    return $('~Confirm')
  }

  private get continueBtn() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().text("Continue")')
    }
    return $('~Continue')
  }

  private get selectedEurWallet() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().textContains("EUR")')
    }
    return $('-ios predicate string: name == "flag-EUR EUR" OR label == "flag-EUR EUR"')
  }

  private get selectedUsdWallet() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().textContains("USD")')
    }
    return $('-ios predicate string: name == "flag-USD USD" OR label == "flag-USD USD"')
  }

  /* ── ANDROID: resource-id based selectors (WebView elements) ── */

  private get exchangeFormAndroid() {
    return $('//*[@resource-id="exchange-form"]')
  }

  private get fromWalletSelectAndroid() {
    return $('//*[@resource-id="fromWalletSelect"]')
  }

  private get fromWalletBalanceAndroid() {
    return $('//*[@resource-id="fromWallet-balance"]')
  }

  private get exchangeSubmitBtnByIdAndroid() {
    return $('//*[@resource-id="exchange-submit-btn"]')
  }

  private get exchangeSwitchBtnAndroid() {
    return $('//*[@resource-id="exchange-switch-btn"]')
  }

  private get toWalletSelectAndroid() {
    return $('//*[@resource-id="toWalletSelect"]')
  }

  private get insufficientBalanceErrorAndroid() {
    return $('//*[@resource-id="insufficient-balance-error"]')
  }

  private get walletPickerSearchInputAndroid() {
    return $('//*[@resource-id="search-wallet-input"]')
  }

  private get walletPickerSearchInputIOS() {
    return $('-ios predicate string:type == "XCUIElementTypeTextField" AND (value == "Search Wallet" OR placeholderValue == "Search Wallet")')
  }

  private get insufficientBalanceErrorIOS() {
    return $('-ios predicate string:name BEGINSWITH "Insufficient balance" OR label BEGINSWITH "Insufficient balance"')
  }

  private get currentRateIOS() {
    return $('-ios predicate string:name BEGINSWITH "Current Rate" OR label BEGINSWITH "Current Rate"')
  }

  private selectedWalletIOS(currency: string) {
    return $(`-ios predicate string:name == "flag-${currency} ${currency}" OR label == "flag-${currency} ${currency}"`)
  }

  private walletOptionIOS(currency: string) {
    return $(`//XCUIElementTypeOther[.//XCUIElementTypeImage[@name="flag-${currency}" or @label="flag-${currency}"] and .//XCUIElementTypeStaticText[@name="${currency}" or @label="${currency}"]]`)
  }

  private walletOptionCodeIOS(currency: string) {
    return $$(`-ios predicate string:type == "XCUIElementTypeStaticText" AND visible == 1 AND (name == "${currency}" OR label == "${currency}")`)
  }

  private walletOptionFlagIOS(currency: string) {
    return $$(`-ios predicate string:type == "XCUIElementTypeImage" AND visible == 1 AND (name == "flag-${currency}" OR label == "flag-${currency}")`)
  }

  private get fromWalletFieldIOS() {
    return $('(//XCUIElementTypeOther[starts-with(@name, "flag-") and @visible="true"])[1] | //XCUIElementTypeOther[@name="From Wallet" or @label="From Wallet"]')
  }

  private get toWalletFieldIOS() {
    return $('(//XCUIElementTypeOther[starts-with(@name, "flag-") and @visible="true"])[2] | //XCUIElementTypeOther[@name="To Wallet" or @label="To Wallet"]')
  }

  private get successMessageIOS() {
    return $('~Exchange Successful')
  }

  private async selectWalletFromOpenPickerAndroid(currency: string) {
    const searchInput = this.walletPickerSearchInputAndroid
    await searchInput.waitForExist({ timeout: 10000 })
    await searchInput.setValue(currency)
    await this.hideKeyboardIfNeeded()
    await browser.pause(1000)

    // Some currencies use a different flag code (e.g. GBP uses flag-GB, not flag-GBP).
    // Try the canonical full-text first; fall back to matching on " <CODE>" (space + code)
    // which works for any flag prefix variant.
    const exactText = `flag-${currency} ${currency}`
    const codeText = ` ${currency}`

    const scrollPicker = async (direction: 'up' | 'down') => {
      const startY = direction === 'up' ? 1800 : 1100
      const endY = direction === 'up' ? 1100 : 1800

      await browser.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: 540, y: startY },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerMove', duration: 500, x: 540, y: endY },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])
      await browser.releaseActions().catch(() => {})
      await browser.pause(500)
    }

    const scrollDirections: Array<'up' | 'down'> = ['down', 'up', 'up', 'down']

    for (let attempt = 0; attempt <= scrollDirections.length; attempt++) {
      // Prefer exact match; if not found, use partial (space + code)
      let matches = $$(`android=new UiSelector().textContains("${exactText}")`)
      let count = await matches.length
      if (count === 0) {
        matches = $$(`android=new UiSelector().textContains("${codeText}")`)
        count = await matches.length
      }

      if (count > 0) {
        // The form Spinners (behind the AlertDialog) appear earlier in the view hierarchy than
        // the picker items inside the AlertDialog. Use the LAST match — it is always the actual
        // picker item. Clicking an earlier match (Spinner) sends the touch to the Spinner's
        // y-coordinate which, within the picker overlay, lands on the header row (no selection).
        const target = matches[count - 1]
        const clicked = await target.click().then(() => true).catch(() => false)
        if (!clicked) await this.tapElementCenter(target)
        await this.confirmSelectionIfShown()

        const pickerClosed = await browser.waitUntil(
          async () => !(await $('android=new UiSelector().className("android.app.AlertDialog")').isExisting().catch(() => false)),
          { timeout: 3000, interval: 300 }
        ).then(() => true).catch(() => false)

        if (pickerClosed) {
          await browser.pause(600)
          return
        }
      }

      const direction = scrollDirections[attempt]
      if (direction) await scrollPicker(direction)
    }

    throw new Error(`Wallet picker option not found for ${currency}`)
  }

  private async selectWalletFromOpenPickerIOS(currency: string) {
    await this.walletPickerSearchInputIOS.waitForExist({ timeout: 10000 })
    await this.walletPickerSearchInputIOS.clearValue().catch(() => {})
    await this.walletPickerSearchInputIOS.setValue(currency)
    await browser.pause(700)

    let option: WebdriverIO.Element | undefined
    const found = await browser.waitUntil(
      async () => {
        const textMatches = await this.walletOptionCodeIOS(currency)
        const flagMatches = await this.walletOptionFlagIOS(currency)
        const candidates = [...textMatches, ...flagMatches]

        for (const candidate of candidates) {
          const displayed = await candidate.isDisplayed().catch(() => false)
          if (displayed) {
            option = candidate
            return true
          }
        }

        return false
      },
      { timeout: 10000, interval: 300 }
    ).catch(() => false)

    if (!found || !option) {
      await this.debugSnapshot(`fx-ios-wallet-option-${currency}`)
      throw new Error(`iOS wallet picker option not found for ${currency}`)
    }

    await this.tapElementCenter(option, 10000)

    const pickerClosed = await browser.waitUntil(
      async () => !(await this.walletPickerSearchInputIOS.isExisting().catch(() => false)),
      { timeout: 5000, interval: 300 }
    ).then(() => true).catch(() => false)

    if (!pickerClosed) {
      await this.debugSnapshot(`fx-ios-wallet-picker-stayed-open-${currency}`)
      throw new Error(`iOS wallet picker stayed open after selecting ${currency}`)
    }

    await browser.pause(600)
  }

  private async dismissOpenPickerAndroid() {
    // First, dismiss any JS/WebView-level alerts (Angular validation popups)
    await browser.dismissAlert().catch(() => {})
    await browser.acceptAlert().catch(() => {})

    const alertOpen = await $('android=new UiSelector().className("android.app.AlertDialog")').isExisting().catch(() => false)
    if (!alertOpen) return

    // Distinguish wallet picker (has search-wallet-input) from app-level alert dialogs
    const isWalletPicker = await this.walletPickerSearchInputAndroid.isExisting().catch(() => false)

    if (!isWalletPicker) {
      // App validation alert — dismiss via OK button or hardware back
      const okBtn = $('android=new UiSelector().text("OK")')
      const hasOk = await okBtn.isExisting().catch(() => false)
      if (hasOk) {
        await okBtn.click().catch(() => {})
      } else {
        // Hardware back dismisses the dialog without navigating the WebView router
        // (AlertDialog intercepts back press before the WebView history stack)
        const anyBtn = $('android=new UiSelector().className("android.widget.Button")')
        const hasBtn = await anyBtn.isExisting().catch(() => false)
        if (hasBtn) await anyBtn.click().catch(() => {})
      }
      await browser.pause(600)
      return
    }

    // Wallet picker — tap above the bottom sheet (y≈200 is above dialog start at ~641) to
    // dismiss via backdrop; browser.back() is avoided because it navigates the WebView router
    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: 540, y: 200 },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 80 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
    await browser.pause(1000)

    const stillOpen = await $('android=new UiSelector().className("android.app.AlertDialog")').isExisting().catch(() => false)
    if (stillOpen) {
      await markBrowserStackStep('FX wallet picker stayed open after backdrop tap')
    }
  }

  private get backBtn() {
    if (browser.isAndroid) {
      return $('//*[@text="Back" or @content-desc="Back"]')
    }
    return $('~Back')
  }

  private get androidBackButtonCandidates(): WdioEl[] {
    return [
      $('android=new UiSelector().description("Back")'),
      $('android=new UiSelector().text("Back")'),
      $('android=new UiSelector().resourceIdMatches(".*:id/back$|^back$")'),
      $('android=new UiSelector().resourceIdMatches(".*:id/back_button$|^back_button$")'),
      $('android=new UiSelector().resourceIdMatches(".*:id/toolbar_back$|^toolbar_back$")'),
    ]
  }

  private get closeBtn() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().text("Close")')
    }
    return $('~Back')
  }

  private get exchangedToUsdAnchor() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().textContains("Exchanged From Eur")')
    }
    return $('~Exchanged to USD')
  }

  private async waitForAnyDisplayed(
    candidates: Array<WdioEl | WebdriverIO.Element>,
    timeout = 10000,
    label = 'element'
  ) {
    await browser.waitUntil(
      async () => {
        for (const el of candidates) {
          const resolved = (await el) as WebdriverIO.Element
          const visible = browser.isIOS
            ? await resolved.isExisting().catch(() => false)
            : await resolved.isDisplayed().catch(() => false)
          if (visible) return true
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

  private async getFirstDisplayed(
    candidates: Array<WdioEl | WebdriverIO.Element>,
    timeout = 10000,
    label = 'element'
  ) {
    await this.waitForAnyDisplayed(candidates, timeout, label)

    for (const el of candidates) {
      const resolved = (await el) as WebdriverIO.Element
      if (await resolved.isDisplayed().catch(() => false)) return resolved
    }

    throw new Error(`${label} did not appear`)
  }

  private async hideKeyboardIfNeeded() {
    if (browser.isAndroid) {
      await browser.hideKeyboard().catch(() => {})
      await browser.pause(300)
      return
    }

    await this.tapOutsideKeyboard()
  }

  private async tapOutsideKeyboard() {
    const { width } = await browser.getWindowRect()
    const x = Math.round(width * 0.5)
    const y = 84

    await browser
      .performActions([
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
      .catch(() => {})
    await browser.releaseActions().catch(() => {})
    await browser.pause(400)
  }

  private async tapElementCenter(
    element: WdioEl | WebdriverIO.Element,
    timeout = 10000
  ) {
    const resolved = (await element) as WebdriverIO.Element
    await resolved.waitForExist({ timeout })

    const { x, y } = await resolved.getLocation()
    const { width, height } = await resolved.getSize()
    const centerX = Math.round(x + width / 2)
    const centerY = Math.round(y + height / 2)

    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX, y: centerY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
    await browser.pause(400)
  }

  private async returnToHomeFromFxSuccessAndroid() {
    const homeRoot = $('android=new UiSelector().resourceIdMatches(".*:id/home_screen$|^home_screen$")')

    for (const backButton of this.androidBackButtonCandidates) {
      const visible = await backButton.isDisplayed().catch(() => false)
      if (!visible) continue

      await this.tapElementCenter(backButton, 10000)
      await markBrowserStackStep('Returned from FX success screen to Home')
      await HomeScreenPage.waitForHomeLoaded()
      return
    }

    await browser.back().catch(() => {})
    const homeVisibleAfterSystemBack = await homeRoot
      .waitForExist({ timeout: 7000 })
      .then(() => true)
      .catch(() => false)

    if (homeVisibleAfterSystemBack) {
      await markBrowserStackStep('Returned from FX success screen to Home using system Back')
      await HomeScreenPage.waitForHomeLoaded()
      return
    }

    await this.debugSnapshot('fx-exchange-success-back-missing')
    throw new Error('FX exchange stayed on FX success screen, but Back did not return to Home')
  }

  private async tapEnabledExchangeButton(amount = 11) {
    await this.waitForReadyToSubmit(amount)
    await this.exchangeSubmitButton.waitForExist({ timeout: 15000 })

    const canSubmit = await this.exchangeSubmitButton
      .waitForEnabled({ timeout: 30000 })
      .then(() => true)
      .catch(() => false)

    if (!canSubmit) {
      await this.debugSnapshot('fx-exchange-button-disabled')
      throw new Error('FX Exchange button did not become enabled')
    }

    await this.tapElementCenter(this.exchangeSubmitButton, 15000)
  }

  private async tapBottomExchangeButtonArea() {
    const { width, height } = await browser.getWindowRect()
    const x = Math.round(width * 0.5)
    const y = Math.round(height * 0.94)

    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
    await browser.pause(500)
  }

  private async readInputValue(input: WebdriverIO.Element) {
    if (browser.isAndroid) {
      const text = await input.getText().catch(() => '')
      if (text) return String(text)

      const textAttr = await input.getAttribute('text').catch(() => '')
      if (textAttr) return String(textAttr)
    }

    const value = await input.getAttribute('value').catch(() => '')
    return String(value)
  }

  private async enterFromAmount(amount: number | string) {
    const value = String(amount)
    const inputs = browser.isAndroid
      ? await $$('android=new UiSelector().className("android.widget.EditText")')
      : await $$('-ios class chain:**/XCUIElementTypeTextField')
    const candidateInputs: Array<{ el: WebdriverIO.Element; y: number }> = []

    for (const input of inputs) {
      const shown = await input.isDisplayed().catch(() => false)
      if (!shown) continue

      const y = await input.getLocation('y').catch(() => Number.MAX_SAFE_INTEGER)
      if (y < 150) continue

      candidateInputs.push({ el: input, y })
    }

    candidateInputs.sort((a, b) => a.y - b.y)
    const amountInput = candidateInputs[0]?.el

    if (!amountInput) {
      throw new Error('FX amount field did not appear')
    }

    await amountInput.click().catch(() => {})
    await amountInput.clearValue().catch(() => {})

    const typedWithAmountInput = await amountInput
      .setValue(value)
      .then(() => true)
      .catch(() => false)

    if (!typedWithAmountInput) {
      const activeFieldVisible = await this.activeTypingField.isExisting().catch(() => false)
      if (activeFieldVisible) {
        await this.activeTypingField.clearValue().catch(() => {})
        await this.activeTypingField.setValue(value).catch(() => {})
      } else {
        await browser.execute('mobile: type', { text: value }).catch(() => {})
      }
    }

    await browser.pause(500)

    const finalValueUpdated = await this.readInputValue(amountInput)
      .then((current) => current.includes(value))
      .catch(() => false)

    if (!finalValueUpdated) {
      throw new Error('FX amount did not update')
    }
  }

  private async getVisibleAmountValues() {
    const inputs = browser.isAndroid
      ? await $$('android=new UiSelector().className("android.widget.EditText")')
      : await $$('-ios class chain:**/XCUIElementTypeTextField')
    const values: Array<{ value: string; y: number }> = []

    for (const input of inputs) {
      const shown = await input.isDisplayed().catch(() => false)
      if (!shown) continue

      const y = await input.getLocation('y').catch(() => Number.MAX_SAFE_INTEGER)
      if (y < 150) continue

      const value = await this.readInputValue(input)
      values.push({ value: String(value), y })
    }

    values.sort((a, b) => a.y - b.y)
    return values.map((entry) => entry.value)
  }

  private async waitForReadyToSubmit(amount = 11) {
    const expectedAmount = String(amount)

    try {
      await browser.waitUntil(
        async () => {
          const values = await this.getVisibleAmountValues()
          const hasExpectedAmount = values[0]?.includes(expectedAmount) ?? false
          const submitVisible = await this.exchangeSubmitButton.isDisplayed().catch(() => false)

          if (browser.isAndroid) {
            return hasExpectedAmount && submitVisible
          }

          const toAmount = Number.parseFloat(String(values[1] ?? '').replace(',', '.'))
          const submitEnabled = await this.exchangeSubmitButton.isEnabled().catch(() => false)
          return hasExpectedAmount && Number.isFinite(toAmount) && toAmount > 0 && submitVisible && submitEnabled
        },
        {
          timeout: 15000,
          interval: 500,
          timeoutMsg: 'FX form did not reach ready-to-submit state',
        }
      )
    } catch (error) {
      await this.debugSnapshot('fx-ready-to-submit')
      throw error
    }
  }

  private async confirmSelectionIfShown() {
    const selectedVisible = await this.selectedButton.isDisplayed().catch(() => false)
    if (selectedVisible) {
      await this.tapElementCenter(this.selectedButton, 10000)
      await browser.pause(500)
      return
    }

    const confirmVisible = await this.confirmButton.isDisplayed().catch(() => false)
    if (!confirmVisible) return

    await this.tapElementCenter(this.confirmButton, 10000)
    await browser.pause(500)
  }

  private async ensureNewTabActive() {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const fromWalletVisible = browser.isIOS
        ? await this.fromWalletField.isExisting().catch(() => false)
        : (await this.fromWalletField.isDisplayed().catch(() => false)) ||
          (await this.fromWalletSelectAndroid.isExisting().catch(() => false)) ||
          (await this.exchangeFormAndroid.isExisting().catch(() => false))

      // iOS: form already visible means New tab is active (no explicit "New" button in newer builds)
      if (fromWalletVisible) return

      if (browser.isAndroid) {
        const newByTextVisible = await this.newTabButton.isDisplayed().catch(() => false)
        const newByResIdVisible = await this.newTabButtonAndroidByResId.isDisplayed().catch(() => false)

        if (newByTextVisible) {
          await this.tapElementCenter(this.newTabButton, 10000)
        } else if (newByResIdVisible) {
          await this.tapElementCenter(this.newTabButtonAndroidByResId, 10000)
        } else if (fromWalletVisible) {
          return
        }
      } else {
        // iOS: "New" button may not exist in newer builds — skip tap if not found
        const newBtnExists = await this.newTabButton.isExisting().catch(() => false)
        if (!newBtnExists) return
        await this.tapElementCenter(this.newTabButton, 10000)
      }

      await browser.pause(600)

      const formVisible = browser.isAndroid
        ? (await this.fromWalletField.isDisplayed().catch(() => false)) ||
          (await this.fromWalletSelectAndroid.isExisting().catch(() => false)) ||
          (await this.exchangeFormAndroid.isExisting().catch(() => false))
        : await this.fromWalletField.isDisplayed().catch(() => false)
      const nowSelected = browser.isAndroid
        ? formVisible
        : await this.newTabButton
            .getAttribute('value')
            .then((value) => String(value) === '1')
            .catch(() => false)

      if (nowSelected && formVisible) return
    }

    await this.debugSnapshot('fx-new-tab')
    throw new Error('FX Exchange did not switch to New tab')
  }

  private async smallScrollDownOnHome() {
    const { width, height } = await browser.getWindowRect()
    const x = Math.round(width * 0.5)
    const startY = Math.round(height * 0.76)
    const endY = Math.round(height * 0.56)

    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 150 },
          { type: 'pointerMove', duration: 350, x, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
    await browser.pause(700)
  }

  public async openFromHome() {
    await this.dismissIOSAlerts()
    await HomeScreenPage.waitForHomeLoaded()
    await HomeScreenPage.ensureIndividualAccount()
    await HomeScreenPage.waitForHomeLoaded()
    await this.dismissIOSAlerts()

    await this.homeExchangeButton.waitForExist({ timeout: 15000 })
    await browser.waitUntil(
      async () => {
        await this.tapElementCenter(this.homeExchangeButton, 15000).catch(() => {})
        for (const el of this.fxExchangeScreenCandidates) {
          if (await el.isExisting().catch(() => false)) return true
        }
        return false
      },
      { timeout: 25000, interval: 1500 }
    )
    await this.ensureNewTabActive()
    await this.waitForAnyDisplayed(this.fromWalletCandidates, 15000, 'From Wallet field')
  }

  public async selectExchangePair(amount = 11) {
    await this.ensureNewTabActive()
    await this.tapElementCenter(this.fromWalletField, 15000)
    await this.waitForAnyDisplayed(this.eurOptionCandidates, 15000, 'EUR option')

    const eurVisible = await this.eurOption.isDisplayed().catch(() => false)
    if (eurVisible) {
      await this.tapElementCenter(this.eurOption, 15000)
    } else {
      await this.tapElementCenter(this.eurOptionFallback, 15000)
    }

    await this.confirmSelectionIfShown()
    await this.enterFromAmount(amount)

    await this.tapElementCenter(this.toWalletField, 15000)
    if (browser.isAndroid) {
      await this.selectWalletFromOpenPickerAndroid('USD')
    } else {
      await this.selectWalletFromOpenPickerIOS('USD')
    }
    await this.confirmSelectionIfShown()
    await this.hideKeyboardIfNeeded()
  }

  public async submitExchange(amount = 11) {
    await this.tapEnabledExchangeButton(amount)

    if (browser.isAndroid) {
      // Wait for success screen: Back (secondary) or Continue (primary) appears
      const successShown = await browser.waitUntil(
        async () =>
          (await this.backBtn.isDisplayed().catch(() => false)) ||
          (await this.continueBtn.isDisplayed().catch(() => false)),
        { timeout: 20000, interval: 500 }
      ).then(() => true).catch(() => false)

      if (!successShown) {
        await this.debugSnapshot('fx-exchange-success-missing')
        throw new Error('FX exchange success screen did not appear after submit')
      }

      await markBrowserStackStep('FX success screen appeared')

      // Dismiss success screen by tapping its button (Back on secondary, Continue on primary)
      if (await this.backBtn.isDisplayed().catch(() => false)) {
        await this.tapElementCenter(this.backBtn, 10000)
      } else if (await this.continueBtn.isDisplayed().catch(() => false)) {
        await this.tapElementCenter(this.continueBtn, 10000)
      }

      // Navigate to home: press system back until home_screen appears
      await browser.waitUntil(
        async () => {
          const homeShown = await $('android=new UiSelector().resourceIdMatches(".*:id/home_screen$|^home_screen$")').isDisplayed().catch(() => false)
          if (homeShown) return true
          await browser.back().catch(() => {})
          return false
        },
        { timeout: 30000, interval: 800 }
      )

      await HomeScreenPage.waitForHomeLoaded()
      return
    }

    await this.continueBtn.waitForExist({ timeout: 20000 })
    await this.tapElementCenter(this.continueBtn, 20000)

    await this.backBtn.waitForExist({ timeout: 20000 })
    await this.tapElementCenter(this.backBtn, 20000)
    await HomeScreenPage.waitForHomeLoaded()
  }

  public async submitExchangeAndroid(amount = 11) {
    await this.tapEnabledExchangeButton(amount)

    const successShown = await this.continueBtn
      .waitForExist({ timeout: 20000 })
      .then(() => true)
      .catch(() => false)

    if (!successShown) {
      await this.debugSnapshot('fx-exchange-success-missing')
      throw new Error('FX exchange success screen did not appear after submit')
    }

    await markBrowserStackStep('FX success screen appeared')
  }

  public async verifyExchangeOnHome() {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const visible = await this.exchangedToUsdAnchor.isDisplayed().catch(() => false)
      if (visible) return

      await this.smallScrollDownOnHome()
    }

    await this.exchangedToUsdAnchor.waitForExist({ timeout: 10000 })
  }

  public async exchangeEurToUsdFlow(amount = 11) {
    await this.openFromHome()
    await this.selectExchangePair(amount)
    await this.submitExchange(amount)
    await this.verifyExchangeOnHome()
  }

  /* ── ANDROID: granular verification methods ── */

  public async verifyExchangeScreenVisibleAndroid() {
    await this.exchangeFormAndroid.waitForExist({ timeout: 15000 })
  }

  public async verifyExchangeScreenVisibleIOS() {
    await $('~FX Exchange').waitForExist({ timeout: 15000 })
    await this.fromWalletFieldIOS.waitForExist({ timeout: 15000 })
  }

  private async ensureExchangeScreenReadyIOS() {
    const screenVisible = await $('~FX Exchange').isExisting().catch(() => false)
    const fromWalletVisible = await this.fromWalletFieldIOS.isExisting().catch(() => false)
    if (screenVisible && fromWalletVisible) {
      await this.ensureNewTabActive()
      return
    }

    await this.debugSnapshot('fx-ios-exchange-screen-missing')
    throw new Error('iOS FX Exchange screen is not visible')
  }

  private async ensureExchangeScreenReadyAndroid() {
    const formVisible = await this.exchangeFormAndroid.isExisting().catch(() => false)
    const fromWalletVisible = await this.fromWalletSelectAndroid.isExisting().catch(() => false)
    if (formVisible || fromWalletVisible) {
      await this.ensureNewTabActive()
      return
    }

    const homeVisible = await $('android=new UiSelector().resourceIdMatches(".*:id/home_screen$|^home_screen$")')
      .isExisting()
      .catch(() => false)
    if (homeVisible) {
      await this.openFromHome()
      return
    }

    await this.debugSnapshot('fx-exchange-screen-missing')
    throw new Error('FX Exchange screen is not visible')
  }

  public async verifyFromWalletBalanceDisplayedAndroid() {
    await this.fromWalletBalanceAndroid.waitForExist({ timeout: 10000 })
    const text = await this.fromWalletBalanceAndroid.getText()
    if (!text.includes('Balance')) throw new Error(`Balance not shown: "${text}"`)
  }

  public async verifyFromWalletBalanceDisplayedIOS() {
    await $('~New Available Balance').waitForExist({ timeout: 10000 })
  }

  public async verifySubmitDisabledAndroid() {
    await this.exchangeSubmitBtnByIdAndroid.waitForExist({ timeout: 10000 })
    const enabled = await this.exchangeSubmitBtnByIdAndroid.isEnabled()
    if (enabled) throw new Error('Submit button should be disabled when amount is 0')
  }

  public async verifySubmitDisabledIOS() {
    await this.exchangeSubmitButton.waitForExist({ timeout: 10000 })
    const enabled = await this.exchangeSubmitButton.isEnabled()
    if (enabled) throw new Error('iOS submit button should be disabled')
  }

  private async verifySelectedWalletAndroid(
    walletField: WdioEl,
    currency: string,
    label: 'from' | 'to'
  ) {
    const selected = await browser.waitUntil(
      async () => {
        const text = await walletField.getText().catch(() => '')
        return text.includes(currency)
      },
      { timeout: 5000, interval: 500 }
    ).then(() => true).catch(() => false)

    if (selected) return true

    const homeVisible = await $('android=new UiSelector().resourceIdMatches(".*:id/home_screen$|^home_screen$")')
      .isExisting()
      .catch(() => false)
    if (homeVisible) {
      await markBrowserStackStep(`FX ${label} wallet ${currency} selection landed on Home`)
      return false
    }

    const pickerOpen = await $('android=new UiSelector().className("android.app.AlertDialog")')
      .isExisting()
      .catch(() => false)
    if (pickerOpen) {
      await markBrowserStackStep(`FX ${label} wallet ${currency} picker stayed open`)
      return false
    }

    await markBrowserStackStep(`FX ${label} wallet did not update to ${currency}`)
    return false
  }

  public async selectFromWalletAndroid(currency: string) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await this.ensureExchangeScreenReadyAndroid()
      await this.hideKeyboardIfNeeded()
      await this.dismissOpenPickerAndroid()

      // No-op if already selected — re-selecting triggers an Angular form reset
      const currentText = await this.fromWalletSelectAndroid.getText().catch(() => '')
      if (currentText.includes(currency)) {
        await markBrowserStackStep(`Verified ${currency} as from wallet`)
        return
      }

      // Prefer "From Wallet" label (triggers Angular picker); fall back to spinner when label is gone
      const labelVisible = await this.fromWalletField.isExisting().catch(() => false)
      if (labelVisible) {
        await this.tapElementCenter(this.fromWalletField)
      } else {
        await this.tapElementCenter(this.fromWalletSelectAndroid)
      }
      await this.selectWalletFromOpenPickerAndroid(currency)

      if (await this.verifySelectedWalletAndroid(this.fromWalletSelectAndroid, currency, 'from')) {
        await markBrowserStackStep(`Selected ${currency} as from wallet`)
        return
      }
    }

    throw new Error(`From wallet did not update to ${currency}`)
  }

  public async selectFromWalletIOS(currency: string) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await this.ensureExchangeScreenReadyIOS()
      await this.hideKeyboardIfNeeded()

      if (await this.selectedWalletIOS(currency).isExisting().catch(() => false)) {
        await markBrowserStackStep(`Verified ${currency} as iOS from wallet`)
        return
      }

      await this.tapElementCenter(this.fromWalletFieldIOS, 10000)
      await this.selectWalletFromOpenPickerIOS(currency)

      if (await this.verifySelectedWalletIOS(currency, 'from')) {
        await markBrowserStackStep(`Selected ${currency} as iOS from wallet`)
        return
      }
    }

    throw new Error(`iOS from wallet did not update to ${currency}`)
  }

  public async selectToWalletAndroid(currency: string) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await this.ensureExchangeScreenReadyAndroid()
      await this.hideKeyboardIfNeeded()
      await this.dismissOpenPickerAndroid()

      // No-op if already selected — re-selecting triggers an Angular form reset
      const currentText = await this.toWalletSelectAndroid.getText().catch(() => '')
      if (currentText.includes(currency)) {
        await markBrowserStackStep(`Verified ${currency} as to wallet`)
        return
      }

      // Prefer "To Wallet" label (triggers Angular picker); fall back to spinner when label is gone
      const labelVisible = await this.toWalletField.isExisting().catch(() => false)
      if (labelVisible) {
        await this.tapElementCenter(this.toWalletField)
      } else {
        await this.tapElementCenter(this.toWalletSelectAndroid)
      }
      await this.selectWalletFromOpenPickerAndroid(currency)

      if (await this.verifySelectedWalletAndroid(this.toWalletSelectAndroid, currency, 'to')) {
        await markBrowserStackStep(`Selected ${currency} as to wallet`)
        return
      }
    }

    throw new Error(`To wallet did not update to ${currency}`)
  }

  public async selectToWalletIOS(currency: string) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await this.ensureExchangeScreenReadyIOS()
      await this.hideKeyboardIfNeeded()

      const selected = await this.selectedWalletIOS(currency).isExisting().catch(() => false)
      const selectedWalletCount = await $$('//XCUIElementTypeOther[starts-with(@name, "flag-") and @visible="true"]').length
      if (selected && selectedWalletCount > 1) {
        await markBrowserStackStep(`Verified ${currency} as iOS to wallet`)
        return
      }

      await this.tapElementCenter(this.toWalletFieldIOS, 10000)
      await this.selectWalletFromOpenPickerIOS(currency)

      if (await this.verifySelectedWalletIOS(currency, 'to')) {
        await markBrowserStackStep(`Selected ${currency} as iOS to wallet`)
        return
      }
    }

    throw new Error(`iOS to wallet did not update to ${currency}`)
  }

  public async tapSwitchButtonAndroid() {
    await this.tapElementCenter(this.exchangeSwitchBtnAndroid)
    await browser.pause(500)
    await markBrowserStackStep('Tapped FX swap button')
  }

  public async tapSwitchButtonIOS() {
    const switchButton = $('//XCUIElementTypeButton[@visible="true" and not(@name="Exchange") and not(@name="History") and not(@name="Back") and not(@name="Close") and not(@name="Continue")]')
    await this.tapElementCenter(switchButton, 10000)
    await browser.pause(500)
    await markBrowserStackStep('Tapped iOS FX swap button')
  }

  public async verifyFromWalletAndroid(currency: string) {
    await browser.waitUntil(
      async () => (await this.fromWalletSelectAndroid.getText().catch(() => '')).includes(currency),
      { timeout: 10000, interval: 500, timeoutMsg: `From wallet expected "${currency}"` }
    )
  }

  public async verifyToWalletAndroid(currency: string) {
    await browser.waitUntil(
      async () => (await this.toWalletSelectAndroid.getText().catch(() => '')).includes(currency),
      { timeout: 10000, interval: 500, timeoutMsg: `To wallet expected "${currency}"` }
    )
  }

  private async verifySelectedWalletIOS(currency: string, label: 'from' | 'to') {
    const index = label === 'from' ? 0 : 1
    return browser.waitUntil(
      async () => {
        const visibleWallets = await $$('//XCUIElementTypeOther[starts-with(@name, "flag-") and @visible="true"]')
        const text = await visibleWallets[index]?.getAttribute('name').catch(() => '')
        return String(text).includes(currency)
      },
      { timeout: 7000, interval: 500 }
    ).then(() => true).catch(() => false)
  }

  public async verifyFromWalletIOS(currency: string) {
    await browser.waitUntil(
      async () => this.verifySelectedWalletIOS(currency, 'from'),
      { timeout: 10000, interval: 500, timeoutMsg: `iOS from wallet expected "${currency}"` }
    )
  }

  public async verifyToWalletIOS(currency: string) {
    await browser.waitUntil(
      async () => this.verifySelectedWalletIOS(currency, 'to'),
      { timeout: 10000, interval: 500, timeoutMsg: `iOS to wallet expected "${currency}"` }
    )
  }

  public async enterAmountAndroid(amount: number | string) {
    await this.enterFromAmount(amount)
    await this.hideKeyboardIfNeeded()
    await browser.pause(300)
  }

  public async enterAmountIOS(amount: number | string) {
    await this.enterFromAmount(amount)
    await this.tapOutsideKeyboard()
    await browser.pause(300)
  }

  public async verifyInsufficientBalanceErrorAndroid() {
    await browser.waitUntil(
      async () => {
        // Primary: submit button disabled means validation error fired (covers all error message variants)
        const btnExists = await this.exchangeSubmitBtnByIdAndroid.isExisting().catch(() => false)
        if (btnExists) {
          const enabled = await this.exchangeSubmitBtnByIdAndroid.isEnabled().catch(() => true)
          if (!enabled) return true
        }
        // Secondary: look for explicit error element or text
        const byId = await this.insufficientBalanceErrorAndroid.isExisting().catch(() => false)
        const byInsufficient = await $('android=new UiSelector().textContains("Insufficient")').isExisting().catch(() => false)
        const byExceed = await $('android=new UiSelector().textContains("xceed")').isExisting().catch(() => false)
        return byId || byInsufficient || byExceed
      },
      { timeout: 20000, interval: 500, timeoutMsg: 'Insufficient balance error did not appear and submit button did not become disabled' }
    )
  }

  public async verifyInsufficientBalanceErrorIOS() {
    await browser.waitUntil(
      async () => {
        const errorVisible = await this.insufficientBalanceErrorIOS.isExisting().catch(() => false)
        const submitDisabled = await this.exchangeSubmitButton.isEnabled().then(enabled => !enabled).catch(() => false)
        return errorVisible || submitDisabled
      },
      { timeout: 15000, interval: 500, timeoutMsg: 'iOS insufficient balance error did not appear and submit stayed enabled' }
    )
  }

  public async verifyToAmountCalculatedAndroid() {
    const toInput = $('//*[@resource-id="custom-number-input-to"]')
    await browser.waitUntil(
      async () => {
        const text =
          (await toInput.getText().catch(() => '')) ||
          (await toInput.getAttribute('text').catch(() => ''))
        return !isNaN(parseFloat(text)) && parseFloat(text) > 0
      },
      { timeout: 10000, interval: 500, timeoutMsg: 'Exchange rate not calculated in to-amount field' }
    )
  }

  public async verifyToAmountCalculatedIOS() {
    await browser.waitUntil(
      async () => {
        const values = await this.getVisibleAmountValues()
        const toAmount = Number.parseFloat(String(values[1] ?? '').replace(',', '.'))
        const rateVisible = await this.currentRateIOS.isExisting().catch(() => false)
        return Number.isFinite(toAmount) && toAmount > 0 && rateVisible
      },
      { timeout: 15000, interval: 500, timeoutMsg: 'iOS exchange rate was not calculated in to-amount field' }
    )
  }

  public async completeExchangeAndroid(fromCurrency: string, toCurrency: string, amount = 11) {
    await this.ensureExchangeScreenReadyAndroid()
    await this.selectFromWalletAndroid(fromCurrency)
    await this.ensureExchangeScreenReadyAndroid()
    await this.selectToWalletAndroid(toCurrency)
    await this.ensureExchangeScreenReadyAndroid()
    await this.enterFromAmount(amount)
    await this.hideKeyboardIfNeeded()
    await this.submitExchangeAndroid(amount)
  }

  public async completeExchangeIOS(fromCurrency: string, toCurrency: string, amount = 11) {
    await this.ensureExchangeScreenReadyIOS()
    await this.selectFromWalletIOS(fromCurrency)
    await this.ensureExchangeScreenReadyIOS()
    await this.selectToWalletIOS(toCurrency)
    await this.ensureExchangeScreenReadyIOS()
    await this.enterAmountIOS(amount)
    await this.submitExchangeIOS(amount)
  }

  public async submitExchangeIOS(amount = 11) {
    await this.tapEnabledExchangeButton(amount)

    const successShown = await this.successMessageIOS
      .waitForExist({ timeout: 20000 })
      .then(() => true)
      .catch(() => false)

    if (!successShown) {
      await this.debugSnapshot('fx-ios-exchange-success-missing')
      throw new Error('iOS FX exchange success screen did not appear after submit')
    }

    await this.continueBtn.waitForExist({ timeout: 10000 })
    await markBrowserStackStep('iOS FX success screen appeared')
  }
}

export default FXExchangePage
