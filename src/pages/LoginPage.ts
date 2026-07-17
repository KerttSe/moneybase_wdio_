import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'
import type { AuthData } from '../data/credentials'
import type { ChainablePromiseElement } from 'webdriverio'
import OtpHelper from '../helpers/otp.helper'

type LoginFlowOptions = {
  useApiOtp?: boolean
  otpPhone?: string
}




export class LoginPage extends BasePage {
  private readonly iosBundleId = 'com.moneybase.quality'

  private static readonly IDS = {
    welcomeSkip: 'welcomeToMoneybase_button_skip',
    registerScreen: 'register_screen',
  } as const

  private byId(name: string) {
    if (browser.isAndroid) {
      //  cover і "welcomeToMoneybase_button_skip", and "com.xxx:id/welcomeToMoneybase_button_skip"
      const rx = `.*:id/${name}$|^${name}$`
      return $(`android=new UiSelector().resourceIdMatches("${rx}")`)
    }
    // iOS: accessibility id
    return $(`~${name}`)
  }

  private text(text: string) {
    return $(`android=new UiSelector().text("${text}")`)
  }

  private buttonByText(text: string) {
    return $(`//android.widget.TextView[@text="${text}"]/ancestor::android.view.View[@clickable="true"][1]`)
  }

  get welcomeSkipBtn() { return this.byId(LoginPage.IDS.welcomeSkip) }
  get registerScreen() { return this.byId(LoginPage.IDS.registerScreen) }

  private async dismissAndroidBlockersOnce() {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const permissionAllow = $('id=com.android.permissioncontroller:id/permission_allow_button')
    const permissionAllowLegacy = $('id=com.android.packageinstaller:id/permission_allow_button')
    const permissionAllowText = $('android=new UiSelector().textMatches("(?i)allow")')

    const clickIfVisible = async (el: ChainablePromiseElement) => {
      const visible = await el.isDisplayed().catch(() => false)
      if (!visible) return false
      await el.click().catch(() => {})
      return true
    }

    // System permissions
    if (await clickIfVisible(permissionAllow)) return
    if (await clickIfVisible(permissionAllowLegacy)) return
    if (await clickIfVisible(permissionAllowText)) return

    await this.dismissCommonAndroidAlert(2500).catch(() => false)
  }

  private async dismissPostOtpPopupAndroidOnce() {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const googlePayClose = this.applePayProposalCloseBtn
    const closeShown = await googlePayClose.isDisplayed().catch(() => false)
    if (closeShown) {
      await googlePayClose.click().catch(() => {})
      await googlePayClose.waitForExist({ reverse: true, timeout: 7000 }).catch(() => {})

      await this.forceHomeViaBottomNavAndroid().catch(() => {})
    }

    await this.dismissAndroidBlockersOnce()
    await this.forceHomeViaBottomNavAndroid().catch(() => {})
  }

  private async forceHomeViaBottomNavAndroid() {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const homeShown = await this.homeRoot.isDisplayed().catch(() => false)
    if (homeShown) return

    const cardsShown = await this.cardsRootAndroid.isDisplayed().catch(() => false)
    if (!cardsShown) return

    const homeTabShown = await this.homeTabAndroid.isDisplayed().catch(() => false)
    if (homeTabShown) {
      await this.tap(this.homeTabAndroid).catch(() => {})
    } else if (await this.homeTabAndroidA11y.isDisplayed().catch(() => false)) {
      await this.tap(this.homeTabAndroidA11y).catch(() => {})
    } else if (await this.homeTabAndroidXpath.isDisplayed().catch(() => false)) {
      await this.tap(this.homeTabAndroidXpath).catch(() => {})
    }

    await browser.pause(300)
  }

