import BasePage from './BasePage'
import { $, $$, browser } from '@wdio/globals'
import HomeScreenPage from './HomeScreenPage'

/**
 * Covers the Spend Analytics card on Home and its details screen
 * (HS-SA-1.3 through HS-SA-1.7). HS-SA-1.1 (Home loaded) and HS-SA-1.2
 * (Spend Analytics section visible) are covered by HomeScreenPage.
 *
 * None of the elements below have a resource-id — confirmed via real device
 * page source — so every locator is text/structure based.
 */
class SpendAnalyticsPage extends BasePage {
  /* =========================
   * iOS: Analytics screen
   * Entry: ~ic statistics NavBar button on Home (may be enabled=false at capture time — retry)
   * NavBar: name="Analytics" | BackButton: name="BackButton"
   * Spent amount: StaticText sibling of "Spent" inside the header cell
   * Period label: "This Month" / "This Week" / etc. + chevron.down image in the selector row
   * Spend Details header: name="Spend Details"
   * Empty state: name="No transactions in this period"
   * ========================= */

  private get statisticsBtnIOS() {
    return $('~ic statistics')
  }

  private get spendAnalyticsSectionIOS() {
    return $('~home_section_spendAnalytics')
  }

  private get spendAnalyticsTextIOS() {
    return $('-ios predicate string:label CONTAINS "Spend Analytics" OR name CONTAINS "Spend Analytics"')
  }

  private get spendAnalyticsCardIOS() {
    return $('//XCUIElementTypeStaticText[@name="Spend Analytics"]/ancestor::XCUIElementTypeCell/following-sibling::XCUIElementTypeCell[1]')
  }

  private get currentAmountHomeIOS() {
    return $('//XCUIElementTypeStaticText[@name="Spend Analytics"]/following::XCUIElementTypeStaticText[contains(@name,"€") or contains(@label,"€") or contains(@name,"$") or contains(@label,"$") or contains(@name,"£") or contains(@label,"£")][1]')
  }

