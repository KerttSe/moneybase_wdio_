import BasePage from './BasePage'
import { $, $$, browser } from '@wdio/globals'
import OtpHelper from '../helpers/otp.helper'

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
    return $('-ios predicate string:name == "cards_screen" OR name == "cards_screen_view" OR name BEGINSWITH "CARDS_" OR name == "card_item_addCard" OR name CONTAINS "cards_"')
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
    return $('~card_item_addCard')
  }

  private get businessCardFormIOS() {
    return $('-ios predicate string:name == "assignBusinessCard_screen" OR name BEGINSWITH "assignBusinessCard_" OR name CONTAINS "assignBusinessCard" OR name == "Assign Card" OR label == "Assign Card"')
  }

  private get cardDesignScreenIOS() {
    return $('-ios predicate string:name == "cardDesignSelection_screen" OR name BEGINSWITH "cardDesignSelection_" OR name CONTAINS "cardDesignSelection"')
  }

  private get cardDetailsRootIOS() {
    return $('-ios predicate string:name == "cards_details_screen" OR name == "cardDetails_screen" OR name CONTAINS "cardDetails"')
  }

  private get cardDetailsPasscodeGateIOS() {
    return $('-ios predicate string:name == "Current Passcode" OR label == "Current Passcode" OR name == "Enter your passcode to view card details" OR label == "Enter your passcode to view card details"')
  }

  private get cardVerificationTitleIOS() {
    return $('-ios predicate string:name == "Verification" OR label == "Verification"')
  }

  private get cardVerificationOtpFirstSlotIOS() {
    return $('//XCUIElementTypeTextField[starts-with(@name, "OTP_entry_")][1]')
  }

  private get cardVerificationOtpLastSlotIOS() {
    return $('//XCUIElementTypeTextField[@name="OTP_entry_5"]')
  }

  private get cardVerificationOtpContainerIOS() {
    return $('-ios predicate string:name == "otp_input" OR name == "OTP_entry_0"')
  }

  private get cardVerificationContinueIOS() {
    return $('~Continue')
  }

  private iosKeypadDigit(digit: string) {
    return $(`-ios predicate string:type == "XCUIElementTypeOther" AND name == "loginKeyPad_${digit}"`)
  }

  private get activateMyCardBtnIOS() {
    return $('-ios predicate string:name == "Activate my card" OR label == "Activate my card" OR name CONTAINS[c] "activate my card" OR label CONTAINS[c] "activate my card"')
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

  private get firstCardCellIOS() {
    return $('(//XCUIElementTypeCell[not(.//*[@name="card_item_addCard" or @label="Add Card" or @name="Add Card" or contains(@name,"addNewCard") or contains(@label,"Add Card")])])[1]')
  }

  private get physicalCardCellIOS() {
    return $('//XCUIElementTypeStaticText[contains(@name,"Physical") or contains(@label,"Physical") or contains(@value,"Physical")]/ancestor::XCUIElementTypeCell[1]')
  }

  private get physicalCardContainerIOS() {
    return $('//XCUIElementTypeStaticText[contains(@name,"Physical") or contains(@label,"Physical") or contains(@value,"Physical")]/ancestor::XCUIElementTypeOther[3]')
  }

  private get createdCardNameIOS() {
    return $('~cards_label_cardName')
  }

  private get createdCardNameCellIOS() {
    return $('//XCUIElementTypeStaticText[@name="cards_label_cardName" or contains(@label,"MONEYBASE CARD") or contains(@value,"MONEYBASE CARD")]/ancestor::XCUIElementTypeCell[1]')
  }

  private get cardsNavTitleIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Cards"] | //XCUIElementTypeNavigationBar//XCUIElementTypeStaticText[@name="Cards" or @label="Cards"]')
  }

  private async isIOSCardsSurfaceVisible() {
    if (!browser.isIOS) return false

    return (
      (await this.cardsRootIOS.isExisting().catch(() => false)) ||
      (await this.addNewCardButtonIOS.isExisting().catch(() => false)) ||
      (await this.cardDetailsRootIOS.isExisting().catch(() => false)) ||
      (await this.activateMyCardBtnIOS.isExisting().catch(() => false)) ||
      (await this.physicalCardItemIOS.isExisting().catch(() => false)) ||
      (await this.activeCardItemIOS.isExisting().catch(() => false)) ||
      (await this.maskedCardItemIOS.isExisting().catch(() => false)) ||
      (await this.createdCardNameIOS.isExisting().catch(() => false))
    )
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
      await browser.waitUntil(
        async () => await this.isIOSAssignBusinessCardFormVisible(),
        { timeout: 15000, interval: 500, timeoutMsg: 'Assign Business Card form did not open on iOS' }
      )
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
    return $('//XCUIElementTypeStaticText[@name="Physical Card" or @label="Physical Card" or @value="Physical Card"]/ancestor::XCUIElementTypeCell[1]')
  }

  private get cardTypeHeaderIOS() {
    return $('-ios predicate string:name == "Card Type" OR label == "Card Type" OR name == "CARD TYPE" OR label == "CARD TYPE"')
  }

  private get cardAssigneeRowAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/assignBusinessCard_button_selectUser$|^assignBusinessCard_button_selectUser$")')
  }

  private get cardAssigneeRowIOS() {
    return $('//XCUIElementTypeStaticText[@name="Las Vegas" or @label="Las Vegas" or @value="Las Vegas"]/ancestor::XCUIElementTypeCell[1]')
  }

  private get cardAssigneeSelectedRowIOS() {
    return $('//XCUIElementTypeCell[@name="Card Assignee" or @label="Card Assignee"]/following-sibling::XCUIElementTypeCell[1]')
  }

  private get cardAssigneeLasVegasSelectedIOS() {
    return $('//XCUIElementTypeCell[@name="Card Assignee" or @label="Card Assignee"]/following-sibling::XCUIElementTypeCell[1]//XCUIElementTypeStaticText[@name="Las Vegas" or @label="Las Vegas" or @value="Las Vegas"]')
  }

  private get userSelectionTitleIOS() {
    return $('-ios predicate string:name == "Select User" OR label == "Select User" OR name == "Select user" OR label == "Select user"')
  }

  private get lasVegasUserOptionIOS() {
    return $('//XCUIElementTypeStaticText[@name="Las Vegas" or @label="Las Vegas" or @value="Las Vegas"]/ancestor::XCUIElementTypeCell[1]')
  }

  private get lasVegasUserTextIOS() {
    return $('-ios predicate string:name == "Las Vegas" OR label == "Las Vegas" OR value == "Las Vegas"')
  }

  private get continueBtnAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/assignBusinessCard_button_continue$|^assignBusinessCard_button_continue$")')
  }

  private get continueBtnIOS() {
    return $('//XCUIElementTypeButton[@name="addCardDesign_button_order" and @label="Continue"] | //XCUIElementTypeStaticText[@name="Continue" and @label="Continue" and @y>700]')
  }

  private get continueBtnA11yIOS() {
    return $('~addCardDesign_button_order')
  }

  private get cardDesignOrderBtnAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/cardDesignSelection_button_confirm$|^cardDesignSelection_button_confirm$")')
  }

  private get cardDesignOrderBtnIOS() {
    return $('//XCUIElementTypeButton[@name="addCardDesign_button_order" and @label="Continue"] | //XCUIElementTypeStaticText[@name="Continue" and @label="Continue" and @y>700]')
  }

  private get assignCardSubmitBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Assign Card"]]')
  }

  private get assignCardSubmitBtnIOS() {
    return $('//XCUIElementTypeButton[(@name="Confirm" or @label="Confirm" or @name="Get Physical Card" or @label="Get Physical Card") and @y>600] | //XCUIElementTypeStaticText[(@name="Confirm" or @label="Confirm" or @value="Confirm" or @name="Get Physical Card" or @label="Get Physical Card" or @value="Get Physical Card") and @y>700]')
  }

  private get assignCardPostSubmitAnchorIOS() {
    return $('-ios predicate string:(name CONTAINS[c] "card" OR label CONTAINS[c] "card") AND (name CONTAINS[c] "success" OR label CONTAINS[c] "success" OR name CONTAINS[c] "assigned" OR label CONTAINS[c] "assigned" OR name CONTAINS[c] "added" OR label CONTAINS[c] "added")')
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

  private get changeCardTypeConfirmSheetBtnIOS() {
    return $('//XCUIElementTypeStaticText[@name="Confirm" or @label="Confirm" or @value="Confirm"]/ancestor::XCUIElementTypeOther[2]')
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
    return $('//XCUIElementTypeStaticText[@name="Physical Card" or @label="Physical Card" or @value="Physical Card"]/ancestor::XCUIElementTypeCell[1]')
  }

  private get physicalCardOptionContainerIOS() {
    return $('//XCUIElementTypeStaticText[contains(@name,"Physical") or contains(@label,"Physical") or contains(@value,"Physical")]/ancestor::XCUIElementTypeOther[2]')
  }

  private get cardTypeSelectionCloseBtnIOS() {
    return $('//XCUIElementTypeButton[@name="Close" or @label="Close" or contains(@name,"close") or contains(@label,"close") or contains(@name,"Close") or contains(@label,"Close")]')
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
    return $('-ios predicate string:name == "Card assigned successfully" OR label == "Card assigned successfully" OR name == "Card added successfully" OR label == "Card added successfully" OR name CONTAINS[c] "assigned successfully" OR label CONTAINS[c] "assigned successfully" OR name CONTAINS[c] "added successfully" OR label CONTAINS[c] "added successfully"')
  }

  private get successCloseBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Close"]]')
  }

  private get successCloseBtnIOS() {
    return $('-ios predicate string:name == "Close" OR label == "Close" OR name == "Done" OR label == "Done"')
  }

  private get assignCardSheetCloseBtnIOS() {
    return $('//XCUIElementTypeButton[@name="close" or @label="close" or @name="Close" or @label="Close" or contains(@name,"close") or contains(@label,"close")]')
  }

  private async isIOSAssignBusinessCardFormVisible() {
    if (!browser.isIOS) return false

    return (
      (await this.businessCardFormIOS.isExisting().catch(() => false)) ||
      (await this.cardTypeHeaderIOS.isExisting().catch(() => false)) ||
      (await this.cardTypeRowIOS.isExisting().catch(() => false)) ||
      (await this.cardAssigneeRowIOS.isExisting().catch(() => false)) ||
      (await this.continueBtnIOS.isExisting().catch(() => false))
    )
  }

  private async isIOSCardTypeSelectionVisible() {
    if (!browser.isIOS) return false

    return (
      (await this.cardTypeSelectionTitleIOS.isExisting().catch(() => false))
    )
  }

  private async isIOSPhysicalCardTypeOptionAvailable() {
    if (!browser.isIOS) return false

    return (
      (await this.cardTypeSelectionTitleIOS.isExisting().catch(() => false)) ||
      (await this.physicalCardOptionIOS.isExisting().catch(() => false))
    )
  }

  private async isIOSPhysicalCardTypeSelected() {
    if (!browser.isIOS) return false

    return (
      (await this.isIOSAssignBusinessCardFormVisible()) &&
      (await this.continueBtnIOS.isExisting().catch(() => false))
    )
  }

  private async tapIOSCenter(el: any, timeoutMs = 10000) {
    await el.waitForExist({ timeout: timeoutMs })
    const location = await el.getLocation()
    const size = await el.getSize()
    await browser.execute('mobile: tap', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    })
  }

  private async closeIOSCardTypeSelection() {
    if (!browser.isIOS || !(await this.isIOSCardTypeSelectionVisible())) return

    const screen = await browser.getWindowSize()
    const closeButtons = await $$(
      '//XCUIElementTypeButton[@name="Close" or @label="Close" or contains(@name,"close") or contains(@label,"close") or contains(@name,"Close") or contains(@label,"Close")]'
    )

    for (const button of closeButtons) {
      const exists = await button.isExisting().catch(() => false)
      if (!exists) continue

      const location = await button.getLocation().catch(() => undefined)
      const size = await button.getSize().catch(() => undefined)
      if (!location || !size) continue

      const isTopRightClose = location.x >= screen.width * 0.55 && location.y <= screen.height * 0.25
      if (!isTopRightClose) continue

      await this.tapIOSCenter(button, 3000).catch(async () => {
        await button.click().catch(() => {})
      })
      await browser.pause(800)
      if ((await this.isIOSAssignBusinessCardFormVisible()) || !(await this.isIOSCardTypeSelectionVisible())) return
    }

    if (await this.cardTypeSelectionCloseBtnIOS.isExisting().catch(() => false)) {
      await this.tapIOSCenter(this.cardTypeSelectionCloseBtnIOS, 3000).catch(async () => {
        await this.tap(this.cardTypeSelectionCloseBtnIOS, 3000).catch(() => {})
      })
      await browser.pause(800)
    }

    if (await this.isIOSCardTypeSelectionVisible()) {
      await this.tapScreenPointIOS(0.92, 0.11, 'business-card-type-close-ios').catch(() => {})
      await browser.pause(800)
      if (await this.isIOSAssignBusinessCardFormVisible()) return
    }

    if (await this.isIOSCardTypeSelectionVisible()) {
      await this.tapScreenPointIOS(0.92, 0.18, 'business-card-type-close-ios-fallback').catch(() => {})
      await browser.pause(800)
    }
  }

  private async closeIOSAssignCardSheetIfPresent() {
    if (!browser.isIOS) return

    const assignSheetOpen =
      (await this.businessCardFormIOS.isExisting().catch(() => false)) ||
      (await this.assignCardSubmitBtnIOS.isExisting().catch(() => false))
    if (!assignSheetOpen) return

    const cardsBehind =
      (await this.cardsRootIOS.isExisting().catch(() => false)) ||
      (await this.createdCardNameIOS.isExisting().catch(() => false)) ||
      (await this.addNewCardButtonIOS.isExisting().catch(() => false))
    if (!cardsBehind) return

    const screen = await browser.getWindowSize()
    const closeButtons = await $$(
      '//XCUIElementTypeButton[@name="close" or @label="close" or @name="Close" or @label="Close" or contains(@name,"close") or contains(@label,"close")]'
    )

    for (const button of closeButtons) {
      const exists = await button.isExisting().catch(() => false)
      if (!exists) continue

      const location = await button.getLocation().catch(() => undefined)
      const size = await button.getSize().catch(() => undefined)
      if (!location || !size) continue

      const isTopRightClose = location.x >= screen.width * 0.55 && location.y <= screen.height * 0.25
      if (!isTopRightClose) continue

      await this.tapIOSCenter(button, 3000).catch(async () => {
        await button.click().catch(() => {})
      })
      await browser.pause(1000)
      break
    }

    if (await this.businessCardFormIOS.isExisting().catch(() => false)) {
      await this.tapIOSCenter(this.assignCardSheetCloseBtnIOS, 3000).catch(async () => {
        await this.tapScreenPointIOS(0.92, 0.11, 'assign-card-sheet-close-ios').catch(() => {})
      })
      await browser.pause(1000)
    }

    await browser.waitUntil(
      async () => !(await this.businessCardFormIOS.isExisting().catch(() => false)),
      { timeout: 7000, interval: 500 }
    ).catch(() => {})
  }

  private async isIOSCardDetailsReady() {
    if (!browser.isIOS) return false

    return await this.cardDetailsRootIOS.isExisting().catch(() => false)
  }

  private async isIOSCardDetailsActionsReady() {
    if (!browser.isIOS) return false

    return (
      (await this.freezeBtnIOS.isExisting().catch(() => false)) ||
      (await this.freezeLabelIOS.isExisting().catch(() => false)) ||
      (await this.unfreezeBtnIOS.isExisting().catch(() => false)) ||
      (await this.unfreezeLabelIOS.isExisting().catch(() => false)) ||
      (await this.moreBtnIOS.isExisting().catch(() => false)) ||
      (await this.blockBtnIOS.isExisting().catch(() => false)) ||
      (await this.reportBtnIOS.isExisting().catch(() => false)) ||
      (await this.reportLabelIOS.isExisting().catch(() => false))
    )
  }

  private async isIOSCardVerificationOtpVisible() {
    if (!browser.isIOS) return false

    return (
      (await this.cardVerificationOtpContainerIOS.isExisting().catch(() => false)) ||
      ((await this.cardVerificationTitleIOS.isExisting().catch(() => false)) &&
        (await this.cardVerificationOtpFirstSlotIOS.isExisting().catch(() => false)))
    )
  }

  private async getIOSCardVerificationOtp() {
    const explicitOtp = process.env.BUSINESS_CARD_OTP || process.env.CARD_CREATION_OTP || process.env.CARD_OTP
    if (explicitOtp) return explicitOtp.replace(/\D/g, '').slice(0, 6)

    const phone =
      process.env.BUSINESS_CARD_OTP_PHONE ||
      process.env.CARD_CREATION_OTP_PHONE ||
      process.env.OTP_PHONE ||
      process.env.MB_PHONE ||
      ''
    if (!phone) return '000000'

    const fetchDelayMs = Number(process.env.BUSINESS_CARD_OTP_FETCH_DELAY_MS || process.env.OTP_FETCH_DELAY_MS || 0)
    if (Number.isFinite(fetchDelayMs) && fetchDelayMs > 0) {
      await browser.pause(Math.floor(fetchDelayMs))
    }

    return OtpHelper.getLatestOtp({
      phone,
      timeoutMs: Number(process.env.BUSINESS_CARD_OTP_TIMEOUT_MS || process.env.OTP_TIMEOUT_MS || 90000),
      intervalMs: Number(process.env.BUSINESS_CARD_OTP_POLL_INTERVAL_MS || process.env.OTP_POLL_INTERVAL_MS || 2000),
      maxRequests: Number(process.env.BUSINESS_CARD_OTP_MAX_REQUESTS || 1),
    })
  }

  private async completeIOSCardVerificationIfNeeded(waitForAfterOtp?: () => Promise<boolean>) {
    if (!browser.isIOS || !(await this.isIOSCardVerificationOtpVisible())) return false

    const otp = (await this.getIOSCardVerificationOtp()).replace(/\D/g, '').slice(0, 6)
    if (otp.length !== 6) throw new Error(`Invalid iOS card verification OTP: ${otp}`)

    const firstSlot = this.cardVerificationOtpFirstSlotIOS
    await firstSlot.waitForExist({ timeout: 15000 })
    await firstSlot.click()
    await firstSlot.clearValue().catch(() => {})
    await firstSlot.addValue(otp).catch(async () => {
      for (const digit of otp) {
        await firstSlot.addValue(digit)
      }
    })

    const filled = await browser
      .waitUntil(
        async () => /\d/.test(String(await this.cardVerificationOtpLastSlotIOS.getAttribute('value').catch(() => ''))),
        { timeout: 3000, interval: 200 }
      )
      .catch(() => false)

    if (!filled) {
      await firstSlot.click().catch(() => {})
      await firstSlot.clearValue().catch(() => {})
      for (const digit of otp) {
        await firstSlot.addValue(digit).catch(() => {})
      }
    }

    const continueExists = await this.cardVerificationContinueIOS.isExisting().catch(() => false)
    if (continueExists) {
      await this.tapIOSCenter(this.cardVerificationContinueIOS, 3000).catch(async () => {
        await this.cardVerificationContinueIOS.click().catch(() => {})
      })
    }

    await browser.waitUntil(
      async () => {
        if (waitForAfterOtp && (await waitForAfterOtp())) return true
        if (await this.isIOSCardDetailsActionsReady()) return true
        if (await this.isIOSCreatedCardListVisible()) return true
        if (await this.cardAssignedSuccessTitleIOS.isExisting().catch(() => false)) return true
        return waitForAfterOtp ? false : !(await this.isIOSCardVerificationOtpVisible())
      },
      { timeout: 30000, interval: 500, timeoutMsg: 'Card verification OTP did not complete on iOS' }
    )
    return true
  }

  private async unlockIOSCardDetailsIfNeeded() {
    if (!browser.isIOS) return false

    const gateShown = await this.cardDetailsPasscodeGateIOS.isExisting().catch(() => false)
    if (!gateShown) return false

    const pin = process.env.MB_PIN || '2468'
    for (const digit of pin) {
      const keypadDigit = this.iosKeypadDigit(digit)
      await keypadDigit.waitForExist({ timeout: 5000 })
      await keypadDigit.click()
    }

    await browser.waitUntil(
      async () => {
        if (await this.completeIOSCardVerificationIfNeeded(async () => await this.isIOSCardDetailsActionsReady())) {
          return await this.isIOSCardDetailsActionsReady()
        }
        return await this.isIOSCardDetailsActionsReady()
      },
      { timeout: 20000, interval: 500, timeoutMsg: 'Card details actions did not appear after entering passcode on iOS' }
    )
    return true
  }

  private async openCreatedCardDetailsFromIOSList() {
    if (!browser.isIOS || (await this.isIOSCardDetailsActionsReady())) return

    if (await this.cardDetailsPasscodeGateIOS.isExisting().catch(() => false)) {
      await this.unlockIOSCardDetailsIfNeeded()
      return
    }

    if (await this.isIOSCardTypeSelectionVisible()) {
      await this.closeIOSCardTypeSelection()
    }

    if (await this.isIOSAssignBusinessCardFormVisible()) {
      await this.closeIOSAssignCardSheetIfPresent()
    }

    if (await this.tapIOSCreatedCardArtworkFromName()) return

    const cardAnchors = [
      this.activateMyCardBtnIOS,
      this.createdCardNameCellIOS,
      this.createdCardNameIOS,
      this.firstCardCellIOS,
      this.maskedCardItemIOS,
      this.activeCardItemIOS,
    ]

    for (const anchor of cardAnchors) {
      const exists = await anchor.isExisting().catch(() => false)
      if (!exists) continue

      await this.tapIOSCardListAnchor(anchor).catch(async () => {
        await this.tap(anchor, 3000).catch(() => {})
      })
      await browser.pause(1000)

      if (await this.unlockIOSCardDetailsIfNeeded()) return
      if (await this.completeIOSCardVerificationIfNeeded(async () => await this.isIOSCardDetailsActionsReady())) return
      if (await this.isIOSCardDetailsActionsReady()) return
    }
  }

  private async tapIOSCreatedCardArtworkFromName() {
    if (!(await this.createdCardNameIOS.isExisting().catch(() => false))) return false

    const location = await this.createdCardNameIOS.getLocation().catch(() => undefined)
    const size = await this.createdCardNameIOS.getSize().catch(() => undefined)
    const screen = await browser.getWindowSize()
    if (!location || !size) return false

    const centerX = Math.round(screen.width * 0.5)
    const cardMidY = Math.max(120, Math.round(location.y - 80))
    const points = [
      { x: centerX, y: cardMidY },
      { x: Math.round(screen.width * 0.35), y: cardMidY },
      { x: Math.round(screen.width * 0.65), y: cardMidY },
      { x: centerX, y: Math.max(120, Math.round(location.y - 120)) },
      { x: centerX, y: Math.max(120, Math.round(location.y - 45)) },
      { x: Math.round(location.x + size.width / 2), y: Math.round(location.y + size.height / 2) },
    ]

    for (const point of points) {
      await browser.execute('mobile: tap', point)
      await browser.pause(900)
      if (await this.unlockIOSCardDetailsIfNeeded()) return true
      if (await this.completeIOSCardVerificationIfNeeded(async () => await this.isIOSCardDetailsActionsReady())) return true
      if (await this.isIOSCardDetailsActionsReady()) return true
    }

    return false
  }

  private async tapIOSCardListAnchor(anchor: any) {
    const location = await anchor.getLocation()
    const size = await anchor.getSize()
    const screen = await browser.getWindowSize()
    const y = Math.round(location.y + Math.max(8, Math.min(size.height / 2, 44)))

    const points = [
      { x: Math.round(location.x + size.width / 2), y },
      { x: Math.round(screen.width * 0.5), y },
      { x: Math.round(screen.width * 0.82), y },
    ]

    for (const point of points) {
      await browser.execute('mobile: tap', point)
      await browser.pause(700)
      if (await this.unlockIOSCardDetailsIfNeeded()) return
      if (await this.completeIOSCardVerificationIfNeeded(async () => await this.isIOSCardDetailsActionsReady())) return
      if (await this.isIOSCardDetailsActionsReady()) return
    }
  }

  private async isIOSAssignmentCompleted() {
    if (!browser.isIOS) return false

    return (
      (await this.cardAssignedSuccessTitleIOS.isExisting().catch(() => false)) ||
      (await this.assignCardPostSubmitAnchorIOS.isExisting().catch(() => false)) ||
      (await this.successCloseBtnIOS.isExisting().catch(() => false)) ||
      (await this.viewMyCardsBtnIOS.isExisting().catch(() => false)) ||
      (await this.isIOSCardDetailsActionsReady()) ||
      (await this.isIOSCreatedCardListVisible())
    )
  }

  private async isIOSAssignCardSubmitCompleted() {
    if (!browser.isIOS) return false

    return (
      (await this.cardAssignedSuccessTitleIOS.isExisting().catch(() => false)) ||
      (await this.assignCardPostSubmitAnchorIOS.isExisting().catch(() => false)) ||
      (await this.successCloseBtnIOS.isExisting().catch(() => false)) ||
      (await this.viewMyCardsBtnIOS.isExisting().catch(() => false)) ||
      (await this.isIOSCardDetailsReady()) ||
      (await this.isIOSCreatedCardListVisible())
    )
  }

  private async isIOSCardDesignScreenVisible() {
    if (!browser.isIOS) return false

    return (
      (await this.cardDesignScreenIOS.isExisting().catch(() => false)) ||
      (await this.cardDesignOrderBtnIOS.isExisting().catch(() => false))
    )
  }

  private async isIOSCreatedCardListVisible() {
    if (!browser.isIOS) return false

    if (
      (await this.isIOSAssignBusinessCardFormVisible()) ||
      (await this.isIOSCardDesignScreenVisible())
    ) {
      return false
    }

    if (await this.activateMyCardBtnIOS.isExisting().catch(() => false)) return true
    if (await this.createdCardNameIOS.isExisting().catch(() => false)) return true
    if (await this.isIOSCardDetailsActionsReady()) return true

    return (
      (await this.isIOSCardsSurfaceVisible()) &&
      !(await this.isIOSAssignBusinessCardFormVisible()) &&
      !(await this.isIOSCardDesignScreenVisible())
    )
  }

  private async isIOSCreatedCardRemovalConfirmed() {
    if (!browser.isIOS) return false

    return (
      (await this.isIOSCardsListSurfaceVisible()) &&
      !(await this.isIOSCardDetailsActionsReady()) &&
      !(await this.activateMyCardBtnIOS.isExisting().catch(() => false)) &&
      !(await this.cardBlockedTitleIOS.isExisting().catch(() => false))
    )
  }

  private async isIOSCardsListSurfaceVisible() {
    if (!browser.isIOS) return false

    return (
      (await this.addNewCardButtonIOS.isExisting().catch(() => false)) ||
      ((await this.cardsNavTitleIOS.isExisting().catch(() => false)) &&
        (await this.createdCardNameIOS.isExisting().catch(() => false)))
    )
  }

  private async ensureIOSCardDetailsActionsReady(timeout = 20000) {
    if (!browser.isIOS) return

    await browser.waitUntil(
      async () => {
        if (await this.isIOSCardDetailsActionsReady()) return true
        await this.openCreatedCardDetailsFromIOSList()
        return await this.isIOSCardDetailsActionsReady()
      },
      { timeout, interval: 1000, timeoutMsg: 'Created card details actions were not available on iOS' }
    )
  }

  private async isIOSAfterContinueStateVisible() {
    if (!browser.isIOS) return false

    if (await this.isIOSCardDesignScreenVisible()) return true
    if (await this.assigneeAddressTitleIOS.isExisting().catch(() => false)) return true
    if (await this.isIOSAssignCardSubmitReady()) return true

    return this.isIOSCreatedCardListVisible()
  }

  private async isIOSAssignCardSubmitReady() {
    if (!browser.isIOS) return false

    return (
      (await this.assignCardSubmitBtnIOS.isExisting().catch(() => false))
    )
  }

  private async tapIOSAssignCardSubmit() {
    await this.assignCardSubmitBtnIOS.waitForExist({ timeout: 15000 })
    await this.tapIOSCenter(this.assignCardSubmitBtnIOS, 3000).catch(async () => {
      await this.tap(this.assignCardSubmitBtnIOS, 3000)
    })
    await browser.waitUntil(
      async () => await this.isIOSAssignCardSubmitCompleted(),
      { timeout: 30000, interval: 500, timeoutMsg: 'Assign Card submit did not advance on iOS' }
    )
  }

  private async tapIOSContinueAndWaitForNextStep() {
    const candidates = [
      this.continueBtnA11yIOS,
      this.continueBtnIOS,
    ]

    for (const candidate of candidates) {
      const exists = await candidate.isExisting().catch(() => false)
      if (!exists) continue

      await this.tapIOSCenter(candidate, 3000).catch(async () => {
        await this.tap(candidate, 3000).catch(() => {})
      })

      const opened = await browser.waitUntil(
        async () => await this.isIOSAfterContinueStateVisible(),
        { timeout: 3000, interval: 500 }
      ).catch(() => false)
      if (opened) return true
    }

    return false
  }

  public async openCardTypeSelection() {
    if (browser.isIOS) {
      await this.cardTypeRowIOS.waitForExist({ timeout: 15000 })
      await this.tap(this.cardTypeRowIOS)
      const confirmShown = await this.changeCardTypeTitleIOS.waitForExist({ timeout: 5000 }).catch(() => false)
      if (confirmShown) {
        if (await this.changeCardTypeConfirmSheetBtnIOS.isExisting().catch(() => false)) {
          await this.tapIOSCenter(this.changeCardTypeConfirmSheetBtnIOS, 3000).catch(async () => {
            await this.tap(this.changeCardTypeConfirmBtnIOS, 3000).catch(() => {})
          })
        } else {
          await this.tap(this.changeCardTypeConfirmBtnIOS)
        }
        await this.changeCardTypeTitleIOS.waitForExist({ timeout: 7000, reverse: true }).catch(() => {})
      }
      await browser.waitUntil(
        async () => await this.isIOSPhysicalCardTypeOptionAvailable(),
        { timeout: 10000, interval: 500, timeoutMsg: 'Card Type selection did not open on iOS' }
      )
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
      await browser.waitUntil(
        async () => await this.isIOSPhysicalCardTypeOptionAvailable(),
        { timeout: 10000, interval: 500, timeoutMsg: 'Physical card type selection was not available on iOS' }
      )
      const candidates = [
        this.physicalCardOptionIOS,
      ]
      let tapped = false
      for (const candidate of candidates) {
        const exists = await candidate.isExisting().catch(() => false)
        if (!exists) continue
        await this.tapIOSCenter(candidate, 3000).catch(async () => {
          await this.tap(candidate, 3000).catch(() => {})
        })
        tapped = true
        break
      }
      if (!tapped) {
        throw new Error('Physical card type option did not exist on iOS')
      }
      await browser.pause(1000)
      if (!(await this.isIOSAssignBusinessCardFormVisible())) {
        await this.closeIOSCardTypeSelection()
      }
      await browser.waitUntil(
        async () => await this.isIOSPhysicalCardTypeSelected(),
        { timeout: 10000, interval: 500, timeoutMsg: 'Physical card type selector was not closed on iOS' }
      )
      await this.continueBtnIOS.waitForExist({ timeout: 10000 })
      return
    }
    await this.physicalCardOptionAndroid.waitForExist({ timeout: 10000 })
    await this.tap(this.physicalCardOptionAndroid)
    await this.cardAssigneeRowAndroid.waitForExist({ timeout: 10000 })
    await this.continueBtnAndroid.waitForExist({ timeout: 10000 })
  }

  public async selectLasVegasAssignee() {
    if (!browser.isIOS) return

    await browser.waitUntil(
      async () => await this.isIOSAssignBusinessCardFormVisible(),
      { timeout: 10000, interval: 500, timeoutMsg: 'Assign Card form was not visible before selecting Las Vegas assignee on iOS' }
    )

    if (await this.cardAssigneeLasVegasSelectedIOS.isExisting().catch(() => false)) return

    await this.tap(this.cardAssigneeRowIOS, 3000)

    await browser.waitUntil(
      async () =>
        (await this.userSelectionTitleIOS.isExisting().catch(() => false)) ||
        (await this.lasVegasUserOptionIOS.isExisting().catch(() => false)) ||
        (await this.lasVegasUserTextIOS.isExisting().catch(() => false)),
      { timeout: 10000, interval: 500, timeoutMsg: 'User selection sheet did not open on iOS' }
    )

    if (await this.lasVegasUserOptionIOS.isExisting().catch(() => false)) {
      await this.tap(this.lasVegasUserOptionIOS, 3000)
    } else {
      await this.tap(this.lasVegasUserTextIOS, 3000)
    }

    await browser.waitUntil(
      async () =>
        (await this.isIOSAssignBusinessCardFormVisible()) &&
        (await this.cardAssigneeLasVegasSelectedIOS.isExisting().catch(() => false)),
      { timeout: 15000, interval: 500, timeoutMsg: 'Las Vegas assignee was not selected on iOS' }
    )
  }

  public async continueWithDefaultAssignee() {
    if (browser.isIOS) {
      await this.continueBtnIOS.waitForExist({
        timeout: 10000,
        interval: 500,
        timeoutMsg: 'Continue button did not exist on iOS',
      })
      if (!(await this.tapIOSContinueAndWaitForNextStep())) {
        throw new Error('Next card creation step did not appear after tapping Continue on iOS')
      }
      await browser.waitUntil(
        async () => await this.isIOSAfterContinueStateVisible(),
        { timeout: 15000, interval: 500, timeoutMsg: 'Next card creation step did not appear after Continue on iOS' }
      )
      return
    }
    await this.tap(this.continueBtnAndroid)
  }

  public async orderDefaultCardDesign() {
    if (browser.isIOS) {
      if (await this.isIOSCreatedCardListVisible()) return

      await browser.waitUntil(
        async () =>
          (await this.isIOSCardDesignScreenVisible()) ||
          (await this.isIOSCreatedCardListVisible()) ||
          (await this.assigneeAddressTitleIOS.isExisting().catch(() => false)) ||
          (await this.isIOSAssignCardSubmitReady()),
        { timeout: 15000, interval: 500, timeoutMsg: 'Card design or created card state did not appear on iOS' }
      )
      if (await this.isIOSCreatedCardListVisible()) return
      if (
        (await this.assigneeAddressTitleIOS.isExisting().catch(() => false)) ||
        (await this.isIOSAssignCardSubmitReady())
      ) {
        return
      }
      await this.tap(this.cardDesignOrderBtnIOS)
      return
    }
    await this.tap(this.cardDesignOrderBtnAndroid)
  }

  public async confirmAssigneeAddressAndSubmit() {
    if (browser.isIOS) {
      if (await this.isIOSCreatedCardListVisible()) return

      await browser.waitUntil(
        async () =>
          (await this.assigneeAddressTitleIOS.isExisting().catch(() => false)) ||
          (await this.isIOSAssignCardSubmitReady()) ||
          (await this.isIOSCreatedCardListVisible()),
        { timeout: 15000, interval: 500, timeoutMsg: 'Assignee address confirmation screen did not appear on iOS' }
      )
      if (await this.isIOSCreatedCardListVisible()) return
      await browser.waitUntil(
        async () => await this.isIOSAssignCardSubmitReady(),
        { timeout: 15000, interval: 500, timeoutMsg: 'Assign Card submit CTA did not exist on iOS' }
      )
      await this.tapIOSAssignCardSubmit()
      return
    }
    await this.assigneeAddressTitleAndroid.waitForExist({ timeout: 15000 })
    await this.tap(this.assignCardSubmitBtnAndroid)
  }

  public async verifySuccessAndClose() {
    if (browser.isIOS) {
      await browser.waitUntil(
        async () => await this.isIOSAssignmentCompleted(),
        { timeout: 120000, interval: 1000, timeoutMsg: 'Card assignment did not complete on iOS' }
      )

      const closeShown = await this.successCloseBtnIOS.isExisting().catch(() => false)
      if (closeShown) {
        await this.tap(this.successCloseBtnIOS)
        await this.cardAssignedSuccessTitleIOS.waitForExist({ timeout: 5000, reverse: true }).catch(() => {})
      }
      await this.closeIOSAssignCardSheetIfPresent()
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
      await this.closeIOSAssignCardSheetIfPresent()
      let openAttempts = 0
      let homeFallbackAttempts = 0
      await browser.waitUntil(
        async () => {
          if (await this.isIOSCardDetailsActionsReady()) return true
          if (await this.unlockIOSCardDetailsIfNeeded()) return true

          if (openAttempts < 12) {
            openAttempts += 1
            if (openAttempts > 3 && openAttempts % 4 === 0 && homeFallbackAttempts < 2) {
              homeFallbackAttempts += 1
              await this.reopenCardsFromHome().catch(() => {})
            }
            await this.openCreatedCardDetailsFromIOSList()
          }

          return (
            (await this.isIOSCardDetailsActionsReady()) ||
            (await this.unlockIOSCardDetailsIfNeeded())
          )
        },
        {
          timeout: 120000,
          interval: 1000,
          timeoutMsg: 'Created card details did not become ready on iOS',
        }
      )
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
          return this.isIOSCreatedCardListVisible()
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
    return $('~cards_button_freeze')
  }

  private get freezeLabelIOS() {
    return $('//XCUIElementTypeStaticText[(@name="Freeze" or @label="Freeze" or @value="Freeze") and not(ancestor::XCUIElementTypeNavigationBar)]')
  }

  private get unfreezeBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Unfreeze"]]')
  }

  private get unfreezeBtnIOS() {
    return $('~cards_button_unfreeze')
  }

  private get unfreezeLabelIOS() {
    return $('//XCUIElementTypeStaticText[(@name="Unfreeze" or @label="Unfreeze" or @value="Unfreeze") and not(ancestor::XCUIElementTypeNavigationBar)]')
  }

  private get reportBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Report"]]')
  }

  private get reportBtnIOS() {
    return $('//XCUIElementTypeButton[(@name="Report" or @label="Report") and not(ancestor::XCUIElementTypeNavigationBar)]')
  }

  private get reportLabelIOS() {
    return $('//XCUIElementTypeStaticText[(@name="Report" or @label="Report" or @value="Report") and not(ancestor::XCUIElementTypeNavigationBar)]')
  }

  private get moreBtnIOS() {
    return $('~cards_button_more')
  }

  private get blockBtnIOS() {
    return $('~cards_button_block')
  }

  private get blockAlertTitleIOS() {
    return $('-ios predicate string:name == "Lost / Stolen / Damaged" OR label == "Lost / Stolen / Damaged"')
  }

  private get blockAlertConfirmBtnIOS() {
    return $('//XCUIElementTypeButton[(@name="Block" or @label="Block") and not(ancestor::XCUIElementTypeNavigationBar)] | //XCUIElementTypeStaticText[(@name="Block" or @label="Block" or @value="Block") and not(ancestor::XCUIElementTypeNavigationBar)]/ancestor::XCUIElementTypeOther[1]')
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

  private async iosActionContainer(label: 'Freeze' | 'Unfreeze' | 'Report', depth: number) {
    return $(`//XCUIElementTypeStaticText[(@name="${label}" or @label="${label}" or @value="${label}") and not(ancestor::XCUIElementTypeNavigationBar)]/ancestor::XCUIElementTypeOther[${depth}]`)
  }

  private async tapIOSCardDetailsAction(label: 'Freeze' | 'Report', waitFor: () => Promise<boolean>, timeoutMsg: string) {
    const directButton = label === 'Freeze' ? this.freezeBtnIOS : this.reportBtnIOS
    const directLabel = label === 'Freeze' ? this.freezeLabelIOS : this.reportLabelIOS

    const candidates = [
      directButton,
      await this.iosActionContainer(label, 1),
      await this.iosActionContainer(label, 2),
      await this.iosActionContainer(label, 3),
      directLabel,
    ]

    for (const candidate of candidates) {
      const exists = await candidate.isExisting().catch(() => false)
      if (!exists) continue

      await this.tapIOSCenter(candidate, 3000).catch(async () => {
        await this.tap(candidate, 3000).catch(() => {})
      })

      const completed = await browser.waitUntil(waitFor, { timeout: 7000, interval: 500 }).catch(() => false)
      if (completed) return
    }

    throw new Error(timeoutMsg)
  }

  private async isIOSBlockOrRemovalComplete() {
    return (
      (await this.cardBlockedTitleIOS.isExisting().catch(() => false)) ||
      (await this.isIOSCreatedCardRemovalConfirmed()) ||
      ((await this.isIOSCardsListSurfaceVisible()) &&
        !(await this.isIOSCardDetailsActionsReady()))
    )
  }

  public async tapFreeze() {
    if (browser.isIOS) {
      if (!(await this.isIOSCardDetailsActionsReady())) {
        await this.openCreatedCardDetailsFromIOSList()
      }
      await browser.waitUntil(
        async () =>
          (await this.freezeBtnIOS.isExisting().catch(() => false)) ||
          (await this.freezeLabelIOS.isExisting().catch(() => false)),
        { timeout: 15000, interval: 500, timeoutMsg: 'Freeze action was not displayed on iOS' }
      )
      await this.tapIOSCardDetailsAction(
        'Freeze',
        async () =>
          (await this.unfreezeBtnIOS.isExisting().catch(() => false)) ||
          (await this.unfreezeLabelIOS.isExisting().catch(() => false)),
        'Frozen card actions were not displayed on iOS'
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
      await this.ensureIOSCardDetailsActionsReady()

      if (!(await this.blockBtnIOS.isExisting().catch(() => false)) && await this.moreBtnIOS.isExisting().catch(() => false)) {
        await this.tapIOSCenter(this.moreBtnIOS, 3000).catch(async () => {
          await this.tap(this.moreBtnIOS, 3000).catch(() => {})
        })
        await browser.waitUntil(
          async () =>
            (await this.blockBtnIOS.isExisting().catch(() => false)) ||
            (await this.reportBtnIOS.isExisting().catch(() => false)) ||
            (await this.reportLabelIOS.isExisting().catch(() => false)),
          { timeout: 10000, interval: 500, timeoutMsg: 'More action did not expose block/report actions on iOS' }
        )
      }

      if (await this.blockBtnIOS.isExisting().catch(() => false)) {
        await this.tapIOSCenter(this.blockBtnIOS, 3000).catch(async () => {
          await this.tap(this.blockBtnIOS, 3000).catch(() => {})
        })

        await browser.waitUntil(
          async () =>
            (await this.blockAlertTitleIOS.isExisting().catch(() => false)) ||
            (await this.isIOSBlockOrRemovalComplete()),
          { timeout: 15000, interval: 500 }
        ).catch(() => {})

        if (await this.blockAlertTitleIOS.isExisting().catch(() => false)) {
          await this.tapIOSCenter(this.blockAlertConfirmBtnIOS, 3000).catch(async () => {
            await this.tap(this.blockAlertConfirmBtnIOS, 3000).catch(() => {})
          })
        }

        await browser.waitUntil(
          async () => await this.isIOSBlockOrRemovalComplete(),
          { timeout: 45000, interval: 1000, timeoutMsg: 'Block action did not complete on iOS' }
        )
        return
      }

      await browser.waitUntil(
        async () =>
          (await this.reportBtnIOS.isExisting().catch(() => false)) ||
          (await this.reportLabelIOS.isExisting().catch(() => false)),
        { timeout: 15000, interval: 500, timeoutMsg: 'Report action was not displayed on iOS' }
      )
      await this.tapIOSCardDetailsAction(
        'Report',
        async () => await this.cardBlockedTitleIOS.isExisting().catch(() => false),
        'Report action did not open block confirmation on iOS'
      )
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
      await browser.waitUntil(
        async () => await this.isIOSBlockOrRemovalComplete(),
        { timeout: 15000, interval: 500, timeoutMsg: 'Card block confirmation was not observed on iOS' }
      )
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

  private async refreshIOSCardsSurfaceFromHome() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    if (await this.homeTabIOS.isExisting().catch(() => false)) {
      await this.tap(this.homeTabIOS).catch(() => {})
      await browser.pause(1000)
    }

    await browser.waitUntil(
      async () => {
        if (await this.cardsTabIOSA11y.isExisting().catch(() => false)) {
          await this.tap(this.cardsTabIOSA11y).catch(() => {})
        } else if (await this.cardsTabIOS.isExisting().catch(() => false)) {
          await this.tap(this.cardsTabIOS).catch(() => {})
        }

        return this.isIOSCardsSurfaceVisible()
      },
      { timeout: 15000, interval: 1000, timeoutMsg: 'Cards screen did not refresh on iOS' }
    )
  }

  public async verifyCardRemoved() {
    if (browser.isIOS) {
      await browser.waitUntil(
        async () => {
          if (
            (await this.isIOSCardsSurfaceVisible()) &&
            (await this.isIOSCreatedCardRemovalConfirmed())
          ) return true

          await this.refreshIOSCardsSurfaceFromHome().catch(() => {})
          await browser.pause(2000)

          return (
            (await this.isIOSCardsSurfaceVisible()) &&
            (await this.isIOSCreatedCardRemovalConfirmed())
          )
        },
        { timeout: 30000, interval: 3000, timeoutMsg: 'Cards list was not stable after card removal on iOS' }
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
