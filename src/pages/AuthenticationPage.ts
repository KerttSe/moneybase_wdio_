import { $, browser, driver } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'
import BasePage from './BasePage'
import { loginPage } from './LoginPage'
import OtpHelper from '../helpers/otp.helper'
import { dismissTooEasyPasscodeWarning } from '../helpers/passcodeWarning.helper'

type Theme = 'Light' | 'Dark' | 'System'

export default class AuthenticationPage extends BasePage {
  private readonly androidAppPackage = process.env.BS_ANDROID_APP_PACKAGE || 'com.moneybase.qa'
  private readonly androidAppActivity =
    process.env.BS_ANDROID_APP_ACTIVITY || 'com.moneybase.views.activities.LoginActivity'
  private readonly iosBundleId = 'com.moneybase.quality'

  // ── Passcode screen ──────────────────────────────────────────────────────

  private androidId(id: string) {
    return $(`(//*[@resource-id="com.moneybase.qa:id/${id}"] | //*[@resource-id="${id}"] | //*[contains(@resource-id,"${id}")])[1]`)
  }

  private keypadDigitAndroid(d: string) {
    return this.androidId(`keypad_text_${d}`)
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
    await browser.waitUntil(
      async () =>
        (await this.keypadDigitAndroid('1').isExisting().catch(() => false)) ||
        (await this.androidId('login_screen').isExisting().catch(() => false)) ||
        (await this.androidId('composeViewRegistrationConfirmPasscode').isExisting().catch(() => false)) ||
        (await $('//*[contains(@text,"passcode") or contains(@text,"Passcode") or contains(@text,"Welcome back") or contains(@content-desc,"passcode") or contains(@content-desc,"Passcode")]').isExisting().catch(() => false)),
      { timeout, interval: 500, timeoutMsg: 'Android passcode screen did not appear' },
    )
  }

  // ── Passcode error / lock ────────────────────────────────────────────────

  get passcodeErrorAndroid() {
    return this.androidId('tvLoginError')
  }

  get passcodeErrorIOS() {
    return $('-ios predicate string:(type == "XCUIElementTypeStaticText" OR type == "XCUIElementTypeTextView") AND (name CONTAINS[c] "wrong" OR label CONTAINS[c] "wrong" OR name CONTAINS[c] "incorrect" OR label CONTAINS[c] "incorrect" OR name CONTAINS[c] "invalid" OR label CONTAINS[c] "invalid" OR name CONTAINS[c] "remaining" OR label CONTAINS[c] "remaining" OR name CONTAINS[c] "attempt" OR label CONTAINS[c] "attempt" OR name CONTAINS[c] "too many" OR label CONTAINS[c] "too many" OR name CONTAINS[c] "locked" OR label CONTAINS[c] "locked" OR name CONTAINS[c] "temporarily" OR label CONTAINS[c] "temporarily" OR name CONTAINS[c] "try again" OR label CONTAINS[c] "try again")')
  }

