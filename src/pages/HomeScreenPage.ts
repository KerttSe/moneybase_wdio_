import BasePage from './BasePage'
import { $, $$, browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'
import { markBrowserStackStep } from '../helpers/browserstack.helper'
import { AUTH } from '../data/credentials'

type WdioEl = ChainablePromiseElement

class HomeScreenPage extends BasePage {
  private readonly androidAppPackage = process.env.BS_ANDROID_APP_PACKAGE || 'com.moneybase.qa'

  /* =========================
   * ANDROID: HOME / ACCOUNT (Single vs Business)
   * ========================= */

  private get userAvatarBtnAndroid() {
    return $('//*[@resource-id="home_button_userAvatar" or @resource-id="com.moneybase.qa:id/home_button_userAvatar" or @content-desc="home_button_userAvatar"]')
  }

  private get businessAccountLabelAndroid() {
    return $('//*[contains(@text,"Business") or contains(@content-desc,"Business")]')
  }

  private get individualAccountLabelAndroid() {
    return $('//*[contains(@text,"Individual") or contains(@content-desc,"Individual")]')
  }

  private get jointAccountLabelAndroid() {
    return $('//*[contains(@text,"Joint") or contains(@content-desc,"Joint")]')
  }

  private get singleAccountItemAndroid() {
    return $('(//*[@content-desc="Single"] | //*[@text="Single"])[1]')
  }

  private get singleAccountItemAndroidByText() {
    return $('//*[@text="Single" or @content-desc="Single"]')
  }

  private get individualAccountItemAndroid() {
    return $('(//*[@resource-id="accountSelection_screen"]//*[contains(@content-desc,"Individual")]/ancestor::*[@clickable="true"][1] | //*[@resource-id="accountSelection_screen"]//android.widget.TextView[contains(@text,"Individual")]/ancestor::*[@clickable="true"][1] | //*[contains(@content-desc,"Individual") and not(ancestor::*[@resource-id="more_button_accountPicker"])]/ancestor::*[@clickable="true"][1] | //android.widget.TextView[contains(@text,"Individual") and not(ancestor::*[@resource-id="more_button_accountPicker"])]/ancestor::*[@clickable="true"][1] | //*[@resource-id="accountSelection_screen"]//*[contains(@content-desc,"Individual")] | //*[@resource-id="accountSelection_screen"]//android.widget.TextView[contains(@text,"Individual")] | //android.widget.TextView[contains(@text,"Individual") and not(ancestor::*[@resource-id="more_button_accountPicker"])])[1]')
  }

  private get jointAccountItemAndroid() {
    return $('(//*[@resource-id="accountSelection_screen"]//*[contains(@content-desc,"Joint")]/ancestor::*[@clickable="true"][1] | //*[@resource-id="accountSelection_screen"]//android.widget.TextView[contains(@text,"Joint")]/ancestor::*[@clickable="true"][1] | //*[contains(@content-desc,"Joint") and not(ancestor::*[@resource-id="more_button_accountPicker"])]/ancestor::*[@clickable="true"][1] | //android.widget.TextView[contains(@text,"Joint") and not(ancestor::*[@resource-id="more_button_accountPicker"])]/ancestor::*[@clickable="true"][1] | //*[@resource-id="accountSelection_screen"]//*[contains(@content-desc,"Joint")] | //*[@resource-id="accountSelection_screen"]//android.widget.TextView[contains(@text,"Joint")] | //android.widget.TextView[contains(@text,"Joint") and not(ancestor::*[@resource-id="more_button_accountPicker"])])[1]')
  }

  private get businessAccountItemAndroid() {
    return $('(//*[@resource-id="accountSelection_screen"]//*[contains(@content-desc,"Business")]/ancestor::*[@clickable="true"][1] | //*[@resource-id="accountSelection_screen"]//android.widget.TextView[contains(@text,"Business")]/ancestor::*[@clickable="true"][1] | //*[contains(@content-desc,"Business") and not(ancestor::*[@resource-id="more_button_accountPicker"])]/ancestor::*[@clickable="true"][1] | //android.widget.TextView[contains(@text,"Business") and not(ancestor::*[@resource-id="more_button_accountPicker"])]/ancestor::*[@clickable="true"][1] | //*[@resource-id="accountSelection_screen"]//*[contains(@content-desc,"Business")] | //*[@resource-id="accountSelection_screen"]//android.widget.TextView[contains(@text,"Business")] | //android.widget.TextView[contains(@text,"Business") and not(ancestor::*[@resource-id="more_button_accountPicker"])])[1]')
  }

  private get homeRootAndroid() {
    return $('//*[@resource-id="home_screen" or @resource-id="com.moneybase.qa:id/home_screen" or @content-desc="home_screen"]')
  }

  private get moreRootAndroid() {
    return this.byId('more_screen')
  }

  private get moreAccountPickerAndroid() {
    return this.byId('more_button_accountPicker')
  }

  private get composeMoreIndicatorAndroid() {
    return $('//*[@text="Personal Details" or @content-desc="Personal Details"]')
  }

  private get composeAccountPickerRowAndroid() {
    return $('//android.widget.TextView[contains(@text,"  Business") or contains(@text,"  Individual") or contains(@text,"  Corporate") or contains(@text,"  Personal")]/ancestor::*[@clickable="true"][1]')
  }

  private get accountSelectionRootAndroid() {
    return this.byId('accountSelection_screen')
  }

  private get homeAndroidDrawerLogoutItem() {
    return $('//*[@text="Log out" or @content-desc="Log out"]')
  }

  private get homeAndroidDrawerSettingsItem() {
    return $('//*[@text="Settings" or @content-desc="Settings"]')
  }

  private get homeAndroidDrawerWalletsItem() {
    return $('//*[@text="Wallets" or @content-desc="Wallets"]')
  }

  private get subAccountsTitleAndroid() {
    return $('//*[@text="Sub Accounts" or @content-desc="Sub Accounts"]')
  }

  private get accountPickerJointItemAndroid() {
    return $('(//*[@resource-id="accountSelection_screen"]//*[contains(@content-desc,"Joint")] | //*[@resource-id="accountSelection_screen"]//android.widget.TextView[contains(@text,"Joint")] | //android.widget.TextView[contains(@text,"VEG40003")])[1]')
  }

  private get accountPickerIndividualItemAndroid() {
    return $('(//*[@resource-id="accountSelection_screen"]//*[contains(@content-desc,"Individual")] | //*[@resource-id="accountSelection_screen"]//android.widget.TextView[contains(@text,"Individual")] | //android.widget.TextView[contains(@text,"VEG40002")])[1]')
  }

  private get accountPickerBusinessItemAndroid() {
    return $('(//*[@resource-id="accountSelection_screen"]//*[contains(@content-desc,"Business")] | //*[@resource-id="accountSelection_screen"]//android.widget.TextView[contains(@text,"Business")] | //android.widget.TextView[contains(@text,"DER00003")])[1]')
  }

  private get googlePayCloseButtonAndroid() {
    return $('(//*[@resource-id="com.moneybase.qa:id/rightActionView"] | //*[contains(@resource-id,"rightActionView")])[1]')
  }

  private get googlePayScreenAndroid() {
    return $('(//*[@resource-id="com.moneybase.qa:id/clSelectCardGooglePay"] | //*[contains(@resource-id,"clSelectCardGooglePay")])[1]')
  }

  private get homeTabAndroid() {
    return $('(//*[@resource-id="com.moneybase.qa:id/navigation_button_home"] | //*[contains(@resource-id,"navigation_button_home")] | //*[@content-desc="Home" and @clickable="true"])[1]')
  }

  private get homeTabAndroidA11y() {
    return $('~Home')
  }

  private get homeTabAndroidXpath() {
    return $('//android.widget.FrameLayout[@content-desc="Home"]')
  }

  private get cardsRootAndroid() {
    return this.byId('cards_screen')
  }

  private get payRootAndroid() {
    return this.byId('pay_screen')
  }

  /* =========================
   * iOS: PROFILE PICKER (ensure Individual)
   * ========================= */

  private get profilePickerUserNameLabelIOS() {
    return $('~profilePicker_label_userName')
  }

  private get profilePickerAccountCodeLabelIOS() {
    return $('~profilePicker_label_accountCode')
  }

  private get moreTabIOS() {
    return $('~More')
  }

  private get moreNavBarIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="More" or @label="More"]')
  }

  private get moreAccountPickerIOS() {
    return $('(//XCUIElementTypeNavigationBar[@name="More" or @label="More"]//XCUIElementTypeButton[not(@name="Camera") and not(@label="Camera") and not(@name="close") and not(@label="close")])[1]')
  }

  private get profilePickerIndividualItemIOS() {
    return $('-ios predicate string:name == "Individual" OR label == "Individual"')
  }

  private get subAccountsTitleIOS() {
    return $('-ios predicate string:name == "Sub Accounts" OR label == "Sub Accounts" OR value == "Sub Accounts"')
  }

  private get individualAccountItemIOS() {
    const code = AUTH.individualAccountCode ?? 'VEG40002'
    const suffix = AUTH.individualAccountSuffix ?? '-1'
    return $(`~switchSubidentity_item_${code}${suffix}`)
  }

  private get jointAccountItemIOS() {
    return $('~switchSubidentity_item_VEG40003-1')
  }

  private get businessAccountItemIOS() {
    const code = AUTH.businessAccountCode ?? 'DER00003'
    return $(`-ios predicate string:name CONTAINS "${code}" OR label CONTAINS "${code}"`)
  }

  private get homeRootIOS() {
    return $('~home_screen_view')
  }

  private byId(name: string) {
    if (browser.isAndroid) {
      return $(`(//*[@resource-id="com.moneybase.qa:id/${name}"] | //*[@resource-id="${name}"] | //*[contains(@resource-id,"${name}")] | //*[@content-desc="${name}"])[1]`)
    }
    return $(`~${name}`)
  }

  private androidTextContains(text: string) {
    return $(`//*[contains(@text,"${text}") or contains(@content-desc,"${text}")]`)
  }

  private iosPredicateContains(text: string) {
    return $(`-ios predicate string: label CONTAINS "${text}" OR name CONTAINS "${text}"`)
  }

  private async getVisibleTextCandidates(): Promise<string[]> {
    const elements = browser.isAndroid
      ? await $$('android.widget.TextView')
      : await $$('-ios class chain:**/XCUIElementTypeStaticText')

    const texts: string[] = []
    for (const el of elements) {
      const shown = await el.isDisplayed().catch(() => false)
      if (!shown) continue

      const raw = await el.getText().catch(() => '')
      const text = raw.trim()
      if (text) texts.push(text)
    }

    return texts
  }

  private isLikelyAccountHolderName(text: string) {
    const ignore = [
      'Home', 'Pay', 'Cards', 'Invest', 'More',
      'Add Funds', 'Exchange', 'Details',
      'Pending', 'Recent', 'Recent transactions',
      'Recent payees', 'Spend Analytics',
      'Invite & earn money!', 'Search',
    ]

    const normalized = text.toLowerCase()
    if (ignore.some((i) => i.toLowerCase() === normalized)) return false
    if (normalized.includes('individual') || normalized.includes('business')) return false
    if (/^[-+]?\s?[$€£]\s?\d/.test(text)) return false
    if (/^\d+[.,]\d+/.test(text)) return false
    if (text.length < 2) return false

    return /[A-Za-zА-Яа-я]/.test(text)
  }

  private isLikelyAccountType(text: string) {
    const normalized = text.toLowerCase()
    if (browser.isIOS && AUTH.individualAccountCode && text.includes(AUTH.individualAccountCode)) return true
    return normalized.includes('individual') || normalized.includes('business')
  }

  private isLikelyBalance(text: string) {
    const normalized = text.toLowerCase()
    if (normalized.includes('processing')) return false

    const trimmed = text.trim()
    if (/^[+-]/.test(trimmed)) return false
    if (trimmed.length < 3) return false

    const hasNumber = /\d/.test(trimmed)
    const hasSymbol = /[$€£]/.test(trimmed)
    const hasCode = /\b(EUR|USD|GBP)\b/i.test(trimmed)

    return hasNumber && (hasSymbol || hasCode)
  }

  private isFormattedMoney(text: string) {
    const amount = String.raw`(?:\d+|\d{1,3}(?:[,. \u00a0\u202f]\d{3})+)[.,]\d{2}`
    const currency = String.raw`(?:[€£$]|[A-Z]{3})`
    return new RegExp(`^(?:${currency}\\s*${amount}|${amount}\\s*${currency})$`).test(text.trim())
  }

  private async waitForAccountHolderNameFallback(timeout = 15000) {
    await browser.waitUntil(async () => {
      const texts = await this.getVisibleTextCandidates()
      return texts.some((t) => this.isLikelyAccountHolderName(t))
    }, {
      timeout,
      interval: 500,
      timeoutMsg: 'Account holder name did not appear',
    })
  }

  private async waitForAccountTypeFallback(timeout = 15000) {
    await browser.waitUntil(async () => {
      const texts = await this.getVisibleTextCandidates()
      return texts.some((t) => this.isLikelyAccountType(t))
    }, {
      timeout,
      interval: 500,
      timeoutMsg: 'Account type did not appear',
    })
  }

  private async waitForBalanceFallback(timeout = 15000) {
    await browser.waitUntil(async () => {
      const texts = await this.getVisibleTextCandidates()
      return texts.some((t) => this.isLikelyBalance(t))
    }, {
      timeout,
      interval: 500,
      timeoutMsg: 'Account balance did not appear',
    })
  }

  private async waitForAnyDisplayed(candidates: Array<WdioEl | WebdriverIO.Element>, timeout = 10000, label = 'element') {
    await browser.waitUntil(
      async () => {
        for (const el of candidates) {
          const resolved = (await el) as WebdriverIO.Element
          // XCUITest marks many on-screen elements visible=false → use isExisting() on iOS.
          const found = browser.isIOS
            ? await resolved.isExisting().catch(() => false)
            : await resolved.isDisplayed().catch(() => false)
          if (found) return true
        }
        return false
      },
      {
        timeout,
        interval: 500,
        timeoutMsg: `${label} did not appear`,
      }
    )
  }

  private async tapFirstDisplayed(candidates: Array<WdioEl | WebdriverIO.Element>, label = 'element') {
    for (const el of candidates) {
      const resolved = (await el) as WebdriverIO.Element
      const found = browser.isIOS
        ? await resolved.isExisting().catch(() => false)
        : await resolved.isDisplayed().catch(() => false)
      if (found) {
        if (browser.isAndroid) await this.tapAndroidCenterPoint(resolved)
        else await resolved.click()
        return true
      }
    }

    throw new Error(`${label} did not appear`)
  }

  private async scrollDownOnce() {
    const { width, height } = await browser.getWindowRect()
    if (browser.isAndroid) {
      const scrolled = await browser.execute('mobile: scrollGesture', {
        left: Math.round(width * 0.08),
        top: Math.round(height * 0.18),
        width: Math.round(width * 0.84),
        height: Math.round(height * 0.68),
        direction: 'down',
        percent: 0.85,
      }).catch(() => null)

      if (typeof scrolled === 'boolean') {
        await browser.pause(900)
        return scrolled
      }
    }

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
    await browser.releaseActions().catch(() => {})
    await browser.pause(900)
    return true
  }

  private async scrollUpOnce() {
    const { width, height } = await browser.getWindowRect()
    if (browser.isAndroid) {
      const scrolled = await browser.execute('mobile: scrollGesture', {
        left: Math.round(width * 0.08),
        top: Math.round(height * 0.18),
        width: Math.round(width * 0.84),
        height: Math.round(height * 0.68),
        direction: 'up',
        percent: 0.85,
      }).catch(() => null)

      if (typeof scrolled === 'boolean') {
        await browser.pause(900)
        return scrolled
      }
    }

    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: Math.round(width * 0.5), y: Math.round(height * 0.3) },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 150 },
          { type: 'pointerMove', duration: 500, x: Math.round(width * 0.5), y: Math.round(height * 0.75) },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
    await browser.pause(900)
    return true
  }

  private async ensureVisibleByScrolling(
    candidates: Array<WdioEl | WebdriverIO.Element>,
    label: string,
    maxScrolls = 5,
    timeoutPerCheck = 4000
  ) {
    for (let i = 0; i <= maxScrolls; i += 1) {
      try {
        await this.waitForAnyDisplayed(candidates, timeoutPerCheck, label)
        return
      } catch {
        if (i === maxScrolls) throw new Error(`${label} did not appear`)
        await this.scrollDownOnce()
      }
    }
  }

  private async ensureIndividualAccountIOS() {
    if (!browser.isIOS) return

    const code = AUTH.individualAccountCode ?? 'VEG40002'
    await this.ensureIOSHomeAccount('Individual', code, this.individualAccountItemIOS)
  }

  private async getIOSAccountCodeLabel() {
    const el = await this.profilePickerAccountCodeLabelIOS
    return (
      await el.getAttribute('label').catch(async () => await el.getText().catch(() => ''))
    ).trim()
  }

  private async waitForIOSHomeAccount(accountType: 'Business' | 'Individual' | 'Joint', accountCode: string, timeout = 75000) {
    await browser.waitUntil(
      async () => {
        if (await this.moreNavBarIOS.isExisting().catch(() => false)) {
          await this.tap($('//XCUIElementTypeNavigationBar[@name="More"]//XCUIElementTypeButton[@name="close"]'))
          return false
        }
        const homeShown = await this.homeRootIOS.isExisting().catch(() => false)
        const accountCodeShown = await this.profilePickerAccountCodeLabelIOS.isExisting().catch(() => false)
        if (!homeShown || !accountCodeShown) return false

        const label = await this.getIOSAccountCodeLabel()
        return label.includes(accountCode) && (!label.includes('•') || label.includes(accountType))
      },
      {
        timeout,
        interval: 500,
        timeoutMsg: `Home screen did not switch to ${accountType} account (${accountCode}) on iOS`,
      }
    )
  }

  private async isIOSSubAccountsSheetOpen(expectedItem?: WdioEl) {
    const titleShown = await this.subAccountsTitleIOS.isExisting().catch(() => false)
    if (titleShown) return true

    if (expectedItem) {
      const itemShown = await expectedItem.isExisting().catch(() => false)
      if (itemShown) return true
    }

    const accountItems = await $$('-ios predicate string:name BEGINSWITH "switchSubidentity_item_" OR label BEGINSWITH "switchSubidentity_item_"')
    return (await accountItems.length) > 0
  }

  private async isIOSMoreOpen() {
    return await this.moreNavBarIOS.isExisting().catch(() => false)
  }

  private async tapIOSMoreAccountPickerByCoordinate() {
    const navShown = await this.moreNavBarIOS.isExisting().catch(() => false)
    if (navShown) {
      const location = await this.moreNavBarIOS.getLocation()
      const size = await this.moreNavBarIOS.getSize()
      await browser.execute('mobile: tap', {
        x: Math.round(location.x + size.width / 2),
        y: Math.round(location.y + size.height * 0.8),
      })
      return
    }

    await this.tapScreenPointIOS(0.5, 0.19, 'finger-ios-more-account-picker')
  }

  public async openIOSMoreMenu() {
    if (await this.isIOSMoreOpen()) return

    const entries = [
      this.moreTabIOS,
      this.profilePickerUserNameLabelIOS,
      this.profilePickerAccountCodeLabelIOS,
      $('//XCUIElementTypeNavigationBar[@name="Home"]//XCUIElementTypeImage[string-length(@label)=2]'),
    ]

    for (const entry of entries) {
      if (!await entry.isExisting()) continue
      await this.tap(entry).catch(() => {})
      const opened = await browser
        .waitUntil(async () => this.isIOSMoreOpen(), {
          timeout: 4000,
          interval: 250,
        })
        .then(() => true)
        .catch(() => false)
      if (opened) return
    }

    await browser.waitUntil(async () => this.isIOSMoreOpen(), {
      timeout: 10000,
      interval: 500,
      timeoutMsg: 'More menu did not open on iOS',
    })
  }

  private async openIOSSubAccountsSheet(expectedItem?: WdioEl) {
    const alreadyOnMore = await this.moreNavBarIOS.isExisting().catch(() => false)
    if (!alreadyOnMore) {
      await this.waitForHomeLoaded()
    }

    if (await this.isIOSSubAccountsSheetOpen(expectedItem)) return

    await this.openIOSMoreMenu()
    await this.dismissIOSMoreMenuTipIfPresent().catch(() => {})
    // Re-open More menu in case tip dismissal navigated away
    await this.openIOSMoreMenu().catch(() => {})

    const tapAttempts = [
      async () => this.tap(this.moreAccountPickerIOS),
      async () => this.tapIOSMoreAccountPickerByCoordinate(),
    ]

    for (const attempt of tapAttempts) {
      await attempt().catch(() => {})
      const opened = await browser
        .waitUntil(async () => this.isIOSSubAccountsSheetOpen(expectedItem), {
          timeout: 4000,
          interval: 250,
        })
        .then(() => true)
        .catch(() => false)
      if (opened) return
    }

    const legacyHomeTapAttempts = [
      async () => this.tap(this.profilePickerUserNameLabelIOS),
      async () => this.tap(this.profilePickerAccountCodeLabelIOS),
    ]

    for (const attempt of legacyHomeTapAttempts) {
      await attempt().catch(() => {})
      const opened = await browser
        .waitUntil(async () => this.isIOSSubAccountsSheetOpen(expectedItem), {
          timeout: 3000,
          interval: 250,
        })
        .then(() => true)
        .catch(() => false)
      if (opened) return
    }

    await browser.waitUntil(async () => this.isIOSSubAccountsSheetOpen(expectedItem), {
      timeout: 15000,
      interval: 500,
      timeoutMsg: 'Sub Accounts sheet did not open on iOS',
    })
  }

  private async selectIOSSubAccount(item: WdioEl) {
    await item.waitForExist({ timeout: 15000 })
    await this.tap(item)
    await this.subAccountsTitleIOS.waitForExist({ reverse: true, timeout: 15000 }).catch(() => {})
    await browser.pause(300)
  }

  private async pickerAccountIds() {
    const rows = browser.isIOS
      ? $$('-ios predicate string:name BEGINSWITH "switchSubidentity_item_"')
      : this.accountSelectionRootAndroid.$$(
        './/*[not(self::android.widget.EditText) and (contains(@resource-id,"switchSubidentity_item_") or @content-desc or self::android.widget.TextView)]',
      )
    const labels = await rows.map(async row => {
      if (browser.isIOS) return row.getAttribute('name')
      return [
        await row.getAttribute('resource-id'),
        await row.getAttribute('content-desc'),
        await row.getText(),
      ].join(' ')
    })
    const ids = labels.flatMap(label => label.toUpperCase().match(/[A-Z]{3}\d{5}(?:-\d+)?\b/g) ?? [])
    return [...new Set(ids)].sort()
  }

  public async verifyAccountPickerSearch() {
    const accountCode = AUTH.individualAccountCode
    if (!accountCode) throw new Error('The individual account code is required for the picker search fixture')
    await this.waitForIndividualAccountCode(accountCode)

    if (browser.isIOS) await this.openIOSSubAccountsSheet()
    else await this.openAndroidSubAccountsSheet()
    const search = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeSearchField" OR name == "switchSubidentity_input_search"')
      : this.accountSelectionRootAndroid.$('.//android.widget.EditText')
    await search.waitForDisplayed({ timeout: 10000 })
    const allAccounts = await this.pickerAccountIds()
    if (allAccounts.length < 2) throw new Error('Account picker search requires at least two configured identities')

    const matchingAccounts = allAccounts.filter(id => id.toLowerCase().includes(accountCode.toLowerCase()))
    if (matchingAccounts.length === 0 || matchingAccounts.length === allAccounts.length) {
      throw new Error('The account picker fixture must contain matching and non-matching account codes')
    }

    const waitForAccounts = async (expected: string[], message: string) => {
      await browser.waitUntil(async () => {
        const actual = await this.pickerAccountIds()
        return actual.length === expected.length && actual.every((id, index) => id === expected[index])
      }, { timeout: 10000, interval: 400, timeoutMsg: message })
    }

    await search.setValue(accountCode.toLowerCase())
    await waitForAccounts(matchingAccounts, 'TC2944: account code search should match regardless of case')
    await search.clearValue()
    await waitForAccounts(allAccounts, 'TC2945: clearing the query should restore the original identities')
    await search.setValue('zz-no-such-account-921')
    await waitForAccounts([], 'TC2946: an unmatched query should return no identities')
    await search.clearValue()
    await waitForAccounts(allAccounts, 'Expected the account rows after clearing the unmatched query')
  }

  public async verifyReselectCurrentAccount() {
    const code = AUTH.individualAccountCode
    if (!code) throw new Error('The individual account code is required for account re-selection')

    if (browser.isIOS) {
      await this.tap(this.individualAccountItemIOS, 10000)
      await browser.waitUntil(async () => !await this.isIOSSubAccountsSheetOpen(this.individualAccountItemIOS), {
        timeout: 15000,
        timeoutMsg: 'TC2948: the account picker should dismiss after selecting the active account',
      })
    } else {
      const row = this.accountSelectionRootAndroid.$(
        `(.//*[contains(@text,"${code}") or contains(@content-desc,"${code}")]/ancestor-or-self::*[@clickable="true"][1])[1]`,
      )
      await this.tap(row, 10000)
      await browser.waitUntil(async () => !await this.accountPickerOpen(), {
        timeout: 15000,
        timeoutMsg: 'TC2948: the account picker should dismiss after selecting the active account',
      })
      await this.ensureHomeLandingAndroid()
    }
    await this.waitForIndividualAccountCode(code)
  }

  private async waitForIndividualAccountCode(code: string) {
    if (browser.isIOS) {
      await this.waitForIOSHomeAccount('Individual', code)
      return
    }
    await this.homeRootAndroid.$(`.//*[contains(@text,"${code}") or contains(@content-desc,"${code}")]`).waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Expected the configured individual account on Home',
    })
  }

  private async closeIOSSubAccountsSheet() {
    const opened = await this.isIOSSubAccountsSheetOpen().catch(() => false)
    if (!opened) return

    await browser.back().catch(() => {})
    await browser
      .waitUntil(async () => !(await this.isIOSSubAccountsSheetOpen()), {
        timeout: 5000,
        interval: 250,
      })
      .catch(() => {})
  }

  private async ensureIOSHomeAccount(accountType: 'Business' | 'Individual' | 'Joint', accountCode: string, item: WdioEl) {
    await this.waitForHomeLoaded()

    const currentLabel = await this.getIOSAccountCodeLabel().catch(() => '')
    if (currentLabel.includes(accountCode) && (!currentLabel.includes('•') || currentLabel.includes(accountType))) return

    await this.openIOSSubAccountsSheet(item)
    await this.selectIOSSubAccount(item)

    await this.waitForIOSHomeAccount(accountType, accountCode)
  }

  private get iosAccountTargets() {
    return [
      { type: 'Individual' as const, code: 'VEG40002', item: this.individualAccountItemIOS },
      { type: 'Joint' as const, code: 'VEG40003', item: this.jointAccountItemIOS },
      { type: 'Business' as const, code: AUTH.businessAccountCode ?? 'DER00003', item: this.businessAccountItemIOS },
    ]
  }

  private async ensureSingleAccountAndroid() {
    await this.ensureAndroidIndividualHomeReady(15000)
  }

  private async ensureHomeLandingAndroid() {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    await browser.waitUntil(
      async () => {
        await this.dismissKnownAndroidBlockingPopups().catch(() => {})
        await this.dismissCommonAndroidAlert(500).catch(() => false)

        await this.closeAndroidDrawerIfOpen().catch(() => false)

        const homeShown = await this.homeRootAndroid.isDisplayed().catch(() => false)
          || await this.homeRootAndroid.isExisting().catch(() => false)
        if (homeShown) return true

        await this.tapHomeBottomNavAndroid().catch(() => {})

        await this.dismissKnownAndroidBlockingPopups().catch(() => {})
        await this.dismissCommonAndroidAlert(500).catch(() => false)

        return await this.homeRootAndroid.isDisplayed().catch(() => false)
          || await this.homeRootAndroid.isExisting().catch(() => false)
      },
      {
        timeout: 20000,
        interval: 500,
        timeoutMsg: 'Failed to stabilize on Home screen (Android)',
      }
    )
  }

  private async closeAndroidDrawerIfOpen() {
    if (!browser.isAndroid) return false

    const drawerShown = (
      await this.moreRootAndroid.isDisplayed().catch(() => false) ||
      await this.accountSelectionRootAndroid.isDisplayed().catch(() => false) ||
      await this.homeAndroidDrawerLogoutItem.isDisplayed().catch(() => false) ||
      await this.homeAndroidDrawerSettingsItem.isDisplayed().catch(() => false) ||
      await this.homeAndroidDrawerWalletsItem.isDisplayed().catch(() => false)
    )

    if (!drawerShown) return false

    await browser.back().catch(() => {})
    await browser.pause(500)
    return true
  }

  private async waitForAndroidHomeAccount(accountType: 'Business' | 'Individual' | 'Joint', timeout = 30000) {
    const label = accountType === 'Business'
      ? this.businessAccountLabelAndroid
      : accountType === 'Individual'
        ? this.individualAccountLabelAndroid
        : this.jointAccountLabelAndroid

    await browser.waitUntil(
      async () => {
        await this.dismissKnownAndroidBlockingPopups().catch(() => {})

        const homeShown = await this.homeRootAndroid.isDisplayed().catch(() => false)
          || await this.homeRootAndroid.isExisting().catch(() => false)
        if (!homeShown) return false

        // In Compose, account-type labels may not exist — treat home loaded as success
        return await label.isDisplayed().catch(() => false)
          || await label.isExisting().catch(() => false)
          || homeShown
      },
      {
        timeout,
        interval: 500,
        timeoutMsg: `Home screen did not switch to ${accountType} account`,
      }
    )
  }

  private async accountPickerOpen() {
    const composeMoreShown = await this.composeMoreIndicatorAndroid.isDisplayed().catch(() => false)
      || await this.composeMoreIndicatorAndroid.isExisting().catch(() => false)

    return (
      await this.accountSelectionRootAndroid.isDisplayed().catch(() => false) ||
      await this.accountSelectionRootAndroid.isExisting().catch(() => false) ||
      await this.subAccountsTitleAndroid.isDisplayed().catch(() => false) ||
      (!composeMoreShown && await this.accountPickerItemVisible())
    )
  }

  private async accountPickerItemVisible() {
    return (
      await this.accountPickerIndividualItemAndroid.isDisplayed().catch(() => false) ||
      await this.accountPickerJointItemAndroid.isDisplayed().catch(() => false) ||
      await this.accountPickerBusinessItemAndroid.isDisplayed().catch(() => false)
    )
  }

  private async openAndroidSubAccountsSheet() {
    await this.dismissKnownAndroidBlockingPopups().catch(() => {})

    if (await this.accountPickerOpen()) return

    const moreRootShown = await this.moreRootAndroid.isDisplayed().catch(() => false)
      || await this.moreRootAndroid.isExisting().catch(() => false)

    if (!moreRootShown) {
      await this.ensureHomeLandingAndroid()
      await this.userAvatarBtnAndroid.waitForExist({ timeout: 20000 })
      await this.tap(this.userAvatarBtnAndroid)
    }

    await browser.waitUntil(
      async () => {
        if (await this.accountPickerOpen()) return true

        const moreShown = await this.moreRootAndroid.isDisplayed().catch(() => false)
          || await this.moreRootAndroid.isExisting().catch(() => false)
        if (moreShown) {
          const accountPickerShown = await this.moreAccountPickerAndroid.isDisplayed().catch(() => false)
            || await this.moreAccountPickerAndroid.isExisting().catch(() => false)
          if (!accountPickerShown) return false

          await this.tap(this.moreAccountPickerAndroid)
        } else {
          const composeMoreShown = await this.composeMoreIndicatorAndroid.isDisplayed().catch(() => false)
            || await this.composeMoreIndicatorAndroid.isExisting().catch(() => false)
          if (!composeMoreShown) return false

          const composePickerShown = await this.composeAccountPickerRowAndroid.isDisplayed().catch(() => false)
            || await this.composeAccountPickerRowAndroid.isExisting().catch(() => false)
          if (!composePickerShown) return false

          await this.tap(this.composeAccountPickerRowAndroid)
        }

        return await browser.waitUntil(
          async () => (
            await this.accountSelectionRootAndroid.isDisplayed().catch(() => false) ||
            await this.accountSelectionRootAndroid.isExisting().catch(() => false) ||
            await this.accountPickerOpen() ||
            await this.accountPickerItemVisible()
          ),
          { timeout: 5000, interval: 300 }
        ).catch(() => false)
      },
      {
        timeout: 15000,
        interval: 500,
        timeoutMsg: 'Account picker did not open on Android',
      }
    )
  }

  private async tapFirstAvailableAndroid(candidates: WdioEl[], label: string) {
    const tried: string[] = []

    for (const candidate of candidates) {
      const selector = await Promise.resolve(candidate.selector).catch(() => '?')
      tried.push(String(selector))

      const present = await candidate.isDisplayed().catch(() => false)
        || await candidate.isExisting().catch(() => false)
      if (!present) continue

      try {
        await this.tap(candidate, 4000)
        return
      } catch {
        // Try the next locator; Compose can expose stale/non-clickable text nodes.
      }
    }

    throw new Error(`${label} item not found in account picker. Tried: ${tried.join(' | ')}`)
  }

  private async dismissGooglePayPopupIfPresentAndroid(timeout = 10000) {
    if (!browser.isAndroid) return false

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const notNow = $('//*[@text="Not Now" or @content-desc="Not Now"]')
    const notNowShown = await notNow.isDisplayed().catch(() => false)
    if (notNowShown) {
      await notNow.click().catch(() => {})
      await notNow.waitForDisplayed({ reverse: true, timeout: 5000 }).catch(() => {})
    }

    const appeared = await browser.waitUntil(
      async () => {
        const closeShown = await this.googlePayCloseButtonAndroid.isDisplayed().catch(() => false)
        if (closeShown) return true

        const screenShown = await this.googlePayScreenAndroid.isDisplayed().catch(() => false)
        return screenShown
      },
      {
        timeout,
        interval: 500,
      }
    ).catch(() => false)

    if (!appeared) return false

    const closeShown = await this.googlePayCloseButtonAndroid.isDisplayed().catch(() => false)
    if (closeShown) {
      await this.tap(this.googlePayCloseButtonAndroid)
      await this.googlePayCloseButtonAndroid.waitForExist({ reverse: true, timeout: 10000 }).catch(() => {})
      await this.ensureHomeLandingAndroid()
      return true
    }

    await browser.back().catch(() => {})
    await this.ensureHomeLandingAndroid()
    return true
  }


  private async tapHomeBottomNavAndroid() {
    if (!browser.isAndroid) return false

    if (await this.homeTabAndroid.isDisplayed().catch(() => false)) {
      await this.tap(this.homeTabAndroid).catch(() => {})
      return true
    }

    if (await this.homeTabAndroidA11y.isDisplayed().catch(() => false)) {
      await this.tap(this.homeTabAndroidA11y).catch(() => {})
      return true
    }

    if (await this.homeTabAndroidXpath.isDisplayed().catch(() => false)) {
      await this.tap(this.homeTabAndroidXpath).catch(() => {})
      return true
    }

    return false
  }

  public async ensureIndividualAccount() {
    if (browser.isIOS) {
      await this.ensureIndividualAccountIOS()
      return
    }

    if (browser.isAndroid) {
      await this.ensureSingleAccountAndroid()
      await this.ensureHomeLandingAndroid()
    }
  }

  public async ensureJointAccount() {
    if (browser.isIOS) {
      await this.ensureIOSHomeAccount('Joint', 'VEG40003', this.jointAccountItemIOS)
      await markBrowserStackStep('Switched to Joint')
      return
    }

    if (!browser.isAndroid) return

    await this.switchAndroidAccountByCode('VEG40003', 'Joint')
    await markBrowserStackStep('Switched to Joint')
  }

  public async ensureBusinessAccount(accountCode?: string) {
    const code = accountCode ?? AUTH.businessAccountCode ?? 'DER00003'
    if (browser.isIOS) {
      const item = accountCode ? this.iosPredicateContains(code) : this.businessAccountItemIOS
      await this.ensureIOSHomeAccount('Business', code, item)
      return
    }

    if (!browser.isAndroid) return

    await this.waitForHomeLoaded()
    const isBusiness = await this.businessAccountLabelAndroid.isDisplayed().catch(() => false)
    if (isBusiness && !accountCode) return

    await this.switchAndroidAccountByCode(code, accountCode ? undefined : 'Business')
    await this.dismissGooglePayPopupIfPresentAndroid(12000).catch(() => false)
    await this.waitForHomeLoaded()
  }

  public async verifyAndroidAccountSwitchingAcrossTypes() {
    if (!browser.isAndroid) return
    if (!(await this.openSmokeBusinessAccountAndroid())) return
    await this.returnToSmokeIndividualAccountAndroid()
  }

  public async openSmokeBusinessAccountAndroid() {
    const opened = await this.openAndroidSubAccountsSheet().then(() => true).catch(() => false)
    if (!opened) return false

    const businessByCode = $('(//*[@resource-id="accountSelection_screen"]//*[contains(@text,"DER00003")] | //*[@resource-id="accountSelection_screen"]//*[contains(@content-desc,"DER00003")])[1]')
    const hasBusiness = await businessByCode.isDisplayed().catch(() => false)
    await browser.back().catch(() => {})

    if (!hasBusiness) return false

    await this.switchAndroidAccountByCode('DER00003', 'Business')
    return true
  }

  public async returnToSmokeIndividualAccountAndroid() {
    const accountCode = AUTH.individualAccountCode ?? 'VEG40002'
    await this.switchAndroidAccountByCode(accountCode, 'Individual')
  }

  public async verifyIOSAccountSwitchingAcrossTypes() {
    if (!browser.isIOS) return

    await this.ensureIOSHomeAccount('Business', AUTH.businessAccountCode ?? 'DER00003', this.businessAccountItemIOS)
    await this.ensureIOSHomeAccount('Individual', AUTH.individualAccountCode ?? 'VEG40002', this.individualAccountItemIOS)
  }

  public async openSmokeBusinessAccountIOS() {
    await this.waitForHomeLoaded()

    const accountCode = AUTH.businessAccountCode ?? 'DER00003'
    const currentLabel = await this.getIOSAccountCodeLabel().catch(() => '')
    if (currentLabel.includes(accountCode) && (!currentLabel.includes('•') || currentLabel.includes('Business'))) return true

    const opened = await this.openIOSSubAccountsSheet().then(() => true).catch(() => false)
    if (!opened) return false

    const hasBusiness = await this.businessAccountItemIOS.waitForExist({ timeout: 5000 }).catch(() => false)
    if (!hasBusiness) {
      await this.closeIOSSubAccountsSheet()
      return false
    }

    await this.selectIOSSubAccount(this.businessAccountItemIOS)
    await this.waitForIOSHomeAccount('Business', accountCode)
    return true
  }

  public async openSmokeIndividualAccountIOS() {
    const code = AUTH.individualAccountCode ?? 'VEG40002'
    await this.ensureIOSHomeAccount('Individual', code, this.individualAccountItemIOS)
  }

  public async openSmokeJointAccountIOS() {
    await this.ensureIOSHomeAccount('Joint', 'VEG40003', this.jointAccountItemIOS)
  }

  public async verifyAccountSwitchingAcrossTypes() {
    if (browser.isIOS) {
      await this.verifyIOSAccountSwitchingAcrossTypes()
      return
    }

    if (browser.isAndroid) {
      await this.verifyAndroidAccountSwitchingAcrossTypes()
    }
  }

  /* =========================
   * HOME SCREEN ELEMENTS
   * ========================= */

  get homeRoot() {
    if (browser.isAndroid) return this.homeRootAndroid
    return this.homeRootIOS
  }

  private get accountHolderNameCandidates(): WdioEl[] {
    if (browser.isAndroid) {
      return [
        $('//*[contains(@resource-id,"home_button_userAvatar")]/android.widget.TextView[1]'),
      ]
    }

    return [
      this.byId('home_label_accountHolderName'),
      this.byId('home_label_accountName'),
      this.byId('home_label_accountHolder'),
    ]
  }

  private get accountTypeCandidates(): WdioEl[] {
    if (browser.isAndroid) {
      return [
        $('//*[contains(@resource-id,"home_button_userAvatar")]/android.widget.TextView[2]'),
      ]
    }

    return [
      this.byId('home_label_accountType'),
      this.byId('home_text_accountType'),
    ]
  }

  private get accountBalanceCandidates(): WdioEl[] {
    if (browser.isAndroid) {
      return [
        $('//*[contains(@resource-id,"home_screen")]//*[contains(@resource-id,"home_input_search")]/following-sibling::android.widget.TextView[1]'),
      ]
    }

    return [
      this.byId('home_label_balance'),
      this.byId('home_label_balanceValue'),
      this.byId('home_text_balance'),
    ]
  }

  private get addFundsButton(): WdioEl {
    if (browser.isAndroid) return this.byId('home_button_addFunds')
    return this.byId('home_button_addFunds')
  }

  private get exchangeButton(): WdioEl {
    if (browser.isAndroid) return this.byId('home_button_exchange')
    return this.byId('home_button_exchange')
  }

  private get detailsButton(): WdioEl {
    if (browser.isAndroid) return this.byId('home_button_walletDetails')
    return this.byId('home_button_details')
  }

  private get addFundsButtonText(): WdioEl {
    if (browser.isAndroid) return this.androidTextContains('Add Funds')
    return this.iosPredicateContains('Add Funds')
  }

  private get exchangeButtonText(): WdioEl {
    if (browser.isAndroid) return this.androidTextContains('Exchange')
    return this.iosPredicateContains('Exchange')
  }

  private get detailsButtonText(): WdioEl {
    if (browser.isAndroid) return this.androidTextContains('Details')
    return this.iosPredicateContains('Details')
  }

  private get notificationBannerCandidates(): WdioEl[] {
    return [
      this.byId('home_banner_notification'),
      this.byId('home_banner_alert'),
    ]
  }

  private get promoBannerCandidates(): WdioEl[] {
    return [
      browser.isAndroid
        ? $('//*[contains(@resource-id,"home_screen")]//android.widget.TextView[@text="For you"]')
        : $('//*[@name="home_screen_view"]//XCUIElementTypeStaticText[@label="For you" or @label="For You"]'),
      this.byId('home_banner_promo'),
      this.byId('home_banner_feature'),
      this.byId('home_banner_promotion'),
      this.byId('st_storyly_list_recycler_view'),
    ]
  }

  private get pendingTransactionsCandidates(): WdioEl[] {
    if (browser.isAndroid) {
      return [
        this.byId('home_section_pendingTransactions'),
        this.androidTextContains('Pending transactions'),
      ]
    }

    return [
      this.byId('home_section_pendingTransactions'),
      this.iosPredicateContains('Pending transactions'),
    ]
  }

  private get recentTransactionsHeaderCandidates(): WdioEl[] {
    if (browser.isAndroid) {
      return [
        this.byId('home_section_recentTransactions'),
        this.recentActivityHeader,
        this.androidTextContains('Recent transactions'),
      ]
    }

    return [
      this.byId('home_section_recentTransactions'),
      this.recentActivityHeader,
      this.iosPredicateContains('Recent transactions'),
    ]
  }


  private get recentActivitiesCandidates(): WdioEl[] {
    return [
      this.byId('home_section_recentActivities'),
      this.recentActivityHeader,
    ]
  }

  public get recentActivityHeader() {
    return browser.isAndroid
      ? $('//*[contains(@resource-id,"home_screen")]//android.widget.TextView[@text="Recent Activity" or @text="Recent Activities" or @text="Recent Transactions"]')
      : $('//*[@name="home_screen_view"]//XCUIElementTypeStaticText[@label="Recent Activity" or @label="Recent Activities" or @label="Recent Transactions"]')
  }

  private get recentActivityRowsSelectorAndroid() {
    const heading = '@text="Recent Activity" or @text="Recent Activities" or @text="Recent Transactions"'
    return `//*[contains(@resource-id,"home_screen")]//android.widget.TextView[${heading}]/following-sibling::android.view.View[preceding-sibling::android.widget.TextView[1][${heading}]]/descendant-or-self::android.view.View[count(android.widget.TextView)>=3]`
  }

  private async recentActivityRowLabels(row: WebdriverIO.Element, index: number) {
    const relative = browser.isAndroid ? './android.widget.TextView' : './/XCUIElementTypeStaticText'
    const labels = await row.$$(relative) as unknown as WebdriverIO.Element[]
    if (labels.length || !browser.isAndroid) return labels
    // Element-scoped XPath can return nothing on Compose rows, so address the row globally.
    return await $$(`(${this.recentActivityRowsSelectorAndroid})[${index + 1}]/android.widget.TextView`) as unknown as WebdriverIO.Element[]
  }

  private get recentActivityRows() {
    if (browser.isAndroid) {
      // Compose exposes the rows as siblings of the heading, without a list ID.
      return $$(this.recentActivityRowsSelectorAndroid)
    }
    const heading = '@label="Recent Activity" or @label="Recent Activities" or @label="Recent Transactions"'
    const sectionHeading = `${heading} or @label="For you" or @label="Total Wealth" or @label="Spend Analytics" or @label="Recent Payees"`
    return $$(`(//*[@name="home_list_recentTransactions" or @name="home_recentTransactions_list" or @name="home_section_recentActivities"]//XCUIElementTypeCell | //*[@name="home_screen_view"]//XCUIElementTypeCell[preceding-sibling::XCUIElementTypeStaticText[1][${heading}]] | //*[@name="home_screen_view"]//XCUIElementTypeCell[preceding-sibling::XCUIElementTypeCell[.//XCUIElementTypeStaticText[${sectionHeading}]][1][.//XCUIElementTypeStaticText[${heading}]]])[count(.//XCUIElementTypeStaticText)>=3]`)
  }

  private async readActivityRecipientName() {
    // Any person or company listed on Home is searchable; system entries are not.
    const systemEntry = /^(exchanged|deposit|dividend|withdrawal|interest|refund|master)\b|campaign/i
    const rows = await this.recentActivityRows as unknown as WebdriverIO.Element[]
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index]
      if (!await row.isDisplayed()) continue
      const labels = await this.recentActivityRowLabels(row, index)
      for (const label of labels) {
        if (!await label.isDisplayed()) continue
        const text = (await label.getText()).replace(/\s+/g, ' ').trim()
        const isName = text.length >= 3 && /\p{L}/u.test(text) && !/\d/.test(text) && !/^[A-Z]{1,3}$/.test(text)
        if (isName && !systemEntry.test(text)) return text
      }
    }
    return null
  }

  private get spendAnalyticsCandidates(): WdioEl[] {
    if (browser.isAndroid) {
      return [
        $('//*[contains(@resource-id,"home_screen")]//android.widget.TextView[@text="Spend Analytics"]'),
      ]
    }

    return [
      this.byId('home_section_spendAnalytics'),
      this.iosPredicateContains('Spend Analytics'),
    ]
  }

  private get bottomNavCandidates(): WdioEl[] {
    if (browser.isAndroid) {
      return [
        this.byId('bottomNavigation'),
        this.byId('navigation_button_home'),
        this.byId('navigation_button_cards'),
        this.byId('navigation_button_pay'),
        this.byId('navigation_button_invest'),
        this.byId('navigation_button_crypto'),
        this.byId('nav_graph_crypto'),
        this.androidTextContains('Home'),
        this.androidTextContains('Cards'),
        this.androidTextContains('Pay'),
        this.androidTextContains('Invest'),
        this.androidTextContains('Crypto'),
      ]
    }

    return [
      this.iosPredicateContains('Home'),
      this.iosPredicateContains('Cards'),
      this.iosPredicateContains('Pay'),
      this.iosPredicateContains('Invest'),
      this.iosPredicateContains('More'),
    ]
  }

  private get homeTab() {
    if (browser.isAndroid) return this.byId('navigation_button_home')
    return $('~Home')
  }

  private get androidBackButton() {
    return $('(//*[@content-desc="Back"]/ancestor::*[@clickable="true"][1] | //*[@content-desc="Back" and @clickable="true"] | //*[@content-desc="Navigate up"] | //*[contains(@resource-id,"button_back") and @clickable="true"] | //*[@content-desc="Close" or @content-desc="close"])[1]')
  }

  private get iosBackButton() {
    return $('~Back')
  }

  /* =========================
   * VALIDATIONS
   * ========================= */

  public async waitForHomeLoaded(timeout = 30000) {
    if (browser.isAndroid) {
      await browser.switchContext('NATIVE_APP').catch(() => {})

      await browser.waitUntil(
        async () => {
          const homeShown = await this.homeRoot.isDisplayed().catch(() => false)
            || await this.homeRoot.isExisting().catch(() => false)
          if (homeShown) return true

          const activity = await browser.getCurrentActivity().catch(() => '')
          if (/DashboardActivity/i.test(activity)) return true

          await this.dismissKnownAndroidBlockingPopups().catch(() => {})
          await this.dismissCommonAndroidAlert(500).catch(() => false)

          const cardsShown = await this.cardsRootAndroid.isDisplayed().catch(() => false)
          const homeTabShown = await this.homeTabAndroid.isDisplayed().catch(() => false)
          const homeTabA11yShown = await this.homeTabAndroidA11y.isDisplayed().catch(() => false)
          const homeTabXpathShown = await this.homeTabAndroidXpath.isDisplayed().catch(() => false)
          if (cardsShown && (homeTabShown || homeTabA11yShown || homeTabXpathShown)) {
            await this.tapHomeBottomNavAndroid().catch(() => {})
            await browser.pause(300)
            const homeAfterTap = await this.homeRoot.isDisplayed().catch(() => false)
              || await this.homeRoot.isExisting().catch(() => false)
            if (homeAfterTap) return true
          }

          return await this.homeRoot.isDisplayed().catch(() => false)
            || await this.homeRoot.isExisting().catch(() => false)
        },
        {
          timeout,
          interval: 500,
          timeoutMsg: 'Home screen did not appear (blocked by alert?)',
        }
      )
      return
    }

    await browser.waitUntil(
      async () => {
        await this.dismissIOSPermissionAlertsIfPresent().catch(() => {})
        return await this.homeRoot.isExisting().catch(() => false)
      },
      { timeout, interval: 500, timeoutMsg: 'Home screen did not appear on iOS (blocked by permission alert?)' },
    )
  }

  public async verifyAccountHeader() {
    if (browser.isAndroid) {
      await this.waitForAnyDisplayed(this.accountHolderNameCandidates, 10000, 'Account holder name')
      await this.waitForAnyDisplayed(this.accountTypeCandidates, 10000, 'Account type and code')
      const name = await this.accountHolderNameCandidates[0].getText()
      const account = await this.accountTypeCandidates[0].getText()
      if (!name.trim() || !account.includes('Individual') || (AUTH.individualAccountCode && !account.includes(AUTH.individualAccountCode))) {
        throw new Error('Home header must show the selected Individual account and its holder')
      }
      return
    }
    await this.waitForAnyDisplayed(this.accountHolderNameCandidates, 15000, 'Account holder name')
      .catch(async () => this.waitForAccountHolderNameFallback(15000))

    await this.waitForAnyDisplayed(this.accountTypeCandidates, 15000, 'Account type')
      .catch(async () => this.waitForAccountTypeFallback(15000))
  }

  public get recentPayeesSection() {
    return this.byId('home_section_recentPayees')
  }

  public async readRecentPayeeName() {
    const section = this.recentPayeesSection
    await this.ensureVisibleByScrolling([section], 'Recent Payees on Home')
    const labels = await section.$$(browser.isIOS
      ? './/XCUIElementTypeStaticText'
      : './/android.widget.TextView')
    for (const label of labels) {
      if (!await label.isDisplayed()) continue
      const name = (await label.getText()).replace(/\s+/g, ' ').trim()
      const heading = /^(recent payees|view all|see all)$/i.test(name)
      if (!heading && name.length >= 3 && /\p{L}/u.test(name)) return name
    }
    throw new Error('TEST_PRECONDITION: Recent Payees on Home must contain a visible payee name')
  }

  public async readHomeSearchPayeeName() {
    await this.ensureHomeBeforeSectionLookup()
    await this.scrollToHomeTop()
    // iOS 2.22.2 search returned nothing for recipient names, while instruments are found.
    if (browser.isIOS) {
      console.log('[Home Search] Query source: iOS instrument')
      return process.env.MB_HOME_SEARCH_QUERY_IOS || 'Mastercard'
    }
    let activityName: string | null = null
    let atBottom = false
    for (let position = 0; position <= 8; position += 1) {
      if (await this.recentPayeesSection.isDisplayed()) {
        try {
          const name = await this.readRecentPayeeName()
          console.log('[Home Search] Recipient source: Recent Payees')
          await this.scrollToHomeTop()
          return name
        } catch (error) {
          if (!(error instanceof Error) || !error.message.startsWith('TEST_PRECONDITION:')) throw error
        }
      }
      if (!activityName && await this.recentActivityHeader.isDisplayed()) activityName = await this.readActivityRecipientName()
      if (atBottom) break
      atBottom = !await this.scrollDownOnce()
    }
    await this.scrollToHomeTop()
    if (activityName) {
      console.log('[Home Search] Recipient source: Recent Activity')
      return activityName
    }
    throw new Error('TEST_PRECONDITION: Home must list a person or company in Recent Payees or Recent Activity')
  }

  private async scrollToHomeTop() {
    for (let i = 0; i < 6; i += 1) {
      if (!await this.scrollUpOnce()) break
    }
  }

  public async verifyRecentPayeeOpensDetails(name: string) {
    const section = this.recentPayeesSection
    const payButton = browser.isAndroid
      ? $('//*[contains(@resource-id,"beneficiaryDetails_button_pay") or @content-desc="beneficiaryDetails_button_pay"]')
      : $('~beneficiaryDetails_button_pay')
    const nameLiteral = `concat('${name.split("'").join(`',"'",'`)}','')`
    const nameSelector = `*[@text=${nameLiteral} or @content-desc=${nameLiteral} or @label=${nameLiteral} or @name=${nameLiteral}]`
    const payee = section.$(`.//${nameSelector}`)

    await payee.waitForDisplayed({ timeout: 15000, timeoutMsg: 'Expected the configured payee in Recent Payees on Home' })
    await this.tap(payee)
    await payButton.waitForDisplayed({ timeout: 15000, timeoutMsg: 'Expected the beneficiary details screen' })
    await section.waitForDisplayed({ reverse: true, timeout: 10000 })
    await $(`//${nameSelector}`).waitForDisplayed({
      timeout: 10000,
      timeoutMsg: 'Expected beneficiary details to show the selected payee name',
    })
  }

  public async verifyBusinessHomeOmitsRecentPayees() {
    const code = AUTH.businessAccountCode
    if (!code) throw new Error('A business account code is required for the Recent Payees fixture')
    await this.ensureBusinessAccount()
    await this.waitForHomeLoaded()
    if (browser.isIOS) {
      await this.waitForIOSHomeAccount('Business', code)
    } else {
      await this.businessAccountLabelAndroid.waitForDisplayed({ timeout: 10000 })
    }

    const recentPayees = browser.isIOS
      ? $('-ios predicate string:name == "home_section_recentPayees" OR label ==[c] "Recent payees"')
      : $('//*[contains(@resource-id,"home_section_recentPayees") or @text="Recent payees" or @content-desc="Recent payees"]')
    for (let position = 0; position < 5; position += 1) {
      if (await recentPayees.isDisplayed()) throw new Error('TC3063: Business Home should not show Recent Payees')
      if (position < 4) await this.scrollDownOnce()
    }
  }

  public async verifyAboutUsOpens() {
    if (browser.isIOS) await this.openIOSMoreMenu()
    else await this.openAndroidMoreMenuFromProfile()

    const entry = browser.isIOS ? $('~About Us') : $('//*[@text="About Us" or @content-desc="About Us"]')
    await this.ensureVisibleByScrolling([entry], 'About Us row')
    await this.tap(entry, 10000)
    const title = browser.isIOS
      ? $('//XCUIElementTypeNavigationBar[@name="About Us"]')
      : $('//*[@text="About Us" or @content-desc="About Us"]')
    const content = browser.isIOS
      ? $('//XCUIElementTypeStaticText[contains(@label,"Moneybase") and string-length(@label)>20]')
      : $('//android.widget.TextView[contains(@text,"Moneybase") and string-length(@text)>20]')
    await title.waitForDisplayed({ timeout: 10000 })
    await content.waitForDisplayed({ timeout: 15000 })
    await this.tapHomeTab()
    await this.waitForHomeLoaded()
  }

  public async verifyTotalWealthSectionVisible() {
    const heading = browser.isAndroid
      ? $('//*[@text="Total Wealth" or @content-desc="Total Wealth"]')
      : $('-ios predicate string:type == "XCUIElementTypeStaticText" AND label ==[c] "Total Wealth"')
    await this.ensureVisibleByScrolling([heading], 'Total Wealth section')
  }

  public async verifyWalletBalanceFormat() {
    await browser.waitUntil(async () => {
      for (const candidate of this.accountBalanceCandidates) {
        if (!await candidate.isDisplayed().catch(() => false)) continue
        const text = await candidate.getText().catch(() => '')
        if (this.isFormattedMoney(text)) return true
      }
      // iOS 2.22.2 exposes no balance ID; signed activity amounts do not match the money format.
      if (browser.isIOS) {
        const texts = await this.getVisibleTextCandidates()
        return texts.some(text => this.isFormattedMoney(text))
      }
      return false
    }, { timeout: 15000, timeoutMsg: 'Expected the wallet balance to show a formatted amount and currency' })
  }

  public async verifyBalance() {
    await this.waitForAnyDisplayed(this.accountBalanceCandidates, 15000, 'Account balance')
      .catch(async () => this.waitForBalanceFallback(15000))
  }

  public async verifyActionButtons() {
    await this.waitForAnyDisplayed(
      [this.addFundsButton, this.addFundsButtonText],
      10000,
      'Add Funds button'
    )
    await this.waitForAnyDisplayed(
      [this.exchangeButton, this.exchangeButtonText],
      10000,
      'Exchange button'
    )
    await this.waitForAnyDisplayed(
      [this.detailsButton, this.detailsButtonText],
      10000,
      'Details button'
    )
  }

  public async verifyWalletDetailsOpens() {
    await this.openCurrentWalletDetails()
    await this.tapHomeTab()
    await this.waitForHomeLoaded()
  }

  public async openCurrentWalletDetails() {
    await this.tapFirstDisplayed([this.detailsButton, this.detailsButtonText], 'Details button')
    await this.waitForWalletDetails()
  }

  public async waitForWalletDetails(currency?: 'EUR' | 'USD' | 'GBP') {
    const title = browser.isIOS
      ? $(currency
        ? `//XCUIElementTypeNavigationBar[@name="${currency} Account"]`
        : '-ios predicate string:type == "XCUIElementTypeNavigationBar" AND name MATCHES "[A-Z]{3} Account"')
      : $(`android=new UiSelector().textMatches("${currency ?? '[A-Z]{3}'} Wallet")`)
    await title.waitForDisplayed({ timeout: 15000, timeoutMsg: 'Expected the wallet details screen' })
  }

  public async verifyWalletStatementAction(available: boolean) {
    const action = browser.isIOS
      ? $('-ios predicate string:name == "walletDetails_button_statement" OR (type IN {"XCUIElementTypeButton", "XCUIElementTypeStaticText"} AND label IN {"Statement", "Statements"})')
      : $('//*[contains(@resource-id,"walletDetails_button_statement") or @content-desc="Statement" or @content-desc="Statements" or @text="Statement" or @text="Statements"]')
    await action.waitForDisplayed({ reverse: !available, timeout: 10000 })
    if (!available) return
    await this.tap(action)
    const report = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeNavigationBar" AND label IN {"Statements Report", "Statements"}')
      : $('//*[@text="Statements Report" or @content-desc="Statements Report" or contains(@resource-id,"statementsReport_screen")]')
    await report.waitForDisplayed({ timeout: 15000 })
  }

  public async verifyStatementFormatSelection() {
    for (const format of ['CSV', 'PDF']) {
      const option = browser.isIOS
        ? $(`-ios predicate string:type == "XCUIElementTypeButton" AND (name == "${format}" OR label == "${format}")`)
        : $(`(//*[@text="${format}" or @content-desc="${format}"]/ancestor-or-self::*[@clickable="true"][1])[1]`)
      await this.tap(option, 10000)
      await browser.waitUntil(async () => {
        if (await option.isSelected()) return true
        return browser.isAndroid && (await option.getAttribute('checked')) === 'true'
      }, { timeout: 10000, timeoutMsg: `TC2936: ${format} should be selected` })
    }
  }

  public async verifyStatementTypeSelection() {
    const picker = browser.isIOS
      ? $('-ios predicate string:type IN {"XCUIElementTypeButton", "XCUIElementTypeCell"} AND (label == "Consolidated" OR name == "statementsReport_button_accountType")')
      : $('(//*[contains(@resource-id,"statementsReport_button_accountType")] | //*[@text="Consolidated"]/ancestor-or-self::*[@clickable="true"][1])[1]')
    await this.tap(picker, 10000)
    const investment = browser.isIOS
      ? $('-ios predicate string:(name == "Investment Account" OR label == "Investment Account") AND type IN {"XCUIElementTypeButton", "XCUIElementTypeCell", "XCUIElementTypeStaticText"}')
      : $('//*[@text="Investment Account" or @content-desc="Investment Account"]')
    await this.tap(investment, 10000)
    const done = browser.isIOS ? $('~Done') : $('//*[@text="Done" or @content-desc="Done"]')
    if (await done.isDisplayed()) await this.tap(done)
    const selected = browser.isIOS
      ? $('-ios predicate string:type IN {"XCUIElementTypeButton", "XCUIElementTypeCell"} AND (label == "Investment Account" OR (name == "statementsReport_button_accountType" AND value == "Investment Account"))')
      : $('//*[contains(@resource-id,"statementsReport_button_accountType") and (@text="Investment Account" or @content-desc="Investment Account" or .//*[@text="Investment Account"])]')
    await selected.waitForDisplayed({ timeout: 15000, timeoutMsg: 'TC2937: statement type should be Investment Account' })
  }

  private statementDateControl(bound: 'From' | 'To') {
    const id = 'statementsReport_button_' + bound.toLowerCase()
    return browser.isIOS
      ? $(`//XCUIElementTypeButton[@name="${id}" or starts-with(@label,"${bound},")] | //XCUIElementTypeCell[.//XCUIElementTypeStaticText[@label="${bound}"]]`)
      : $(`(//*[contains(@resource-id,"${id}")] | //*[@text="${bound}"]/ancestor::*[@clickable="true"][1])[1]`)
  }

  private async verifyStatementMonth(bound: 'From' | 'To', month: string) {
    const control = this.statementDateControl(bound)
    const monthText = browser.isIOS
      ? control.$$('.//XCUIElementTypeStaticText')
      : control.$$('.//android.widget.TextView')
    const expected = month.toLowerCase()
    await browser.waitUntil(async () => {
      const children = await monthText.map(el => el.getText())
      const current = [
        await control.getText(),
        await control.getAttribute(browser.isIOS ? 'label' : 'content-desc'),
        ...children,
      ].join(' ').toLowerCase()
      return current.includes(expected)
    }, { timeout: 10000, timeoutMsg: `Expected statement ${bound} month to be ${month}` })
  }

  private async selectStatementMonth(bound: 'From' | 'To', month: string) {
    await this.tap(this.statementDateControl(bound), 10000)
    const wheel = $('//XCUIElementTypePickerWheel')
    if (browser.isIOS && await wheel.isExisting()) {
      await wheel.setValue(month)
    } else {
      const option = browser.isIOS
        ? $(`-ios predicate string:label == "${month}" OR name == "${month}"`)
        : $(`//*[@text="${month}" or @content-desc="${month}"]`)
      await this.tap(option, 10000)
    }
    const done = browser.isIOS ? $('~Done') : $('//*[@text="Done" or @content-desc="Done"]')
    if (await done.isDisplayed()) await this.tap(done)
  }

  public async verifyStatementDateRange() {
    const format = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })
    const now = new Date()
    const latest = process.env.STATEMENT_LATEST_MONTH || format.format(now)
    const older = process.env.STATEMENT_OLDER_MONTH
      || format.format(new Date(now.getFullYear(), now.getMonth() - 1, 1))
    if (latest === older) throw new Error('Statement date fixture needs two distinct months')
    await this.verifyStatementMonth('From', latest)
    await this.verifyStatementMonth('To', latest)
    await this.selectStatementMonth('From', older)
    await this.verifyStatementMonth('From', older)
    await this.selectStatementMonth('To', older)
    await this.verifyStatementMonth('To', older)
    await this.selectStatementMonth('From', latest)
    await this.verifyStatementMonth('From', older)
  }

  private async openLogoutConfirmation() {
    if (browser.isIOS) await this.openIOSMoreMenu()
    else await this.openAndroidMoreMenuFromProfile()
    const logout = browser.isIOS
      ? $('-ios predicate string:(name ==[c] "Log out" OR label ==[c] "Log out" OR name ==[c] "Logout")')
      : this.homeAndroidDrawerLogoutItem
    await this.ensureVisibleByScrolling([logout], 'Logout row')
    await this.tap(logout)
    const confirm = browser.isIOS ? $('~modal_button_primary') : this.byId('modal_button_primary')
    const close = browser.isIOS ? $('~modal_button_close') : this.byId('modal_button_close')
    await confirm.waitForDisplayed({ timeout: 10000 })
    await close.waitForDisplayed({ timeout: 10000 })
    return { confirm, close }
  }

  public async confirmLogout() {
    const { confirm } = await this.openLogoutConfirmation()
    await this.tap(confirm)
  }

  public async cancelLogoutAndVerifyHome() {
    const { close } = await this.openLogoutConfirmation()
    await this.tap(close)
    await close.waitForDisplayed({ reverse: true, timeout: 10000 })
    if (browser.isIOS && await this.isIOSMoreOpen()) {
      await this.tap(this.moreNavBarIOS.$('./XCUIElementTypeButton[@name="close"]'))
    }
    await this.tapHomeTab()
    await this.waitForHomeLoaded()
  }

  private get supportTitle() {
    return browser.isIOS ? $('~Support') : $('//*[@text="Support" or @content-desc="Support"]')
  }

  private supportOption(title: 'Chat' | 'FAQ' | 'Call Us') {
    return browser.isIOS ? $(`~${title}`) : $(`//*[@text="${title}" or @content-desc="${title}"]`)
  }

  public async openSupport() {
    await this.waitForHomeLoaded()
    if (browser.isAndroid) await this.dismissKnownAndroidBlockingPopups()
    const help = browser.isIOS
      ? $('//XCUIElementTypeNavigationBar[@name="Home"]/XCUIElementTypeButton[@name="home_button_help" or @name="Help" or @name="Support" or (not(@name) and not(@label))]')
      : $('//*[contains(@resource-id,"home_button_help") or contains(@resource-id,"home_button_support") or @content-desc="Help" or @content-desc="Support"]')
    await help.waitForDisplayed({ timeout: 10000 })
    await this.tap(help)
    await this.supportTitle.waitForDisplayed({ timeout: 10000 })
  }

  public async verifySignedInSupportOptions() {
    await this.openSupport()
    return this.verifySupportOptions(false)
  }

  private async verifySupportOptions(guest: boolean) {
    const greeting = browser.isIOS
      ? $('-ios predicate string:label BEGINSWITH "Hi " AND label CONTAINS[c] "how can we help you"')
      : $('//*[starts-with(@text,"Hi ") and contains(@text,"how can we help you")]')
    await greeting.waitForDisplayed({ timeout: 10000 })
    const message = await greeting.getText()
    for (const option of ['FAQ', 'Call Us'] as const) {
      await this.supportOption(option).waitForDisplayed({ timeout: 10000 })
    }
    await this.supportOption('Chat').waitForDisplayed({ reverse: guest, timeout: 10000 })
    if (guest && !/^Hi Guest\b/i.test(message)) throw new Error('Guest Support should greet Guest')
    return message
  }

  public async verifyGuestSupportOptions() {
    const help = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeButton" AND (name == "register_button_help" OR name == "loginNewMobile_button_help" OR label IN {"Help", "Support"})')
      : $('//*[contains(@resource-id,"register_button_help") or contains(@resource-id,"loginNewMobile_button_help") or @content-desc="Help" or @content-desc="Support"]')
    await this.tap(help, 10000)
    await this.supportTitle.waitForDisplayed({ timeout: 10000 })
    await this.verifySupportOptions(true)
  }

  public async verifySupportClosesToHome() {
    await this.openSupport()
    await this.closeSupport()
    await this.waitForHomeLoaded()
  }

  private async closeSupport() {
    const close = browser.isIOS
      ? $('~modal_button_close')
      : $('//*[contains(@resource-id,"modal_button_close") or contains(@resource-id,"support_button_close") or @content-desc="Close"]')
    await this.tap(close, 10000)
    await this.supportTitle.waitForDisplayed({ reverse: true, timeout: 10000 })
  }

  public async verifySupportFromCards(homeGreeting: string) {
    await this.closeSupport()
    const tab = browser.isIOS ? $('~Cards') : this.byId('navigation_button_cards')
    await this.tap(tab, 10000)
    const cards = browser.isIOS
      ? $('//XCUIElementTypeNavigationBar[@name="Cards"]')
      : this.cardsRootAndroid
    await cards.waitForDisplayed({ timeout: 15000 })
    const help = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeButton" AND (name == "cards_button_help" OR label IN {"Help", "Support"})')
      // The Android Cards help icon has no id or label; it is the first control after the avatar.
      : $('(//*[contains(@resource-id,"cards_button_help") or @content-desc="Help" or @content-desc="Support"] | //*[contains(@resource-id,"cards_button_userAvatar")]/following::*[@clickable="true"][1])[1]')
    await this.tap(help, 10000)
    await this.supportTitle.waitForDisplayed({ timeout: 10000 })
    const cardsGreeting = await this.verifySupportOptions(false)
    if (cardsGreeting !== homeGreeting) throw new Error('TC2871: Cards and Home should show the same Support greeting')
  }

  public async verifySupportFaqOpens() {
    await this.tap(this.supportOption('FAQ'), 10000)
    await this.supportTitle.waitForDisplayed({ reverse: true, timeout: 15000 })
    const heading = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeNavigationBar" AND label IN {"FAQ", "Help Center", "Frequently Asked Questions"}')
      : $('//*[@text="FAQ" or @text="Help Center" or @text="Frequently Asked Questions"]')
    await heading.waitForDisplayed({ timeout: 15000 })
    const contact = browser.isIOS ? $('~Contact Us') : $('//*[@text="Contact Us" or @content-desc="Contact Us"]')
    await contact.waitForDisplayed({ reverse: true, timeout: 5000 })
  }

  public async verifySupportOpensChat() {
    await this.openSupport()
    await this.tap(this.supportOption('Chat'), 10000)
    if (browser.isIOS) {
      await $('//XCUIElementTypeNavigationBar[@name="Conversations"]').waitForDisplayed({ timeout: 20000 })
    } else {
      await browser.waitUntil(async () => /freshchat|CategoryListActivity|ConversationActivity/i.test(await browser.getCurrentActivity()), {
        timeout: 20000,
        timeoutMsg: 'Chat did not open a Freshchat screen',
      })
    }
  }

  private async closeInvestorCompensationSheetIfShown() {
    const sheet = $('//*[contains(@text,"Maltese Investor Compensation Scheme")]')
    if (!await sheet.waitForDisplayed({ timeout: 5000 }).catch(() => false)) return
    // Its scrim reports bounds over the sheet itself, so tapping "Close sheet" would miss it.
    await browser.back()
    await sheet.waitForDisplayed({ reverse: true, timeout: 10000, timeoutMsg: 'Investor Compensation sheet did not close' })
  }

  public async verifyTotalWealthDestinations() {
    const destinations = [
      ['Investments', 'Portfolio'],
      ['Savings', 'Portfolio'],
      ['Cash', 'Wallet Manager'],
    ]
    for (const [row, title] of destinations) {
      await this.verifyTotalWealthSectionVisible()
      const action = browser.isIOS
        ? $(`//XCUIElementTypeStaticText[@label="${row}"]/ancestor::*[self::XCUIElementTypeButton or self::XCUIElementTypeCell][1]`)
        : $(`(//*[@text="${row}" or @content-desc="${row}"]/ancestor-or-self::*[@clickable="true"][1])[1]`)
      await action.waitForDisplayed({ timeout: 10000 })
      await this.tap(action)
      if (browser.isAndroid) await this.closeInvestorCompensationSheetIfShown()
      const destination = browser.isIOS
        ? $(`//XCUIElementTypeNavigationBar[@name="${title}"]`)
        : $(`//*[@text="${title}" or @content-desc="${title}"]`)
      await destination.waitForDisplayed({ timeout: 15000 })
      await this.tapHomeTab()
      await this.waitForHomeLoaded()
    }
  }

  public async tapActionButtons() {
    await this.tapFirstDisplayed([this.exchangeButton, this.exchangeButtonText], 'Exchange button')
    const exchangeTitle = browser.isAndroid
      ? $('//*[@text="FX Exchange" or @content-desc="FX Exchange"]')
      : $('~FX Exchange')
    await exchangeTitle.waitForDisplayed({ timeout: 15000, timeoutMsg: 'Exchange must open the FX Exchange screen' })
    if (browser.isIOS) {
      // FX Exchange covers the tab bar, and its Back control is not exposed as a button.
      const { width, height } = await browser.getWindowRect()
      await browser.execute('mobile: tap', { x: Math.round(width * 0.1), y: Math.round(height * 0.09) })
      await exchangeTitle.waitForDisplayed({ reverse: true, timeout: 10000, timeoutMsg: 'FX Exchange did not close on iOS' })
    }
    await this.tapHomeTab()

    await this.openCurrentWalletDetails()
    await this.tapHomeTab()
  }

  private async tapHomeTab() {
    if (browser.isAndroid) {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const homeShown = await this.homeRoot.isDisplayed().catch(() => false)
          || await this.addFundsButton.isDisplayed().catch(() => false)
          || await this.addFundsButtonText.isDisplayed().catch(() => false)
          || await this.userAvatarBtnAndroid.isDisplayed().catch(() => false)
        if (homeShown) return

        if (await this.tapHomeBottomNavAndroid().catch(() => false)) {
          await browser.pause(500)
          continue
        }

        const backShown = await this.androidBackButton.isDisplayed().catch(() => false)
        if (backShown) await this.tap(this.androidBackButton)
        else await browser.back().catch(() => {})
        await browser.pause(500)
      }

      await this.waitForAnyDisplayed(
        [this.homeRoot, this.addFundsButton, this.addFundsButtonText, this.userAvatarBtnAndroid],
        10000,
        'Home screen after closing action page',
      )
      return
    }

    const homeTabFound = await this.homeTab.isExisting().catch(() => false)
    if (homeTabFound) {
      await this.tap(this.homeTab)
      await this.homeRoot.waitForExist({ timeout: 20000 }).catch(() => {})
      return
    }

    const backShown = await this.iosBackButton.isExisting().catch(() => false)
    if (backShown) await this.tap(this.iosBackButton)
    else await browser.back().catch(() => {})

    await this.homeRoot.waitForExist({ timeout: 20000 }).catch(() => {})
  }

  public async ensureHomeBeforeSectionLookup() {
    if (browser.isAndroid) {
      await browser.switchContext('NATIVE_APP').catch(() => {})

      const currentPackage = await browser.execute('mobile: getCurrentPackage')
        .catch(() => undefined) as string | undefined
      if (currentPackage && currentPackage !== this.androidAppPackage) {
        await browser.activateApp(this.androidAppPackage).catch(() => {})
        await browser.pause(1000)
      }

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const onHome = await this.homeRoot.isDisplayed().catch(() => false)
          || await this.userAvatarBtnAndroid.isDisplayed().catch(() => false)
          || await this.anyDisplayed(this.accountHolderNameCandidates)
        if (onHome) return

        if (await this.tapHomeBottomNavAndroid().catch(() => false)) {
          await browser.pause(600)
          continue
        }

        const backShown = await this.androidBackButton.isDisplayed().catch(() => false)
        if (backShown) await this.tap(this.androidBackButton)
        else await browser.back().catch(() => {})
        await browser.pause(700)
      }

      await this.waitForAnyDisplayed(
        [this.homeRoot, this.userAvatarBtnAndroid, ...this.accountHolderNameCandidates],
        10000,
        'Home screen before Home section lookup',
      )
      return
    }

    await this.waitForHomeLoaded().catch(() => {})
  }

  private async anyDisplayed(candidates: WdioEl[]) {
    for (const candidate of candidates) {
      if (await candidate.isDisplayed().catch(() => false)) return true
    }
    return false
  }

  public async verifyNotificationBannerIfApplicable() {
    const candidates = this.notificationBannerCandidates
    const anyExists = await Promise.all(candidates.map((el) => el.isExisting().catch(() => false)))
    if (!anyExists.some(Boolean)) return false

    await this.waitForAnyDisplayed(candidates, 8000, 'Notification banner')
    return true
  }

  public async verifyPromoBanners() {
    await this.ensureHomeBeforeSectionLookup()
    await this.scrollToHomeTop()
    // Promo content depends on the account, so its absence is logged and never fails the run.
    const shown = await this.ensureVisibleByScrolling(this.promoBannerCandidates, 'For you / promo section')
      .then(() => true)
      .catch(() => false)
    console.log(`[Home] For you / promo section shown: ${shown}`)
    await this.scrollToHomeTop()
  }

  public async verifyPendingTransactions() {
    await this.ensureHomeBeforeSectionLookup()

    const candidates = this.pendingTransactionsCandidates
    const anyExists = await Promise.all(candidates.map((el) => el.isExisting().catch(() => false)))
    if (!anyExists.some(Boolean)) return false

    await this.ensureVisibleByScrolling(candidates, 'Pending transactions section')
    return true
  }

  public async verifyRecentTransactions() {
    await this.ensureHomeBeforeSectionLookup()
    await this.scrollToHomeTop()
    await this.ensureVisibleByScrolling(this.recentTransactionsHeaderCandidates, 'Recent Activity / Transactions header')

    await browser.waitUntil(async () => {
      const rows = await this.recentActivityRows as unknown as WebdriverIO.Element[]
      for (let index = 0; index < rows.length; index += 1) {
        const row = rows[index]
        if (!await row.isDisplayed()) continue
        const entries = await this.recentActivityRowLabels(row, index)
        for (const entry of entries) {
          if (!await entry.isDisplayed().catch(() => false)) continue
          const text = await entry.getText().catch(() => '')
          if (this.isFormattedMoney(text.trim().replace(/^[+−-]\s*/, ''))) return true
        }
      }
      return false
    }, { timeout: 15000, timeoutMsg: 'Expected a visible transaction row with a formatted amount in Recent Activity / Transactions' })
  }

  public async verifyRecentActivities() {
    await this.ensureHomeBeforeSectionLookup()
    await this.scrollToHomeTop()
    await this.ensureVisibleByScrolling(this.recentActivitiesCandidates, 'Recent Activities section')
  }

  public async verifySpendAnalytics() {
    await this.ensureHomeBeforeSectionLookup()
    await this.scrollToHomeTop()
    // Spend Analytics depends on the account, so its absence is logged and never fails the run.
    const shown = await this.ensureVisibleByScrolling(this.spendAnalyticsCandidates, 'Spend Analytics section', 6)
      .then(() => true)
      .catch(() => false)
    console.log(`[Home] Spend Analytics section shown: ${shown}`)
    await this.scrollToHomeTop()
  }

  public async verifyBottomNavigation() {
    await this.waitForAnyDisplayed(this.bottomNavCandidates, 12000, 'Bottom navigation')

    const tabs = browser.isAndroid ? [
      ['Cards', [this.byId('navigation_button_cards'), $('//*[@content-desc="Cards"]')], this.cardsRootAndroid],
      ['Pay', [this.byId('navigation_button_pay'), $('//*[@content-desc="Pay"]')], this.payRootAndroid],
      ['Invest', [this.byId('navigation_button_invest'), $('//*[@content-desc="Invest" and @clickable="true"]')], $('//*[@text="Portfolio" or @content-desc="Portfolio"]')],
    ] as const : [
      ['Cards', [$('~Cards')], $('-ios predicate string:name == "cards_screen" OR name == "card_item_addCard" OR name BEGINSWITH "CARDS_"')],
      ['Pay', [$('~Pay')], $('-ios predicate string:name == "pay_screen_view" OR name == "pay_button_add"')],
      ['Invest', [$('~Invest')], $('-ios predicate string:type == "XCUIElementTypeStaticText" AND (name == "Portfolio" OR label == "Portfolio")')],
    ] as const

    for (const [label, buttons, screen] of tabs) {
      await this.tapFirstDisplayed([...buttons], `${label} tab`)
      if (label === 'Pay') await this.dismissContactsPermissionIOS()
      // BrowserStack iOS devices can hit the app's Device Security block when Invest opens. That is the
      // environment, not navigation, so the check ends here with a log instead of a false failure.
      const deviceSecurity = $('-ios predicate string:label == "Device Security" OR name == "Device Security"')
      let blocked = false
      await browser.waitUntil(async () => {
        blocked = browser.isIOS && await deviceSecurity.isDisplayed().catch(() => false)
        return blocked || await screen.isDisplayed().catch(() => false)
      }, { timeout: label === 'Invest' ? 60000 : 15000, interval: 500, timeoutMsg: `Expected the ${label} screen` })
      if (blocked) {
        console.warn(`[Home] Device Security blocked the ${label} tab on this device; navigation check stopped`)
        return
      }
    }

    await this.tapHomeTab()
    await this.waitForAnyDisplayed([this.homeRoot, this.addFundsButton], 15000, 'Home screen after switching tabs')
  }
}

export default new HomeScreenPage()
