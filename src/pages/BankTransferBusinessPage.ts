import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'

class BankTransferBusinessPage extends BasePage {
  /* =========================
   * ANDROID: HOME / ACCOUNT
   * ========================= */

  private get homeRootAndroid() {
    return $('android=new UiSelector().resourceId("home_screen")')
  }

  private get userAvatarBtnAndroid() {
    return $('android=new UiSelector().resourceId("home_button_userAvatar")')
  }

  private get businessAccountLabelAndroid() {
    // TEMP (краще буде resourceId)
    return $('android=new UiSelector().textContains("Business")')
  }

  /* =========================
   * ANDROID: blocking AlertDialog (optional)
   * NOTE: appears only in some switch cases
   * ========================= */

  private get alertTitleAndroid() {
    return $('id=com.moneybase.qa:id/alertTitle')
  }

  private get alertBtn3Android() {
    return $('android=new UiSelector().resourceId("android:id/button3")') // OK
  }

  private async dismissBlockingAlertAndroid(timeoutMs = 5000) {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const appeared = await this.alertTitleAndroid.waitForDisplayed({ timeout: timeoutMs }).catch(() => false)
    if (!appeared) return

    await this.alertBtn3Android.waitForDisplayed({ timeout: 7000 })
    await this.tap(this.alertBtn3Android)
    await this.alertTitleAndroid.waitForDisplayed({ reverse: true, timeout: 10000 }).catch(() => {})
  }

  /* =========================
   * ANDROID: ACCOUNT SWITCH (ensure Business)
   * ========================= */

  private get businessAccountItemAndroid() {
    return $('android=new UiSelector().textContains("Business")')
  }

  private get businessAccountItemAndroidByDesc() {
    return $('android=new UiSelector().descriptionContains("Business")')
  }

  private async ensureBusinessAccountAndroid(timeoutMs = 15000) {
    if (!browser.isAndroid) return

    // already Business
    if (await this.businessAccountLabelAndroid.isDisplayed().catch(() => false)) return

    // open switcher
    await this.userAvatarBtnAndroid.waitForDisplayed({ timeout: timeoutMs })
    await this.tap(this.userAvatarBtnAndroid)

    // wait menu opened
    await browser.waitUntil(async () => {
      return (
        await this.businessAccountItemAndroid.isDisplayed().catch(() => false) ||
        await this.businessAccountItemAndroidByDesc.isDisplayed().catch(() => false)
      )
    }, { timeout: 10000, interval: 400, timeoutMsg: 'Account switcher did not open' })

    // tap Business
    if (await this.businessAccountItemAndroid.isDisplayed().catch(() => false)) {
      await this.tap(this.businessAccountItemAndroid)
    } else {
      await this.businessAccountItemAndroidByDesc.waitForDisplayed({ timeout: 7000 })
      await this.tap(this.businessAccountItemAndroidByDesc)
    }

    // sometimes alert may appear after switch (handle safely)
    await this.dismissBlockingAlertAndroid(5000)

    // wait we are back on home in Business
    await this.businessAccountLabelAndroid.waitForDisplayed({ timeout: 20000 })
    await browser.pause(300)
  }

  /* =========================
   * iOS: PROFILE PICKER (ensure Business) - placeholder
   * ========================= */

  private get profilePickerUserNameLabelIOS() {
    return $('~profilePicker_label_userName')
  }

  private get profilePickerBusinessItemIOS() {
    return $('~Business')
  }

  private async ensureBusinessAccountIOS() {
    if (!browser.isIOS) return

    await this.profilePickerUserNameLabelIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.profilePickerUserNameLabelIOS)

    await this.profilePickerBusinessItemIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.profilePickerBusinessItemIOS)

    await this.profilePickerBusinessItemIOS.waitForDisplayed({ reverse: true, timeout: 15000 }).catch(() => {})
    await browser.pause(300)
  }

  /* =========================
   * PAY TAB (TEMP locator with instance)
   * ========================= */

  private get payTabAndroid() {
    // TEMP: instance може відрізнятись на девайсах/білді
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_bar_item_icon_view").instance(2)')
  }

  /* =========================
   * PUBLIC: OPEN PAY FROM HOME (ensure Business)
   * ========================= */

  async openPayFromHomeEnsuringBusiness() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    if (browser.isAndroid) {
      // wait Home after login
      await this.homeRootAndroid.waitForDisplayed({ timeout: 60000 })

      // ensure Business (and handle possible alert inside)
      await this.ensureBusinessAccountAndroid()

      // wait Pay tab visible (more stable than direct waitForDisplayed sometimes)
      await browser.waitUntil(async () => {
        return await this.payTabAndroid.isDisplayed().catch(() => false)
      }, { timeout: 20000, interval: 500, timeoutMsg: 'Pay tab is not visible' })

      await this.tap(this.payTabAndroid)
      return
    }

    if (browser.isIOS) {
      await this.ensureBusinessAccountIOS()
      // TODO: tap Pay tab on iOS when build ready
    }
  }
}

export default new BankTransferBusinessPage()