  get accountLockedAndroid() {
    return $('//*[contains(@text,"locked") or contains(@text,"Locked") or contains(@text,"too many") or contains(@text,"Too many") or contains(@text,"suspended") or contains(@text,"Suspended") or contains(@content-desc,"locked") or contains(@content-desc,"too many") or contains(@content-desc,"suspended")]')
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

  private get passcodeErrorAndroidCandidates() {
    return [
      this.passcodeErrorAndroid,
      this.androidId('text_wrongPasscode_line1'),
      this.androidId('text_wrongPasscode_line2'),
      this.androidId('tvMobileVerificationError'),
      $('//*[contains(@text,"wrong") or contains(@text,"incorrect") or contains(@text,"invalid") or contains(@text,"remaining") or contains(@text,"attempt") or contains(@text,"too many") or contains(@text,"locked") or contains(@text,"try again") or contains(@text,"contact support") or contains(@content-desc,"wrong") or contains(@content-desc,"incorrect") or contains(@content-desc,"locked")]'),
    ]
  }

  private async androidSourceHasPasscodeError() {
    const source = await browser.getPageSource().catch(() => '')
    return /wrong|incorrect|invalid|remaining|attempt|too many|temporarily locked|locked|try again|contact support/i.test(source)
  }

  private async androidSourceHasAccountLocked() {
    const source = await browser.getPageSource().catch(() => '')
    return /too many attempts|temporarily locked|locked|blocked|suspended|try again later|contact support/i.test(source)
  }

  private async firstExisting(candidates: ChainablePromiseElement[]) {
    for (const candidate of candidates) {
      if (await candidate.isExisting().catch(() => false)) return candidate
    }
    return undefined
  }

  private async hasAndroidAccountLockedMessage() {
    const candidates = [
      this.accountLockedAndroid,
      this.androidId('text_wrongPasscode_line1'),
      this.androidId('text_wrongPasscode_line2'),
      this.androidId('tvMobileVerificationError'),
    ]

    for (const candidate of candidates) {
      if (!(await candidate.isExisting().catch(() => false))) continue
      const text = String(await candidate.getText().catch(() => '')).trim()
      if (/too many|temporarily locked|locked|blocked|suspended|try again later|contact support/i.test(text)) {
        return true
      }
    }

    return this.androidSourceHasAccountLocked()
  }

  async waitForPasscodeError(timeout = 10000) {
    const el = browser.isIOS ? this.passcodeErrorIOS : this.passcodeErrorAndroid
    if (!browser.isIOS) {
      await browser.waitUntil(
        async () =>
          Boolean(await this.firstExisting(this.passcodeErrorAndroidCandidates)) ||
          (await this.androidSourceHasPasscodeError()),
        { timeout, interval: 500, timeoutMsg: 'Expected passcode error message after wrong PIN' },
      )
      return (await this.firstExisting(this.passcodeErrorAndroidCandidates)) || el
    }

    await browser.waitUntil(
      async () =>
        (await el.isExisting().catch(() => false)) ||
        (await this.iosSourceHasPasscodeError()),
      { timeout, interval: 750, timeoutMsg: 'Expected passcode error message after wrong PIN' },
    )
    return el
  }

  async waitForRemainingPasscodeAttempts(timeout = 10000) {
    const candidates = browser.isIOS ? [this.passcodeErrorIOS] : this.passcodeErrorAndroidCandidates
    const remainingAttempts = /\b[1-9]\d*\s+(?:(?:remaining|more)\s+)?(?:attempts?|tries)\s*(?:left|remaining)\b|\b(?:remaining\s+(?:attempts?|tries)|(?:attempts?|tries)\s+(?:left|remaining))\s*:?\s*[1-9]\d*\b|\b[1-9]\d*\s+(?:remaining|more)\s+(?:attempts?|tries)\b/i
    await browser.waitUntil(async () => {
      for (const candidate of candidates) {
        if (!(await candidate.isDisplayed().catch(() => false))) continue
        if (remainingAttempts.test(await candidate.getText())) return true
      }
      return false
    }, { timeout, interval: 500, timeoutMsg: 'Expected a remaining-attempt count after an incorrect passcode' })
  }

  async verifyLockoutCountdownDecreases(timeout = 15000) {
    const countdown = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeStaticText" AND label MATCHES[c] ".*try again in.*[0-9]+:[0-9]{2}.*"')
      : $('//*[contains(translate(@text,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz"),"try again in")]')
    let initialSeconds: number | undefined

    await browser.waitUntil(async () => {
      if (!(await countdown.isDisplayed())) return false
      const time = (await countdown.getText()).match(/\b(\d+):([0-5]\d)\b/)
      if (!time) return false
      const seconds = Number(time[1]) * 60 + Number(time[2])
      initialSeconds ??= seconds
      return seconds < initialSeconds
    }, { timeout, interval: 500, timeoutMsg: 'Expected the passcode lockout countdown to decrease' })
  }

  async waitForAccountLocked(timeout = 15000) {
    const locked = browser.isIOS ? this.accountLockedIOS : this.accountLockedAndroid
    await browser.waitUntil(
      async () =>
        browser.isIOS
          ? ((await locked.isExisting().catch(() => false)) || (await this.iosSourceHasAccountLocked()))
          : (await this.hasAndroidAccountLockedMessage()),
      { timeout, interval: 500, timeoutMsg: 'Expected account locked message after repeated wrong passcodes' },
    )
  }

  // ── OTP screen ──────────────────────────────────────────────────────────

  get otpCountdownAndroid() {
    return $('(//*[contains(@resource-id,"tvOtpCountdown")] | //*[contains(@resource-id,"tvResendTimer")] | //*[contains(@resource-id,"otp_countdown")] | //*[contains(@resource-id,"otpCountdown")])[1]')
  }

  get otpCountdownIOS() {
    return $('-ios predicate string:type == "XCUIElementTypeStaticText" AND (label BEGINSWITH[c] "You can resend your code" OR label BEGINSWITH[c] "Resend in" OR label CONTAINS[c] "seconds")')
  }

  get otpResendBtnAndroid() {
    return this.androidId('otp_resendButton')
  }

  get otpResendBtnIOS() {
    return $('-ios predicate string:name == "otp_resendButton" OR (type == "XCUIElementTypeButton" AND label IN {"Resend", "Resend code", "Resend Code"})')
  }

  private get otpResendBtnAndroidCandidates() {
    return [
      this.otpResendBtnAndroid,
      $('//*[contains(@text,"Resend") or contains(@text,"resend") or contains(@content-desc,"Resend") or contains(@content-desc,"resend")]'),
    ]
  }

  async waitForOtpCountdownShown(timeout = 45000) {
    if (browser.isIOS) {
      await browser.waitUntil(
        async () => {
          // countdown text visible (e.g. "Resend in 00:30")
          if (await this.otpCountdownIOS.isExisting().catch(() => false)) return true
          // OR resend button exists but is disabled (countdown active)
          const resendBtn = this.otpResendBtnIOS
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
        const resendEl = await this.firstExisting(this.otpResendBtnAndroidCandidates)
        if (!resendEl) return false
        if (!(await resendEl.isDisplayed().catch(() => false))) return false
        const text = await resendEl.getText().catch(() => '')
        return /\d+/.test(text)
      },
      { timeout, interval: 500, timeoutMsg: 'OTP countdown was not shown on Android' },
    )
  }

  async waitForResendEnabled(timeout = 120000) {
    await browser.waitUntil(
      async () => {
        const resendBtn = browser.isIOS ? this.otpResendBtnIOS : await this.firstExisting(this.otpResendBtnAndroidCandidates)
        if (!resendBtn) return false
        if (!(await resendBtn.isExisting().catch(() => false))) return false
        const enabled = await resendBtn.getAttribute('enabled').catch(() => 'true')
        const text = await resendBtn.getText().catch(() => '')
        return enabled !== 'false' && !/\d+/.test(text)
      },
      { timeout, interval: 1000, timeoutMsg: 'Resend OTP button did not become active within timeout' },
    )
  }

  // ── App restart helpers ──────────────────────────────────────────────────

  private async waitForLoginEntryScreen(timeout = 30000) {
    await browser.waitUntil(
      async () => {
        await browser.switchContext('NATIVE_APP').catch(() => {})
        return (
          (await loginPage.registerScreen.isExisting().catch(() => false)) ||
          (await $('~loginNewMobile_screen').isExisting().catch(() => false)) ||
          (await loginPage.countryCodeBtn.isExisting().catch(() => false)) ||
          (await loginPage.mobileInput.isExisting().catch(() => false)) ||
          (await $('//*[contains(@resource-id,"loginNewMobile_screen") or contains(@resource-id,"register_button_countryCode") or contains(@resource-id,"register_input_mobileNumber")]').isExisting().catch(() => false))
        )
      },
      {
        timeout,
        interval: 500,
        timeoutMsg: 'Login entry screen did not appear after app restart',
      },
    )
  }

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

      await loginPage.prepare()
      await this.waitForLoginEntryScreen()
      return
    }

    await browser.activateApp(this.iosBundleId).catch(() => {})
    await browser.pause(2000)
    await loginPage.prepare()
    await this.waitForLoginEntryScreen()
  }

