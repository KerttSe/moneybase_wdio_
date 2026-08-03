import { $, browser, driver } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'
import BasePage from './BasePage'
import { loginPage } from './LoginPage'
import OtpHelper from '../helpers/otp.helper'

export default class AuthenticationPage extends BasePage {
  private readonly androidAppPackage = process.env.BS_ANDROID_APP_PACKAGE || 'com.moneybase.qa'
  private readonly androidAppActivity =
    process.env.BS_ANDROID_APP_ACTIVITY || 'com.moneybase.views.activities.LoginActivity'
  private readonly iosBundleId = 'com.moneybase.quality'

  // ── Passcode screen ──────────────────────────────────────────────────────

  private keypadDigitAndroid(d: string) {
    return $(`android=new UiSelector().resourceId("com.moneybase.qa:id/keypad_text_${d}")`)
  }

  private keypadDigitIOS(d: string) {
    return $(`-ios predicate string:type == "XCUIElementTypeOther" AND name == "loginKeyPad_${d}"`)
  }

  private async tapElementCenterIOS(el: ChainablePromiseElement) {
    await el.waitForExist({ timeout: 5000 })
    const location = await el.getLocation()
    const size = await el.getSize()
    await browser.execute('mobile: tap', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    })
  }

  private async tapKeypadDigit(d: string) {
    if (browser.isIOS) {
      const container = this.keypadDigitIOS(d)
      if (await container.isExisting().catch(() => false)) {
        await this.tapElementCenterIOS(container)
        return
      }

      const label = $(`~${d}`)
      await this.tapElementCenterIOS(label)
      return
    }
    const el = this.keypadDigitAndroid(d)
    await el.waitForExist({ timeout: 5000 })
    await el.click()
  }

  private async waitForPasscodeScreen(timeout = 30000) {
    if (browser.isIOS) {
      await browser.waitUntil(
        async () =>
          (await $('~moneybase.AuthenticationLoginView').isDisplayed().catch(() => false)) ||
          (await $('~loginNewMobile_screen').isDisplayed().catch(() => false)) ||
          (await this.keypadDigitIOS('1').isExisting().catch(() => false)),
        { timeout, interval: 500, timeoutMsg: 'iOS passcode screen did not appear' },
      )
      return
    }
    await this.keypadDigitAndroid('1').waitForExist({ timeout })
  }

  // ── Passcode error / lock ────────────────────────────────────────────────

  get passcodeErrorAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/tvLoginError")')
  }

  get passcodeErrorIOS() {
    return $('-ios predicate string:(type == "XCUIElementTypeStaticText" OR type == "XCUIElementTypeTextView") AND (name CONTAINS[c] "wrong" OR label CONTAINS[c] "wrong" OR name CONTAINS[c] "incorrect" OR label CONTAINS[c] "incorrect" OR name CONTAINS[c] "invalid" OR label CONTAINS[c] "invalid" OR name CONTAINS[c] "remaining" OR label CONTAINS[c] "remaining" OR name CONTAINS[c] "attempt" OR label CONTAINS[c] "attempt" OR name CONTAINS[c] "too many" OR label CONTAINS[c] "too many" OR name CONTAINS[c] "locked" OR label CONTAINS[c] "locked" OR name CONTAINS[c] "temporarily" OR label CONTAINS[c] "temporarily" OR name CONTAINS[c] "try again" OR label CONTAINS[c] "try again")')
  }

  get accountLockedAndroid() {
    return $('android=new UiSelector().textMatches("(?i).*locked.*|.*too many.*|.*suspended.*")')
  }

  get accountLockedIOS() {
    return $('-ios predicate string:(type == "XCUIElementTypeStaticText" OR type == "XCUIElementTypeTextView") AND (name CONTAINS[c] "locked" OR label CONTAINS[c] "locked" OR name CONTAINS[c] "blocked" OR label CONTAINS[c] "blocked" OR name CONTAINS[c] "suspended" OR label CONTAINS[c] "suspended" OR name CONTAINS[c] "too many" OR label CONTAINS[c] "too many" OR name CONTAINS[c] "temporarily" OR label CONTAINS[c] "temporarily" OR name CONTAINS[c] "try again later" OR label CONTAINS[c] "try again later")')
  }

  private async iosSourceHasPasscodeError() {
    const source = await browser.getPageSource().catch(() => '')
    return /wrong passcode|incorrect|invalid|remaining|too many attempts|temporarily locked|try again/i.test(source)
  }

  private async iosSourceHasAccountLocked() {
    const source = await browser.getPageSource().catch(() => '')
    return /too many attempts|temporarily locked|locked|blocked|suspended|try again later/i.test(source)
  }

  async waitForPasscodeError(timeout = 10000) {
    const el = browser.isIOS ? this.passcodeErrorIOS : this.passcodeErrorAndroid
    if (!browser.isIOS) {
      await el.waitForExist({ timeout, timeoutMsg: 'Expected passcode error message after wrong PIN' })
      return el
    }

    await browser.waitUntil(
      async () =>
        (await el.isExisting().catch(() => false)) ||
        (await this.iosSourceHasPasscodeError()),
      { timeout, interval: 750, timeoutMsg: 'Expected passcode error message after wrong PIN' },
    )
    return el
  }

  async waitForAccountLocked(timeout = 15000) {
    const locked = browser.isIOS ? this.accountLockedIOS : this.accountLockedAndroid
    await browser.waitUntil(
      async () =>
        browser.isIOS
          ? ((await locked.isExisting().catch(() => false)) || (await this.iosSourceHasAccountLocked()))
          : (await locked.isDisplayed().catch(() => false)),
      { timeout, interval: 500, timeoutMsg: 'Expected account locked message after repeated wrong passcodes' },
    )
  }

  // ── OTP screen ──────────────────────────────────────────────────────────

  get otpCountdownAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/tvOtpCountdown|.*:id/tvResendTimer|.*:id/otp_countdown.*")')
  }

  get otpCountdownIOS() {
    return $('-ios predicate string:name CONTAINS "Resend in" OR label CONTAINS "Resend in" OR name CONTAINS "seconds" OR label CONTAINS "seconds"')
  }

  get otpResendBtnAndroid() {
    return $('android=new UiSelector().textMatches("(?i)resend.*")')
  }

  get otpResendBtnIOS() {
    return $('~otp_resendButton')
  }

  async waitForOtpCountdownShown(timeout = 45000) {
    if (browser.isIOS) {
      await browser.waitUntil(
        async () => {
          // countdown text visible (e.g. "Resend in 00:30")
          if (await this.otpCountdownIOS.isExisting().catch(() => false)) return true
          // OR resend button exists but is disabled (countdown active)
          const resendBtn = $('~otp_resendButton')
          if (await resendBtn.isExisting().catch(() => false)) {
            const enabled = await resendBtn.getAttribute('enabled').catch(() => 'true')
            return enabled === 'false'
          }
          return false
        },
        { timeout, interval: 300, timeoutMsg: 'OTP countdown was not shown on iOS' },
      )
      return
    }
    await browser.waitUntil(
      async () => {
        if (await this.otpCountdownAndroid.isDisplayed().catch(() => false)) return true
        const resendEl = this.otpResendBtnAndroid
        if (!(await resendEl.isDisplayed().catch(() => false))) return false
        const text = await resendEl.getText().catch(() => '')
        return /\d+/.test(text)
      },
      { timeout, interval: 500, timeoutMsg: 'OTP countdown was not shown on Android' },
    )
  }

  async waitForResendEnabled(timeout = 120000) {
    const resendBtn = browser.isIOS ? this.otpResendBtnIOS : this.otpResendBtnAndroid
    await browser.waitUntil(
      async () => {
        if (!(await resendBtn.isExisting().catch(() => false))) return false
        const enabled = await resendBtn.getAttribute('enabled').catch(() => 'true')
        const text = await resendBtn.getText().catch(() => '')
        return enabled !== 'false' && !/\d+/.test(text)
      },
      { timeout, interval: 1000, timeoutMsg: 'Resend OTP button did not become active within timeout' },
    )
  }

  // ── App restart helpers ──────────────────────────────────────────────────

  async restartToLoginScreen() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    if (browser.isAndroid) {
      await driver.terminateApp(this.androidAppPackage).catch(() => {})
      await browser.pause(1000)
      await driver.activateApp(this.androidAppPackage).catch(async () => {
        await driver.startActivity(this.androidAppPackage, this.androidAppActivity)
      })
      await browser.pause(2000)
      await browser.switchContext('NATIVE_APP').catch(() => {})

      if (await loginPage.welcomeSkipBtn.isDisplayed().catch(() => false)) {
        await loginPage.welcomeSkipBtn.click()
      }

      await loginPage.registerScreen.waitForExist({ timeout: 30000 })
      return
    }

    await browser.activateApp(this.iosBundleId).catch(() => {})
    await browser.pause(2000)
    if (await loginPage.welcomeSkipBtn.isDisplayed().catch(() => false)) {
      await loginPage.welcomeSkipBtn.click()
    }
    await loginPage.registerScreen.waitForExist({ timeout: 30000 })
  }

  // ── Navigate to phone + passcode screen ─────────────────────────────────

  async navigateToPasscodeScreen(phone: string) {
    await loginPage.selectCountry('Malta')
    await loginPage.enterMobile(phone)
    await loginPage.continue()
    await this.waitForPasscodeScreen()
  }

  // ── Enter PIN without waiting for outcome ──────────────────────────────

  async enterPin(pin: string) {
    for (const d of pin) {
      await this.tapKeypadDigit(d)
      await browser.pause(150)
    }
  }

  async enterOtpNoise() {
    if (browser.isIOS) {
      for (const d of ['1', '2', '3']) {
        const key = $(`-ios class chain:**/XCUIElementTypeKey[\`name == "${d}"\`]`)
        if (await key.isExisting().catch(() => false)) {
          await key.click()
          await browser.pause(150)
        }
      }
      return
    }
    const field = $('android=new UiSelector().resourceId("com.moneybase.qa:id/otp_input")')
    if (await field.isExisting().catch(() => false)) {
      await field.setValue('123')
    }
  }

  // ── OTP unlock after lockout ─────────────────────────────────────────────

  async unlockViaOtp(otpPhone: string) {
    let otpReady = browser.isIOS
      ? await loginPage.otpContainerIOS.waitForExist({ timeout: 5000 }).catch(() => false)
      : await loginPage.otpContainerAndroid.waitForExist({ timeout: 5000 }).catch(() => false)

    if (!otpReady && browser.isIOS && await this.forgotPasscodeIOS.isExisting().catch(() => false)) {
      await this.tapForgotPasscode()
      otpReady = await loginPage.otpContainerIOS.waitForExist({ timeout: 15000 }).catch(() => false)
    }

    if (!otpReady) {
      throw new Error('OTP screen did not appear for lockout unlock')
    }

    const otp = await OtpHelper.getLatestOtp({
      phone: otpPhone,
      timeoutMs: Number(process.env.OTP_TIMEOUT_MS || 90000),
      intervalMs: Number(process.env.OTP_POLL_INTERVAL_MS || 2000),
      maxRequests: Number(process.env.OTP_MAX_REQUESTS || 2),
    })
    await loginPage.enterOtp(otp)
    await loginPage.tapContinueAfterOtp()
  }

  // ── More → Settings → Change Passcode ───────────────────────────────────

  private get moreTabAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/navigation_button_more$|^navigation_button_more$")')
  }

  private get moreTabIOS() {
    return $('~More')
  }

  private get settingsItemAndroid() {
    return $('android=new UiSelector().textMatches("(?i)settings")')
  }

  private get settingsItemIOS() {
    return $('~Settings')
  }

  private get changePasscodeItemAndroid() {
    return $('android=new UiSelector().textMatches("(?i)change pass(code|word)")')
  }

  private get changePasscodeItemIOS() {
    return $('-ios predicate string:label MATCHES "(?i)change pass(code|word)" OR name MATCHES "(?i)change pass(code|word)"')
  }

  async navigateToChangePasscodeViaSettings() {
    const moreTab = browser.isIOS ? this.moreTabIOS : this.moreTabAndroid
    await this.tap(moreTab, 15000)
    await browser.pause(500)

    const settingsItem = browser.isIOS ? this.settingsItemIOS : this.settingsItemAndroid
    await this.tap(settingsItem, 15000)
    await browser.pause(500)

    const changePasscode = browser.isIOS ? this.changePasscodeItemIOS : this.changePasscodeItemAndroid
    await this.tap(changePasscode, 15000)
    await browser.pause(500)
  }

  async enterCurrentAndNewPasscode(currentPin: string, newPin: string) {
    // Enter current passcode
    await this.waitForPasscodeScreen()
    await this.enterPin(currentPin)
    await browser.pause(500)

    // Enter new passcode (twice)
    await this.waitForPasscodeScreen(20000)
    await this.enterPin(newPin)
    await browser.pause(500)

    await this.waitForPasscodeScreen(20000)
    await this.enterPin(newPin)
  }

  async waitForPasscodeChangedSuccess(timeout = 15000) {
    await browser.waitUntil(
      async () => {
        const successText = browser.isIOS
          ? $('-ios predicate string:label CONTAINS "changed" OR label CONTAINS "updated" OR label CONTAINS "success"')
          : $('android=new UiSelector().textMatches("(?i).*changed.*|.*updated.*|.*success.*")')
        return successText.isDisplayed().catch(() => false)
      },
      { timeout, interval: 500, timeoutMsg: 'Passcode change success screen was not shown' },
    )
  }

  // ── Forgot passcode (before login) ──────────────────────────────────────

  private get forgotPasscodeAndroid() {
    return $('android=new UiSelector().textMatches("(?i)forgot.*|reset.*passcode.*")')
  }

  private get forgotPasscodeIOS() {
    return $('~login_button_forgotPasscode')
  }

  async tapForgotPasscode() {
    const el = browser.isIOS ? this.forgotPasscodeIOS : this.forgotPasscodeAndroid
    await el.waitForExist({ timeout: 10000, timeoutMsg: '"Forgot passcode" link not found on passcode screen' })
    await this.tap(el)
  }
}

export const authenticationPage = new AuthenticationPage()
