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
   * ANDROID: blocking AlertDialog
   * ========================= */

  private get alertBtn3Android() {
    return $('android=new UiSelector().resourceId("android:id/button3")')
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

    public async ensureIndividualAccount() {
    await this.ensureSingleAccountAndroid()
    }
  /* =========================
   * MAIN FLOW
   * ========================= */

  public async sendP2PBySlideAndroid(amount: number | string = 11) {
    if (!browser.isAndroid) return

    await this.ensureSingleAccountAndroid()

    await browser.pause(700)

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

    await this.minusAmountHomeAnchorAndroid(amount).waitForDisplayed({ timeout: 30000 })
  }
}

export default new BankTransferIndividualPage()