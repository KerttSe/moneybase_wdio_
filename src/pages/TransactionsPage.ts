import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'

export default class TransactionsPage extends BasePage {

  /* ========================
   * HOME — RECENT ACTIVITY
   * ====================== */

  private get recentActivitySectionIOS() {
    return $('~Recent Activity')
  }

  private get recentActivitySectionAndroid() {
    return $('//*[contains(@text,"Recent Activity") or contains(@content-desc,"Recent Activity") or contains(@text,"Recent Transactions") or contains(@content-desc,"Recent Transactions") or contains(@text,"Pending") or contains(@content-desc,"Pending")]')
  }

  private get showAllBtnIOS() {
    return $('~Show All')
  }

  private get showAllBtnAndroid() {
    return $('//*[contains(@text,"Show All") or contains(@content-desc,"Show All") or contains(@text,"See All") or contains(@content-desc,"See All")]')
  }

  /* ========================
   * TRANSACTIONS SCREEN
   * NavBar name="Transactions", StaticText name="Transactions" accessible=true
   * Date group headers: "12 April", "9 January", "23 December 2025" — accessible StaticTexts
   * Filter button: name="filter" accessible=true
   * ====================== */

  private get transactionsHeaderIOS() {
    return $('~Transactions')
  }

  private get transactionsHeaderAndroid() {
    return $('//*[@text="Transactions" or @content-desc="Transactions"]')
  }

  private get filterBtnIOS() {
    return $('~filter')
  }

  private get transactionListAndroid() {
    return $('(//*[@content-desc="Filter"] | //*[@content-desc="filter"] | //*[@text="Filter"])[1]')
  }

  // Date group headers: "12 April" / "23 December 2025" / "Today" / "Yesterday"
  private get dateGroupHeaderIOS() {
    return $(
      '-ios predicate string:name == "Today" OR name == "Yesterday" OR name MATCHES "^[0-9]{1,2} (January|February|March|April|May|June|July|August|September|October|November|December).*"'
    )
  }

  /* ========================
   * PUBLIC FLOW
   * ====================== */

  async verifyRecentActivityVisible() {
    if (browser.isIOS) {
      await browser.waitUntil(
        async () => this.recentActivitySectionIOS.isExisting().catch(() => false),
        { timeout: 20000, interval: 800, timeoutMsg: 'Recent Activity section not found on iOS' }
      )
      return
    }
    await this.recentActivitySectionAndroid.waitForExist({ timeout: 20000 })
  }

  async tapShowAll() {
    if (browser.isIOS) {
      await browser.waitUntil(
        async () => {
          if (!(await this.showAllBtnIOS.isExisting().catch(() => false))) return false
          await this.tap(this.showAllBtnIOS).catch(() => {})
          return this.transactionsHeaderIOS.isExisting().catch(() => false)
        },
        { timeout: 25000, interval: 1500, timeoutMsg: 'Show All tap did not navigate to Transactions screen' }
      )
      return
    }
    await this.showAllBtnAndroid.waitForExist({ timeout: 20000 })
    await this.tap(this.showAllBtnAndroid)
  }

  async verifyTransactionsScreen() {
    if (browser.isIOS) {
      await this.transactionsHeaderIOS.waitForExist({ timeout: 15000 })
      return
    }
    await this.transactionsHeaderAndroid.waitForExist({ timeout: 15000 })
  }

  async verifyTransactionListDisplayed() {
    if (browser.isIOS) {
      // filter button appears once the list has loaded
      await this.filterBtnIOS.waitForExist({ timeout: 15000 })
      return
    }
    await this.transactionListAndroid.waitForExist({ timeout: 15000 })
  }

  async verifyTransactionsGroupedByDate() {
    if (browser.isIOS) {
      await browser.waitUntil(
        async () => this.dateGroupHeaderIOS.isExisting().catch(() => false),
        { timeout: 15000, interval: 500, timeoutMsg: 'No date group headers found on Transactions screen (iOS)' }
      )
      return
    }
    const source = await browser.getPageSource().catch(() => '')
    const hasDateGroup = /January|February|March|April|May|June|July|August|September|October|November|December/.test(source)
    if (!hasDateGroup) throw new Error('verifyTransactionsGroupedByDate: no date group headers found on Android')

  }

  async verifyNoErrors() {
    const source = await browser.getPageSource().catch(() => '')
    if (/error|Something went wrong|failed to load/i.test(source)) {
      throw new Error('verifyNoErrors: error message detected on Transactions screen')
    }
  }
}
