import { $, browser, driver } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'
import { readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import BasePage from './BasePage'
import OtpHelper from '../helpers/otp.helper'
import { generateUniqueMalteseMobileNumber } from '../helpers/phone.helper'
import { loginPage } from './LoginPage'

type OnboardingData = {
  pin?: string
  firstName?: string
  lastName?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  postCode?: string
  country?: string
  company?: string
  occupation?: string
  previousEmployment?: string
  email?: string
}

const randomOnboardingName = () => {
  const firstNames = ['Carlos', 'Daniel', 'Mark', 'Luke', 'David', 'James', 'Michael', 'Thomas']
  const lastNames = ['Camilleri', 'Vella', 'Borg', 'Spiteri', 'Zammit', 'Azzopardi', 'Grima', 'Farrugia']
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]

  return {
    firstName,
    lastName,
  }
}

export default class OnboardingPage extends BasePage {
  private readonly androidAppPackage = process.env.BS_ANDROID_APP_PACKAGE || 'com.moneybase.qa'
  private readonly androidAppActivity =
    process.env.BS_ANDROID_APP_ACTIVITY || 'com.moneybase.views.activities.LoginActivity'
  private readonly isBrowserStack = process.env.BROWSERSTACK === 'true'
  private onboardingSomethingWentWrongRestarts = 0

  private byId(name: string) {
    if (browser.isIOS) return $(`~${name}`)

    const rx = `.*:id/${name}$|^${name}$`
    return $(`android=new UiSelector().resourceIdMatches("${rx}")`)
  }

  private get welcomeSkipBtn() {
    return this.byId('welcomeToMoneybase_button_skip')
  }

  private get registerScreen() {
    return this.byId('register_screen')
  }

  private get mobileInput() {
    return this.byId('register_input_mobileNumber')
  }

  private get mobileContinueBtn() {
    return this.byId('register_button_continue')
  }

  private get countryCodeBtn() {
    return this.byId('register_button_countryCode')
  }

  private get countrySearchTap() {
    if (browser.isIOS) return this.byId('countrySelection_search_tap')
    return $('android=new UiSelector().text("Search")')
  }

  private get passcodeScreen() {
    return this.byId('loginNewMobile_screen')
  }

  private get otpContainer() {
    if (browser.isIOS) return $('-ios predicate string:name == "otp_input"')
    return this.byId('composeViewRegisterMobile')
  }

  private get otpPhoneText() {
    if (browser.isIOS) return $('-ios predicate string:label BEGINSWITH "+356" OR value BEGINSWITH "+356"')
    return this.byId('tvMobileVerificationPhoneNumber')
  }

  private get otpInput() {
    if (browser.isIOS) return $('(//XCUIElementTypeOther[@name="otp_input"]//XCUIElementTypeTextField | //XCUIElementTypeTextField[starts-with(@name, "OTP_entry_")])[1]')
    return this.byId('otp_input')
  }