  private get analyticsNavBarIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Analytics"]')
  }

  private get analyticsBackButtonIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Analytics"]//XCUIElementTypeButton[@name="Home" or @label="Home" or @name="BackButton" or @label="Back"]')
  }

  // The amount StaticText next to "Spent" in the header (e.g. "0,00 €" or "€684.91")
  private get spentAmountIOS() {
    return $(
      '//XCUIElementTypeOther[XCUIElementTypeStaticText[@name="Spent"]]//XCUIElementTypeStaticText[not(@name="Spent")]'
    )
  }

  // Period label StaticText inside the selector row ("This Month", "This Week", "Yearly" etc.)
  private get periodLabelIOS() {
    return $(
      '-ios predicate string:name == "This Month" OR name == "This Week" OR name == "This Year" OR name == "Last Month" OR name == "Monthly" OR name == "Weekly" OR name == "Yearly"'
    )
  }

  // The XCUIElementTypeOther that is the direct parent of both the period StaticText and chevron.down image
  private get periodSelectorRowIOS() {
    return $(
      '//XCUIElementTypeOther[XCUIElementTypeStaticText[contains(@name,"This ") or contains(@name,"Last ") or contains(@name,"Monthly") or contains(@name,"Weekly") or contains(@name,"Yearly")]][XCUIElementTypeImage[@name="chevron.down"]]'
    )
  }

  private get spendDetailsHeaderIOS() {
    return $('~Spend Details')
  }

  private get noTransactionsIOS() {
    return $('~No transactions in this period')
  }

  // Category cells below "Spend Details" (present when period has transactions)
  private get categoryBreakdownRowsIOS() {
    return $$(
      '//XCUIElementTypeStaticText[@name="Spend Details"]/following::XCUIElementTypeCell'
    )
  }

  private periodOptionIOS(period: 'Weekly' | 'Monthly' | 'Yearly') {
    return $(`~${period}`)
  }

  // "Set Period" confirm button (or equivalent) in the period picker bottom sheet
  private get setPeriodBtnIOS() {
    return $(
      '-ios predicate string:name == "Set Period" OR name == "Apply" OR name == "Confirm" OR name == "Done"'
    )
  }

  private async scrollDownIOS() {
    const { width, height } = await browser.getWindowRect()
    const x = Math.round(width * 0.5)

    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y: Math.round(height * 0.75) },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 150 },
          { type: 'pointerMove', duration: 450, x, y: Math.round(height * 0.32) },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
    await browser.pause(600)
  }

  private async findSpendAnalyticsEntryIOS() {
    const candidates = [this.spendAnalyticsCardIOS, this.spendAnalyticsSectionIOS, this.spendAnalyticsTextIOS, this.statisticsBtnIOS]

    for (let scroll = 0; scroll <= 5; scroll += 1) {
      for (const candidate of candidates) {
        const exists = await candidate.isExisting().catch(() => false)
        if (exists) return candidate
      }

      await this.scrollDownIOS()
    }

    throw new Error('Spend Analytics entry did not appear on Home screen (iOS)')
  }

  private async tapElementCenterIOS(el: WebdriverIO.Element) {
    const location = await el.getLocation()
    const size = await el.getSize()
    await browser.execute('mobile: tap', {
      x: location.x + Math.round(size.width / 2),
      y: location.y + Math.round(size.height / 2),
    })
  }

  private async openAnalyticsScreenIOS() {
    const alreadyOpen = await this.analyticsNavBarIOS.isExisting().catch(() => false)
    if (alreadyOpen) return

    await HomeScreenPage.waitForHomeLoaded()

    await browser.waitUntil(
      async () => {
        const entry = await this.findSpendAnalyticsEntryIOS().catch(() => null)
        if (entry) {
          await this.tapElementCenterIOS(entry as unknown as WebdriverIO.Element).catch(async () => {
            await entry.click().catch(() => {})
          })
        }

        return this.analyticsNavBarIOS.isExisting().catch(() => false)
      },
      { timeout: 30000, interval: 1500, timeoutMsg: 'Analytics screen did not open from Home Spend Analytics entry (iOS)' }
    )
  }

  private iosPeriodMatches(label: string, period: 'Weekly' | 'Monthly' | 'Yearly') {
    const normalized = label.toLowerCase()
    if (period === 'Weekly') return normalized.includes('week') || normalized.includes('weekly')
    if (period === 'Monthly') return normalized.includes('month') || normalized.includes('monthly')
    return normalized.includes('year') || normalized.includes('yearly')
  }

  /* =========================
   * ANDROID: Spend Analytics card (Home)
   * ========================= */

  // The tappable card on Home: a clickable View whose child TextView starts with "This " (e.g. "This Month").
  private get cardAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[starts-with(@text,"This ")]]')
  }

  // The big amount (e.g. "€684.91") and the period label ("This Month") are siblings
  // inside the same clickable card — the amount is the preceding sibling of the label.
  private get currentAmountAndroid() {
    return $('//android.widget.TextView[starts-with(@text,"This ")]/preceding-sibling::android.widget.TextView[1]')
  }

  private get lastMonthAndroid() {
    return $('android=new UiSelector().textStartsWith("Last Month:")')
  }

  /* =========================
   * ANDROID: Spend Analytics details screen (opened by tapping the Home card)
   * ========================= */

  private get screenTitleAndroid() {
    return $('android=new UiSelector().text("Analytics")')
  }

  // Period label (e.g. "This Week" / "This Month") — the TextView inside the
  // clickable row that immediately follows the "Spent" label on this screen.
  private get periodLabelAndroid() {
    return $(
      '//android.widget.TextView[@text="Spent"]/following-sibling::android.view.View[@clickable="true"][1]/android.widget.TextView'
    )
  }

  private get periodRowAndroid() {
    return $('//android.widget.TextView[@text="Spent"]/following-sibling::android.view.View[@clickable="true"][1]')
  }

  private get spendDetailsHeaderAndroid() {
    return $('android=new UiSelector().text("Spend Details")')
  }

  // Category breakdown rows: clickable Views containing a "<N> Transaction(s)" TextView.
  private get categoryBreakdownRowsAndroid() {
    return $$('//android.view.View[@clickable="true"][.//android.widget.TextView[contains(@text,"Transaction")]]')
  }

  // Empty state shown under "Spend Details" when the selected period has no transactions.
  private get noTransactionsEmptyStateAndroid() {
    return $('android=new UiSelector().textContains("No transactions")')
  }

  /* =========================
   * ANDROID: "Select Period" bottom sheet
   * ========================= */

  private get selectPeriodTitleAndroid() {
    return $('android=new UiSelector().text("Select Period")')
  }

  private get weeklyTabAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Weekly"]]')
  }

  private get monthlyTabAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Monthly"]]')
  }

  private get yearlyTabAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Yearly"]]')
  }

  private get setPeriodBtnAndroid() {
    return $('android=new UiSelector().text("Set Period")')
  }

  /* =========================
   * FLOW methods
   * ========================= */

  /** HS-SA-1.3: current period spend amount shown on the Spend Analytics card / details screen. */
  public async getCurrentAmount(): Promise<string> {
    if (browser.isIOS) {
      await HomeScreenPage.waitForHomeLoaded()
      await this.findSpendAnalyticsEntryIOS()
      await this.currentAmountHomeIOS.waitForExist({ timeout: 10000 })
      const label = await this.currentAmountHomeIOS.getAttribute('label').catch(() => '')
      return (label || (await this.currentAmountHomeIOS.getAttribute('name').catch(() => ''))).trim()
    }
    await HomeScreenPage.verifySpendAnalytics()
    await this.currentAmountAndroid.waitForDisplayed({ timeout: 10000 })
    return (await this.currentAmountAndroid.getText()).trim()
  }

  /**
   * HS-SA-1.4: previous month spend on the Home card (e.g. "Last Month: €132.00").
   * iOS does not expose a last-month comparison — the caller should skip this test on iOS.
   */
  public async getLastMonthAmount(): Promise<string | null> {
    if (browser.isIOS) throw new Error('getLastMonthAmount: not available on iOS — skip this test on iOS')
    await HomeScreenPage.verifySpendAnalytics()
    const shown = await this.lastMonthAndroid.waitForDisplayed({ timeout: 10000 }).then(() => true).catch(() => false)
    if (!shown) return null
    return (await this.lastMonthAndroid.getText()).trim()
  }

  /** HS-SA-1.5: open Spend Analytics details and confirm the Analytics screen loaded. */
  public async openDetails() {
    if (browser.isIOS) {
      await this.openAnalyticsScreenIOS()
      return
    }
    await HomeScreenPage.verifySpendAnalytics()
    await this.cardAndroid.waitForDisplayed({ timeout: 10000 })
    await this.tap(this.cardAndroid)
    await this.screenTitleAndroid.waitForDisplayed({ timeout: 15000 })
  }

  /** Test isolation helper: if the Analytics details screen is still open, back out of it. */
  public async closeDetailsIfOpen() {
    if (browser.isIOS) {
      const onAnalytics = await this.analyticsNavBarIOS.isExisting().catch(() => false)
      if (!onAnalytics) return

      const backShown = await this.analyticsBackButtonIOS.isExisting().catch(() => false)
      if (backShown) {
        await this.tapElementCenterIOS(this.analyticsBackButtonIOS as unknown as WebdriverIO.Element).catch(async () => {
          await this.tap(this.analyticsBackButtonIOS).catch(() => {})
        })
      }

      let closed = await this.analyticsNavBarIOS.waitForExist({ timeout: 5000, reverse: true }).then(() => true).catch(() => false)
      if (!closed) {
        await browser.execute('mobile: tap', { x: 38, y: 75 }).catch(() => {})
        closed = await this.analyticsNavBarIOS.waitForExist({ timeout: 5000, reverse: true }).then(() => true).catch(() => false)
      }

      if (!closed) {
        await browser.back().catch(() => {})
        await this.analyticsNavBarIOS.waitForExist({ timeout: 5000, reverse: true }).catch(() => {})
      }
      return
    }
    const onDetails = await this.screenTitleAndroid.isDisplayed().catch(() => false)
    if (!onDetails) return
    await browser.pressKeyCode(4).catch(() => {})
    await this.screenTitleAndroid.waitForDisplayed({ timeout: 5000, reverse: true }).catch(() => {})
  }

  /**
   * HS-SA-1.6: verify the category breakdown list is present with at least one valid row.
   * Returns 0 (without throwing) when the period legitimately has no transactions —
   * the app shows a "No transactions" empty state instead of category rows in that case,
   * and the caller is expected to skip the check rather than fail it.
   */
  public async verifyCategoryBreakdown(): Promise<number> {
    if (browser.isIOS) {
      await this.spendDetailsHeaderIOS.waitForExist({ timeout: 10000 })
      const hasEmptyState = await this.noTransactionsIOS.isExisting().catch(() => false)
      if (hasEmptyState) return 0

      const rows = await this.categoryBreakdownRowsIOS
      const rowCount = await rows.length
      if (rowCount === 0) {
        const emptyCheck = await this.noTransactionsIOS.isExisting().catch(() => false)
        if (emptyCheck) return 0
        throw new Error('verifyCategoryBreakdown: no category rows found under Spend Details (iOS)')
      }
      return rowCount
    }
    await this.spendDetailsHeaderAndroid.waitForDisplayed({ timeout: 10000 })

    const rows = await this.categoryBreakdownRowsAndroid
    const rowCount = await rows.length
    if (rowCount === 0) {
      const emptyState = await this.noTransactionsEmptyStateAndroid.isDisplayed().catch(() => false)
      if (emptyState) return 0

      throw new Error('verifyCategoryBreakdown: no category rows found under Spend Details')
    }

    // Note: getText() on the row's container View is unreliable here (same Compose
    // semantics quirk seen elsewhere in this app) — the locator's own "Transaction"
    // text predicate already proves the row has real, rendered content.
    return rowCount
  }

  /**
   * HS-SA-1.7: change the Spend Analytics period (Weekly/Monthly/Yearly) from the details
   * screen and verify the period label actually updated. Call this while already on the
   * Analytics details screen (see openDetails).
   */
  public async changePeriod(period: 'Weekly' | 'Monthly' | 'Yearly') {
    if (browser.isIOS) {
      await this.periodLabelIOS.waitForExist({ timeout: 10000 })
      const labelBefore = await this.periodLabelIOS.getAttribute('name').catch(() => '')

      if (this.iosPeriodMatches(labelBefore, period)) {
        return { before: labelBefore, after: labelBefore }
      }

      await this.tap(this.periodSelectorRowIOS)
      await browser.waitUntil(
        async () => this.periodOptionIOS(period).isExisting().catch(() => false),
        { timeout: 10000, interval: 500, timeoutMsg: `Period picker did not open on iOS` }
      )
      await this.tap(this.periodOptionIOS(period))

      const hasConfirm = await this.setPeriodBtnIOS.isExisting().catch(() => false)
      if (hasConfirm) await this.tap(this.setPeriodBtnIOS)

      await this.analyticsNavBarIOS.waitForExist({ timeout: 10000 })

      const labelAfter = await browser.waitUntil(
        async () => {
          const name = await this.periodLabelIOS.getAttribute('name').catch(() => '')
          return name && name !== labelBefore ? name : false
        },
        { timeout: 10000, interval: 500, timeoutMsg: `Period label did not update after selecting "${period}" (iOS)` }
      ) as string

      return { before: labelBefore, after: labelAfter }
    }

    const labelBefore = await this.periodLabelAndroid.getText().catch(() => '')

    await this.tap(this.periodRowAndroid)
    await this.selectPeriodTitleAndroid.waitForDisplayed({ timeout: 10000 })

    const tabLocator =
      period === 'Weekly' ? this.weeklyTabAndroid : period === 'Monthly' ? this.monthlyTabAndroid : this.yearlyTabAndroid
    await this.tap(tabLocator)

    await this.tap(this.setPeriodBtnAndroid)
    await this.selectPeriodTitleAndroid.waitForDisplayed({ timeout: 10000, reverse: true }).catch(() => {})

    await this.screenTitleAndroid.waitForDisplayed({ timeout: 10000 })
    const labelAfter = await this.periodLabelAndroid.getText().catch(() => '')

    if (!labelAfter || labelAfter === labelBefore) {
      throw new Error(
        `changePeriod: period label did not change after selecting "${period}" (before="${labelBefore}", after="${labelAfter}")`
      )
    }

    return { before: labelBefore, after: labelAfter }
  }
}

export default new SpendAnalyticsPage()
