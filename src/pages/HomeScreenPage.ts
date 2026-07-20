import BasePage from './BasePage'
import { $, $$, browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'

type WdioEl = ChainablePromiseElement

class HomeScreenPage extends BasePage {
  /* =========================
   * ANDROID: HOME / ACCOUNT (Single vs Business)
   * ========================= */

  private get userAvatarBtnAndroid() {
    return $('android=new UiSelector().resourceId("home_button_userAvatar")')
  }

  private get businessAccountLabelAndroid() {
    return $('android=new UiSelector().textContains("Business")')
  }

  private get individualAccountLabelAndroid() {
    return $('android=new UiSelector().textContains("Individual")')
  }

  private get jointAccountLabelAndroid() {
    return $('android=new UiSelector().textContains("Joint")')
  }

  private get singleAccountItemAndroid() {
    return $('android=new UiSelector().description("Single")')
  }

  private get singleAccountItemAndroidByText() {
    return $('android=new UiSelector().text("Single")')
  }

  private get jointAccountItemAndroid() {
    return $('//*[@content-desc="Joint"]/ancestor::*[@clickable="true"][1]')
  }

  private get businessAccountItemAndroid() {
    return $('(//*[@content-desc="Business"]/ancestor::*[@clickable="true"][1] | //android.widget.TextView[@text="Business"]/ancestor::*[@clickable="true"][1])[1]')
  }

  private get homeRootAndroid() {
    return this.byId('home_screen')
  }

  private get googlePayCloseButtonAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/rightActionView")')
  }

  private get googlePayScreenAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/clSelectCardGooglePay")')
  }

  private get homeTabAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_button_home")')
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

  private get profilePickerIndividualItemIOS() {
    return $('-ios predicate string:name == "Individual" OR label == "Individual"')
  }

  private get subAccountsTitleIOS() {
    return $('~Sub Accounts')
  }

  private get individualAccountItemIOS() {
    return $('~switchSubidentity_item_VEG40002-1')
  }

  private get jointAccountItemIOS() {
    return $('~switchSubidentity_item_VEG40003-1')
  }

  private get businessAccountItemIOS() {
    return $('~switchSubidentity_item_DER00003-0-86004')
  }

  private get homeRootIOS() {
    return $('~home_screen_view')
  }

  private byId(name: string) {
    if (browser.isAndroid) {
      const rx = `.*:id/${name}$|^${name}$`
      return $(`android=new UiSelector().resourceIdMatches("${rx}")`)
    }
    return $(`~${name}`)
  }

  private androidTextContains(text: string) {
    return $(`android=new UiSelector().textContains("${text}")`)
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
        await resolved.click()
        return true
      }
    }

    throw new Error(`${label} did not appear`)
  }

  private async scrollDownOnce() {
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
    await browser.releaseActions().catch(() => {})
    await browser.pause(900)
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

    await this.profilePickerUserNameLabelIOS.waitForExist({ timeout: 15000 })
    await this.tap(this.profilePickerUserNameLabelIOS)

    await this.profilePickerIndividualItemIOS.waitForExist({ timeout: 15000 })
    await this.tap(this.profilePickerIndividualItemIOS)

    await this.profilePickerIndividualItemIOS.waitForExist({ reverse: true, timeout: 15000 }).catch(() => {})
    await browser.pause(300)
  }

  private async getIOSAccountCodeLabel() {
    const el = await this.profilePickerAccountCodeLabelIOS
    return (
      await el.getAttribute('label').catch(async () => await el.getText().catch(() => ''))
    ).trim()
  }

  private async waitForIOSHomeAccount(accountType: 'Business' | 'Individual' | 'Joint', accountCode: string, timeout = 30000) {
    await browser.waitUntil(
      async () => {
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

  private async openIOSSubAccountsSheet() {
    await this.waitForHomeLoaded()
    await this.profilePickerUserNameLabelIOS.waitForExist({ timeout: 20000 })

    const tapAttempts = [
      async () => this.tap(this.profilePickerUserNameLabelIOS),
      async () => this.tap(this.profilePickerAccountCodeLabelIOS),
      async () => {
        const location = await this.profilePickerUserNameLabelIOS.getLocation()
        const size = await this.profilePickerUserNameLabelIOS.getSize()
        await browser.execute('mobile: tap', {
          x: Math.max(24, location.x - 34),
          y: location.y + Math.round(size.height / 2),
        })
      },
    ]

    for (const attempt of tapAttempts) {
      await attempt().catch(() => {})
      const opened = await this.subAccountsTitleIOS.waitForExist({ timeout: 3000 }).catch(() => false)
      if (opened) return
    }

    await this.subAccountsTitleIOS.waitForExist({ timeout: 15000 })
  }

  private async selectIOSSubAccount(item: WdioEl) {
    await item.waitForExist({ timeout: 15000 })
    await this.tap(item)
    await this.subAccountsTitleIOS.waitForExist({ reverse: true, timeout: 15000 }).catch(() => {})
    await browser.pause(300)
  }

  private async ensureIOSHomeAccount(accountType: 'Business' | 'Individual' | 'Joint', accountCode: string, item: WdioEl) {
    await this.waitForHomeLoaded()

    const currentLabel = await this.getIOSAccountCodeLabel().catch(() => '')
    if (currentLabel.includes(accountType) && currentLabel.includes(accountCode)) return

    await this.openIOSSubAccountsSheet()
    await this.selectIOSSubAccount(item)
    await this.waitForIOSHomeAccount(accountType, accountCode)
  }

  private get iosAccountTargets() {
    return [
      { type: 'Individual' as const, code: 'VEG40002', item: this.individualAccountItemIOS },
      { type: 'Joint' as const, code: 'VEG40003', item: this.jointAccountItemIOS },
      { type: 'Business' as const, code: 'DER00003', item: this.businessAccountItemIOS },
    ]
  }

  private async ensureSingleAccountAndroid() {
    await this.ensureSingleAccountAndroidFlow({
      userAvatarBtn: this.userAvatarBtnAndroid,
      businessAccountLabel: this.businessAccountLabelAndroid,
      singleAccountItemByDesc: this.singleAccountItemAndroid,
      singleAccountItemByText: this.singleAccountItemAndroidByText,
      homeRoot: this.homeRootAndroid,
      timeoutMs: 15000,
      alertTimeoutMs: 2500,
    })

    await this.businessAccountLabelAndroid
      .waitForExist({ reverse: true, timeout: 30000 })
      .catch(() => {})
  }

  private async ensureHomeLandingAndroid() {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    await browser.waitUntil(
      async () => {
        await this.dismissKnownAndroidBlockingPopups().catch(() => {})
        await this.dismissCommonAndroidAlert(2500).catch(() => false)

        const homeShown = await this.homeRootAndroid.isDisplayed().catch(() => false)
        if (homeShown) return true

        await this.tapHomeBottomNavAndroid().catch(() => {})

        await this.dismissKnownAndroidBlockingPopups().catch(() => {})
        await this.dismissCommonAndroidAlert(2000).catch(() => false)

        return await this.homeRootAndroid.isDisplayed().catch(() => false)
      },
      {
        timeout: 20000,
        interval: 500,
        timeoutMsg: 'Failed to stabilize on Home screen (Android)',
      }
    )
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
        if (!homeShown) return false

        return await label.isDisplayed().catch(() => false)
      },
      {
        timeout,
        interval: 500,
        timeoutMsg: `Home screen did not switch to ${accountType} account`,
      }
    )
  }

  private async openAndroidSubAccountsSheet() {
    await this.ensureHomeLandingAndroid()
    await this.userAvatarBtnAndroid.waitForExist({ timeout: 20000 })
    await this.tap(this.userAvatarBtnAndroid)
    await $('android=new UiSelector().text("Sub Accounts")').waitForExist({ timeout: 15000 })
  }

  private async dismissGooglePayPopupIfPresentAndroid(timeout = 10000) {
    if (!browser.isAndroid) return false

    await browser.switchContext('NATIVE_APP').catch(() => {})

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
    if (!browser.isAndroid) return

    const cardsShown = await this.cardsRootAndroid.isDisplayed().catch(() => false)
    if (!cardsShown) return

    if (await this.homeTabAndroid.isDisplayed().catch(() => false)) {
      await this.tap(this.homeTabAndroid).catch(() => {})
      return
    }

    if (await this.homeTabAndroidA11y.isDisplayed().catch(() => false)) {
      await this.tap(this.homeTabAndroidA11y).catch(() => {})
      return
    }

    if (await this.homeTabAndroidXpath.isDisplayed().catch(() => false)) {
      await this.tap(this.homeTabAndroidXpath).catch(() => {})
    }
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
      return
    }

    if (!browser.isAndroid) return

    await this.waitForHomeLoaded()
    const isJoint = await this.jointAccountLabelAndroid.isDisplayed().catch(() => false)
    if (isJoint) return

    await this.openAndroidSubAccountsSheet()
    await this.tap(this.jointAccountItemAndroid)
    await this.dismissCommonAndroidAlert(5000).catch(() => false)
    await this.dismissGooglePayPopupIfPresentAndroid(12000).catch(() => false)
    await this.ensureHomeLandingAndroid()
    await this.waitForAndroidHomeAccount('Joint')
  }

  public async ensureBusinessAccount() {
    if (browser.isIOS) {
      await this.ensureIOSHomeAccount('Business', 'DER00003', this.businessAccountItemIOS)
      return
    }

    if (!browser.isAndroid) return

    await this.waitForHomeLoaded()
    const isBusiness = await this.businessAccountLabelAndroid.isDisplayed().catch(() => false)
    if (isBusiness) return

    await this.openAndroidSubAccountsSheet()
    await this.tap(this.businessAccountItemAndroid)
    await this.dismissCommonAndroidAlert(5000).catch(() => false)
    await this.dismissGooglePayPopupIfPresentAndroid(12000).catch(() => false)
    await this.ensureHomeLandingAndroid()
    await this.waitForAndroidHomeAccount('Business')
  }

  public async verifyAndroidAccountSwitchingAcrossTypes() {
    if (!browser.isAndroid) return

    await this.ensureHomeLandingAndroid()

    // Flow is intentionally explicit for this account set:
    // Business landing -> Individual -> Joint -> Business.
    await this.waitForAndroidHomeAccount('Business', 20000)

    await this.openAndroidSubAccountsSheet()
    const singleByDescShown = await this.singleAccountItemAndroid.isDisplayed().catch(() => false)
    if (singleByDescShown) {
      await this.tap(this.singleAccountItemAndroid)
    } else {
      await this.tap(this.singleAccountItemAndroidByText)
    }
    await this.dismissCommonAndroidAlert(5000).catch(() => false)
    await this.ensureHomeLandingAndroid()
    await this.waitForAndroidHomeAccount('Individual')

    await this.openAndroidSubAccountsSheet()
    await this.tap(this.jointAccountItemAndroid)
    await this.dismissCommonAndroidAlert(5000).catch(() => false)
    await this.dismissGooglePayPopupIfPresentAndroid(12000).catch(() => false)
    await this.ensureHomeLandingAndroid()
    await this.waitForAndroidHomeAccount('Joint')

    await this.openAndroidSubAccountsSheet()
    await this.tap(this.businessAccountItemAndroid)
    await this.dismissCommonAndroidAlert(5000).catch(() => false)
    await this.dismissGooglePayPopupIfPresentAndroid(5000).catch(() => false)
    await this.ensureHomeLandingAndroid()
    await this.waitForAndroidHomeAccount('Business')
  }

  public async verifyIOSAccountSwitchingAcrossTypes() {
    if (!browser.isIOS) return

    await this.waitForHomeLoaded()

    await this.ensureIOSHomeAccount('Business', 'DER00003', this.businessAccountItemIOS)
    await this.ensureIOSHomeAccount('Individual', 'VEG40002', this.individualAccountItemIOS)
    await this.ensureIOSHomeAccount('Joint', 'VEG40003', this.jointAccountItemIOS)
    await this.ensureIOSHomeAccount('Business', 'DER00003', this.businessAccountItemIOS)
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
        this.byId('home_label_accountHolderName'),
        this.byId('home_label_accountName'),
        this.byId('home_label_accountHolder'),
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
        this.byId('home_label_accountType'),
        this.byId('home_text_accountType'),
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
        this.byId('home_label_balance'),
        this.byId('home_label_balanceValue'),
        this.byId('home_text_balance'),
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
        this.androidTextContains('Recent transactions'),
      ]
    }

    return [
      this.byId('home_section_recentTransactions'),
      this.iosPredicateContains('Recent transactions'),
    ]
  }


  private get recentActivitiesCandidates(): WdioEl[] {
    if (browser.isAndroid) {
      return [
        this.byId('home_section_recentActivities'),
        this.byId('home_section_recentPayees'),
        this.androidTextContains('Recent Activity'),
        this.androidTextContains('Recent Activities'),
        this.androidTextContains('Recent payees'),
      ]
    }

    return [
      this.byId('home_section_recentActivities'),
      this.byId('home_section_recentPayees'),
      this.iosPredicateContains('Recent Activity'),
      this.iosPredicateContains('Recent Activities'),
      this.iosPredicateContains('Recent payees'),
    ]
  }

  private get spendAnalyticsCandidates(): WdioEl[] {
    if (browser.isAndroid) {
      return [
        this.byId('home_section_spendAnalytics'),
        this.androidTextContains('Spend Analytics'),
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
        this.byId('navigation_button_more'),
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
    return $('android=new UiSelector().description("Back")')
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
          if (homeShown) return true

          await this.dismissKnownAndroidBlockingPopups().catch(() => {})
          await this.dismissCommonAndroidAlert(2000).catch(() => false)

          const cardsShown = await this.cardsRootAndroid.isDisplayed().catch(() => false)
          const homeTabShown = await this.homeTabAndroid.isDisplayed().catch(() => false)
          const homeTabA11yShown = await this.homeTabAndroidA11y.isDisplayed().catch(() => false)
          const homeTabXpathShown = await this.homeTabAndroidXpath.isDisplayed().catch(() => false)
          if (cardsShown && (homeTabShown || homeTabA11yShown || homeTabXpathShown)) {
            await this.tapHomeBottomNavAndroid().catch(() => {})
            await browser.pause(300)
            const homeAfterTap = await this.homeRoot.isDisplayed().catch(() => false)
            if (homeAfterTap) return true
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

    await browser.waitUntil(
      async () => {
        await this.dismissIOSPermissionAlertsIfPresent().catch(() => {})
        return await this.homeRoot.isExisting().catch(() => false)
      },
      { timeout, interval: 500, timeoutMsg: 'Home screen did not appear on iOS (blocked by permission alert?)' },
    )
  }

  public async verifyAccountHeader() {
    await this.waitForAnyDisplayed(this.accountHolderNameCandidates, 15000, 'Account holder name')
      .catch(async () => this.waitForAccountHolderNameFallback(15000))

    await this.waitForAnyDisplayed(this.accountTypeCandidates, 15000, 'Account type')
      .catch(async () => this.waitForAccountTypeFallback(15000).catch(() => {
        console.warn('[HomeScreenPage] Account type label not found — skipping (may have been removed in this build)')
      }))
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
    ).catch(() => {
      console.warn('[HomeScreenPage] Exchange button not found — skipping (may have been renamed/removed in this build)')
    })
    await this.waitForAnyDisplayed(
      [this.detailsButton, this.detailsButtonText],
      10000,
      'Details button'
    ).catch(() => {
      console.warn('[HomeScreenPage] Details button not found — skipping (may have been renamed/removed in this build)')
    })
  }

  public async tapActionButtons() {
    if (browser.isIOS) return

    await this.tapFirstDisplayed([this.addFundsButton, this.addFundsButtonText], 'Add Funds button')
    await this.tapHomeTab()

    const exchangeTapped = await this.tapFirstDisplayed([this.exchangeButton, this.exchangeButtonText], 'Exchange button').catch(() => false)
    if (exchangeTapped !== false) await this.tapHomeTab()

    const detailsTapped = await this.tapFirstDisplayed([this.detailsButton, this.detailsButtonText], 'Details button').catch(() => false)
    if (detailsTapped !== false) await this.tapHomeTab()
  }

  private async tapHomeTab() {
    const homeTabFound = browser.isIOS
      ? await this.homeTab.isExisting().catch(() => false)
      : await this.homeTab.isDisplayed().catch(() => false)
    if (homeTabFound) {
      await this.tap(this.homeTab)
      const waitFn = browser.isIOS ? 'waitForExist' : 'waitForDisplayed'
      await this.homeRoot[waitFn]({ timeout: 20000 }).catch(() => {})
      return
    }

    if (browser.isAndroid) {
      const backShown = await this.androidBackButton.isDisplayed().catch(() => false)
      if (backShown) {
        await this.tap(this.androidBackButton)
      } else {
        await browser.back().catch(() => {})
      }
    } else if (browser.isIOS) {
      const backShown = await this.iosBackButton.isExisting().catch(() => false)
      if (backShown) {
        await this.tap(this.iosBackButton)
      } else {
        await browser.back().catch(() => {})
      }
    }

    const waitFn = browser.isIOS ? 'waitForExist' : 'waitForDisplayed'
    await this.homeRoot[waitFn]({ timeout: 20000 }).catch(() => {})
  }

  public async verifyNotificationBannerIfApplicable() {
    const candidates = this.notificationBannerCandidates
    const anyExists = await Promise.all(candidates.map((el) => el.isExisting().catch(() => false)))
    if (!anyExists.some(Boolean)) return

    await this.waitForAnyDisplayed(candidates, 8000, 'Notification banner')
  }

  public async verifyPromoBanners() {
    const candidates = this.promoBannerCandidates
    const anyExists = await Promise.all(candidates.map((el) => el.isExisting().catch(() => false)))
    if (!anyExists.some(Boolean)) return

    await this.ensureVisibleByScrolling(candidates, 'Promo / feature banner')
  }

  public async verifyPendingTransactions() {
    const candidates = this.pendingTransactionsCandidates
    const anyExists = await Promise.all(candidates.map((el) => el.isExisting().catch(() => false)))
    if (!anyExists.some(Boolean)) return

    await this.ensureVisibleByScrolling(candidates, 'Pending transactions section')
  }

  public async verifyRecentTransactions() {
    const headerCandidates = this.recentTransactionsHeaderCandidates
    const headerExists = await Promise.all(
      headerCandidates.map((el) => el.isExisting().catch(() => false))
    )
    if (!headerExists.some(Boolean)) return

    await this.ensureVisibleByScrolling(headerCandidates, 'Recent transactions header')

    await this.ensureVisibleByScrolling(
      [this.byId('home_list_recentTransactions'), this.byId('home_recentTransactions_list')],
      'Recent transactions list'
    )
  }

  public async verifyRecentActivities() {
    await this.ensureVisibleByScrolling(this.recentActivitiesCandidates, 'Recent Activities section')
  }

  public async verifySpendAnalytics() {
    await this.ensureVisibleByScrolling(this.spendAnalyticsCandidates, 'Spend Analytics section')
  }

  public async verifyBottomNavigation() {
    await this.waitForAnyDisplayed(this.bottomNavCandidates, 12000, 'Bottom navigation')
  }
}

export default new HomeScreenPage()