  async prepare() {
    if (browser.isIOS) {
      await this.dismissIOSAlerts()
    }

    // welcome skip (2 ios and android)
    if (await this.isDisplayed(this.welcomeSkipBtn, 5000)) {
      await this.welcomeSkipBtn.click()
    }

    if (browser.isIOS) {
      await this.dismissIOSAlerts()
      await this.dismissIOSPermissionAlertsIfPresent().catch(() => {})
      let snapshotTaken = false
      await browser.waitUntil(async () => {
        await this.dismissIOSAlerts()
        await this.dismissIOSPermissionAlertsIfPresent().catch(() => {})
        if (!snapshotTaken) {
          await this.debugSnapshot('prepare-ios-loop')
          snapshotTaken = true
        }
        const registerShown = await this.registerScreen.isDisplayed().catch(() => false)
        const homeShown = await this.homeRoot.isDisplayed().catch(() => false)
        const passcodeShown = await this.isIOSPasscodeScreenShown()
        const otpShown = await this.otpContainerIOS.isDisplayed().catch(() => false)
        return registerShown || homeShown || passcodeShown || otpShown
      }, {
        timeout: 30000,
        interval: 500,
        timeoutMsg: 'Register screen, passcode screen, OTP screen, or Home did not appear',
      })
      return
    }

    // Android: wait for Register or Home, dismissing potential permission dialogs/alerts
    await browser.switchContext('NATIVE_APP').catch(() => {})

    await browser.waitUntil(async () => {
      const registerShown = await this.registerScreen.isDisplayed().catch(() => false)
      const homeShown = await this.homeRoot.isDisplayed().catch(() => false)
      if (registerShown || homeShown) return true

      await this.dismissAndroidBlockersOnce()
      return false
    }, {
      timeout: 60000,
      interval: 800,
      timeoutMsg: 'Register screen or Home did not appear on Android',
    })
  }





  
/* ---------- COUNTRY ---------- */

// country code button:  (with byId)
get countryCodeBtn() { return this.byId('register_button_countryCode') }

//  Search trigger:
// iOS:  id (~countrySelection_search_tap)
// Android:  TextView  "Search"
get countrySearchTap() {
  if (browser.isAndroid) {
    return $('android=new UiSelector().text("Search")')
  }
  return this.byId('countrySelection_search_tap')
}

// Country item:
// iOS: ~country_item_Malta 
// Android:  "Malta"
countryItem(country: string) {
  if (browser.isAndroid) {
    return $(`android=new UiSelector().text("${country}")`)
  }
  return this.byId(`country_item_${country}`)
}

//  Search input getter
private async getCountrySearchInput() {
  if (browser.isIOS) {
    let input = $('-ios class chain:**/XCUIElementTypeSearchField')
    if (!(await input.isDisplayed().catch(() => false))) {
      input = $('-ios class chain:**/XCUIElementTypeTextField')
    }
    return input
  }

  // Android: after taping on "Search" should be appear EditText
  // taking first EditText field on screen, because in this flow only one should be present. If in future there will be more EditText fields on this screen, we need to find more reliable locator for search input.
  return $('android=new UiSelector().className("android.widget.EditText").instance(0)')
}

// Android “tank” input: if setValue failing — ADB fallback
private async typeAndroidFallback(value: string) {
  const safe = value.replace(/ /g, '%s')
  await browser.execute('mobile: shell', {
    command: 'input',
    args: ['text', safe],
  })
}

async selectCountry(country: string) {
  await browser.pause(250)
  await this.countryCodeBtn.waitForExist({ timeout: 10000 })
  await this.countryCodeBtn.click()

  // open search and type country name
  await this.countrySearchTap.waitForExist({ timeout: 20000 })
  await this.countrySearchTap.click()
  await browser.pause(250)

  const input = await this.getCountrySearchInput()

  // iOS: setvalue as usual but with extra checks and clear (бо іноді не кликається або не очищається)
  if (browser.isIOS) {
    await input.waitForExist({ timeout: 10000 })
    await input.click()
    try { await input.clearValue() } catch {}
    await input.setValue(country)
  } else {
    // Android: some times edittext can be stubborn and not appear, so we check if it's visible before interacting, otherwise fallback to ADB immediately
    const hasInput = await input.isDisplayed().catch(() => false)

    if (hasInput) {
      await input.click()
      try { await input.clearValue() } catch {}
      try {
        // addValue more reliable than setValue
        await input.addValue(country)
      } catch {
        await this.typeAndroidFallback(country)
      }
    } else {
      // if input never appears, fallback to ADB immediately
      await this.typeAndroidFallback(country)
    }
  }

  // pick country from results
  const item = this.countryItem(country)
  await item.waitForExist({ timeout: 20000 })
  await item.click()
}




/* ---------- MOBILE ---------- */

get mobileInput() {
  if (browser.isAndroid) {
    return $('android=new UiSelector().resourceIdMatches(".*:id/register_input_mobileNumber$|^register_input_mobileNumber$")')
  }
  return $('~register_input_mobileNumber')
}

get continueBtn() {
  if (browser.isAndroid) {
    return $('android=new UiSelector().resourceIdMatches(".*:id/register_button_continue$|^register_button_continue$")')
  }
  return $('~register_button_continue')
}

async enterMobile(phone: string) {
  await this.type(this.mobileInput, phone, 20000)
}

async continue() {
  await this.tap(this.continueBtn, 20000)
}


