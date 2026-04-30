import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'

type WdioEl = ChainablePromiseElement

export default class CashFundsPage extends BasePage {
  private iosA11y(id: string) {
    return $(`~${id}`)
  }

  private androidA11y(id: string) {
    return $(`~${id}`)
  }

  private androidUiSelector(selector: string) {
    return $(`android=${selector}`)
  }

  private iosPredicate(predicate: string) {
    return $(`-ios predicate string:${predicate}`)
  }

  private iosClassChain(chain: string) {
    return $(`-ios class chain:${chain}`)
  }

  private async isAnyDisplayed(candidates: Array<WdioEl | WebdriverIO.Element>) {
    for (const el of candidates) {
      try {
        const resolved = (await el) as WebdriverIO.Element
        if (await resolved.isDisplayed().catch(() => false)) return true
      } catch {
        // ignore no-such-element / stale while scanning
      }
    }
    return false
  }

  private async tapCenterIOS(el: WebdriverIO.Element) {
    const loc = await el.getLocation()
    const size = await el.getSize()
    const x = Math.round(loc.x + size.width / 2)
    const y = Math.round(loc.y + size.height / 2)

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
  }

  private async isHittableIOS(el: WebdriverIO.Element) {
    if (!browser.isIOS) return true
    const hittable = await el.getAttribute('hittable').catch(() => null)
    if (typeof hittable === 'string') return hittable.toLowerCase() === 'true'
    if (typeof hittable === 'boolean') return hittable
    return true
  }

