import BasePage from './BasePage'
import HomeScreenPage from './HomeScreenPage'
import { $, browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'

type WdioEl = ChainablePromiseElement

class HomeSearchPage extends BasePage {
  private get homeSearchInputAndroid() {
    return $('android=new UiSelector().resourceId("home_input_search")')
  }

  private get homeSearchInputAndroidByXpath() {
    return $('//android.view.View[@resource-id="home_input_search"]')
  }

  private get homeSearchInputIOS() {
    return $('~home_input_search')
  }

  private get androidSearchEditText() {
    return $('android=new UiSelector().className("android.widget.EditText").instance(0)')
  }

  private get homeSearchInputCandidates(): WdioEl[] {
    if (browser.isAndroid) {
      return [
        this.homeSearchInputAndroid,
        this.homeSearchInputAndroidByXpath,
      ]
    }

    return [
      this.homeSearchInputIOS,
      $('-ios class chain:**/XCUIElementTypeSearchField'),
      $('-ios class chain:**/XCUIElementTypeTextField[`name == "home_input_search"`]'),
    ]
  }

  private get homeSearchResultCandidates(): WdioEl[] {
    if (browser.isAndroid) {
      return [
        $('android=new UiSelector().descriptionContains("Carlos Cat")'),
        $('android=new UiSelector().textContains("Carlos Cat")'),
        $('android=new UiSelector().descriptionContains("To Carlos Cat")'),
      ]
    }

    return [
      $('~To Carlos Cat'),
      $('~Carlos Cat'),
      $('-ios predicate string: label CONTAINS "Carlos Cat" OR name CONTAINS "Carlos Cat"'),
    ]
  }

  private get openedRecipientScreenCandidates(): WdioEl[] {
    if (browser.isAndroid) {
      return [
        $('android=new UiSelector().resourceId("beneficiaryDetails_button_pay")'),
        $('android=new UiSelector().resourceId("beneficiaryDetails_button_back")'),
        $('//*[@resource-id="beneficiaryDetails_button_pay"]'),
        $('//*[@resource-id="beneficiaryDetails_button_back"]'),
        $('android=new UiSelector().textContains("Carlos Cat")'),
        $('android=new UiSelector().descriptionContains("Carlos Cat")'),
        $('android=new UiSelector().resourceId("makePayment_input_amount")'),
      ]
    }

    return [
      $('~beneficiaryDetails_button_pay'),
      $('~BackButton'),
      $('~Carlos Cat'),
      $('~pay_item_Carlos Cat'),
      $('~makePayment_input_amount'),
      $('-ios predicate string: name == "beneficiaryDetails_button_pay" OR label == "Pay"'),
      $('-ios predicate string: name CONTAINS "Carlos Cat" OR label CONTAINS "Carlos Cat"'),
    ]
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
      const visible = await resolved.isDisplayed().catch(() => false)
      if (visible) return resolved
    }

    throw new Error(`${label} did not appear`)
  }

  private async tapFirstDisplayed(
    candidates: Array<WdioEl | WebdriverIO.Element>,
    timeout = 10000,
    label = 'element'
  ) {
    const first = await this.getFirstDisplayed(candidates, timeout, label)
    await first.click()
  }

  private async scrollUpOnceIOS() {
    const { width, height } = await browser.getWindowRect()
    const x = Math.round(width * 0.5)
    const startY = Math.round(height * 0.3)
    const endY = Math.round(height * 0.78)

    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 150 },
          { type: 'pointerMove', duration: 500, x, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions()
    await browser.pause(700)
  }

  private async ensureSearchInputVisible() {
    if (!browser.isIOS) {
      await this.waitForAnyDisplayed(this.homeSearchInputCandidates, 15000, 'Home search input')
      return
    }

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const visible = await this.homeSearchInputCandidates[0].isDisplayed().catch(() => false)
      if (visible) return

      const anyVisible = await Promise.all(
        this.homeSearchInputCandidates.map((el) => el.isDisplayed().catch(() => false))
      )
      if (anyVisible.some(Boolean)) return

      await this.scrollUpOnceIOS()
    }

    await this.waitForAnyDisplayed(this.homeSearchInputCandidates, 8000, 'Home search input')
  }

  private async typeIntoSearch(value: string) {
    const input = await this.getFirstDisplayed(
      this.homeSearchInputCandidates,
      15000,
      'Home search input'
    )

    await input.click().catch(() => {})
    await browser.pause(250)

    if (browser.isIOS) {
      await input.clearValue().catch(() => {})
      const typed = await input.setValue(value).then(() => true).catch(() => false)
      if (!typed) {
        await browser.execute('mobile: type', { text: value }).catch(() => {})
      }
      return
    }

    const androidInput = await this.getAndroidTypingTarget(input)
    await androidInput.click().catch(() => {})
    await androidInput.clearValue().catch(() => {})

    const typedWithElement = await androidInput.addValue(value).then(() => true).catch(() => false)
    if (typedWithElement) return

    const typedWithSetValue = await androidInput.setValue(value).then(() => true).catch(() => false)
    if (typedWithSetValue) return

    const safe = value.replace(/ /g, '%s')
    await browser.execute('mobile: shell', {
      command: 'input',
      args: ['text', safe],
    })
  }

  private async getAndroidTypingTarget(fallbackInput: WebdriverIO.Element) {
    if (!browser.isAndroid) return fallbackInput

    await browser.pause(350)

    const editTextVisible = await this.androidSearchEditText.isDisplayed().catch(() => false)
    if (editTextVisible) {
      return this.androidSearchEditText as unknown as WebdriverIO.Element
    }

    return fallbackInput
  }

  public async verifyHomeSearch(query = 'cat') {
    await this.dismissIOSAlerts()
    await HomeScreenPage.waitForHomeLoaded()
    await HomeScreenPage.ensureIndividualAccount()
    await HomeScreenPage.waitForHomeLoaded()
    await this.dismissIOSAlerts()
    await this.ensureSearchInputVisible()
    await this.typeIntoSearch(query)
    await this.waitForAnyDisplayed(this.homeSearchResultCandidates, 15000, 'Carlos Cat search result')
    await this.tapFirstDisplayed(this.homeSearchResultCandidates, 10000, 'Carlos Cat search result')
    await this.waitForAnyDisplayed(this.openedRecipientScreenCandidates, 15000, 'Opened recipient screen')
  }
}

export default HomeSearchPage
