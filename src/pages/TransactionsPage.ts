import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'
import HomeScreenPage from './HomeScreenPage'

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
    // 2.27.0 labels the Recent Activity link "View All".
    return $('//*[contains(@text,"Show All") or contains(@content-desc,"Show All") or contains(@text,"See All") or contains(@content-desc,"See All") or @text="View All" or @content-desc="View All"]')
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
    await HomeScreenPage.ensureHomeBeforeSectionLookup()

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
    await HomeScreenPage.ensureHomeBeforeSectionLookup()

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
    // The list screen title changed across builds; accept it once Home has gone and the list chrome shows.
    await browser.waitUntil(async () => {
      if (await this.transactionsHeaderAndroid.isExisting().catch(() => false)) return true
      const homeShown = await $('//*[contains(@resource-id,"home_screen")]').isDisplayed().catch(() => false)
      if (homeShown) return false
      return await $('(//*[@text="Activity" or @text="Recent Activity" or @text="All Transactions" or @content-desc="Filter" or @content-desc="filter" or @text="Filter"])[1]').isExisting().catch(() => false)
    }, { timeout: 15000, interval: 500, timeoutMsg: 'View All did not open the transactions list (Android)' })
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

  /**
   * TC3334: the personal note on a transaction takes a 1000+ character text without a limit.
   * The note is never saved: the edit is left with Back.
   */
  async verifyPersonalNoteHasNoLimitAndroid() {
    await HomeScreenPage.ensureHomeBeforeSectionLookup()
    const row = $('(//*[starts-with(@text,"Deposit by Card") or starts-with(@text,"To ") or starts-with(@text,"From ")]/ancestor-or-self::*[@clickable="true"][1])[1]')
    await row.waitForDisplayed({ timeout: 20000, timeoutMsg: 'No transaction on Home Recent Activity' })
    await this.tap(row)
    const details = $('//*[contains(@resource-id,"transactionDetails_input_personalNote") or contains(@resource-id,"transactionDetails_button_personalNoteEdit")]')
    await details.waitForDisplayed({ timeout: 15000, timeoutMsg: 'Transaction details did not open' })
    const edit = $('//*[contains(@resource-id,"transactionDetails_button_personalNoteEdit")]')
    if (await edit.isDisplayed().catch(() => false)) await this.tap(edit)
    const input = $('(//*[contains(@resource-id,"transactionDetails_input_personalNote")]//android.widget.EditText | //*[contains(@resource-id,"transactionDetails_input_personalNote")])[1]')
    await input.waitForDisplayed({ timeout: 10000 })
    const block = 'Long note text for limit check. '
    const text = block.repeat(Math.ceil(1100 / block.length)).slice(0, 1100).trim()
    await this.tap(input)
    await input.setValue(text)
    await browser.pause(800)
    const typed = await input.getText()
    console.log(`[Transactions] personal note accepted ${typed.length} of ${text.length} characters`)
    if (typed.length < 1000) throw new Error(`TC3334: the personal note stopped at ${typed.length} characters; it should accept 1000+`)
    await browser.hideKeyboard().catch(() => {})
    for (let i = 0; i < 3 && !(await $('//*[contains(@resource-id,"home_screen")]').isDisplayed().catch(() => false)); i += 1) {
      await browser.back()
      await browser.pause(1200)
      const discard = $('//*[@resource-id="android:id/button2" or @text="Discard" or @text="DISCARD" or @text="Cancel" or @text="CANCEL"]')
      if (await discard.isDisplayed().catch(() => false)) await this.tap(discard)
    }
  }
}
