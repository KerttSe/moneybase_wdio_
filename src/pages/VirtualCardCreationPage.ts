import BasePage from './BasePage'
import { $, $$, browser } from '@wdio/globals'


class VirtualCardCreationPage extends BasePage {
  /* =========================
   * ANDROID: HOME / ACCOUNT (Single vs Business)
   * ========================= */

  private get userAvatarBtnAndroid() {
    return $('android=new UiSelector().resourceId("home_button_userAvatar")')
  }

  private get businessAccountLabelAndroid() {
    return $('android=new UiSelector().textContains("Business")')
  }

  private get singleAccountItemAndroid() {
    return $('android=new UiSelector().description("Single")')
  }

  private get singleAccountItemAndroidByText() {
    return $('android=new UiSelector().text("Single")')
  }

  private get homeRootAndroid() {
    return $('android=new UiSelector().resourceId("home_screen")')
  }

  private get cardsRootAndroid() {
    return $('android=new UiSelector().resourceId("cards_screen")')
  }

  private get cardsRootIOS() {
    return $('~CARDS_00000')
  }

    /* =========================
   * ANDROID: blocking AlertDialog (AFTER switch only)
   * ========================= */

  

  private get alertBtn3Android() {
    return $('id=android:id/button3') // OK (нейтральна)
  }

  private async dismissBlockingAlertAndroid(timeoutMs = 10000) {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const isVisible = await this.alertBtn3Android.isDisplayed().catch(() => false)
    if (!isVisible) return

    await this.tap(this.alertBtn3Android)
    await this.alertBtn3Android.waitForDisplayed({ reverse: true, timeout: timeoutMs }).catch(() => {})
  }

  private async waitAndDismissAlertAfterSwitchAndroid(
    timeoutMs = 12000,
    stableHomeMs = 1200,
    pollMs = 250
  ) {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const deadline = Date.now() + timeoutMs
    let homeVisibleSince: number | null = null

    while (Date.now() < deadline) {
      const btnExists = await this.alertBtn3Android.isExisting().catch(() => false)
      const btnShown = btnExists && (await this.alertBtn3Android.isDisplayed().catch(() => false))

      if (btnShown) {
        await this.tap(this.alertBtn3Android)
        await this.alertBtn3Android.waitForDisplayed({ reverse: true, timeout: 7000 }).catch(() => {})
        await browser.pause(250)
        return
      }

      const homeShown = await this.homeRootAndroid.isDisplayed().catch(() => false)
      if (homeShown) {
        if (homeVisibleSince === null) homeVisibleSince = Date.now()
        if (Date.now() - homeVisibleSince >= stableHomeMs) return
      } else {
        homeVisibleSince = null
      }

      await browser.pause(pollMs)
    }
  }

  private get googlePayNotNowAndroid() {
    return $('android=new UiSelector().text("Not Now")')
  }

  private get googlePayPromoTitleAndroid() {
    return $('android=new UiSelector().textContains("Google Pay")')
  }

  private async dismissGooglePayPromoAndroid(timeoutMs = 7000) {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const notNowShown = await this.googlePayNotNowAndroid.isDisplayed().catch(() => false)
    if (notNowShown) {
      await this.tap(this.googlePayNotNowAndroid)
      await this.googlePayNotNowAndroid.waitForDisplayed({ reverse: true, timeout: timeoutMs }).catch(() => {})
      return
    }

    const promoShown = await this.googlePayPromoTitleAndroid.isDisplayed().catch(() => false)
    if (!promoShown) return

    await this.googlePayNotNowAndroid.waitForDisplayed({ timeout: timeoutMs }).catch(() => {})
    if (await this.googlePayNotNowAndroid.isDisplayed().catch(() => false)) {
      await this.tap(this.googlePayNotNowAndroid)
      await this.googlePayNotNowAndroid.waitForDisplayed({ reverse: true, timeout: timeoutMs }).catch(() => {})
    }
  }

  /* =========================
   * ANDROID: Account menu helpers + ensure Single
   * ========================= */

