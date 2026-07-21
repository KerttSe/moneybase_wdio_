import BasePage from './BasePage'
import { $, $$, browser } from '@wdio/globals'

class BusinessCardPage extends BasePage {
  /* =========================
   * Cards tab
   * ========================= */

  private get cardsTabAndroid() {
    return $('android=new UiSelector().description("Cards")')
  }

  private get cardsTabAndroidById() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_button_cards")')
  }

  private get cardsTabIOS() {
    return $('-ios predicate string:name == "Cards" OR label == "Cards"')
  }

  private get cardsTabIOSA11y() {
    return $('~Cards')
  }

  private get cardsRootIOS() {
    return $('-ios predicate string:name == "cards_screen" OR name BEGINSWITH "CARDS_" OR name == "card_item_addCard"')
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

  private get homeTabIOS() {
    return $('~Home')
  }

  private get addNewCardButtonAndroid() {
    return $('//android.widget.TextView[@text="Add New Card"]')
  }

  private get addNewCardButtonIOS() {
    return $('-ios predicate string:name == "Add New Card" OR label == "Add New Card" OR name == "Add new card" OR label == "Add new card" OR name == "card_item_addCard"')
  }

  private get physicalCardItemIOS() {
    return $('-ios predicate string:name CONTAINS "Physical" OR label CONTAINS "Physical"')
  }

  private get activeCardItemIOS() {
    return $('-ios predicate string:name CONTAINS "Active" OR label CONTAINS "Active"')
  }

  private get maskedCardItemIOS() {
    return $('-ios predicate string:name CONTAINS "****" OR label CONTAINS "****" OR name CONTAINS "••" OR label CONTAINS "••"')
  }

  private async isIOSCardsSurfaceVisible() {
    if (!browser.isIOS) return false

    const explicitShown =
      (await this.cardsRootIOS.isDisplayed().catch(() => false)) ||
      (await this.addNewCardButtonIOS.isDisplayed().catch(() => false)) ||
      (await this.freezeBtnIOS.isDisplayed().catch(() => false)) ||
      (await this.unfreezeBtnIOS.isDisplayed().catch(() => false)) ||
      (await this.physicalCardItemIOS.isDisplayed().catch(() => false)) ||
      (await this.activeCardItemIOS.isDisplayed().catch(() => false)) ||
      (await this.maskedCardItemIOS.isDisplayed().catch(() => false))

    if (explicitShown) return true

    let cells: WebdriverIO.Element[] = []
    try {
      cells = (await $$('-ios class chain:**/XCUIElementTypeCell')) as unknown as WebdriverIO.Element[]
    } catch {}
    for (const cell of cells) {
      const shown = await cell.isDisplayed().catch(() => false)
      if (!shown) continue

      const label = await cell.getAttribute('label').catch(async () => await cell.getText().catch(() => ''))
      const name = await cell.getAttribute('name').catch(() => '')
      const descriptor = `${label} ${name}`.toLowerCase()
      if (!descriptor.trim()) continue
      if (descriptor.includes('search')) continue
      if (descriptor === 'cards') continue
      if (descriptor.includes('story position')) continue

      const looksLikeCardsSurface =
        descriptor.includes('add new card') ||
        descriptor.includes('physical') ||
        descriptor.includes('active') ||
        descriptor.includes('freeze') ||
        descriptor.includes('unfreeze') ||
        descriptor.includes('****') ||
        descriptor.includes('••')

      if (looksLikeCardsSurface) return true
    }

    return false
  }

  public async openCardsTab() {
    if (browser.isIOS) {
      await browser.switchContext('NATIVE_APP').catch(() => {})
      if (await this.isIOSCardsSurfaceVisible()) return

      await browser.waitUntil(
        async () => {
          if (await this.cardsTabIOSA11y.isExisting().catch(() => false)) {
            await this.tap(this.cardsTabIOSA11y).catch(() => {})
          } else {
            await this.tap(this.cardsTabIOS).catch(() => {})
          }
          return this.isIOSCardsSurfaceVisible()
        },
        {
          timeout: 30000,
          interval: 1000,
          timeoutMsg: 'Cards screen did not load on iOS',
        }
      )
      return
    }
    await this.tap(this.cardsTabAndroid)
    await this.addNewCardButtonAndroid.waitForExist({ timeout: 15000 })
  }

  public async tapAddNewCard() {
    if (browser.isIOS) {
      await this.addNewCardButtonIOS.waitForExist({ timeout: 15000 })
      await this.tap(this.addNewCardButtonIOS)
      return
    }
    await this.tap(this.addNewCardButtonAndroid)
  }

  /* =========================
   * Assign Card screen
   * ========================= */

  private get cardTypeRowAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/assignBusinessCard_button_selectCardType$|^assignBusinessCard_button_selectCardType$")')
  }

  private get cardTypeRowIOS() {
    return $('~assignBusinessCard_button_selectCardType')
  }

  private get cardAssigneeRowAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/assignBusinessCard_button_selectUser$|^assignBusinessCard_button_selectUser$")')
  }

  private get cardAssigneeRowIOS() {
    return $('~assignBusinessCard_button_selectUser')
  }

  private get continueBtnAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/assignBusinessCard_button_continue$|^assignBusinessCard_button_continue$")')
  }

  private get continueBtnIOS() {
    return $('-ios predicate string:name == "assignBusinessCard_button_continue" OR label == "assignBusinessCard_button_continue" OR name == "Continue" OR label == "Continue"')
  }

  private get cardDesignOrderBtnAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/cardDesignSelection_button_confirm$|^cardDesignSelection_button_confirm$")')
  }

  private get cardDesignOrderBtnIOS() {
    return $('~cardDesignSelection_button_confirm')
  }

  private get assignCardSubmitBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Assign Card"]]')
  }

  private get assignCardSubmitBtnIOS() {
    return $('-ios predicate string:name == "Assign Card" OR label == "Assign Card"')
  }

  private get changeCardTypeTitleAndroid() {
    return $('android=new UiSelector().text("Change card type?")')
  }

  private get changeCardTypeTitleIOS() {
    return $('-ios predicate string:name == "Change card type?" OR label == "Change card type?"')
  }

  private get changeCardTypeConfirmBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Confirm"]]')
  }

  private get changeCardTypeConfirmBtnIOS() {
    return $('-ios predicate string:name == "Confirm" OR label == "Confirm"')
  }

  private get cardTypeSelectionTitleAndroid() {
    return $('android=new UiSelector().text("Select Card Type")')
  }

  private get cardTypeSelectionTitleIOS() {
    return $('-ios predicate string:name == "Select Card Type" OR label == "Select Card Type"')
  }

  private get physicalCardOptionAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Physical Card"]]')
  }

  private get physicalCardOptionIOS() {
    return $('-ios predicate string:name == "Physical Card" OR label == "Physical Card"')
  }

  private get assigneeAddressTitleAndroid() {
    return $('android=new UiSelector().textContains("address")')
  }

  private get assigneeAddressTitleIOS() {
    return $('-ios predicate string:name CONTAINS "address" OR label CONTAINS "address" OR name CONTAINS "Address" OR label CONTAINS "Address"')
  }

  private get cardAssignedSuccessTitleAndroid() {
    return $('android=new UiSelector().textMatches("Card (assigned|added) successfully")')
  }

  private get cardAssignedSuccessTitleIOS() {
    return $('-ios predicate string:name == "Card assigned successfully" OR label == "Card assigned successfully" OR name == "Card added successfully" OR label == "Card added successfully"')
  }

  private get successCloseBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Close"]]')
  }

  private get successCloseBtnIOS() {
    return $('-ios predicate string:name == "Close" OR label == "Close"')
  }

  public async openCardTypeSelection() {
    if (browser.isIOS) {
      await this.cardTypeRowIOS.waitForExist({ timeout: 15000 })
      await this.tap(this.cardTypeRowIOS)
      const confirmShown = await this.changeCardTypeTitleIOS.waitForExist({ timeout: 5000 }).catch(() => false)
      if (confirmShown) {
        await this.tap(this.changeCardTypeConfirmBtnIOS)
      }
      await this.cardTypeSelectionTitleIOS.waitForExist({ timeout: 10000 })
      return
    }

    await this.tap(this.cardTypeRowAndroid)
    const confirmShown = await this.changeCardTypeTitleAndroid.waitForExist({ timeout: 5000 }).catch(() => false)
    if (confirmShown) {
      await this.tap(this.changeCardTypeConfirmBtnAndroid)
    }
    await this.cardTypeSelectionTitleAndroid.waitForExist({ timeout: 10000 })
  }

  public async selectPhysicalCardType() {
    if (browser.isIOS) {
      await this.physicalCardOptionIOS.waitForExist({ timeout: 10000 })
      await this.tap(this.physicalCardOptionIOS)
      await this.continueBtnIOS.waitForExist({ timeout: 10000 })
      return
    }
    await this.physicalCardOptionAndroid.waitForExist({ timeout: 10000 })
    await this.tap(this.physicalCardOptionAndroid)
    await this.cardAssigneeRowAndroid.waitForExist({ timeout: 10000 })
    await this.continueBtnAndroid.waitForExist({ timeout: 10000 })
  }

  public async continueWithDefaultAssignee() {
    if (browser.isIOS) {
      await this.tap(this.continueBtnIOS)
      return
    }
    await this.tap(this.continueBtnAndroid)
  }

  public async orderDefaultCardDesign() {
    if (browser.isIOS) {
      await this.cardDesignOrderBtnIOS.waitForExist({ timeout: 15000 })
      await this.tap(this.cardDesignOrderBtnIOS)
      return
    }
    await this.tap(this.cardDesignOrderBtnAndroid)
  }

  public async confirmAssigneeAddressAndSubmit() {
    if (browser.isIOS) {
      await this.assigneeAddressTitleIOS.waitForExist({ timeout: 15000 })
      await this.assignCardSubmitBtnIOS.waitForExist({ timeout: 15000 })
      await this.tap(this.assignCardSubmitBtnIOS)
      return
    }
    await this.assigneeAddressTitleAndroid.waitForExist({ timeout: 15000 })
    await this.tap(this.assignCardSubmitBtnAndroid)
  }

  public async verifySuccessAndClose() {
    if (browser.isIOS) {
      await this.cardAssignedSuccessTitleIOS.waitForExist({ timeout: 15000 })
      await this.tap(this.successCloseBtnIOS)
      await this.cardAssignedSuccessTitleIOS.waitForExist({ timeout: 5000, reverse: true }).catch(() => {})
      return
    }

    await this.cardAssignedSuccessTitleAndroid.waitForExist({ timeout: 15000 })
    await this.tap(this.successCloseBtnAndroid)

    const closed = await this.cardAssignedSuccessTitleAndroid.waitForExist({ timeout: 3000, reverse: true }).catch(() => false)
    if (closed) return

    const location = await this.successCloseBtnAndroid.getLocation()
    const size = await this.successCloseBtnAndroid.getSize()
    await browser.execute('mobile: clickGesture', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    })

    await this.cardAssignedSuccessTitleAndroid.waitForExist({ timeout: 5000, reverse: true })
  }

  public async waitForCreatedCardReady() {
    if (browser.isIOS) {
      await this.freezeBtnIOS.waitForExist({
        timeout: 90000,
        interval: 1000,
        timeoutMsg: 'Created card details did not become ready on iOS: Freeze button not found',
      })
      return
    }

    const ready = await this.freezeBtnAndroid.waitForExist({ timeout: 30000, interval: 1000 }).catch(() => false)
    if (ready) return

    await this.reopenCardsFromHome()
    await this.freezeBtnAndroid.waitForExist({
      timeout: 90000,
      interval: 1000,
      timeoutMsg: 'Created card details did not become ready after Home -> Cards fallback: Freeze button was not displayed',
    })
  }

  private async reopenCardsFromHome() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    if (browser.isIOS) {
      await this.homeTabIOS.waitForExist({ timeout: 10000 })
      await this.tap(this.homeTabIOS)
      await browser.pause(1000)
      await browser.waitUntil(
        async () => {
          if (await this.cardsTabIOSA11y.isExisting().catch(() => false)) {
            await this.tap(this.cardsTabIOSA11y).catch(() => {})
          } else {
            await this.tap(this.cardsTabIOS).catch(() => {})
          }
          return this.freezeBtnIOS.isExisting().catch(() => false)
        },
        { timeout: 25000, interval: 1500 }
      )
      return
    }

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

  /* =========================
   * Card details screen
   * ========================= */

  private get cardNumberMaskedAndroid() {
    return $('//android.widget.TextView[starts-with(@text,"****")]')
  }

  private get cardNameInputAndroid() {
    return $('android.widget.EditText')
  }

  private get freezeBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Freeze"]]')
  }

  private get freezeBtnIOS() {
    return $('-ios predicate string:name == "Freeze" OR label == "Freeze"')
  }

  private get unfreezeBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Unfreeze"]]')
  }

  private get unfreezeBtnIOS() {
    return $('-ios predicate string:name == "Unfreeze" OR label == "Unfreeze"')
  }

  private get reportBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Report"]]')
  }

  private get reportBtnIOS() {
    return $('-ios predicate string:name == "Report" OR label == "Report"')
  }

  private get viewPinBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="View PIN"]]')
  }

  private get securityBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Security"]]')
  }

  private get moreBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="More"]]')
  }

  private get addToGoogleWalletBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//*[@content-desc="Add To Google Wallet"]]')
  }

  public async tapFreeze() {
    if (browser.isIOS) {
      await this.freezeBtnIOS.waitForExist({ timeout: 15000 })
      await this.tap(this.freezeBtnIOS)
      await browser.waitUntil(
        async () =>
          (await this.unfreezeBtnIOS.isExisting().catch(() => false)) ||
          (await this.reportBtnIOS.isExisting().catch(() => false)),
        { timeout: 10000, interval: 500, timeoutMsg: 'Frozen card actions were not displayed on iOS' }
      )
      return
    }
    await this.tap(this.freezeBtnAndroid)
    await browser.waitUntil(
      async () =>
        (await this.unfreezeBtnAndroid.isDisplayed().catch(() => false)) ||
        (await this.reportBtnAndroid.isDisplayed().catch(() => false)),
      { timeout: 10000, interval: 500, timeoutMsg: 'Frozen card actions were not displayed' }
    )
  }

  public async tapReport() {
    if (browser.isIOS) {
      await this.reportBtnIOS.waitForExist({ timeout: 15000 })
      await this.tap(this.reportBtnIOS)
      const alertDismissed = await this.dismissIOSPermissionAlertsIfPresent().catch(() => false)
      if (!alertDismissed) {
        await this.tapScreenPointIOS(0.5, 0.75, 'finger-ios-report-confirm').catch(() => {})
      }
      return
    }
    await this.tap(this.reportBtnAndroid)
    await this.tap(this.blockReportConfirmBtnAndroid)
  }

  public async verifyCardBlocked() {
    if (browser.isIOS) {
      await this.cardBlockedTitleIOS.waitForExist({ timeout: 10000 })
      return
    }
    await this.cardBlockedTitleAndroid.waitForExist({ timeout: 10000 })
  }

  public async tapViewMyCards() {
    if (browser.isIOS) {
      const alreadyOnCards = await this.isIOSCardsSurfaceVisible()
      if (alreadyOnCards) return
      await this.viewMyCardsBtnIOS.waitForExist({ timeout: 15000 })
      await this.tap(this.viewMyCardsBtnIOS)
      await browser.waitUntil(
        async () => await this.isIOSCardsSurfaceVisible(),
        { timeout: 15000, interval: 500, timeoutMsg: 'Cards screen did not load after View my Cards on iOS' }
      )
      return
    }

    const alreadyOnCards = await this.addNewCardButtonAndroid.isDisplayed().catch(() => false)
    if (alreadyOnCards) return

    const shown = await this.viewMyCardsBtnAndroid.waitForExist({ timeout: 15000 }).catch(() => false)
    if (!shown) {
      const cardsShown = await this.addNewCardButtonAndroid.isDisplayed().catch(() => false)
      if (cardsShown) return
      await this.viewMyCardsBtnAndroid.waitForExist({ timeout: 1 })
    }

    const location = await this.viewMyCardsBtnAndroid.getLocation()
    const size = await this.viewMyCardsBtnAndroid.getSize()
    await browser.execute('mobile: clickGesture', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    }).catch(async () => {
      await this.tap(this.viewMyCardsBtnAndroid)
    })

    await this.addNewCardButtonAndroid.waitForExist({ timeout: 15000 })
  }

  public async verifyCardRemoved() {
    if (browser.isIOS) {
      await browser.waitUntil(
        async () => await this.isIOSCardsSurfaceVisible(),
        { timeout: 15000, interval: 500, timeoutMsg: 'Cards screen was not visible after card removal on iOS' }
      )
      return
    }
    await this.addNewCardButtonAndroid.waitForExist({ timeout: 15000 })
  }

  /* =========================
   * Report card (permanent block)
   * ========================= */

  private get cardBlockedTitleAndroid() {
    return $('android=new UiSelector().text("Your card has been blocked.")')
  }

  private get cardBlockedTitleIOS() {
    return $('-ios predicate string:name == "Your card has been blocked." OR label == "Your card has been blocked."')
  }

  private get blockReportConfirmBtnAndroid() {
    return $('android=new UiSelector().resourceId("android:id/button1")')
  }

  private get viewMyCardsBtnAndroid() {
    return $('android=new UiSelector().textMatches("View my Cards|View my cards")')
  }

  private get viewMyCardsBtnIOS() {
    return $('-ios predicate string:name == "View my Cards" OR label == "View my Cards" OR name == "View my cards" OR label == "View my cards"')
  }
}

export default new BusinessCardPage()