 /* ---------- PIN ---------- */

// iOS anchor
get authLoginNavBar() {
  return $('~moneybase.AuthenticationLoginView');
}

// Android anchor
get androidAuthLoginRoot() {
  return $('android=new UiSelector().resourceId("com.moneybase.qa:id/action_bar_root")');
}

/* ===== iOS ===== */
private iosKeypadContainerByDigit(d: string) {
  return $(`-ios predicate string:type == "XCUIElementTypeOther" AND name == "loginKeyPad_${d}"`);
}

private async tapDigitIOS(d: string) {
  const label = $(`~${d}`);
  if (await label.isExisting()) {
    await label.click();
    return;
  }
  const container = this.iosKeypadContainerByDigit(d);
  await container.waitForExist({ timeout: 5000 });
  await container.click();
}

  private async isIOSPasscodeScreenShown() {
    if (!browser.isIOS) return false
    return this.iosKeypadContainerByDigit('1').waitForExist({ timeout: 3000 }).catch(() => false)
  }

/* ===== Aos ===== */
private androidKeypadDigit(d: string) {
  //  повний resource-id з package
  return $(`android=new UiSelector().resourceId("com.moneybase.qa:id/keypad_text_${d}")`);
}

  private async tapDigitAndroid(d: string) {
    const el = this.androidKeypadDigit(d);
    await el.waitForExist({ timeout: 5000 });
    await el.click();
  }

  private async isAndroidPasscodeScreenShown() {
    if (!browser.isAndroid) return false
    return this.androidKeypadDigit('1').waitForExist({ timeout: 3000 }).catch(() => false)
  }

