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

  private get singleAccountItemAndroid() {
    return $('android=new UiSelector().description("Single")')
  }

  private get singleAccountItemAndroidByText() {
    return $('android=new UiSelector().text("Single")')
  }

  private get alertBtn3Android() {
    return $('android=new UiSelector().resourceId("android:id/button3")')
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
          if (await resolved.isDisplayed().catch(() => false)) return true
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
      const visible = await resolved.isDisplayed().catch(() => false)
      if (visible) {
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
    await browser.releaseActions()
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

    await this.profilePickerUserNameLabelIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.profilePickerUserNameLabelIOS)

    await this.profilePickerIndividualItemIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.profilePickerIndividualItemIOS)

    await this.profilePickerIndividualItemIOS.waitForDisplayed({ reverse: true, timeout: 15000 }).catch(() => {})
    await browser.pause(300)
  }

  private async ensureSingleAccountAndroid() {
    const isBusiness = await this.businessAccountLabelAndroid.isDisplayed().catch(() => false)
    if (!isBusiness) return

    await this.userAvatarBtnAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.userAvatarBtnAndroid)

    if (await this.singleAccountItemAndroid.isDisplayed().catch(() => false)) {
      await this.tap(this.singleAccountItemAndroid)
    } else {
      await this.tap(this.singleAccountItemAndroidByText).catch(() => {})
    }

    await this.alertBtn3Android.waitForDisplayed({ timeout: 7000 }).catch(() => {})
    await this.tap(this.alertBtn3Android).catch(() => {})
    await this.homeRootAndroid.waitForDisplayed({ timeout: 30000 }).catch(() => {})
    await this.businessAccountLabelAndroid
      .waitForDisplayed({ reverse: true, timeout: 30000 })
      .catch(() => {})
  }

  public async ensureIndividualAccount() {
    if (browser.isIOS) {
      await this.ensureIndividualAccountIOS()
      return
    }

    if (browser.isAndroid) {
      await this.ensureSingleAccountAndroid()
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

  private async getRecentTransactionsItems(): Promise<WebdriverIO.ElementArray> {
    if (browser.isAndroid) {
      return (await $$('android=new UiSelector().resourceIdMatches(".*:id/home_recentTransactions_item.*|.*:id/recentTransactions_item.*")')) as unknown as WebdriverIO.ElementArray
    }

    return (await $$('~home_recentTransactions_item')) as unknown as WebdriverIO.ElementArray
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

          const alertShown = await this.alertBtn3Android.isDisplayed().catch(() => false)
          if (alertShown) {
            await this.tap(this.alertBtn3Android).catch(() => {})
            await this.alertBtn3Android.waitForDisplayed({ reverse: true, timeout: 7000 }).catch(() => {})
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

  public async verifyAccountHeader() {
    await this.waitForAnyDisplayed(this.accountHolderNameCandidates, 15000, 'Account holder name')
      .catch(async () => this.waitForAccountHolderNameFallback(15000))

    await this.waitForAnyDisplayed(this.accountTypeCandidates, 15000, 'Account type')
      .catch(async () => this.waitForAccountTypeFallback(15000))
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

  public async tapActionButtons() {
    await this.tapFirstDisplayed([this.addFundsButton, this.addFundsButtonText], 'Add Funds button')
    await this.tapHomeTab()

    await this.tapFirstDisplayed([this.exchangeButton, this.exchangeButtonText], 'Exchange button')
    await this.tapHomeTab()

    await this.tapFirstDisplayed([this.detailsButton, this.detailsButtonText], 'Details button')
    await this.tapHomeTab()
  }

  private async tapHomeTab() {
    const homeTabShown = await this.homeTab.isDisplayed().catch(() => false)
    if (homeTabShown) {
      await this.tap(this.homeTab)
      await this.homeRoot.waitForDisplayed({ timeout: 20000 }).catch(() => {})
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
      const backShown = await this.iosBackButton.isDisplayed().catch(() => false)
      if (backShown) {
        await this.tap(this.iosBackButton)
      } else {
        await browser.back().catch(() => {})
      }
    }

    await this.homeRoot.waitForDisplayed({ timeout: 20000 }).catch(() => {})
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

    const items = await this.getRecentTransactionsItems()
    const itemsArray = Array.from(items) as WebdriverIO.Element[]
    if (itemsArray.length > 0) {
      await this.ensureVisibleByScrolling(itemsArray, 'Recent transactions list')
      return
    }

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