  /** Switch to Single if needed */
  private async ensureSingleAccountAndroid() {
    const isBusiness = await this.businessAccountLabelAndroid.isDisplayed().catch(() => false)
    if (!isBusiness) return

    await this.userAvatarBtnAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.userAvatarBtnAndroid)

    if (await this.singleAccountItemAndroid.isDisplayed().catch(() => false)) {
      await this.tap(this.singleAccountItemAndroid)
    } else {
      try {
        await this.tap(this.singleAccountItemAndroidByText)
      } catch {
        // Element not found, but continue
      }
    }

    await this.waitAndDismissAlertAfterSwitchAndroid(12000, 1200)
    await this.homeRootAndroid.waitForDisplayed({ timeout: 30000 }).catch(() => {})
    await this.businessAccountLabelAndroid.waitForDisplayed({ reverse: true, timeout: 30000 }).catch(() => {})
  }

  // Backward-compatible alias (if referenced elsewhere)
  public async ensureSingleAccountAndroidFlow() {
    await this.ensureSingleAccountAndroid()
  }
  /* =========================
   * iOS: PROFILE PICKER (ensure Individual)
   * ========================= */

  private get profilePickerUserNameLabelIOS() {
    return $('~profilePicker_label_userName')
  }

  private get profilePickerIndividualItemIOS() {
    return $('~Individual')
  }

  private async ensureIndividualAccountIOS() {
    if (!browser.isIOS) return

    await this.profilePickerUserNameLabelIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.profilePickerUserNameLabelIOS)

    await this.profilePickerIndividualItemIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.profilePickerIndividualItemIOS)

    await this.profilePickerIndividualItemIOS.waitForDisplayed({ reverse: true, timeout: 15000 }).catch(() => {})
    await browser.pause(300)
  }

  /** PUBLIC: ensure account context = Individual (iOS) / Single (Android) */
  public async ensureIndividualAccount() {
    if (browser.isIOS) return this.ensureIndividualAccountIOS()
    if (browser.isAndroid) return this.ensureSingleAccountAndroid()
  }

  
  /* =========================
   * ANDROID LOCATORS
   * ========================= */

  private get cardsTabAndroid() {
    return $('~Cards')
  }

  private get cardsTabIOS() {
    return $('~Cards')
  }

  private get cardsTabAndroidById() {
    return $('id=com.moneybase.qa:id/navigation_button_cards')
  }

  private get addNewCardBtnAndroid() {
  return $('android=new UiSelector().resourceId("cards_card_addNewCard")')
}

  private get addNewCardBtnIOS() {
    return $('~card_item_addCard')
  }


  private get virtualCardTypeAndroid() {
    return $('android=new UiSelector().resourceId("cardTypeSelection_card_virtualCard")')
  }

  private get physicalCardTypeAndroid() {
    return $('android=new UiSelector().resourceId("cardTypeSelection_card_physicalCard")')
  }

  private get physicalCardTypeIOS() {
    return $('~addCard_button_physical')
  }

  private get confirmDesignBtnAndroid() {
    return $('android=new UiSelector().resourceId("cardDesignSelection_button_confirm")')
  }

  private get confirmDesignBtnIOS() {
    return $('~addCardDesign_button_order')
  }

  private get orderPhysicalCardBtnAndroid() {
    return $('android=new UiSelector().text("Order")')
  }

  private get otpInputAndroid() {
    return $('id=com.moneybase.qa:id/otp_input')
  }

  private get closeSheetAndroid() {
    return $('~Close sheet')
  }

  private get closeSheetAndroidByXpath() {
    return $('//android.view.View[@content-desc="Close sheet"]')
  }

  private get closeButtonAndroid() {
    return $('android=new UiSelector().text("Close")')
  }

  private get viewMyCardsBtnAndroid() {
    return $('android=new UiSelector().text("View my Cards")')
  }

  private get cardAddedSuccessTextAndroid() {
    return $('android=new UiSelector().text("Card added successfully")')
  }

  private get confirmAddressBtnAndroid() {
    return $('android=new UiSelector().text("Confirm Address")')
  }

  private get confirmAddressBtnIOS() {
    return $('~cardDelivery_button_confirm')
  }

  private get addressLine1Android() {
    return $('//android.widget.EditText[.//android.widget.TextView[@text="Address Line 1"]]')
  }

  private get addressLine1IOS() {
    return $('~address_textInput_address1')
  }

  private get addressLine2Android() {
    return $('//android.widget.EditText[.//android.widget.TextView[@text="Address Line 2"]]')
  }

  private get addressLine2IOS() {
    return $('~address_textInput_address2')
  }

  private get cityAndroid() {
    return $('//android.widget.EditText[.//android.widget.TextView[@text="City"]]')
  }

  private get cityIOS() {
    return $('~address_textInput_city')
  }

  private get postCodeAndroid() {
    return $('//android.widget.EditText[.//android.widget.TextView[@text="Post Code"]]')
  }

  private get postCodeIOS() {
    return $('~address_textInput_postCode')
  }

  private get freezeButtonAndroid() {
    return $('android=new UiSelector().resourceId("cards_button_freeze")')
  }

  private get freezeButtonIOS() {
    return $('~cards_button_freeze')
  }

  private get freezeTextAndroid() {
    return $('android=new UiSelector().text("Freeze")')
  }

  private get unfreezeTextAndroid() {
    return $('android=new UiSelector().text("Unfreeze")')
  }

  private get unfreezeButtonIOS() {
    return $('~cards_button_unfreeze')
  }

  private get blockButtonIOS() {
    return $('~Block')
  }

  private get blockConfirmButtonIOS() {
    return $('-ios class chain:**/XCUIElementTypeButton[name == "Block"]')
  }

  private get reportButtonAndroid() {
    return $('android=new UiSelector().resourceId("cards_button_report")')
  }

  private get moreButtonAndroid() {
    return $('android=new UiSelector().resourceId("cards_button_more")')
  }

  private get blockButtonAndroid() {
    return $('android=new UiSelector().textContains("Block")')
  }

  private get confirmBlockButtonAndroid() {
    return $('android=new UiSelector().resourceId("android:id/button1")')
  }

  private get blockedSuccessTextAndroid() {
    return $('android=new UiSelector().text("Your card has been blocked.")')
  }

  private get otpEntryIOS() {
    return $('~OTP_entry_0')
  }

  private get otpTextViewIOS() {
    return $('-ios class chain:**/XCUIElementTypeTextView')
  }

  private get applePayProposalCloseBtnIOS() {
    return $('~applePayProposal_button_close')
  }

  /* =========================
   * PRIVATE HELPERS
   * ========================= */

  private async isSyncIndicatorVisibleAndroid() {
    if (!browser.isAndroid) return false
    const indicators = await $$('android=new UiSelector().className("android.widget.ProgressBar")')
    for (const el of indicators) {
      if (await el.isDisplayed().catch(() => false)) return true
    }
    return false
  }

  private async isSyncIndicatorVisibleIOS() {
    if (!browser.isIOS) return false
    const indicators = await $$('-ios class chain:**/XCUIElementTypeActivityIndicator')
    for (const el of indicators) {
      if (await el.isDisplayed().catch(() => false)) return true
    }
    return false
  }

  private async waitForSyncToFinishAndroid(timeoutMs = 60000, pollMs = 1000) {
    if (!browser.isAndroid) return
    await browser.switchContext('NATIVE_APP').catch(() => {})
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      if (!(await this.isSyncIndicatorVisibleAndroid())) return
      await browser.pause(pollMs)
    }
  }

  private async waitForSyncToFinishIOS(timeoutMs = 60000, pollMs = 1000) {
    if (!browser.isIOS) return
    await browser.switchContext('NATIVE_APP').catch(() => {})
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      if (!(await this.isSyncIndicatorVisibleIOS())) return
      await browser.pause(pollMs)
    }
  }

  private async waitForFreezeReadyAndroid(timeoutMs = 60000, pollMs = 1000) {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    await this.waitForSyncToFinishAndroid(timeoutMs, pollMs)

    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      const freezeShown = await this.freezeTextAndroid.isDisplayed().catch(() => false)
      const unfreezeShown = await this.unfreezeTextAndroid.isDisplayed().catch(() => false)
      if (freezeShown || unfreezeShown) return
      await browser.pause(pollMs)
    }
  }

  private async waitForFreezeReadyIOS(timeoutMs = 60000, pollMs = 1000) {
    if (!browser.isIOS) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    await this.waitForSyncToFinishIOS(timeoutMs, pollMs)

    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      const freezeShown = await this.freezeButtonIOS.isDisplayed().catch(() => false)
      const unfreezeShown = await this.unfreezeButtonIOS.isDisplayed().catch(() => false)
      if (freezeShown || unfreezeShown) return
      await browser.pause(pollMs)
    }
  }

  private async typeOtpAndroid(value: string) {
    await this.otpInputAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.otpInputAndroid)
    await this.otpInputAndroid.clearValue().catch(() => {})
    await this.otpInputAndroid.setValue(value)
  }

  private async closeCardSheetAndroid(timeoutMs = 60000) {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})
    await browser.waitUntil(
      async () => {
        const closeSheetExists = await this.closeSheetAndroid.isExisting().catch(() => false)
        const closeSheetAltExists = await this.closeSheetAndroidByXpath.isExisting().catch(() => false)
        const closeButtonVisible = await this.closeButtonAndroid.isDisplayed().catch(() => false)
        const viewMyCardsVisible = await this.viewMyCardsBtnAndroid.isDisplayed().catch(() => false)
        const successVisible = await this.cardAddedSuccessTextAndroid.isDisplayed().catch(() => false)
        return closeSheetExists || closeSheetAltExists || closeButtonVisible || viewMyCardsVisible || successVisible
      },
      {
        timeout: timeoutMs,
        interval: 500,
        timeoutMsg: 'Close sheet not visible in time',
      }
    )

    const closeSheetVisible = await this.closeSheetAndroid.isExisting().catch(() => false)
    const closeSheetAltVisible = await this.closeSheetAndroidByXpath.isExisting().catch(() => false)
    const closeButtonVisible = await this.closeButtonAndroid.isDisplayed().catch(() => false)
    const viewMyCardsVisible = await this.viewMyCardsBtnAndroid.isDisplayed().catch(() => false)
    const successVisible = await this.cardAddedSuccessTextAndroid.isDisplayed().catch(() => false)

    if (closeSheetVisible) {
      await this.closeSheetAndroid.click()
    } else if (closeSheetAltVisible) {
      await this.closeSheetAndroidByXpath.click()
    } else if (viewMyCardsVisible) {
      await this.viewMyCardsBtnAndroid.click()
    } else if (closeButtonVisible) {
      await this.closeButtonAndroid.click()
    } else if (successVisible && closeSheetAltVisible) {
      await this.closeSheetAndroidByXpath.click()
    } else {
      throw new Error('Close sheet controls not found')
    }

    await browser.waitUntil(
      async () => {
        const closeSheetStill = await this.closeSheetAndroid.isExisting().catch(() => false)
        const closeSheetAltStill = await this.closeSheetAndroidByXpath.isExisting().catch(() => false)
        const closeButtonStill = await this.closeButtonAndroid.isDisplayed().catch(() => false)
        const viewMyCardsStill = await this.viewMyCardsBtnAndroid.isDisplayed().catch(() => false)
        return !closeSheetStill && !closeSheetAltStill && !closeButtonStill && !viewMyCardsStill
      },
      {
        timeout: timeoutMs,
        interval: 500,
        timeoutMsg: 'Card sheet did not close in time',
      }
    )
  }

  private async freezeAndUnfreezeCardAndroid(timeoutMs = 60000) {
    if (!browser.isAndroid) return

    await this.waitForFreezeReadyAndroid(timeoutMs)
    await this.freezeButtonAndroid.waitForDisplayed({ timeout: timeoutMs }).catch(() => {})
    const canFreeze = await this.freezeTextAndroid.isDisplayed().catch(() => false)
    if (!canFreeze) return

    await this.tap(this.freezeButtonAndroid)
    await this.unfreezeTextAndroid.waitForDisplayed({ timeout: timeoutMs }).catch(() => {})

    await this.tap(this.freezeButtonAndroid)
    await this.unfreezeTextAndroid.waitForDisplayed({ reverse: true, timeout: timeoutMs }).catch(() => {})
    await this.freezeTextAndroid.waitForDisplayed({ timeout: timeoutMs }).catch(() => {})
  }

  private async closeApplePayProposalIOS(timeoutMs = 10000) {
    if (!browser.isIOS) return
    const shown = await this.applePayProposalCloseBtnIOS.waitForDisplayed({ timeout: timeoutMs }).catch(() => false)
    if (!shown) return
    await this.tap(this.applePayProposalCloseBtnIOS)
    await this.applePayProposalCloseBtnIOS.waitForDisplayed({ reverse: true, timeout: timeoutMs }).catch(() => {})
  }

  private async typeOtpIOS(value: string) {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    const otpShown = await this.otpEntryIOS.waitForDisplayed({ timeout: 5000 }).catch(() => false)
    if (otpShown) {
      await this.tap(this.otpEntryIOS)
      await this.otpEntryIOS.addValue(value)
      return
    }

    await this.otpTextViewIOS.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.otpTextViewIOS)
    let typed = true
    for (const digit of value) {
      const ok = await this.otpTextViewIOS.addValue(digit).then(() => true).catch(() => false)
      if (!ok) {
        typed = false
        break
      }
    }
    if (!typed) {
      await browser.execute('mobile: type', { text: value }).catch(() => {})
    }
  }

  private async waitForOtpEntryIOS(timeoutMs = 40000) {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      if (await this.otpEntryIOS.isDisplayed().catch(() => false)) return
      if (await this.otpTextViewIOS.isDisplayed().catch(() => false)) return

      const confirmShown = await this.confirmAddressBtnIOS.isDisplayed().catch(() => false)
      if (confirmShown) {
        await this.tap(this.confirmAddressBtnIOS)
      }

      await browser.pause(500)
    }

    await this.otpEntryIOS.waitForDisplayed({ timeout: 5000 })
  }

  private async confirmPinIOS(timeoutMs = 15000) {
    await this.confirmAddressBtnIOS.waitForDisplayed({ timeout: timeoutMs }).catch(() => {})
    if (await this.confirmAddressBtnIOS.isDisplayed().catch(() => false)) {
      await this.tap(this.confirmAddressBtnIOS)
    }
  }

  private async blockCardIOS(timeoutMs = 20000) {
    if (!browser.isIOS) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const blockShown = await this.blockButtonIOS.waitForDisplayed({ timeout: timeoutMs }).catch(() => false)
    if (blockShown) {
      await this.tap(this.blockButtonIOS)

      const confirmShown = await this.blockConfirmButtonIOS.waitForDisplayed({ timeout: timeoutMs }).catch(() => false)
      if (confirmShown) {
        await this.tap(this.blockConfirmButtonIOS)
      } else {
        await this.blockButtonIOS.waitForDisplayed({ timeout: timeoutMs }).catch(() => {})
        if (await this.blockButtonIOS.isDisplayed().catch(() => false)) {
          await this.tap(this.blockButtonIOS)
        }
      }
    }

    await this.assertCardsAfterDeletionIOS(20000)
  }

  private async reportAndBlockCardAndroid(timeoutMs = 15000) {
    if (!browser.isAndroid) return

    if (!(await this.cardsRootAndroid.isDisplayed().catch(() => false))) {
      await this.openCardsTabAndroid()
    }

    await browser.switchContext('NATIVE_APP').catch(() => {})

    await this.waitForFreezeReadyAndroid(timeoutMs)
    const freezeShown = await this.freezeButtonAndroid.waitForDisplayed({ timeout: timeoutMs }).catch(() => false)
    if (freezeShown) {
      await this.tap(this.freezeButtonAndroid)
    }

    const reportShown = await this.reportButtonAndroid.waitForDisplayed({ timeout: timeoutMs }).catch(() => false)
    if (!reportShown) {
      const moreShown = await this.moreButtonAndroid.waitForDisplayed({ timeout: timeoutMs }).catch(() => false)
      if (moreShown) {
        await this.tap(this.moreButtonAndroid)
      }
      await this.reportButtonAndroid.waitForDisplayed({ timeout: timeoutMs })
    }
    await this.tap(this.reportButtonAndroid)

    await this.blockButtonAndroid.waitForDisplayed({ timeout: timeoutMs })
    await this.tap(this.blockButtonAndroid)

    await this.blockedSuccessTextAndroid.waitForDisplayed({ timeout: timeoutMs }).catch(() => {})

    const viewMyCardsShown = await this.viewMyCardsBtnAndroid.waitForDisplayed({ timeout: timeoutMs }).catch(() => false)
    if (viewMyCardsShown) {
      await this.tap(this.viewMyCardsBtnAndroid)
      await this.cardsRootAndroid.waitForDisplayed({ timeout: timeoutMs }).catch(() => {})
    }

    await this.assertCardsAfterDeletionAndroid(timeoutMs)
  }

  private async assertCardsAfterDeletionAndroid(timeoutMs = 15000) {
    if (!browser.isAndroid) return
    await this.cardsRootAndroid.waitForDisplayed({ timeout: timeoutMs })
    await this.addNewCardBtnAndroid.waitForDisplayed({ timeout: timeoutMs })
  }

  private async assertCardsAfterDeletionIOS(timeoutMs = 15000) {
    if (!browser.isIOS) return
    await this.cardsRootIOS.waitForDisplayed({ timeout: timeoutMs })
    await this.addNewCardBtnIOS.waitForDisplayed({ timeout: timeoutMs })
  }

  /* =========================
   * PUBLIC FLOW
   * ========================= */

  public async openCardsTabAndroid() {
    if (!browser.isAndroid) return
    await this.ensureSingleAccountAndroid()
    await browser.pause(700)
    await browser.switchContext('NATIVE_APP').catch(() => {})
    await this.dismissBlockingAlertAndroid(3000)
    await this.dismissGooglePayPromoAndroid(7000)
    await browser.pause(1000) // Wait for UiAutomator2 to stabilize after login
    await this.cardsTabAndroid.waitForDisplayed({ timeout: 20000 }).catch(async () => {
      await this.dismissBlockingAlertAndroid(3000)
      await this.dismissGooglePayPromoAndroid(7000)
      await this.cardsTabAndroidById.waitForDisplayed({ timeout: 20000 })
    })

    if (await this.cardsTabAndroid.isDisplayed().catch(() => false)) {
      await this.tap(this.cardsTabAndroid)
    } else {
      await this.tap(this.cardsTabAndroidById)
    }

    await this.cardsRootAndroid.waitForDisplayed({ timeout: 20000 }).catch(async () => {
      if (await this.cardsTabAndroidById.isDisplayed().catch(() => false)) {
        await this.tap(this.cardsTabAndroidById)
      } else if (await this.cardsTabAndroid.isDisplayed().catch(() => false)) {
        await this.tap(this.cardsTabAndroid)
      }
      await this.cardsRootAndroid.waitForDisplayed({ timeout: 20000 })
    })
  }

  public async openCardsTabIOS() {
    if (!browser.isIOS) return
    await this.ensureIndividualAccountIOS()
    await browser.switchContext('NATIVE_APP').catch(() => {})
    await this.cardsTabIOS.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.cardsTabIOS)
    await this.cardsRootIOS.waitForDisplayed({ timeout: 20000 })
  }

  public async startAddNewCardAndroid() {
    if (!(await this.cardsRootAndroid.isDisplayed().catch(() => false))) {
      await this.openCardsTabAndroid()
    }
    await this.addNewCardBtnAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.addNewCardBtnAndroid)
  }

  public async startAddNewCardIOS() {
    if (!(await this.cardsRootIOS.isDisplayed().catch(() => false))) {
      await this.openCardsTabIOS()
    }
    await this.addNewCardBtnIOS.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.addNewCardBtnIOS)
  }

  public async chooseVirtualCardTypeAndroid() {
    await this.virtualCardTypeAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.virtualCardTypeAndroid)
  }

  public async choosePhysicalCardTypeAndroid() {
    await this.physicalCardTypeAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.physicalCardTypeAndroid)
  }

  public async choosePhysicalCardTypeIOS() {
    await this.physicalCardTypeIOS.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.physicalCardTypeIOS)
  }

  public async confirmDefaultDesignAndroid() {
    await this.confirmDesignBtnAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.confirmDesignBtnAndroid)
  }

  public async confirmDefaultDesignIOS() {
    await this.confirmDesignBtnIOS.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.confirmDesignBtnIOS)
  }

  public async confirmPhysicalCardAndroid() {
    const canConfirmDesign = await this.confirmDesignBtnAndroid.isDisplayed().catch(() => false)
    if (canConfirmDesign) {
      await this.tap(this.confirmDesignBtnAndroid)
      return
    }

    await this.orderPhysicalCardBtnAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.orderPhysicalCardBtnAndroid)
  }

  public async confirmDeliveryAddressAndroid() {
    const canConfirmAddress = await this.confirmAddressBtnAndroid.waitForDisplayed({ timeout: 20000 }).catch(() => false)
    if (!canConfirmAddress) return

    await this.tap(this.confirmAddressBtnAndroid)
  }

  public async confirmDeliveryAddressIOS() {
    const canConfirmAddress = await this.confirmAddressBtnIOS.waitForDisplayed({ timeout: 20000 }).catch(() => false)
    if (!canConfirmAddress) return
    await this.tap(this.confirmAddressBtnIOS)
  }

  public async fillDeliveryAddressAndroid(params?: {
    address1?: string
    address2?: string
    city?: string
    postCode?: string
  }) {
    const {
      address1 = 'Test Address 1',
      address2 = 'Test Address 2',
      city = 'Valetta',
      postCode = 'VLT 1090',
    } = params || {}

    if (await this.addressLine1Android.waitForDisplayed({ timeout: 10000 }).catch(() => false)) {
      await this.tap(this.addressLine1Android)
      await this.addressLine1Android.clearValue().catch(() => {})
      await this.addressLine1Android.setValue(address1)
    }

    if (await this.addressLine2Android.waitForDisplayed({ timeout: 10000 }).catch(() => false)) {
      await this.tap(this.addressLine2Android)
      await this.addressLine2Android.clearValue().catch(() => {})
      await this.addressLine2Android.setValue(address2)
    }

    if (await this.cityAndroid.waitForDisplayed({ timeout: 10000 }).catch(() => false)) {
      await this.tap(this.cityAndroid)
      await this.cityAndroid.clearValue().catch(() => {})
      await this.cityAndroid.setValue(city)
    }

    if (await this.postCodeAndroid.waitForDisplayed({ timeout: 10000 }).catch(() => false)) {
      await this.tap(this.postCodeAndroid)
      await this.postCodeAndroid.clearValue().catch(() => {})
      await this.postCodeAndroid.setValue(postCode)
      await browser.hideKeyboard().catch(() => {})
    }
  }

  public async fillDeliveryAddressIOS(params?: {
    address1?: string
    address2?: string
    city?: string
    postCode?: string
  }) {
    const {
      address1 = 'Test Address 1',
      address2 = 'Test Address 2',
      city = 'Valetta',
      postCode = 'VLT 1090',
    } = params || {}

    if (await this.addressLine1IOS.waitForDisplayed({ timeout: 10000 }).catch(() => false)) {
      await this.tap(this.addressLine1IOS)
      await this.addressLine1IOS.clearValue().catch(() => {})
      await this.addressLine1IOS.setValue(address1)
      await browser.hideKeyboard().catch(() => {})
    }

    if (await this.addressLine2IOS.waitForDisplayed({ timeout: 10000 }).catch(() => false)) {
      await this.tap(this.addressLine2IOS)
      await this.addressLine2IOS.clearValue().catch(() => {})
      await this.addressLine2IOS.setValue(address2)
      await browser.hideKeyboard().catch(() => {})
    }

    if (await this.cityIOS.waitForDisplayed({ timeout: 10000 }).catch(() => false)) {
      await this.tap(this.cityIOS)
      await this.cityIOS.clearValue().catch(() => {})
      await this.cityIOS.setValue(city)
      await browser.hideKeyboard().catch(() => {})
    }

    if (await this.postCodeIOS.waitForDisplayed({ timeout: 10000 }).catch(() => false)) {
      await this.tap(this.postCodeIOS)
      await this.postCodeIOS.clearValue().catch(() => {})
      await this.postCodeIOS.setValue(postCode)
      await browser.hideKeyboard().catch(() => {})
    }
  }

  public async createPinAndroid(pin: string) {
    await this.typeOtpAndroid(pin)
  }

  public async reenterPinAndroid(pin: string) {
    await this.typeOtpAndroid(pin)
  }

  public async enterOtpAndroid(otp: string) {
    await this.typeOtpAndroid(otp)
  }

  public async createPinIOS(pin: string) {
    await this.typeOtpIOS(pin)
    await this.confirmPinIOS()
  }

  public async reenterPinIOS(pin: string) {
    await this.typeOtpIOS(pin)
    await this.confirmPinIOS()
  }

  public async enterOtpIOS(otp: string) {
    await this.waitForOtpEntryIOS()
    await this.typeOtpIOS(otp)
  }

  /** Full flow — but data must come from spec */
  public async createVirtualCardAndroid(pin: string, otp: string) {
    await this.openCardsTabAndroid()
    await this.startAddNewCardAndroid()
    await this.chooseVirtualCardTypeAndroid()
    await this.confirmDefaultDesignAndroid()
    await this.createPinAndroid(pin)
    await this.reenterPinAndroid(pin)
    await this.enterOtpAndroid(otp)
    await this.closeCardSheetAndroid()
    await this.freezeAndUnfreezeCardAndroid()
  }

  /** Full flow — but data must come from spec */
  public async createPhysicalCardAndroid(pin: string, otp: string) {
    await this.openCardsTabAndroid()
    await this.startAddNewCardAndroid()
    await this.choosePhysicalCardTypeAndroid()
    await this.confirmPhysicalCardAndroid()
    await this.fillDeliveryAddressAndroid()
    await this.confirmDeliveryAddressAndroid()
    await this.createPinAndroid(pin)
    await this.reenterPinAndroid(pin)
    await this.enterOtpAndroid(otp)
    await this.closeCardSheetAndroid()
    await this.reportAndBlockCardAndroid()
  }

  public async createPhysicalCardIOS(pin: string, otp: string) {
    await this.openCardsTabIOS()
    await this.startAddNewCardIOS()
    await this.choosePhysicalCardTypeIOS()
    await this.confirmDefaultDesignIOS()
    await this.fillDeliveryAddressIOS()
    await this.confirmDeliveryAddressIOS()
    await this.createPinIOS(pin)
    await this.reenterPinIOS(pin)
    await this.enterOtpIOS(otp)
    await this.closeApplePayProposalIOS()
    await this.waitForFreezeReadyIOS(60000)
    await this.freezeButtonIOS.waitForDisplayed({ timeout: 60000 })
    await this.tap(this.freezeButtonIOS)
    await this.unfreezeButtonIOS.waitForDisplayed({ timeout: 20000 }).catch(() => {})
    await this.waitForSyncToFinishIOS(60000)
    await this.blockCardIOS(20000)
  }
}

export default new VirtualCardCreationPage()