  // ── Navigate to phone + passcode screen ─────────────────────────────────

  async verifyRegisteredNumberLoginScreen() {
    const root = browser.isIOS ? loginPage.authLoginNavBar : this.androidId('login_screen')
    await root.waitForDisplayed({ timeout: 30000 })
    const digit = browser.isIOS ? this.keypadDigitIOS('1') : this.keypadDigitAndroid('1')
    await digit.waitForDisplayed({ timeout: 10000 })
  }

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

  async verifyPartialPasscodeKeepsKeypadInteractive(pin: string) {
    if (!/^\d{4}$/.test(pin)) throw new Error('The partial passcode fixture requires four digits')
    await this.waitForPasscodeScreen()
    await this.enterPin(pin.slice(0, 3))
    const keypad = browser.isIOS ? this.keypadDigitIOS(pin[3]) : this.keypadDigitAndroid(pin[3])
    const otp = browser.isIOS ? loginPage.otpContainerIOS : loginPage.otpContainerAndroid
    await keypad.waitForDisplayed({ timeout: 10000 })
    await keypad.waitForEnabled({ timeout: 10000 })
    if (await otp.isDisplayed()) {
      throw new Error('Entering three digits advanced to OTP verification')
    }
  }

  async waitForOtpLockoutIOS() {
    const lockout = $('-ios predicate string:type == "XCUIElementTypeStaticText" AND (label CONTAINS[c] "too many tries" OR label CONTAINS[c] "too many attempts" OR name == "TooManyTries")')
    await lockout.waitForDisplayed({ timeout: 10000, timeoutMsg: 'Expected OTP lockout after the third incorrect code' })
  }