  private async waitForAndroidLoginNextStepAfterMobile(timeout = 45000) {
    if (!browser.isAndroid) return

    await browser.waitUntil(async () => {
      await browser.switchContext('NATIVE_APP').catch(() => {})
      const otpShown = await this.otpContainerAndroid.isDisplayed().catch(() => false)
      const continueShown = await this.postOtpContinueBtn.isDisplayed().catch(() => false)
      const homeShown = await this.homeRoot.isDisplayed().catch(() => false)
      const passcodeShown = await this.isAndroidPasscodeScreenShown()
      if (otpShown || continueShown || homeShown || passcodeShown) return true

      await this.dismissAndroidBlockersOnce()
      return false
    }, {
      timeout,
      interval: 500,
      timeoutMsg: 'After mobile Continue: Android login next step did not appear',
    })
  }

/* ===== Shared ===== */
private async tapDigit(d: string) {
  if (browser.isIOS) return this.tapDigitIOS(d);
  if (browser.isAndroid) return this.tapDigitAndroid(d);
  throw new Error('Unsupported platform for PIN entry');
}

async enterPin(pin: string) {
  //  platform-specific anchor + readiness
  if (browser.isIOS) {
    // On login flow the nav bar is "moneybase.AuthenticationLoginView";
    // on onboarding it is "Account Creation" — use loginNewMobile_screen as fallback anchor.
    await browser.waitUntil(
      async () =>
        (await this.authLoginNavBar.isDisplayed().catch(() => false)) ||
        (await $('~loginNewMobile_screen').isDisplayed().catch(() => false)),
      { timeout: 50000, interval: 500, timeoutMsg: 'iOS PIN screen (authLoginNavBar or loginNewMobile_screen) did not appear' }
    )
    await $(`~${pin[0]}`).waitForExist({ timeout: 50000 });
  }

  if (browser.isAndroid) {
    await this.androidAuthLoginRoot.waitForExist({ timeout: 50000 });
    await this.androidKeypadDigit(pin[0]).waitForExist({ timeout: 30000 });
  }

  for (const d of pin) {
    await this.tapDigit(d);
  }
}





/* ---------- OTP ---------- */

/* ===== iOS ===== */
get otpContainerIOS() {
  return $(`-ios predicate string:name == "otp_input"`);
}

get otpFieldIOS() {
  return this.otpContainerIOS.$('XCUIElementTypeTextField');
}

get otpFirstSlotIOS() {
  return $('//XCUIElementTypeTextField[starts-with(@name, "OTP_entry_")][1]')
}

get otpLastSlotIOS() {
  return $('//XCUIElementTypeTextField[@name="OTP_entry_5"]')
}

get otpIncorrectCodeIOS() {
  return $('//XCUIElementTypeStaticText[contains(@name, "Entered code is incorrect") or contains(@label, "Entered code is incorrect")]')
}

/* ===== Android ===== */
// Anchor (те, що ти показав)
get otpContainerAndroid() {
  return $('android=new UiSelector().resourceId("com.moneybase.qa:id/composeViewRegisterMobile")');
}

// input field 
get otpFieldAndroid() {
  return $('android=new UiSelector().resourceId("com.moneybase.qa:id/otp_input")');
}

/* ===== Shared ===== */
private normalizeOtp(code: string): string {
  const otp = code.replace(/\D/g, '').slice(0, 6);
  if (otp.length !== 6) throw new Error(`Invalid OTP: ${code}`);
  return otp;
}

async waitForOtpScreen() {
  if (browser.isIOS) {
    await this.otpContainerIOS.waitForExist({ timeout: 40000 });
    return;
  }

  if (browser.isAndroid) {
    await browser.waitUntil(async () => {
      const otpShown = await this.otpContainerAndroid.isDisplayed().catch(() => false)
      const continueShown = await this.postOtpContinueBtn.isDisplayed().catch(() => false)
      const popupShown = await this.applePayProposalCloseBtn.isDisplayed().catch(() => false)
      const homeShown = await this.homeRoot.isDisplayed().catch(() => false)

      if (otpShown || continueShown || popupShown || homeShown) return true

      await this.dismissAndroidBlockersOnce()
      return false
    }, {
      timeout: 40000,
      interval: 500,
      timeoutMsg: 'OTP or post-OTP screen did not appear on Android',
    })
    return;
  }

  throw new Error('Unsupported platform in waitForOtpScreen');
}

async enterOtp(code: string = '123456') {
  const otp = this.normalizeOtp(code);

  await this.waitForOtpScreen();

  if (browser.isIOS) {
    const field = this.otpFirstSlotIOS;
    await field.waitForExist({ timeout: 40000 });
    await field.click();
    await field.clearValue().catch(() => {});
    await field.addValue(otp);

    const filled = await browser
      .waitUntil(
        async () => {
          const value = await this.otpLastSlotIOS.getAttribute('value').catch(() => '')
          return /\d/.test(String(value || ''))
        },
        { timeout: 3000, interval: 200 }
      )
      .catch(() => false)

    if (!filled) {
      await field.click();
      await field.clearValue().catch(() => {});
      for (const digit of otp) {
        await field.addValue(digit);
      }
    }
    return;
  }

  if (browser.isAndroid) {
    const field = this.otpFieldAndroid; 
    const hasField = await field.waitForExist({ timeout: 8000 }).catch(() => false)
    if (!hasField) return
    await field.click();
    await field.setValue(otp); //  Android setValue ок
    return;
  }

  throw new Error('Unsupported platform in enterOtp');
}

/* ---------- POST-OTP / FIRST LOGIN UI ---------- */
  get postOtpContinueBtn() {
    // Android — automation id
    if (browser.isAndroid) {
      return this.byId('verificationSuccess_button_continue')

  }

  // iOS — id (~Continue)
  return $('~Continue')
  }

  get verificationSuccessScreen() {
    return this.byId('verificationSuccess_screen')
  }

