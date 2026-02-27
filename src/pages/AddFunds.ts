import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'

export default class AddFundsPage extends BasePage {
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

    // Open picker
    await this.profilePickerUserNameLabelIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.profilePickerUserNameLabelIOS)

    // Pick Individual
    await this.profilePickerIndividualItemIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.profilePickerIndividualItemIOS)

    // Wait picker closed / back
    await this.profilePickerIndividualItemIOS
      .waitForDisplayed({ reverse: true, timeout: 15000 })
      .catch(() => {})
    await browser.pause(300)
  }
     public async ensureIndividualAccount() {
    if (browser.isIOS) {
      await this.ensureIndividualAccountIOS()
      return
    }

    if (browser.isAndroid) {
      await this.ensureSingleAccountAndroid()
      
      // await this.ensureSingleAccountAndroid()
      return
    }
  }

  /* =========================
   * ANDROID: blocking AlertDialog
   * ========================= */

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
  /* =========================
   * OPEN ADD FUNDS FROM HOME
   * ========================= */

  get openBtn() {
    if (browser.isAndroid) return $('android=new UiSelector().resourceId("home_button_addFunds")')
    return $('~plus')
  }

  /* =========================
   * TOP UP TILE (Card)
   * ========================= */

  get cardTile() {
    if (browser.isAndroid) return $('android=new UiSelector().resourceId("addFunds_card_cardTopUp")')
    return $('~Card')
  }

  /* =========================
   * CARD DEPOSIT SCREEN ANCHOR (iOS only)
   * ========================= */

  get cardDepositNavTitle() {
    return $('~Card Deposit')
  }

  /* =========================
   * AMOUNT INPUT
   * ========================= */

  get amountInput() {
    if (browser.isAndroid) return $('id=com.moneybase.qa:id/depositAmountText')
    return $('~cardDeposit_textInput_')
  }

  /* =========================
   * CONTINUE BUTTON
   * ========================= */

  get continueBtn() {
    if (browser.isAndroid) return $('id=com.moneybase.qa:id/cardTopUp_button_continue')
    return $('~Continue')
  }

  /* =========================
   * iOS: PAY / RESULT
   * ========================= */

  // opens card list (class chain(instance 2) because of duplicate elements with same accessibility id "форма")
private get openCardListIOS() {
  return $(`-ios class chain:**/XCUIElementTypeOther[\`name == "форма"\`]/XCUIElementTypeImage[2]`)
}

// 
private get card0036IOS() {
  return $('~.... 0036')
}

// pay processing
private get payProcessingBtnIOS() {
  return $('~Pay Processing')
}


  /* =========================
   * PUBLIC FLOW
   * ========================= */

  async openFromHome() {
    if (browser.isAndroid) {
      await this.ensureSingleAccountAndroid()
      await browser.pause(700)
      await this.alertBtn3Android.waitForDisplayed({ timeout: 7000 }).catch(() => {})
      await this.dismissBlockingAlertAndroid()
    }

    if (browser.isIOS) {
      // same idea as Android ensure: normalize account before Add Funds
      await this.ensureIndividualAccountIOS()
    }

    await this.openBtn.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.openBtn)
  }

  async goToTopUp() {
    await this.cardTile.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.cardTile)

    if (browser.isIOS) {
      await this.cardDepositNavTitle.waitForDisplayed({ timeout: 15000 })
    }
  }

  async enterAmount(amount: number | string) {
    await this.amountInput.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.amountInput)
    await this.amountInput.clearValue().catch(() => {})
    await this.amountInput.setValue(String(amount))
  }

  /* =========================
   * ANDROID: PAY PROCESSING / OTP
   * ========================= */

  private get payProcessingBtnAndroid() {
    return $('android=new UiSelector().text("Pay Processing")')
  }

  private get otpInputAndroid() {
    return $('android=new UiSelector().resourceId("otp")')
  }

  private get sendOtpBtnAndroid() {
    return $('android=new UiSelector().resourceId("sendOtp")')
  }

  private get depositSuccessTextAndroid() {
    return $('android=new UiSelector().textContains("You deposited")')
  }

  private get depositErrorTextAndroid() {
    return $('android=new UiSelector().textContains("Looks like Something went wrong.")')
  }

  private get depositApprovedIOS() {
  return $(
    `-ios class chain:**/XCUIElementTypeStaticText[\`name == "Deposit by Card *0036"\`][1]`
  )
}

