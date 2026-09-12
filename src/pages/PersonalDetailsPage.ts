import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'

class PersonalDetailsPage extends BasePage {
  // ── Navigation entry points ───────────────────────────────────────────────

  private get moreTabAndroid() {
    return $('(//*[@resource-id="com.moneybase.qa:id/navigation_button_more"] | //*[contains(@resource-id,"navigation_button_more")] | //*[contains(@resource-id,"nav_graph_more")] | //*[contains(@resource-id,"navigation_more_btn")] | //*[@content-desc="More" and @clickable="true"])[1]')
  }

  private get userAvatarAndroid() {
    return $('(//*[@resource-id="home_button_userAvatar"] | //*[@resource-id="com.moneybase.qa:id/home_button_userAvatar"] | //*[@content-desc="home_button_userAvatar"])[1]')
  }

  private get moreTabIOS() {
    return $('~More')
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  private get settingsAndroid() {
    return $('//*[@text="Settings" or @content-desc="Settings"]')
  }

  private get settingsIOS() {
    return $('~Settings')
  }

  // ── Personal Details row ──────────────────────────────────────────────────

  private get personalDetailsRowAndroid() {
    return $('(//*[@text="Personal Details" or @content-desc="Personal Details"])[1]')
  }

  private get personalDetailsRowIOS() {
    return $('~Personal Details')
  }

  // ── Fields on Personal Details screen ────────────────────────────────────

  private fieldAndroid(label: string) {
    return $(`//*[@text="${label}" or @content-desc="${label}"]`)
  }

  private fieldIOS(label: string) {
    return $(`-ios predicate string:label == "${label}" OR name == "${label}" OR value CONTAINS "${label}"`)
  }

  private firstNameContainerAndroid() {
    return $('(//*[@resource-id="com.moneybase.qa:id/textName"] | //*[@resource-id="com.moneybase.qa:id/layoutFirstName"])[1]')
  }

  private lastNameContainerAndroid() {
    return $('(//*[@resource-id="com.moneybase.qa:id/textSurname"] | //*[@resource-id="com.moneybase.qa:id/layoutSurname"])[1]')
  }

  // ── Editable input fields ─────────────────────────────────────────────────

  private get firstNameInputAndroid() {
    return $('//*[@resource-id="com.moneybase.qa:id/textName"]')
  }

  private get lastNameInputAndroid() {
    return $('//*[@resource-id="com.moneybase.qa:id/textSurname"]')
  }

  private get firstNameInputIOS() {
    return $('-ios predicate string:type == "XCUIElementTypeTextField" AND (label CONTAINS "First" OR name CONTAINS "First" OR value CONTAINS "First")')
  }

  private get lastNameInputIOS() {
    return $('-ios predicate string:type == "XCUIElementTypeTextField" AND (label CONTAINS "Last" OR name CONTAINS "Last" OR value CONTAINS "Last")')
  }

  private get saveButtonAndroid() {
    return $('(//*[@text="Save" or @content-desc="Save" or @text="Update" or @content-desc="Update"])[1]')
  }

  private get saveButtonIOS() {
    return $('-ios predicate string:label == "Save" OR label == "Update" OR name == "Save" OR name == "Update"')
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async navigateToPersonalDetails() {
    if (browser.isIOS) {
      await this.tap(this.moreTabIOS, 15000)
      await browser.pause(600)
      const settings = this.settingsIOS
      await this.tap(settings, 15000)
      await browser.pause(600)
      await this.tap(this.personalDetailsRowIOS, 15000)
    } else {
      const moreTabShown = await this.moreTabAndroid.isDisplayed().catch(() => false)
      if (moreTabShown) {
        await this.tap(this.moreTabAndroid)
        await browser.pause(600)
        await this.tap(this.settingsAndroid, 15000)
        await browser.pause(600)
        await this.tap(this.personalDetailsRowAndroid, 15000)
      } else {
        // No More tab — Personal Details is directly in more_screen via avatar
        await this.userAvatarAndroid.waitForExist({ timeout: 20000 })
        await this.tap(this.userAvatarAndroid)
        await browser.pause(1000)
        await this.tap(this.personalDetailsRowAndroid, 15000)
      }
    }
    await browser.pause(800)
  }

  // ── Verifications ─────────────────────────────────────────────────────────

  async verifyPersonalDetailsScreenVisible(timeout = 10000) {
    await browser.waitUntil(
      async () => {
        const el = browser.isIOS
          ? $('-ios predicate string:label == "Personal Details" OR name == "Personal Details"')
          : $('//*[@text="Personal Details" or @content-desc="Personal Details"]')
        return el.isDisplayed().catch(() => false)
      },
      { timeout, interval: 500, timeoutMsg: 'Personal Details screen title not visible' },
    )
  }

  async verifyFirstNameFieldVisible(timeout = 8000) {
    await browser.waitUntil(
      async () => {
        const el = browser.isIOS
          ? $('-ios predicate string:label CONTAINS "First" OR name CONTAINS "First"')
          : this.firstNameContainerAndroid()
        return el.isDisplayed().catch(() => false)
      },
      { timeout, interval: 500, timeoutMsg: 'First name field not visible on Personal Details' },
    )
  }

  async verifyLastNameFieldVisible(timeout = 8000) {
    await browser.waitUntil(
      async () => {
        const el = browser.isIOS
          ? $('-ios predicate string:label CONTAINS "Last" OR name CONTAINS "Last"')
          : this.lastNameContainerAndroid()
        return el.isDisplayed().catch(() => false)
      },
      { timeout, interval: 500, timeoutMsg: 'Last name field not visible on Personal Details' },
    )
  }

  async verifyEmailFieldVisible(timeout = 8000) {
    await browser.waitUntil(
      async () => {
        const el = browser.isIOS
          ? $('-ios predicate string:label CONTAINS "Email" OR name CONTAINS "Email" OR label CONTAINS "email"')
          : $('(//*[@resource-id="com.moneybase.qa:id/textEmail"] | //*[@resource-id="com.moneybase.qa:id/layoutEmail"])[1]')
        return el.isDisplayed().catch(() => false)
      },
      { timeout, interval: 500, timeoutMsg: 'Email field not visible on Personal Details' },
    )
  }

  async verifyAddressFieldVisible(timeout = 8000) {
    await browser.waitUntil(
      async () => {
        const el = browser.isIOS
          ? $('-ios predicate string:label CONTAINS "Address" OR name CONTAINS "Address"')
          : $('(//*[@resource-id="com.moneybase.qa:id/textAddress1"] | //*[@resource-id="com.moneybase.qa:id/layoutAddressLine1"])[1]')
        return el.isDisplayed().catch(() => false)
      },
      { timeout, interval: 500, timeoutMsg: 'Address field not visible on Personal Details' },
    )
  }

  // ── Write operations ──────────────────────────────────────────────────────

  async editFirstName(value: string, timeout = 10000) {
    const field = browser.isIOS ? this.firstNameInputIOS : this.firstNameInputAndroid
    await field.waitForDisplayed({ timeout })
    await field.clearValue()
    await field.setValue(value)
    await browser.hideKeyboard().catch(() => undefined)
  }

  async editLastName(value: string, timeout = 10000) {
    const field = browser.isIOS ? this.lastNameInputIOS : this.lastNameInputAndroid
    await field.waitForDisplayed({ timeout })
    await field.clearValue()
    await field.setValue(value)
    await browser.hideKeyboard().catch(() => undefined)
  }

  async tapSave(timeout = 10000) {
    const btn = browser.isIOS ? this.saveButtonIOS : this.saveButtonAndroid
    await this.tap(btn, timeout)
    await browser.pause(1000)
  }

  async verifyFieldValue(expectedValue: string, timeout = 8000) {
    await browser.waitUntil(
      async () => {
        const el = browser.isIOS
          ? $(`-ios predicate string:value == "${expectedValue}" OR label == "${expectedValue}"`)
          : $(`//*[@text="${expectedValue}" or @content-desc="${expectedValue}"]`)
        return el.isDisplayed().catch(() => false)
      },
      { timeout, interval: 500, timeoutMsg: `Value "${expectedValue}" not found on Personal Details screen` },
    )
  }
}

export default new PersonalDetailsPage()
