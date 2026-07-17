import BasePage from './BasePage'
import HomeScreenPage from './HomeScreenPage'
import { $, browser } from '@wdio/globals'

export default class AddFundsPage extends BasePage {
  private byAndroidResId(id: string) {
    const rx = `.*:id/${id}$|^${id}$`
    return $(`android=new UiSelector().resourceIdMatches("${rx}")`)
  }

  /* =========================
   * ANDROID: HOME / ACCOUNT
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

  private get homeRootAndroid() {
    return this.byAndroidResId('home_screen')
  }

  private get supportSheetTitleAndroid() {
    return $('android=new UiSelector().text("Support")')
  }

  /* =========================
   * ANDROID: blocking AlertDialog
   * ========================= */

  private async dismissBlockingAlertAndroid(timeoutMs = 10000) {
    await this.dismissKnownAndroidBlockingPopups(4).catch(() => false)
    await this.dismissCommonAndroidAlert(timeoutMs).catch(() => false)
  }

  private async dismissSupportSheetAndroid(timeoutMs = 7000) {
    if (!browser.isAndroid) return false

    const currentActivity = await browser.getCurrentActivity().catch(() => '')
    const isFreshchatActivity = /freshchat|CategoryListActivity|ConversationActivity/i.test(currentActivity)
    const supportShown = await this.supportSheetTitleAndroid.isDisplayed().catch(() => false)
    if (isFreshchatActivity || supportShown) {
      await browser.back().catch(() => {})
      await browser.pause(400)
      await browser.waitUntil(
        async () => {
          const activity = await browser.getCurrentActivity().catch(() => '')
          return !/freshchat|CategoryListActivity|ConversationActivity/i.test(activity)
        },
        { timeout: timeoutMs, interval: 300 }
      ).catch(() => {})
      return true
    }

    return false
  }
  /* =========================
   * OPEN ADD FUNDS FROM HOME
   * ========================= */

  get openBtn() {
    if (browser.isAndroid) return this.byAndroidResId('home_button_addFunds')
    return $('-ios predicate string:name == "Add Funds" OR name == "plus"')
  }

  /* =========================
   * TOP UP TILE (Card)
   * ========================= */

  get cardTile() {
    if (browser.isAndroid) return this.byAndroidResId('addFunds_card_cardTopUp')
    return $('~Card')
  }

  private get applePayProposalCloseBtnIOS() {
    return $('~applePayProposal_button_close')
  }

  private async dismissApplePayProposalIOS() {
    if (!browser.isIOS) return
    const shown = await this.applePayProposalCloseBtnIOS.waitForExist({ timeout: 5000 }).catch(() => false)
    if (!shown) return
    await this.applePayProposalCloseBtnIOS.click().catch(() => {})
    await this.applePayProposalCloseBtnIOS.waitForExist({ reverse: true, timeout: 5000 }).catch(() => {})
    await browser.pause(500)
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
    if (browser.isAndroid) return this.byAndroidResId('depositAmountText')
    return $('~cardDeposit_textInput_')
  }

  /* =========================
   * CONTINUE BUTTON
   * ========================= */

  get continueBtn() {
    if (browser.isAndroid) return this.byAndroidResId('cardTopUp_button_continue')
    return $('~Continue')
  }

  /* =========================
   * iOS: PAY / RESULT
   * ========================= */

  // opens card dropdown — second XCUIElementTypeImage inside Shift4 payment form container
private get openCardListIOS() {
  return $(`-ios class chain:**/XCUIElementTypeOther[\`name == "Shift4 Payment Page"\`]/XCUIElementTypeImage[2]`)
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
      await this.dismissBlockingAlertAndroid().catch(() => {})
      await this.dismissSupportSheetAndroid().catch(() => false)
      await this.stabilizeAndroidHomeSurface(15000).catch(() => false)
    }

    if (browser.isIOS) {
      await this.dismissIOSAlerts()
      await HomeScreenPage.waitForHomeLoaded()
      await HomeScreenPage.ensureIndividualAccount()
      await HomeScreenPage.waitForHomeLoaded()
      await this.dismissIOSAlerts()
    }

    if (browser.isIOS) {
      await this.openBtn.waitForExist({ timeout: 20000 })
      await this.openBtn.click()
    } else {
      await this.openBtn.waitForDisplayed({ timeout: 15000 }).catch(async () => {
        await browser.waitUntil(
          async () => {
            await this.dismissBlockingAlertAndroid().catch(() => {})
            await this.dismissSupportSheetAndroid().catch(() => false)
            return await this.openBtn.isDisplayed().catch(() => false)
          },
          {
            timeout: 25000,
            interval: 700,
            timeoutMsg: 'Add Funds button not visible on Home after blocker cleanup',
          }
        )
      })
      await this.tap(this.openBtn)
    }
  }

  async goToTopUp() {
    if (browser.isIOS) {
      await this.dismissApplePayProposalIOS().catch(() => {})
      await this.cardTile.waitForExist({ timeout: 15000 })
    } else {
      await this.cardTile.waitForDisplayed({ timeout: 15000 })
    }
    await this.tap(this.cardTile)

    if (browser.isIOS) {
      await this.cardDepositNavTitle.waitForExist({ timeout: 15000 })
    }
  }

  async enterAmount(amount: number | string) {
    if (browser.isIOS) {
      await this.amountInput.waitForExist({ timeout: 15000 })
    } else {
      await this.amountInput.waitForDisplayed({ timeout: 15000 })
    }
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

private async smallScrollDownToDepositIOS() {
  const { width, height } = await browser.getWindowRect()
  const x = Math.round(width * 0.5)
  const startY = Math.round(height * 0.8)
  const endY = Math.round(height * 0.4)

  await browser.performActions([
    {
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x, y: startY },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 150 },
        { type: 'pointerMove', duration: 500, x, y: endY },
        { type: 'pointerUp', button: 0 },
      ],
    },
  ])
  await browser.releaseActions().catch(() => {})
  await browser.pause(1000)
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
    await browser.releaseActions().catch(() => {})
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
  await this.openCardListIOS.waitForExist({ timeout: 20000 })
  await this.tap(this.openCardListIOS)

  // 2) pick needed card
  await this.card0036IOS.waitForExist({ timeout: 20000 })
  await this.tap(this.card0036IOS)

  // 3) pay processing
  await this.payProcessingBtnIOS.waitForExist({ timeout: 30000 })
  await this.payProcessingBtnIOS.waitForEnabled({ timeout: 30000 })
  await this.tap(this.payProcessingBtnIOS)

  // Wait for home screen to be visible (payment processing completes and navigates back)
  const homeRoot = $('~home_screen_view')
  await homeRoot.waitForExist({ timeout: 30000 })

  // Scroll on home page to ensure 'Deposit by Card' anchor is visible (gesture-based, same pattern as FXExchangePage)
  await this.smallScrollDownToDepositIOS()

  await this.depositApprovedIOS.waitForExist({ timeout: 60000 })
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
