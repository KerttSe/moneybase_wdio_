import BasePage from './BasePage'
import { $, $$, browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'

type WdioEl = ChainablePromiseElement

/**
 * Covers the "My Price Plan" screen, reached via Home > More > My Price Plan.
 * Confirmed via real device page source:
 * - iOS More tab: accessibility id "More".
 * - More tab: content-desc "More" (resource-id has changed between app builds —
 *   "navigation_button_more" vs "nav_graph_more" — so this matches on content-desc
 *   instead, which has stayed stable).
 * - Android More menu row: a clickable View whose child TextView text is "My Price Plan"
 *   (the row also shows the current plan name inline, e.g. "My Price Plan • Starter").
 * - iOS exposes the same entry as the visible "Moneybase Club" row with the
 *   current plan beside it (e.g. "Standard"); "My Price Plan" can remain in
 *   SwiftUI XML as a hidden height=1 duplicate.
 * - Price Plan screen title: Android shows "My Current Plan"; older iOS builds
 *   used "Price Plan", while the current SwiftUI screen shows the plan header
 *   (e.g. "STANDARD") and the benefits section instead of a navigation title.
 * - Fee + billing frequency are two adjacent TextViews with no resource-id (e.g.
 *   "€0.00" followed immediately by "monthly"/"yearly") — matched structurally
 *   rather than by hardcoded amount, since the fee differs per plan.
 * - Included benefits are clickable rows containing two TextViews (title + description),
 *   e.g. "Free IBAN & Bank Transfers" / "Send and receive money easily".
 *
 * Note: the plan name (e.g. "Starter") and a renewal date are NOT shown on this
 * screen — plan name only appears on the More menu row, and no renewal date is
 * present anywhere in the real page source, so neither is verified here.
 */
class PricePlanPage extends BasePage {
  private iosA11y(id: string) {
    return $(`~${id}`)
  }

  private iosPredicate(predicate: string) {
    return $(`-ios predicate string:${predicate}`)
  }

  private iosText(text: string) {
    return this.iosPredicate(
      `type == "XCUIElementTypeStaticText" AND (name == "${text}" OR label == "${text}" OR value == "${text}")`
    )
  }

  private get moreTabAndroid() {
    return $('android=new UiSelector().description("More")')
  }

  private get moreTabIOS() {
    return this.iosA11y('More')
  }

  private get moreTitleIOS() {
    return this.iosText('More')
  }

  private get pricePlanMenuItemAndroid() {
    return $(
      '//android.view.View[@clickable="true"][.//android.widget.TextView[@text="My Price Plan"]]'
    )
  }

  private get pricePlanMenuItemIOS() {
    return $('//XCUIElementTypeCell[@height > 10][.//XCUIElementTypeStaticText[@name="My Price Plan" or @label="My Price Plan" or @value="My Price Plan"]]')
  }

  private get pricePlanMenuTextIOS() {
    return $('//XCUIElementTypeStaticText[@height > 10 and (@name="My Price Plan" or @label="My Price Plan" or @value="My Price Plan")]')
  }

  private get moneybaseClubMenuItemIOS() {
    return $('//XCUIElementTypeCell[@height > 10][.//XCUIElementTypeStaticText[@name="Moneybase Club" or @label="Moneybase Club" or @value="Moneybase Club"]]')
  }

  private get moneybaseClubMenuTextIOS() {
    return $('//XCUIElementTypeStaticText[@height > 10 and (@name="Moneybase Club" or @label="Moneybase Club" or @value="Moneybase Club")]')
  }

  private get screenTitleAndroid() {
    return $('android=new UiSelector().text("My Current Plan")')
  }

  private get screenTitleIOS() {
    return this.iosText('Price Plan')
  }

  private get planHeaderIOS() {
    return this.iosPredicate(
      'type == "XCUIElementTypeStaticText" AND ' +
      '(name IN {"STANDARD","STARTER","PLUS","PREMIUM"} OR ' +
      'label IN {"STANDARD","STARTER","PLUS","PREMIUM"} OR ' +
      'value IN {"STANDARD","STARTER","PLUS","PREMIUM"})'
    )
  }

  private get benefitsHeaderIOS() {
    return this.iosText('BENEFITS')
  }

  private get noMinimumBalanceIOS() {
    return this.iosText('NO MINIMUM BALANCE REQUIRED')
  }

  private get billingFrequencyAndroid() {
    return $('//android.widget.TextView[@text="monthly" or @text="yearly"]')
  }

  private get billingFrequencyIOS() {
    return this.iosPredicate(
      'type == "XCUIElementTypeStaticText" AND ' +
      '(name IN {"monthly","yearly"} OR label IN {"monthly","yearly"} OR value IN {"monthly","yearly"})'
    )
  }

  private get planFeeAndroid() {
    return $(
      '//android.widget.TextView[following-sibling::android.widget.TextView[1][@text="monthly" or @text="yearly"]]'
    )
  }

  private get planFeeIOS() {
    return this.iosPredicate(
      'type == "XCUIElementTypeStaticText" AND ' +
      '(name MATCHES ".*[€$£].*[0-9].*" OR label MATCHES ".*[€$£].*[0-9].*" OR value MATCHES ".*[€$£].*[0-9].*")'
    )
  }

  private get benefitRowsAndroid() {
    return $$('//android.view.View[@clickable="true"][count(.//android.widget.TextView) >= 2]')
  }

  private get benefitTextsIOS() {
    return $$(
      '-ios predicate string:type == "XCUIElementTypeStaticText" AND ' +
      '(name CONTAINS[c] "IBAN" OR label CONTAINS[c] "IBAN" OR value CONTAINS[c] "IBAN" OR ' +
      'name CONTAINS[c] "Transfer" OR label CONTAINS[c] "Transfer" OR value CONTAINS[c] "Transfer" OR ' +
      'name CONTAINS[c] "benefit" OR label CONTAINS[c] "benefit" OR value CONTAINS[c] "benefit" OR ' +
      'name CONTAINS[c] "free" OR label CONTAINS[c] "free" OR value CONTAINS[c] "free")'
    )
  }

  private async waitForAnyExisting(candidates: WdioEl[], timeout = 10000, label = 'element') {
    await browser.waitUntil(
      async () => {
        for (const candidate of candidates) {
          if (await candidate.isExisting().catch(() => false)) return true
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

  private async tapFirstExisting(candidates: WdioEl[], label = 'element') {
    for (const candidate of candidates) {
      const exists = await candidate.isExisting().catch(() => false)
      if (!exists) continue

      await candidate.click()
      return
    }

    throw new Error(`${label} did not appear`)
  }

  private async tapIOSCenter(el: WdioEl, label: string) {
    await el.waitForExist({ timeout: 10000 })
    const location = await el.getLocation()
    const size = await el.getSize()
    const x = Math.round(location.x + size.width / 2)
    const y = Math.round(location.y + size.height / 2)

    await browser.execute('mobile: tap', { x, y }).catch(async () => {
      await browser.performActions([
        {
          type: 'pointer',
          id: `finger-ios-${label.replace(/\W+/g, '-').toLowerCase()}`,
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
    })
  }

  private async tapFirstExistingIOS(candidates: WdioEl[], label = 'element') {
    for (const candidate of candidates) {
      const exists = await candidate.isExisting().catch(() => false)
      if (!exists) continue

      await candidate.click().catch(async () => {
        await this.tapIOSCenter(candidate, label)
      })
      return
    }

    throw new Error(`${label} did not appear`)
  }

  private async isPricePlanScreenOpen() {
    if (browser.isIOS) {
      return this.anyExisting([
        this.screenTitleIOS,
        this.planHeaderIOS,
        this.benefitsHeaderIOS,
      ])
    }

    return this.screenTitleAndroid.isExisting().catch(() => false)
  }

  private async anyExisting(candidates: WdioEl[]) {
    for (const candidate of candidates) {
      if (await candidate.isExisting().catch(() => false)) return true
    }

    return false
  }

  private async waitForPricePlanScreenOpen(timeout = 10000) {
    await browser.waitUntil(
      () => this.isPricePlanScreenOpen(),
      {
        timeout,
        interval: 500,
        timeoutMsg: 'Price Plan screen did not appear',
      }
    )
  }

  private async ensurePricePlanScreenOpen() {
    if (await this.isPricePlanScreenOpen()) return

    await this.openMoreTab()
    await this.openPricePlanScreen()
  }

  /** MPP-1.2: open the More tab from the bottom navigation. */
  public async openMoreTab() {
    if (browser.isIOS) {
      await this.moreTabIOS.waitForExist({ timeout: 10000 })
      await this.moreTabIOS.click().catch(async () => {
        await this.tapIOSCenter(this.moreTabIOS, 'More tab')
      })
      await this.moreTitleIOS.waitForExist({ timeout: 10000 })
      return
    }

    if (!browser.isAndroid) throw new Error('openMoreTab: unsupported platform')
    await this.tap(this.moreTabAndroid)
    await this.pricePlanMenuItemAndroid.waitForExist({ timeout: 10000 })
  }

  /** MPP-1.3: tap "My Price Plan" from the More menu. */
  public async openPricePlanScreen() {
    if (browser.isIOS) {
      await this.tapFirstExistingIOS(
        [
          this.moneybaseClubMenuItemIOS,
          this.moneybaseClubMenuTextIOS,
          this.pricePlanMenuItemIOS,
          this.pricePlanMenuTextIOS,
        ],
        'Price Plan menu item'
      )
      await this.waitForPricePlanScreenOpen()
      return
    }

    if (!browser.isAndroid) throw new Error('openPricePlanScreen: unsupported platform')
    await this.tap(this.pricePlanMenuItemAndroid)
    await this.screenTitleAndroid.waitForExist({ timeout: 10000 })
  }

  /** MPP-1.4: confirm the Price Plan screen loaded. */
  public async verifyScreenLoaded() {
    if (browser.isIOS) {
      const shown = await this.isPricePlanScreenOpen()
      if (!shown) throw new Error('verifyScreenLoaded: Price Plan screen content not visible')
      return
    }

    if (!browser.isAndroid) throw new Error('verifyScreenLoaded: unsupported platform')
    const shown = await this.screenTitleAndroid.isExisting().catch(() => false)
    if (!shown) throw new Error('verifyScreenLoaded: "My Current Plan" title not visible')
  }

  /** MPP-1.6: plan fee is displayed (e.g. "€0.00"). */
  public async getPlanFee(): Promise<string> {
    await this.ensurePricePlanScreenOpen()

    if (browser.isIOS) {
      if (await this.noMinimumBalanceIOS.isExisting().catch(() => false)) {
        return (await this.noMinimumBalanceIOS.getText()).trim()
      }

      await this.planFeeIOS.waitForExist({ timeout: 10000 })
      return (await this.planFeeIOS.getText()).trim()
    }

    if (!browser.isAndroid) throw new Error('getPlanFee: unsupported platform')
    await this.planFeeAndroid.waitForExist({ timeout: 10000 })
    return (await this.planFeeAndroid.getText()).trim()
  }

  public async getBillingFrequency(): Promise<string> {
    await this.ensurePricePlanScreenOpen()

    if (browser.isIOS) {
      await this.billingFrequencyIOS.waitForExist({ timeout: 10000 })
      return (await this.billingFrequencyIOS.getText()).trim()
    }

    if (!browser.isAndroid) throw new Error('getBillingFrequency: unsupported platform')
    await this.billingFrequencyAndroid.waitForExist({ timeout: 10000 })
    return (await this.billingFrequencyAndroid.getText()).trim()
  }

  /** MPP-1.9: at least one included-benefit row is displayed. */
  public async verifyBenefitsDisplayed(): Promise<number> {
    await this.ensurePricePlanScreenOpen()

    if (browser.isIOS) {
      const rows = await this.benefitTextsIOS
      const count = await rows.length
      if (count === 0) throw new Error('verifyBenefitsDisplayed: no benefit rows found')
      return count
    }

    if (!browser.isAndroid) throw new Error('verifyBenefitsDisplayed: unsupported platform')
    const rows = await this.benefitRowsAndroid
    const count = await rows.length
    if (count === 0) throw new Error('verifyBenefitsDisplayed: no benefit rows found')
    return count
  }
}

export default new PricePlanPage()
