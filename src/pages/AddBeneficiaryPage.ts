import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'

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
    return $('android=new UiSelector().resourceId("android:id/button3")') // OK
  }

  private async dismissBlockingAlertAndroid(timeoutMs = 10000) {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    await this.alertBtn3Android.waitForDisplayed({ timeout: 7000 })
    await this.tap(this.alertBtn3Android)
    await this.alertBtn3Android.waitForDisplayed({ reverse: true, timeout: 7000 }).catch(() => {})
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
    return $('~Monaco')
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
    return $('//android.widget.TextView[@text="Monaco"]')
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

  async startAddBeneficiaryAndroid() {
    if (!browser.isAndroid) return

    // ensure Individual/Single account before flow
    await this.ensureSingleAccountAndroid()

    await browser.pause(700)
    await this.alertBtn3Android.waitForDisplayed({ timeout: 7000 }).catch(() => {})
    await this.dismissBlockingAlertAndroid()

    // 1️ Pay tab
    await this.payTabAndroid.waitForDisplayed({ timeout: 20000 })
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

    // Select country (Monaco)
    await this.countryPickerAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.countryPickerAndroid)

    await this.countrySearchInputAndroid.waitForDisplayed({ timeout: 15000 })
    await this.type(this.countrySearchInputAndroid, 'Monaco')

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
    await this.type(this.countrySearchInputIOS, 'Monaco')

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