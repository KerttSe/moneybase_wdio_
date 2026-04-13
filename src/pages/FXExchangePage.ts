import BasePage from './BasePage'
import HomeScreenPage from './HomeScreenPage'
import { $, $$, browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'

type WdioEl = ChainablePromiseElement

class FXExchangePage extends BasePage {
  private get homeExchangeButton() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().resourceId("home_button_exchange")')
    }
    return $('~ic_exchange')
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
      $('~FX Exchange'),
      $('-ios predicate string: name == "FX Exchange" OR label == "FX Exchange"'),
    ]
  }

  private get newTabButton() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().text("New")')
    }
    return $('-ios predicate string: type == "XCUIElementTypeButton" AND name == "New"')
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

  private get dollarWalletOption() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().text("Dollar wallet")')
    }
    return $('~Dollar wallet')
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

  private get backBtn() {
    if (browser.isAndroid) {
      return $('android=new UiSelector().description("Back")')
    }
    return $('~Back')
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
    await browser.hideKeyboard().catch(() => {})

    if (browser.isAndroid) {
      await browser.pause(300)
      return
    }

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
    await resolved.waitForDisplayed({ timeout })

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

          const eurVisible = await this.selectedEurWallet.isDisplayed().catch(() => false)
          const usdVisible = await this.selectedUsdWallet.isDisplayed().catch(() => false)
          return eurVisible && usdVisible && hasExpectedAmount && submitVisible
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
      const fromWalletVisible = await this.fromWalletField.isDisplayed().catch(() => false)
      const newSelected = browser.isAndroid
        ? fromWalletVisible
        : await this.newTabButton
            .getAttribute('value')
            .then((value) => String(value) === '1')
            .catch(() => false)

      if (newSelected && fromWalletVisible) return

      await this.tapElementCenter(this.newTabButton, 10000)
      await browser.pause(600)

      const formVisible = await this.fromWalletField.isDisplayed().catch(() => false)
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
    await browser.releaseActions()
    await browser.pause(700)
  }

  public async openFromHome() {
    await this.dismissIOSAlerts()
    await HomeScreenPage.waitForHomeLoaded()
    await HomeScreenPage.ensureIndividualAccount()
    await HomeScreenPage.waitForHomeLoaded()
    await this.dismissIOSAlerts()

    await this.homeExchangeButton.waitForDisplayed({ timeout: 15000 })
    await this.tapElementCenter(this.homeExchangeButton, 15000)
    await this.waitForAnyDisplayed(this.fxExchangeScreenCandidates, 15000, 'FX Exchange screen')
    await this.newTabButton.waitForDisplayed({ timeout: 15000 })
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
    await this.tapElementCenter(this.dollarWalletOption, 15000)
    await this.confirmSelectionIfShown()
    await this.hideKeyboardIfNeeded()
  }

  public async submitExchange(amount = 11) {
    await this.waitForReadyToSubmit(amount)
    await this.exchangeSubmitButton.waitForDisplayed({ timeout: 15000 })
    await this.exchangeSubmitButton.waitForEnabled({ timeout: 15000 }).catch(() => {})
    await this.tapElementCenter(this.exchangeSubmitButton, 15000)

    await this.continueBtn.waitForDisplayed({ timeout: 20000 })
    await this.tapElementCenter(this.continueBtn, 20000)

    if (browser.isAndroid) {
      const homeRoot = $('android=new UiSelector().resourceId("home_screen")')
      const homeVisibleAfterContinue = await homeRoot
        .waitForDisplayed({ timeout: 5000 })
        .then(() => true)
        .catch(() => false)

      if (!homeVisibleAfterContinue) {
        const closeVisible = await this.closeBtn.isDisplayed().catch(() => false)
        if (closeVisible) {
          await this.tapElementCenter(this.closeBtn, 10000)
        }
      }

      const homeVisibleAfterClose = await homeRoot
        .waitForDisplayed({ timeout: 5000 })
        .then(() => true)
        .catch(() => false)

      if (!homeVisibleAfterClose) {
        const stillOnFxScreen = await this.fxExchangeScreenCandidates[0]?.isDisplayed().catch(() => false)
        if (stillOnFxScreen) {
          await browser.back().catch(() => {})
        }
      }

      await HomeScreenPage.waitForHomeLoaded()
      return
    }

    await this.backBtn.waitForDisplayed({ timeout: 20000 })
    await this.tapElementCenter(this.backBtn, 20000)
    await HomeScreenPage.waitForHomeLoaded()
  }

  public async verifyExchangeOnHome() {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const visible = await this.exchangedToUsdAnchor.isDisplayed().catch(() => false)
      if (visible) return

      await this.smallScrollDownOnHome()
    }

    await this.exchangedToUsdAnchor.waitForDisplayed({ timeout: 10000 })
  }

  public async exchangeEurToUsdFlow(amount = 11) {
    await this.openFromHome()
    await this.selectExchangePair(amount)
    await this.submitExchange(amount)
    await this.verifyExchangeOnHome()
  }
}

export default FXExchangePage
