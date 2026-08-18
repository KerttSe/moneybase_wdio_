import BasePage from './BasePage'
import { $, $$, browser } from '@wdio/globals'
import OtpHelper from '../helpers/otp.helper'
import { markBrowserStackStep } from '../helpers/browserstack.helper'

type CardSecurityControl = 'Swipe payments' | 'Contactless payments' | 'ATM withdrawals' | 'Online Transactions'

class CardManagementPage extends BasePage {
  private get cardsTab() {
    return $('~Cards')
  }

  private get cardsNavBarIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Cards"]')
  }

  private get cardsScreenAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/cards_screen$|^cards_screen$")')
  }

  private get jointAccountLabelIOS() {
    return $('~profilePicker_label_accountCode')
  }

  private get cardItemsIOS() {
    return $$('-ios predicate string:type == "XCUIElementTypeCell" AND name BEGINSWITH "card_item_"')
  }

  private get cardItemsAndroid() {
    return $$('//android.view.View[@resource-id="cards_screen"]//android.view.View[@clickable="true"][.//android.view.View[@content-desc and @content-desc!="Search"]]')
  }

  private get selectedCardNameIOS() {
    return $('~cards_label_cardName')
  }

  private get primaryStarIOS() {
    return $('-ios predicate string:type == "XCUIElementTypeImage" AND (name == "star.fill" OR label == "favourite")')
  }

  private get firstCardsPageIndicatorIOS() {
    return $('-ios predicate string:type == "XCUIElementTypePageIndicator" AND value BEGINSWITH "page 1"')
  }

  private get firstCardItemIOS() {
    return $('(//XCUIElementTypeCell[starts-with(@name, "card_item_") and @name != "card_item_addCard"])[1]')
  }

  private get firstCardItemAndroid() {
    return $('(//android.view.View[@resource-id="cards_screen"]//android.view.View[@clickable="true"][.//android.view.View[@content-desc and @content-desc!="Search"]])[1]')
  }

  private get viewPinButton() {
    return browser.isIOS
      ? $('~cards_button_viewPin')
      : $('android=new UiSelector().resourceIdMatches(".*:id/cards_button_viewPin$|^cards_button_viewPin$")')
  }

  private get securityButton() {
    return browser.isIOS
      ? $('~cards_button_security')
      : $('android=new UiSelector().resourceIdMatches(".*:id/cards_button_security$|^cards_button_security$")')
  }

  private get freezeButton() {
    return browser.isIOS
      ? $('~cards_button_freeze')
      : $('android=new UiSelector().resourceIdMatches(".*:id/cards_button_freeze$|^cards_button_freeze$")')
  }

  private get freezeLabelIOS() {
    return $('//XCUIElementTypeStaticText[(@name="Freeze" or @label="Freeze" or @value="Freeze") and not(ancestor::XCUIElementTypeNavigationBar)]')
  }

  private get unfreezeButtonIOS() {
    return $('~cards_button_unfreeze')
  }

  private get unfreezeLabelIOS() {
    return $('//XCUIElementTypeStaticText[(@name="Unfreeze" or @label="Unfreeze" or @value="Unfreeze") and not(ancestor::XCUIElementTypeNavigationBar)]')
  }

  private get freezeTextAndroid() {
    return $('android=new UiSelector().text("Freeze")')
  }

  private get unfreezeTextAndroid() {
    return $('android=new UiSelector().text("Unfreeze")')
  }

  private get moreButton() {
    return browser.isIOS
      ? $('~cards_button_more')
      : $('android=new UiSelector().resourceIdMatches(".*:id/cards_button_more$|^cards_button_more$")')
  }

  private get firstCardTransactionIOS() {
    return $('(//XCUIElementTypeCell[@visible="true" and .//XCUIElementTypeStaticText[contains(@name, "€") or contains(@label, "€")]])[1]')
  }

  private get firstCardTransactionAndroid() {
    return $('(//android.view.View[@clickable="true"][.//android.widget.TextView[contains(@text, "€")]])[1]')
  }

  private get transactionDetailsBackButtonIOS() {
    return $('//XCUIElementTypeNavigationBar//XCUIElementTypeButton[@name="BackButton" or @label="Cards"]')
  }

  private get transactionDetailsBackButtonAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/transactionDetails_button_back$|^transactionDetails_button_back$")')
  }

  private get transactionDetailsIconIOS() {
    return $('//XCUIElementTypeImage[@name="card_payments_transaction" and @visible="true"]')
  }

  private get transactionDetailsAmountIOS() {
    return $('-ios predicate string:type == "XCUIElementTypeStaticText" AND (name CONTAINS "€" OR label CONTAINS "€")')
  }

  private get transactionDetailsHeaderIOS() {
    return $('~Details')
  }

  private get transactionDetailsHeaderAndroid() {
    return $('android=new UiSelector().text("Processed")')
  }

  private get transactionDetailsSectionAndroid() {
    return $('android=new UiSelector().text("DETAILS")')
  }

  private get transactionDetailsCardUsedIOS() {
    return $('~Card used')
  }

  private get transactionDetailsCardUsedAndroid() {
    return $('android=new UiSelector().text("Card used")')
  }

  private get transactionDetailsDateTimeIOS() {
    return $('~Date & Time')
  }

  private get transactionDetailsDateTimeAndroid() {
    return $('android=new UiSelector().text("Date & Time")')
  }

  private get securityNavBarIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Card Security"]')
  }

  private get moreMenuNavBarIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="More"]')
  }

  private get moreMenuCloseButtonIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="More"]//XCUIElementTypeButton[@name="close" or @label="close"]')
  }

  private moreMenuOptionIOS(label: 'Rename Card (Friendly name)' | 'Set as Primary Card' | 'Add New Card') {
    return $(`-ios predicate string:type == "XCUIElementTypeStaticText" AND (name == "${label}" OR label == "${label}")`)
  }

  private moreMenuOptionAndroid(label: 'Rename Card (Friendly name)' | 'Add New Card') {
    return $(`android=new UiSelector().text("${label}")`)
  }

  private get moreMenuRenameButtonAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/cards_button_renameCard$|^cards_button_renameCard$")')
  }

  private get moreMenuAddNewCardButtonAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/cards_button_addNewCard$|^cards_button_addNewCard$")')
  }

  private get verificationNavBarIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Verification"]')
  }

  private get verificationCloseButtonIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Verification"]//XCUIElementTypeButton[@name="close" or @label="close"]')
  }

  private get verificationCodeMessageIOS() {
    return $('-ios predicate string:type == "XCUIElementTypeStaticText" AND (name CONTAINS "Enter the 6-digit code" OR label CONTAINS "Enter the 6-digit code")')
  }

  private get verificationOtpInputIOS() {
    return $('//XCUIElementTypeTextView | //XCUIElementTypeTextField[starts-with(@name, "OTP_entry_")]')
  }

  private get currentPasscodeNavBarIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Current Passcode"]')
  }

  private get currentPasscodeBackButtonIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Current Passcode"]//XCUIElementTypeButton[@name="BackButton" or @label="Cards"]')
  }

  private get currentPasscodeTitleAndroid() {
    return $('android=new UiSelector().text("Current Passcode")')
  }

  private get viewPinPasscodeMessageAndroid() {
    return $('android=new UiSelector().textContains("Enter your passcode")')
  }

  private get viewPinPasscodeMessageIOS() {
    return $('-ios predicate string:type == "XCUIElementTypeStaticText" AND (name == "Enter your passcode to view PIN" OR label == "Enter your passcode to view PIN")')
  }

  private passcodeKeyIOS(digit: string) {
    return $(`~loginKeyPad_${digit}`)
  }

  private passcodeKeyAndroid(digit: string) {
    return $(`//android.view.View[@clickable="true"][.//android.widget.TextView[@text="${digit}"]]`)
  }

  private get pinNavBarIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="PIN"]')
  }

  private get pinTitleAndroid() {
    return $('android=new UiSelector().text("PIN")')
  }

  private get pinScreenAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/pin_screen$|^pin_screen$")')
  }

  private get pinBackButtonIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="PIN"]//XCUIElementTypeButton[@name="BackButton" or @label="Cards"]')
  }

  private get cardPinTitleIOS() {
    return $('~Your card PIN')
  }

  private get cardPinTitleAndroid() {
    return $('android=new UiSelector().text("Your card PIN")')
  }

  private get cardPinValueIOS() {
    return $('//XCUIElementTypeStaticText[@name="Your card PIN"]/following::XCUIElementTypeStaticText[string-length(translate(@name, " 0123456789", "")) = 0 and string-length(translate(@name, " ", "")) = 4][1]')
  }

  private get pinSecurityTimeoutIOS() {
    return $('-ios predicate string:type == "XCUIElementTypeStaticText" AND (name CONTAINS "For your own security" OR label CONTAINS "For your own security")')
  }

  private get pinSecurityTimeoutAndroid() {
    return $('android=new UiSelector().textContains("For your own security")')
  }

  private get pinDoneButtonIOS() {
    return $('~Done')
  }

  private get pinDoneButtonAndroid() {
    return $('android=new UiSelector().text("Done")')
  }

  private get securityTitleAndroid() {
    return $('android=new UiSelector().text("Card Security")')
  }

  private get securityBackButtonIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Card Security"]//XCUIElementTypeButton[@name="BackButton" or @label="Cards"]')
  }

  private securityControlLabel(control: CardSecurityControl) {
    return browser.isIOS
      ? $(`-ios predicate string:type == "XCUIElementTypeStaticText" AND (name == "${control}" OR label == "${control}")`)
      : $(`android=new UiSelector().text("${control}")`)
  }

  private securityControlSwitchIOS(control: CardSecurityControl) {
    return $(`//XCUIElementTypeStaticText[@name="${control}" or @label="${control}"]/following-sibling::XCUIElementTypeSwitch[1]`)
  }

  private async securityControlSwitchAndroid(control: CardSecurityControl) {
    const label = this.securityControlLabel(control)
    await label.waitForDisplayed({ timeout: 10000 })

    const labelLocation = await label.getLocation()
    const labelSize = await label.getSize()
    const labelCenterY = labelLocation.y + labelSize.height / 2
    const switches = await $$('android=new UiSelector().checkable(true).clickable(true)')
    let best: { element: WebdriverIO.Element; score: number } | undefined

    for (const candidate of switches) {
      if (!(await candidate.isDisplayed().catch(() => false))) continue

      const location = await candidate.getLocation().catch(() => undefined)
      const size = await candidate.getSize().catch(() => undefined)
      if (!location || !size) continue

      const centerX = location.x + size.width / 2
      const centerY = location.y + size.height / 2
      if (centerX <= labelLocation.x + labelSize.width) continue
      if (centerY < labelLocation.y - 20 || centerY > labelLocation.y + 260) continue

      const score = Math.abs(centerY - labelCenterY)
      if (!best || score < best.score) best = { element: candidate as WebdriverIO.Element, score }
    }

    if (!best) {
      await this.debugSnapshot(`card-management-android-${control.replace(/\s+/g, '-').toLowerCase()}-switch-not-found`)
      throw new Error(`Security switch was not found for ${control} on Android`)
    }

    return best.element
  }

  private async getSecuritySwitchValueIOS(control: CardSecurityControl) {
    return String(await this.securityControlSwitchIOS(control).getAttribute('value').catch(() => ''))
  }

  private async isSecuritySwitchCheckedAndroid(control: CardSecurityControl) {
    const securitySwitch = await this.securityControlSwitchAndroid(control)
    return String(await securitySwitch.getAttribute('checked').catch(() => 'false')) === 'true'
  }

  private async isAndroidPinDisplayed() {
    return (
      (await this.pinTitleAndroid.isDisplayed().catch(() => false)) ||
      (await this.cardPinTitleAndroid.isDisplayed().catch(() => false)) ||
      (await this.pinDoneButtonAndroid.isDisplayed().catch(() => false))
    )
  }

  private async waitForAndroidCardPinValue(timeoutMs = 10000) {
    await browser.waitUntil(async () => {
      const values = await $$('android=new UiSelector().textMatches("^\\\\d{4}$")')
      for (const value of values) {
        if (await value.isDisplayed().catch(() => false)) return true
      }
      return false
    }, {
      timeout: timeoutMs,
      interval: 500,
      timeoutMsg: 'Card PIN value was not displayed on Android',
    })
  }

  private async tapElementCenterIOS(el: WebdriverIO.Element) {
    const location = await el.getLocation()
    const size = await el.getSize()
    await browser.execute('mobile: tap', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    })
  }

  private async waitForCardsLoaded() {
    if (browser.isIOS) {
      await this.cardsNavBarIOS.waitForExist({ timeout: 20000 })
      await this.jointAccountLabelIOS.waitForExist({ timeout: 10000 })
      const account = await this.jointAccountLabelIOS.getAttribute('label').catch(() => '')
      if (!/Joint/i.test(account)) {
        throw new Error(`Expected Joint account on Cards screen, got "${account}"`)
      }
      return
    }

    await this.cardsScreenAndroid.waitForDisplayed({ timeout: 20000 })
  }

  private async ensureActiveCardControlsVisible() {
    if (browser.isIOS) {
      await browser.waitUntil(
        async () => (await this.isFreezeActionVisibleIOS()) || (await this.isUnfreezeActionVisibleIOS()),
        { timeout: 20000, interval: 500, timeoutMsg: 'Freeze/Unfreeze action was not visible on iOS' }
      )
      return
    }

    await browser.waitUntil(
      async () =>
        (await this.freezeTextAndroid.isDisplayed().catch(() => false)) ||
        (await this.unfreezeTextAndroid.isDisplayed().catch(() => false)),
      { timeout: 20000, interval: 500, timeoutMsg: 'Freeze/Unfreeze action was not visible on Android' }
    )
  }

  private async ensureSecurityActionVisible() {
    if (browser.isIOS) {
      await this.securityButton.waitForExist({ timeout: 20000 })
      return
    }

    await this.securityButton.waitForDisplayed({ timeout: 20000 })
  }

  private async iosCardActionContainer(label: 'Freeze' | 'Unfreeze', depth: number) {
    return $(`//XCUIElementTypeStaticText[(@name="${label}" or @label="${label}" or @value="${label}") and not(ancestor::XCUIElementTypeNavigationBar)]/ancestor::XCUIElementTypeOther[${depth}]`)
  }

  private async isFreezeActionVisibleIOS() {
    return (
      (await this.freezeButton.isExisting().catch(() => false)) ||
      (await this.freezeLabelIOS.isExisting().catch(() => false))
    )
  }

  private async isUnfreezeActionVisibleIOS() {
    return (
      (await this.unfreezeButtonIOS.isExisting().catch(() => false)) ||
      (await this.unfreezeLabelIOS.isExisting().catch(() => false))
    )
  }

  private async tapIOSCardAction(label: 'Freeze' | 'Unfreeze', waitFor: () => Promise<boolean>, timeoutMsg: string) {
    const directButton = label === 'Freeze' ? this.freezeButton : this.unfreezeButtonIOS
    const directLabel = label === 'Freeze' ? this.freezeLabelIOS : this.unfreezeLabelIOS
    const candidates = [
      directButton,
      await this.iosCardActionContainer(label, 1),
      await this.iosCardActionContainer(label, 2),
      await this.iosCardActionContainer(label, 3),
      directLabel,
    ]

    for (const candidate of candidates) {
      const exists = await candidate.isExisting().catch(() => false)
      if (!exists) continue

      await this.tapElementCenterIOS(candidate as unknown as WebdriverIO.Element).catch(async () => {
        await this.tap(candidate).catch(() => {})
      })

      const completed = await browser.waitUntil(waitFor, { timeout: 30000, interval: 500 }).catch(() => false)
      if (completed) return
    }

    await this.debugSnapshot(`card-management-ios-${label.toLowerCase()}-not-completed`)
    throw new Error(timeoutMsg)
  }

  private async scrollToFirstCardTransactionAndroid(timeoutMs = 15000) {
    const deadline = Date.now() + timeoutMs
    let attempts = 0

    while (Date.now() < deadline) {
      if (await this.firstCardTransactionAndroid.isDisplayed().catch(() => false)) return

      await browser.execute('mobile: scrollGesture', {
        left: 40,
        top: 900,
        width: 1000,
        height: 1050,
        direction: 'down',
        percent: 0.7,
      }).catch(async () => {
        await browser.performActions([{
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: 540, y: 1800 },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 120 },
            { type: 'pointerMove', duration: 550, x: 540, y: 900 },
            { type: 'pointerUp', button: 0 },
          ],
        }]).catch(() => {})
        await browser.releaseActions().catch(() => {})
      })

      attempts += 1
      if (attempts >= 6) break
      await browser.pause(350)
    }

    await this.debugSnapshot('card-management-android-transaction-not-found')
    throw new Error('No card transactions found on Android Cards screen')
  }

  public async openCardsTab() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    const alreadyOpen = browser.isIOS
      ? await this.cardsNavBarIOS.isExisting().catch(() => false)
      : await this.cardsScreenAndroid.isDisplayed().catch(() => false)
    if (!alreadyOpen) {
      await this.cardsTab.waitForExist({ timeout: 20000 })
      await this.tap(this.cardsTab)
    }

    await this.waitForCardsLoaded()
    await this.ensureActiveCardControlsVisible()
    await markBrowserStackStep('Opened Cards')
  }

  public async verifyExistingCardDisplayed() {
    await this.openCardsTab()

    if (browser.isIOS) {
      const cards = await this.cardItemsIOS
      if ((await cards.length) === 0) throw new Error('No existing card items were found on iOS Cards screen')
      await this.selectedCardNameIOS.waitForExist({ timeout: 10000 })
      return
    }

    const cards = await this.cardItemsAndroid
    if ((await cards.length) === 0) throw new Error('No existing card items were found on Android Cards screen')
  }

  public async verifyCardManagementActionsDisplayed() {
    await this.openCardsTab()
    await this.ensureActiveCardControlsVisible()
  }

  public async openMoreMenu() {
    await this.openCardsTab()
    await this.tap(this.moreButton)

    if (browser.isIOS) {
      await this.moreMenuNavBarIOS.waitForExist({ timeout: 15000 })
      await markBrowserStackStep('Opened Cards More menu')
      return
    }

    await this.moreMenuOptionAndroid('Rename Card (Friendly name)').waitForDisplayed({ timeout: 15000 })
    await markBrowserStackStep('Opened Cards More menu')
  }

  public async verifyMoreMenuOptionsDisplayed() {
    await this.openMoreMenu()
    if (browser.isIOS) {
      await this.moreMenuOptionIOS('Rename Card (Friendly name)').waitForExist({ timeout: 10000 })
      await this.moreMenuOptionIOS('Add New Card').waitForExist({ timeout: 10000 })
      return
    }

    await this.moreMenuRenameButtonAndroid.waitForDisplayed({ timeout: 10000 })
    await this.moreMenuOptionAndroid('Rename Card (Friendly name)').waitForDisplayed({ timeout: 10000 })
    await this.moreMenuAddNewCardButtonAndroid.waitForDisplayed({ timeout: 10000 })
    await this.moreMenuOptionAndroid('Add New Card').waitForDisplayed({ timeout: 10000 })
  }

  public async openFirstCardTransaction() {
    await this.openCardsTab()

    if (browser.isIOS) {
      await this.firstCardTransactionIOS.waitForExist({ timeout: 15000 })
      await this.tapElementCenterIOS(this.firstCardTransactionIOS as unknown as WebdriverIO.Element)
      await this.transactionDetailsHeaderIOS.waitForExist({ timeout: 15000 })
      await markBrowserStackStep('Opened first card transaction')
      return
    }

    await this.scrollToFirstCardTransactionAndroid(15000)
    await this.tap(this.firstCardTransactionAndroid)
    await browser.waitUntil(
      async () =>
        (await this.transactionDetailsCardUsedAndroid.isDisplayed().catch(() => false)) ||
        (await this.transactionDetailsSectionAndroid.isDisplayed().catch(() => false)) ||
        (await this.transactionDetailsBackButtonAndroid.isDisplayed().catch(() => false)),
      {
        timeout: 15000,
        interval: 500,
        timeoutMsg: 'Card transaction details did not open on Android',
      }
    )
    await markBrowserStackStep('Opened first card transaction')
  }

  public async verifyFirstCardTransactionDetails() {
    await this.openFirstCardTransaction()
    if (browser.isAndroid) {
      await this.transactionDetailsHeaderAndroid.waitForDisplayed({ timeout: 3000 }).catch(() => {})
      await this.transactionDetailsSectionAndroid.waitForDisplayed({ timeout: 10000 })
      await this.transactionDetailsCardUsedAndroid.waitForDisplayed({ timeout: 10000 })
      await this.transactionDetailsDateTimeAndroid.waitForDisplayed({ timeout: 10000 })
      return
    }

    await this.transactionDetailsIconIOS.waitForExist({ timeout: 3000 }).catch(() => {})
    await this.transactionDetailsAmountIOS.waitForExist({ timeout: 10000 })
    await this.transactionDetailsHeaderIOS.waitForExist({ timeout: 10000 })
    await this.transactionDetailsCardUsedIOS.waitForExist({ timeout: 10000 })
    await this.transactionDetailsDateTimeIOS.waitForExist({ timeout: 10000 })
  }

  public async openViewPinVerification() {
    await this.openCardsTab()
    await this.tap(this.viewPinButton)

    if (browser.isIOS) {
      await browser.waitUntil(
        async () =>
          (await this.verificationNavBarIOS.isExisting().catch(() => false)) ||
          (await this.currentPasscodeNavBarIOS.isExisting().catch(() => false)),
        {
          timeout: 15000,
          interval: 500,
          timeoutMsg: 'View Pin did not open Verification or Current Passcode screen on iOS',
        }
      )

      if (await this.verificationNavBarIOS.isExisting().catch(() => false)) {
        await this.verificationCodeMessageIOS.waitForExist({ timeout: 10000 })
        await this.verificationOtpInputIOS.waitForExist({ timeout: 10000 })
        return
      }

      await this.verifyViewPinPasscodeGateDisplayed()
      return
    }

    await browser.waitUntil(
      async () =>
        (await this.currentPasscodeTitleAndroid.isDisplayed().catch(() => false)) ||
        (await this.pinTitleAndroid.isDisplayed().catch(() => false)),
      {
        timeout: 15000,
        interval: 500,
        timeoutMsg: 'View Pin did not open Current Passcode or PIN screen on Android',
      }
    )
  }

  private async getCardManagementOtp() {
    const explicitOtp = process.env.CARD_MANAGEMENT_OTP || process.env.CARD_OTP
    if (explicitOtp) return explicitOtp.replace(/\D/g, '').slice(0, 6)

    if (process.env.CARD_MANAGEMENT_OTP_USE_API !== 'true') {
      return '000000'
    }

    const phone = process.env.CARD_MANAGEMENT_OTP_PHONE || process.env.OTP_PHONE || process.env.MB_PHONE || ''
    if (!phone) throw new Error('Card PIN OTP phone is not configured. Set CARD_MANAGEMENT_OTP_PHONE, OTP_PHONE, or MB_PHONE')

    const fetchDelayMs = Number(process.env.CARD_MANAGEMENT_OTP_FETCH_DELAY_MS || process.env.OTP_FETCH_DELAY_MS || 0)
    if (Number.isFinite(fetchDelayMs) && fetchDelayMs > 0) {
      await browser.pause(Math.floor(fetchDelayMs))
    }

    return OtpHelper.getLatestOtp({
      phone,
      timeoutMs: Number(process.env.CARD_MANAGEMENT_OTP_TIMEOUT_MS || process.env.OTP_TIMEOUT_MS || 90000),
      intervalMs: Number(process.env.CARD_MANAGEMENT_OTP_POLL_INTERVAL_MS || process.env.OTP_POLL_INTERVAL_MS || 2000),
      maxRequests: Number(process.env.CARD_MANAGEMENT_OTP_MAX_REQUESTS || 1),
    })
  }

  private async getCardManagementPasscodeFromApi(excludeTokens: string[] = []) {
    const apiEnabled = process.env.CARD_MANAGEMENT_PASSCODE_USE_API !== 'false'
    const endpointConfigured = Boolean(
      String(process.env.OTP_GET_LATEST_URL || process.env.OTP_API_BASE_URL || '').trim()
    )
    if (!apiEnabled || !endpointConfigured) return null

    const phone = process.env.CARD_MANAGEMENT_PASSCODE_PHONE || process.env.CARD_MANAGEMENT_OTP_PHONE || process.env.OTP_PHONE || process.env.MB_PHONE || ''
    if (!phone) throw new Error('Card PIN passcode API phone is not configured. Set CARD_MANAGEMENT_PASSCODE_PHONE, OTP_PHONE, or MB_PHONE')

    const fetchDelayMs = Number(process.env.CARD_MANAGEMENT_PASSCODE_FETCH_DELAY_MS || process.env.OTP_FETCH_DELAY_MS || 0)
    if (Number.isFinite(fetchDelayMs) && fetchDelayMs > 0) {
      await browser.pause(Math.floor(fetchDelayMs))
    }

    return OtpHelper.getLatestOtp({
      phone,
      timeoutMs: Number(process.env.CARD_MANAGEMENT_PASSCODE_TIMEOUT_MS || process.env.OTP_TIMEOUT_MS || 90000),
      intervalMs: Number(process.env.CARD_MANAGEMENT_PASSCODE_POLL_INTERVAL_MS || process.env.OTP_POLL_INTERVAL_MS || 2000),
      maxRequests: Number(process.env.CARD_MANAGEMENT_PASSCODE_MAX_REQUESTS || process.env.OTP_MAX_REQUESTS || 10),
      excludeTokens,
      urlTemplate: process.env.CARD_MANAGEMENT_PASSCODE_GET_LATEST_URL || process.env.CARD_MANAGEMENT_OTP_GET_LATEST_URL,
      baseUrl: process.env.CARD_MANAGEMENT_PASSCODE_API_BASE_URL || process.env.CARD_MANAGEMENT_OTP_API_BASE_URL,
      authToken: process.env.CARD_MANAGEMENT_PASSCODE_API_AUTH_TOKEN || process.env.CARD_MANAGEMENT_OTP_API_AUTH_TOKEN,
      cookie: process.env.CARD_MANAGEMENT_PASSCODE_API_COOKIE || process.env.CARD_MANAGEMENT_OTP_API_COOKIE,
      headersJson: process.env.CARD_MANAGEMENT_PASSCODE_API_HEADERS_JSON || process.env.CARD_MANAGEMENT_OTP_API_HEADERS_JSON,
    })
  }

  private async enterAndroidPasscodeDigits(passcode: string) {
    const digits = passcode.replace(/\D/g, '')
    if (digits.length === 0) throw new Error('Card PIN passcode is empty')

    for (const digit of digits) {
      await this.tap(this.passcodeKeyAndroid(digit))
      await browser.pause(150)
    }

    return digits
  }

  private async waitForAndroidPinAfterPasscode(timeoutMs = 30000) {
    return browser.waitUntil(async () => await this.isAndroidPinDisplayed(), {
      timeout: timeoutMs,
      interval: 500,
    }).catch(() => false)
  }

  private async completeViewPinVerificationIfNeeded() {
    if (!browser.isIOS || !(await this.verificationNavBarIOS.isExisting().catch(() => false))) return

    const otp = (await this.getCardManagementOtp()).replace(/\D/g, '').slice(0, 6)
    if (otp.length !== 6) throw new Error(`Invalid Card PIN OTP length: ${otp.length}`)

    await this.verificationOtpInputIOS.waitForExist({ timeout: 15000 })
    await this.verificationOtpInputIOS.click().catch(() => {})
    await this.verificationOtpInputIOS.addValue(otp).catch(async () => {
      for (const digit of otp) {
        await this.verificationOtpInputIOS.addValue(digit).catch(() => {})
      }
    })

    await browser.waitUntil(
      async () =>
        (await this.currentPasscodeNavBarIOS.isExisting().catch(() => false)) ||
        (await this.pinNavBarIOS.isExisting().catch(() => false)),
      {
        timeout: 30000,
        interval: 500,
        timeoutMsg: 'Card PIN verification did not advance to passcode or PIN screen on iOS',
      }
    )
  }

  private async enterViewPinPasscodeIfNeeded(passcode: string) {
    if (browser.isAndroid) {
      if (!(await this.currentPasscodeTitleAndroid.isDisplayed().catch(() => false))) return

      await this.verifyViewPinPasscodeGateDisplayed()
      const apiPasscode = await this.getCardManagementPasscodeFromApi()
      const selectedPasscode = apiPasscode ?? passcode
      console.log(`[CardManagement] Entering View PIN passcode from ${apiPasscode ? 'API' : 'env'} token`)
      await this.enterAndroidPasscodeDigits(selectedPasscode)

      const pinShown = await this.waitForAndroidPinAfterPasscode(30000)

      if (!pinShown) {
        const stillOnPasscode = await this.currentPasscodeTitleAndroid.isDisplayed().catch(() => false)
        await this.debugSnapshot('card-management-android-pin-not-opened')
        throw new Error(
          stillOnPasscode
            ? 'Card PIN screen did not open after passcode on Android; check CARD_MANAGEMENT_PASSCODE/CARD_MANAGEMENT_PIN'
            : 'Card PIN screen did not open after passcode on Android'
        )
      }
      await markBrowserStackStep('Entered PIN')
      return
    }

    if (!browser.isIOS || !(await this.currentPasscodeNavBarIOS.isExisting().catch(() => false))) return

    await this.verifyViewPinPasscodeGateDisplayed()
    const digits = passcode.replace(/\D/g, '')
    if (digits.length === 0) throw new Error('Card PIN passcode is empty')

    for (const digit of digits) {
      await this.tapElementCenterIOS(this.passcodeKeyIOS(digit) as unknown as WebdriverIO.Element)
      await browser.pause(150)
    }

    await this.pinNavBarIOS.waitForExist({ timeout: 30000 })
    await markBrowserStackStep('Entered PIN')
  }

  public async verifyViewPinPasscodeGateDisplayed() {
    if (browser.isAndroid) {
      await this.currentPasscodeTitleAndroid.waitForDisplayed({ timeout: 15000 })
      await this.viewPinPasscodeMessageAndroid.waitForDisplayed({ timeout: 10000 })
      for (const digit of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) {
        await this.passcodeKeyAndroid(digit).waitForDisplayed({ timeout: 10000 })
      }
      return
    }

    if (!browser.isIOS) throw new Error('verifyViewPinPasscodeGateDisplayed: iOS only')

    await this.currentPasscodeNavBarIOS.waitForExist({ timeout: 15000 })
    await this.viewPinPasscodeMessageIOS.waitForExist({ timeout: 10000 })
    for (const digit of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) {
      await this.passcodeKeyIOS(digit).waitForExist({ timeout: 10000 })
    }
  }

  public async verifyCardPinDisplayed(passcode: string) {
    await this.openViewPinVerification()
    await this.completeViewPinVerificationIfNeeded()
    await this.enterViewPinPasscodeIfNeeded(passcode)

    if (browser.isAndroid) {
      await browser.waitUntil(async () => await this.isAndroidPinDisplayed(), {
        timeout: 15000,
        interval: 500,
        timeoutMsg: 'Card PIN screen was not displayed on Android',
      })
      await this.cardPinTitleAndroid.waitForDisplayed({ timeout: 10000 })
      await this.waitForAndroidCardPinValue(10000)
      await this.pinSecurityTimeoutAndroid.waitForDisplayed({ timeout: 10000 })
      await this.pinDoneButtonAndroid.waitForDisplayed({ timeout: 10000 })
      return
    }

    await this.pinNavBarIOS.waitForExist({ timeout: 15000 })
    await this.cardPinTitleIOS.waitForExist({ timeout: 10000 })
    await this.cardPinValueIOS.waitForExist({ timeout: 10000 })
    await this.pinSecurityTimeoutIOS.waitForExist({ timeout: 10000 })
    await this.pinDoneButtonIOS.waitForExist({ timeout: 10000 })
  }

  public async verifyViewPinGateDisplayed() {
    if (!browser.isIOS) throw new Error('verifyViewPinGateDisplayed: iOS only')

    await this.openViewPinVerification()
  }

  public async openSecuritySettings() {
    await this.openCardsTab()
    await this.ensureSecurityActionVisible()
    await this.tap(this.securityButton)

    if (browser.isIOS) {
      await this.securityNavBarIOS.waitForExist({ timeout: 15000 })
      await markBrowserStackStep('Opened Card Security')
      return
    }

    await this.securityTitleAndroid.waitForDisplayed({ timeout: 15000 })
    await markBrowserStackStep('Opened Card Security')
  }

  public async verifySecurityControlsDisplayed() {
    await this.openSecuritySettings()

    const controls: CardSecurityControl[] = [
      'Swipe payments',
      'Contactless payments',
      'ATM withdrawals',
      'Online Transactions',
    ]

    for (const control of controls) {
      if (browser.isIOS) {
        await this.securityControlLabel(control).waitForExist({ timeout: 10000 })
        await this.securityControlSwitchIOS(control).waitForExist({ timeout: 10000 })
      } else {
        await this.securityControlLabel(control).waitForDisplayed({ timeout: 10000 })
        const securitySwitch = await this.securityControlSwitchAndroid(control)
        await securitySwitch.waitForDisplayed({ timeout: 10000 })
      }
    }
  }

  public async reEnableSecurityControl(control: CardSecurityControl = 'Swipe payments') {
    await this.openSecuritySettings()

    if (browser.isAndroid) {
      const securitySwitch = await this.securityControlSwitchAndroid(control)
      await securitySwitch.waitForDisplayed({ timeout: 10000 })
      const alreadyEnabled = await this.isSecuritySwitchCheckedAndroid(control)
      if (alreadyEnabled) {
        console.log(`[CardManagement] ${control} is already enabled`)
        return
      }

      await this.tap(securitySwitch)
      await browser.waitUntil(
        async () => await this.isSecuritySwitchCheckedAndroid(control),
        {
          timeout: 15000,
          interval: 500,
          timeoutMsg: `${control} did not become enabled after tapping its switch on Android`,
        }
      )
      return
    }

    await this.securityControlSwitchIOS(control).waitForExist({ timeout: 10000 })

    const before = await this.getSecuritySwitchValueIOS(control)
    if (before === '1') {
      console.log(`[CardManagement] ${control} is already enabled`)
      return
    }

    await this.tapElementCenterIOS(this.securityControlSwitchIOS(control) as unknown as WebdriverIO.Element)
    await browser.waitUntil(
      async () => (await this.getSecuritySwitchValueIOS(control)) === '1',
      {
        timeout: 15000,
        interval: 500,
        timeoutMsg: `${control} did not become enabled after tapping its switch`,
      }
    )
  }

  public async freezeAndUnfreezeActiveCard() {
    await this.openCardsTab()

    if (browser.isIOS) {
      const alreadyFrozen = await this.isUnfreezeActionVisibleIOS()
      if (alreadyFrozen) {
        await this.tapIOSCardAction(
          'Unfreeze',
          async () => await this.isFreezeActionVisibleIOS(),
          'Freeze action did not appear after unfreezing card on iOS'
        )
      }

      await browser.waitUntil(async () => await this.isFreezeActionVisibleIOS(), {
        timeout: 20000,
        interval: 500,
        timeoutMsg: 'Freeze action was not visible on iOS',
      })
      await this.tapIOSCardAction(
        'Freeze',
        async () => await this.isUnfreezeActionVisibleIOS(),
        'Unfreeze action did not appear after freezing card on iOS'
      )

      await this.tapIOSCardAction(
        'Unfreeze',
        async () => await this.isFreezeActionVisibleIOS(),
        'Freeze action did not appear after unfreezing card on iOS'
      )

      if (!alreadyFrozen) {
        await this.tapIOSCardAction(
          'Freeze',
          async () => await this.isUnfreezeActionVisibleIOS(),
          'Unfreeze action did not appear after freezing card on iOS'
        )
      }
      return
    }

    const alreadyFrozen = await this.unfreezeTextAndroid.isDisplayed().catch(() => false)
    if (alreadyFrozen) {
      await this.tap(this.freezeButton)
      await this.freezeTextAndroid.waitForDisplayed({ timeout: 20000 })
    }

    await this.freezeTextAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.freezeButton)
    await this.unfreezeTextAndroid.waitForDisplayed({ timeout: 20000 })

    await this.tap(this.freezeButton)
    await this.unfreezeTextAndroid.waitForDisplayed({ reverse: true, timeout: 20000 }).catch(() => {})
    await this.freezeTextAndroid.waitForDisplayed({ timeout: 20000 })
  }

  public async verifyPrimaryIndicatorDisplayed() {
    await this.openCardsTab()

    if (browser.isIOS) {
      await this.primaryStarIOS.waitForExist({ timeout: 10000 })
      return
    }

    await this.firstCardItemAndroid.waitForDisplayed({ timeout: 10000 })
  }

  public async verifyPhysicalCardIsPrimary() {
    await this.openCardsTab()

    if (browser.isIOS) {
      await this.firstCardItemIOS.waitForExist({ timeout: 10000 })
      const firstCardName = await this.firstCardItemIOS.getAttribute('name').catch(() => '')
      if (!/^card_item_/.test(firstCardName)) {
        throw new Error(`First Cards carousel item is not a card: "${firstCardName}"`)
      }

      await this.firstCardsPageIndicatorIOS.waitForExist({ timeout: 10000 })
      await this.primaryStarIOS.waitForExist({ timeout: 10000 })
      return
    }

    await this.firstCardItemAndroid.waitForDisplayed({ timeout: 10000 })
  }

  public async closeSecurityIfOpen() {
    if (browser.isIOS) {
      const onTransactionDetails = await this.transactionDetailsHeaderIOS.isExisting().catch(() => false)
      if (onTransactionDetails) {
        if (await this.transactionDetailsBackButtonIOS.isExisting().catch(() => false)) {
          await this.tapElementCenterIOS(this.transactionDetailsBackButtonIOS as unknown as WebdriverIO.Element).catch(async () => {
            await this.tap(this.transactionDetailsBackButtonIOS).catch(() => {})
          })
        } else {
          await browser.back().catch(() => {})
        }
        await this.transactionDetailsHeaderIOS.waitForExist({ reverse: true, timeout: 10000 }).catch(() => {})
        return
      }

      const onMoreMenu = await this.moreMenuNavBarIOS.isExisting().catch(() => false)
      if (onMoreMenu) {
        if (await this.moreMenuCloseButtonIOS.isExisting().catch(() => false)) {
          await this.tapElementCenterIOS(this.moreMenuCloseButtonIOS as unknown as WebdriverIO.Element).catch(async () => {
            await this.tap(this.moreMenuCloseButtonIOS).catch(() => {})
          })
        } else {
          await browser.back().catch(() => {})
        }
        await this.moreMenuNavBarIOS.waitForExist({ reverse: true, timeout: 10000 }).catch(() => {})
        return
      }

      const onPin = await this.pinNavBarIOS.isExisting().catch(() => false)
      if (onPin) {
        if (await this.pinDoneButtonIOS.isExisting().catch(() => false)) {
          await this.tapElementCenterIOS(this.pinDoneButtonIOS as unknown as WebdriverIO.Element).catch(async () => {
            await this.tap(this.pinDoneButtonIOS).catch(() => {})
          })
        } else if (await this.pinBackButtonIOS.isExisting().catch(() => false)) {
          await this.tapElementCenterIOS(this.pinBackButtonIOS as unknown as WebdriverIO.Element).catch(async () => {
            await this.tap(this.pinBackButtonIOS).catch(() => {})
          })
        } else {
          await browser.back().catch(() => {})
        }
        await this.pinNavBarIOS.waitForExist({ reverse: true, timeout: 10000 }).catch(() => {})
        return
      }

      const onPasscode = await this.currentPasscodeNavBarIOS.isExisting().catch(() => false)
      if (onPasscode) {
        if (await this.currentPasscodeBackButtonIOS.isExisting().catch(() => false)) {
          await this.tapElementCenterIOS(this.currentPasscodeBackButtonIOS as unknown as WebdriverIO.Element).catch(async () => {
            await this.tap(this.currentPasscodeBackButtonIOS).catch(() => {})
          })
        } else {
          await browser.back().catch(() => {})
        }
        await this.currentPasscodeNavBarIOS.waitForExist({ reverse: true, timeout: 10000 }).catch(() => {})
        return
      }

      const onVerification = await this.verificationNavBarIOS.isExisting().catch(() => false)
      if (onVerification) {
        if (await this.verificationCloseButtonIOS.isExisting().catch(() => false)) {
          await this.tapElementCenterIOS(this.verificationCloseButtonIOS as unknown as WebdriverIO.Element).catch(async () => {
            await this.tap(this.verificationCloseButtonIOS).catch(() => {})
          })
        } else {
          await browser.back().catch(() => {})
        }
        await this.verificationNavBarIOS.waitForExist({ reverse: true, timeout: 10000 }).catch(() => {})
        return
      }
    }

    const onTransactionDetailsAndroid =
      (await this.transactionDetailsBackButtonAndroid.isDisplayed().catch(() => false)) ||
      (await this.transactionDetailsCardUsedAndroid.isDisplayed().catch(() => false))
    if (onTransactionDetailsAndroid) {
      if (await this.transactionDetailsBackButtonAndroid.isDisplayed().catch(() => false)) {
        await this.tap(this.transactionDetailsBackButtonAndroid).catch(() => {})
      } else {
        await browser.back().catch(() => {})
      }
      await this.transactionDetailsCardUsedAndroid.waitForDisplayed({ reverse: true, timeout: 10000 }).catch(() => {})
      return
    }

    if (browser.isIOS) {
      const onSecurity = await this.securityNavBarIOS.isExisting().catch(() => false)
      if (!onSecurity) return

      if (await this.securityBackButtonIOS.isExisting().catch(() => false)) {
        await this.tapElementCenterIOS(this.securityBackButtonIOS as unknown as WebdriverIO.Element).catch(async () => {
          await this.tap(this.securityBackButtonIOS).catch(() => {})
        })
      } else {
        await browser.back().catch(() => {})
      }

      await this.securityNavBarIOS.waitForExist({ reverse: true, timeout: 10000 }).catch(() => {})
      return
    }

    const onPinAndroid = await this.pinTitleAndroid.isDisplayed().catch(() => false)
    if (onPinAndroid) {
      if (await this.pinDoneButtonAndroid.isDisplayed().catch(() => false)) {
        await this.tap(this.pinDoneButtonAndroid).catch(() => {})
      } else {
        await browser.back().catch(() => {})
      }
      await this.pinTitleAndroid.waitForDisplayed({ reverse: true, timeout: 10000 }).catch(() => {})
      return
    }

    const onPasscodeAndroid = await this.currentPasscodeTitleAndroid.isDisplayed().catch(() => false)
    if (onPasscodeAndroid) {
      await browser.back().catch(() => {})
      await this.currentPasscodeTitleAndroid.waitForDisplayed({ reverse: true, timeout: 10000 }).catch(() => {})
      return
    }

    const onMoreMenuAndroid =
      (await this.moreMenuRenameButtonAndroid.isDisplayed().catch(() => false)) ||
      (await this.moreMenuOptionAndroid('Rename Card (Friendly name)').isDisplayed().catch(() => false))
    if (onMoreMenuAndroid) {
      await browser.back().catch(() => {})
      await this.moreMenuOptionAndroid('Rename Card (Friendly name)').waitForDisplayed({ reverse: true, timeout: 10000 }).catch(() => {})
      return
    }

    const onSecurity = await this.securityTitleAndroid.isDisplayed().catch(() => false)
    if (onSecurity) await browser.back().catch(() => {})
  }
}

export default new CardManagementPage()