  private get otpInputExact() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/otp_input")')
  }

  private get verificationSuccessScreen() {
    return this.byId('verificationSuccess_screen')
  }

  private get iosConversationsCloseBtn() {
    return $('//XCUIElementTypeNavigationBar[@name="Conversations"]//XCUIElementTypeButton[@name="Close" or @label="Close"]')
  }

  private get verificationSuccessTitle() {
    return this.text('Mobile successfully verified.')
  }

  private get verificationContinueBtn() {
    if (browser.isIOS) return $('-ios predicate string:name == "modal_button_primary"')
    return $('//*[@resource-id="verificationSuccess_button_continue" or @resource-id="com.moneybase.qa:id/verificationSuccess_button_continue"]')
  }

  private get onboardingNameScreen() {
    if (browser.isIOS) return this.text('Your personal details')
    return this.byId('onboardingName_screen')
  }

  private get onboardingNameNextBtn() {
    if (browser.isIOS) return this.buttonByText('Next')
    return this.byId('onboardingName_button_next')
  }

  private get onboardingFirstNameInput() {
    if (browser.isIOS) return $('(//XCUIElementTypeTextField)[1]')
    return this.byId('onboardingName_input_firstName')
  }

  private get onboardingLastNameInput() {
    if (browser.isIOS) return $('(//XCUIElementTypeTextField)[2]')
    return this.byId('onboardingName_input_lastName')
  }

  private get onboardingDetailsScreen() {
    if (browser.isIOS) return this.text('Last few personal details')
    return this.byId('onboardingDetails_screen')
  }

  private get onboardingDetailsNextBtn() {
    if (browser.isIOS) return this.byId('taxDetails_button_next')
    return this.byId('onboardingDetails_button_next')
  }

  private get onboardingTaxCountryBtn() {
    if (browser.isIOS) return this.byId('taxDetails_button_taxCountryPicker')
    return this.byId('onboardingDetails_button_taxCountry')
  }

  private get onboardingEmploymentStatusBtn() {
    if (browser.isIOS) return this.byId('taxDetails_button_employmentStatusPicker')
    return this.byId('onboardingDetails_button_employmentStatus')
  }

  private get onboardingPoliticallyPersonBtn() {
    if (browser.isIOS) return this.byId('taxDetails_button_pepPicker')
    return this.byId('onboardingDetails_button_politicallyPerson')
  }

  private get onboardingCompanyInput() {
    if (browser.isIOS) return this.byId('taxDetails_textInput_company')
    return this.byId('onboardingDetails_input_company')
  }

  private get onboardingOccupationInput() {
    if (browser.isIOS) return this.byId('taxDetails_textInput_occupation')
    return this.byId('onboardingDetails_input_occupation')
  }

  private get taxCountrySearchInput() {
    if (browser.isIOS) return this.visibleSearchInput
    return this.byId('taxCountrySelection_input_search')
  }

  private get employmentStatusSearchInput() {
    if (browser.isIOS) return this.visibleSearchInput
    return this.byId('employmentStatusSelection_input_search')
  }

  private get politicallyPersonSearchInput() {
    if (browser.isIOS) return this.visibleSearchInput
    return this.byId('politicallyPersonSelection_input_search')
  }

  private get onboardingAddressScreen() {
    if (browser.isIOS) return this.text('Your home address')
    return this.byId('onboardingAddress_screen')
  }

  private get onboardingAddressNextBtn() {
    if (browser.isIOS) return this.buttonByText('Next')
    return this.byId('onboardingAddress_button_next')
  }

  private get onboardingAddress1Input() {
    if (browser.isIOS) return this.byId('address_textInput_address1')
    return this.byId('onboardingAddress_input_address1')
  }

  private get onboardingAddress2Input() {
    if (browser.isIOS) return this.byId('address_textInput_address2')
    return this.byId('onboardingAddress_input_address2')
  }

  private get onboardingAddressCountryBtn() {
    if (browser.isIOS) return this.byId('address_button_countryPicker')
    return this.byId('onboardingAddress_button_country')
  }

  private get onboardingCityInput() {
    if (browser.isIOS) return this.byId('address_textInput_city')
    return this.byId('onboardingAddress_input_city')
  }

  private get onboardingPostcodeInput() {
    if (browser.isIOS) return this.byId('address_textInput_postCode')
    return this.byId('onboardingAddress_input_postcode')
  }

  private get addressCountrySearchInput() {
    if (browser.isIOS) return $('~genericPicker_textInput_search')
    return this.byId('onboardingAddressCountrySelection_input_search')
  }

  private get onboardingEmailScreen() {
    if (browser.isIOS) return this.text('Your primary email')
    return this.byId('onboardingEmail_screen')
  }

  private get onboardingEmailInput() {
    if (browser.isIOS) return $('(//XCUIElementTypeTextField)[1]')
    return this.byId('onboardingEmail_input_email')
  }

  private get onboardingEmailContinueBtn() {
    if (browser.isIOS) return $('-ios predicate string:name == "terms_button_next" OR (type == "XCUIElementTypeButton" AND label == "Next")')
    return this.byId('onboardingEmail_button_continue')
  }

  private get onboardingTermsBtn() {
    return this.byId('onboardingEmail_button_termsAndConditions')
  }

  private get onboardingCompleteScreen() {
    return this.byId('onboardingComplete_screen')
  }

  private get onboardingLetMeInBtn() {
    return this.byId('onboardingComplete_button_letMeIn')
  }

  private get onfidoTitle() {
    return this.byId('title')
  }

  private get onfidoCountryPicker() {
    return this.byId('countryPicker')
  }

  private get onfidoCountryName() {
    return this.byId('countryName')
  }

  private get onfidoDocumentList() {
    return this.byId('documentList')
  }

  private get onfidoCaptureButton() {
    return this.byId('captureButton')
  }

  private get onfidoCameraHint() {
    return this.byId('dummyAccessibility')
  }

  private get onfidoMotionIntroStartRecordingBtn() {
    return this.byId('motionIntroStartRecordingButton')
  }

  private get proofOfAddressRoot() {
    return $('android=new UiSelector().resourceId("ProofOfAddress-root")')
  }

  private get proofOfAddressWebView() {
    return this.byId('onfidoWebView')
  }

  private get visibleNativeInput() {
    return $('android=new UiSelector().className("android.widget.EditText")')
  }

  private get infoScreen() {
    return this.byId('infoConstraintLayout')
  }

  private get infoHeader() {
    return this.byId('infoHeaderTextView')
  }

  private get infoContinueBtn() {
    return this.byId('infoContinueButton')
  }

  private get verificationRequiredBackBtn() {
    return $('//*[@resource-id="com.moneybase.qa:id/composeViewFragmentInfo"]//*[@content-desc="Back"]/ancestor::*[@clickable="true"][1]')
  }

  private get verificationRequiredCloseBtnIOS() {
    return $('~modal_button_close')
  }

  private get verifyIdentityTitleIOS() {
    return $('~Verify your identity')
  }

  private get verifyIdentityPrimaryBtnIOS() {
    return $('~modal_button_primary')
  }

  private get uploadIdentityDocumentAnchor() {
    return $('android=new UiSelector().text("Upload identity document")')
  }

  private get homeRoot() {
    if (browser.isIOS) return $('~home_screen_view')
    return this.byId('home_screen')
  }

  private get tryAgainBtn() {
    return $('android=new UiSelector().text("Try again")')
  }

  private get somethingWentWrongTitle() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/alertTitle").text("Something went wrong")')
  }

  private get postVerificationContinueBtn() {
    return this.byId('verificationSuccess_button_continue')
  }

  private get verificationRequiredTitle() {
    return this.text('Verification is required')
  }

  private keypadDigit(digit: string) {
    return this.byId(`keypad_text_${digit}`)
  }

  private text(text: string) {
    if (browser.isIOS) return $(`~${text}`)
    return $(`android=new UiSelector().text("${text}")`)
  }

  private textContains(text: string) {
    if (browser.isIOS) return $(`-ios predicate string:name CONTAINS "${text}" OR label CONTAINS "${text}" OR value CONTAINS "${text}"`)
    return $(`android=new UiSelector().textContains("${text}")`)
  }

  private textMatches(pattern: string) {
    if (browser.isIOS) return $(`-ios predicate string:name MATCHES "${pattern}" OR label MATCHES "${pattern}" OR value MATCHES "${pattern}"`)
    return $(`android=new UiSelector().textMatches("${pattern}")`)
  }

  private contentDesc(label: string) {
    return $(`~${label}`)
  }

  private contentDescMatches(pattern: string) {
    if (browser.isIOS) return $(`-ios predicate string:name MATCHES "${pattern}" OR label MATCHES "${pattern}"`)
    return $(`android=new UiSelector().descriptionMatches("${pattern}")`)
  }

  private contentDescContains(text: string) {
    if (browser.isIOS) return $(`-ios predicate string:name CONTAINS "${text}" OR label CONTAINS "${text}"`)
    return $(`android=new UiSelector().descriptionContains("${text}")`)
  }

  private countryItem(country: string) {
    if (browser.isIOS) {
      return $(`-ios predicate string:name == "countryPicker_item_${country}" OR name == "country_item_${country}"`)
    }
    return $(`android=new UiSelector().text("${country}")`)
  }

  private countryItemCell(country: string) {
    return $(`//XCUIElementTypeCell[.//XCUIElementTypeStaticText[@name="country_item_${country}" or @label="${country}" or @value="${country}"]]`)
  }

  private labeledInput(label: string) {
    if (browser.isIOS) return $(`//XCUIElementTypeStaticText[@name="${label}" or @label="${label}"]/following::XCUIElementTypeTextField[1]`)
    return $(`//android.widget.EditText[.//android.widget.TextView[@text="${label}"]]`)
  }

  private pickerByLabel(label: string) {
    return $(`//*[@text="${label}" or @content-desc="${label}"]/ancestor::*[@clickable="true"][1]`)
  }

  private optionByLabel(label: string) {
    if (browser.isIOS) {
      return $(`-ios predicate string:name == "countryPicker_item_${label}" OR name == "country_item_${label}" OR label == "${label}" OR value == "${label}"`)
    }

    return $(`//android.view.View[@clickable="true" and (./android.view.View[@content-desc="${label}"] or ./android.widget.TextView[@text="${label}"])]`)
  }

  private get bottomSheet() {
    return $('//*[@pane-title="Bottom Sheet"]')
  }

  private get pickerCancelBtn() {
    return $('android=new UiSelector().text("Cancel")')
  }

  private get pickerDragHandle() {
    return this.contentDesc('Drag handle')
  }

  private get visibleSearchInput() {
    if (browser.isIOS) return $('~genericPicker_textInput_search')
    return $('//android.widget.EditText[ancestor::*[@pane-title="Bottom Sheet"] or ancestor::*[.//android.widget.TextView[@text="Cancel"]]]')
  }

  private buttonByText(text: string) {
    if (browser.isIOS) return $(`~${text}`)
    return $(`//android.widget.TextView[@text="${text}"]/ancestor::android.view.View[@clickable="true"][1]`)
  }

  private nativeButtonByText(text: string) {
    if (browser.isIOS) return $(`//XCUIElementTypeButton[@name="${text}" or @label="${text}"]`)
    return $(`android=new UiSelector().className("android.widget.Button").text("${text}")`)
  }

  private nativeButtonTextContains(text: string) {
    if (browser.isIOS) return $(`//XCUIElementTypeButton[contains(@name, "${text}") or contains(@label, "${text}")]`)
    return $(`android=new UiSelector().className("android.widget.Button").textContains("${text}")`)
  }

  private nativeButtonDescriptionContains(text: string) {
    return $(`android=new UiSelector().className("android.widget.Button").descriptionContains("${text}")`)
  }

  private clickableTextItem(text: string) {
    return $(`//*[@text="${text}"]/ancestor::*[@clickable="true"][1]`)
  }

  private clickableTextItemContains(text: string) {
    return $(`//*[contains(@text, "${text}")]/ancestor::*[@clickable="true"][1]`)
  }

  private get termsCheckbox() {
    if (browser.isIOS) return $('//XCUIElementTypeOther[@name="terms_checkbox_accept"]')
    return $('//android.widget.TextView[contains(@text, "terms and conditions")]/preceding-sibling::android.view.View[@clickable="true"][1]')
  }

  private get termsText() {
    return this.textMatches('(?i).*terms and conditions.*')
  }

  private async tapByRatio(xRatio: number, yRatio: number) {
    const rect = await browser.getWindowRect()
    const x = Math.round(rect.width * xRatio)
    const y = Math.round(rect.height * yRatio)

    if (this.isBrowserStack || browser.isIOS) {
      await browser.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x, y },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])
      return
    }

    await browser.execute('mobile: clickGesture', { x, y }).catch(async () => {
      await browser.performActions([
        {
          type: 'pointer',
          id: 'finger1',
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
    })
  }

  private async tapElementCenter(element: ChainablePromiseElement) {
    await element.waitForExist({ timeout: 5000 })

    const location = await element.getLocation()
    const size = await element.getSize()
    const x = Math.round(location.x + size.width / 2)
    const y = Math.round(location.y + size.height / 2)

    if (this.isBrowserStack) {
      await browser.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x, y },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])
      return
    }

    await browser.execute('mobile: clickGesture', { x, y }).catch(async () => {
      await browser.performActions([
        {
          type: 'pointer',
          id: 'finger1',
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
    })
  }

  private async elFound(el: ChainablePromiseElement): Promise<boolean> {
    // XCUITest marks many on-screen elements visible=false → use isExisting() on iOS.
    return browser.isIOS
      ? el.isExisting().catch(() => false)
      : el.isDisplayed().catch(() => false)
  }

  private async tapFirstVisible(candidates: ChainablePromiseElement[], timeout = 5000) {
    const deadline = Date.now() + timeout

    while (Date.now() < deadline) {
      for (const candidate of candidates) {
        if (!(await this.elFound(candidate))) continue
        await this.tapElementCenter(candidate)
        return true
      }

      await browser.pause(250)
    }

    return false
  }

  private async waitForAnyVisible(candidates: ChainablePromiseElement[], timeout = 30000) {
    let visibleCandidate: ChainablePromiseElement | undefined

    await browser.waitUntil(
      async () => {
        for (const candidate of candidates) {
          if (await this.elFound(candidate)) {
            visibleCandidate = candidate
            return true
          }
        }

        return false
      },
      {
        timeout,
        interval: 500,
        timeoutMsg: 'Expected one of the requested elements to be visible',
      }
    )

    return visibleCandidate as ChainablePromiseElement
  }

  private async typeField(label: string, value: string) {
    const field = this.labeledInput(label)
    await this.typeElement(field, value)
  }

  private async typeElement(field: ChainablePromiseElement, value: string) {
    if (browser.isIOS) {
      await field.waitForExist({ timeout: 20000 })
    } else {
      await field.waitForDisplayed({ timeout: 20000 })
    }
    if (browser.isIOS) {
      await this.typeIOSTextInput(field, value)
      await this.dismissIOSKeyboardIfOpen()
      return
    }

    await this.tap(field)
    await field.clearValue().catch(() => {})
    await field.setValue(value)
    await browser.hideKeyboard().catch(() => {})
  }

  private async tapNext() {
    const next = this.buttonByText('Next')
    const visible = await this.elFound(next)
    if (visible) {
      await this.tap(next)
      return
    }

    if (browser.isIOS) {
      await this.dismissIOSKeyboardIfOpen()
    } else {
      await browser.hideKeyboard().catch(() => {})
    }
    await this.tapByRatio(0.5, 0.93)
  }

  private async tapNextButton(button: ChainablePromiseElement) {
    if (browser.isIOS) {
      await button.click()
      return
    }

    await button.waitForDisplayed({ timeout: 10000 })
    await browser.waitUntil(
      async () => (await button.getAttribute('enabled').catch(() => 'true')) !== 'false',
      {
        timeout: 10000,
        interval: 250,
        timeoutMsg: 'Expected Next button to become enabled',
      }
    )
    await this.tap(button)
  }

  private async tapContinue() {
    const continueButton = (await this.elFound(this.onboardingEmailContinueBtn))
      ? this.onboardingEmailContinueBtn
      : this.buttonByText('Continue')
    if (browser.isIOS) {
      await continueButton.waitForExist({ timeout: 10000 })
    } else {
      await continueButton.waitForDisplayed({ timeout: 10000 })
    }
    await browser.waitUntil(
      async () => (await continueButton.getAttribute('enabled').catch(() => 'false')) === 'true',
      {
        timeout: 10000,
        interval: 250,
        timeoutMsg: 'Expected Continue button to become enabled',
      }
    )
    await this.tapElementCenter(continueButton)
    await browser.pause(500)
  }

  private async tapTermsCheckbox() {
    if (await this.onboardingTermsBtn.isDisplayed().catch(() => false)) {
      await this.tapElementCenter(this.onboardingTermsBtn)
      const continueButton = this.onboardingEmailContinueBtn
      await browser.waitUntil(
        async () => (await continueButton.getAttribute('enabled').catch(() => 'false')) === 'true',
        {
          timeout: 10000,
          interval: 250,
          timeoutMsg: 'Expected Continue button to become enabled after accepting terms',
        }
      )
      return false
    }

    await this.termsText.waitForDisplayed({ timeout: 10000 })

    if (browser.isIOS) {
      const checkbox = this.termsCheckbox
      await checkbox.waitForDisplayed({ timeout: 10000 })

      const continueButton = this.onboardingEmailContinueBtn

      await this.tapElementCenter(checkbox).catch(async () => {
        const rect = await browser.getWindowRect()
        await this.tapByRatio(30 / rect.width, 460 / rect.height)
      })
      await browser.pause(300)
      await this.tapElementCenter(continueButton)
      await browser.pause(500)
      return true
    }

    const termsLocation = await this.termsText.getLocation()
    const termsSize = await this.termsText.getSize()
    const checkbox = this.termsCheckbox

    if (await checkbox.isDisplayed().catch(() => false)) {
      const checkboxLocation = await checkbox.getLocation()
      const checkboxSize = await checkbox.getSize()

      await this.tapByRatio(
        (checkboxLocation.x + checkboxSize.width / 2) / (await browser.getWindowRect()).width,
        (checkboxLocation.y + checkboxSize.height / 2) / (await browser.getWindowRect()).height
      )
    } else {
      const rect = await browser.getWindowRect()
      await this.tapByRatio(
        Math.max(64, termsLocation.x - 65) / rect.width,
        Math.round(termsLocation.y + Math.min(termsSize.height, 126) / 2) / rect.height
      )
    }

    const continueButton = this.buttonByText('Continue')
    await browser.waitUntil(
      async () => (await continueButton.getAttribute('enabled').catch(() => 'false')) === 'true',
      {
        timeout: 10000,
        interval: 250,
        timeoutMsg: 'Expected Continue button to become enabled after accepting terms',
      }
    )
    return false
  }

  private async dismissIOSKeyboardIfOpen() {
    if (!browser.isIOS) return

    const returnKey = $('~Return')
    if (await returnKey.isDisplayed().catch(() => false)) {
      await returnKey.click().catch(async () => {
        await this.tapByRatio(0.5, 0.12)
      })
      await browser.pause(500)
      return
    }

    await this.tapByRatio(0.5, 0.12).catch(() => {})
    await browser.pause(300)
  }

  private async typeIOSTextInput(field: ChainablePromiseElement, value: string) {
    await this.tapElementCenter(field).catch(async () => {
      await this.tap(field)
    })
    await field.clearValue().catch(() => {})
    for (const char of value) {
      await field.addValue(char).catch(async () => {
        await browser.keys(char)
      })
    }
    await browser.pause(300)
  }

  private async tapPickerByLabel(label: string, fallbackXRatio: number, fallbackYRatio: number) {
    if (browser.isIOS) {
      await this.dismissIOSKeyboardIfOpen()
    } else {
      await browser.hideKeyboard().catch(() => {})
    }

    const picker = this.pickerByLabel(label)
    if (await picker.isDisplayed().catch(() => false)) {
      await this.tap(picker)
      return
    }

    const directText = this.text(label)
    if (await directText.isDisplayed().catch(() => false)) {
      await this.tap(directText)
      return
    }

    const directContentDesc = this.contentDesc(label)
    if (await directContentDesc.isDisplayed().catch(() => false)) {
      await this.tap(directContentDesc)
      return
    }

    await this.tapByRatio(fallbackXRatio, fallbackYRatio)
  }

  private async selectVisibleOption(label: string) {
    const option = this.optionByLabel(label)
    if (await option.isDisplayed().catch(() => false)) {
      await this.tapElementCenter(option)
      return
    }

    const exact = this.text(label)
    if (await exact.isDisplayed().catch(() => false)) {
      await this.tapElementCenter(exact)
      return
    }

    const contentDesc = this.contentDesc(label)
    if (await contentDesc.isDisplayed().catch(() => false)) {
      await this.tapElementCenter(contentDesc)
      return
    }

    const contains = this.textMatches(`(?i).*${label}.*`)
    if (await contains.isDisplayed().catch(() => false)) {
      await this.tapElementCenter(contains)
      return
    }

    for (let attempt = 0; attempt < 8; attempt += 1) {
      await browser.execute('mobile: scrollGesture', {
        left: 40,
        top: 520,
        width: 1000,
        height: 1550,
        direction: 'down',
        percent: 0.75,
      }).catch(() => {})

      if (await option.isDisplayed().catch(() => false)) {
        await this.tapElementCenter(option)
        return
      }

      if (await exact.isDisplayed().catch(() => false)) {
        await this.tapElementCenter(exact)
        return
      }

      if (await contentDesc.isDisplayed().catch(() => false)) {
        await this.tapElementCenter(contentDesc)
        return
      }

      if (await contains.isDisplayed().catch(() => false)) {
        await this.tapElementCenter(contains)
        return
      }
    }

    await option.waitForDisplayed({ timeout: 1000 })
    await this.tapElementCenter(option)
  }

  private async selectPreferredVisibleOption(labels: string[]) {
    for (const label of labels) {
      const option = this.optionByLabel(label)
      if (await option.isDisplayed().catch(() => false)) {
        await this.tapElementCenter(option)
        return label
      }

      const exact = this.text(label)
      if (await exact.isDisplayed().catch(() => false)) {
        await this.tapElementCenter(exact)
        return label
      }

      const contentDesc = this.contentDesc(label)
      if (await contentDesc.isDisplayed().catch(() => false)) {
        await this.tapElementCenter(contentDesc)
        return label
      }
    }

    const firstClickableText = $('android=new UiSelector().className("android.widget.TextView").clickable(true).instance(0)')
    await firstClickableText.waitForDisplayed({ timeout: 5000 })
    const selectedLabel = await firstClickableText.getText().catch(() => '')
    await this.tapElementCenter(firstClickableText)
    return selectedLabel
  }

  private async tapOptionalPickerAndSelect(yRatio: number, labels: string[]) {
    await this.tapByRatio(0.5, yRatio)

    const sheetOpened = await browser.waitUntil(() => this.isPickerOpen(), { timeout: 1500, interval: 150 }).then(() => true).catch(() => false)
    if (!sheetOpened) return false

    await this.selectPreferredVisibleOption(labels)
    await this.waitForPickerClosed()
    await this.waitForScreenTitle('Last few personal details')
    return true
  }

  private async isPickerOpen() {
    return (
      (await this.elFound(this.bottomSheet)) ||
      (await this.elFound(this.pickerCancelBtn)) ||
      (await this.elFound(this.pickerDragHandle)) ||
      (await this.elFound(this.visibleSearchInput)) ||
      (browser.isIOS && (await this.countrySearchTap.isExisting().catch(() => false)))
    )
  }

  private async waitForPickerClosed() {
    await browser.waitUntil(async () => !(await this.isPickerOpen()), { timeout: 7000, interval: 250 }).catch(() => {})
    await browser.pause(250)
  }

  private async closePickerIfOpen() {
    if (!(await this.isPickerOpen())) return

    const noOption = this.text('No')
    const yesOption = this.text('Yes')
    if ((await noOption.isDisplayed().catch(() => false)) && (await yesOption.isDisplayed().catch(() => false))) {
      await this.tapElementCenter(noOption)
      await this.waitForPickerClosed()
      return
    }

    if (await this.pickerCancelBtn.isDisplayed().catch(() => false)) {
      await this.tapElementCenter(this.pickerCancelBtn)
      await this.waitForPickerClosed()
      return
    }

    await browser.back().catch(() => {})
    await this.waitForPickerClosed()
  }

  private async waitForScreenTitle(title: string, timeout = 30000) {
    await browser.waitUntil(
      async () => {
        await this.throwIfSomethingWentWrong()
        return this.elFound(this.text(title))
      },
      {
        timeout,
        interval: 500,
        timeoutMsg: `Expected screen title "${title}" to be displayed`,
      }
    )
  }

  private async throwIfSomethingWentWrong() {
    if (!browser.isAndroid) return

    const alertTitle = $('android=new UiSelector().resourceId("com.moneybase.qa:id/alertTitle").text("Something went wrong")')
    if (!(await alertTitle.isDisplayed().catch(() => false))) return

    const message = await $('android=new UiSelector().resourceId("android:id/message")')
      .getText()
      .catch(() => 'No alert message')

    const maxRestarts = Number(process.env.ONBOARDING_SOMETHING_WENT_WRONG_RESTARTS || 1)
    if (browser.isAndroid && this.onboardingSomethingWentWrongRestarts < maxRestarts) {
      this.onboardingSomethingWentWrongRestarts += 1
      console.warn(
        `[Onboarding] Moneybase app showed "Something went wrong". Restarting app ` +
          `(${this.onboardingSomethingWentWrongRestarts}/${maxRestarts}). Message: ${message}`
      )
      await this.restartAndroidApp()
      return
    }

    throw new Error(`Moneybase app showed "Something went wrong": ${message}`)
  }

  private async restartAndroidApp() {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    await driver.terminateApp(this.androidAppPackage).catch(() => {})
    await browser.pause(1500)

    await driver.activateApp(this.androidAppPackage).catch(async () => {
      await driver.startActivity(this.androidAppPackage, this.androidAppActivity)
    })

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await browser.pause(2500)
      await browser.switchContext('NATIVE_APP').catch(() => {})

      const currentActivity = await driver.getCurrentActivity().catch(() => '')
      const pageSource = await browser.getPageSource().catch(() => '')
      const leakCanaryIsActive =
        currentActivity.toLowerCase().includes('leakcanary') || pageSource.includes('leak_canary')

      if (!leakCanaryIsActive) return

      console.warn(
        `[Onboarding] Relaunch opened LeakCanary activity (${currentActivity || 'unknown'}). ` +
          `Starting Moneybase activity (${attempt}/3).`
      )
      await driver.startActivity(this.androidAppPackage, this.androidAppActivity).catch(async () => {
        await driver.activateApp(this.androidAppPackage)
      })
    }

    await browser.switchContext('NATIVE_APP').catch(() => {})
  }

  private async prepareStart() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    const currentPackage = browser.isAndroid ? await driver.getCurrentPackage().catch(() => undefined) : undefined
    if (browser.isAndroid && currentPackage && currentPackage !== this.androidAppPackage) {
      await driver
        .startActivity(this.androidAppPackage, this.androidAppActivity)
        .catch(async () => driver.activateApp(this.androidAppPackage))
      await browser.pause(1000)
    }

    if (await this.isDisplayed(this.welcomeSkipBtn, 7000)) {
      await this.tap(this.welcomeSkipBtn)
    }

    await this.throwIfDeviceSecurityBlocked()
    await this.registerScreen.waitForDisplayed({ timeout: 30000 })
  }

  private async throwIfDeviceSecurityBlocked() {
    if (!(await this.infoScreen.isDisplayed().catch(() => false))) return

    const header = await this.infoHeader.getText().catch(() => '')
    if (header !== 'Device Security') return

    const details = await this.byId('infoDetailsTextView').getText().catch(() => '')
    throw new Error(`[Onboarding] BrowserStack device is blocked by Device Security screen: ${details}`)
  }

  private async typeAndroidShell(value: string) {
    await browser.execute('mobile: shell', {
      command: 'input',
      args: ['text', value.replace(/ /g, '%s')],
    })
  }

  private async typeIntoCountrySearch(country: string) {
    if (await this.countrySearchTap.isDisplayed().catch(() => false)) {
      await this.tap(this.countrySearchTap)
      await browser.pause(250)
    }

    if (browser.isIOS) {
      const searchInput = await this.getIOSCountrySearchInput()
      await searchInput.waitForDisplayed({ timeout: 10000 })
      await searchInput.click()
      await searchInput.clearValue().catch(() => {})
      await searchInput.addValue(country).catch(async () => {
        await searchInput.setValue(country)
      })
      return
    }

    const searchInput = $('android=new UiSelector().className("android.widget.EditText").instance(0)')
    const inputShown = await searchInput.waitForDisplayed({ timeout: 10000 }).catch(() => false)
    if (!inputShown) {
      await this.typeAndroidShell(country)
      return
    }

    await searchInput.click()
    await searchInput.clearValue().catch(() => {})
    await searchInput.addValue(country).catch(async () => {
      await this.typeAndroidShell(country)
    })
  }

  private async getIOSCountrySearchInput() {
    const candidates = [
      this.byId('countrySelection_input_search'),
      $('-ios class chain:**/XCUIElementTypeSearchField'),
      $('-ios class chain:**/XCUIElementTypeTextField'),
      this.visibleSearchInput,
    ]

    for (const candidate of candidates) {
      if (await candidate.isDisplayed().catch(() => false)) return candidate
    }

    return candidates[0]
  }

  private async typeIntoSearchInput(searchInput: ChainablePromiseElement, value: string) {
    await searchInput.waitForDisplayed({ timeout: 10000 })
    await searchInput.click()
    await searchInput.clearValue().catch(() => {})
    if (browser.isIOS) {
      await searchInput.addValue(value).catch(async () => {
        await searchInput.setValue(value)
      })
      return
    }

    await searchInput.addValue(value).catch(async () => {
      await this.typeAndroidShell(value)
    })
  }

  private async selectSearchOption(searchInput: ChainablePromiseElement, value: string) {
    await this.typeIntoSearchInput(searchInput, value)
    await this.selectVisibleOption(value)
    await this.waitForPickerClosed()
  }

  private async searchAndSelectCountry(country: string) {
    await this.typeIntoCountrySearch(country)

    if (browser.isIOS) {
      await this.dismissIOSKeyboardIfOpen()

      const cell = this.countryItemCell(country)
      const cellShown = await cell.waitForDisplayed({ timeout: 10000 }).then(() => true).catch(() => false)
      if (cellShown) {
        await this.tapElementCenter(cell)
      } else {
        const item = this.countryItem(country)
        await item.waitForDisplayed({ timeout: 10000 })
        await this.tapElementCenter(item)
      }

      await this.waitForPickerClosed()
      return
    }

    const option = this.optionByLabel(country)
    const optionShown = await option.waitForDisplayed({ timeout: 20000 }).then(() => true).catch(() => false)
    if (optionShown) {
      await option.click().catch(async () => {
        await this.tapElementCenter(option)
      })
      await this.waitForPickerClosed()
      return
    }

    const item = this.countryItem(country)
    await item.waitForDisplayed({ timeout: 20000 })
    await this.tapElementCenter(item)
    await this.waitForPickerClosed()
  }

  private async selectCountry(country: string) {
    await this.countryCodeBtn.waitForDisplayed({ timeout: 15000 })

    const currentCountryCode = await this.countryCodeBtn.getText().catch(() => '')
    if (currentCountryCode.includes('+356')) return

    await this.tap(this.countryCodeBtn)
    if (await this.text(country).isDisplayed().catch(() => false)) {
      await this.selectVisibleOption(country)
      await this.countryCodeBtn.waitForDisplayed({ timeout: 15000 })
      return
    }

    await this.searchAndSelectCountry(country)
    await this.countryCodeBtn.waitForDisplayed({ timeout: 15000 })
  }

  private async enterMobile(phone: string) {
    await this.selectCountry('Malta')
    await this.mobileInput.waitForDisplayed({ timeout: 20000 })
    await this.type(this.mobileInput, phone, 20000)
    await this.tap(this.mobileContinueBtn, 20000)
  }

  private async enterPinTwice(pin: string) {
    await this.passcodeScreen.waitForDisplayed({ timeout: 30000 })

    const isOtpShown = async () => {
      if (browser.isIOS) {
        return (
          (await this.otpInput.isDisplayed().catch(() => false)) ||
          (await this.otpContainer.isDisplayed().catch(() => false))
        )
      }

      return (
        (await this.otpInputExact.isDisplayed().catch(() => false)) ||
        (await this.otpInput.isDisplayed().catch(() => false)) ||
        (await this.otpContainer.isDisplayed().catch(() => false))
      )
    }

    if (browser.isIOS) {
      for (let round = 0; round < 2; round += 1) {
        await this.dismissIOSConversationsIfOpen()
        if (await isOtpShown()) return

        for (const digit of pin) {
          await this.dismissIOSConversationsIfOpen()
          if (await isOtpShown()) return

          await this.tapIOSKeypadDigitByCoordinates(digit)
          await browser.pause(250)
        }

        if (round === 0) {
          await this.waitForIOSPinRoundSettle(isOtpShown)
          if (await isOtpShown()) return
          continue
        }

        await this.waitForIOSOtpAfterPin(isOtpShown)
        return
      }
    }

    const waitForKeypadDigitOrOtp = async (digit: string) => {
      const keypadButton = this.keypadDigit(digit)
      let keypadShown = false

      await browser.waitUntil(
        async () => {
          if (await isOtpShown()) return true
          keypadShown = await keypadButton.isDisplayed().catch(() => false)
          return keypadShown
        },
        {
          timeout: 10000,
          interval: 250,
          timeoutMsg: `Expected keypad digit ${digit} or OTP input to be displayed`,
        }
      )

      return keypadShown ? keypadButton : undefined
    }

    for (let round = 0; round < 2; round += 1) {
      if (await isOtpShown()) return

      for (const digit of pin) {
        if (await isOtpShown()) return

        const keypadButton = await waitForKeypadDigitOrOtp(digit)
        if (!keypadButton) return

        try {
          await this.tapElementCenter(keypadButton)
        } catch (error) {
          if (await this.otpInputExact.waitForDisplayed({ timeout: 3000 }).then(() => true).catch(() => false)) return
          throw error
        }

        await browser.pause(200)
        if (await isOtpShown()) return
      }

      if (round === 0) {
        await browser.pause(500)
        if (await isOtpShown()) return
        continue
      }

      await this.otpInput.waitForDisplayed({ timeout: 45000 })
      return
    }
  }

  private async waitForIOSPinRoundSettle(isOtpShown: () => Promise<boolean>) {
    const timeout = Number(process.env.ONBOARDING_IOS_PIN_CONFIRM_TIMEOUT_MS || 30000)
    const settleDelay = Number(process.env.ONBOARDING_IOS_PIN_CONFIRM_DELAY_MS || 3500)
    await browser.pause(settleDelay)

    await browser.waitUntil(async () => {
      await this.dismissIOSConversationsIfOpen()
      if (await isOtpShown()) return true

      return this.passcodeScreen.isDisplayed().catch(() => false)
    }, {
      timeout,
      interval: 1000,
      timeoutMsg: 'Expected iOS PIN confirmation screen or OTP after first PIN',
    })
  }

  private async waitForIOSOtpAfterPin(isOtpShown: () => Promise<boolean>) {
    const timeout = Number(process.env.ONBOARDING_IOS_AFTER_PIN_TIMEOUT_MS || 120000)
    const loaderGraceMs = Number(process.env.ONBOARDING_IOS_AFTER_PIN_LOADER_GRACE_MS || 5000)
    await browser.pause(loaderGraceMs)

    await browser.waitUntil(async () => {
      await this.dismissIOSConversationsIfOpen()
      return isOtpShown()
    }, {
      timeout,
      interval: 1000,
      timeoutMsg: 'Expected iOS OTP screen after post-PIN loader finished',
    })
  }

  private async tapIOSKeypadDigitByCoordinates(digit: string) {
    const positions: Record<string, [number, number]> = {
      '1': [0.25, 0.58],
      '2': [0.5, 0.58],
      '3': [0.75, 0.58],
      '4': [0.25, 0.68],
      '5': [0.5, 0.68],
      '6': [0.75, 0.68],
      '7': [0.25, 0.78],
      '8': [0.5, 0.78],
      '9': [0.75, 0.78],
      '0': [0.5, 0.88],
    }

    const position = positions[digit]
    if (!position) throw new Error(`Unsupported iOS keypad digit: ${digit}`)

    await this.tapByRatio(position[0], position[1])
  }

  private async dismissIOSConversationsIfOpen() {
    if (!browser.isIOS) return false

    const closeShown = await this.iosConversationsCloseBtn.isDisplayed().catch(() => false)
    if (!closeShown) return false

    await this.iosConversationsCloseBtn.click().catch(async () => {
      await this.tapElementCenter(this.iosConversationsCloseBtn)
    })
    await this.iosConversationsCloseBtn.waitForDisplayed({ reverse: true, timeout: 5000 }).catch(() => {})
    await browser.pause(500)
    return true
  }

  private async completeOtp(otpPhone: string) {
    await this.otpContainer.waitForDisplayed({ timeout: 45000 })
    await this.otpInput.waitForDisplayed({ timeout: 30000 })

    const shownPhoneText = await this.otpPhoneText.getText().catch(() => '')
    const shownDigits = shownPhoneText.replace(/\D/g, '')
    const expectedDigits = otpPhone.replace(/\D/g, '')
    if (shownDigits && shownDigits !== expectedDigits) {
      throw new Error(`OTP phone mismatch. Expected ${expectedDigits}, but screen shows ${shownPhoneText}`)
    }

    const previousOtpPhone = process.env.OTP_PHONE
    process.env.OTP_PHONE = otpPhone

    const otp = await OtpHelper.getLatestOtp({
      phone: otpPhone,
      timeoutMs: Number(process.env.OTP_TIMEOUT_MS || 90000),
      intervalMs: Number(process.env.OTP_POLL_INTERVAL_MS || 2000),
      maxRequests: Math.max(2, Number(process.env.OTP_MAX_REQUESTS || 2)),
    }).finally(() => {
      if (previousOtpPhone === undefined) {
        delete process.env.OTP_PHONE
      } else {
        process.env.OTP_PHONE = previousOtpPhone
      }
    })

    if (browser.isIOS) {
      await this.otpInput.click()
      await this.otpInput.clearValue().catch(() => {})
      await this.otpInput.addValue(otp).catch(async () => {
        await this.otpInput.setValue(otp)
      })
    } else {
      await this.tap(this.otpInput)
      await this.otpInput.clearValue().catch(() => {})
      await this.otpInput.setValue(otp).catch(async () => {
        await this.otpInput.addValue(otp)
      })
    }
    if (browser.isIOS) {
      await this.dismissIOSKeyboardIfOpen()
    } else {
      await browser.hideKeyboard().catch(() => {})
    }
  }

  private async continueAfterVerification() {
    // Already past verification success (e.g. BasePage auto-dismissed it)
    if (await this.onboardingNameScreen.isDisplayed().catch(() => false)) {
      await this.debugAfterVerificationContinue()
      return
    }

    await browser.waitUntil(
      async () =>
        (await this.onboardingNameScreen.isDisplayed().catch(() => false)) ||
        (await this.verificationSuccessScreen.isDisplayed().catch(() => false)) ||
        (await this.verificationSuccessTitle.isDisplayed().catch(() => false)),
      {
        timeout: 45000,
        interval: 500,
        timeoutMsg: 'Expected Mobile successfully verified screen or personal details screen after entering OTP',
      }
    )

    // Already transitioned to next screen
    if (await this.onboardingNameScreen.isDisplayed().catch(() => false)) {
      await this.debugAfterVerificationContinue()
      return
    }

    const continueShown = await this.verificationContinueBtn.isDisplayed().catch(() => false)
    if (continueShown) {
      if (browser.isIOS) {
        await this.tapElementCenter(this.verificationContinueBtn)
      } else {
        await this.verificationContinueBtn.click().catch(() => {})
      }
      await this.waitForOnboardingNameScreen()
      await this.debugAfterVerificationContinue()
      return
    }

    await this.tapByRatio(0.5, 0.93)
    await this.waitForOnboardingNameScreen()
    await this.debugAfterVerificationContinue()
  }

  private async waitForOnboardingNameScreen() {
    const newNameScreenShown = await this.onboardingNameScreen.waitForDisplayed({ timeout: 30000 }).then(() => true).catch(() => false)
    if (newNameScreenShown) return

    await this.waitForScreenTitle('Your personal details', 1000)
  }

  private async debugAfterVerificationContinue() {
    const screenshotPath = process.env.ONBOARDING_SCREENSHOT_AFTER_CONTINUE
    if (screenshotPath) {
      await browser.saveScreenshot(screenshotPath)
    }

    const pauseMs = Number(process.env.ONBOARDING_PAUSE_AFTER_CONTINUE_MS || 0)
    if (pauseMs > 0) {
      await browser.pause(pauseMs)
    }
  }

  private async fillPersonalDetails(data: Required<Pick<OnboardingData, 'firstName' | 'lastName'>>) {
    if (await this.onboardingNameScreen.isDisplayed().catch(() => false)) {
      await this.typeElement(this.onboardingFirstNameInput, data.firstName)
      await this.typeElement(this.onboardingLastNameInput, data.lastName)
      await this.tapNextButton(this.onboardingNameNextBtn)
      return
    }

    await this.waitForScreenTitle('Your personal details')
    await this.typeField('First or Middle Names', data.firstName)
    await this.typeField('Last Name(s)', data.lastName)
    await this.tapNext()
  }

  private async fillHomeAddress(data: Required<Pick<OnboardingData, 'addressLine1' | 'addressLine2' | 'city' | 'postCode' | 'country'>>) {
    if (await this.onboardingAddressScreen.waitForDisplayed({ timeout: 3000 }).then(() => true).catch(() => false)) {
      await this.typeElement(this.onboardingAddress1Input, data.addressLine1)
      await this.typeElement(this.onboardingAddress2Input, data.addressLine2)

      await this.tap(this.onboardingAddressCountryBtn)
      await this.selectSearchOption(this.addressCountrySearchInput, data.country)

      await this.typeElement(this.onboardingCityInput, data.city)
      await this.typeElement(this.onboardingPostcodeInput, data.postCode)
      await this.tapNextButton(this.onboardingAddressNextBtn)
      return
    }

    await this.waitForScreenTitle('Your home address')
    await this.typeField('Address Line 1', data.addressLine1)
    await this.typeField('Address Line 2', data.addressLine2)

    await this.tapPickerByLabel('Select Country', 0.5, 0.38)
    await this.searchAndSelectCountry(data.country)

    await this.typeField('City', data.city)
    await this.typeField('Post Code', data.postCode)
    await this.tapNext()
  }

  private async isLastPersonalDetailsScreenDisplayed(timeout = 1000) {
    const newDetailsShown = await this.onboardingDetailsScreen.waitForDisplayed({ timeout }).then(() => true).catch(() => false)
    if (newDetailsShown) return true

    return this.text('Last few personal details').waitForDisplayed({ timeout }).then(() => true).catch(() => false)
  }

  private async fillLastPersonalDetails(data: Required<Pick<OnboardingData, 'company' | 'occupation' | 'previousEmployment'>>) {
    if (await this.onboardingDetailsScreen.waitForDisplayed({ timeout: 3000 }).then(() => true).catch(() => false)) {
      await this.tap(this.onboardingTaxCountryBtn)
      await this.selectSearchOption(this.taxCountrySearchInput, 'Malta')

      await this.tap(this.onboardingEmploymentStatusBtn)
      const employmentSearchShown = await this.employmentStatusSearchInput.isDisplayed().catch(() => false)
      if (employmentSearchShown) await this.typeIntoSearchInput(this.employmentStatusSearchInput, 'Employed')
      await this.selectVisibleOption('Employed')
      await this.waitForPickerClosed()

      await this.typeElement(this.onboardingCompanyInput, data.company)
      await this.typeElement(this.onboardingOccupationInput, data.occupation)

      await this.tap(this.onboardingPoliticallyPersonBtn)
      const politicallySearchShown = await this.politicallyPersonSearchInput.isDisplayed().catch(() => false)
      if (politicallySearchShown) await this.typeIntoSearchInput(this.politicallyPersonSearchInput, 'No')
      await this.selectVisibleOption('No')
      await this.waitForPickerClosed()

      await this.tapNextButton(this.onboardingDetailsNextBtn)
      return
    }

    await this.waitForScreenTitle('Last few personal details')

    // The first picker is country/nationality and defaults to Malta on QA Android.
    // The second visible picker is employment status.
    await this.tapByRatio(0.5, 0.31)
    await this.selectPreferredVisibleOption(['Employed'])
    await this.waitForPickerClosed()

    await this.waitForScreenTitle('Last few personal details')
    if (await this.labeledInput('Previous employment').isDisplayed().catch(() => false)) {
      await this.typeField('Previous employment', data.previousEmployment)
    } else {
      await this.typeField('Company', data.company)
      await this.typeField('Occupation', data.occupation)
    }

    await this.tapOptionalPickerAndSelect(0.52, ['Salary', 'Employment', 'Employed', 'Personal Savings', 'Savings', 'No'])

    await browser.execute('mobile: scrollGesture', {
      left: 40,
      top: 980,
      width: 1000,
      height: 950,
      direction: 'down',
      percent: 0.65,
    }).catch(() => {})

    await this.tapOptionalPickerAndSelect(0.52, ['No', 'Salary', 'Employment', 'Employed', 'Personal Savings', 'Savings'])
    await this.tapOptionalPickerAndSelect(0.64, ['No', 'Salary', 'Employment', 'Employed', 'Personal Savings', 'Savings'])

    await this.tapNext()
  }

  private async typeEmailAndAcceptTerms(email: string) {
    await this.closePickerIfOpen()
    const newEmailScreenShown = await this.onboardingEmailScreen.waitForDisplayed({ timeout: 30000 }).then(() => true).catch(() => false)
    if (!newEmailScreenShown) {
      await this.text('Your primary email').waitForDisplayed({ timeout: 1000 })
    }

    const emailInput = newEmailScreenShown ? this.onboardingEmailInput : this.labeledInput('Email')
    await emailInput.waitForDisplayed({ timeout: 30000 })
    await this.tap(emailInput)
    await emailInput.clearValue().catch(() => {})
    if (browser.isIOS) {
      await this.typeIOSTextInput(emailInput, email)
      await this.dismissIOSKeyboardIfOpen()
    } else {
      await emailInput.setValue(email)
      await browser.hideKeyboard().catch(() => {})
    }

    const submittedFromTermsStep = await this.tapTermsCheckbox()
    if (!submittedFromTermsStep) {
      await this.tapContinue()
    }
    await this.waitAfterFinalContinue()
  }

  private async waitAfterFinalContinue() {
    if (browser.isIOS) {
      await this.waitAfterFinalContinueIOS()
      return
    }

    await browser.waitUntil(
      async () => {
        await this.throwIfSomethingWentWrong()
        return (await this.isVerificationRequiredScreenShown())
      },
      {
        timeout: Number(process.env.ONBOARDING_FINAL_CONTINUE_TIMEOUT_MS || 45000),
        interval: 500,
        timeoutMsg: 'Expected Verification is required screen with Verify Now button after tapping final Continue',
      }
    )

    await this.closeVerificationRequiredScreen()

    const screenshotPath = process.env.ONBOARDING_SCREENSHOT_AFTER_FINAL_CONTINUE
    if (screenshotPath) {
      await browser.saveScreenshot(screenshotPath)
    }

    const pauseMs = Number(process.env.ONBOARDING_PAUSE_AFTER_FINAL_CONTINUE_MS || 0)
    if (pauseMs > 0) {
      await browser.pause(pauseMs)
    }
  }

  private async waitAfterFinalContinueIOS() {
    const modalShown = await browser.waitUntil(
      async () => this.isIOSVerifyIdentityModalShown(),
      {
        timeout: Number(process.env.ONBOARDING_FINAL_CONTINUE_TIMEOUT_MS || 45000),
        interval: 500,
        timeoutMsg: 'Expected iOS Verify your identity modal after tapping final Next',
      }
    ).catch(() => false)

    if (!modalShown) {
      await this.throwMissingIOSVerifyIdentityModal()
    }

    await this.closeIOSVerifyIdentityModal()

    await browser.waitUntil(
      async () => {
        // System permission dialogs (location, camera) from Springboard appear here
        // and push the app out of accessibility focus — home_screen_view vanishes.
        // acceptAlert() reaches Springboard-level dialogs that predicate queries cannot.
        try { await browser.acceptAlert() } catch {}
        await this.dismissIOSPermissionAlertsIfPresent().catch(() => {})
        return this.homeRoot.isExisting().catch(() => false)
      },
      {
        timeout: Number(process.env.ONBOARDING_IOS_HOME_AFTER_VERIFY_CLOSE_TIMEOUT_MS || 45000),
        interval: 500,
        timeoutMsg: 'Expected iOS Home screen after closing Verify your identity modal',
      }
    )

    const screenshotPath = process.env.ONBOARDING_SCREENSHOT_AFTER_FINAL_CONTINUE
    if (screenshotPath) {
      await browser.saveScreenshot(screenshotPath)
    }

    const pauseMs = Number(process.env.ONBOARDING_PAUSE_AFTER_FINAL_CONTINUE_MS || 0)
    if (pauseMs > 0) {
      await browser.pause(pauseMs)
    }
  }

  private async isIOSVerifyIdentityModalShown() {
    return (
      (await this.verificationRequiredCloseBtnIOS.isExisting().catch(() => false)) &&
      ((await this.verifyIdentityTitleIOS.isExisting().catch(() => false)) ||
        (await this.verifyIdentityPrimaryBtnIOS.isExisting().catch(() => false)))
    )
  }

  private async closeIOSVerifyIdentityModal() {
    await this.verificationRequiredCloseBtnIOS.waitForExist({ timeout: 10000 })

    const displayed = await this.verificationRequiredCloseBtnIOS.isDisplayed().catch(() => false)
    if (displayed) {
      await this.tapElementCenter(this.verificationRequiredCloseBtnIOS)
      return
    }

    await this.verificationRequiredCloseBtnIOS.click().catch(async () => {
      await this.tapByRatio(0.08, 0.08)
    })
  }

  private async throwMissingIOSVerifyIdentityModal() {
    const source = await browser.getPageSource().catch(() => '')
    const interesting = source
      .split('\n')
      .filter((line) =>
        /name=|label=|value=|Verify your identity|Identity|identity|modal_button|Onfido|onfido|Continue|Close|home_screen_view/i.test(line),
      )
      .slice(0, 140)
      .join('\n')

    throw new Error(`[Onboarding][iOS] Verify identity modal was not present after final Next. Source:\n${interesting}`)
  }

  private async isVerificationRequiredScreenShown() {
    const verificationRequiredShown =
      (await this.verificationRequiredTitle.isDisplayed().catch(() => false)) ||
      ((await this.infoScreen.isDisplayed().catch(() => false)) &&
        (await this.infoHeader.getText().catch(() => '')) === 'Verification is required')

    const verifyNowShown =
      (await this.infoContinueBtn.isDisplayed().catch(() => false)) ||
      (await this.buttonByText('Verify Now').isDisplayed().catch(() => false))

    return verificationRequiredShown && verifyNowShown
  }

  private async closeVerificationRequiredScreen() {
    if (browser.isIOS) {
      await this.verificationRequiredCloseBtnIOS.waitForExist({ timeout: 10000 })
      await this.tapElementCenter(this.verificationRequiredCloseBtnIOS)
    } else {
      await this.verificationRequiredBackBtn.waitForDisplayed({ timeout: 10000 })
      await this.tapElementCenter(this.verificationRequiredBackBtn)
    }

    await this.verificationSuccessScreen.waitForDisplayed({ timeout: 10000 })
    await this.tapPostVerificationContinue()

    const homeAnchorShown = await this.waitForUploadIdentityDocumentAnchor(
      Number(process.env.ONBOARDING_AFTER_VERIFICATION_CLOSE_TIMEOUT_MS || 45000),
    )

    if (homeAnchorShown) return

    if (browser.isAndroid && (await this.somethingWentWrongTitle.isDisplayed().catch(() => false))) {
      console.warn(
        '[Onboarding] Account creation is still processing after verification. ' +
          'Relaunching app and unlocking with passcode to assert Home.'
      )
      await this.relaunchAndroidAndUnlockToHome(process.env.ONBOARDING_PIN || '2468')
      return
    }

    const fallbackTapped = await this.tapVerificationCloseFallback()
    if (fallbackTapped) {
      const homeAnchorShownAfterFallback = await this.waitForUploadIdentityDocumentAnchor(10000)
      if (homeAnchorShownAfterFallback) return
    }

    if (
      browser.isAndroid &&
      ((await this.postVerificationContinueBtn.isDisplayed().catch(() => false)) ||
        (await this.somethingWentWrongTitle.isDisplayed().catch(() => false)))
    ) {
      console.warn(
        '[Onboarding] Still not on Home after closing verification. ' +
          'Relaunching app and unlocking with passcode to assert Home.'
      )
      await this.relaunchAndroidAndUnlockToHome(process.env.ONBOARDING_PIN || '2468')
      return
    }

    await this.throwMissingUploadIdentityAnchor()
  }

  private async relaunchAndroidAndUnlockToHome(pin: string) {
    await this.restartAndroidApp()

    await browser.waitUntil(
      async () => {
        await this.dismissKnownAndroidBlockingPopups().catch(() => {})
        if (await this.homeRoot.isDisplayed().catch(() => false)) return true
        return (
          (await this.passcodeScreen.isDisplayed().catch(() => false)) ||
          (await this.keypadDigit(pin[0]).isDisplayed().catch(() => false))
        )
      },
      {
        timeout: Number(process.env.ONBOARDING_RELOGIN_PASSCODE_TIMEOUT_MS || 30000),
        interval: 500,
        timeoutMsg: 'Expected Home or passcode screen after relaunching onboarding account',
      }
    )

    if (!(await this.homeRoot.isDisplayed().catch(() => false))) {
      for (const digit of pin) {
        const keypadButton = this.keypadDigit(digit)
        await keypadButton.waitForDisplayed({ timeout: 10000 })
        await this.tapElementCenter(keypadButton)
      }
    }

    await browser.waitUntil(
      async () => {
        await this.dismissKnownAndroidBlockingPopups().catch(() => {})
        return this.homeRoot.isDisplayed().catch(() => false)
      },
      {
        timeout: Number(process.env.ONBOARDING_RELOGIN_HOME_TIMEOUT_MS || 45000),
        interval: 500,
        timeoutMsg: 'Expected Home screen after relaunching app and entering onboarding passcode',
      }
    )
  }

  private async throwMissingUploadIdentityAnchor() {
    const source = await browser.getPageSource().catch(() => '')
    const interesting = source
      .split('\n')
      .filter((line) => /resource-id=|content-desc=|text=|Upload identity document|Try again|Continue|Verification|verified|Home/i.test(line))
      .slice(0, 140)
      .join('\n')

    throw new Error(
      `[Onboarding] Upload identity document anchor was not visible after closing verification, ` +
        `and verification success re-login fallback was not available.\n${interesting}`
    )
  }

  private async tapPostVerificationContinue() {
    await this.postVerificationContinueBtn.waitForDisplayed({ timeout: 10000 })
    await this.postVerificationContinueBtn.click().catch(async () => {
      await this.tapElementCenter(this.postVerificationContinueBtn)
    })
    await browser.pause(500)
  }

  private async waitForUploadIdentityDocumentAnchor(timeout: number) {
    return browser
      .waitUntil(
        async () => {
          return await this.uploadIdentityDocumentAnchor.isDisplayed().catch(() => false)
        },
        {
          timeout,
          interval: 500,
          timeoutMsg: 'Expected Upload identity document anchor on home screen after closing Verification is required screen',
        },
      )
      .then(() => true)
      .catch(() => false)
  }

  private async tapVerificationCloseFallback() {
    const tappedTryAgain = await this.tapFirstVisible(
      [
        this.tryAgainBtn,
        this.nativeButtonByText('Try again'),
        this.nativeButtonTextContains('Try again'),
        this.buttonByText('Try again'),
      ],
      3000,
    )

    if (tappedTryAgain) {
      await browser.pause(1000)
    }

    const tappedContinue = await this.tapFirstVisible(
      [
        this.postVerificationContinueBtn,
        this.verificationContinueBtn,
        this.nativeButtonByText('Continue'),
        this.nativeButtonTextContains('Continue'),
        this.buttonByText('Continue'),
      ],
      5000,
    )

    if (tappedContinue) {
      await browser.pause(1000)
    }

    return tappedTryAgain || tappedContinue
  }

  private async tapVerifyNow() {
    const verifyNowButton = (await this.infoContinueBtn.isDisplayed().catch(() => false))
      ? this.infoContinueBtn
      : this.buttonByText('Verify Now')

    await verifyNowButton.waitForDisplayed({ timeout: 10000 })
    await browser.waitUntil(
      async () => (await verifyNowButton.getAttribute('enabled').catch(() => 'false')) === 'true',
      {
        timeout: 10000,
        interval: 300,
        timeoutMsg: 'Expected Verify Now button to become enabled',
      }
    )
    await this.tapElementCenter(verifyNowButton)

    await browser.waitUntil(
      async () => !(await this.isVerificationRequiredScreenShown()),
      {
        timeout: Number(process.env.ONBOARDING_AFTER_VERIFY_NOW_TIMEOUT_MS || 15000),
        interval: 500,
        timeoutMsg: 'Expected to leave Verification is required screen after tapping Verify Now',
      }
    ).catch(() => {})

    await this.debugAfterVerifyNow()

    if (process.env.ONBOARDING_SKIP_KYC_AFTER_VERIFY_NOW !== 'true') {
      await this.completeKycVerification()
    }
  }

  private async debugAfterVerifyNow() {
    if (process.env.ONBOARDING_DEBUG_AFTER_VERIFY_NOW !== 'true') return

    await browser.pause(Number(process.env.ONBOARDING_DEBUG_AFTER_VERIFY_NOW_PAUSE_MS || 5000))

    const contexts = await browser.getContexts().catch(() => [])
    console.log(`[Onboarding] Contexts after Verify Now: ${JSON.stringify(contexts)}`)

    const source = await browser.getPageSource().catch((error) => `Failed to get page source: ${error}`)
    const interestingLines = source
      .split('\n')
      .filter((line) =>
        /resource-id=|content-desc=|text=|Onfido|onfido|Document|document|Passport|passport|Identity|identity|Verify|verify/.test(line)
      )
      .slice(0, 160)

    console.log(`[Onboarding] Source after Verify Now:\n${interestingLines.join('\n')}`)
  }

  private async completeKycVerification() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    await this.selectDriverLicense()
    await this.captureDocumentSide('front')
    await this.captureDocumentSide('back')
    await this.completeFaceVideoVerification()
    await this.completeProofOfAddress()
    await this.waitForOnboardingComplete()
  }

  private async selectDriverLicense() {
    await this.waitForAnyVisible(
      [
        this.text('Choose your document'),
        this.onfidoTitle,
        this.onfidoDocumentList,
      ],
      Number(process.env.ONBOARDING_ONFIDO_DOCUMENT_TIMEOUT_MS || 60000)
    )

    await this.selectOnfidoIssuingCountryIfNeeded()

    const driverLicense = await this.waitForAnyVisible(this.driverLicenseOptions(), 20000)

    await this.tapElementCenter(driverLicense)
  }

  private async selectOnfidoIssuingCountryIfNeeded() {
    if (await this.isDriverLicenseVisible()) return

    const currentCountry = await this.onfidoCountryName.getText().catch(() => '')
    if (currentCountry && !/select issuing country/i.test(currentCountry)) {
      return
    }

    const country = process.env.ONBOARDING_ONFIDO_ISSUING_COUNTRY || 'Ukraine'
    await this.onfidoCountryPicker.waitForDisplayed({ timeout: 15000 })
    await this.tapElementCenter(this.onfidoCountryPicker)

    const searchInput = await this.waitForAnyVisible(
      [
        this.visibleNativeInput,
        this.textContains(country),
        this.contentDescContains(country),
      ],
      10000
    ).catch(() => undefined)

    if (searchInput) {
      const className = await searchInput.getAttribute('class').catch(() => '')
      if (className === 'android.widget.EditText') {
        await this.typeIntoSearchInput(searchInput, country)
      }
    }

    const countryCandidates = () => [
      this.optionByLabel(country),
      this.clickableTextItemContains(country),
      this.textContains(country),
      this.contentDescContains(country),
    ]

    const selectCountry = async (timeout = 1500) => this.tapFirstVisible(countryCandidates(), timeout)

    let selected = await selectCountry()

    if (!selected) {
      const countryInScrollable = $(
        `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().textContains("${country}"))`
      )
      selected = await this.tapFirstVisible([countryInScrollable, ...countryCandidates()], 5000)
    }

    for (let attempt = 0; !selected && attempt < 40; attempt += 1) {
      await browser.execute('mobile: scrollGesture', {
        left: 40,
        top: 520,
        width: 1000,
        height: 1550,
        direction: 'down',
        percent: 0.85,
      }).catch(() => {})
      await browser.pause(200)
      selected = await selectCountry()
    }

    if (!selected) {
      throw new Error(`Unable to select Onfido issuing country: ${country}`)
    }

    await browser.waitUntil(
      async () =>
        (await this.isDriverLicenseVisible()) ||
        (await this.onfidoCountryName.getText().catch(() => '')).includes(country),
      {
        timeout: 15000,
        interval: 500,
        timeoutMsg: `Expected Onfido issuing country ${country} to be selected`,
      }
    )
  }

  private driverLicenseOptions() {
    return ['Driver’s license', 'Driving licence'].flatMap((label) => [
      this.clickableTextItem(label),
      this.clickableTextItemContains(label),
      this.text(label),
      this.textContains(label),
    ])
  }

  private async isDriverLicenseVisible() {
    for (const option of this.driverLicenseOptions()) {
      if (await option.isDisplayed().catch(() => false)) return true
    }

    return false
  }

  private async captureDocumentSide(side: 'front' | 'back') {
    await this.waitForOnfidoCameraPrompt(side)

    await this.injectOnfidoCameraMedia(side)

    const settleMs = Number(process.env.ONBOARDING_ONFIDO_CAMERA_SETTLE_MS || 2500)
    if (settleMs > 0) {
      await browser.pause(settleMs)
    }

    await this.onfidoCaptureButton.waitForDisplayed({ timeout: 20000 })
    await this.tapElementCenter(this.onfidoCaptureButton)
    await this.confirmCapturedDocumentSide(side)
  }

  private onfidoCameraPromptCandidates(side: 'front' | 'back') {
    const sideText = side === 'front' ? 'front' : 'back'

    return [
      this.textContains(`Position the ${sideText}`),
      this.textContains(`${sideText} of your document`),
      this.textContains(`${sideText} of your driving`),
      this.textContains(`${sideText} of your driver`),
      this.contentDescContains(`Position the ${sideText}`),
      this.contentDescContains(`${sideText} of your document`),
      this.contentDescContains(`${sideText} of your driving`),
      this.contentDescContains(`${sideText} of your driver`),
    ]
  }

  private async waitForOnfidoCameraPrompt(side: 'front' | 'back', timeout = Number(process.env.ONBOARDING_ONFIDO_CAMERA_TIMEOUT_MS || 60000)) {
    await this.waitForAnyVisible(this.onfidoCameraPromptCandidates(side), timeout)
  }

  private async injectOnfidoCameraMedia(side: 'front' | 'back') {
    const videoUrl = side === 'front'
      ? process.env.ONBOARDING_CAMERA_FRONT_VIDEO_MEDIA_URL
      : process.env.ONBOARDING_CAMERA_BACK_VIDEO_MEDIA_URL
    const imageUrl = side === 'front'
      ? process.env.ONBOARDING_CAMERA_FRONT_MEDIA_URL
      : process.env.ONBOARDING_CAMERA_BACK_MEDIA_URL
    const preferVideo =
      process.env.ONBOARDING_DOCUMENT_CAMERA_INJECTION !== 'image' &&
      process.env.BS_ENABLE_CAMERA_VIDEO_INJECTION !== 'false' &&
      Boolean(videoUrl)
    const mediaUrl = preferVideo ? videoUrl : imageUrl || videoUrl

    if (!mediaUrl) return

    if (process.env.BROWSERSTACK !== 'true') {
      console.warn(`[Onboarding] Skipping ${side} camera media injection outside BrowserStack: ${mediaUrl}`)
      return
    }

    const useVideo = preferVideo || (!imageUrl && Boolean(videoUrl))
    const action = useVideo ? 'cameraVideoInjection' : 'cameraImageInjection'
    const argumentsKey = useVideo ? 'videoUrl' : 'imageUrl'

    await browser.execute(`browserstack_executor: ${JSON.stringify({
      action,
      arguments: {
        [argumentsKey]: mediaUrl,
      },
    })}`)
    console.log(`[Onboarding] Injected ${side} ${useVideo ? 'video' : 'image'} camera media: ${mediaUrl}`)
  }

  private async confirmCapturedDocumentSide(side: 'front' | 'back') {
    await browser.pause(Number(process.env.ONBOARDING_ONFIDO_CAPTURE_REVIEW_PAUSE_MS || 1500))

    const nextSide = side === 'front' ? 'back' : undefined
    const destinationReached = async () => {
      if (nextSide) {
        for (const candidate of this.onfidoCameraPromptCandidates(nextSide)) {
          if (await candidate.isDisplayed().catch(() => false)) return true
        }
      }

      return (
        (await this.isOnfidoMotionIntroShown()) ||
        (await this.proofOfAddressWebView.isDisplayed().catch(() => false)) ||
        (await this.proofOfAddressRoot.isDisplayed().catch(() => false)) ||
        (await this.text('Verify your address').isDisplayed().catch(() => false)) ||
        (await this.text('Submit bill').isDisplayed().catch(() => false))
      )
    }

    if (await destinationReached()) return

    const confirmCandidates = [
      this.nativeButtonByText('Submit'),
      this.nativeButtonByText('Submit photo'),
      this.nativeButtonByText('Continue'),
      this.nativeButtonByText('Confirm'),
      this.nativeButtonByText('Use photo'),
      this.nativeButtonByText('Looks good'),
      this.nativeButtonTextContains('Submit'),
      this.nativeButtonTextContains('Continue'),
      this.nativeButtonTextContains('Confirm'),
      this.nativeButtonTextContains('Use photo'),
      this.nativeButtonTextContains('Looks good'),
      this.nativeButtonDescriptionContains('Submit'),
      this.nativeButtonDescriptionContains('Continue'),
      this.nativeButtonDescriptionContains('Confirm'),
      this.nativeButtonDescriptionContains('Use photo'),
      this.textContains('Submit'),
      this.textContains('Continue'),
      this.textContains('Confirm'),
      this.textContains('Use photo'),
      this.textContains('Looks good'),
      this.contentDescContains('Submit'),
      this.contentDescContains('Continue'),
      this.contentDescContains('Confirm'),
      this.contentDescContains('Use photo'),
    ]

    const deadline = Date.now() + Number(process.env.ONBOARDING_ONFIDO_CAPTURE_CONFIRM_TIMEOUT_MS || 45000)
    let usedBottomFallback = false

    while (Date.now() < deadline) {
      if (await destinationReached()) return

      const tapped = await this.tapFirstVisible(confirmCandidates, 1500)
      if (!tapped && !usedBottomFallback) {
        usedBottomFallback = true
        await this.tapByRatio(0.5, 0.9)
      }

      await browser.pause(1000)
    }

    if (await destinationReached()) return

    const source = await browser.getPageSource().catch(() => '')
    if (/motionIntroStartRecordingButton|Record a video|position your face|turn your head/i.test(source)) return

    const interesting = source
      .split('\n')
      .filter((line) =>
        /resource-id=|content-desc=|text=|Submit|Continue|Confirm|Use photo|Retake|document|Document|photo|Photo|front|back|Record a video|Start recording|motionIntro/i.test(
          line,
        ),
      )
      .slice(0, 120)
      .join('\n')

    throw new Error(`Onfido did not advance after capturing ${side} side. Visible source:\n${interesting}`)
  }

  private async isOnfidoMotionIntroShown() {
    const shown =
      (await this.onfidoMotionIntroStartRecordingBtn.isDisplayed().catch(() => false)) ||
      (await this.text('Record a video').isDisplayed().catch(() => false)) ||
      (await this.textContains('position your face').isDisplayed().catch(() => false)) ||
      (await this.textContains('turn your head').isDisplayed().catch(() => false))

    if (shown) return true

    const source = await browser.getPageSource().catch(() => '')
    return /motionIntroStartRecordingButton|Record a video|position your face|turn your head/i.test(source)
  }

  private async injectOnfidoFaceCameraMedia() {
    const videoUrl = process.env.ONBOARDING_CAMERA_LIVE_VIDEO_MEDIA_URL
    if (videoUrl) {
      if (process.env.BS_ENABLE_CAMERA_VIDEO_INJECTION === 'false') {
        console.warn(`[Onboarding] Skipping face video camera injection because BS_ENABLE_CAMERA_VIDEO_INJECTION=false: ${videoUrl}`)
        return
      }

      if (process.env.BROWSERSTACK !== 'true') {
        console.warn(`[Onboarding] Skipping face video camera injection outside BrowserStack: ${videoUrl}`)
        return
      }

      await browser.execute(`browserstack_executor: ${JSON.stringify({
        action: 'cameraVideoInjection',
        arguments: {
          videoUrl,
        },
      })}`)
      console.log(`[Onboarding] Injected face video camera media: ${videoUrl}`)
      return
    }

    const mediaUrl = process.env.ONBOARDING_CAMERA_FACE_MEDIA_URL || process.env.ONBOARDING_CAMERA_LIVE_MEDIA_URL
    if (!mediaUrl) return

    if (process.env.BROWSERSTACK !== 'true') {
      console.warn(`[Onboarding] Skipping face camera media injection outside BrowserStack: ${mediaUrl}`)
      return
    }

    await browser.execute(`browserstack_executor: ${JSON.stringify({
      action: 'cameraImageInjection',
      arguments: {
        imageUrl: mediaUrl,
      },
    })}`)
    console.log(`[Onboarding] Injected face camera media: ${mediaUrl}`)
  }

  private async completeFaceVideoVerification() {
    const motionShown = await browser.waitUntil(
      async () =>
        (await this.isOnfidoMotionIntroShown()) ||
        (await this.proofOfAddressWebView.isDisplayed().catch(() => false)) ||
        (await this.proofOfAddressRoot.isDisplayed().catch(() => false)) ||
        (await this.text('Verify your address').isDisplayed().catch(() => false)) ||
        (await this.text('Submit bill').isDisplayed().catch(() => false)),
      {
        timeout: Number(process.env.ONBOARDING_ONFIDO_MOTION_TIMEOUT_MS || 60000),
        interval: 1000,
        timeoutMsg: 'Expected Onfido motion intro or proof-of-address screen after document capture',
      }
    ).then(() => this.isOnfidoMotionIntroShown())

    if (!motionShown) return

    await this.injectOnfidoFaceCameraMedia()

    const startRecording = (await this.onfidoMotionIntroStartRecordingBtn.isDisplayed().catch(() => false))
      ? this.onfidoMotionIntroStartRecordingBtn
      : this.nativeButtonByText('Start recording')

    await startRecording.waitForDisplayed({ timeout: 15000 })
    await this.tapElementCenter(startRecording)

    const motionDeadline = Date.now() + Number(process.env.ONBOARDING_ONFIDO_MOTION_COMPLETE_TIMEOUT_MS || 90000)
    while (Date.now() < motionDeadline) {
      if (
        (await this.proofOfAddressWebView.isDisplayed().catch(() => false)) ||
        (await this.proofOfAddressRoot.isDisplayed().catch(() => false)) ||
        (await this.text('Verify your address').isDisplayed().catch(() => false)) ||
        (await this.text('Submit bill').isDisplayed().catch(() => false)) ||
        (await this.onboardingCompleteScreen.isDisplayed().catch(() => false))
      ) {
        return
      }

      await browser.pause(1000)
    }

    const source = await browser.getPageSource().catch(() => '')
    const interesting = source
      .split('\n')
      .filter((line) =>
        /resource-id=|content-desc=|text=|Record a video|Start recording|face|Face|camera|Camera|ProofOfAddress|Verify your address|Submit bill|error|Error|failed|Failed/i.test(
          line,
        ),
      )
      .slice(0, 140)
      .join('\n')

    throw new Error(`Expected proof-of-address or completion screen after Onfido face recording. Visible source:\n${interesting}`)
  }

  private async completeProofOfAddress() {
    await this.waitForAnyVisible(
      [
        this.proofOfAddressWebView,
        this.proofOfAddressRoot,
        this.text('Verify your address'),
        this.text('Submit bill'),
      ],
      Number(process.env.ONBOARDING_PROOF_OF_ADDRESS_TIMEOUT_MS || 90000)
    )

    await this.selectProofOfAddressDocumentType()
    await this.continueProofOfAddressInstructions()
    await this.uploadProofOfAddressFile()
  }

  private async selectProofOfAddressDocumentType() {
    const alreadyOnSubmitBill = await this.text('Submit bill').isDisplayed().catch(() => false)
    if (alreadyOnSubmitBill) return

    const bankStatement = this.nativeButtonTextContains('Bank or building society statement')
    await bankStatement.waitForDisplayed({ timeout: 30000 })
    await this.tapElementCenter(bankStatement)
  }

  private async continueProofOfAddressInstructions() {
    await this.text('Submit bill').waitForDisplayed({ timeout: 30000 })

    const continueButton = this.nativeButtonByText('Continue')
    if (await continueButton.isDisplayed().catch(() => false)) {
      await this.tapElementCenter(continueButton)
    }

    await this.waitForAnyVisible(
      [
        this.nativeButtonByText('Upload file'),
        this.nativeButtonByText('Take photo'),
        this.text('Take a photo with your phone'),
      ],
      30000
    )
  }

  private async uploadProofOfAddressFile() {
    const uploadButton = this.nativeButtonByText('Upload file')
    await uploadButton.waitForDisplayed({ timeout: 30000 })

    const localPath =
      process.env.ONBOARDING_PROOF_OF_ADDRESS_PATH ||
      resolve(process.cwd(), 'src/fixtures/onboarding/proof_of_address.pdf')
    const remoteName = process.env.ONBOARDING_PROOF_OF_ADDRESS_REMOTE_NAME || basename(localPath).replace(/\s+/g, '_')
    const remotePath = `/sdcard/Download/${remoteName}`

    await driver.pushFile(remotePath, readFileSync(localPath).toString('base64'))

    await this.tapElementCenter(uploadButton)
    await this.pickAndroidFile(remoteName)
  }

  private async pickAndroidFile(fileName: string) {
    const fileNameWithoutExtension = fileName.replace(/\.[^.]+$/, '')

    const fileCandidate = await this.waitForAnyVisible(
      [
        this.text(fileName),
        this.text(fileNameWithoutExtension),
        $(`android=new UiSelector().textContains("${fileNameWithoutExtension}")`),
        $(`android=new UiSelector().descriptionContains("${fileNameWithoutExtension}")`),
      ],
      Number(process.env.ONBOARDING_ANDROID_FILE_PICKER_TIMEOUT_MS || 30000)
    )

    await this.tapElementCenter(fileCandidate)

    await this.tapFirstVisible(
      [
        this.nativeButtonByText('Select'),
        this.nativeButtonByText('Open'),
        this.nativeButtonByText('Done'),
        this.text('Select'),
        this.text('Open'),
        this.text('Done'),
      ],
      5000
    )
  }

  private async waitForOnboardingComplete() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    await browser.waitUntil(
      async () => {
        const completeScreenShown = await this.onboardingCompleteScreen.isDisplayed().catch(() => false)
        const accountCompleteShown = await this.text('Account Complete').isDisplayed().catch(() => false)
        return completeScreenShown || accountCompleteShown
      },
      {
        timeout: Number(process.env.ONBOARDING_COMPLETE_TIMEOUT_MS || 120000),
        interval: 1000,
        timeoutMsg: 'Expected Account Complete screen after KYC submission',
      }
    )

    const letMeInShown = await this.onboardingLetMeInBtn.isDisplayed().catch(() => false)
    if (letMeInShown && process.env.ONBOARDING_TAP_LET_ME_IN_ON_COMPLETE === 'true') {
      await this.tapElementCenter(this.onboardingLetMeInBtn)
    }
  }

  private async fillDetailsAndAddress(
    detailsData: Required<Pick<OnboardingData, 'company' | 'occupation' | 'previousEmployment'>>,
    addressData: Required<Pick<OnboardingData, 'addressLine1' | 'addressLine2' | 'city' | 'postCode' | 'country'>>
  ) {
    const detailsFirst = await this.isLastPersonalDetailsScreenDisplayed(5000)
    if (detailsFirst) {
      await this.fillLastPersonalDetails(detailsData)
      await this.fillHomeAddress(addressData)
      return
    }

    await this.fillHomeAddress(addressData)

    const detailsAfterAddress = await this.isLastPersonalDetailsScreenDisplayed(5000)
    if (detailsAfterAddress) {
      await this.fillLastPersonalDetails(detailsData)
    }
  }

  async createAccountAndroid(data: OnboardingData = {}) {
    if (!browser.isAndroid) {
      throw new Error('Onboarding flow is currently implemented for Android only')
    }

    const generatedPhone = generateUniqueMalteseMobileNumber()
    const pin = data.pin || process.env.ONBOARDING_PIN || '2468'
    const generatedName = randomOnboardingName()
    this.onboardingSomethingWentWrongRestarts = 0

    console.log(`[Onboarding] Generated phone: ${generatedPhone.otpPhone}`)

    await this.prepareStart()
    await this.enterMobile(generatedPhone.local)
    await this.enterPinTwice(pin)
    await this.completeOtp(generatedPhone.otpPhone)
    await this.continueAfterVerification()

    await this.fillPersonalDetails({
      firstName: data.firstName || generatedName.firstName,
      lastName: data.lastName || generatedName.lastName,
    })

    await this.fillDetailsAndAddress(
      {
        company: data.company || 'Moneybase QA',
        occupation: data.occupation || 'QA Automation',
        previousEmployment: data.previousEmployment || 'QA Automation',
      },
      {
        addressLine1: data.addressLine1 || '19 Republic Street',
        addressLine2: data.addressLine2 || 'Office 1',
        city: data.city || 'Valletta',
        postCode: data.postCode || 'VLT 1090',
        country: data.country || 'Malta',
      }
    )

    await this.typeEmailAndAcceptTerms(data.email || `test.${generatedPhone.local}@mail.com`)
  }

  async createAccountIOS(data: OnboardingData = {}) {
    if (!browser.isIOS) {
      throw new Error('iOS onboarding flow can only run on iOS')
    }

    const generatedPhone = generateUniqueMalteseMobileNumber()
    const pin = data.pin || process.env.ONBOARDING_PIN || '2468'
    const generatedName = randomOnboardingName()

    console.log(`[Onboarding][iOS] Generated phone: ${generatedPhone.otpPhone}`)

    await loginPage.prepare()
    await loginPage.selectCountry('Malta')
    await loginPage.enterMobile(generatedPhone.local)
    await loginPage.continue()
    await this.enterPinTwice(pin)
    await this.completeOtp(generatedPhone.otpPhone)
    await this.continueAfterVerification()

    await this.fillPersonalDetails({
      firstName: data.firstName || generatedName.firstName,
      lastName: data.lastName || generatedName.lastName,
    })

    await this.fillDetailsAndAddress(
      {
        company: data.company || 'Moneybase QA',
        occupation: data.occupation || 'QA Automation',
        previousEmployment: data.previousEmployment || 'QA Automation',
      },
      {
        addressLine1: data.addressLine1 || '19 Republic Street',
        addressLine2: data.addressLine2 || 'Office 1',
        city: data.city || 'Valletta',
        postCode: data.postCode || 'VLT 1090',
        country: data.country || 'Malta',
      }
    )

    await this.typeEmailAndAcceptTerms(data.email || `test.${generatedPhone.local}@mail.com`)
  }
}
