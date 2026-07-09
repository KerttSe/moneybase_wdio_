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

  /** HS-SA-1.3: current period spend amount shown on the Home Spend Analytics card. */
  public async getCurrentAmount(): Promise<string> {
    if (!browser.isAndroid) throw new Error('getCurrentAmount: Android only')
    await HomeScreenPage.verifySpendAnalytics()
    await this.currentAmountAndroid.waitForDisplayed({ timeout: 10000 })
    return (await this.currentAmountAndroid.getText()).trim()
  }

  /** HS-SA-1.4: previous month spend on the Home card (e.g. "Last Month: €132.00"). */
  public async getLastMonthAmount(): Promise<string> {
    if (!browser.isAndroid) throw new Error('getLastMonthAmount: Android only')
    await HomeScreenPage.verifySpendAnalytics()
    await this.lastMonthAndroid.waitForDisplayed({ timeout: 10000 })
    return (await this.lastMonthAndroid.getText()).trim()
  }

  /** HS-SA-1.5: open Spend Analytics details from the Home card and confirm the Analytics screen loaded. */
  public async openDetails() {
    if (!browser.isAndroid) throw new Error('openDetails: Android only')
    await HomeScreenPage.verifySpendAnalytics()
    await this.cardAndroid.waitForDisplayed({ timeout: 10000 })
    await this.tap(this.cardAndroid)
    await this.screenTitleAndroid.waitForDisplayed({ timeout: 15000 })
  }

  /** Test isolation helper: if the Analytics details screen is still open, back out of it. */
  public async closeDetailsIfOpen() {
    if (!browser.isAndroid) return
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
    if (!browser.isAndroid) throw new Error('verifyCategoryBreakdown: Android only')
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
    if (!browser.isAndroid) throw new Error('changePeriod: Android only')

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
