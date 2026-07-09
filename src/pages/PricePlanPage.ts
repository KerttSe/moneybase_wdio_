import BasePage from './BasePage'
import { $, $$, browser } from '@wdio/globals'

/**
 * Covers the "My Price Plan" screen, reached via Home > More > My Price Plan.
 * Confirmed via real device page source:
 * - More tab: content-desc "More" (resource-id has changed between app builds —
 *   "navigation_button_more" vs "nav_graph_more" — so this matches on content-desc
 *   instead, which has stayed stable).
 * - More menu row: a clickable View whose child TextView text is "My Price Plan"
 *   (the row also shows the current plan name inline, e.g. "My Price Plan • Starter").
 * - Price Plan screen title: TextView text "My Current Plan" (not "My Price Plan").
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
  private get moreTabAndroid() {
    return $('android=new UiSelector().description("More")')
  }

  private get pricePlanMenuItemAndroid() {
    return $(
      '//android.view.View[@clickable="true"][.//android.widget.TextView[@text="My Price Plan"]]'
    )
  }

  private get screenTitleAndroid() {
    return $('android=new UiSelector().text("My Current Plan")')
  }

  private get billingFrequencyAndroid() {
    return $('//android.widget.TextView[@text="monthly" or @text="yearly"]')
  }

  private get planFeeAndroid() {
    return $(
      '//android.widget.TextView[following-sibling::android.widget.TextView[1][@text="monthly" or @text="yearly"]]'
    )
  }

  private get benefitRowsAndroid() {
    return $$('//android.view.View[@clickable="true"][count(.//android.widget.TextView) >= 2]')
  }

  /** MPP-1.2: open the More tab from the bottom navigation. */
  public async openMoreTab() {
    if (!browser.isAndroid) throw new Error('openMoreTab: Android only')
    await this.tap(this.moreTabAndroid)
    await this.pricePlanMenuItemAndroid.waitForDisplayed({ timeout: 10000 })
  }

  /** MPP-1.3: tap "My Price Plan" from the More menu. */
  public async openPricePlanScreen() {
    if (!browser.isAndroid) throw new Error('openPricePlanScreen: Android only')
    await this.tap(this.pricePlanMenuItemAndroid)
    await this.screenTitleAndroid.waitForDisplayed({ timeout: 10000 })
  }

  /** MPP-1.4: confirm the Price Plan screen loaded. */
  public async verifyScreenLoaded() {
    if (!browser.isAndroid) throw new Error('verifyScreenLoaded: Android only')
    const shown = await this.screenTitleAndroid.isDisplayed().catch(() => false)
    if (!shown) throw new Error('verifyScreenLoaded: "My Current Plan" title not visible')
  }

  /** MPP-1.6: plan fee is displayed (e.g. "€0.00"). */
  public async getPlanFee(): Promise<string> {
    if (!browser.isAndroid) throw new Error('getPlanFee: Android only')
    await this.planFeeAndroid.waitForDisplayed({ timeout: 10000 })
    return (await this.planFeeAndroid.getText()).trim()
  }

  /** MPP-1.7: billing frequency is displayed (e.g. "monthly"). */
  public async getBillingFrequency(): Promise<string> {
    if (!browser.isAndroid) throw new Error('getBillingFrequency: Android only')
    await this.billingFrequencyAndroid.waitForDisplayed({ timeout: 10000 })
    return (await this.billingFrequencyAndroid.getText()).trim()
  }

  /** MPP-1.9: at least one included-benefit row is displayed. */
  public async verifyBenefitsDisplayed(): Promise<number> {
    if (!browser.isAndroid) throw new Error('verifyBenefitsDisplayed: Android only')
    const rows = await this.benefitRowsAndroid
    const count = await rows.length
    if (count === 0) throw new Error('verifyBenefitsDisplayed: no benefit rows found')
    return count
  }
}

export default new PricePlanPage()