  private async tapPostOtpContinueIfVisibleAndroid() {
    if (!browser.isAndroid) return false

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const continueShown = await this.postOtpContinueBtn.isDisplayed().catch(() => false)
    const successShown = await this.verificationSuccessScreen.isDisplayed().catch(() => false)
    if (!continueShown && !successShown) return false

    if (continueShown) {
      await this.postOtpContinueBtn.click().catch(async () => {
        const loc = await this.postOtpContinueBtn.getLocation()
        const size = await this.postOtpContinueBtn.getSize()
        await this.tapAndroidCoordinates(loc.x + size.width / 2, loc.y + size.height / 2)
      })
    } else {
      await this.tapAndroidCoordinates(540, 2266)
    }

    await browser.pause(800)
    return true
  }

  private async tapAndroidCoordinates(x: number, y: number) {
    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger-login-android-tap',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: Math.round(x), y: Math.round(y) },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 80 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
  }

get applePayProposalCloseBtn() {
  if (browser.isAndroid) {
    return $('android=new UiSelector().resourceId("googlepayProposal_button_close")')}
  return $('~applePayProposal_button_close')
}


get homeRoot() {
  if (browser.isAndroid) {
    return this.byId('home_screen')
  }
  return $('~home_screen_view')
}

get verificationRequiredTitle() {
  if (browser.isAndroid) {
    return this.text('Verification is required')
  }
  return $('~Verification is required')
}

get verifyNowBtn() {
  if (browser.isAndroid) {
    return this.byId('infoContinueButton')
  }
  return $('~Verify Now')
}

get verifyNowText() {
  if (browser.isAndroid) {
    return this.text('Verify Now')
  }
  return $('~Verify Now')
}

get homeTabAndroid() {
  return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_button_home")')
}

get homeTabAndroidA11y() {
  return $('~Home')
}

get homeTabAndroidXpath() {
  return $('//android.widget.FrameLayout[@content-desc="Home"]')
}

get cardsRootAndroid() {
  return this.byId('cards_screen')
}

get payRootAndroid() {
  return this.byId('pay_screen')
}


/** 1) tap Continue */
  async tapContinueAfterOtp() {
    await browser.pause(1200)

    await browser.waitUntil(async () => {
      await this.dismissPostOtpPopupAndroidOnce()
    if (browser.isIOS) {
      await this.dismissIOSAlerts()
      await this.dismissIOSPermissionAlertsIfPresent().catch(() => false)
    }
    const incorrectOtp = browser.isIOS && await this.otpIncorrectCodeIOS.isExisting().catch(() => false)
    const continueVisible = await this.postOtpContinueBtn.isDisplayed().catch(() => false)
    const applePay = await this.applePayProposalCloseBtn.isDisplayed().catch(() => false)
    const home = await this.homeRoot.isDisplayed().catch(() => false)
    const passcodeShown = await this.isIOSPasscodeScreenShown()
    return incorrectOtp || continueVisible || applePay || home || passcodeShown
  }, {
    timeout: 60000,
    interval: 500,
    timeoutMsg: 'After OTP: Continue/Home/ApplePay/passcode did not appear',
  })

  if (browser.isIOS && await this.otpIncorrectCodeIOS.isExisting().catch(() => false)) {
    throw new Error('Login OTP was rejected by app: Entered code is incorrect')
  }

  const continueVisible = await this.postOtpContinueBtn.isDisplayed().catch(() => false)
  if (!continueVisible) return

  if (browser.isAndroid && await this.tapPostOtpContinueIfVisibleAndroid()) return

  const enabled = await this.postOtpContinueBtn.waitForEnabled({ timeout: 10000 }).catch(() => false)
  if (enabled) {
    await this.tap(this.postOtpContinueBtn)
    return
  }

  await this.postOtpContinueBtn.click().catch(() => {})
}

/** 2) we awaiting for  Home, if card exist ApplePay in-app) */
async waitForPostOtpNextStep(timeout = 30000) {
  await browser.waitUntil(async () => {
    await this.dismissPostOtpPopupAndroidOnce()
    if (browser.isIOS) {
      await this.dismissIOSAlerts()
      await this.dismissIOSPermissionAlertsIfPresent().catch(() => false)
    }
    const continueVisible = await this.postOtpContinueBtn.isDisplayed().catch(() => false)
    const applePay = await this.applePayProposalCloseBtn.isDisplayed().catch(() => false)
    const home = await this.homeRoot.isDisplayed().catch(() => false)
    const passcodeShown = await this.isIOSPasscodeScreenShown()
    return continueVisible || applePay || home || passcodeShown
  }, {
    timeout,
    interval: 400,
    timeoutMsg: 'After Continue: neither Home nor ApplePay nor passcode appeared',
  })
}

/** 3) Optional: close ApplePay (in-app) */
async closeApplePayIfVisible() {
  const visible = await this.applePayProposalCloseBtn.isDisplayed().catch(() => false)
  if (!visible) return

  await this.tap(this.applePayProposalCloseBtn)
  await this.applePayProposalCloseBtn.waitForExist({ reverse: true, timeout: 10000 })
}

/** 4) waiting for Home screen */
async waitForHome(timeout = 30000) {
  if (browser.isAndroid) {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    await browser.waitUntil(
      async () => {
        await this.dismissPostOtpPopupAndroidOnce()
        const homeShown = await this.homeRoot.isDisplayed().catch(() => false)
        if (homeShown) return true

        if (await this.tapPostOtpContinueIfVisibleAndroid()) {
          return await this.homeRoot.isDisplayed().catch(() => false)
        }

        const cardsShown = await this.cardsRootAndroid.isDisplayed().catch(() => false)
        const homeTabShown = await this.homeTabAndroid.isDisplayed().catch(() => false)
        if (cardsShown && homeTabShown) {
          await this.tap(this.homeTabAndroid)
          await browser.pause(300)
          const homeAfterTap = await this.homeRoot.isDisplayed().catch(() => false)
          if (homeAfterTap) return true
        }

        await this.dismissCommonAndroidAlert(3000).catch(() => false)

        return await this.homeRoot.isDisplayed().catch(() => false)
      },
      {
        timeout,
        interval: 500,
        timeoutMsg: 'Home screen did not appear (blocked by alert?)',
      }
    )
    return
  }

  await browser.waitUntil(async () => {
    await this.dismissIOSAlerts()
    await this.dismissIOSPermissionAlertsIfPresent().catch(() => false)

    const homeShown = await this.homeRoot.isDisplayed().catch(() => false)
    if (homeShown) return true

    const applePayShown = await this.applePayProposalCloseBtn.isDisplayed().catch(() => false)
    if (applePayShown) {
      await this.tap(this.applePayProposalCloseBtn).catch(() => {})
      await browser.pause(500)
    }

    return this.homeRoot.isDisplayed().catch(() => false)
  }, {
    timeout,
    interval: 500,
    timeoutMsg: 'Home screen did not appear on iOS',
  })
}

async waitForVerificationRequired(timeout = 45000) {
  await browser.waitUntil(
    async () => {
      if (browser.isAndroid) {
        await browser.switchContext('NATIVE_APP').catch(() => {})
        await this.dismissAndroidBlockersOnce()
      }

      const verificationTitleShown = await this.verificationRequiredTitle.isDisplayed().catch(() => false)
      const verifyNowShown =
        (await this.verifyNowBtn.isDisplayed().catch(() => false)) ||
        (await this.verifyNowText.isDisplayed().catch(() => false))

      return verificationTitleShown && verifyNowShown
    },
    {
      timeout,
      interval: 500,
      timeoutMsg: 'Expected Verification is required screen with Verify Now button after login',
    }
  )
}




/* ---------- FULL FLOW ---------- */
private async relaunchIOSApp() {
  if (!browser.isIOS) return

  await this.dismissIOSAlerts()
  await browser.pause(600)

  await browser.activateApp(this.iosBundleId).catch(() => {})

  await this.dismissIOSAlerts()
  await browser.pause(1200)
}

private async getLoginOtp(auth: AuthData, options: LoginFlowOptions) {
  if (!options.useApiOtp) return '000000'

  const phone = options.otpPhone || process.env.OTP_PHONE || process.env.MB_PHONE || auth.phone
  const maxRequests = Number(process.env.LOGIN_OTP_MAX_REQUESTS || 1)
  const fetchDelayMs = Number(process.env.LOGIN_OTP_FETCH_DELAY_MS || 0)
  if (Number.isFinite(fetchDelayMs) && fetchDelayMs > 0) {
    await browser.pause(Math.floor(fetchDelayMs))
  }
  console.log(`[LoginPage.getLoginOtp] Fetching login OTP via API with maxRequests=${maxRequests}`)
  const otp = await OtpHelper.getLatestOtp({
    phone,
    timeoutMs: Number(process.env.LOGIN_OTP_TIMEOUT_MS || process.env.OTP_TIMEOUT_MS || 90000),
    intervalMs: Number(process.env.LOGIN_OTP_POLL_INTERVAL_MS || process.env.OTP_POLL_INTERVAL_MS || 2000),
    maxRequests,
  })
  process.env.LAST_LOGIN_OTP = otp
  return otp
}

private async loginFlowOnce(auth: AuthData, options: LoginFlowOptions = {}) {
  console.log('[LoginPage.loginFlowOnce] Starting with options:', JSON.stringify(options))
  
  const alreadyHome = await this.homeRoot.isDisplayed().catch(() => false)
  if (alreadyHome) return

  await this.prepare()
  if (browser.isIOS && await this.otpContainerIOS.isDisplayed().catch(() => false)) {
    await this.enterOtp(await this.getLoginOtp(auth, options))
    await this.tapContinueAfterOtp()
    if (await this.isIOSPasscodeScreenShown()) {
      await this.enterPin(auth.pin)
    }
    await this.waitForPostOtpNextStep(30000)
    await this.closeApplePayIfVisible()
    await this.waitForHome(30000)
    return
  }

  if (browser.isIOS && await this.isIOSPasscodeScreenShown()) {
    await this.enterPin(auth.pin)
    await this.closeApplePayIfVisible()

    await browser.waitUntil(async () => {
      const homeShown = await this.homeRoot.isDisplayed().catch(() => false)
      const otpShown = await this.otpContainerIOS.isDisplayed().catch(() => false)
      return homeShown || otpShown
    }, {
      timeout: 45000,
      interval: 500,
      timeoutMsg: 'After iOS passcode: neither Home nor OTP appeared',
    })

    if (await this.homeRoot.isDisplayed().catch(() => false)) return

    await this.enterOtp(await this.getLoginOtp(auth, options))
    await this.tapContinueAfterOtp()
    if (await this.isIOSPasscodeScreenShown()) {
      await this.enterPin(auth.pin)
    }
    await this.waitForPostOtpNextStep(30000)
    await this.closeApplePayIfVisible()
    await this.waitForHome(30000)
    return
  }

  await this.selectCountry(auth.country)
  await this.enterMobile(auth.phone)
  await this.continue()

  let androidPinEntered = false
  if (browser.isAndroid) {
    await this.waitForAndroidLoginNextStepAfterMobile()

    if (await this.homeRoot.isDisplayed().catch(() => false)) return

    if (await this.isAndroidPasscodeScreenShown()) {
      await this.enterPin(auth.pin)
      androidPinEntered = true
      await browser.pause(1200)
      const homeAfterPin = await this.homeRoot.isDisplayed().catch(() => false)
      if (homeAfterPin) return
    }
  }

  if (!androidPinEntered) {
    await this.enterPin(auth.pin)
  }

  await this.waitForOtpScreen()
  await this.enterOtp(await this.getLoginOtp(auth, options))

  await this.tapContinueAfterOtp()
  if (browser.isIOS && await this.isIOSPasscodeScreenShown()) {
    await this.enterPin(auth.pin)
  }

  await this.waitForPostOtpNextStep(30000)
  await this.closeApplePayIfVisible()

  await this.waitForHome(30000)

  // Ensure app stays in foreground after successful login
  if (browser.isAndroid) {
    await this.stabilizeAndroidHomeSurface(20000).catch(() => false)
    await browser.pause(500)
  }
}

async loginFlow(auth: AuthData, options: LoginFlowOptions = {}) {
  try {
    await this.loginFlowOnce(auth, options)
  } catch (error) {
    if (!browser.isIOS) throw error

    console.warn('[LoginPage] iOS login failed, trying one recovery retry:', error)
    await this.relaunchIOSApp()
    await this.loginFlowOnce(auth, options)
  }
}

async loginFlowWithApiOtp(auth: AuthData) {
  await this.loginFlow(auth, { useApiOtp: true })
}


}

/* ========= INSTANCE AFTER CLASS ========= */
export const loginPage = new LoginPage()
