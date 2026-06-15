import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'
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

    await this.userAvatarBtnAndroid.waitForDisplayed({ timeout: 15000 })
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

    await this.homeRootAndroid.waitForDisplayed({ timeout: 30000 }).catch(() => {})
    await this.businessAccountLabelAndroid.waitForDisplayed({ reverse: true, timeout: 30000 }).catch(() => {})
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
      const shown = await candidate.isDisplayed().catch(() => false)
      if (!shown) continue

      await this.type(candidate, bic)
      return
    }

    console.warn('[AddBeneficiary] BIC input not found on iOS details screen, skipping BIC fill')
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

    // Keep the same Android stabilization pattern as Add Funds: loginFlow already
    // waits for Home, then we only normalize account and clear transient alerts.
    await this.ensureSingleAccountAndroid()
    await browser.pause(700)
    await this.dismissBlockingAlertAndroid(3000).catch(() => {})
    await this.stabilizeAndroidHomeSurface(15000).catch(() => false)

    // 1️ Pay tab
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
    bic?: string
    friendName?: string
  }) {
    if (!browser.isAndroid) return

    await this.nameInputAndroid.waitForDisplayed({ timeout: 20000 })
    await this.type(this.nameInputAndroid, params.name)

    await this.surnameInputAndroid.waitForDisplayed({ timeout: 15000 })
    await this.type(this.surnameInputAndroid, params.surname)

    await this.setIbanAndroid(params.iban)

    if (params.bic) {
      await this.setBicAndroid(params.bic)
    }

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
    bic?: string
    friendName?: string
  }) {
    if (!browser.isIOS) return

    await this.nameInputIOS.waitForDisplayed({ timeout: 20000 })
    await this.type(this.nameInputIOS, params.name)

    await this.surnameInputIOS.waitForDisplayed({ timeout: 15000 })
    await this.type(this.surnameInputIOS, params.surname)

    await this.ibanInputIOS.waitForDisplayed({ timeout: 15000 })
    await this.type(this.ibanInputIOS, params.iban)

    if (params.bic) {
      await this.setBicIOS(params.bic)
    }

    if (params.friendName) {
      const shown = await this.friendNameInputIOS.waitForDisplayed({ timeout: 4000 }).catch(() => false)
      if (shown) await this.type(this.friendNameInputIOS, params.friendName)
    }
  }

  async continueFromDetailsAndroid() {
    if (!browser.isAndroid) return

    console.log('[continueFromDetailsAndroid] Starting...')

    await browser.hideKeyboard().catch(() => {})

    const buttonVisible = await this.detailsContinueBtnAndroid.waitForDisplayed({ timeout: 8000 }).catch(() => false)
    console.log('[continueFromDetailsAndroid] buttonVisible:', buttonVisible)

    if (buttonVisible) {
      console.log('[continueFromDetailsAndroid] Tapping continue button (outer view)')
      await this.tap(this.detailsContinueBtnAndroid).catch(() => {})
    } else {
      console.log('[continueFromDetailsAndroid] Fallback: tapping view container')
      await this.detailsContinueViewAndroid.waitForDisplayed({ timeout: 10000 })
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

  private async waitForOtpAndSubmitAndroid(expectedIban?: string) {
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

    await this.otpInputAndroid.waitForDisplayed({ timeout: 15000 })

    const otpFetchDelayMs = Number(process.env.OTP_FETCH_DELAY_MS || 0)
    if (Number.isFinite(otpFetchDelayMs) && otpFetchDelayMs > 0) {
      await browser.pause(Math.floor(otpFetchDelayMs))
    }

    const beneficiaryOtpTimeoutMs = Math.max(
      90000,
      Number(process.env.BENEFICIARY_OTP_TIMEOUT_MS || process.env.OTP_TIMEOUT_MS || 90000)
    )
    const beneficiaryOtpMaxRequests = Number(process.env.BENEFICIARY_OTP_MAX_REQUESTS || 3)

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
        await this.otpInputAndroid.addValue(digit)
        await browser.pause(intervalMs)
      }
    }

    await enterOtpDigits(20)

    // Compose OTP auto-submits on 6th digit. If screen is still visible after 4s,
    // some digits were dropped — clear and retry with a longer interval.
    const autoSubmitted = await browser
      .waitUntil(async () => !(await this.otpInputAndroid.isDisplayed().catch(() => false)), {
        timeout: 4000,
        interval: 300,
      })
      .catch(() => false)

    if (!autoSubmitted) {
      console.warn('[OTP] Auto-submit did not fire — some digits may have dropped. Retrying with 100ms interval.')
      await enterOtpDigits(100)
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
          return false
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

        // Keep waiting while OTP screen is still visible.
        const otpStillShown = await this.otpInputAndroid.isDisplayed().catch(() => false)
        if (otpStillShown) return false

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
}
