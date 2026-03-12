import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'

class BankTransferIndividualPage extends BasePage {
  /* =========================
   * ANDROID: HOME / ACCOUNT
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
   * IOS: PROFILE PICKER (ensure Individual)
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

  /* =========================
   * ANDROID: blocking AlertDialog
   * ========================= */

  private get alertTitleAndroid() {
    return $('id=com.moneybase.qa:id/alertTitle')
  }

  private get alertBtn3Android() {
    return $('android=new UiSelector().resourceId("android:id/button3")')
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

  /**
 * Use this ONLY after account switch
 * Waits for alert to appear and dismisses it.
 * If alert doesn't appear, waits until home is STABLE for a short grace window.
 */
private async waitAndDismissAlertAfterSwitchAndroid(
  timeoutMs = 12000,
  stableHomeMs = 1200,   // home must stay visible this long
  pollMs = 250
) {
  if (!browser.isAndroid) return

  await browser.switchContext('NATIVE_APP').catch(() => {})

  const deadline = Date.now() + timeoutMs
  let homeVisibleSince: number | null = null

  while (Date.now() < deadline) {
    // 1) Always prioritize alert (it can appear late)
    const btnExists = await this.alertBtn3Android.isExisting().catch(() => false)
    const btnShown  = btnExists && (await this.alertBtn3Android.isDisplayed().catch(() => false))

    if (btnShown) {
      await this.tap(this.alertBtn3Android)
      await this.alertBtn3Android.waitForDisplayed({ reverse: true, timeout: 7000 }).catch(() => {})
      await browser.pause(250)
      return
    }

    // 2) Home stability check (do NOT exit immediately on first homeShown)
    const homeShown = await this.homeRootAndroid.isDisplayed().catch(() => false)
    if (homeShown) {
      if (homeVisibleSince === null) homeVisibleSince = Date.now()

      // if home has been continuously visible long enough -> accept "no alert"
      if (Date.now() - homeVisibleSince >= stableHomeMs) return
    } else {
      homeVisibleSince = null
    }

    await browser.pause(pollMs)
  }
}

  /* =========================
   * ANDROID: ensure Single
   * ========================= */

  private async ensureSingleAccountAndroid() {
    if (!browser.isAndroid) return

    const isBusiness = await this.businessAccountLabelAndroid.isDisplayed().catch(() => false)
    if (!isBusiness) return

    await this.userAvatarBtnAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.userAvatarBtnAndroid)

    const hasSingleByDesc = await this.singleAccountItemAndroid.isDisplayed().catch(() => false)
    const hasSingleByText = await this.singleAccountItemAndroidByText.isDisplayed().catch(() => false)

    if (hasSingleByDesc) {
      await this.tap(this.singleAccountItemAndroid)
    } else if (hasSingleByText) {
      await this.tap(this.singleAccountItemAndroidByText)
    }

    //  alert button3 is expected ONLY after the switch; so we wait here (not before)
    await this.waitAndDismissAlertAfterSwitchAndroid(12000, 1200)
    await this.homeRootAndroid.waitForDisplayed({ timeout: 30000 }).catch(() => {})
    await this.businessAccountLabelAndroid
      .waitForDisplayed({ reverse: true, timeout: 30000 })
      .catch(() => {})
  }

  /* =========================
   * ANDROID: P2P LOCATORS
   * ========================= */

