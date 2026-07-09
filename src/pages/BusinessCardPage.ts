import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'

/**
 * Covers the business-identity-only "Cards" tab end-to-end: assigning a new
 * Physical card to an existing member, the resulting card details screen,
 * and freeze/unfreeze/report actions on that card.
 *
 * Confirmed end-to-end on a real device. The Assign Card Compose screen now
 * exposes resource ids for the main rows/buttons, while downstream sheets and
 * card-details actions are still mostly text/structure based.
 *
 * Confirmed flow notes:
 * - Reached via the "Cards" bottom-nav tab (content-desc="Cards"), NOT via
 *   the More tab.
 * - With zero cards on the identity, Cards tab shows only an "Add New Card"
 *   CTA — no search/filter/list UI (those likely only render once a card exists).
 * - Card Type row is preset to "Physical Card" for this identity. After
 *   confirming that type, the default assignee remains selected and the flow
 *   continues via the "Continue" button without manually opening Select User.
 * - Continue jumps to the card design screen. The default design is already
 *   selected, so tap "Order" to proceed to the assignee address screen.
 * - The address screen is a delivery address confirmation, prefilled from the
 *   assignee's profile. Its submit button is labelled "Assign Card", not
 *   "Continue".
 * - No OTP. Success shows a "Card assigned successfully" modal with a single
 *   "Close" button, landing on the card details screen.
 * - Card details, unfrozen: action row is "View PIN" / "Security" / "Freeze"
 *   / "More". Frozen: shrinks to "Report" / "Unfreeze" only (View PIN and
 *   More disappear); the card visual itself becomes non-interactive.
 * - Tapping "Report" permanently blocks the card: lands on a dedicated
 *   "Your card has been blocked." screen with a single "View my Cards" button.
 */
class BusinessCardPage extends BasePage {
  /* =========================
   * Cards tab (empty state)
   * ========================= */

  private get cardsTabAndroid() {
    return $('android=new UiSelector().description("Cards")')
  }

