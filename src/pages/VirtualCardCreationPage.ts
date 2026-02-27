import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'


class VirtualCardCreationPage extends BasePage {
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
   * ANDROID: blocking AlertDialog (AFTER switch only)
   * ========================= */

  

  private get alertBtn3Android() {
    return $('id=android:id/button3') // OK (нейтральна)
  }

  private async dismissBlockingAlertAndroid(timeoutMs = 10000) {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const isVisible = await this.alertBtn3Android.isDisplayed().catch(() => false)
    if (!isVisible) return

    await this.tap(this.alertBtn3Android)
    await this.alertBtn3Android.waitForDisplayed({ reverse: true, timeout: timeoutMs }).catch(() => {})
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

  private get cardsTabAndroidById() {
    return $('id=com.moneybase.qa:id/navigation_button_cards')
  }

  private get addNewCardBtnAndroid() {
  return $('android=new UiSelector().resourceId("cards_card_addNewCard")')
}


  private get virtualCardTypeAndroid() {
    return $('android=new UiSelector().resourceId("cardTypeSelection_card_virtualCard")')
  }

  private get confirmDesignBtnAndroid() {
    return $('android=new UiSelector().resourceId("cardDesignSelection_button_confirm")')
  }

  private get otpInputAndroid() {
    return $('id=com.moneybase.qa:id/otp_input')
  }

  /* =========================
   * PRIVATE HELPERS
   * ========================= */

  private async typeOtpAndroid(value: string) {
    await this.otpInputAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.otpInputAndroid)
    await this.otpInputAndroid.clearValue().catch(() => {})
    await this.otpInputAndroid.setValue(value)
  }

  /* =========================
   * PUBLIC FLOW
   * ========================= */

  public async openCardsTabAndroid() {
    if (!browser.isAndroid) return
    await this.ensureSingleAccountAndroid()
    await browser.pause(700)
    await browser.switchContext('NATIVE_APP').catch(() => {})
    await this.dismissBlockingAlertAndroid(3000)
    await browser.pause(1000) // Wait for UiAutomator2 to stabilize after login
    await this.cardsTabAndroid.waitForDisplayed({ timeout: 20000 }).catch(async () => {
      await this.dismissBlockingAlertAndroid(3000)
      await this.cardsTabAndroidById.waitForDisplayed({ timeout: 20000 })
    })

    if (await this.cardsTabAndroid.isDisplayed().catch(() => false)) {
      await this.tap(this.cardsTabAndroid)
    } else {
      await this.tap(this.cardsTabAndroidById)
    }
  }

  public async startAddNewCardAndroid() {
    await this.addNewCardBtnAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.addNewCardBtnAndroid)
  }

  public async chooseVirtualCardTypeAndroid() {
    await this.virtualCardTypeAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.virtualCardTypeAndroid)
  }

  public async confirmDefaultDesignAndroid() {
    await this.confirmDesignBtnAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.confirmDesignBtnAndroid)
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

  /** Full flow — but data must come from spec */
  public async createVirtualCardAndroid(pin: string, otp: string) {
    await this.openCardsTabAndroid()
    await this.startAddNewCardAndroid()
    await this.chooseVirtualCardTypeAndroid()
    await this.confirmDefaultDesignAndroid()
    await this.createPinAndroid(pin)
    await this.reenterPinAndroid(pin)
    await this.enterOtpAndroid(otp)
  }
}

export default new VirtualCardCreationPage()