  private async waitForAnyDisplayed(candidates: Array<WdioEl | WebdriverIO.Element>, timeout = 10000, label = 'element') {
    await browser.waitUntil(
      async () => {
        for (const el of candidates) {
          try {
            const resolved = (await el) as WebdriverIO.Element
            if (await resolved.isDisplayed().catch(() => false)) return true
          } catch {
            // ignore no-such-element / stale while waiting
          }
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
    for (let i = 0; i < candidates.length; i += 1) {
      const candidate = candidates[i]
      let resolved: WebdriverIO.Element
      try {
        resolved = (await candidate) as WebdriverIO.Element
      } catch {
        continue
      }
      await resolved.waitForDisplayed({ timeout: 2000 }).catch(() => {})
      const visible = await resolved.isDisplayed().catch(() => false)
      if (!visible) continue

      const selector = (resolved as any).selector ? String((resolved as any).selector) : 'unknown-selector'
      const hittable = await this.isHittableIOS(resolved).catch(() => true)

      console.log(`[tap] ${label} -> candidate#${i + 1}/${candidates.length} selector=${selector} hittable=${hittable}`)

      if (browser.isIOS) {
        const tryTap = async (el: WebdriverIO.Element) => {
          await el.waitForDisplayed({ timeout: 3000 })
          await this.tapCenterIOS(el)
        }

        try {
          await tryTap(resolved)
        } catch (e1) {
          if (selector !== 'unknown-selector') {
            try {
              const fresh = (await $(selector)) as unknown as WebdriverIO.Element
              await tryTap(fresh)
            } catch (e2) {
              const fresh = (await $(selector)) as unknown as WebdriverIO.Element
              await fresh.waitForDisplayed({ timeout: 3000 })
              await fresh.click()
            }
          } else {
            throw e1
          }
        }
      } else {
        await resolved.click()
      }

      return
    }

    throw new Error(`${label} did not appear`)
  }

  private async tapFirstDisplayedAndWaitFor(
    candidates: Array<WdioEl | WebdriverIO.Element>,
    expected: WdioEl | WebdriverIO.Element,
    label = 'element',
    timeout = 10000
  ) {
    for (let i = 0; i < candidates.length; i += 1) {
      const candidate = candidates[i]
      let resolved: WebdriverIO.Element
      try {
        resolved = (await candidate) as WebdriverIO.Element
      } catch {
        continue
      }
      await resolved.waitForDisplayed({ timeout: 2000 }).catch(() => {})
      const visible = await resolved.isDisplayed().catch(() => false)
      if (!visible) continue

      const selector = (resolved as any).selector ? String((resolved as any).selector) : 'unknown-selector'
      const hittable = await this.isHittableIOS(resolved).catch(() => true)
      console.log(`[tap] ${label} -> candidate#${i + 1}/${candidates.length} selector=${selector} hittable=${hittable}`)

      if (browser.isIOS) {
        const tryTap = async (el: WebdriverIO.Element) => {
          await el.waitForDisplayed({ timeout: 3000 })
          await this.tapCenterIOS(el)
        }

        try {
          await tryTap(resolved)
        } catch (e1) {
          if (selector !== 'unknown-selector') {
            try {
              const fresh = (await $(selector)) as unknown as WebdriverIO.Element
              await tryTap(fresh)
            } catch (e2) {
              const fresh = (await $(selector)) as unknown as WebdriverIO.Element
              await fresh.waitForDisplayed({ timeout: 3000 })
              await fresh.click()
            }
          } else {
            throw e1
          }
        }
      } else {
        await resolved.click()
      }

      const expectedEl = (await expected) as WebdriverIO.Element
      const ok = await expectedEl.waitForDisplayed({ timeout }).then(() => true).catch(() => false)
      if (ok) return

      console.log(`[tap] ${label} candidate#${i + 1} did not reach expected state; trying next candidate`)
    }

    throw new Error(`${label} did not appear`)
  }



  private async ensureVisibleByScrollingIOS(target: WdioEl | WebdriverIO.Element, maxScrolls = 6) {
    for (let i = 0; i < maxScrolls; i += 1) {
      const el = (await target) as WebdriverIO.Element
      const shown = await el.isDisplayed().catch(() => false)
      if (shown) {
        await el.waitForDisplayed({ timeout: 1500 }).catch(() => {})
        return
      }
      await this.scrollDownOnceIOS()
    }

    await this.debugSnapshot('cash-funds-ios-target-not-found')
    throw new Error('Target element not visible after scrolling (iOS)')
  }

  private async scrollDownOnceIOS() {
    const webView = this.iosClassChain('**/XCUIElementTypeWebView')
    const resolvedWebView = (await webView) as unknown as WebdriverIO.Element
    const useWebView = await resolvedWebView.isDisplayed().catch(() => false)

    let startX: number
    let startY: number
    let endY: number

    if (useWebView) {
      const loc = await resolvedWebView.getLocation()
      const size = await resolvedWebView.getSize()
      startX = Math.round(loc.x + size.width * 0.5)
      startY = Math.round(loc.y + size.height * 0.72)
      endY = Math.round(loc.y + size.height * 0.28)
    } else {
      const { width, height } = await browser.getWindowRect()
      startX = Math.round(width * 0.5)
      startY = Math.round(height * 0.78)
      endY = Math.round(height * 0.34)
    }

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
    await browser.pause(700)
  }

  private get investTabIOS() {
    return this.iosA11y('Invest')
  }

  private get discoverTabIOS() {
    return this.iosClassChain('**/XCUIElementTypeOther[`name == "основний"`]/XCUIElementTypeOther[7]')
  }

  private get discoverTabIOSXpath() {
    return $('//XCUIElementTypeOther[@name="основний"]/XCUIElementTypeOther[7]')
  }

  private get discoverTabIOSFallback() {
    return this.iosA11y('Discover')
  }

  private get discoverBottomTabIOS() {
    // Prefer tapping the bottom navigation item when we actually need to navigate.
    // This avoids accidentally matching the top header "Discover" static text.
    return $('//XCUIElementTypeOther[@name="навігація"]//XCUIElementTypeStaticText[@name="Discover"]')
  }

  private get discoverBottomTabIOSByY() {
    // Fallback if the nav container name differs; match the bottom area.
    return $('//XCUIElementTypeStaticText[@name="Discover" and @y > 650]')
  }

  private get cashFundsCardIOS() {
    // In this app the tappable card can expose its text as an accessible StaticText,
    // while the container Link itself may be accessible=false.
    return this.iosPredicate('type == "XCUIElementTypeStaticText" AND name == "Cash Funds"')
  }

  private get cashFundsCardIOSLongA11y() {
    // Best-effort: often won't match because the Link is accessible=false.
    // Also the APY value can change, so treat this as optional.
    return this.iosA11y('Cash Funds Earn up to 4.87% APY, no fees')
  }

  private get cashFundsCardIOSLongExactPredicate() {
    // Exact match can fail if APY changes or whitespace differs (e.g., NBSP).
    // Keep it first to satisfy runs where the full text is stable.
    return this.iosPredicate(
      'type == "XCUIElementTypeLink" AND (name == "Cash Funds Earn up to 4.87% APY, no fees" OR label == "Cash Funds Earn up to 4.87% APY, no fees")'
    )
  }

  private get cashFundsCardIOSLongExactClassChain() {
    // Note: class chain filters must be wrapped in backticks.
    return this.iosClassChain(
      '**/XCUIElementTypeLink[`name == "Cash Funds Earn up to 4.87% APY, no fees" OR label == "Cash Funds Earn up to 4.87% APY, no fees"`]'
    )
  }

  private get cashFundsCardIOSLongExactXpath() {
    return $('//XCUIElementTypeLink[@name="Cash Funds Earn up to 4.87% APY, no fees" or @label="Cash Funds Earn up to 4.87% APY, no fees"]')
  }

  private get cashFundsCardIOSLongLinkPredicate() {
    // More stable than exact text match (APY changes, whitespace can differ).
    return this.iosPredicate(
      'type == "XCUIElementTypeLink" AND name BEGINSWITH "Cash Funds" AND name CONTAINS[c] "Earn up to" AND name CONTAINS[c] "APY" AND name CONTAINS[c] "no fees"'
    )
  }

  private get cashFundsCardIOSContainerXpath() {
    // Tap the card container (bigger hit area) while still anchoring by the stable title text.
    return $('//XCUIElementTypeStaticText[@name="Cash Funds"]/ancestor::XCUIElementTypeLink[1]')
  }

  private get cashFundsCardIOSFallback() {
    return this.iosPredicate('type == "XCUIElementTypeLink" AND name CONTAINS[c] "Cash Funds"')
  }

  private get cashFundsTitleIOS() {
    return this.iosA11y('Cash Funds')
  }

  private get discoverHeaderIOS() {
    // Disambiguate from the bottom tab bar by pinning to the top header area.
    return $('//XCUIElementTypeStaticText[@name="Discover" and @y < 120]')
  }

  private get cashFundsHeaderIOS() {
    // Disambiguate from the Discover card title (which is far below the header).
    return $('//XCUIElementTypeStaticText[@name="Cash Funds" and @y < 120]')
  }

  private get searchInstrumentIOS() {
    return this.iosA11y('Search Instrument')
  }

  private get usdMoneyMarketFundIOS() {
    return this.iosA11y('USD - UBS Money Market Fund')
  }

  private get investTabAndroidA11y() {
    return this.androidA11y('Invest')
  }

  private get investTabAndroidByText() {
    return this.androidUiSelector('new UiSelector().text("Invest")')
  }

  private get investTabAndroidByDesc() {
    return this.androidUiSelector('new UiSelector().description("Invest")')
  }

  private get discoverAndroidText() {
    // Docs: -android uiautomator
    return this.androidUiSelector('new UiSelector().className("android.view.View").instance(13)')
  }

  private get discoverAndroidA11y() {
    // Sometimes content-desc is set; this maps to accessibility id.
    return this.androidA11y('Discover')
  }

  private get cashFundsCardAndroidLongA11y() {
    return this.androidA11y('Cash Funds Earn up to 4.87% APY, no fees')
  }

  private get cashFundsCardAndroidLongUiAutomator() {
    // Provided: new UiSelector().description("Cash Funds Earn up to 4.87% APY, no fees")
    return this.androidUiSelector('new UiSelector().description("Cash Funds Earn up to 4.87% APY, no fees")')
  }

  private get investScrollContainerAndroid() {
    // In Invest webview, the main scroll container is exposed as an Android view.
    return this.androidUiSelector('new UiSelector().resourceId("cc-scroll-container")')
  }

  private get cashFundsCardAndroidDescContainsCashFunds() {
    return this.androidUiSelector('new UiSelector().descriptionContains("Cash Funds")')
  }

  private get cashFundsCardAndroidTextContainsCashFunds() {
    return this.androidUiSelector('new UiSelector().textContains("Cash Funds")')
  }

  private get cashFundsCardAndroidScrollIntoViewByDescContainsCashFunds() {
    return this.androidUiSelector(
      'new UiScrollable(new UiSelector().resourceId("cc-scroll-container")).scrollIntoView(new UiSelector().descriptionContains("Cash Funds"))'
    )
  }

  private get cashFundsCardAndroidScrollIntoViewByTextContainsCashFunds() {
    return this.androidUiSelector(
      'new UiScrollable(new UiSelector().resourceId("cc-scroll-container")).scrollIntoView(new UiSelector().textContains("Cash Funds"))'
    )
  }

  private get cashFundsCardAndroidLongXpath() {
    // Minimal stable XPath using content-desc.
    return $('//*[@content-desc="Cash Funds Earn up to 4.87% APY, no fees"]')
  }

  private get cashFundsHeaderAndroid() {
    return this.androidUiSelector('new UiSelector().text("Cash Funds")')
  }

  private get usdMoneyMarketFundAndroidByText() {
    return this.androidUiSelector('new UiSelector().textContains("UBS Money Market Fund")')
  }

  private get usdMoneyMarketFundAndroidA11y() {
    return this.androidA11y('USD - UBS Money Market Fund')
  }

  async openCashFundsAndroid() {
    if (!browser.isAndroid) {
      throw new Error('Cash Funds Android flow can only run on Android')
    }

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const alreadyOnCashFunds = await this.cashFundsHeaderAndroid.isDisplayed().catch(() => false)
    if (alreadyOnCashFunds) {
      await this.verifyCashFundsScreenAndroid()
      return
    }

    // Strict path per docs:
    // Invest -> android=new UiSelector().className("android.view.View").instance(13) -> ~Cash Funds Earn up to ...
    await this.investTabAndroidA11y.waitForDisplayed({ timeout: 20000 })
    await this.investTabAndroidA11y.click()

    await this.discoverAndroidText.waitForDisplayed({ timeout: 20000 })
    await this.discoverAndroidText.click()

    await this.cashFundsCardAndroidLongA11y.waitForDisplayed({ timeout: 25000 })
    await this.cashFundsCardAndroidLongA11y.click()

    await browser.pause(900)
    await this.verifyCashFundsScreenAndroid()
  }

  async verifyCashFundsScreenAndroid() {
    if (!browser.isAndroid) return

    const anchors = [
      this.usdMoneyMarketFundAndroidA11y,
      this.usdMoneyMarketFundAndroidByText,
      this.cashFundsHeaderAndroid,
    ]

    await this.waitForAnyDisplayed(anchors, 30000, 'Cash Funds screen (Android)')
  }

  async openCashFunds() {
    if (browser.isIOS) {
      await this.openCashFundsIOS()
      return
    }
    if (browser.isAndroid) {
      await this.openCashFundsAndroid()
      return
    }
    throw new Error('Unsupported platform for Cash Funds flow')
  }

  async openCashFundsIOS() {
    if (!browser.isIOS) {
      throw new Error('Cash Funds iOS flow can only run on iOS')
    }

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const alreadyOnCashFunds = await this.cashFundsHeaderIOS.isDisplayed().catch(() => false)
    if (alreadyOnCashFunds) {
      await this.verifyCashFundsScreenIOS()
      return
    }

    await this.investTabIOS.waitForDisplayed({ timeout: 20000 })
    await this.tapFirstDisplayed([this.investTabIOS], 'Invest tab (iOS)')

    // Often after tapping Invest we are already on the Discover screen.
    // So: first wait for the Discover header, and only if it's missing,
    // tap Discover in the bottom navigation.
    const onDiscover = await this.discoverHeaderIOS.waitForDisplayed({ timeout: 20000 }).then(() => true).catch(() => false)
    if (!onDiscover) {
      // Bring back the old (index-based) selector that previously navigated correctly.
      // Keep header verification so a wrong tap doesn't silently proceed.
      const discoverTapCandidates = [
        this.discoverTabIOS,
        this.discoverTabIOSXpath,
        this.discoverBottomTabIOS,
        this.discoverBottomTabIOSByY,
        this.discoverTabIOSFallback,
      ]
      await this.waitForAnyDisplayed(discoverTapCandidates, 20000, 'Discover navigation (iOS)')
      await this.tapFirstDisplayedAndWaitFor(discoverTapCandidates, this.discoverHeaderIOS, 'Discover navigation (iOS)', 20000)
    }

    await browser.pause(600)

    // Tap ONLY the actual Discover card Link (long text) or its container.
    // Avoid ambiguous "Cash Funds" static text matches that can hit headers.
    const cardCandidates = [this.cashFundsCardIOSLongLinkPredicate, this.cashFundsCardIOSContainerXpath]

    // No scrolls. Tap the card and wait for a Cash Funds content anchor.
    await this.waitForAnyDisplayed(cardCandidates, 20000, 'Cash Funds card Link (iOS)')
    await this.tapFirstDisplayed(cardCandidates, 'Cash Funds card Link (iOS)')

    await browser.pause(700)
    await this.dismissIOSAlerts()

    const waitForCashFunds = async () => {
      return await browser
        .waitUntil(
          async () => {
            const byContent = await this.usdMoneyMarketFundIOS.isDisplayed().catch(() => false)
            if (byContent) return true

            // Fallback: sometimes the content loads later; header is a secondary signal.
            const byHeader = await this.cashFundsHeaderIOS.isDisplayed().catch(() => false)
            return byHeader
          },
          { timeout: 25000, interval: 500, timeoutMsg: 'Cash Funds screen did not open' }
        )
        .then(() => true)
        .catch(() => false)
    }

    let opened = await waitForCashFunds()
    if (!opened) {
      // If we are still on Discover, re-tap once (no scrolls).
      const stillOnDiscover = await this.discoverHeaderIOS.isDisplayed().catch(() => false)
      if (stillOnDiscover) {
        await browser.pause(700)
        await this.tapFirstDisplayed(cardCandidates, 'Cash Funds card Link (iOS) retry')
        await browser.pause(900)
        await this.dismissIOSAlerts()
        opened = await waitForCashFunds()
      }
    }

    if (!opened) {
      await this.debugSnapshot('cash-funds-ios-after-tap-not-opened')
      throw new Error('Cash Funds screen did not open after tapping the card Link (iOS)')
    }

    await this.verifyCashFundsScreenIOS()
  }

  async verifyCashFundsScreenIOS() {
    if (!browser.isIOS) return

    await browser.waitUntil(
      async () => {
        const byContent = await this.usdMoneyMarketFundIOS.isDisplayed().catch(() => false)
        if (byContent) return true
        const byHeader = await this.cashFundsHeaderIOS.isDisplayed().catch(() => false)
        return byHeader
      },
      { timeout: 25000, interval: 500, timeoutMsg: 'Cash Funds screen did not appear' }
    )

    await this.discoverHeaderIOS.waitForDisplayed({ reverse: true, timeout: 20000 }).catch(() => {})
  }
}
