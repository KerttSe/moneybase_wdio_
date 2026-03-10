import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'
import type { AuthData } from '../data/credentials'




export class LoginPage extends BasePage {
  private static readonly IDS = {
    welcomeSkip: 'welcomeToMoneybase_button_skip',
    registerScreen: 'register_screen',
  } as const

  private get alertTitleAndroid() {
    return $('id=com.moneybase.qa:id/alertTitle')
  }

  private get alertBtn3Android() {
    return $('id=android:id/button3')
  }

  private byId(name: string) {
    if (browser.isAndroid) {
      //  cover і "welcomeToMoneybase_button_skip", and "com.xxx:id/welcomeToMoneybase_button_skip"
      const rx = `.*:id/${name}$|^${name}$`
      return $(`android=new UiSelector().resourceIdMatches("${rx}")`)
    }
    // iOS: accessibility id
    return $(`~${name}`)
  }

  get welcomeSkipBtn() { return this.byId(LoginPage.IDS.welcomeSkip) }
  get registerScreen() { return this.byId(LoginPage.IDS.registerScreen) }

  async prepare() {
    // welcome skip (2 ios and android)
    if (await this.isDisplayed(this.welcomeSkipBtn, 5000)) {
      await this.welcomeSkipBtn.click()
    }

    if (browser.isIOS) {
      await this.dismissIOSAlerts()
      await browser.waitUntil(async () => {
        const registerShown = await this.registerScreen.isDisplayed().catch(() => false)
        const homeShown = await this.homeRoot.isDisplayed().catch(() => false)
        return registerShown || homeShown
      }, {
        timeout: 20000,
        interval: 500,
        timeoutMsg: 'Register screen or Home did not appear',
      })
      return
    }

    //  Android: waiting for  register_screen, if not appears, try to dismiss possible system alerts and wait again
    await this.registerScreen.waitForDisplayed({ timeout: 20000 })
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
  await this.countryCodeBtn.waitForDisplayed({ timeout: 10000 })
  await this.countryCodeBtn.click()

  // open search and type country name
  await this.countrySearchTap.waitForDisplayed({ timeout: 20000 })
  await this.countrySearchTap.click()
  await browser.pause(250)

  const input = await this.getCountrySearchInput()

  // iOS: setvalue as usual but with extra checks and clear (бо іноді не кликається або не очищається)
  if (browser.isIOS) {
    await input.waitForDisplayed({ timeout: 10000 })
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
  await item.waitForDisplayed({ timeout: 20000 })
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
  const map: Record<string, string> = {
    '0': 'loginKeyPad_zero',
    '1': 'loginKeyPad_one',
    '2': 'loginKeyPad_two',
    '3': 'loginKeyPad_three',
    '4': 'loginKeyPad_four',
    '5': 'loginKeyPad_five',
    '6': 'loginKeyPad_six',
    '7': 'loginKeyPad_seven',
    '8': 'loginKeyPad_eight',
    '9': 'loginKeyPad_nine',
  };
  return $(`-ios predicate string:type == "XCUIElementTypeOther" AND name == "${map[d]}"`);
}

private async tapDigitIOS(d: string) {
  const label = $(`~${d}`);
  if (await label.isExisting()) {
    await label.click();
    return;
  }
  const container = this.iosKeypadContainerByDigit(d);
  await container.waitForDisplayed({ timeout: 5000 });
  await container.click();
}

/* ===== Aos ===== */
private androidKeypadDigit(d: string) {
  //  повний resource-id з package
  return $(`android=new UiSelector().resourceId("com.moneybase.qa:id/keypad_text_${d}")`);
}

private async tapDigitAndroid(d: string) {
  const el = this.androidKeypadDigit(d);
  await el.waitForDisplayed({ timeout: 5000 });
  await el.click();
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
    await this.authLoginNavBar.waitForDisplayed({ timeout: 50000 });
    await $(`~${pin[0]}`).waitForDisplayed({ timeout: 50000 });
  }

  if (browser.isAndroid) {
    await this.androidAuthLoginRoot.waitForDisplayed({ timeout: 50000 });
    await this.androidKeypadDigit(pin[0]).waitForDisplayed({ timeout: 30000 });
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
    await this.otpContainerIOS.waitForDisplayed({ timeout: 40000 });
    return;
  }

  if (browser.isAndroid) {
    await this.otpContainerAndroid.waitForDisplayed({ timeout: 40000 });
    return;
  }

  throw new Error('Unsupported platform in waitForOtpScreen');
}

async enterOtp(code: string = '123456') {
  const otp = this.normalizeOtp(code);

  await this.waitForOtpScreen();

  if (browser.isIOS) {
    const field = await this.otpFieldIOS;
    await field.waitForDisplayed({ timeout: 40000 });
    await field.click();

    for (const digit of otp) {
      await field.addValue(digit);
    }
    return;
  }

  if (browser.isAndroid) {
    const field = this.otpFieldAndroid; 
    await field.waitForDisplayed({ timeout: 40000 });
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

get applePayProposalCloseBtn() {
  if (browser.isAndroid) {
    return $('android=new UiSelector().resourceId("googlepayProposal_button_close")')}
  return $('~applePayProposal_button_close')
}


get homeRoot() {
  if (browser.isAndroid) {
    return $('android=new UiSelector().resourceId("home_screen")')
  }
  return $('~home_screen_view')
}


/** 1) tap Continue */
async tapContinueAfterOtp() {
  await browser.pause(8200)

  await browser.waitUntil(async () => {
    const continueVisible = await this.postOtpContinueBtn.isDisplayed().catch(() => false)
    const applePay = await this.applePayProposalCloseBtn.isDisplayed().catch(() => false)
    const home = await this.homeRoot.isDisplayed().catch(() => false)
    return continueVisible || applePay || home
  }, {
    timeout: 60000,
    interval: 500,
    timeoutMsg: 'After OTP: Continue/Home/ApplePay did not appear',
  })

  const continueVisible = await this.postOtpContinueBtn.isDisplayed().catch(() => false)
  if (!continueVisible) return

  await this.postOtpContinueBtn.waitForEnabled({ timeout: 10000 })
  await this.tap(this.postOtpContinueBtn)
}

/** 2) we awaiting for  Home, if card exist ApplePay in-app) */
async waitForPostOtpNextStep(timeout = 30000) {
  await browser.waitUntil(async () => {
    const applePay = await this.applePayProposalCloseBtn.isDisplayed().catch(() => false)
    const home = await this.homeRoot.isDisplayed().catch(() => false)
    return applePay || home
  }, {
    timeout,
    interval: 400,
    timeoutMsg: 'After Continue: neither Home nor ApplePay appeared',
  })
}

/** 3) Optional: close ApplePay (in-app) */
async closeApplePayIfVisible() {
  const visible = await this.applePayProposalCloseBtn.isDisplayed().catch(() => false)
  if (!visible) return

  await this.tap(this.applePayProposalCloseBtn)
  await this.applePayProposalCloseBtn.waitForDisplayed({ reverse: true, timeout: 10000 })
}

/** 4) waiting for Home screen */
async waitForHome(timeout = 30000) {
  if (browser.isAndroid) {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    await browser.waitUntil(
      async () => {
        const homeShown = await this.homeRoot.isDisplayed().catch(() => false)
        if (homeShown) return true

        const alertShown = await this.alertBtn3Android.isDisplayed().catch(() => false)
        if (alertShown) {
          await this.tap(this.alertBtn3Android)
          await this.alertBtn3Android.waitForDisplayed({ reverse: true, timeout: 7000 }).catch(() => {})
        }

        const alertTitleShown = await this.alertTitleAndroid.isDisplayed().catch(() => false)
        if (alertTitleShown && !alertShown) {
          const btnShown = await this.alertBtn3Android.waitForDisplayed({ timeout: 3000 }).catch(() => false)
          if (btnShown) {
            await this.tap(this.alertBtn3Android)
            await this.alertBtn3Android.waitForDisplayed({ reverse: true, timeout: 7000 }).catch(() => {})
          }
        }

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

  await this.homeRoot.waitForDisplayed({ timeout })
}




/* ---------- FULL FLOW ---------- */
async loginFlow(auth: AuthData) {
  const alreadyHome = await this.homeRoot.isDisplayed().catch(() => false)
  if (alreadyHome) return
  await this.prepare()
  await this.selectCountry(auth.country)
  await this.enterMobile(auth.phone)
  await this.continue()
  await this.enterPin(auth.pin)

  await this.waitForOtpScreen()
  await this.enterOtp('000000')

  await this.tapContinueAfterOtp()

  await this.waitForPostOtpNextStep(30000)
  await this.closeApplePayIfVisible()

  await this.waitForHome(30000)

  // Ensure app stays in foreground after successful login
  if (browser.isAndroid) {
    await browser.pause(500)
  }
}


}

/* ========= INSTANCE AFTER CLASS ========= */
export const loginPage = new LoginPage()