private get cardPickerBtnAndroid() {
  return $('android=new UiSelector().className("android.widget.TextView").instance(4)')
}

// к ".... 0036" / "•••• 0036" / "Card *0036" — 
private get card0036Android() {
  return $('android=new UiSelector().textContains("0036")')
}

async selectCard0036Android() {
  await this.cardPickerBtnAndroid.waitForDisplayed({ timeout: 15000 })
  await this.tap(this.cardPickerBtnAndroid)

  await this.card0036Android.waitForDisplayed({ timeout: 15000 })
  await this.tap(this.card0036Android)

  // невелика пауза щоб UI встиг 
  await browser.pause(300)
}

  /* =========================
   * CONTINUE -> 3DS / PAY FLOW 
   * ========================= */

  async continueTo3DS() {
    await this.continueBtn.waitForEnabled({ timeout: 20000 })
    await this.tap(this.continueBtn)

    /* ---------- ANDROID ---------- */
if (browser.isAndroid) {
  //  0036
  await this.selectCard0036Android()

  // 1) Pay Processing
  await this.payProcessingBtnAndroid.waitForDisplayed({ timeout: 30000 })
  await this.tap(this.payProcessingBtnAndroid)

  // 2) waiter for 0036 pay procesing btn 
  const otpAppeared = await browser
    .waitUntil(
      async () => await this.otpInputAndroid.isDisplayed().catch(() => false),
      { timeout: 8000, interval: 300 }
    )
    .then(() => true)
    .catch(() => false)

  if (otpAppeared) {
    await this.tap(this.otpInputAndroid)
    await this.otpInputAndroid.clearValue().catch(() => {})
    await this.otpInputAndroid.setValue('0101')

    // blur keyboard by tapping random place (top center)
    const { width } = await browser.getWindowRect()
    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: Math.floor(width / 2), y: 10 },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 80 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions()
    await browser.pause(300)
    await browser.pressKeyCode(66).catch(() => {})

    // click Send OTP best-effort 
    let clickedSendOtp = false
    await browser
      .waitUntil(
        async () => {
          if (clickedSendOtp) return true
          if (await this.depositSuccessTextAndroid.isDisplayed().catch(() => false)) return true

          const send = $('android=new UiSelector().resourceId("sendOtp")')
          if (!(await send.isDisplayed().catch(() => false))) return false
          if (!(await send.isEnabled().catch(() => false))) return false

          await send.click().catch(() => {})
          clickedSendOtp = true
          return true
        },
        { timeout: 15000, interval: 250 }
      )
      .catch(() => {})
  }

  // 3) result (for OTP &  no-OTP)
  await browser.waitUntil(
    async () =>
      (await this.depositSuccessTextAndroid.isDisplayed().catch(() => false)) ||
      (await this.depositErrorTextAndroid.isDisplayed().catch(() => false)),
    { timeout: 60000, interval: 500 }
  )

  if (await this.depositErrorTextAndroid.isDisplayed().catch(() => false)) {
    throw new Error('Deposit failed: Looks like Something went wrong')
  }

  return
}


  
    /* ---------- iOS ---------- */
if (browser.isIOS) {
  // 1) open card list
  await this.openCardListIOS.waitForDisplayed({ timeout: 20000 })
  await this.tap(this.openCardListIOS)

  // 2) pick needed card
  await this.card0036IOS.waitForDisplayed({ timeout: 20000 })
  await this.tap(this.card0036IOS)

  // 3) pay processing
  await this.payProcessingBtnIOS.waitForDisplayed({ timeout: 30000 })
  await this.payProcessingBtnIOS.waitForEnabled({ timeout: 30000 })
  await this.tap(this.payProcessingBtnIOS)
  await this.depositApprovedIOS.waitForDisplayed({ timeout: 60000 })

  return
}

  }

  /* =========================
   * ANDROID: ensure Single
   * ========================= */

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
}