  private get payTabAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_bar_item_icon_container").instance(2)')
  }

  private get carlosCatAndroid() {
  return $('~Carlos Cat')
  } 

  private get beneficiaryPayBtnAndroid() {
    return $('//*[@resource-id="beneficiaryDetails_button_pay"]')
  }

  private get amountP2PAndroid() {
    return $('id=com.moneybase.qa:id/etAmountP2P')
  }

  private get p2pScrollAndroid() {
    return $('id=com.moneybase.qa:id/p2pMakePaymentScrollview')
  }

  private get sliderWrapperAndroid() {
    return $('id=com.moneybase.qa:id/clP2PSliderWrapper')
  }

  private get seekBarAndroid() {
    return $('//*[@resource-id="com.moneybase.qa:id/slideButton"]//android.widget.SeekBar')
  }

  private get slideTextAndroid() {
    return $('android=new UiSelector().text("Slide to make payment")')
  }

  /* =========================
   * IOS: P2P LOCATORS
   * ========================= */

  private get payTabIOS() {
    return $('~Pay')
  }

  private get carlosCatIOS() {
    return $('~pay_item_Carlos Cat')
  }

  private get beneficiaryPayBtnIOS() {
    return $('~beneficiaryDetails_button_pay')
  }

  private get amountP2PIOS() {
    return $('~makePayment_input_amount')
  }

  private get slideTextIOS() {
    return $('~Slide to make payment')
  }

  private get sliderPayIconIOS() {
    return $('~makePayment_slider_pay')
  }

  private get txDetailsCloseIOS() {
    return $('~transactionDetails_button_close')
  }

  private get headerBackIOS() {
    return $('~BackButton')
  }

  private get homeTabIOS() {
    return $('~Home')
  }

  /* =========================
   * SLIDER
   * ========================= */

  private async ensureSliderReadyAndroid() {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    await browser.hideKeyboard().catch(() => {})
    await this.sliderWrapperAndroid.waitForDisplayed({ timeout: 30000 })
  }

  private async dragSliderToRightAndroid() {
    await this.seekBarAndroid.waitForDisplayed({ timeout: 20000 })

    const sb = await this.seekBarAndroid
    const loc = await sb.getLocation()
    const size = await sb.getSize()

    const y = Math.round(loc.y + size.height * 0.5)
    const startX = Math.round(loc.x + 2)
    const endX = Math.round(loc.x + size.width - 2)

    for (let i = 0; i < 3; i++) {
      await browser.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: startX, y },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 250 },
            { type: 'pointerMove', duration: 900, x: endX, y },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])

      await browser.releaseActions()
      await browser.pause(600)

      const stillThere = await this.slideTextAndroid.isDisplayed().catch(() => false)
      if (!stillThere) return
    }

    throw new Error('Slider drag did not trigger payment')
  }

  private async ensureSliderReadyIOS() {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    await browser.hideKeyboard().catch(() => {})
    await this.slideTextIOS.waitForDisplayed({ timeout: 30000 })
  }

  private async dragSliderToRightIOS() {
    await this.sliderPayIconIOS.waitForDisplayed({ timeout: 20000 })

    const icon = await this.sliderPayIconIOS
    const loc = await icon.getLocation()
    const size = await icon.getSize()
    const { width } = await browser.getWindowRect()

    const y = Math.round(loc.y + size.height * 0.5)
    const startX = Math.round(loc.x + size.width * 0.5)
    const endX = Math.max(startX + 200, width - 20)

    for (let i = 0; i < 3; i++) {
      await browser.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: startX, y },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 200 },
            { type: 'pointerMove', duration: 900, x: endX, y },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])

      await browser.releaseActions()
      await browser.pause(600)

      const stillThere = await this.slideTextIOS.isDisplayed().catch(() => false)
      if (!stillThere) return
    }

    throw new Error('Slider drag did not trigger payment (iOS)')
  }

  /* =========================
   * EXIT FLOW
   * ========================= */

  private get txDetailsBackAndroid() {
    return $('android=new UiSelector().resourceId("transactionDetails_button_back")')
  }

  private get headerBackAndroid() {
    return $('android=new UiSelector().resourceId("beneficiaryDetails_button_back")')
  }

  private get headerBackAltAndroid() {
    return $('android=new UiSelector().description("Back")')
  }

  private get homeTabAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_bar_item_icon_view").instance(0)')
  }

  private minusAmountHomeAnchorAndroid(amount: number | string) {
    const formatted = Number(amount).toFixed(2)
    return $(`android=new UiSelector().textContains("- €${formatted}")`)
  }

  private formatIosAmount(amount: number | string) {
    const fixed = Number(amount).toFixed(2)
    return fixed.replace('.', ',')
  }

  private minusAmountHomeAnchorIOS(amount: number | string) {
    const formatted = this.formatIosAmount(amount)
    return $(`//XCUIElementTypeStaticText[contains(@label,"-${formatted}") and contains(@label,"€")] | //XCUIElementTypeStaticText[contains(@name,"-${formatted}") and contains(@name,"€")]`)
  }

  private async exitToHomeAfterP2PAndroid() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    await this.txDetailsBackAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.txDetailsBackAndroid)

    const backShown = await this.headerBackAndroid.waitForDisplayed({ timeout: 8000 }).catch(() => false)
    if (backShown) {
      await this.tap(this.headerBackAndroid)
    } else {
      await this.headerBackAltAndroid.waitForDisplayed({ timeout: 8000 })
      await this.tap(this.headerBackAltAndroid)
    }

    await browser.pause(800)
    await this.homeTabAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.homeTabAndroid)
  }

  private async exitToHomeAfterP2PIOS() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    await this.txDetailsCloseIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.txDetailsCloseIOS)

    const backShown = await this.headerBackIOS.waitForDisplayed({ timeout: 8000 }).catch(() => false)
    if (backShown) {
      await this.tap(this.headerBackIOS)
    }

    await browser.pause(800)
    await this.homeTabIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.homeTabIOS)
  }

    private async scrollHomeAndroid() {
      const { width, height } = await browser.getWindowRect()
      const startX = Math.round(width * 0.5)
      const startY = Math.round(height * 0.75)
      const endY = Math.round(height * 0.3)

      await browser.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: startX, y: startY },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 150 },
            { type: 'pointerMove', duration: 600, x: startX, y: endY },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])
      await browser.releaseActions()
      await browser.pause(700)
    }

    private async waitForMinusAmountHomeAndroid(amount: number | string, timeoutMs = 30000) {
      const deadline = Date.now() + timeoutMs
      while (Date.now() < deadline) {
        if (await this.minusAmountHomeAnchorAndroid(amount).isDisplayed().catch(() => false)) return
        await this.scrollHomeAndroid()
      }
      await this.minusAmountHomeAnchorAndroid(amount).waitForDisplayed({ timeout: 5000 })
    }

  private async scrollHomeIOS() {
    const { width, height } = await browser.getWindowRect()
    const startX = Math.round(width * 0.5)
    const startY = Math.round(height * 0.75)
    const endY = Math.round(height * 0.3)

    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 150 },
          { type: 'pointerMove', duration: 500, x: startX, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions()
    await browser.pause(400)
  }

  private async waitForMinusAmountHomeIOS(amount: number | string, timeoutMs = 60000) {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      if (await this.minusAmountHomeAnchorIOS(amount).isDisplayed().catch(() => false)) return
      await this.scrollHomeIOS()
    }
    await this.minusAmountHomeAnchorIOS(amount).waitForDisplayed({ timeout: 3000 })
  }

  private async ensureIndividualAccountIOS() {
    if (!browser.isIOS) return

    await this.profilePickerUserNameLabelIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.profilePickerUserNameLabelIOS)

    await this.profilePickerIndividualItemIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.profilePickerIndividualItemIOS)

    await this.profilePickerIndividualItemIOS
      .waitForDisplayed({ reverse: true, timeout: 15000 })
      .catch(() => {})
    await this.homeRootIOS.waitForDisplayed({ timeout: 30000 }).catch(() => {})
    await browser.pause(300)
  }

  public async ensureIndividualAccount() {
    if (browser.isIOS) return this.ensureIndividualAccountIOS()
    if (browser.isAndroid) return this.ensureSingleAccountAndroid()
  }
  /* =========================
   * MAIN FLOW
   * ========================= */

  public async sendP2PBySlideAndroid(amount: number | string = 11) {
    if (!browser.isAndroid) return

    await this.ensureSingleAccountAndroid()

    await browser.pause(700)

    await this.dismissBlockingAlertAndroid(5000)

    await this.payTabAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.payTabAndroid)

    await this.carlosCatAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.carlosCatAndroid)

    await this.beneficiaryPayBtnAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.beneficiaryPayBtnAndroid)

    await this.amountP2PAndroid.waitForDisplayed({ timeout: 20000 })
    await this.amountP2PAndroid.clearValue().catch(() => {})
    await this.amountP2PAndroid.setValue(String(amount))

    await this.ensureSliderReadyAndroid()

    await this.dragSliderToRightAndroid()

    await this.minusAmountHomeAnchorAndroid(amount).waitForDisplayed({ timeout: 60000 })

    await this.exitToHomeAfterP2PAndroid()

  await this.waitForMinusAmountHomeAndroid(amount, 30000)
  }

  public async sendP2PBySlideIOS(amount: number | string = 11) {
    if (!browser.isIOS) return

    await browser.pause(700)

    await this.payTabIOS.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.payTabIOS)

    await this.carlosCatIOS.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.carlosCatIOS)

    await this.beneficiaryPayBtnIOS.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.beneficiaryPayBtnIOS)

    await this.amountP2PIOS.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.amountP2PIOS)
    await this.amountP2PIOS.clearValue().catch(() => {})
    await this.amountP2PIOS.setValue(String(amount))

    await this.ensureSliderReadyIOS()
    await this.dragSliderToRightIOS()

    await this.txDetailsCloseIOS.waitForDisplayed({ timeout: 60000 })

    await this.exitToHomeAfterP2PIOS()

    await this.waitForMinusAmountHomeIOS(amount, 60000)
  }
}

export default new BankTransferIndividualPage()