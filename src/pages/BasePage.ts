import type { ChainablePromiseElement } from 'webdriverio'
import { browser } from '@wdio/globals'

type WdioEl = ChainablePromiseElement

type EnsureSingleAccountAndroidParams = {
  userAvatarBtn: WdioEl
  businessAccountLabel: WdioEl
  singleAccountItemByDesc: WdioEl
  singleAccountItemByText: WdioEl
  alertBtn3?: WdioEl
  homeRoot?: WdioEl
  timeoutMs?: number
  alertTimeoutMs?: number
}

export default class BasePage {
  async pause(ms = 1000) {
    await browser.pause(ms)
  }

  async tap(el: WdioEl, timeout = 10000) {
    await el.waitForDisplayed({ timeout })
    await el.click()
  }

  async type(el: WdioEl, value: string, timeout = 10000) {
    await el.waitForDisplayed({ timeout })
    await el.setValue(value)
  }

  async isDisplayed(el: WdioEl, timeout = 1000) {
    try {
      await el.waitForDisplayed({ timeout })
      return true
    } catch {
      return false
    }
  }

  async dismissIOSAlerts() {
    try {
      if (await browser.isAlertOpen()) {
        await browser.acceptAlert()
      }
    } catch {}
  }

  async debugSnapshot(tag = 'debug') {
    try {
      const src = await browser.getPageSource()
      console.log(`\n[${tag}] SOURCE HEAD:\n${src.slice(0, 2000)}\n`)
    } catch {}
  }

  protected async ensureSingleAccountAndroidFlow(params: EnsureSingleAccountAndroidParams) {
    if (!browser.isAndroid) return

    const {
      userAvatarBtn,
      businessAccountLabel,
      singleAccountItemByDesc,
      singleAccountItemByText,
      alertBtn3,
      homeRoot,
      timeoutMs = 15000,
      alertTimeoutMs = 2000,
    } = params

    const isBusiness = await businessAccountLabel.isDisplayed().catch(() => false)
    if (!isBusiness) return

    await userAvatarBtn.waitForDisplayed({ timeout: timeoutMs })
    await this.tap(userAvatarBtn)

    const byDescVisible = await singleAccountItemByDesc.isDisplayed().catch(() => false)
    if (byDescVisible) {
      await this.tap(singleAccountItemByDesc)
    } else {
      await singleAccountItemByText.waitForDisplayed({ timeout: timeoutMs })
      await this.tap(singleAccountItemByText)
    }

    if (alertBtn3) {
      await browser.switchContext('NATIVE_APP').catch(() => {})
      const alertShown = await alertBtn3.waitForDisplayed({ timeout: alertTimeoutMs }).catch(() => false)
      if (alertShown) {
        await this.tap(alertBtn3)
        await alertBtn3.waitForDisplayed({ reverse: true, timeout: 7000 }).catch(() => {})
      }
    }

    if (homeRoot) {
      await homeRoot.waitForDisplayed({ timeout: 20000 }).catch(() => {})
    }
  }
}
