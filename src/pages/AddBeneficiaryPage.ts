import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'
import OtpHelper from '../helpers/otp.helper'

export default class AddBeneficiaryPage extends BasePage {
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

  private get homeTabAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_button_home")')
  }

  private get homeTabAndroidA11y() {
    return $('~Home')
  }

  private get homeTabAndroidXpath() {
    return $('//android.widget.FrameLayout[@content-desc="Home"]')
  }

  private get cardsRootAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/cards_screen$|^cards_screen$")')
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

  private get homeRootIOS() {
    return $('~home_screen_view')
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

  private get alertBtn3Android() {
    return $('id=android:id/button3') // OK
  }

  private get alertBtn3AndroidByUi() {
    return $('android=new UiSelector().resourceId("android:id/button3")')
  }

  private get alertBtn3AndroidByText() {
    return $('android=new UiSelector().text("OK")')
  }

  private get alertTitleAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/alertTitle")')
  }

  private get alertBtn1Android() {
    return $('android=new UiSelector().resourceId("android:id/button1")')
  }

  private get somethingWentWrongTitleAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/alertTitle").text("Something went wrong")')
  }

  private get somethingWentWrongTitleAndroidContains() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/alertTitle").textContains("Something went wrong")')
  }

  private get tryAgainTextAndroid() {
    return $('android=new UiSelector().text("Try Again")')
  }

  private get closeSheetAndroid() {
    return $('android=new UiSelector().description("Close sheet")')
  }

  private get googlePayNotNowAndroid() {
    return $('android=new UiSelector().text("Not Now")')
  }

  private get googlePayScreenAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/clSelectCardGooglePay")')
  }

  private get googlePayCloseBtnAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/rightActionView")')
  }

  private async dismissBlockingAlertAndroid(timeoutMs = 10000) {
    await this.dismissCommonAndroidAlert(timeoutMs).catch(() => false)
  }

  private async dismissErrorDialogAndroid(): Promise<boolean> {
    if (!browser.isAndroid) return false

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const titleCandidates = [this.somethingWentWrongTitleAndroid, this.somethingWentWrongTitleAndroidContains]
    const okCandidates = [this.alertBtn1Android, this.alertBtn3Android, this.alertBtn3AndroidByUi, this.alertBtn3AndroidByText]

    let dialogShown = false
    for (const title of titleCandidates) {
      if (await title.isDisplayed().catch(() => false)) {
        dialogShown = true
        break
      }
    }
    if (!dialogShown) return false

    for (const btn of okCandidates) {
      const shown = await btn.isDisplayed().catch(() => false)
      if (!shown) continue

      await this.tap(btn).catch(() => {})
      await browser.pause(300)
      return true
    }

    await browser.back().catch(() => {})
    return true
  }

  private async dismissGooglePayPromoAndroid(timeoutMs = 7000) {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const fullScreenShown = await this.googlePayScreenAndroid.isDisplayed().catch(() => false)
    if (fullScreenShown) {
      const closeShown = await this.googlePayCloseBtnAndroid.isDisplayed().catch(() => false)
      if (closeShown) {
        await this.tap(this.googlePayCloseBtnAndroid)
      } else {
        await browser.back().catch(() => {})
      }

      await this.googlePayScreenAndroid.waitForDisplayed({ reverse: true, timeout: timeoutMs }).catch(() => {})
      return
    }

    const shown = await this.googlePayNotNowAndroid.waitForDisplayed({ timeout: 3000 }).catch(() => false)
    if (!shown) return

    await this.tap(this.googlePayNotNowAndroid)
    await this.googlePayNotNowAndroid.waitForDisplayed({ reverse: true, timeout: timeoutMs }).catch(() => {})
  }

  private async recoverFromTryAgainSheetAndroid() {
    if (!browser.isAndroid) return false

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const dialogDismissed = await this.dismissErrorDialogAndroid().catch(() => false)
    if (dialogDismissed) {
      await browser.pause(300)
      return true
    }

    const tryAgainShown = await this.tryAgainTextAndroid.isDisplayed().catch(() => false)
    if (tryAgainShown) {
      await this.tap(this.tryAgainTextAndroid).catch(() => {})
      await browser.pause(500)
      return true
    }

    const closeSheetShown = await this.closeSheetAndroid.isDisplayed().catch(() => false)
    if (closeSheetShown) {
      await this.tap(this.closeSheetAndroid).catch(() => {})
      await browser.pause(400)
      return true
    }

    return false
  }

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

    await this.homeRootAndroid.waitForDisplayed({ timeout: 30000 }).catch(() => {})
    await this.businessAccountLabelAndroid.waitForDisplayed({ reverse: true, timeout: 30000 }).catch(() => {})
  }
  /* =========================
   * ANDROID: entry point (Pay tab) + Add Beneficiary
   * ========================= */

  private get payTabAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_button_pay")')
  }

  private get addBeneficiaryBtnAndroid() {
    // Try multiple locators: accessibility id first, then by XPath/resource-id
    return $('//*[@resource-id="pay_button_addBeneficiary"]')
  }

  private get newBtnAndroid() {
    // accessibility id: New
    return $('~New')
  }

  private get newTransferTitleAndroid() {
    return $('android=new UiSelector().text("New Transfer")')
  }

  /* =========================
   * iOS: entry point (Pay tab) + Add Beneficiary
   * ========================= */

  private get payTabIOS() {
    return $('~Pay')
  }

  private get addBtnIOS() {
    return $('~pay_button_add')
  }

  private get addBeneficiaryBtnIOS() {
    return $('~newTransfer_button_addBeneficiary')
  }

  /* =========================
   * iOS: type selection
   * ========================= */

  private get anotherPersonCardIOS() {
    return $('~beneficiaryTypeSelection_button_anotherPerson')
  }

  /* =========================
   * iOS: country selection
   * ========================= */

  private get countryPickerIOS() {
    return $('~addBeneficiary_button_countrySelector')
  }

  private get countrySearchInputIOS() {
    return $('~genericPicker_textInput_search')
  }

  private get monacoOptionIOS() {
    return $('~Malta')
  }

  private get countryContinueBtnIOS() {
    return $('~addBeneficiary_button_continue')
  }

  /* =========================
   * iOS: details
   * ========================= */

  private get nameInputIOS() {
    return $('~addBeneficiary_textInput_name')
  }

  private get surnameInputIOS() {
    return $('~addBeneficiary_textInput_surname')
  }

  private get ibanInputIOS() {
    return $('~addBeneficiary_textInput_iban')
  }

  private get friendNameInputIOS() {
    return $('~addBeneficiary_textInput_friendlyName')
  }

  private get detailsContinueBtnIOS() {
    return $('~addBeneficiary_button_continue')
  }

  private get contactsContinueBtnIOS() {
    return $('~Continue')
  }

  /* =========================
   * ANDROID: type selection
   * ========================= */

  private get anotherPersonCardAndroid() {
    return $('android=new UiSelector().resourceId("beneficiaryTypeSelection_card_anotherPerson")')
  }

  /* =========================
   * ANDROID: country selection
   * ========================= */

  private get countryPickerAndroid() {
    return $('android=new UiSelector().resourceId("addBeneficiaryCountrySelection_picker_country")')
  }

  private get countrySearchInputAndroid() {
    return $('android=new UiSelector().resourceId("addBeneficiaryCountrySelection_input_search")')
  }

  private get monacoOptionAndroid() {
    return $('//android.widget.TextView[@text="Malta"]')
  }

  private get currencyPickerAndroid() {
    return $('android=new UiSelector().resourceId("addBeneficiaryCountrySelection_picker_currency")')
  }

  private get euroOptionAndroid() {
    return $('~Euro')
  }

  private get countryContinueBtnAndroid() {
    return $('android=new UiSelector().resourceId("addBeneficiaryCountrySelection_button_continue")')
  }

  /* =========================
   * ANDROID: details
   * ========================= */

  private get detailsContinueBtnAndroid() {
    //  XML: resource-id="addBeneficiaryDetails_button_continue"
    return $('android=new UiSelector().resourceId("addBeneficiaryDetails_button_continue")')
  }

  private get otpContainerAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/composeViewRegisterMobile")')
  }

  private get otpInputAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/otp_input")')
  }

  private get otpPhoneViewAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/otpPhoneView")')
  }

  private get otpContinueBtnAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/.*continue.*")')
  }

  private get otpLockedErrorAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/errorText").textContains("temporarily locked")')
  }

  private get beneficiaryAddedSuccessAndroidByText() {
    return $('android=new UiSelector().textMatches("(?i).*added successfully.*|.*adding beneficiary successfully.*|.*beneficiary.*added.*success.*")')
  }

  private get otpCountdownAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/otpCountdown")')
  }

  private get otpResendBtnAndroidById() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/.*resend.*").clickable(true)')
  }

  private get otpResendBtnAndroidByText() {
    return $('android=new UiSelector().textMatches("(?i)^resend( code)?$").clickable(true)')
  }

  private get otpResendBtnAndroidByDesc() {
    return $('android=new UiSelector().descriptionMatches("(?i)^resend( code)?$").clickable(true)')
  }

  private get createConfirmBtnAndroidById() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/(.*confirm.*|.*create.*|.*beneficiary.*continue.*)$")')
  }

  private get createConfirmBtnAndroidByTextConfirm() {
    return $('android=new UiSelector().textMatches("(?i)confirm|create|continue")')
  }

  private get vopScreenAndroid() {
    return $('android=new UiSelector().resourceId("varificationOfPayee_screen")')
  }

  private get vopConfirmBtnAndroid() {
    return $('android=new UiSelector().resourceId("varificationOfPayee_button_confirm")')
  }

  private get vopConfirmBtnAndroidByText() {
    return $('android=new UiSelector().text("Confirm")')
  }

  private get detailsContinueViewAndroid() {
    return $('//android.view.View[@resource-id="addBeneficiaryDetails_button_continue"]')
  }

  private get nameInputAndroid() {
    return $('android=new UiSelector().resourceId("addBeneficiaryDetails_input_name")')
  }

  private get surnameInputAndroid() {
    return $('android=new UiSelector().resourceId("addBeneficiaryDetails_input_surname")')
  }

  private get ibanInputAndroid() {
    return $('android=new UiSelector().resourceId("addBeneficiaryDetails_input_iban")')
  }

  private get friendNameInputAndroid() {
    return $('android=new UiSelector().resourceId("addBeneficiaryDetails_input_friendName")')
  }

  private getBeneficiaryByIbanAndroid(iban: string) {
    const compact = String(iban || '').replace(/\s+/g, '').toUpperCase()
    const grouped = compact.match(/.{1,4}/g)?.join(' ') ?? compact
    const tail = compact.length > 8 ? compact.slice(-8) : compact
    const tailGrouped = tail.match(/.{1,4}/g)?.join(' ') ?? tail

    const groupedParts = grouped.split(' ')
    const lastTwoGroups = groupedParts.slice(-2).join(' ')

    return [
      $(`android=new UiSelector().textContains("${compact}")`),
      $(`android=new UiSelector().descriptionContains("${compact}")`),
      $(`android=new UiSelector().textContains("${grouped}")`),
      $(`android=new UiSelector().descriptionContains("${grouped}")`),
      $(`android=new UiSelector().textContains("${tail}")`),
      $(`android=new UiSelector().descriptionContains("${tail}")`),
      $(`android=new UiSelector().textContains("${tailGrouped}")`),
      $(`android=new UiSelector().descriptionContains("${tailGrouped}")`),
      $(`android=new UiSelector().textContains("${lastTwoGroups}")`),
      $(`android=new UiSelector().descriptionContains("${lastTwoGroups}")`),
    ]
  }

  private async isAddedBeneficiaryIbanVisibleAndroid(iban: string) {
    const candidates = this.getBeneficiaryByIbanAndroid(iban)
    for (const candidate of candidates) {
      const shown = await candidate.isDisplayed().catch(() => false)
      if (shown) return true
    }
    return false
  }

  private async setIbanAndroid(iban: string) {
    await this.ibanInputAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.ibanInputAndroid)
    await this.ibanInputAndroid.clearValue().catch(() => {})
    await this.ibanInputAndroid.setValue(iban)
    await browser.pause(150)

    const currentValue = await this.ibanInputAndroid.getText().catch(() => '')
    const currentAttr = await this.ibanInputAndroid.getAttribute('text').catch(() => '')
    const hasValue = (currentValue && currentValue.length >= 5) || (currentAttr && currentAttr.length >= 5)

    if (!hasValue) {
      await this.tap(this.ibanInputAndroid)
      await this.ibanInputAndroid.clearValue().catch(() => {})
      await browser.keys(iban.split(''))
    }

    await browser.hideKeyboard().catch(() => {})
  }

  /* =========================
   * FLOW helpers
   * ========================= */

  async openPayTabAndroid() {
    if (!browser.isAndroid) return
    await this.payTabAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.payTabAndroid)
  }

  private async ensureHomeLandingAndroid() {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    await browser.waitUntil(
      async () => {
        await this.dismissKnownAndroidBlockingPopups().catch(() => {})

        await this.dismissBlockingAlertAndroid(3000).catch(() => {})

        const homeNow = await this.homeRootAndroid.isDisplayed().catch(() => false)
        if (homeNow) return true

        const cardsShown = await this.cardsRootAndroid.isDisplayed().catch(() => false)
        if (cardsShown) {
          const homeTabShown = await this.homeTabAndroid.isDisplayed().catch(() => false)
          const homeTabA11yShown = await this.homeTabAndroidA11y.isDisplayed().catch(() => false)
          const homeTabXpathShown = await this.homeTabAndroidXpath.isDisplayed().catch(() => false)

          if (homeTabShown) {
            await this.tap(this.homeTabAndroid).catch(() => {})
            await browser.pause(300)
          } else if (homeTabA11yShown) {
            await this.tap(this.homeTabAndroidA11y).catch(() => {})
            await browser.pause(300)
          } else if (homeTabXpathShown) {
            await this.tap(this.homeTabAndroidXpath).catch(() => {})
            await browser.pause(300)
          }
        }

        await this.dismissKnownAndroidBlockingPopups().catch(() => {})
        await this.dismissBlockingAlertAndroid(3000).catch(() => {})

        const homeAfterRecover = await this.homeRootAndroid.isDisplayed().catch(() => false)
        if (homeAfterRecover) return true

        const alertStillShown = await this.alertBtn3Android.isDisplayed().catch(() => false)
        if (alertStillShown) {
          await this.tap(this.alertBtn3Android).catch(() => {})
          await this.alertBtn3Android.waitForDisplayed({ reverse: true, timeout: 7000 }).catch(() => {})
        }

        return await this.homeRootAndroid.isDisplayed().catch(() => false)
      },
      {
        timeout: 30000,
        interval: 500,
        timeoutMsg: 'Home screen did not appear before opening Add Beneficiary (Android)',
      }
    )
  }

  async startAddBeneficiaryAndroid() {
    if (!browser.isAndroid) return

    // ensure Individual/Single account before flow
    await this.ensureSingleAccountAndroid()
    await this.ensureHomeLandingAndroid()

    await browser.pause(700)

    // 1️ Pay tab
    await browser.waitUntil(
      async () => {
        const payShown = await this.payTabAndroid.isDisplayed().catch(() => false)
        if (payShown) return true

        // Optional popups: they may appear only for some users (e.g. existing card)
        const gpayShown = await this.googlePayNotNowAndroid.isDisplayed().catch(() => false)
        if (gpayShown) {
          await this.dismissGooglePayPromoAndroid()
        }

        await this.dismissErrorDialogAndroid()
        await this.dismissBlockingAlertAndroid()

        return await this.payTabAndroid.isDisplayed().catch(() => false)
      },
      {
        timeout: 45000,
        interval: 500,
        timeoutMsg: 'Pay tab did not appear (Android)',
      }
    )
    await this.tap(this.payTabAndroid)

    await browser.switchContext('NATIVE_APP').catch(() => {})

    // 2️ New (only if sheet not already open)
    const newShown = await this.newBtnAndroid.waitForDisplayed({ timeout: 5000 }).catch(() => false)
    if (newShown) {
      await this.tap(this.newBtnAndroid)
    } else {
      await this.newTransferTitleAndroid.waitForDisplayed({ timeout: 8000 }).catch(() => {})
    }

    // 3️ Add Beneficiary
    await this.addBeneficiaryBtnAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.addBeneficiaryBtnAndroid)
  }

  async startAddBeneficiaryIOS() {
    if (!browser.isIOS) return

    await this.ensureIndividualAccountIOS()

    await this.homeRootIOS.waitForDisplayed({ timeout: 30000 }).catch(() => {})

    await this.payTabIOS.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.payTabIOS)

    const contactsShown = await this.contactsContinueBtnIOS.waitForDisplayed({ timeout: 4000 }).catch(() => false)
    if (contactsShown) {
      await this.tap(this.contactsContinueBtnIOS)
      await browser.pause(500)
    }

    const addShown = await this.addBtnIOS.waitForDisplayed({ timeout: 10000 }).catch(() => false)
    if (!addShown) {
      await this.tap(this.payTabIOS)
      await browser.pause(500)
    }

    await this.addBtnIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.addBtnIOS)

    await this.addBeneficiaryBtnIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.addBeneficiaryBtnIOS)
  }

  async chooseAnotherPersonAndroid() {
    if (!browser.isAndroid) return
    await this.anotherPersonCardAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.anotherPersonCardAndroid)
  }

  async chooseAnotherPersonIOS() {
    if (!browser.isIOS) return
    await this.anotherPersonCardIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.anotherPersonCardIOS)
  }

  async continueFromCountrySelectionAndroid() {
    if (!browser.isAndroid) return

    // Select country (Malta)
    await this.countryPickerAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.countryPickerAndroid)

    await this.countrySearchInputAndroid.waitForDisplayed({ timeout: 15000 })
    await this.type(this.countrySearchInputAndroid, 'Malta')

    await this.monacoOptionAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.monacoOptionAndroid)
    
    // Select currency (Euro)
    await this.currencyPickerAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.currencyPickerAndroid)
    
    await this.euroOptionAndroid.waitForDisplayed({ timeout: 10000 })
    await this.tap(this.euroOptionAndroid)
    
    // Now continue button should be enabled
    await browser.pause(500)
    await this.countryContinueBtnAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.countryContinueBtnAndroid)
  }

  async continueFromCountrySelectionIOS() {
    if (!browser.isIOS) return

    await this.countryPickerIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.countryPickerIOS)

    await this.countrySearchInputIOS.waitForDisplayed({ timeout: 15000 })
    await this.type(this.countrySearchInputIOS, 'Malta')

    await this.monacoOptionIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.monacoOptionIOS)

    await this.countryContinueBtnIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.countryContinueBtnIOS)
  }

  async fillBeneficiaryDetailsAndroid(params: {
    name: string
    surname: string
    iban: string
    friendName?: string
  }) {
    if (!browser.isAndroid) return

    await this.nameInputAndroid.waitForDisplayed({ timeout: 20000 })
    await this.type(this.nameInputAndroid, params.name)

    await this.surnameInputAndroid.waitForDisplayed({ timeout: 15000 })
    await this.type(this.surnameInputAndroid, params.surname)

    await this.setIbanAndroid(params.iban)

    // Expect continue button to appear after IBAN is filled
    await this.detailsContinueViewAndroid.waitForDisplayed({ timeout: 8000 }).catch(() => {})

    if (params.friendName) {
      const shown = await this.friendNameInputAndroid.waitForDisplayed({ timeout: 4000 }).catch(() => false)
      if (shown) await this.type(this.friendNameInputAndroid, params.friendName)
    }
  }

  async fillBeneficiaryDetailsIOS(params: {
    name: string
    surname: string
    iban: string
    friendName?: string
  }) {
    if (!browser.isIOS) return

    await this.nameInputIOS.waitForDisplayed({ timeout: 20000 })
    await this.type(this.nameInputIOS, params.name)

    await this.surnameInputIOS.waitForDisplayed({ timeout: 15000 })
    await this.type(this.surnameInputIOS, params.surname)

    await this.ibanInputIOS.waitForDisplayed({ timeout: 15000 })
    await this.type(this.ibanInputIOS, params.iban)

    if (params.friendName) {
      const shown = await this.friendNameInputIOS.waitForDisplayed({ timeout: 4000 }).catch(() => false)
      if (shown) await this.type(this.friendNameInputIOS, params.friendName)
    }
  }

  async continueFromDetailsAndroid() {
    if (!browser.isAndroid) return
    const buttonVisible = await this.detailsContinueBtnAndroid.waitForDisplayed({ timeout: 8000 }).catch(() => false)
    if (buttonVisible) {
      await this.tap(this.detailsContinueBtnAndroid)
      return
    }

    await this.detailsContinueViewAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.detailsContinueViewAndroid)
  }

  private async confirmCreationIfRequiredAndroid() {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const confirmCandidates = [
      this.vopConfirmBtnAndroid,
      this.vopConfirmBtnAndroidByText,
      this.createConfirmBtnAndroidById,
      this.createConfirmBtnAndroidByTextConfirm,
    ]

    const shouldConfirm = await browser.waitUntil(
      async () => {
        await this.recoverFromTryAgainSheetAndroid().catch(() => false)

        const otpShown = await this.otpInputAndroid.isDisplayed().catch(() => false)
        if (otpShown) return false

        const detailsStillShown = await this.detailsContinueViewAndroid.isDisplayed().catch(() => false)
        if (!detailsStillShown) {
          const homeShown = await this.homeRootAndroid.isDisplayed().catch(() => false)
          const payShown = await this.payTabAndroid.isDisplayed().catch(() => false)
          if (homeShown || payShown) return false
        }

        for (const candidate of confirmCandidates) {
          if (await candidate.isDisplayed().catch(() => false)) return true
        }
        return false
      },
      {
        timeout: 12000,
        interval: 400,
      }
    ).catch(() => false)

    if (!shouldConfirm) return

    for (const candidate of confirmCandidates) {
      const shown = await candidate.isDisplayed().catch(() => false)
      if (!shown) continue

      await this.tap(candidate).catch(async () => {
        await candidate.click().catch(() => {})
      })
      await browser.pause(500)
      return
    }
  }

  private async waitForOtpAndSubmitAndroid(expectedIban?: string) {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const otpAppeared = await browser.waitUntil(
      async () => {
        await this.recoverFromTryAgainSheetAndroid().catch(() => false)

        const vopShown = await this.vopScreenAndroid.isDisplayed().catch(() => false)
        if (vopShown) {
          const vopConfirmShown = await this.vopConfirmBtnAndroid.isDisplayed().catch(() => false)
          if (vopConfirmShown) {
            await this.tap(this.vopConfirmBtnAndroid).catch(() => {})
            await browser.pause(400)
          } else if (await this.vopConfirmBtnAndroidByText.isDisplayed().catch(() => false)) {
            await this.tap(this.vopConfirmBtnAndroidByText).catch(() => {})
            await browser.pause(400)
          }
        }

        const containerShown = await this.otpContainerAndroid.isDisplayed().catch(() => false)
        const inputShown = await this.otpInputAndroid.isDisplayed().catch(() => false)

        if (containerShown || inputShown) return true

        // Some users can proceed without OTP screen in this flow.
        const detailsStillShown = await this.detailsContinueViewAndroid.isDisplayed().catch(() => false)
        const homeShown = await this.homeRootAndroid.isDisplayed().catch(() => false)
        const payShown = await this.payTabAndroid.isDisplayed().catch(() => false)
        const newTransferShown = await this.newTransferTitleAndroid.isDisplayed().catch(() => false)

        if (!detailsStillShown && (homeShown || payShown || newTransferShown)) {
          return true
        }

        return false
      },
      {
        timeout: 30000,
        interval: 500,
        timeoutMsg: 'Neither OTP nor next screen appeared (Android)',
      }
    ).catch(() => false)

    if (!otpAppeared) {
      throw new Error('OTP step did not appear and flow did not move to a known next screen (Android)')
    }

    const otpInputShown = await this.otpInputAndroid.isDisplayed().catch(() => false)
    if (!otpInputShown) {
      // Flow may advance without OTP input for some users.
      const detailsStillShown = await this.detailsContinueViewAndroid.isDisplayed().catch(() => false)
      const homeShown = await this.homeRootAndroid.isDisplayed().catch(() => false)
      const payShown = await this.payTabAndroid.isDisplayed().catch(() => false)
      const newTransferShown = await this.newTransferTitleAndroid.isDisplayed().catch(() => false)

      if (!detailsStillShown && (homeShown || payShown || newTransferShown)) {
        return
      }

      throw new Error('Flow moved unexpectedly after details confirm: OTP input not shown and no known next screen detected')
    }

    const otpLockedBeforeSubmit = await this.otpLockedErrorAndroid.isDisplayed().catch(() => false)
    if (otpLockedBeforeSubmit) {
      throw new Error('OTP step blocked (Android): Too many attempts. Account is temporarily locked')
    }

    const otpPhone = process.env.OTP_PHONE || process.env.MB_PHONE || ''
    if (!otpPhone) {
      throw new Error('OTP phone is not configured. Set OTP_PHONE or MB_PHONE')
    }

    const otpPhoneShown = await this.otpPhoneViewAndroid.isDisplayed().catch(() => false)
    if (!otpPhoneShown) {
      throw new Error('OTP phone label is not visible on OTP screen')
    }

    const shownPhoneText = await this.otpPhoneViewAndroid.getText().catch(() => '')
    const shownDigits = shownPhoneText.replace(/\D/g, '')
    const expectedDigits = String(otpPhone).replace(/\D/g, '')
    const countryCode = String(process.env.OTP_COUNTRY_CODE || '356').replace(/\D/g, '')
    const expectedWithCountry = expectedDigits.startsWith(countryCode) ? expectedDigits : `${countryCode}${expectedDigits}`
    const expectedLocal = expectedWithCountry.startsWith(countryCode)
      ? expectedWithCountry.slice(countryCode.length)
      : expectedDigits

    const phoneMatches = Boolean(
      shownDigits && (
        shownDigits === expectedDigits ||
        shownDigits === expectedWithCountry ||
        (expectedLocal ? shownDigits.endsWith(expectedLocal) : false)
      )
    )

    if (!phoneMatches) {
      throw new Error(
        `OTP phone mismatch. Expected ${expectedWithCountry} (or local ${expectedLocal}), but screen shows ${shownPhoneText}`
      )
    }

    await this.otpInputAndroid.waitForDisplayed({ timeout: 20000 })

    const otpFetchDelayMs = Number(process.env.OTP_FETCH_DELAY_MS || 20000)
    const otpStepTimeoutMs = Number(process.env.OTP_STEP_TIMEOUT_MS || 45000)
    const otpWaitIntervalMs = Number(process.env.OTP_WAIT_INTERVAL_MS || 1000)
    const otpKeyIntervalMs = Number(process.env.OTP_KEY_INTERVAL_MS || 250)
    if (Number.isFinite(otpFetchDelayMs) && otpFetchDelayMs > 0) {
      await browser.pause(Math.floor(otpFetchDelayMs))
    }

    const otp = await OtpHelper.getLatestOtp({
      phone: otpPhone,
      timeoutMs: Number(process.env.OTP_TIMEOUT_MS || 90000),
      intervalMs: Number(process.env.OTP_POLL_INTERVAL_MS || 2000),
      maxRequests: Number(process.env.OTP_MAX_REQUESTS || 1),
    })

    const otpLockedBeforeTyping = await this.otpLockedErrorAndroid.isDisplayed().catch(() => false)
    if (otpLockedBeforeTyping) {
      throw new Error('OTP step blocked before typing (Android): Too many attempts. Account is temporarily locked')
    }

    await browser.waitUntil(
      async () => {
        const otpLocked = await this.otpLockedErrorAndroid.isDisplayed().catch(() => false)
        if (otpLocked) {
          throw new Error('OTP step blocked before typing (Android): Too many attempts. Account is temporarily locked')
        }
        return await this.otpInputAndroid.isEnabled().catch(() => false)
      },
      {
        timeout: 20000,
        interval: 500,
        timeoutMsg: 'OTP input is not enabled on Android',
      }
    )

    await browser.pause(10000)

    const readOtpInputDigits = async () => {
      const fromAttr = await this.otpInputAndroid.getAttribute('text').catch(() => '')
      if (fromAttr) return String(fromAttr).replace(/\D/g, '')

      const fromText = await this.otpInputAndroid.getText().catch(() => '')
      return String(fromText).replace(/\D/g, '')
    }

    let enteredOtp = ''
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await this.tap(this.otpInputAndroid)
      await this.otpInputAndroid.clearValue().catch(() => {})

      // Prefer real keyboard input for OTP; keep addValue as last-resort fallback.
      if (attempt <= 2) {
        for (const digit of otp.split('')) {
          await browser.keys(digit)
          if (Number.isFinite(otpKeyIntervalMs) && otpKeyIntervalMs > 0) {
            await browser.pause(Math.floor(otpKeyIntervalMs))
          }
        }
      } else {
        for (const digit of otp.split('')) {
          await this.otpInputAndroid.addValue(digit)
          if (Number.isFinite(otpKeyIntervalMs) && otpKeyIntervalMs > 0) {
            await browser.pause(Math.floor(otpKeyIntervalMs))
          }
        }
      }

      enteredOtp = await readOtpInputDigits()
      if (enteredOtp === otp) break

      if (attempt < 3) {
        await browser.pause(500)
      }
    }

    if (enteredOtp !== otp) {
      throw new Error(`OTP input mismatch on Android. Expected ${otp}, but field has ${enteredOtp || '<empty>'}`)
    }

    await browser.hideKeyboard().catch(() => {})

    let successPopupSeen = false

    await browser.waitUntil(
      async () => {
        // If backend popup appears after OTP submit, keep dismissing it (OK) and continue waiting.
        await this.recoverFromTryAgainSheetAndroid().catch(() => false)
        await this.dismissBlockingAlertAndroid(2000).catch(() => {})

        const otpLocked = await this.otpLockedErrorAndroid.isDisplayed().catch(() => false)
        if (otpLocked) {
          throw new Error('OTP step blocked (Android): Too many attempts. Account is temporarily locked')
        }

        const successPopupShown = await this.beneficiaryAddedSuccessAndroidByText.isDisplayed().catch(() => false)
        if (successPopupShown) {
          successPopupSeen = true
          return false
        }

        if (expectedIban) {
          const addedBeneficiaryShown = await this.isAddedBeneficiaryIbanVisibleAndroid(expectedIban)
          if (addedBeneficiaryShown) {
            return true
          }
        }

        const homeShown = await this.homeRootAndroid.isDisplayed().catch(() => false)
        const payShown = await this.payTabAndroid.isDisplayed().catch(() => false)
        const newTransferShown = await this.newTransferTitleAndroid.isDisplayed().catch(() => false)

        // Fallback only when IBAN anchor was not provided.
        if (!expectedIban && (homeShown || payShown || newTransferShown)) return true

        // Keep waiting while OTP screen is still visible.
        const otpStillShown = await this.otpInputAndroid.isDisplayed().catch(() => false)
        if (otpStillShown) return false

        // OTP may disappear briefly during transitions; keep waiting for a stable next screen.
        return false
      },
      {
        timeout: otpStepTimeoutMs,
        interval: otpWaitIntervalMs,
        timeoutMsg: expectedIban
          ? `OTP step did not complete (Android): success/beneficiary screen with IBAN ${expectedIban} did not appear`
          : 'OTP step did not complete (Android): next screen did not appear',
      }
    )

    if (expectedIban && !successPopupSeen) {
      console.warn('[OTP] Success popup was not observed; continued by IBAN anchor on beneficiary screen')
    }
  }

  private async forceResendOtpBeforeFetchAndroid() {
    if (!browser.isAndroid) return

    const enabledRaw = String(process.env.OTP_FORCE_RESEND_BEFORE_FETCH || '').trim().toLowerCase()
    const enabled = enabledRaw === '1' || enabledRaw === 'true' || enabledRaw === 'yes'
    if (!enabled) return

    const waitMs = Number(process.env.OTP_RESEND_WAIT_MS || 70000)
    const postResendPauseMs = Number(process.env.OTP_POST_RESEND_PAUSE_MS || 1500)
    const start = Date.now()

    while (Date.now() - start < waitMs) {
      const resendById = await this.otpResendBtnAndroidById.isDisplayed().catch(() => false)
      if (resendById) {
        await this.tap(this.otpResendBtnAndroidById).catch(() => {})
        await browser.pause(postResendPauseMs)
        return
      }

      const resendByText = await this.otpResendBtnAndroidByText.isDisplayed().catch(() => false)
      if (resendByText) {
        await this.tap(this.otpResendBtnAndroidByText).catch(() => {})
        await browser.pause(postResendPauseMs)
        return
      }

      const resendByDesc = await this.otpResendBtnAndroidByDesc.isDisplayed().catch(() => false)
      if (resendByDesc) {
        await this.tap(this.otpResendBtnAndroidByDesc).catch(() => {})
        await browser.pause(postResendPauseMs)
        return
      }

      const countdownShown = await this.otpCountdownAndroid.isDisplayed().catch(() => false)
      if (!countdownShown) {
        await browser.pause(700)
        continue
      }

      await browser.pause(1000)
    }

    throw new Error(`OTP resend button did not appear within ${waitMs}ms while OTP_FORCE_RESEND_BEFORE_FETCH is enabled`)
  }

  private async waitForPostDetailsTransitionAndroid() {
    if (!browser.isAndroid) return

    await browser.waitUntil(
      async () => {
        const otpShown = await this.otpInputAndroid.isDisplayed().catch(() => false)
        if (otpShown) return true

        const otpContainerShown = await this.otpContainerAndroid.isDisplayed().catch(() => false)
        if (otpContainerShown) return true

        const vopShown = await this.vopScreenAndroid.isDisplayed().catch(() => false)
        if (vopShown) return true

        const createConfirmShown = await this.createConfirmBtnAndroidById.isDisplayed().catch(() => false)
        if (createConfirmShown) return true

        const createConfirmByTextShown = await this.createConfirmBtnAndroidByTextConfirm.isDisplayed().catch(() => false)
        if (createConfirmByTextShown) return true

        const homeShown = await this.homeRootAndroid.isDisplayed().catch(() => false)
        const payShown = await this.payTabAndroid.isDisplayed().catch(() => false)
        const newTransferShown = await this.newTransferTitleAndroid.isDisplayed().catch(() => false)
        if (homeShown || payShown || newTransferShown) return true

        return false
      },
      {
        timeout: 12000,
        interval: 400,
      }
    ).catch(() => false)
  }

  async continueFromDetailsIOS() {
    if (!browser.isIOS) return
    await this.detailsContinueBtnIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.detailsContinueBtnIOS)
  }

  /**
   * One-shot E2E flow to add beneficiary of type "Another person" on Android, starting from Pay tab. Used in addbeneficiary.individual.spec.ts, but can be reused in future tests if needed.
   */
  async addBeneficiaryAnotherPersonAndroid(params: {
    name: string
    surname: string
    iban: string
    friendName?: string
  }) {
    await this.startAddBeneficiaryAndroid()
    await this.chooseAnotherPersonAndroid()
    await this.continueFromCountrySelectionAndroid()

    await this.fillBeneficiaryDetailsAndroid(params)
    await this.continueFromDetailsAndroid()
    await this.waitForPostDetailsTransitionAndroid()
    // Temporary: extra confirm click disabled to avoid possible double-submit / second OTP request.
    // await this.confirmCreationIfRequiredAndroid()
    await this.waitForOtpAndSubmitAndroid(params.iban)
  }

  async addBeneficiaryAnotherPersonIOS(params: {
    name: string
    surname: string
    iban: string
    friendName?: string
  }) {
    await this.startAddBeneficiaryIOS()
    await this.chooseAnotherPersonIOS()
    await this.continueFromCountrySelectionIOS()

    await this.fillBeneficiaryDetailsIOS(params)
    await this.continueFromDetailsIOS()
  }

  async addBeneficiaryAnotherPerson(params: {
    name: string
    surname: string
    iban: string
    friendName?: string
  }) {
    if (browser.isAndroid) {
      await this.addBeneficiaryAnotherPersonAndroid(params)
      return
    }

    if (browser.isIOS) {
      await this.addBeneficiaryAnotherPersonIOS(params)
      return
    }

    throw new Error('Unsupported platform for addBeneficiaryAnotherPerson')
  }
}