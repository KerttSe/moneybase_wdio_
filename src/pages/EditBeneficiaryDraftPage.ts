import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'

/**
 * DRAFT page object for redesigned Add Beneficiary screens.
 *
 * Locators here are intentionally isolated from AddBeneficiaryPage until they
 * are verified against a real device through appium-mcp.
 */
export default class EditBeneficiaryDraftPage extends BasePage {
  private byAndroidResId(id: string) {
    return $(`(//*[@resource-id="com.moneybase.qa:id/${id}"] | //*[@resource-id="${id}"] | //*[contains(@resource-id,"${id}")] | //*[@content-desc="${id}"])[1]`)
  }

  private get countryDropdownDraft() {
    return browser.isIOS ? $('~test_country_dropdown') : this.byAndroidResId('test_country_dropdown')
  }

  private get currencyDropdownDraft() {
    return browser.isIOS ? $('~test_currency_dropdown') : this.byAndroidResId('test_currency_dropdown')
  }

  private get continueBtnDraft() {
    return browser.isIOS ? $('~test_continue') : this.byAndroidResId('test_continue')
  }

  private androidInputByIdOrLabel(id: string, labelText: string, index: number) {
    return $(`((//*[@resource-id="${id}"]//android.widget.EditText)[1] | //android.widget.EditText[@resource-id="${id}"] | //android.widget.EditText[.//android.widget.TextView[@text="${labelText}"]] | (//android.widget.EditText)[${index}])[1]`)
  }

  private get firstNameInputDraft() {
    return browser.isIOS ? $('~test_first_name') : this.androidInputByIdOrLabel('test_first_name', 'First Name', 1)
  }

  private get lastNameInputDraft() {
    return browser.isIOS ? $('~test_last_name') : this.androidInputByIdOrLabel('test_last_name', 'Last Name(s)', 2)
  }

  private get accountNumberInputDraft() {
    return browser.isIOS ? $('~test_account_no') : this.androidInputByIdOrLabel('test_account_no', 'Account No.', 3)
  }

  private get bicSwiftInputDraft() {
    return browser.isIOS ? $('~test_big_swift') : this.androidInputByIdOrLabel('test_big_swift', 'BIC / SWIFT', 4)
  }

  private get invalidBicSwiftErrorDraft() {
    return $('android=new UiSelector().textContains("The BIC/Swift code you entered does not match the country.")')
  }

  async isRedesignedCountryScreenPresentAndroid(timeout = 5000) {
    if (!browser.isAndroid) return false
    return this.countryDropdownDraft.waitForExist({ timeout }).catch(() => false)
  }

  private get countrySearchInputDraft() {
    return $('(//*[@resource-id="addBeneficiaryCountrySelection_input_search"] | //android.widget.EditText[.//*[@content-desc="Search"] or .//android.widget.TextView[@text="Search"]] | //android.widget.EditText)[1]')
  }

  async selectCountryAndCurrencyDraftAndroid(country: string, currency: string) {
    if (!browser.isAndroid) return

    await this.countryDropdownDraft.waitForExist({ timeout: 15000 })
    await this.tap(this.countryDropdownDraft)

    await this.countrySearchInputDraft.waitForExist({ timeout: 15000 })
    await this.type(this.countrySearchInputDraft, country)

    const countryOption = $(`//android.widget.TextView[@text="${country}"]`)
    await countryOption.waitForExist({ timeout: 10000 })
    await this.tap(countryOption)

    await this.currencyDropdownDraft.waitForExist({ timeout: 15000 })
    await this.tap(this.currencyDropdownDraft)
    const currencyOption = $(`android=new UiSelector().textContains("${currency}")`)
    await currencyOption.waitForExist({ timeout: 10000 })
    await this.tap(currencyOption)

    await this.continueBtnDraft.waitForExist({ timeout: 15000 })
    await this.tap(this.continueBtnDraft)
  }

  async enterBeneficiaryNameDraftAndroid(name: string, surname: string) {
    if (!browser.isAndroid) return

    await this.firstNameInputDraft.waitForExist({ timeout: 15000 })
    await this.tap(this.firstNameInputDraft)
    await this.type(this.firstNameInputDraft, name)

    await this.lastNameInputDraft.waitForExist({ timeout: 15000 })
    await this.tap(this.lastNameInputDraft)
    await this.type(this.lastNameInputDraft, surname)
  }

  async enterAccountNumberDraftAndroid(accountNumber: string) {
    if (!browser.isAndroid) return

    await this.accountNumberInputDraft.waitForExist({ timeout: 15000 })
    await this.tap(this.accountNumberInputDraft)
    await this.accountNumberInputDraft.clearValue().catch(() => {})
    await this.type(this.accountNumberInputDraft, accountNumber)
  }

  async enterBicSwiftDraftAndroid(bic: string) {
    if (!browser.isAndroid) return

    await this.bicSwiftInputDraft.waitForExist({ timeout: 15000 })
    await this.tap(this.bicSwiftInputDraft)
    await this.bicSwiftInputDraft.clearValue().catch(() => {})
    await this.type(this.bicSwiftInputDraft, bic)
  }

  async verifyInvalidBicSwiftErrorDraftAndroid() {
    if (!browser.isAndroid) return
    await this.invalidBicSwiftErrorDraft.waitForDisplayed({ timeout: 10000 })
  }
}