  async verifyIncorrectOtpFeedbackIOS() {
    await browser.waitUntil(async () => {
      const feedback = await loginPage.otpIncorrectCodeIOS.getText().catch(() => '')
      return /\b[1-9]\d*\s+(?:(?:more|remaining)\s+)?(?:attempts?|tries)\s*(?:left|remaining)\b|\b[1-9]\d*\s+(?:more|remaining)\s+(?:attempts?|tries)\b/i.test(feedback)
    }, { timeout: 10000, timeoutMsg: 'Expected the incorrect OTP message to show remaining attempts' })

    await browser.waitUntil(async () => {
      const focused = await loginPage.otpLastSlotIOS.getAttribute('focused').catch(() => '')
      return focused === 'true' || focused === '1'
    }, { timeout: 5000, timeoutMsg: 'Expected focus to return to the final OTP digit' })
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
    const field = this.androidId('otp_input')
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

  private get moreTabIOS() {
    return $('~More')
  }

  private get settingsItemAndroid() {
    return $('//*[@text="Settings" or @content-desc="Settings"]')
  }

  private get settingsItemIOS() {
    return $('~Settings')
  }

  private get changePasscodeItemAndroid() {
    return $('(//*[@text="Change Passcode" or @content-desc="Change Passcode"] | //*[@text="Change Password" or @content-desc="Change Password"] | //*[contains(@text,"Change Pass") or contains(@content-desc,"Change Pass")])[1]')
  }

  private get changePasscodeItemIOS() {
    return $('-ios predicate string:label MATCHES "(?i)change pass(code|word)" OR name MATCHES "(?i)change pass(code|word)"')
  }

  async openSettings() {
    if (browser.isIOS) {
      await this.tap(this.moreTabIOS, 15000)
    } else {
      await this.openAndroidMoreMenuFromProfile()
    }
    await browser.pause(500)

    const settingsItem = browser.isIOS ? this.settingsItemIOS : this.settingsItemAndroid
    await this.tap(settingsItem, 15000)
    await browser.pause(500)
  }

  async verifyBusinessSettingsRestrictions() {
    await this.openSettings()
    const title = browser.isIOS
      ? $('//XCUIElementTypeNavigationBar[@name="Settings"]')
      : $('//*[@text="Settings" or contains(@resource-id,"settings_screen")]')
    await title.waitForDisplayed({ timeout: 15000 })

    const privacy = browser.isIOS ? $('~Privacy Settings') : $('//*[@text="Privacy Settings" or @content-desc="Privacy Settings"]')
    const close = browser.isIOS ? $('~Close Account') : $('//*[@text="Close Account" or @content-desc="Close Account"]')
    await close.waitForExist({ timeout: 10000 })
    if (await privacy.isExisting()) throw new Error('TC2963: Privacy Settings should be hidden for a business account')

    await this.tap(close, 10000)
    const restriction = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeStaticText" AND label CONTAINS[c] "business account" AND (label CONTAINS[c] "cannot" OR label CONTAINS[c] "not available" OR label CONTAINS[c] "not supported")')
      : $('//*[contains(@text,"business account") and (contains(@text,"cannot") or contains(@text,"not available") or contains(@text,"not supported"))]')
    await restriction.waitForDisplayed({ timeout: 10000, timeoutMsg: 'TC2965: Business accounts should show the account-closure restriction' })
  }

  private themeRow(theme: Theme) {
    if (browser.isIOS) {
      return $(`//XCUIElementTypeCell[@label="${theme}" or .//XCUIElementTypeStaticText[@label="${theme}"]] | //XCUIElementTypeButton[@label="${theme}"]`)
    }
    return $(`(//*[@text="${theme}" or @content-desc="${theme}"]/ancestor-or-self::*[@clickable="true"][1])[1]`)
  }

  private async isThemeSelected(theme: Theme) {
    return this.isSettingsOptionSelected(this.themeRow(theme))
  }

  private async isSettingsOptionSelected(row: ChainablePromiseElement) {
    if (!await row.isDisplayed()) return false
    if (await row.isSelected()) return true
    const mark = browser.isIOS
      ? row.$('.//XCUIElementTypeImage[contains(@name,"checkmark") or contains(@label,"selected")]')
      : row.$('.//*[@checked="true" or @selected="true"]')
    return await mark.isExisting()
      || (browser.isAndroid && (await row.getAttribute('checked')) === 'true')
  }

  private async openThemeFromSettings() {
    const entry = browser.isIOS ? $('~Theme') : $('//*[@text="Theme" or @content-desc="Theme"]')
    await this.tap(entry, 10000)
    await this.themeRow('Light').waitForDisplayed({ timeout: 10000 })
    await this.themeRow('Dark').waitForDisplayed({ timeout: 10000 })
  }

  private async selectTheme(theme: Theme) {
    await this.tap(this.themeRow(theme), 10000)
    await browser.waitUntil(() => this.isThemeSelected(theme), {
      timeout: 10000,
      timeoutMsg: `Expected ${theme} to be selected`,
    })
  }

  private async backFromTheme() {
    if (browser.isIOS) {
      const back = $('//XCUIElementTypeNavigationBar//XCUIElementTypeButton[@name="BackButton" or @label="Settings"]')
      await this.tap(back, 10000)
    } else {
      await browser.back()
    }
  }

  async verifyThemePreferences() {
    await this.openSettings()
    await this.openThemeFromSettings()
    let original: Theme | undefined
    for (const theme of ['Light', 'Dark', 'System'] as const) {
      if (await this.isThemeSelected(theme)) {
        original = theme
        break
      }
    }
    if (!original) throw new Error('Theme screen must expose the current selection before editing')

    try {
      await this.selectTheme('Light')
      await this.selectTheme('Light')
      await this.selectTheme('Dark')
      await this.backFromTheme()
      await this.openThemeFromSettings()
      if (!await this.isThemeSelected('Dark')) throw new Error('TC2989: Dark should remain selected when reopening Theme')
    } finally {
      if (!await this.themeRow('Light').isDisplayed()) await this.openThemeFromSettings()
      await this.selectTheme(original)
    }
  }

  private privacyOption(label: 'My Contacts' | 'Switch Off') {
    return browser.isIOS
      ? $(`//XCUIElementTypeCell[@label="${label}" or .//XCUIElementTypeStaticText[@label="${label}"]] | //XCUIElementTypeButton[@label="${label}"]`)
      : $(`(//*[@text="${label}" or @content-desc="${label}"]/ancestor-or-self::*[@clickable="true"][1])[1]`)
  }

  private async openPrivacySettings() {
    const entry = browser.isIOS ? $('~Privacy Settings') : $('//*[@text="Privacy Settings" or @content-desc="Privacy Settings"]')
    await this.tap(entry, 10000)
    await this.privacyOption('My Contacts').waitForDisplayed({ timeout: 10000 })
  }

  async verifyPrivacyPreferencesAfterTheme() {
    await this.backFromTheme()
    await this.openPrivacySettings()
    const contacts = this.privacyOption('My Contacts')
    if (!await this.isSettingsOptionSelected(contacts)) {
      throw new Error('TC2979 requires the retail fixture to have My Contacts saved')
    }

    const off = this.privacyOption('Switch Off')
    try {
      await this.tap(off, 10000)
      await browser.waitUntil(() => this.isSettingsOptionSelected(off), {
        timeout: 10000,
        timeoutMsg: 'TC2980: Switch Off should be selected immediately',
      })
      await this.backFromTheme()
      await this.openPrivacySettings()
      if (!await this.isSettingsOptionSelected(off)) {
        throw new Error('TC2980: Switch Off should remain selected when Privacy Settings is reopened')
      }
    } finally {
      if (!await contacts.isDisplayed()) await this.openPrivacySettings()
      await this.tap(contacts, 10000)
      await browser.waitUntil(() => this.isSettingsOptionSelected(contacts), {
        timeout: 10000,
        timeoutMsg: 'Expected the original My Contacts selection after restoring privacy settings',
      })
      await this.backFromTheme()
      await this.openPrivacySettings()
      if (!await this.isSettingsOptionSelected(contacts)) throw new Error('Privacy fixture was not restored after reopening Settings')
    }
  }

  async navigateToChangePasscodeViaSettings() {
    await this.openSettings()
    await this.openChangePasscodeFromSettings()
  }

  private async openChangePasscodeFromSettings() {
    const changePasscode = browser.isIOS ? this.changePasscodeItemIOS : this.changePasscodeItemAndroid
    await this.tap(changePasscode, 15000)
    await browser.pause(500)
  }

  async cancelChangePasscode() {
    await this.waitForPasscodeScreen()
    if (browser.isIOS) {
      const back = $('//XCUIElementTypeNavigationBar//XCUIElementTypeButton[@name="BackButton" or @label="Settings"]')
      await this.tap(back, 10000)
    } else {
      await browser.back()
    }
    const item = browser.isIOS ? this.changePasscodeItemIOS : this.changePasscodeItemAndroid
    await item.waitForDisplayed({ timeout: 15000 })
  }

  async verifyTooEasyNewPasscodeRejected(currentPin: string) {
    await this.openChangePasscodeFromSettings()
    await this.waitForPasscodeScreen()
    await this.enterPin(currentPin)
    const newPasscode = browser.isIOS
      ? $('-ios predicate string:label IN {"New Passcode", "Enter New Passcode", "Enter your new passcode"} OR name == "New Passcode"')
      : $('//*[@text="New Passcode" or @text="Enter New Passcode" or @text="Enter your new passcode" or @content-desc="New Passcode"]')
    await newPasscode.waitForDisplayed({ timeout: 15000 })
    await this.enterPin('0000')
    await dismissTooEasyPasscodeWarning()
    await newPasscode.waitForDisplayed({ timeout: 10000 })
  }

  async resendOtpAndVerifyCooldown() {
    await this.waitForOtpCountdownShown(10000)
    await this.waitForResendEnabled()
    const resend = browser.isIOS ? this.otpResendBtnIOS : await this.firstExisting(this.otpResendBtnAndroidCandidates)
    if (!resend) throw new Error('Resend OTP button was not found after cooldown')
    await this.tap(resend, 10000)
    await this.waitForOtpCountdownShown(10000)
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
          : $('//*[contains(@text,"changed") or contains(@text,"Changed") or contains(@text,"updated") or contains(@text,"Updated") or contains(@text,"success") or contains(@text,"Success") or contains(@content-desc,"changed") or contains(@content-desc,"success")]')
        return successText.isDisplayed().catch(() => false)
      },
      { timeout, interval: 500, timeoutMsg: 'Passcode change success screen was not shown' },
    )
  }

  // ── Forgot passcode (before login) ──────────────────────────────────────

  private get forgotPasscodeAndroid() {
    return $('(//*[contains(@text,"Forgot") or contains(@text,"forgot") or contains(@text,"Reset") or contains(@content-desc,"Forgot") or contains(@content-desc,"forgot")])[1]')
  }

  private get forgotPasscodeIOS() {
    return $('~login_button_forgotPasscode')
  }

  async tapForgotPasscode() {
    const el = browser.isIOS ? this.forgotPasscodeIOS : this.forgotPasscodeAndroid
    await el.waitForExist({ timeout: 10000, timeoutMsg: '"Forgot passcode" link not found on passcode screen' })
    await this.tap(el)
  }

  async verifyForgotPasscodeOpensSecurityQuestions(phone: string) {
    await this.restartToLoginScreen()
    await this.navigateToPasscodeScreen(phone)
    await this.tapForgotPasscode()

    const resetTitle = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeNavigationBar" AND label IN {"Reset Passcode", "Forgot Passcode"}')
      : $('//*[@text="Reset Passcode" or @text="Forgot Passcode" or contains(@resource-id,"resetPasscodeMobileNumber_screen")]')
    await resetTitle.waitForDisplayed({ timeout: 15000 })
    const resetMobile = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeTextField" AND (name CONTAINS[c] "mobile" OR label CONTAINS[c] "mobile")')
      : $('(//android.widget.EditText[contains(@resource-id,"mobile") or contains(@resource-id,"phone")] | //*[contains(@resource-id,"mobileNumber")]//android.widget.EditText)[1]')
    await resetMobile.waitForDisplayed({ timeout: 10000 })
    await resetMobile.setValue(phone)
    const next = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeButton" AND label IN {"Continue", "Next"}')
      : $('//*[@text="Continue" or @text="Next" or @content-desc="Continue"]')
    await this.tap(next, 10000)
    const question = browser.isIOS
      ? $('-ios predicate string:name CONTAINS[c] "securityQuestion" AND (type == "XCUIElementTypeTextField" OR type == "XCUIElementTypeStaticText")')
      : $('//*[contains(@resource-id,"securityQuestion") and (self::android.widget.EditText or self::android.widget.TextView)]')
    await question.waitForDisplayed({ timeout: 20000, timeoutMsg: 'TC3158: expected the registered account security question' })
  }
}

export const authenticationPage = new AuthenticationPage()
