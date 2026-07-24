import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'
import OtpHelper from '../helpers/otp.helper'

export default class AddBeneficiaryPage extends BasePage {
  private byAndroidResId(id: string) {
    const rx = `.*:id/${id}$|^${id}$`
    return $(`android=new UiSelector().resourceIdMatches("${rx}")`)
  }

  /* =========================
   * ANDROID: HOME / ACCOUNT (Single vs Business)
   * ========================= */

  private get userAvatarBtnAndroid() {
    return this.byAndroidResId('home_button_userAvatar')
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

  private get individualAccountItemAndroid() {
    return $('android=new UiSelector().description("Individual")')
  }

  private get individualAccountItemAndroidByText() {
    return $('android=new UiSelector().text("Individual")')
  }

  private get homeRootAndroid() {
    return this.byAndroidResId('home_screen')
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
    return $('-ios predicate string:name == "Individual" OR label == "Individual"')
  }

  private get homeRootIOS() {
    return $('~home_screen_view')
  }

  private get iosBundleId() {
    return process.env.BS_IOS_BUNDLE_ID || 'com.moneybase.quality'
  }

  private async activateMoneybaseIOS() {
    if (!browser.isIOS) return

    await browser.activateApp(this.iosBundleId).catch(() => {})
    await browser.pause(1000)
  }

  private async tapIOSScreenPoint(xRatio: number, yRatio: number, actionId: string) {
    const { width, height } = await browser.getWindowRect()
    await browser.performActions([
      {
        type: 'pointer',
        id: actionId,
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: Math.round(width * xRatio), y: Math.round(height * yRatio) },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
  }

  private async ensureIndividualAccountIOS() {
    if (!browser.isIOS) return

    await this.profilePickerUserNameLabelIOS.waitForExist({ timeout: 15000 })
    await this.tap(this.profilePickerUserNameLabelIOS)

    await this.profilePickerIndividualItemIOS.waitForExist({ timeout: 15000 })
    await this.tap(this.profilePickerIndividualItemIOS)

    await this.profilePickerIndividualItemIOS.waitForExist({ reverse: true, timeout: 15000 }).catch(() => {})
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

  private get closeSheetAndroidByXpath() {
    return $('//android.view.View[@content-desc="Close sheet"]')
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

  private get infoScreenAndroid() {
    return this.byAndroidResId('infoConstraintLayout')
  }

  private get infoHeaderAndroid() {
    return this.byAndroidResId('infoHeaderTextView')
  }

  private get infoDetailsAndroid() {
    return this.byAndroidResId('infoDetailsTextView')
  }

  private async dismissBlockingAlertAndroid(timeoutMs = 10000) {
    await this.dismissCommonAndroidAlert(timeoutMs).catch(() => false)
  }

  private async throwIfDeviceSecurityBlockedAndroid() {
    if (!browser.isAndroid) return

    const infoShown = await this.infoScreenAndroid.isDisplayed().catch(() => false)
    if (!infoShown) return

    const header = await this.infoHeaderAndroid.getText().catch(() => '')
    if (header !== 'Device Security') return

    const details = await this.infoDetailsAndroid.getText().catch(() => '')
    throw new Error(`[AddBeneficiary] BrowserStack device is blocked by Device Security screen: ${details}`)
  }

  private async waitForOtpRateLimitOrResendAndroid(maxWaitMs = 70000) {
    if (!browser.isAndroid) return

    const rateLimited = await this.otpRateLimitedErrorAndroid.isDisplayed().catch(() => false)
    if (!rateLimited) return

    console.log('[AddBeneficiary] OTP rate limited — waiting for limit to clear or resend button...')

    await browser.waitUntil(
      async () => {
        const stillRateLimited = await this.otpRateLimitedErrorAndroid.isDisplayed().catch(() => false)
        if (!stillRateLimited) {
          console.log('[AddBeneficiary] OTP rate limit cleared')
          return true
        }

        const resendCandidates = [this.otpResendBtnAndroidById, this.otpResendBtnAndroidByText]
        for (const btn of resendCandidates) {
          const shown = await btn.isDisplayed().catch(() => false)
          const enabled = shown ? await btn.isEnabled().catch(() => false) : false
          if (shown && enabled) {
            console.log('[AddBeneficiary] Tapping resend OTP button')
            await this.tap(btn).catch(() => {})
            await browser.pause(1500)
            return true
          }
        }

        return false
      },
      {
        timeout: maxWaitMs,
        interval: 1000,
        timeoutMsg: `[AddBeneficiary] OTP rate limit did not clear and no resend button found after ${maxWaitMs}ms`,
      }
    )
  }

  private async dismissErrorDialogAndroid(): Promise<boolean> {
    if (!browser.isAndroid) return false

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const titleCandidates = [this.somethingWentWrongTitleAndroid, this.somethingWentWrongTitleAndroidContains]
    const okCandidates = [this.alertBtn3Android, this.alertBtn3AndroidByUi, this.alertBtn3AndroidByText]

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

      await this.googlePayScreenAndroid.waitForExist({ reverse: true, timeout: timeoutMs }).catch(() => {})
      return
    }

    const shown = await this.googlePayNotNowAndroid.waitForExist({ timeout: 3000 }).catch(() => false)
    if (!shown) return

    await this.tap(this.googlePayNotNowAndroid)
    await this.googlePayNotNowAndroid.waitForExist({ reverse: true, timeout: timeoutMs }).catch(() => {})
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
      const otpInputShown = await this.otpInputAndroid.isDisplayed().catch(() => false)
      if (otpInputShown) return false

      await this.tap(this.closeSheetAndroid).catch(() => {})
      await browser.pause(400)
      return true
    }

    return false
  }

  private async ensureSingleAccountAndroid() {
    const isBusiness = await this.businessAccountLabelAndroid.isDisplayed().catch(() => false)
    if (!isBusiness) return

    await this.userAvatarBtnAndroid.waitForExist({ timeout: 15000 })
    await this.tap(this.userAvatarBtnAndroid)

    const accountCandidates = [
      this.individualAccountItemAndroid,
      this.individualAccountItemAndroidByText,
      this.singleAccountItemAndroid,
      this.singleAccountItemAndroidByText,
    ]

    let selectedAccount = false
    for (const account of accountCandidates) {
      if (await account.isDisplayed().catch(() => false)) {
        await this.tap(account)
        selectedAccount = true
        break
      }
    }

    if (!selectedAccount) {
      await this.closeSheetAndroid.isDisplayed().then(async (shown) => {
        if (shown) await this.tap(this.closeSheetAndroid).catch(() => {})
      }).catch(() => {})
    }

    await this.homeRootAndroid.waitForExist({ timeout: 30000 }).catch(() => {})
    await this.businessAccountLabelAndroid.waitForExist({ reverse: true, timeout: 30000 }).catch(() => {})
  }
  /* =========================
   * ANDROID: entry point (Pay tab) + Add Beneficiary
   * ========================= */

  private get payTabAndroid() {
    return this.byAndroidResId('navigation_button_pay')
  }

  private get payTabAndroidA11y() {
    return $('~Pay')
  }

  private get payTabAndroidLegacy() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_bar_item_icon_container").instance(2)')
  }


  private get payTabAndroidCandidates() {
    return [this.payTabAndroid, this.payTabAndroidLegacy, this.payTabAndroidA11y]
  }

 

  private async getDisplayedPayTabAndroid() {

    for (const candidate of this.payTabAndroidCandidates) {
      const shown = await candidate.isDisplayed().catch(() => false)
      if (shown) return candidate
    }

    return undefined
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

  private get payScreenIOS() {
    return $('-ios predicate string:name == "pay_screen_view" OR name == "pay_screen"')
  }

  private get newTransferTitleIOS() {
    return $('-ios predicate string:name == "New Transfer" OR label == "New Transfer"')
  }

  private get beneficiaryAddedSuccessIOS() {
    return $('-ios predicate string:(name CONTAINS[c] "beneficiary" OR label CONTAINS[c] "beneficiary") AND (name CONTAINS[c] "success" OR label CONTAINS[c] "success" OR name CONTAINS[c] "added" OR label CONTAINS[c] "added")')
  }

  private get genericAddedSuccessIOS() {
    return $('-ios predicate string:name CONTAINS[c] "added successfully" OR label CONTAINS[c] "added successfully" OR name CONTAINS[c] "successfully added" OR label CONTAINS[c] "successfully added"')
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

  private get unitedStatesOptionAndroid() {
    // The country list shows "United States of America", not "United States".
    return $('//android.widget.TextView[@text="United States of America"]')
  }

  private get currencyPickerAndroid() {
    return $('android=new UiSelector().resourceId("addBeneficiaryCountrySelection_picker_currency")')
  }

  private get euroOptionAndroid() {
    return $('~Euro')
  }

  private get usdOptionAndroid() {
    // Accessibility id is the full currency name, same pattern as "Euro" -> EUR.
    return $('~US Dollar')
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

  private get detailsContinueInnerButtonAndroid() {
    return $('//android.view.View[@resource-id="addBeneficiaryDetails_button_continue"]//android.widget.Button')
  }

  private get otpContainerAndroid() {
    return $('android=new UiSelector().resourceIdMatches("com.moneybase.qa:id/(composeViewRegisterMobile|composeViewOTP)")')
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

  private get otpSubmitBtnAndroidById() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/(.*otp.*(continue|confirm|submit).*)$")')
  }

  private get otpSubmitBtnAndroidByText() {
    return $('android=new UiSelector().textMatches("(?i)^(submit|confirm|continue)( otp| code)?$")')
  }

  private get otpLockedErrorAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/errorText").textContains("temporarily locked")')
  }

  private get otpRateLimitedErrorAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/errorText").textMatches("(?i).*code was recently sent.*|.*try again later.*")')
  }

  private get otpResendBtnAndroidById() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/(.*resend.*|.*send.*code.*)$")')
  }

  private get otpResendBtnAndroidByText() {
    return $('android=new UiSelector().textMatches("(?i)^(resend|resend code|send new code|request new code|get new code)$")')
  }

  private get ibanAlreadySavedErrorAndroidByText() {
    return $('android=new UiSelector().textMatches("(?i).*(beneficiary|iban).*(already|exists|saved|added).*|.*already.*(beneficiary|iban).*")')
  }

  private get ibanAlreadySavedErrorAndroidByResId() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/.*(error|message|hint|validation).*").textMatches("(?i).*(already|exists|saved|added).*(beneficiary|iban).*|.*(beneficiary|iban).*(already|exists|saved|added).*")')
  }

  private get ibanAlreadySavedErrorAndroidBySheetText() {
    return $('android=new UiSelector().textContains("already saved on your list")')
  }

  private get beneficiaryAddedSuccessAndroidByText() {
    return $('android=new UiSelector().textMatches("(?i).*added successfully.*|.*adding beneficiary successfully.*|.*beneficiary.*added.*success.*")')
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

  private get vopScreenAndroidAlt() {
    return $('android=new UiSelector().resourceId("verificationOfPayee_screen")')
  }

  private get vopConfirmBtnAndroid() {
    return $('android=new UiSelector().resourceId("varificationOfPayee_button_confirm")')
  }

  private get vopConfirmBtnAndroidAlt() {
    return $('android=new UiSelector().resourceId("verificationOfPayee_button_confirm")')
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

  private get bicInputAndroidById() {
    return $('android=new UiSelector().resourceId("addBeneficiaryDetails_input_bic")')
  }

  private get bicInputAndroidBySwiftId() {
    return $('android=new UiSelector().resourceId("addBeneficiaryDetails_input_swift")')
  }

  private get bicInputAndroidByBicSwiftId() {
    return $('android=new UiSelector().resourceId("addBeneficiaryDetails_input_bicSwift")')
  }

  private get bicInputAndroidByResIdRegex() {
    return $('android=new UiSelector().classNameMatches(".*EditText").resourceIdMatches(".*:id/.*(bic|swift).*")')
  }

  private get bicInputIOS() {
    return $('~addBeneficiary_textInput_bic')
  }

  private get bicSwiftInputIOS() {
    return $('~addBeneficiary_textInput_swift')
  }

  private get bicSwiftCombinedInputIOS() {
    return $('~addBeneficiary_textInput_bicSwift')
  }

  private get otpContainerIOS() {
    // otp_input may be absent from XCUITest tree on some iOS versions;
    // OTP_entry_0 (first digit slot) is always present when OTP screen is shown.
    return $('-ios predicate string:name == "otp_input" OR name == "OTP_entry_0"')
  }

  private getBeneficiaryByIbanIOS(iban: string) {
    const compact = String(iban || '').replace(/\s+/g, '').toUpperCase()
    const tail = compact.length > 8 ? compact.slice(-8) : compact
    return $(`-ios predicate string:label CONTAINS "${tail}" OR value CONTAINS "${tail}"`)
  }

  private async isPostOtpSuccessAnchorIOS(expectedIban?: string) {
    if (!browser.isIOS) return false

    if (await this.beneficiaryAddedSuccessIOS.isExisting().catch(() => false)) return true
    if (await this.genericAddedSuccessIOS.isExisting().catch(() => false)) return true

    if (expectedIban) {
      const ibanExists = await this.getBeneficiaryByIbanIOS(expectedIban).isExisting().catch(() => false)
      if (ibanExists) return true
    }

    if (await this.homeRootIOS.isExisting().catch(() => false)) return true
    if (await this.payTabIOS.isExisting().catch(() => false)) return true
    if (await this.payScreenIOS.isExisting().catch(() => false)) return true
    if (await this.addBtnIOS.isExisting().catch(() => false)) return true
    if (await this.newTransferTitleIOS.isExisting().catch(() => false)) return true
    if (await this.addBeneficiaryBtnIOS.isExisting().catch(() => false)) return true

    return false
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
    await this.ibanInputAndroid.waitForExist({ timeout: 15000 })
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

  private async resolveBicInputAndroid() {
    const candidates = [
      this.bicInputAndroidById,
      this.bicInputAndroidBySwiftId,
      this.bicInputAndroidByBicSwiftId,
      this.bicInputAndroidByResIdRegex,
    ]

    for (const candidate of candidates) {
      const shown = await candidate.isDisplayed().catch(() => false)
      if (shown) return candidate
    }

    return null
  }

  private async setBicAndroid(bic: string) {
    const input = await this.resolveBicInputAndroid()
    if (!input) {
      console.warn('[AddBeneficiary] BIC input not found on Android details screen, skipping BIC fill')
      return
    }

    await this.tap(input)
    await input.clearValue().catch(() => {})
    await input.setValue(bic)
    await browser.hideKeyboard().catch(() => {})
  }

  private async setBicIOS(bic: string) {
    const candidates = [this.bicInputIOS, this.bicSwiftInputIOS, this.bicSwiftCombinedInputIOS]

    for (const candidate of candidates) {
      const shown = await candidate.isExisting().catch(() => false)
      if (!shown) continue

      await this.type(candidate, bic)
      return
    }

    console.warn('[AddBeneficiary] BIC input not found on iOS details screen, skipping BIC fill')
  }

  /* =========================
   * ANDROID: US beneficiary details (account number + BIC/SWIFT)
   * Confirmed on real device: the US form has no routing number field.
   * It uses Account No. (addBeneficiaryDetails_input_accountNumber) plus the
   * same BIC/SWIFT field as the EUR flow — Continue stays disabled until BIC is filled.
   * ========================= */

  private get accountNumberInputAndroid() {
    return $('android=new UiSelector().resourceId("addBeneficiaryDetails_input_accountNumber")')
  }

  /** Step: enter beneficiary first/last name on the US details screen. */
  async enterBeneficiaryNameUSAndroid(name: string, surname: string) {
    if (!browser.isAndroid) return

    await this.nameInputAndroid.waitForExist({ timeout: 20000 })
    await this.type(this.nameInputAndroid, name)

    await this.surnameInputAndroid.waitForExist({ timeout: 15000 })
    await this.type(this.surnameInputAndroid, surname)
  }

  /** Step: enter the beneficiary's account number on the US details screen. */
  async enterBeneficiaryAccountNumberUSAndroid(accountNumber: string) {
    if (!browser.isAndroid) return

    await this.accountNumberInputAndroid.waitForExist({ timeout: 15000 })
    await this.tap(this.accountNumberInputAndroid)
    await this.accountNumberInputAndroid.clearValue().catch(() => {})
    await this.accountNumberInputAndroid.setValue(accountNumber)
  }

  /** Step: enter the BIC/SWIFT code on the US details screen. */
  async enterBeneficiaryBicUSAndroid(bic: string) {
    if (!browser.isAndroid) return
    await this.setBicAndroid(bic)
  }

  async fillBeneficiaryDetailsUSAndroid(params: {
    name: string
    surname: string
    accountNumber: string
    bic?: string
    friendName?: string
  }) {
    if (!browser.isAndroid) return

    await this.enterBeneficiaryNameUSAndroid(params.name, params.surname)
    await this.enterBeneficiaryAccountNumberUSAndroid(params.accountNumber)

    if (params.bic) {
      await this.enterBeneficiaryBicUSAndroid(params.bic)
    }

    await browser.hideKeyboard().catch(() => {})

    // Expect continue button to appear after account details are filled
    await this.detailsContinueViewAndroid.waitForExist({ timeout: 8000 }).catch(() => {})

    if (params.friendName) {
      const shown = await this.friendNameInputAndroid.waitForExist({ timeout: 4000 }).catch(() => false)
      if (shown) await this.type(this.friendNameInputAndroid, params.friendName)
    }
  }

  /* =========================
   * ANDROID: US beneficiary address screen
   * Confirmed on real device: US wire transfers require an extra address
   * screen (Address Line 1/2, City, Post Code) after the account/BIC screen.
   * None of its inputs expose a resourceId, so fields are matched by their
   * child label TextView text, and the screen is skipped if it never appears.
   * ========================= */

  private get addressCountryRowAndroid() {
    return $('//android.view.View[.//android.widget.TextView[@text="Country"]]')
  }

  private get addressLine1InputAndroid() {
    return $('//android.widget.EditText[.//android.widget.TextView[@text="Address Line 1"]]')
  }

  private get addressLine2InputAndroid() {
    return $('//android.widget.EditText[.//android.widget.TextView[@text="Address Line 2"]]')
  }

  private get cityInputAndroid() {
    return $('//android.widget.EditText[.//android.widget.TextView[@text="City"]]')
  }

  private get postCodeInputAndroid() {
    return $('//android.widget.EditText[.//android.widget.TextView[@text="Post Code"]]')
  }

  private get addressContinueBtnAndroid() {
    return $('//android.view.View[.//android.widget.TextView[@text="Continue"]]')
  }

  private async waitForAddressTransitionSignalAndroid(timeoutMs = 10000) {
    if (!browser.isAndroid) return false

    return await browser
      .waitUntil(
        async () => {
          await this.recoverFromTryAgainSheetAndroid().catch(() => false)

          const otpShown =
            (await this.otpContainerAndroid.isDisplayed().catch(() => false)) ||
            (await this.otpInputAndroid.isDisplayed().catch(() => false))
          if (otpShown) return true

          const vopShown =
            (await this.vopScreenAndroid.isDisplayed().catch(() => false)) ||
            (await this.vopScreenAndroidAlt.isDisplayed().catch(() => false))
          if (vopShown) return true

          // Confirm twice before declaring the address screen gone — Compose can
          // briefly hide elements during recomposition, the same flakiness seen on OTP.
          let addressStillShown = await this.addressLine1InputAndroid.isDisplayed().catch(() => false)
          if (!addressStillShown) {
            await browser.pause(300)
            addressStillShown = await this.addressLine1InputAndroid.isDisplayed().catch(() => false)
          }
          if (!addressStillShown) return true

          return false
        },
        { timeout: timeoutMs, interval: 250 }
      )
      .catch(() => false)
  }

  // Same fallback pattern as setIbanAndroid: setValue() can silently fail to reach
  // this field's Compose state, so verify via getText() and fall back to real
  // keystrokes (browser.keys()) which always reach the focused input.
  private async setAddressFieldAndroid(el: ChainablePromiseElement, value: string) {
    await this.tap(el)
    await el.clearValue().catch(() => {})
    await el.setValue(value)
    await browser.pause(150)

    const currentValue = await el.getText().catch(() => '')
    const currentAttr = await el.getAttribute('text').catch(() => '')
    const hasValue = (currentValue && currentValue.length > 0) || (currentAttr && currentAttr.length > 0)

    if (!hasValue) {
      await this.tap(el)
      await el.clearValue().catch(() => {})
      await browser.keys(value.split(''))
    }
  }

  async fillBeneficiaryAddressUSAndroid(params: {
    addressLine1: string
    addressLine2?: string
    city: string
    postCode: string
  }) {
    if (!browser.isAndroid) return

    let addressScreenShown = await this.addressCountryRowAndroid.waitForExist({ timeout: 20000 }).catch(() => false)

    if (!addressScreenShown) {
      // Backend can reject the account/BIC submission with a transient error.
      // "Try Again" resubmits the same request — worth one retry before giving up.
      const backendRejected = await this.tryAgainTextAndroid.isDisplayed().catch(() => false)
      if (backendRejected) {
        console.warn('[AddBeneficiary][USD] Backend rejected account/BIC submission — retrying via Try Again')
        await this.tap(this.tryAgainTextAndroid).catch(() => {})
        addressScreenShown = await this.addressCountryRowAndroid.waitForExist({ timeout: 20000 }).catch(() => false)
      }
    }

    if (!addressScreenShown) {
      const backendRejectedAgain = await this.tryAgainTextAndroid.isDisplayed().catch(() => false)
      if (backendRejectedAgain) {
        throw new Error(
          '[AddBeneficiary][USD] DIAG: backend rejected the account/BIC details twice ("Something went wrong" / Try Again shown) — likely a genuine backend issue, not a flake'
        )
      }
      throw new Error('[AddBeneficiary][USD] DIAG: address screen (Country row) never appeared within 20s')
    }

    // Tap the pre-filled Country row to "confirm" it — the rest of the address fields
    // may stay inert until this happens, even though they report enabled="true" in the XML.
    await this.tap(this.addressCountryRowAndroid).catch(() => {})
    await browser.pause(500)

    // If tapping reopened the same country picker used in the earlier step, re-select it.
    const countryPickerReopened = await this.countrySearchInputAndroid.isDisplayed().catch(() => false)
    if (countryPickerReopened) {
      await this.unitedStatesOptionAndroid.waitForExist({ timeout: 10000 }).catch(() => {})
      await this.tap(this.unitedStatesOptionAndroid).catch(() => {})
      await browser.pause(500)
    }

    const addressLine1Shown = await this.addressLine1InputAndroid.waitForExist({ timeout: 10000 }).catch(() => false)
    if (!addressLine1Shown) {
      throw new Error('[AddBeneficiary][USD] DIAG: Address Line 1 field never appeared after tapping Country row')
    }

    await this.setAddressFieldAndroid(this.addressLine1InputAndroid, params.addressLine1)

    if (params.addressLine2) {
      const addressLine2Shown = await this.addressLine2InputAndroid.isDisplayed().catch(() => false)
      if (addressLine2Shown) await this.setAddressFieldAndroid(this.addressLine2InputAndroid, params.addressLine2)
    }

    await this.setAddressFieldAndroid(this.cityInputAndroid, params.city)
    await this.setAddressFieldAndroid(this.postCodeInputAndroid, params.postCode)

    // Compose doesn't render the Continue button at all while the keyboard is open
    // on this screen, so closing it reliably (not just once) is required.
    for (let attempt = 0; attempt < 3; attempt++) {
      await browser.hideKeyboard().catch(() => {})
      const keyboardStillShown = await browser.isKeyboardShown().catch(() => false)
      if (!keyboardStillShown) break
      await browser.pressKeyCode(4).catch(() => {})
      await browser.pause(400)
    }

    const continueRowPresent = await this.addressContinueBtnAndroid.isDisplayed().catch(() => false)
    if (!continueRowPresent) {
      throw new Error(
        '[AddBeneficiary][USD] DIAG: Continue button not present in view hierarchy — keyboard likely still open after fill'
      )
    }

    const readBack = {
      addressLine1: await this.addressLine1InputAndroid.getText().catch(() => '<error>'),
      city: await this.cityInputAndroid.getText().catch(() => '<error>'),
      postCode: await this.postCodeInputAndroid.getText().catch(() => '<error>'),
    }

    const continueEnabledBeforeTap = await browser
      .waitUntil(
        async () => {
          const enabled = await this.addressContinueBtnAndroid.getAttribute('enabled').catch(() => null)
          return enabled === 'true'
        },
        { timeout: 5000, interval: 300 }
      )
      .catch(() => false)

    if (!continueEnabledBeforeTap) {
      throw new Error(
        `[AddBeneficiary][USD] DIAG: Continue still disabled after filling address. Read-back values: ${JSON.stringify(readBack)}`
      )
    }

    await this.tap(this.addressContinueBtnAndroid).catch(() => {})

    const transitioned = await this.waitForAddressTransitionSignalAndroid(15000)
    console.log('[fillBeneficiaryAddressUSAndroid] transitioned:', transitioned)
    if (!transitioned) {
      console.warn('[AddBeneficiary][USD] Address Continue tap did not trigger a detected transition — proceeding anyway')
    }
  }

  /* =========================
   * FLOW helpers
   * ========================= */

  async openPayTabAndroid() {
    if (!browser.isAndroid) return
    await this.payTabAndroid.waitForExist({ timeout: 20000 })
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
          await this.alertBtn3Android.waitForExist({ reverse: true, timeout: 7000 }).catch(() => {})
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

  /** Step: open the Pay tab from Home, ready to start a new transfer. */
  async openPayTabForBeneficiaryAndroid() {
    if (!browser.isAndroid) return

    // Keep the same Android stabilization pattern as Add Funds: loginFlow already
    // waits for Home, then we only normalize account and clear transient alerts.
    await this.ensureSingleAccountAndroid()
    await browser.pause(700)
    await this.dismissBlockingAlertAndroid(3000).catch(() => {})
    await this.stabilizeAndroidHomeSurface(15000).catch(() => false)

    const waitForPayTab = async (timeout: number) =>
      browser.waitUntil(
        async () => {
          await this.throwIfDeviceSecurityBlockedAndroid()

          const payShown = Boolean(await this.getDisplayedPayTabAndroid())
          if (payShown) return true

          // Optional popups: they may appear only for some users (e.g. existing card)
          const gpayShown = await this.googlePayNotNowAndroid.isDisplayed().catch(() => false)
          if (gpayShown) {
            await this.dismissGooglePayPromoAndroid()
          }

          await this.dismissErrorDialogAndroid()
          await this.dismissBlockingAlertAndroid(1500)

          return Boolean(await this.getDisplayedPayTabAndroid())
        },
        {
          timeout,
          interval: 500,
          timeoutMsg: 'Pay tab did not appear (Android)',
        }
      )

    await waitForPayTab(45000).catch(async () => {
      await browser.switchContext('NATIVE_APP').catch(() => {})
      await this.dismissBlockingAlertAndroid(3000).catch(() => {})
      await waitForPayTab(15000)
    })
    const payTab = await this.getDisplayedPayTabAndroid()
    if (!payTab) throw new Error('Pay tab did not appear (Android)')
    await this.tap(payTab)

    await browser.switchContext('NATIVE_APP').catch(() => {})
  }

  /** Step: tap "New" to open the transfer type sheet (skipped if it's already open). */
  async tapNewTransferOrAddAndroid() {
    if (!browser.isAndroid) return

    const newShown = await this.newBtnAndroid.waitForExist({ timeout: 5000 }).catch(() => false)
    if (newShown) {
      await this.tap(this.newBtnAndroid)
    } else {
      await this.newTransferTitleAndroid.waitForExist({ timeout: 8000 }).catch(() => {})
    }
  }

  /** Step: tap "Add Beneficiary" from the transfer type sheet. */
  async tapAddBeneficiaryBtnAndroid() {
    if (!browser.isAndroid) return

    await this.addBeneficiaryBtnAndroid.waitForExist({ timeout: 15000 })
    await this.tap(this.addBeneficiaryBtnAndroid)
  }

  async startAddBeneficiaryAndroid() {
    if (!browser.isAndroid) return

    await this.openPayTabForBeneficiaryAndroid()
    await this.tapNewTransferOrAddAndroid()
    await this.tapAddBeneficiaryBtnAndroid()
  }

  private async dismissShareContactsSheetIOS(timeout = 3000) {
    // iOS 16+ "Share All X Contacts" sheet is a SpringBoard system prompt.
    // Check for springboard in parallel with the first accessibility search to save time.
    const shareAllBtn = $('-ios predicate string:label BEGINSWITH "Share All" OR name BEGINSWITH "Share All"')
    const [shownViaA11y, source] = await Promise.all([
      shareAllBtn.waitForExist({ timeout }).catch(() => false),
      browser.getPageSource().catch(() => ''),
    ])

    if (shownViaA11y) {
      await shareAllBtn.click().catch(async () => { await this.tap(shareAllBtn) })
      await browser.pause(1000)
      return true
    }

    const isSpringboard = source.includes('bundleId="com.apple.springboard"')
    if (isSpringboard) {
      // Single tap only — retrying causes multiple taps into the contacts picker after first miss.
      // y=0.92 targets "Share All X Contacts" on iPhone 16 iOS 18 (Select Contacts is above ~0.88).
      console.warn('[AddBeneficiary][iOS] Share All sheet (springboard) — single coordinate tap y=0.92')
      await this.tapIOSScreenPoint(0.5, 0.92, 'finger-ios-share-all')
      await browser.pause(1000)
      return true
    }

    return false
  }

  async startAddBeneficiaryIOS() {
    if (!browser.isIOS) return

    // Attempt to pre-grant contacts via XCUITest execute — works on some real devices
    await browser.execute('mobile: setPermission', {
      bundleId: this.iosBundleId,
      access: 'contacts',
      value: 'yes',
    }).catch(() => {})

    await this.dismissShareContactsSheetIOS(5000)

    await this.ensureIndividualAccountIOS()

    await this.dismissShareContactsSheetIOS(5000)

    // Bring app to foreground in case a system sheet backgrounded it
    await this.activateMoneybaseIOS()

    // Dismiss iOS 16+ "Share All Contacts" system sheet if visible
    await this.dismissShareContactsSheetIOS()

    // Wait until home screen is stable before touching the tab bar
    await this.homeRootIOS.waitForExist({ timeout: 30000 }).catch(() => {})
    await browser.pause(500)

    await this.dismissShareContactsSheetIOS()

    // Tap Pay tab with retry in case a system sheet reappears mid-tap
    let payTapped = false
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const contactsShared = await this.dismissShareContactsSheetIOS(5000)
      if (contactsShared) {
        await this.activateMoneybaseIOS()
      }
      const payVisible = await this.payTabIOS.isExisting().catch(() => false)
      if (payVisible) {
        await this.payTabIOS.click().catch(() => {})
        payTapped = true
        break
      }
      await browser.pause(1000)
    }
    if (!payTapped) {
      await this.payTabIOS.waitForExist({ timeout: 10000 })
      await this.tap(this.payTabIOS)
    }

    await this.dismissShareContactsSheetIOS()

    const contactsShown = await this.contactsContinueBtnIOS.waitForExist({ timeout: 4000 }).catch(() => false)
    if (contactsShown) {
      await this.tap(this.contactsContinueBtnIOS)
      await browser.pause(500)
    }

    const addShown = await this.addBtnIOS.waitForExist({ timeout: 10000 }).catch(() => false)
    if (!addShown) {
      const contactsShared = await this.dismissShareContactsSheetIOS(5000)
      if (contactsShared) {
        await this.activateMoneybaseIOS()
      }

      const payVisible = await this.payTabIOS.waitForExist({ timeout: 5000 }).catch(() => false)
      if (payVisible) {
        await this.tap(this.payTabIOS)
        await browser.pause(500)
      }
    }

    // The contacts permission sheet can leave iOS focused on SpringBoard/App Switcher.
    // Bring Moneybase back before the final Add button wait, otherwise the XML only has SpringBoard nodes.
    await this.activateMoneybaseIOS()

    const addReadyAfterForeground = await this.addBtnIOS.waitForExist({ timeout: 5000 }).catch(() => false)
    if (!addReadyAfterForeground) {
      await this.dismissShareContactsSheetIOS(5000)
      await this.activateMoneybaseIOS()

      const payVisible = await this.payTabIOS.waitForExist({ timeout: 5000 }).catch(() => false)
      if (payVisible) {
        await this.tap(this.payTabIOS)
        await browser.pause(500)
      }
    }

    await this.addBtnIOS.waitForExist({ timeout: 15000 })
    await this.tap(this.addBtnIOS)

    await this.addBeneficiaryBtnIOS.waitForExist({ timeout: 15000 })
    await this.tap(this.addBeneficiaryBtnIOS)
  }

  async chooseAnotherPersonAndroid() {
    if (!browser.isAndroid) return
    await this.anotherPersonCardAndroid.waitForExist({ timeout: 15000 })
    await this.tap(this.anotherPersonCardAndroid)
  }

  async chooseAnotherPersonIOS() {
    if (!browser.isIOS) return
    await this.anotherPersonCardIOS.waitForExist({ timeout: 15000 })
    await this.tap(this.anotherPersonCardIOS)
  }

  /** Step: select country for the beneficiary (Malta for EUR, United States for USD/SWIFT). */
  async selectCountryForBeneficiaryAndroid(currency: 'EUR' | 'USD' = 'EUR') {
    if (!browser.isAndroid) return

    const countryName = currency === 'USD' ? 'United States' : 'Malta'
    const countryOption = currency === 'USD' ? this.unitedStatesOptionAndroid : this.monacoOptionAndroid

    await this.countryPickerAndroid.waitForExist({ timeout: 15000 })
    await this.tap(this.countryPickerAndroid)

    await this.countrySearchInputAndroid.waitForExist({ timeout: 15000 })
    await this.type(this.countrySearchInputAndroid, countryName)

    await countryOption.waitForExist({ timeout: 15000 })
    await this.tap(countryOption)
  }

  /** Step: select currency/wallet (Euro or USD) and tap Continue. */
  async selectCurrencyForBeneficiaryAndroid(currency: 'EUR' | 'USD' = 'EUR') {
    if (!browser.isAndroid) return

    const currencyOption = currency === 'USD' ? this.usdOptionAndroid : this.euroOptionAndroid

    await this.currencyPickerAndroid.waitForExist({ timeout: 15000 })
    await this.tap(this.currencyPickerAndroid)

    await currencyOption.waitForExist({ timeout: 10000 })
    await this.tap(currencyOption)

    // Now continue button should be enabled
    await browser.pause(500)
    await this.countryContinueBtnAndroid.waitForExist({ timeout: 15000 })
    await this.tap(this.countryContinueBtnAndroid)
  }

  async continueFromCountrySelectionAndroid(currency: 'EUR' | 'USD' = 'EUR') {
    if (!browser.isAndroid) return

    await this.selectCountryForBeneficiaryAndroid(currency)
    await this.selectCurrencyForBeneficiaryAndroid(currency)
  }

  async continueFromCountrySelectionIOS() {
    if (!browser.isIOS) return

    await this.countryPickerIOS.waitForExist({ timeout: 15000 })
    await this.tap(this.countryPickerIOS)

    await this.countrySearchInputIOS.waitForExist({ timeout: 15000 })
    await this.type(this.countrySearchInputIOS, 'Malta')

    await this.monacoOptionIOS.waitForExist({ timeout: 15000 })
    await this.tap(this.monacoOptionIOS)

    await this.countryContinueBtnIOS.waitForExist({ timeout: 15000 })
    await this.tap(this.countryContinueBtnIOS)
  }

  async fillBeneficiaryDetailsAndroid(params: {
    name: string
    surname: string
    iban: string
    bic?: string
    friendName?: string
  }) {
    if (!browser.isAndroid) return

    await this.nameInputAndroid.waitForExist({ timeout: 20000 })
    await this.type(this.nameInputAndroid, params.name)

    await this.surnameInputAndroid.waitForExist({ timeout: 15000 })
    await this.type(this.surnameInputAndroid, params.surname)

    await this.setIbanAndroid(params.iban)

    if (params.bic) {
      await this.setBicAndroid(params.bic)
    }

    // Expect continue button to appear after IBAN is filled
    await this.detailsContinueViewAndroid.waitForExist({ timeout: 8000 }).catch(() => {})

    if (params.friendName) {
      const shown = await this.friendNameInputAndroid.waitForExist({ timeout: 4000 }).catch(() => false)
      if (shown) await this.type(this.friendNameInputAndroid, params.friendName)
    }
  }

  async fillBeneficiaryDetailsIOS(params: {
    name: string
    surname: string
    iban: string
    bic?: string
    friendName?: string
  }) {
    if (!browser.isIOS) return

    await this.nameInputIOS.waitForExist({ timeout: 20000 })
    await this.type(this.nameInputIOS, params.name)

    await this.surnameInputIOS.waitForExist({ timeout: 15000 })
    await this.type(this.surnameInputIOS, params.surname)

    await this.ibanInputIOS.waitForExist({ timeout: 15000 })
    await this.type(this.ibanInputIOS, params.iban)

    if (params.bic) {
      await this.setBicIOS(params.bic)
    }

    if (params.friendName) {
      const shown = await this.friendNameInputIOS.waitForExist({ timeout: 4000 }).catch(() => false)
      if (shown) await this.type(this.friendNameInputIOS, params.friendName)
    }
  }

  async continueFromDetailsAndroid() {
    if (!browser.isAndroid) return

    console.log('[continueFromDetailsAndroid] Starting...')

    await browser.hideKeyboard().catch(() => {})

    const buttonVisible = await this.detailsContinueBtnAndroid.waitForExist({ timeout: 8000 }).catch(() => false)
    console.log('[continueFromDetailsAndroid] buttonVisible:', buttonVisible)

    if (buttonVisible) {
      console.log('[continueFromDetailsAndroid] Tapping continue button (outer view)')
      await this.tap(this.detailsContinueBtnAndroid).catch(() => {})
    } else {
      console.log('[continueFromDetailsAndroid] Fallback: tapping view container')
      await this.detailsContinueViewAndroid.waitForExist({ timeout: 10000 })
      await this.tap(this.detailsContinueViewAndroid).catch(() => {})
    }

    console.log('[continueFromDetailsAndroid] Waiting for transition signal (1st attempt, 10s)...')
    const transitioned = await this.waitForDetailsTransitionSignalAndroid(10000)
    console.log('[continueFromDetailsAndroid] Transition signal result:', transitioned)
    if (transitioned) return

    // Один force tap якщо звичайний не спрацював
    console.log('[continueFromDetailsAndroid] Attempting force tap...')
    await this.forceTapDetailsContinueAndroid().catch(() => {})
    console.log('[continueFromDetailsAndroid] Waiting for transition signal (2nd attempt after force tap, 10s)...')
    const transitionedAfterForceTap = await this.waitForDetailsTransitionSignalAndroid(10000)
    console.log('[continueFromDetailsAndroid] Transition signal after force tap:', transitionedAfterForceTap)
    if (transitionedAfterForceTap) return

    throw new Error('Continue tap did not trigger transition from Add Beneficiary details (Android)')
  }

  private async forceTapDetailsContinueAndroid() {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const target = (await this.detailsContinueBtnAndroid.isDisplayed().catch(() => false))
      ? this.detailsContinueBtnAndroid
      : this.detailsContinueViewAndroid

    const location = await target.getLocation()
    const size = await target.getSize()
    const x = Math.round(location.x + size.width / 2)
    const y = Math.round(location.y + size.height / 2)

    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger-details-continue',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
  }

  private async waitForDetailsTransitionSignalAndroid(timeoutMs = 3000) {
    if (!browser.isAndroid) return false

    console.log(`[waitForDetailsTransitionSignalAndroid] Starting with timeout: ${timeoutMs}ms`)

    return await browser
      .waitUntil(
        async () => {
          await this.recoverFromTryAgainSheetAndroid().catch(() => false)

          const otpShown =
            (await this.otpContainerAndroid.isDisplayed().catch(() => false)) ||
            (await this.otpInputAndroid.isDisplayed().catch(() => false))
          if (otpShown) {
            console.log('[waitForDetailsTransitionSignalAndroid] ✅ OTP detected')
            return true
          }

          const vopShown =
            (await this.vopScreenAndroid.isDisplayed().catch(() => false)) ||
            (await this.vopScreenAndroidAlt.isDisplayed().catch(() => false))
          if (vopShown) {
            console.log('[waitForDetailsTransitionSignalAndroid] ✅ VOP detected')
            return true
          }

          const detailsShown = await this.detailsContinueViewAndroid.isDisplayed().catch(() => false)
          console.log('[waitForDetailsTransitionSignalAndroid] Details form still visible:', detailsShown)
          if (!detailsShown) {
            console.log('[waitForDetailsTransitionSignalAndroid] ✅ Details form gone')
            return true
          }

          const ibanAlreadySaved = await this.isIbanAlreadySavedErrorAndroid().catch(() => false)
          if (ibanAlreadySaved) {
            console.log('[waitForDetailsTransitionSignalAndroid] ✅ IBAN already saved error detected')
            return true
          }

          return false
        },
        {
          timeout: timeoutMs,
          interval: 250,
        }
      )
      .catch((err) => {
        console.log('[waitForDetailsTransitionSignalAndroid] ⏱️ Timeout or error:', err.message)
        return false
      })
  }

  private async tryCompleteVopAndroid(): Promise<boolean> {
    const vopShown =
      (await this.vopScreenAndroid.isDisplayed().catch(() => false)) ||
      (await this.vopScreenAndroidAlt.isDisplayed().catch(() => false))

    if (!vopShown) return false

    const vopConfirmCandidates = [this.vopConfirmBtnAndroid, this.vopConfirmBtnAndroidAlt, this.vopConfirmBtnAndroidByText]
    for (const candidate of vopConfirmCandidates) {
      const shown = await candidate.isDisplayed().catch(() => false)
      if (!shown) continue

      await this.tap(candidate).catch(async () => {
        await candidate.click().catch(() => {})
      })
      await browser.pause(500)
      return true
    }

    return false
  }

  private async confirmCreationIfRequiredAndroid() {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const confirmCandidates = [
      this.vopConfirmBtnAndroid,
      this.vopConfirmBtnAndroidAlt,
      this.vopConfirmBtnAndroidByText,
      this.createConfirmBtnAndroidById,
      this.createConfirmBtnAndroidByTextConfirm,
    ]

    const shouldConfirm = await browser.waitUntil(
      async () => {
        await this.throwIfDeviceSecurityBlockedAndroid()
        await this.recoverFromTryAgainSheetAndroid().catch(() => false)

        const otpShown = await this.otpInputAndroid.isDisplayed().catch(() => false)
        if (otpShown) return false

        const detailsStillShown = await this.detailsContinueViewAndroid.isDisplayed().catch(() => false)
        if (!detailsStillShown) {
          const homeShown = await this.homeRootAndroid.isDisplayed().catch(() => false)
          const payShown = Boolean(await this.getDisplayedPayTabAndroid())
          if (homeShown || payShown) return false
        }

        const vopShown =
          (await this.vopScreenAndroid.isDisplayed().catch(() => false)) ||
          (await this.vopScreenAndroidAlt.isDisplayed().catch(() => false))
        if (vopShown) return true

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

    if (await this.tryCompleteVopAndroid().catch(() => false)) return

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

  async waitForOtpAndSubmitAndroid(expectedIban?: string) {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const otpAppeared = await browser.waitUntil(
      async () => {
        await this.recoverFromTryAgainSheetAndroid().catch(() => false)

        const vopShown =
          (await this.vopScreenAndroid.isDisplayed().catch(() => false)) ||
          (await this.vopScreenAndroidAlt.isDisplayed().catch(() => false))
        if (vopShown) {
          // VOP verification shown — just confirm without OTP to avoid rate limiting from additional API calls
          await this.tryCompleteVopAndroid().catch(() => false)
          return false // Wait for next screen after VOP confirm
        }

        const containerShown = await this.otpContainerAndroid.isDisplayed().catch(() => false)
        const inputShown = await this.otpInputAndroid.isDisplayed().catch(() => false)
        const phoneLabelShown = await this.otpPhoneViewAndroid.isDisplayed().catch(() => false)

        if (containerShown || inputShown || phoneLabelShown) return true

        // Some users can proceed without OTP screen in this flow.
        const detailsStillShown = await this.detailsContinueViewAndroid.isDisplayed().catch(() => false)
        const homeShown = await this.homeRootAndroid.isDisplayed().catch(() => false)
        const payShown = Boolean(await this.getDisplayedPayTabAndroid())
        const newTransferShown = await this.newTransferTitleAndroid.isDisplayed().catch(() => false)

        if (!detailsStillShown && (homeShown || payShown || newTransferShown)) {
          return true
        }

        return false
      },
      {
        timeout: 90000,
        interval: 500,
        timeoutMsg: 'Neither OTP nor next screen appeared (Android)',
      }
    ).catch(() => false)

    if (!otpAppeared) {
      const ibanAlreadySaved = await this.isIbanAlreadySavedErrorAndroid().catch(() => false)
      if (ibanAlreadySaved) {
        console.warn('[AddBeneficiary] IBAN already saved; finishing flow without OTP')
        return
      }

      throw new Error('OTP step did not appear and flow did not move to a known next screen (Android)')
    }

    const otpInputShown = await this.otpInputAndroid.isDisplayed().catch(() => false)
    const otpPhoneLabelShown = await this.otpPhoneViewAndroid.isDisplayed().catch(() => false)
    if (!otpInputShown && !otpPhoneLabelShown) {
      // Flow may advance without OTP input for some users.
      const detailsStillShown = await this.detailsContinueViewAndroid.isDisplayed().catch(() => false)
      const homeShown = await this.homeRootAndroid.isDisplayed().catch(() => false)
      const payShown = Boolean(await this.getDisplayedPayTabAndroid())
      const newTransferShown = await this.newTransferTitleAndroid.isDisplayed().catch(() => false)

      if (!detailsStillShown && (homeShown || payShown || newTransferShown)) {
        return
      }

      const ibanAlreadySaved = await this.isIbanAlreadySavedErrorAndroid().catch(() => false)
      if (ibanAlreadySaved) {
        console.warn('[AddBeneficiary] IBAN already saved; OTP is not required')
        return
      }

      throw new Error('Flow moved unexpectedly after details confirm: OTP input not shown and no known next screen detected')
    }

    const otpLockedBeforeSubmit = await this.otpLockedErrorAndroid.isDisplayed().catch(() => false)
    if (otpLockedBeforeSubmit) {
      throw new Error('OTP step blocked (Android): Too many attempts. Account is temporarily locked')
    }
    await this.waitForOtpRateLimitOrResendAndroid()

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

    await this.otpInputAndroid.waitForExist({ timeout: 15000 })

    const otpFetchDelayMs = Number(process.env.OTP_FETCH_DELAY_MS || 0)
    if (Number.isFinite(otpFetchDelayMs) && otpFetchDelayMs > 0) {
      await browser.pause(Math.floor(otpFetchDelayMs))
    }

    const beneficiaryOtpTimeoutMs = Math.max(
      90000,
      Number(process.env.BENEFICIARY_OTP_TIMEOUT_MS || process.env.OTP_TIMEOUT_MS || 90000)
    )
    const beneficiaryOtpMaxRequests = Number(process.env.BENEFICIARY_OTP_MAX_REQUESTS || 1)

    console.log(
      `[AddBeneficiary][OTP API] Fetching OTP with maxRequests=${beneficiaryOtpMaxRequests}, timeoutMs=${beneficiaryOtpTimeoutMs}`
    )

    const otp = await OtpHelper.getLatestOtp({
      phone: otpPhone,
      timeoutMs: beneficiaryOtpTimeoutMs,
      intervalMs: Number(process.env.OTP_POLL_INTERVAL_MS || 2000),
      maxRequests: beneficiaryOtpMaxRequests,
      requestTimeoutMs: Number(
        process.env.BENEFICIARY_OTP_REQUEST_TIMEOUT_MS ||
          process.env.OTP_REQUEST_TIMEOUT_MS ||
          beneficiaryOtpTimeoutMs
      ),
      excludeTokens: [process.env.LAST_LOGIN_OTP || ''],
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

    await browser.pause(3000)

    const enterOtpDigits = async (intervalMs: number) => {
      await this.tap(this.otpInputAndroid)
      await this.otpInputAndroid.clearValue().catch(() => {})
      await browser.pause(300)
      for (const digit of otp.split('')) {
        // No isDisplayed() check — Compose briefly hides the EditText during slot animation
        // which caused a false break after 2 digits. addValue will silently fail if auto-submitted.
        await this.otpInputAndroid.addValue(digit).catch(() => {})
        await browser.pause(intervalMs)
      }
    }

    await enterOtpDigits(20)

    const otpGoneOrSuccess = async () => {
      if (!(await this.otpInputAndroid.isDisplayed().catch(() => false))) return true
      if (await this.beneficiaryAddedSuccessAndroidByText.isDisplayed().catch(() => false)) return true
      return false
    }

    // Compose OTP auto-submits on 6th digit. Wait up to 15s — backend on BrowserStack
    // can take >4s to respond, causing a false-negative that triggered an unnecessary retry.
    const autoSubmitted = await browser
      .waitUntil(otpGoneOrSuccess, { timeout: 15000, interval: 300 })
      .catch(() => false)

    if (!autoSubmitted) {
      // Confirm OTP screen is still genuinely visible before retrying.
      // If backend already navigated away, skip retry to avoid tapping a gone element.
      const otpStillOnScreen = await this.otpInputAndroid.isDisplayed().catch(() => false)
      if (otpStillOnScreen) {
        console.warn('[OTP] Auto-submit did not fire — some digits may have dropped.')
        await this.recoverFromTryAgainSheetAndroid().catch(() => {})
        await browser.pause(500)
        console.warn('[OTP] Retrying with 100ms interval.')
        await enterOtpDigits(100)
        // Wait to confirm this retry triggered auto-submit or success appeared.
        await browser
          .waitUntil(otpGoneOrSuccess, { timeout: 15000, interval: 300 })
          .catch(() => {})
      }
    }

    await browser
      .waitUntil(
        async () => {
          const otpStillShown = await this.otpInputAndroid.isDisplayed().catch(() => false)
          if (!otpStillShown) return true

          const submitByIdReady =
            (await this.otpSubmitBtnAndroidById.isDisplayed().catch(() => false)) &&
            (await this.otpSubmitBtnAndroidById.isEnabled().catch(() => false))
          if (submitByIdReady) {
            await this.tap(this.otpSubmitBtnAndroidById).catch(() => {})
            return true
          }

          const submitByTextReady =
            (await this.otpSubmitBtnAndroidByText.isDisplayed().catch(() => false)) &&
            (await this.otpSubmitBtnAndroidByText.isEnabled().catch(() => false))
          if (submitByTextReady) {
            await this.tap(this.otpSubmitBtnAndroidByText).catch(() => {})
            return true
          }

          return false
        },
        { timeout: 30000, interval: 300 }
      )
      .catch(() => {})

    let successPopupSeen = false
    let otpReentryCount = 0
    let lastOtpReentryAt = 0

    await browser.waitUntil(
      async () => {
        // If backend popup appears after OTP submit, keep dismissing it (OK) and continue waiting.
        await this.recoverFromTryAgainSheetAndroid().catch(() => false)
        await this.dismissBlockingAlertAndroid(2000).catch(() => {})

        const otpLocked = await this.otpLockedErrorAndroid.isDisplayed().catch(() => false)
        if (otpLocked) {
          throw new Error('OTP step blocked (Android): Too many attempts. Account is temporarily locked')
        }
        // NOTE: "A code was recently sent" is an informational UI message (resend cooldown).
        // It does NOT mean our OTP submission failed — ignore it here and keep waiting for success.

        const successPopupShown = await this.beneficiaryAddedSuccessAndroidByText.isDisplayed().catch(() => false)
        if (successPopupShown) {
          successPopupSeen = true
          return true
        }

        if (expectedIban) {
          const addedBeneficiaryShown = await this.isAddedBeneficiaryIbanVisibleAndroid(expectedIban)
          if (addedBeneficiaryShown) {
            return true
          }
        }

        const homeShown = await this.homeRootAndroid.isDisplayed().catch(() => false)
        const payShown = Boolean(await this.getDisplayedPayTabAndroid())
        const newTransferShown = await this.newTransferTitleAndroid.isDisplayed().catch(() => false)

        // Accept stable next screen as success (some variants return to Home instead of showing beneficiary row immediately).
        if (homeShown || payShown || newTransferShown) {
          // When home screen appears, give it extra time to fully render Pay button and tabs
          console.log('[waitForOtpAndSubmitAndroid] Home screen detected, waiting for elements to stabilize...')
          await browser.pause(2000)

          // Re-check that elements are now visible
          const homeRecheckShown = await this.homeRootAndroid.isDisplayed().catch(() => false)
          const payRecheckShown = Boolean(await this.getDisplayedPayTabAndroid())
          const newTransferRecheckShown = await this.newTransferTitleAndroid.isDisplayed().catch(() => false)

          if (homeRecheckShown || payRecheckShown || newTransferRecheckShown) {
            console.log('[waitForOtpAndSubmitAndroid] ✅ Success: home/pay/transfer confirmed after stabilization')
            return true
          }
        }

        // OTP input still visible — digits may have been dropped or backend rejected the code.
        // Re-enter up to 2 more times with at least 8s between attempts.
        const otpStillShown = await this.otpInputAndroid.isDisplayed().catch(() => false)
        if (otpStillShown) {
          const now = Date.now()
          if (otpReentryCount < 2 && now - lastOtpReentryAt > 8000) {
            otpReentryCount++
            lastOtpReentryAt = now
            console.warn(`[OTP] Input still visible in poll loop — re-entering digits (attempt ${otpReentryCount}/2)`)
            await this.recoverFromTryAgainSheetAndroid().catch(() => {})
            await browser.pause(500)
            await enterOtpDigits(200)
          }
          return false
        }

        // OTP may disappear briefly during transitions; keep waiting for a stable next screen.
        return false
      },
      {
        timeout: 180000,
        interval: 1000,
        timeoutMsg: expectedIban
          ? `OTP step did not complete (Android): success/beneficiary screen with IBAN ${expectedIban} did not appear`
          : 'OTP step did not complete (Android): next screen did not appear',
      }
    )

    if (expectedIban && !successPopupSeen) {
      console.warn('[OTP] Success popup was not observed; continued by IBAN anchor on beneficiary screen')
    }
  }

  private async isIbanAlreadySavedErrorAndroid(): Promise<boolean> {
    if (!browser.isAndroid) return false

    const bySheetText = await this.ibanAlreadySavedErrorAndroidBySheetText.isDisplayed().catch(() => false)
    if (bySheetText) return true

    const byText = await this.ibanAlreadySavedErrorAndroidByText.isDisplayed().catch(() => false)
    if (byText) return true

    const byResId = await this.ibanAlreadySavedErrorAndroidByResId.isDisplayed().catch(() => false)
    if (byResId) return true

    return false
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

        const ibanAlreadySaved = await this.isIbanAlreadySavedErrorAndroid().catch(() => false)
        if (ibanAlreadySaved) return true

        const homeShown = await this.homeRootAndroid.isDisplayed().catch(() => false)
        const payShown = Boolean(await this.getDisplayedPayTabAndroid())
        const newTransferShown = await this.newTransferTitleAndroid.isDisplayed().catch(() => false)
        if (homeShown || payShown || newTransferShown) return true

        return false
      },
      {
        timeout: 45000,
        interval: 400,
      }
    ).catch(() => false)
  }

  async continueFromDetailsIOS() {
    if (!browser.isIOS) return

    await this.detailsContinueBtnIOS.waitForExist({ timeout: 15000 })

    // Dismiss keyboard first — on iOS a tap on Continue while the keyboard is open
    // only closes the keyboard without triggering the button.
    const keyboardShown = await browser.isKeyboardShown().catch(() => false)
    if (keyboardShown) {
      await browser.hideKeyboard().catch(() => {})
      await browser.pause(400)
    }

    await this.tap(this.detailsContinueBtnIOS)
    await browser.pause(500)

    // If the button is still on screen, the keyboard dismiss ate the first tap — retry once.
    const stillThere = await this.detailsContinueBtnIOS.isExisting().catch(() => false)
    if (stillThere) {
      await this.tap(this.detailsContinueBtnIOS)
    }
  }

  async confirmReviewBeneficiaryIOS() {
    if (!browser.isIOS) return
    const confirmBtn = $('-ios predicate string:name == "review_button_confirm" OR name == "Confirm" OR label == "Confirm"')
    const confirmText = $('-ios predicate string:name == "Confirm" OR label == "Confirm"')
    const reviewTitle = $('~Review Beneficiary')

    const reviewShown = await reviewTitle.waitForExist({ timeout: 30000 }).catch(() => false)
    if (!reviewShown) return

    // ~Review Beneficiary also appears as a back-nav label on the OTP screen.
    // otpContainerIOS now matches OTP_entry_0 so this check is reliable.
    const alreadyOnOtp = await this.otpContainerIOS.isExisting().catch(() => false)
    if (alreadyOnOtp) return

    await confirmBtn.waitForExist({
      timeout: 30000,
      timeoutMsg: '[AddBeneficiary][iOS] review_button_confirm did not appear on Review Beneficiary screen',
    })

    const tapConfirmCandidates = [
      async () => confirmBtn.click(),
      async () => this.tap(confirmBtn, 3000),
      async () => confirmText.click(),
      async () => {
        const location = await confirmBtn.getLocation()
        const size = await confirmBtn.getSize()
        await browser.performActions([
          {
            type: 'pointer',
            id: 'finger-ios-review-confirm',
            parameters: { pointerType: 'touch' },
            actions: [
              {
                type: 'pointerMove',
                duration: 0,
                x: Math.round(location.x + size.width / 2),
                y: Math.round(location.y + size.height / 2),
              },
              { type: 'pointerDown', button: 0 },
              { type: 'pause', duration: 100 },
              { type: 'pointerUp', button: 0 },
            ],
          },
        ])
        await browser.releaseActions().catch(() => {})
      },
    ]

    for (const tapConfirm of tapConfirmCandidates) {
      await tapConfirm().catch(() => {})
      const movedForward = await browser
        .waitUntil(
          async () => {
            const otpShown = await this.otpContainerIOS.isExisting().catch(() => false)
            if (otpShown) return true

            const stillOnReview = await reviewTitle.isExisting().catch(() => false)
            return !stillOnReview
          },
          { timeout: 5000, interval: 300 },
        )
        .catch(() => false)

      if (movedForward) return
    }

    throw new Error('[AddBeneficiary][iOS] Review Beneficiary Confirm did not advance to OTP/next screen')
  }

  async waitForOtpAndSubmitIOS(expectedIban?: string) {
    if (!browser.isIOS) return

    // Check OTP first — ~Review Beneficiary also appears as a back-nav label on the OTP screen,
    // so isExisting() on reviewEl would be true even after we've moved forward.
    const alreadyOnOtpBeforeReviewCheck = await this.otpContainerIOS.isExisting().catch(() => false)
    if (!alreadyOnOtpBeforeReviewCheck) {
      const reviewEl = $('~Review Beneficiary')
      const reviewStillShown = await reviewEl.isExisting().catch(() => false)
      if (reviewStillShown) {
        console.warn('[AddBeneficiary][iOS] Review screen still shown before OTP wait — tapping Confirm again')
        await this.confirmReviewBeneficiaryIOS()
      }
    }

    // Use waitForExist — otp_input may have visible=false (XCUITest Compose bug) while
    // still showing on screen. waitForDisplayed would time out in that case.
    await this.otpContainerIOS.waitForExist({
      timeout: 90000,
      timeoutMsg: '[AddBeneficiary][iOS] OTP screen did not appear after submitting beneficiary details',
    })

    const otpPhone = process.env.OTP_PHONE || process.env.MB_PHONE || ''
    if (!otpPhone) throw new Error('OTP phone is not configured. Set OTP_PHONE or MB_PHONE')

    const beneficiaryOtpTimeoutMs = Math.max(
      90000,
      Number(process.env.BENEFICIARY_OTP_TIMEOUT_MS || process.env.OTP_TIMEOUT_MS || 90000),
    )

    const otpFetchDelayMs = Number(process.env.OTP_FETCH_DELAY_MS || 0)
    if (Number.isFinite(otpFetchDelayMs) && otpFetchDelayMs > 0) {
      await browser.pause(Math.floor(otpFetchDelayMs))
    }

    console.log(`[AddBeneficiary][OTP iOS] Fetching OTP for ${otpPhone}`)
    const otp = await OtpHelper.getLatestOtp({
      phone: otpPhone,
      timeoutMs: beneficiaryOtpTimeoutMs,
      intervalMs: Number(process.env.OTP_POLL_INTERVAL_MS || 2000),
      maxRequests: Number(process.env.BENEFICIARY_OTP_MAX_REQUESTS || 1),
      requestTimeoutMs: Number(
        process.env.BENEFICIARY_OTP_REQUEST_TIMEOUT_MS ||
          process.env.OTP_REQUEST_TIMEOUT_MS ||
          beneficiaryOtpTimeoutMs,
      ),
      excludeTokens: [process.env.LAST_LOGIN_OTP || ''],
    })

    const enterOtpDigitsIOS = async (_delayMs: number) => {
      // Slots are XCUIElementTypeTextField named OTP_entry_0..5.
      // One addValue(otp) call types all 6 digits as a continuous stream so
      // XCUITest auto-advances slot focus without re-tapping slot 0 between chars.
      const firstSlot = $('//XCUIElementTypeTextField[starts-with(@name, "OTP_entry_")]')
      await firstSlot.waitForExist({ timeout: 15000, timeoutMsg: '[AddBeneficiary][iOS] OTP input fields not found' })
      await firstSlot.clearValue().catch(() => {})
      await firstSlot.addValue(otp)
    }

    await enterOtpDigitsIOS(50)

    // Wait for OTP to submit. Check positive success signals first, then use isExisting()
    // for OTP gone — isDisplayed() is unreliable when otp_input has visible=false (Compose bug).
    const otpGoneOrSuccess = async () => {
      if (await this.isPostOtpSuccessAnchorIOS(expectedIban)) return true
      return !(await this.otpContainerIOS.isExisting().catch(() => false))
    }
    const autoSubmitted = await browser
      .waitUntil(otpGoneOrSuccess, { timeout: 15000, interval: 300 })
      .catch(() => false)

    if (!autoSubmitted) {
      console.warn('[AddBeneficiary][iOS] OTP auto-submit did not fire — retrying with 100ms interval')
      await enterOtpDigitsIOS(100)
      await browser.waitUntil(otpGoneOrSuccess, { timeout: 15000, interval: 300 }).catch(() => {})
    }

    // Confirm success: home screen, Pay tab, Pay screen (even behind success overlay), or IBAN visible.
    // Delay first retry by initializing lastOtpReentryAt to now — prevents spurious re-entry
    // on the success screen if otp_input lingers in the accessibility tree after navigation.
    let otpReentryCount = 0
    let lastOtpReentryAt = Date.now()
    await browser.waitUntil(
      async () => {
        if (await this.isPostOtpSuccessAnchorIOS(expectedIban)) return true

        // Use isExisting — visible=false doesn't mean OTP screen is gone
        const otpStillShown = await this.otpContainerIOS.isExisting().catch(() => false)
        if (otpStillShown) {
          const now = Date.now()
          if (otpReentryCount < 2 && now - lastOtpReentryAt > 8000) {
            otpReentryCount++
            lastOtpReentryAt = now
            console.warn(`[AddBeneficiary][iOS] OTP still visible — re-entering digits (attempt ${otpReentryCount}/2)`)
            await enterOtpDigitsIOS(150)
          }
        }

        return false
      },
      {
        timeout: 180000,
        interval: 1000,
        timeoutMsg: '[AddBeneficiary][iOS] Success screen did not appear after OTP submit',
      },
    )
  }

  /**
   * One-shot E2E flow to add beneficiary of type "Another person" on Android, starting from Pay tab. Used in addbeneficiary.individual.spec.ts, but can be reused in future tests if needed.
   */
  async addBeneficiaryAnotherPersonAndroid(params: {
    name: string
    surname: string
    iban: string
    bic?: string
    friendName?: string
  }) {
    await this.startAddBeneficiaryAndroid()
    await this.chooseAnotherPersonAndroid()
    await this.continueFromCountrySelectionAndroid()

    await this.fillBeneficiaryDetailsAndroid(params)
    await this.continueFromDetailsAndroid()
    await this.waitForPostDetailsTransitionAndroid()

    // If the form reappeared (backend rejected submission), retry Continue once
    const formStillShown = await this.detailsContinueViewAndroid.isDisplayed().catch(() => false)
    if (formStillShown) {
      console.warn('[AddBeneficiary] Details form reappeared after Continue — retrying')
      await browser.pause(2000)
      await this.continueFromDetailsAndroid()
      await this.waitForPostDetailsTransitionAndroid()
    }

    // Temporary: extra confirm click disabled to avoid possible double-submit / second OTP request.
    // await this.confirmCreationIfRequiredAndroid()
    await this.waitForOtpAndSubmitAndroid(params.iban)
  }

  async addBeneficiaryAnotherPersonIOS(params: {
    name: string
    surname: string
    iban: string
    bic?: string
    friendName?: string
  }) {
    await this.startAddBeneficiaryIOS()
    await this.chooseAnotherPersonIOS()
    await this.continueFromCountrySelectionIOS()

    await this.fillBeneficiaryDetailsIOS(params)
    await this.continueFromDetailsIOS()
    await this.confirmReviewBeneficiaryIOS()
    await this.waitForOtpAndSubmitIOS(params.iban)
  }

  async addBeneficiaryAnotherPerson(params: {
    name: string
    surname: string
    iban: string
    bic?: string
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

  async addBeneficiaryAnotherPersonUSDAndroid(params: {
    name: string
    surname: string
    accountNumber: string
    bic?: string
    addressLine1: string
    addressLine2?: string
    city: string
    postCode: string
    friendName?: string
  }) {
    await this.startAddBeneficiaryAndroid()
    await this.chooseAnotherPersonAndroid()
    await this.continueFromCountrySelectionAndroid('USD')

    await this.fillBeneficiaryDetailsUSAndroid(params)
    await this.continueFromDetailsAndroid()

    // US wire transfers require an extra beneficiary address screen that the EUR/IBAN flow doesn't have.
    await this.fillBeneficiaryAddressUSAndroid(params)

    // The address Continue tap can silently fail to navigate (only warns, doesn't throw).
    // If we're still on the address screen, retry it once before waiting for OTP.
    const addressScreenStillShown = await this.addressCountryRowAndroid.isDisplayed().catch(() => false)
    if (addressScreenStillShown) {
      console.warn('[AddBeneficiary][USD] Address screen still shown after Continue — retrying')
      await browser.pause(2000)
      await this.fillBeneficiaryAddressUSAndroid(params)
    }

    await this.waitForPostDetailsTransitionAndroid()

    // If the form reappeared (backend rejected submission), retry Continue once
    const formStillShown = await this.detailsContinueViewAndroid.isDisplayed().catch(() => false)
    if (formStillShown) {
      console.warn('[AddBeneficiary][USD] Details form reappeared after Continue — retrying')
      await browser.pause(2000)
      await this.continueFromDetailsAndroid()
      await this.waitForPostDetailsTransitionAndroid()
    }

    // No IBAN anchor for US beneficiaries — success detection relies on the
    // "Added Successfully" popup / home screen checks inside waitForOtpAndSubmitAndroid.
    await this.waitForOtpAndSubmitAndroid()
  }

  async addBeneficiaryAnotherPersonUSD(params: {
    name: string
    surname: string
    accountNumber: string
    bic?: string
    addressLine1: string
    addressLine2?: string
    city: string
    postCode: string
    friendName?: string
  }) {
    if (browser.isAndroid) {
      await this.addBeneficiaryAnotherPersonUSDAndroid(params)
      return
    }

    throw new Error('USD beneficiary flow is not yet implemented for iOS')
  }
}
