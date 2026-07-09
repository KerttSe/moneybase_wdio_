import BasePage from './BasePage'
import { $, $$, browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'


class PhysicalCardCreationPage extends BasePage {
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

  

  private async dismissBlockingAlertAndroid(timeoutMs = 10000) {
    await this.dismissCommonAndroidAlert(timeoutMs).catch(() => false)
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
      const dismissed = await this.dismissCommonAndroidAlert(2000).catch(() => false)
      if (dismissed) {
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

  private get addNewCardBtnIOSByText() {
    return $('//XCUIElementTypeStaticText[@name="Add Card" or @label="Add Card" or @value="Add Card"]/ancestor::XCUIElementTypeCell[1]')
  }

  private get addNewCardTextIOS() {
    return $('-ios predicate string:type == "XCUIElementTypeStaticText" AND (name == "Add Card" OR label == "Add Card" OR value == "Add Card")')
  }

  private get addNewCardPlusIOS() {
    return $('-ios predicate string:type == "XCUIElementTypeImage" AND (name == "plus.circle.fill" OR label == "plus.circle.fill" OR label == "add")')
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

  private get physicalCardTypeIOSByText() {
    return $('-ios predicate string:(label CONTAINS[c] "Physical" OR name CONTAINS[c] "Physical" OR value CONTAINS[c] "Physical")')
  }

  private get physicalCardTypeIOSByContainer() {
    return $('//XCUIElementTypeStaticText[contains(@name,"Physical") or contains(@label,"Physical") or contains(@value,"Physical")]/ancestor::XCUIElementTypeOther[2]')
  }

  private get virtualCardTypeIOSByText() {
    return $('-ios predicate string:(label CONTAINS[c] "Virtual" OR name CONTAINS[c] "Virtual" OR value CONTAINS[c] "Virtual")')
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

  private get orderPhysicalCardBtnAndroidByXpath() {
    return $('//*[@text="Order"]/ancestor::android.view.View[@clickable="true"][1]')
  }

  private get cardDesignScreenAndroid() {
    return $('android=new UiSelector().resourceId("cardDesignSelection_screen")')
  }

  private get otpInputAndroid() {
    return $('id=com.moneybase.qa:id/otp_input')
  }

  private get pinInputAndroidFocused() {
    return $('android=new UiSelector().className("android.widget.EditText").focused(true)')
  }

  private get pinInputAndroidFirst() {
    return $('android=new UiSelector().className("android.widget.EditText").instance(0)')
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

  private get closeButtonParentAndroid() {
    return $('//android.widget.TextView[@text="Close"]/parent::android.view.View[@clickable="true"]')
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

  private get physicalCardItemAndroid() {
    return $('(//*[contains(@text,"Physical") or contains(@content-desc,"Physical")]/ancestor::*[@clickable="true"][1])[1]')
  }

  private get activeCardItemAndroid() {
    return $('(//*[contains(@text,"Active") or contains(@content-desc,"Active")]/ancestor::*[@clickable="true"][1])[1]')
  }

  private get maskedCardItemAndroid() {
    return $('(//*[contains(@text,"****") or contains(@text,"••") or contains(@content-desc,"****") or contains(@content-desc,"••")]/ancestor::*[@clickable="true"][1])[1]')
  }

  private get physicalCardItemIOS() {
    return $('-ios class chain:**/XCUIElementTypeCell[`label CONTAINS "Physical" OR name CONTAINS "Physical"`]')
  }

  private get activeCardItemIOS() {
    return $('-ios class chain:**/XCUIElementTypeCell[`label CONTAINS "Active" OR name CONTAINS "Active"`]')
  }

  private get maskedCardItemIOS() {
    return $('-ios class chain:**/XCUIElementTypeCell[`label CONTAINS "****" OR name CONTAINS "****" OR label CONTAINS "••" OR name CONTAINS "••"`]')
  }

  private get cardSearchFieldIOS() {
    return $('-ios predicate string:type == "XCUIElementTypeSearchField" AND (label == "Search" OR name == "Search" OR value == "Search")')
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

  private async tapFirstIOSCandidate(candidates: Array<ReturnType<typeof $>>, label: string, timeoutMs = 20000) {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      for (const candidate of candidates) {
        const shown = await candidate.isDisplayed().catch(() => false)
        if (!shown) continue
        await this.tap(candidate)
        return
      }
      await browser.pause(500)
    }

    throw new Error(`${label} did not appear`)
  }

  private async tapIOSCenter(el: ReturnType<typeof $>, timeoutMs = 20000) {
    await el.waitForExist({ timeout: timeoutMs })
    const loc = await el.getLocation()
    const size = await el.getSize()
    await browser.execute('mobile: tap', {
      x: Math.round(loc.x + size.width / 2),
      y: Math.round(loc.y + size.height / 2),
    })
  }

  private async isCardTypeSelectionVisibleIOS() {
    const candidates = [
      this.physicalCardTypeIOS,
      this.physicalCardTypeIOSByContainer,
      this.physicalCardTypeIOSByText,
      this.virtualCardTypeIOSByText,
    ]

    for (const candidate of candidates) {
      const shown = await candidate.isDisplayed().catch(() => false)
      if (shown) return true
      const exists = await candidate.isExisting().catch(() => false)
      if (exists) return true
    }

    return false
  }

  private async waitForCardTypeSelectionIOS(timeoutMs = 3000) {
    return browser
      .waitUntil(async () => await this.isCardTypeSelectionVisibleIOS(), {
        timeout: timeoutMs,
        interval: 300,
      })
      .then(() => true)
      .catch(() => false)
  }

  private async typeOtpAndroid(value: string) {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    const candidates = [
      this.otpInputAndroid,
      this.pinInputAndroidFocused,
      this.pinInputAndroidFirst,
    ]

    await browser.waitUntil(
      async () => {
        for (const el of candidates) {
          if (await el.isDisplayed().catch(() => false)) return true
        }
        return false
      },
      {
        timeout: 20000,
        interval: 400,
        timeoutMsg: 'PIN/OTP input did not appear on Android',
      }
    )

    let target: ChainablePromiseElement | null = null
    for (const el of candidates) {
      if (await el.isDisplayed().catch(() => false)) {
        target = el
        break
      }
    }

    if (!target) {
      throw new Error('PIN/OTP input did not appear on Android')
    }

    await this.tap(target)
    await target.clearValue().catch(() => {})

    const typed = await target
      .setValue(value)
      .then(() => true)
      .catch(() => false)

    if (!typed) {
      await browser.execute('mobile: type', { text: value }).catch(() => {})
    }
  }

  private async closeCardSheetAndroid(timeoutMs = 60000) {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})
    await browser.waitUntil(
      async () => {
        const errorDialog = await $('android=new UiSelector().resourceId("com.moneybase.qa:id/alertTitle")').isDisplayed().catch(() => false)
        if (errorDialog) {
          await $('android=new UiSelector().resourceId("android:id/button1")').click().catch(() => {})
          return false
        }
        const closeSheetExists = await this.closeSheetAndroid.isDisplayed().catch(() => false)
        const closeSheetAltExists = await this.closeSheetAndroidByXpath.isDisplayed().catch(() => false)
        const closeButtonVisible = await this.closeButtonAndroid.isDisplayed().catch(() => false)
        const viewMyCardsVisible = await this.viewMyCardsBtnAndroid.isDisplayed().catch(() => false)
        const successVisible = await this.cardAddedSuccessTextAndroid.isDisplayed().catch(() => false)
        const cardsShown = await this.cardsRootAndroid.isDisplayed().catch(() => false)
        const freezeShown = await this.freezeButtonAndroid.isDisplayed().catch(() => false)
        const reportShown = await this.reportButtonAndroid.isDisplayed().catch(() => false)
        return closeSheetExists || closeSheetAltExists || closeButtonVisible || viewMyCardsVisible || successVisible || cardsShown || freezeShown || reportShown
      },
      {
        timeout: timeoutMs,
        interval: 500,
        timeoutMsg: 'Close sheet not visible in time',
      }
    )

    const tapCenter = async (el: ChainablePromiseElement) => {
      const target = await el
      const location = await target.getLocation()
      const size = await target.getSize()
      const x = Math.round(location.x + size.width / 2)
      const y = Math.round(location.y + size.height / 2)
      await browser.execute('mobile: clickGesture', { x, y }).catch(async () => {
        await target.click()
      })
    }

    let tappedControl = false
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const closeButtonParentVisible = await this.closeButtonParentAndroid.isDisplayed().catch(() => false)
      const closeButtonVisible = await this.closeButtonAndroid.isDisplayed().catch(() => false)
      const viewMyCardsVisible = await this.viewMyCardsBtnAndroid.isDisplayed().catch(() => false)
      const closeSheetVisible = await this.closeSheetAndroid.isDisplayed().catch(() => false)
      const closeSheetAltVisible = await this.closeSheetAndroidByXpath.isDisplayed().catch(() => false)
      const successVisible = await this.cardAddedSuccessTextAndroid.isDisplayed().catch(() => false)
      const cardsShown = await this.cardsRootAndroid.isDisplayed().catch(() => false)
      const freezeShown = await this.freezeButtonAndroid.isDisplayed().catch(() => false)
      const reportShown = await this.reportButtonAndroid.isDisplayed().catch(() => false)
      const addNewShown = await this.addNewCardBtnAndroid.isDisplayed().catch(() => false)

      if (!closeSheetVisible && !closeSheetAltVisible && !closeButtonParentVisible && !closeButtonVisible && !viewMyCardsVisible && !successVisible) {
        if (cardsShown || freezeShown || reportShown || addNewShown) return
      }

      if (closeButtonParentVisible) {
        await tapCenter(this.closeButtonParentAndroid)
        tappedControl = true
      } else if (closeButtonVisible) {
        await tapCenter(this.closeButtonAndroid)
        tappedControl = true
      } else if (viewMyCardsVisible) {
        await tapCenter(this.viewMyCardsBtnAndroid)
        tappedControl = true
      } else if (closeSheetVisible) {
        await tapCenter(this.closeSheetAndroid)
        tappedControl = true
      } else if (closeSheetAltVisible) {
        await tapCenter(this.closeSheetAndroidByXpath)
        tappedControl = true
      } else if (cardsShown || freezeShown || reportShown || addNewShown) {
        return
      } else if (!successVisible) {
        break
      }

      await browser.pause(1000)
    }

    if (!tappedControl) throw new Error('Close sheet controls not found')

    await browser.waitUntil(
      async () => {
        const closeSheetStill = await this.closeSheetAndroid.isDisplayed().catch(() => false)
        const closeSheetAltStill = await this.closeSheetAndroidByXpath.isDisplayed().catch(() => false)
        const closeButtonStill = await this.closeButtonAndroid.isDisplayed().catch(() => false)
        const viewMyCardsStill = await this.viewMyCardsBtnAndroid.isDisplayed().catch(() => false)
        const successStill = await this.cardAddedSuccessTextAndroid.isDisplayed().catch(() => false)
        const cardsShown = await this.cardsRootAndroid.isDisplayed().catch(() => false)
        const freezeShown = await this.freezeButtonAndroid.isDisplayed().catch(() => false)
        const reportShown = await this.reportButtonAndroid.isDisplayed().catch(() => false)
        const addNewShown = await this.addNewCardBtnAndroid.isDisplayed().catch(() => false)
        return !closeSheetStill && !closeSheetAltStill && !closeButtonStill && !viewMyCardsStill && !successStill && (cardsShown || freezeShown || reportShown || addNewShown)
      },
      {
        timeout: timeoutMs,
        interval: 500,
        timeoutMsg: 'Card sheet did not close in time',
      }
    )
  }

  private async cleanupExistingCardAndroid(timeoutMs = 20000) {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})
    const hasExistingCard = await browser.waitUntil(
      async () => {
        const freezeShown = await this.freezeButtonAndroid.isDisplayed().catch(() => false)
        const reportShown = await this.reportButtonAndroid.isDisplayed().catch(() => false)
        const addNewShown = await this.addNewCardBtnAndroid.isDisplayed().catch(() => false)
        if (freezeShown || reportShown) return true
        if (addNewShown) return false
        return false
      },
      {
        timeout: 8000,
        interval: 500,
        timeoutMsg: 'Card screen readiness timeout',
      }
    ).catch(() => false)

    if (!hasExistingCard) return

    await this.reportAndBlockCardAndroid(timeoutMs)
    await this.cardsRootAndroid.waitForDisplayed({ timeout: timeoutMs }).catch(() => {})
    await this.addNewCardBtnAndroid.waitForDisplayed({ timeout: timeoutMs }).catch(() => {})
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

  private async isIOSCardsSurfaceVisible() {
    if (!browser.isIOS) return false

    const addCardShown = await this.addNewCardBtnIOS.isDisplayed().catch(() => false)
    const freezeShown = await this.freezeButtonIOS.isDisplayed().catch(() => false)
    const unfreezeShown = await this.unfreezeButtonIOS.isDisplayed().catch(() => false)
    const physicalShown = await this.physicalCardItemIOS.isDisplayed().catch(() => false)
    const activeShown = await this.activeCardItemIOS.isDisplayed().catch(() => false)
    const maskedShown = await this.maskedCardItemIOS.isDisplayed().catch(() => false)

    return addCardShown || freezeShown || unfreezeShown || physicalShown || activeShown || maskedShown
  }

  private async getDisplayedIOSCardListItem(): Promise<WebdriverIO.Element | null> {
    if (!browser.isIOS) return null

    const explicitCandidates = [
      this.physicalCardItemIOS,
      this.activeCardItemIOS,
      this.maskedCardItemIOS,
    ]

    for (const candidate of explicitCandidates) {
      const shown = await candidate.isDisplayed().catch(() => false)
      if (shown) return (await candidate) as unknown as WebdriverIO.Element
    }

    const cells = await $$('-ios class chain:**/XCUIElementTypeCell')
    for (const cell of cells) {
      const shown = await cell.isDisplayed().catch(() => false)
      if (!shown) continue

      const label = await cell.getAttribute('label').catch(async () => await cell.getText().catch(() => ''))
      const name = await cell.getAttribute('name').catch(() => '')
      const descriptor = `${label} ${name}`.toLowerCase()

      if (!descriptor.trim()) continue
      if (descriptor.includes('search')) continue
      if (descriptor.includes('add') && descriptor.includes('card')) continue
      if (descriptor === 'cards') continue
      if (descriptor.includes('story position')) continue

      const looksLikeCard =
        descriptor.includes('physical') ||
        descriptor.includes('active') ||
        descriptor.includes('freeze') ||
        descriptor.includes('unfreeze') ||
        descriptor.includes('****') ||
        descriptor.includes('••')

      if (looksLikeCard) return cell
    }

    return null
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
      await this.tap(this.freezeButtonAndroid, timeoutMs)
      // Wait briefly for freeze to take effect before checking report button
      await browser.pause(1500)
    }

    const reportShown = await this.reportButtonAndroid.waitForDisplayed({ timeout: 10000 }).catch(() => false)

    // Fallback: if report button still not visible — navigate Home → Cards to force UI refresh
    if (!reportShown) {
      console.log('[PhysicalCard] report button not visible, navigating Home → Cards to refresh...')
      const homeTab = $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_button_home")')
      const homeTabA11y = $('~Home')
      if (await homeTab.isDisplayed().catch(() => false)) {
        await homeTab.click().catch(() => {})
      } else if (await homeTabA11y.isDisplayed().catch(() => false)) {
        await homeTabA11y.click().catch(() => {})
      }
      await this.homeRootAndroid.waitForDisplayed({ timeout: 10000 }).catch(() => {})
      await browser.pause(1000)
      await this.openCardsTabAndroid()
      await this.waitForFreezeReadyAndroid(timeoutMs)
      // After re-open, wait report directly (without tapping More)
      await this.reportButtonAndroid.waitForDisplayed({ timeout: timeoutMs })
    }

    await this.tap(this.reportButtonAndroid, timeoutMs)

    await this.blockButtonAndroid.waitForDisplayed({ timeout: timeoutMs })
    await this.tap(this.blockButtonAndroid, timeoutMs)

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

    const addNewShown = await this.addNewCardBtnAndroid.waitForDisplayed({ timeout: timeoutMs }).catch(() => false)
    if (addNewShown) return

    // Fallback: backend/card-state sync can lag; refresh Cards surface via Home tab
    console.log('[PhysicalCard] add new card not visible after deletion, navigating Home → Cards to refresh...')

    const homeTab = $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_button_home")')
    const homeTabA11y = $('~Home')

    if (await homeTab.isDisplayed().catch(() => false)) {
      await homeTab.click().catch(() => {})
    } else if (await homeTabA11y.isDisplayed().catch(() => false)) {
      await homeTabA11y.click().catch(() => {})
    }

    await this.homeRootAndroid.waitForDisplayed({ timeout: 10000 }).catch(() => {})
    await browser.pause(1000)

    await this.openCardsTabAndroidCurrentAccount()
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
    await this.openCardsTabAndroidCurrentAccount()
  }

  public async openCardsTabAndroidCurrentAccount() {
    if (!browser.isAndroid) return

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

  public async openActivePhysicalCardDetailsAndroid(timeoutMs = 60000) {
    if (!browser.isAndroid) return

    if (!(await this.cardsRootAndroid.isDisplayed().catch(() => false))) {
      await this.openCardsTabAndroidCurrentAccount()
    }

    await this.waitForSyncToFinishAndroid(timeoutMs)
    if (await this.freezeButtonAndroid.isDisplayed().catch(() => false)) return
    if (await this.unfreezeTextAndroid.isDisplayed().catch(() => false)) return

    const candidates = [
      this.physicalCardItemAndroid,
      this.activeCardItemAndroid,
      this.maskedCardItemAndroid,
    ]

    for (const candidate of candidates) {
      const shown = await candidate.waitForDisplayed({ timeout: 3000 }).catch(() => false)
      if (!shown) continue

      await this.tap(candidate)
      await this.waitForFreezeReadyAndroid(timeoutMs)
      return
    }

    throw new Error('Active physical card was not found on Android Cards screen')
  }

  public async freezeAndUnfreezeActivePhysicalCardAndroid(timeoutMs = 60000) {
    if (!browser.isAndroid) return

    await this.openActivePhysicalCardDetailsAndroid(timeoutMs)
    await this.waitForFreezeReadyAndroid(timeoutMs)

    const alreadyFrozen = await this.unfreezeTextAndroid.isDisplayed().catch(() => false)
    if (alreadyFrozen) {
      await this.tap(this.freezeButtonAndroid)
      await this.freezeTextAndroid.waitForDisplayed({ timeout: timeoutMs })
    }

    await this.freezeTextAndroid.waitForDisplayed({ timeout: timeoutMs })
    await this.tap(this.freezeButtonAndroid)
    await this.unfreezeTextAndroid.waitForDisplayed({ timeout: timeoutMs })

    await this.tap(this.freezeButtonAndroid)
    await this.unfreezeTextAndroid.waitForDisplayed({ reverse: true, timeout: timeoutMs }).catch(() => {})
    await this.freezeTextAndroid.waitForDisplayed({ timeout: timeoutMs })
  }

  public async openCardsTabIOS() {
    if (!browser.isIOS) return
    await this.ensureIndividualAccountIOS()
    await this.openCardsTabIOSCurrentAccount()
  }

  public async openCardsTabIOSCurrentAccount() {
    if (!browser.isIOS) return

    await browser.switchContext('NATIVE_APP').catch(() => {})
    if (await this.isIOSCardsSurfaceVisible()) return

    await this.cardsTabIOS.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.cardsTabIOS)
    await browser.waitUntil(
      async () => await this.isIOSCardsSurfaceVisible(),
      {
        timeout: 20000,
        interval: 500,
        timeoutMsg: 'Cards screen did not load on iOS',
      }
    )
  }

  public async openActivePhysicalCardDetailsIOS(timeoutMs = 60000) {
    if (!browser.isIOS) return

    await this.openCardsTabIOSCurrentAccount()
    await this.waitForSyncToFinishIOS(timeoutMs)
    if (await this.freezeButtonIOS.isDisplayed().catch(() => false)) return
    if (await this.unfreezeButtonIOS.isDisplayed().catch(() => false)) return
    if (await this.cardSearchFieldIOS.isDisplayed().catch(() => false)) {
      await browser.hideKeyboard().catch(() => {})
    }

    const cardItem = await this.getDisplayedIOSCardListItem()
    if (cardItem) {
      await cardItem.click()
      await this.waitForFreezeReadyIOS(timeoutMs)
      return
    }

    throw new Error('Active physical card was not found on iOS Cards screen')
  }

  public async freezeAndUnfreezeActivePhysicalCardIOS(timeoutMs = 60000) {
    if (!browser.isIOS) return

    await this.openActivePhysicalCardDetailsIOS(timeoutMs)
    await this.waitForFreezeReadyIOS(timeoutMs)

    const alreadyFrozen = await this.unfreezeButtonIOS.isDisplayed().catch(() => false)
    if (alreadyFrozen) {
      await this.tap(this.unfreezeButtonIOS)
      await this.freezeButtonIOS.waitForDisplayed({ timeout: timeoutMs })
    }

    await this.freezeButtonIOS.waitForDisplayed({ timeout: timeoutMs })
    await this.tap(this.freezeButtonIOS)
    await this.unfreezeButtonIOS.waitForDisplayed({ timeout: timeoutMs })

    await this.tap(this.unfreezeButtonIOS)
    await this.unfreezeButtonIOS.waitForDisplayed({ reverse: true, timeout: timeoutMs }).catch(() => {})
    await this.freezeButtonIOS.waitForDisplayed({ timeout: timeoutMs })
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

    await browser.switchContext('NATIVE_APP').catch(() => {})
    await this.addNewCardBtnIOS.waitForExist({ timeout: 20000 }).catch(() => {})

    const candidates = [
      this.addNewCardTextIOS,
      this.addNewCardPlusIOS,
      this.addNewCardBtnIOS,
      this.addNewCardBtnIOSByText,
    ]

    for (let attempt = 0; attempt < 2; attempt++) {
      for (const candidate of candidates) {
        const exists = await candidate.isExisting().catch(() => false)
        if (!exists) continue

        await this.tapIOSCenter(candidate, 3000).catch(async () => {
          await this.tap(candidate).catch(() => {})
        })

        if (await this.waitForCardTypeSelectionIOS(4000)) return
      }
    }

    await this.debugSnapshot('physical-card-ios-add-card-not-opened')
    throw new Error('[PhysicalCard][iOS] Add Card did not open card type selection; backend/card eligibility issue')
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
    await this.tapFirstIOSCandidate(
      [
        this.physicalCardTypeIOS,
        this.physicalCardTypeIOSByContainer,
        this.physicalCardTypeIOSByText,
      ],
      'Physical card type (iOS)',
      20000
    )
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
    await browser.switchContext('NATIVE_APP').catch(() => {})

    const canConfirmDesign = await this.confirmDesignBtnAndroid
      .waitForDisplayed({ timeout: 20000 })
      .then(() => true)
      .catch(() => false)

    if (canConfirmDesign) {
      await this.tap(this.confirmDesignBtnAndroid)
      await browser.pause(500)
    }

    const canOrderByText = await this.orderPhysicalCardBtnAndroid
      .waitForDisplayed({ timeout: 10000 })
      .then(() => true)
      .catch(() => false)
    const canOrderByXpath = await this.orderPhysicalCardBtnAndroidByXpath.isDisplayed().catch(() => false)

    if (canOrderByXpath) {
      await this.tap(this.orderPhysicalCardBtnAndroidByXpath)
    } else if (canOrderByText) {
      await this.tap(this.orderPhysicalCardBtnAndroid)
    }

    await browser.waitUntil(
      async () => {
        const confirmAddress = await this.confirmAddressBtnAndroid.isDisplayed().catch(() => false)
        const otpShown = await this.otpInputAndroid.isDisplayed().catch(() => false)
        const addressLineShown = await this.addressLine1Android.isDisplayed().catch(() => false)
        const stillOnDesign = await this.cardDesignScreenAndroid.isDisplayed().catch(() => false)
        return confirmAddress || otpShown || addressLineShown || !stillOnDesign
      },
      {
        timeout: 20000,
        interval: 500,
        timeoutMsg: 'Physical card flow did not move past card design screen',
      }
    )

    const stillOnDesign = await this.cardDesignScreenAndroid.isDisplayed().catch(() => false)
    if (stillOnDesign) {
      const retryOrderByXpath = await this.orderPhysicalCardBtnAndroidByXpath.isDisplayed().catch(() => false)
      if (retryOrderByXpath) {
        await this.tap(this.orderPhysicalCardBtnAndroidByXpath)
      } else if (await this.orderPhysicalCardBtnAndroid.isDisplayed().catch(() => false)) {
        await this.tap(this.orderPhysicalCardBtnAndroid)
      }
    }
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
    const n = Math.floor(Math.random() * 900) + 1
    const pc = Math.floor(Math.random() * 90) + 1000
    const {
      address1 = `Triq it-Torri ${n}`,
      address2 = `Apt ${n}`,
      city = 'Valletta',
      postCode = `VLT ${pc}`,
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
    const n = Math.floor(Math.random() * 900) + 1
    const pc = Math.floor(Math.random() * 90) + 1000
    const {
      address1 = `Triq it-Torri ${n}`,
      address2 = `Apt ${n}`,
      city = 'Valletta',
      postCode = `VLT ${pc}`,
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
    await this.cleanupExistingCardAndroid(30000)
    await this.startAddNewCardAndroid()
    await this.choosePhysicalCardTypeAndroid()
    await this.confirmPhysicalCardAndroid()
    await this.fillDeliveryAddressAndroid()
    await this.confirmDeliveryAddressAndroid()
    await this.createPinAndroid(pin)
    await this.reenterPinAndroid(pin)
    await this.enterOtpAndroid(otp)
    await this.closeCardSheetAndroid()
    await this.reportAndBlockCardAndroid(30000)
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

export default new PhysicalCardCreationPage()