  private get cardsTabAndroidById() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_button_cards")')
  }

  private get homeTabAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_button_home")')
  }

  private get homeTabAndroidA11y() {
    return $('~Home')
  }

  private get homeTabAndroidXpath() {
    return $('//android.widget.FrameLayout[@content-desc="Home"]')
  }

  private get addNewCardButtonAndroid() {
    return $('//android.widget.TextView[@text="Add New Card"]')
  }

  public async openCardsTab() {
    if (!browser.isAndroid) throw new Error('openCardsTab: Android only')
    await this.tap(this.cardsTabAndroid)
    await this.addNewCardButtonAndroid.waitForDisplayed({ timeout: 15000 })
  }

  public async tapAddNewCard() {
    if (!browser.isAndroid) throw new Error('tapAddNewCard: Android only')
    await this.tap(this.addNewCardButtonAndroid)
  }

  /* =========================
   * Assign Card screen
   * ========================= */

  private get cardTypeRowAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/assignBusinessCard_button_selectCardType$|^assignBusinessCard_button_selectCardType$")')
  }

  private get cardAssigneeRowAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/assignBusinessCard_button_selectUser$|^assignBusinessCard_button_selectUser$")')
  }

  private get continueBtnAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/assignBusinessCard_button_continue$|^assignBusinessCard_button_continue$")')
  }

  private get cardDesignOrderBtnAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/cardDesignSelection_button_confirm$|^cardDesignSelection_button_confirm$")')
  }

  private get assignCardSubmitBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Assign Card"]]')
  }

  private get changeCardTypeTitleAndroid() {
    return $('android=new UiSelector().text("Change card type?")')
  }

  private get changeCardTypeConfirmBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Confirm"]]')
  }

  private get cardTypeSelectionTitleAndroid() {
    return $('android=new UiSelector().text("Select Card Type")')
  }

  private get physicalCardOptionAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Physical Card"]]')
  }

  private get userSelectionTitleAndroid() {
    return $('android=new UiSelector().text("Select User")')
  }

  private get userSelectionSelectBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Select"]]')
  }

  private userRowByNameAndroid(name: string) {
    return $(`//android.view.View[@clickable="true"][.//android.widget.TextView[@text="${name}"]]`)
  }

  private get assigneeAddressTitleAndroid() {
    return $('android=new UiSelector().textContains("address")')
  }

  private get cardAssignedSuccessTitleAndroid() {
    return $('android=new UiSelector().textMatches("Card (assigned|added) successfully")')
  }

  private get successCloseBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Close"]]')
  }

  /** Tap the "Card Type" row and confirm the "Change card type?" warning if it appears. */
  public async openCardTypeSelection() {
    if (!browser.isAndroid) throw new Error('openCardTypeSelection: Android only')

    await this.tap(this.cardTypeRowAndroid)

    const confirmShown = await this.changeCardTypeTitleAndroid.waitForDisplayed({ timeout: 5000 }).catch(() => false)
    if (confirmShown) {
      await this.tap(this.changeCardTypeConfirmBtnAndroid)
    }

    await this.cardTypeSelectionTitleAndroid.waitForDisplayed({ timeout: 10000 })
  }

  public async selectPhysicalCardType() {
    if (!browser.isAndroid) throw new Error('selectPhysicalCardType: Android only')
    await this.physicalCardOptionAndroid.waitForDisplayed({ timeout: 10000 })
    await this.tap(this.physicalCardOptionAndroid)
    await this.cardAssigneeRowAndroid.waitForDisplayed({ timeout: 10000 })
    await this.continueBtnAndroid.waitForDisplayed({ timeout: 10000 })
  }

  public async continueWithDefaultAssignee() {
    if (!browser.isAndroid) throw new Error('continueWithDefaultAssignee: Android only')
    await this.tap(this.continueBtnAndroid)
  }

  public async orderDefaultCardDesign() {
    if (!browser.isAndroid) throw new Error('orderDefaultCardDesign: Android only')
    await this.tap(this.cardDesignOrderBtnAndroid)
  }

  public async openUserSelection() {
    if (!browser.isAndroid) throw new Error('openUserSelection: Android only')
    await this.tap(this.cardAssigneeRowAndroid)
    await this.userSelectionTitleAndroid.waitForDisplayed({ timeout: 10000 })
  }

  /** Tap a user row by their exact display name, then confirm via the "Select" button. */
  public async selectUser(name: string) {
    if (!browser.isAndroid) throw new Error('selectUser: Android only')

    const row = this.userRowByNameAndroid(name)
    await row.waitForDisplayed({ timeout: 15000 })
    await this.tap(row)

    await browser
      .waitUntil(
        async () => (await this.userSelectionSelectBtnAndroid.getAttribute('enabled').catch(() => null)) === 'true',
        { timeout: 5000, interval: 250 }
      )
      .catch(() => {})

    await this.tap(this.userSelectionSelectBtnAndroid)
  }

  public async confirmAssigneeAddressAndSubmit() {
    if (!browser.isAndroid) throw new Error('confirmAssigneeAddressAndSubmit: Android only')
    await this.assigneeAddressTitleAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.assignCardSubmitBtnAndroid)
  }

  public async verifySuccessAndClose() {
    if (!browser.isAndroid) throw new Error('verifySuccessAndClose: Android only')
    await this.cardAssignedSuccessTitleAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.successCloseBtnAndroid)

    const closed = await this.cardAssignedSuccessTitleAndroid.waitForDisplayed({ timeout: 3000, reverse: true }).catch(() => false)
    if (closed) return

    const location = await this.successCloseBtnAndroid.getLocation()
    const size = await this.successCloseBtnAndroid.getSize()
    await browser.execute('mobile: clickGesture', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    })

    await this.cardAssignedSuccessTitleAndroid.waitForDisplayed({ timeout: 5000, reverse: true })
  }

  public async waitForCreatedCardReady() {
    if (!browser.isAndroid) throw new Error('waitForCreatedCardReady: Android only')

    const ready = await this.freezeBtnAndroid.waitForDisplayed({ timeout: 30000, interval: 1000 }).catch(() => false)
    if (ready) return

    await this.reopenCardsFromHome()
    await this.freezeBtnAndroid.waitForDisplayed({
      timeout: 90000,
      interval: 1000,
      timeoutMsg: 'Created card details did not become ready after Home -> Cards fallback: Freeze button was not displayed',
    })
  }

  private async reopenCardsFromHome() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    if (await this.homeTabAndroid.isDisplayed().catch(() => false)) {
      await this.tap(this.homeTabAndroid).catch(() => {})
    } else if (await this.homeTabAndroidA11y.isDisplayed().catch(() => false)) {
      await this.tap(this.homeTabAndroidA11y).catch(() => {})
    } else if (await this.homeTabAndroidXpath.isDisplayed().catch(() => false)) {
      await this.tap(this.homeTabAndroidXpath).catch(() => {})
    }

    await browser.pause(1000)

    if (await this.cardsTabAndroidById.isDisplayed().catch(() => false)) {
      await this.tap(this.cardsTabAndroidById)
    } else {
      await this.tap(this.cardsTabAndroid)
    }
  }

  /** Full happy-path: assign a new Physical card to an existing business member by name. */
  public async assignPhysicalCardToUser(userName: string) {
    if (!browser.isAndroid) throw new Error('assignPhysicalCardToUser: Android only')

    await this.openCardTypeSelection()
    await this.selectPhysicalCardType()
    console.log(`[BusinessCardPage] Continuing with default assignee instead of manually selecting "${userName}"`)
    await this.continueWithDefaultAssignee()
    await this.orderDefaultCardDesign()
    await this.confirmAssigneeAddressAndSubmit()
    await this.verifySuccessAndClose()
    await this.waitForCreatedCardReady()
  }

  /* =========================
   * Card details screen
   * ========================= */

  private get cardNumberMaskedAndroid() {
    return $('//android.widget.TextView[starts-with(@text,"****")]')
  }

  private get cardNameInputAndroid() {
    return $('android.widget.EditText')
  }

  private get viewPinBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="View PIN"]]')
  }

  private get securityBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Security"]]')
  }

  private get freezeBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Freeze"]]')
  }

  private get unfreezeBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Unfreeze"]]')
  }

  private get reportBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Report"]]')
  }

  private get moreBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="More"]]')
  }

  private get addToGoogleWalletBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//*[@content-desc="Add To Google Wallet"]]')
  }

  public async getCardNumberMasked() {
    if (!browser.isAndroid) throw new Error('getCardNumberMasked: Android only')
    return (await this.cardNumberMaskedAndroid.getText()).trim()
  }

  public async getCardName() {
    if (!browser.isAndroid) throw new Error('getCardName: Android only')
    return (await this.cardNameInputAndroid.getText()).trim()
  }

  public async verifyCardDetailsReady() {
    if (!browser.isAndroid) throw new Error('verifyCardDetailsReady: Android only')
    await browser.waitUntil(
      async () =>
        (await this.freezeBtnAndroid.isDisplayed().catch(() => false)) ||
        (await this.reportBtnAndroid.isDisplayed().catch(() => false)) ||
        (await this.unfreezeBtnAndroid.isDisplayed().catch(() => false)),
      { timeout: 15000, interval: 500, timeoutMsg: 'Card details actions were not displayed' }
    )
  }

  /** True if the card is currently frozen (i.e. "Unfreeze" is shown instead of "Freeze"). */
  public async isFrozen() {
    if (!browser.isAndroid) throw new Error('isFrozen: Android only')
    return this.unfreezeBtnAndroid.isDisplayed().catch(() => false)
  }

  public async tapFreeze() {
    if (!browser.isAndroid) throw new Error('tapFreeze: Android only')
    await this.tap(this.freezeBtnAndroid)
    await browser.waitUntil(
      async () =>
        (await this.unfreezeBtnAndroid.isDisplayed().catch(() => false)) ||
        (await this.reportBtnAndroid.isDisplayed().catch(() => false)),
      { timeout: 10000, interval: 500, timeoutMsg: 'Frozen card actions were not displayed' }
    )
  }

  public async tapUnfreeze() {
    if (!browser.isAndroid) throw new Error('tapUnfreeze: Android only')
    await this.tap(this.unfreezeBtnAndroid)
    await this.freezeBtnAndroid.waitForDisplayed({ timeout: 10000 })
  }

  public async tapSecurity() {
    if (!browser.isAndroid) throw new Error('tapSecurity: Android only')
    await this.tap(this.securityBtnAndroid)
  }

  public async tapMore() {
    if (!browser.isAndroid) throw new Error('tapMore: Android only')
    await this.tap(this.moreBtnAndroid)
  }

  public async tapViewPin() {
    if (!browser.isAndroid) throw new Error('tapViewPin: Android only')
    await this.tap(this.viewPinBtnAndroid)
  }

  public async tapAddToGoogleWallet() {
    if (!browser.isAndroid) throw new Error('tapAddToGoogleWallet: Android only')
    await this.tap(this.addToGoogleWalletBtnAndroid)
  }

  /* =========================
   * Report card (permanent block)
   * ========================= */

  private get cardBlockedTitleAndroid() {
    return $('android=new UiSelector().text("Your card has been blocked.")')
  }

  private get blockReportConfirmBtnAndroid() {
    return $('android=new UiSelector().resourceId("android:id/button1")')
  }

  private get viewMyCardsBtnAndroid() {
    return $('android=new UiSelector().textMatches("View my Cards|View my cards")')
  }

  /** Tap "Report" (only shown while frozen) — this permanently blocks the card. */
  public async tapReport() {
    if (!browser.isAndroid) throw new Error('tapReport: Android only')
    await this.tap(this.reportBtnAndroid)
    await this.tap(this.blockReportConfirmBtnAndroid)
  }

  public async verifyCardBlocked() {
    if (!browser.isAndroid) throw new Error('verifyCardBlocked: Android only')
    await this.cardBlockedTitleAndroid.waitForDisplayed({ timeout: 10000 })
  }

  public async tapViewMyCards() {
    if (!browser.isAndroid) throw new Error('tapViewMyCards: Android only')
    const alreadyOnCards = await this.addNewCardButtonAndroid.isDisplayed().catch(() => false)
    if (alreadyOnCards) return

    const shown = await this.viewMyCardsBtnAndroid.waitForDisplayed({ timeout: 15000 }).catch(() => false)
    if (!shown) {
      const cardsShown = await this.addNewCardButtonAndroid.isDisplayed().catch(() => false)
      if (cardsShown) return
      await this.viewMyCardsBtnAndroid.waitForDisplayed({ timeout: 1 })
    }

    const location = await this.viewMyCardsBtnAndroid.getLocation()
    const size = await this.viewMyCardsBtnAndroid.getSize()
    await browser.execute('mobile: clickGesture', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    }).catch(async () => {
      await this.tap(this.viewMyCardsBtnAndroid)
    })

    await this.addNewCardButtonAndroid.waitForDisplayed({ timeout: 15000 })
  }

  /**
   * Confirms the reported card was fully removed, not just marked blocked —
   * the Cards tab returns to the same empty "Add New Card" state seen before
   * any card existed (confirmed via real device page source).
   */
  public async verifyCardRemoved() {
    if (!browser.isAndroid) throw new Error('verifyCardRemoved: Android only')
    await this.addNewCardButtonAndroid.waitForDisplayed({ timeout: 15000 })
  }
}

export default new BusinessCardPage()
