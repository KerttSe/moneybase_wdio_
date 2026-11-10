import type { ChainablePromiseElement } from 'webdriverio'
import { $, browser } from '@wdio/globals'
import { AUTH, ELITE_INDIVIDUAL_CODE } from '../data/credentials'

type WdioEl = ChainablePromiseElement
type ResolvableWdioEl = WdioEl | WebdriverIO.Element | Promise<WdioEl | WebdriverIO.Element>

type EnsureSingleAccountAndroidParams = {
  userAvatarBtn: WdioEl
  businessAccountLabel: WdioEl
  singleAccountItemByDesc: WdioEl
  singleAccountItemByText: WdioEl
  alertBtn3?: WdioEl
  homeRoot?: WdioEl
  timeoutMs?: number
  alertTimeoutMs?: number
}

export default class BasePage {
  private byIdRx(name: string) {
    if (browser.isAndroid) {
      return $(`(//*[@resource-id="com.moneybase.qa:id/${name}"] | //*[@resource-id="${name}"] | //*[contains(@resource-id,"${name}")] | //*[@content-desc="${name}"])[1]`)
    }
    return $(`~${name}`)
  }

  private get androidAlertBtn3() {
    return $('(//*[@resource-id="android:id/button3"] | //*[contains(@resource-id,"button3")])[1]')
  }

  private get androidAlertBtn3ById() {
    return $('id=android:id/button3')
  }

  private get androidAlertBtn3ByText() {
    return $('//*[@text="OK" or @content-desc="OK"]')
  }


  private get androidSomethingWentWrongTitle() {
    return $('(//*[contains(@resource-id,"alertTitle") and (@text="Something went wrong" or @content-desc="Something went wrong")] | //*[contains(@text,"Something went wrong") or contains(@content-desc,"Something went wrong")])[1]')
  }

  private get androidAlertTitle() {
    return $('(//*[@resource-id="com.moneybase.qa:id/alertTitle"] | //*[contains(@resource-id,"alertTitle")])[1]')
  }

  private get androidTierGreetingClose() {
    return this.byIdRx('tierGreeting_button_close')
  }

  private get androidTierGreetingScreen() {
    return this.byIdRx('tierGreeting_screen')
  }

  private get androidGooglePayNotNow() {
    return $('//*[@text="Not Now" or @content-desc="Not Now"]')
  }

  private get androidGooglePayScreen() {
    return $('(//*[@resource-id="com.moneybase.qa:id/clSelectCardGooglePay"] | //*[contains(@resource-id,"clSelectCardGooglePay")])[1]')
  }

  private get androidGooglePayCloseBtn() {
    return $('(//*[@resource-id="com.moneybase.qa:id/rightActionView"] | //*[contains(@resource-id,"rightActionView")])[1]')
  }

  private get androidMoreMenuMovedTooltipTitle() {
    return $('//*[@text="More menu has been moved" or @content-desc="More menu has been moved"]')
  }

  private get androidMoreMenuMovedTooltipDismiss() {
    return $('//android.widget.TextView[@text="Dismiss"]/ancestor::*[@clickable="true"][1]')
  }

  private get androidMoreMenuMovedTooltipDismissText() {
    return $('//*[@text="Dismiss" or @content-desc="Dismiss"]')
  }

  private get androidDeviceNotSyncedTitle() {
    return $('//*[@text="Device Not Synced" or @content-desc="Device Not Synced"]')
  }

  private get androidDeviceNotSyncedOkButton() {
    return $('//android.widget.TextView[@text="OK"]/ancestor::*[@clickable="true"][1]')
  }

  private get androidVerificationSuccessContinueBtn() {
    return this.byIdRx('verificationSuccess_button_continue')
  }

  private get androidVerificationSuccessScreen() {
    return this.byIdRx('verificationSuccess_screen')
  }

  private get androidHomeTab() {
    return $('(//*[@resource-id="com.moneybase.qa:id/navigation_button_home"] | //*[contains(@resource-id,"navigation_button_home")] | //*[@content-desc="Home" and @clickable="true"])[1]')
  }

  private get androidHomeTabA11y() {
    return $('~Home')
  }

  private get androidHomeTabXpath() {
    return $('//android.widget.FrameLayout[@content-desc="Home"]')
  }

  private get androidCardsRoot() {
    return this.byIdRx('cards_screen')
  }

  private get androidPayRoot() {
    return this.byIdRx('pay_screen')
  }

  private get androidMoreRoot() {
    return this.byIdRx('more_screen')
  }

  private get androidProfileMoreEntry() {
    return $('(//*[contains(@resource-id,"home_button_userAvatar") or contains(@resource-id,"cards_button_userAvatar") or @content-desc="home_button_userAvatar" or @content-desc="cards_button_userAvatar"])[1]')
  }

  private get androidAdministrationEntry() {
    return $('(//*[contains(@content-desc,"Administration")] | //android.widget.TextView[@text="Administration"])[1]')
  }

  private get androidAccountSelectionRoot() {
    return this.byIdRx('accountSelection_screen')
  }

  private get androidMoreCloseButton() {
    return $('(//*[contains(@resource-id,"more_screen")]//*[@content-desc="Close"]/ancestor::*[@clickable="true"][1])[1]')
  }

  private get androidDrawerLogoutItem() {
    return $('//*[@text="Log out" or @content-desc="Log out"]')
  }

  private get androidDrawerSettingsItem() {
    return $('//*[@text="Settings" or @content-desc="Settings"]')
  }

  private get androidDrawerWalletsItem() {
    return $('//*[@text="Wallets" or @content-desc="Wallets"]')
  }

  private async normalizeHomeAfterGooglePayDismiss() {
    if (!browser.isAndroid) return

    const cardsShown = await this.androidCardsRoot.isDisplayed().catch(() => false)
    const payShown = await this.androidPayRoot.isDisplayed().catch(() => false)
    if (!(cardsShown || payShown)) return

    if (await this.androidHomeTab.isDisplayed().catch(() => false)) {
      await this.androidHomeTab.click().catch(() => {})
    } else if (await this.androidHomeTabA11y.isDisplayed().catch(() => false)) {
      await this.androidHomeTabA11y.click().catch(() => {})
    } else if (await this.androidHomeTabXpath.isDisplayed().catch(() => false)) {
      await this.androidHomeTabXpath.click().catch(() => {})
    }

    await browser.pause(300)
  }

  protected async tapAndroidCenterPoint(element: WdioEl | WebdriverIO.Element, pointerId = 'finger-android-center-tap') {
    const target = (await element) as WebdriverIO.Element
    const location = await target.getLocation()
    const size = await target.getSize()
    const x = Math.round(location.x + size.width / 2)
    const y = Math.round(location.y + size.height / 2)

    await browser.execute('mobile: clickGesture', { x, y }).catch(async () => {
      await browser.performActions([
        {
          type: 'pointer',
          id: pointerId,
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x, y },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 80 },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])
      await browser.releaseActions().catch(() => {})
    })
  }

  private async dismissAndroidTooltipTextIfVisible() {
    const dismissTextShown = await this.androidMoreMenuMovedTooltipDismissText.isDisplayed().catch(() => false)
    if (!dismissTextShown) return false

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const clickableDismissShown = await this.androidMoreMenuMovedTooltipDismiss.isDisplayed().catch(() => false)
      if (clickableDismissShown) {
        await this.androidMoreMenuMovedTooltipDismiss.click().catch(() => {})
      } else {
        await this.tapAndroidCenterPoint(this.androidMoreMenuMovedTooltipDismissText, 'finger-more-menu-tooltip-dismiss')
      }

      const gone = await this.androidMoreMenuMovedTooltipDismissText
        .waitForDisplayed({ reverse: true, timeout: 7000 })
        .then(() => true)
        .catch(() => false)
      if (gone) {
        await browser.pause(300)
        return true
      }
    }

    return false
  }

  protected async tapAndroidVerificationSuccessContinueIfVisible() {
    if (!browser.isAndroid) return false

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const continueShown = await this.androidVerificationSuccessContinueBtn.isDisplayed().catch(() => false)
    const successShown = await this.androidVerificationSuccessScreen.isDisplayed().catch(() => false)
    if (!continueShown && !successShown) return false

    if (continueShown) {
      await this.androidVerificationSuccessContinueBtn.click().catch(async () => {
        const location = await this.androidVerificationSuccessContinueBtn.getLocation()
        const size = await this.androidVerificationSuccessContinueBtn.getSize()
        await browser.performActions([
          {
            type: 'pointer',
            id: 'finger-verification-success-continue',
            parameters: { pointerType: 'touch' },
            actions: [
              {
                type: 'pointerMove',
                duration: 0,
                x: Math.round(location.x + size.width / 2),
                y: Math.round(location.y + size.height / 2),
              },
              { type: 'pointerDown', button: 0 },
              { type: 'pause', duration: 80 },
              { type: 'pointerUp', button: 0 },
            ],
          },
        ])
        await browser.releaseActions().catch(() => {})
      })
    } else {
      const { width, height } = await browser.getWindowRect()
      await browser.performActions([
        {
          type: 'pointer',
          id: 'finger-verification-success-fallback',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: Math.round(width * 0.5), y: Math.round(height * 0.9) },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 80 },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])
      await browser.releaseActions().catch(() => {})
    }

    await browser.pause(800)
    return true
  }

  private async dismissKnownAndroidBlockingPopupOnce() {
    if (!browser.isAndroid) return false

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const currentActivity = await browser.getCurrentActivity().catch(() => '')
    const isFreshchatActivity = /freshchat|CategoryListActivity|ConversationActivity/i.test(currentActivity)
    if (isFreshchatActivity) {
      await browser.back().catch(() => {})
      await browser.pause(500)
      return true
    }

    const continuedFromVerificationSuccess = await this.tapAndroidVerificationSuccessContinueIfVisible()
    if (continuedFromVerificationSuccess) return true

    if (AUTH.individualAccountCode === ELITE_INDIVIDUAL_CODE
      && await this.androidTierGreetingClose.isDisplayed().catch(() => false)) {
      await this.tapAndroidCenterPoint(this.androidTierGreetingClose)
      await this.androidTierGreetingScreen.waitForDisplayed({ reverse: true, timeout: 7000 }).catch(() => {})
      return true
    }

    const gpayFullScreenShown = await this.androidGooglePayScreen.isDisplayed().catch(() => false)
    if (gpayFullScreenShown) {
      const closeShown = await this.androidGooglePayCloseBtn.isDisplayed().catch(() => false)
      if (closeShown) {
        await this.androidGooglePayCloseBtn.click().catch(() => {})
        await this.androidGooglePayScreen.waitForDisplayed({ reverse: true, timeout: 7000 }).catch(() => {})
        await this.normalizeHomeAfterGooglePayDismiss().catch(() => {})
        return true
      }
      return false
    }

    const notNowShown = await this.androidGooglePayNotNow.isDisplayed().catch(() => false)
    if (notNowShown) {
      await this.androidGooglePayNotNow.click().catch(() => {})
      await this.androidGooglePayNotNow.waitForDisplayed({ reverse: true, timeout: 7000 }).catch(() => {})
      await this.normalizeHomeAfterGooglePayDismiss().catch(() => {})
      return true
    }

    const dismissedTooltipText = await this.dismissAndroidTooltipTextIfVisible()
    if (dismissedTooltipText) return true

    const moreMenuTooltipShown = await this.androidMoreMenuMovedTooltipTitle.isDisplayed().catch(() => false)
    if (moreMenuTooltipShown) {
      const dismissedFromTitle = await this.dismissAndroidTooltipTextIfVisible()
      if (!dismissedFromTitle) {
        await browser.back().catch(() => {})
      }
      await this.androidMoreMenuMovedTooltipTitle.waitForDisplayed({ reverse: true, timeout: 7000 }).catch(() => {})
      await browser.pause(300)
      return true
    }

    const deviceNotSyncedShown = await this.androidDeviceNotSyncedTitle.isDisplayed().catch(() => false)
    if (deviceNotSyncedShown) {
      const okShown = await this.androidDeviceNotSyncedOkButton.isDisplayed().catch(() => false)
      if (okShown) {
        await this.androidDeviceNotSyncedOkButton.click().catch(() => {})
      } else {
        await browser.back().catch(() => {})
      }
      await this.androidDeviceNotSyncedTitle.waitForDisplayed({ reverse: true, timeout: 7000 }).catch(() => {})
      await browser.pause(300)
      return true
    }

    const neutralDismissed = await this.dismissCommonAndroidAlert(2500).catch(() => false)
    if (neutralDismissed) return true

    return false
  }

  protected async dismissCommonAndroidAlert(timeoutMs = 3000) {
    if (!browser.isAndroid) return false

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const candidates = [
      this.androidAlertBtn3,
      this.androidAlertBtn3ById,
      this.androidAlertBtn3ByText,
      
    ]

    for (const candidate of candidates) {
      const shown = await candidate.isDisplayed().catch(() => false)
      if (!shown) continue

      await candidate.click().catch(() => {})
      await candidate.waitForDisplayed({ reverse: true, timeout: 7000 }).catch(() => {})
      return true
    }

    const titleShown = await this.androidAlertTitle.isDisplayed().catch(() => false)
    if (!titleShown) return false

    await browser.waitUntil(
      async () => {
        for (const candidate of candidates) {
          if (await candidate.isDisplayed().catch(() => false)) {
            await candidate.click().catch(() => {})
            await candidate.waitForDisplayed({ reverse: true, timeout: 7000 }).catch(() => {})
            return true
          }
        }
        return false
      },
      {
        timeout: Math.max(1200, timeoutMs),
        interval: 250,
      }
    ).catch(() => false)

    return !(await this.androidAlertTitle.isDisplayed().catch(() => false))
  }

  protected async dismissKnownAndroidBlockingPopups(maxRounds = 3) {
    if (!browser.isAndroid) return false

    let dismissedAny = false
    for (let i = 0; i < maxRounds; i += 1) {
      const dismissed = await this.dismissKnownAndroidBlockingPopupOnce()
      if (!dismissed) break
      dismissedAny = true
      await browser.pause(150)
    }
    return dismissedAny
  }

  protected async stabilizeAndroidHomeSurface(timeoutMs = 15000) {
    if (!browser.isAndroid) return false

    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      await browser.switchContext('NATIVE_APP').catch(() => {})

      const currentActivity = await browser.getCurrentActivity().catch(() => '')
      const isFreshchatActivity = /freshchat|CategoryListActivity|ConversationActivity/i.test(currentActivity)
      if (isFreshchatActivity) {
        await browser.back().catch(() => {})
        await browser.pause(400)
        continue
      }

      // Compose Home can omit home_screen. A single source snapshot is much
      // cheaper than probing every optional popup with separate XPath calls.
      if (/DashboardActivity/i.test(currentActivity)) {
        const source = await browser.getPageSource().catch(() => '')
        const hasBlockingSurface = [
          'verificationSuccess_screen',
          'verificationSuccess_button_continue',
          'googlepayProposal_button_close',
          'tierGreeting_screen',
          'text="Not Now"',
          'content-desc="Not Now"',
          'More menu has been moved',
          'text="Dismiss"',
          'content-desc="Dismiss"',
          'Device Not Synced',
          'accountSelection_screen',
          'more_screen',
          'android:id/button3',
        ].some(marker => source.includes(marker))

        if (!hasBlockingSurface) return true
      }

      await this.dismissKnownAndroidBlockingPopups(3).catch(() => {})
      await this.dismissCommonAndroidAlert(500).catch(() => false)

      const moreShown = await this.androidMoreRoot.isDisplayed().catch(() => false)
        || await this.androidMoreRoot.isExisting().catch(() => false)
      const drawerShown = (
        moreShown ||
        await this.androidAccountSelectionRoot.isDisplayed().catch(() => false) ||
        await this.androidAccountSelectionRoot.isExisting().catch(() => false) ||
        await this.androidDrawerLogoutItem.isDisplayed().catch(() => false) ||
        await this.androidDrawerSettingsItem.isDisplayed().catch(() => false) ||
        await this.androidDrawerWalletsItem.isDisplayed().catch(() => false)
      )
      if (drawerShown) {
        const closeShown = await this.androidMoreCloseButton.isDisplayed().catch(() => false)
          || await this.androidMoreCloseButton.isExisting().catch(() => false)
        if (closeShown) {
          await this.androidMoreCloseButton.click().catch(() => {})
        } else {
          await browser.back().catch(() => {})
        }
        await browser.pause(400)
        continue
      }

      const homeEl = this.byIdRx('home_screen')
      const homeShown = await homeEl.isDisplayed().catch(() => false)
        || await homeEl.isExisting().catch(() => false)
      if (homeShown) return true

      // Compose build: home_screen may have no resource-id — treat DashboardActivity as stable home
      const currentActivityEarly = await browser.getCurrentActivity().catch(() => '')
      if (/DashboardActivity/i.test(currentActivityEarly)) {
        const moreVisibleEarly = await this.androidDrawerLogoutItem.isDisplayed().catch(() => false)
          || await this.androidDrawerSettingsItem.isDisplayed().catch(() => false)
          || await this.androidMoreRoot.isExisting().catch(() => false)
        if (!moreVisibleEarly) return true
      }

      const cardsShown = await this.byIdRx('cards_screen').isDisplayed().catch(() => false)
      const payShown = await this.byIdRx('pay_screen').isDisplayed().catch(() => false)

      const homeTabShown = await this.androidHomeTab.isDisplayed().catch(() => false)
      const homeTabA11yShown = await this.androidHomeTabA11y.isDisplayed().catch(() => false)
      const homeTabXpathShown = await this.androidHomeTabXpath.isDisplayed().catch(() => false)

      if (cardsShown || payShown || homeTabShown || homeTabA11yShown || homeTabXpathShown) {
        if (homeTabShown) {
          await this.androidHomeTab.click().catch(() => {})
        } else if (homeTabA11yShown) {
          await this.androidHomeTabA11y.click().catch(() => {})
        } else if (homeTabXpathShown) {
          await this.androidHomeTabXpath.click().catch(() => {})
        }

        await browser.pause(400)
        const homeAfterTap = await this.byIdRx('home_screen').isDisplayed().catch(() => false)
        if (homeAfterTap) return true
      }

      await browser.pause(300)
    }

    return await this.byIdRx('home_screen').isDisplayed().catch(() => false)
  }

  // Without an accountCode, the first profile of accountType linked to the logged-in user is used,
  // read from the Home header ("Individual • KER40014") and the account picker rows.
  protected async switchAndroidAccountByCode(accountCode: string | undefined, accountType?: string) {
    if (!browser.isAndroid) return
    if (!accountCode && !accountType) throw new Error('switchAndroidAccountByCode needs an account code or type')
    const target = accountCode ?? String(accountType)

    await browser.switchContext('NATIVE_APP')
    await this.stabilizeAndroidHomeSurface(20000)

    const homeAccountLabel = accountCode
      ? $(`//*[contains(@resource-id,"_button_userAvatar")]//android.widget.TextView[contains(@text,"${accountCode}")]`)
      : $(`//*[contains(@resource-id,"_button_userAvatar")]//android.widget.TextView[starts-with(@text,"${accountType} •")]`)
    if (await homeAccountLabel.isExisting()) return

    const userAvatar = this.byIdRx('home_button_userAvatar')
    const picker = this.byIdRx('more_button_accountPicker')
    // More shows only the active code, so by type the active profile is known from Home alone.
    const currentAccount = accountCode
      ? $(`//*[contains(@resource-id,"more_button_accountPicker")]//*[contains(@text,"${accountCode}") or contains(@content-desc,"${accountCode}")]`)
      : $('//*[@resource-id="no-active-account-match-by-type"]')
    let accountAlreadySelected = false
    let recoveredFromLeakCanary = false
    await this.dismissKnownAndroidBlockingPopups(2)
    // A session can resume on another tab, which has no Home avatar.
    const homeTab = this.byIdRx('navigation_button_home')
    if (!await userAvatar.isDisplayed().catch(() => false) && await homeTab.isDisplayed().catch(() => false)) {
      await this.tap(homeTab)
      await userAvatar.waitForDisplayed({ timeout: 15000 }).catch(() => {})
    }
    await this.tap(userAvatar)

    await browser.waitUntil(async () => {
      const source = await browser.getPageSource()
      if (/resource-id="[^"]*accountSelection_screen"/.test(source)) return true

      // These sheets can open after the avatar tap and swallow it.
      if (source.includes('text="Not Now"') || source.includes('tierGreeting_screen')) {
        await this.dismissKnownAndroidBlockingPopups(2)
        await this.tap(userAvatar)
        return false
      }

      if (!recoveredFromLeakCanary && source.includes('leak_canary_main_container')) {
        recoveredFromLeakCanary = true
        await browser.back()
        if (await this.byIdRx('leak_canary_main_container').isExisting()) await browser.back()
        await this.tap(userAvatar)
        return false
      }

      if (/resource-id="[^"]*more_screen"/.test(source)) {
        if (await currentAccount.isExisting()) {
          accountAlreadySelected = true
          await this.tapAndroidCenterPoint(this.androidMoreCloseButton)
          return true
        }
        await this.tapAndroidCenterPoint(picker)
      }
      return false
    }, {
      timeout: 20000,
      interval: 500,
      timeoutMsg: 'Android account picker did not open',
    })

    if (!accountAlreadySelected) {
      const account = accountCode
        ? $(`//*[contains(@resource-id,"accountSelection_screen")]//*[not(self::android.widget.EditText) and (contains(@text,"${accountCode}") or contains(@content-desc,"${accountCode}"))]/ancestor-or-self::*[@clickable="true"][1]`)
        : $(`//*[contains(@resource-id,"accountSelection_screen")]//android.widget.TextView[@text="${accountType}"]/ancestor::*[@clickable="true"][1]`)
      const search = $('//*[contains(@resource-id,"accountSelection_screen")]//android.widget.EditText')
      if (accountCode && !await account.isExisting() && await search.isExisting()) {
        await search.setValue(accountCode)
      }
      await account.waitForDisplayed({
        timeout: 15000,
        timeoutMsg: `Expected ${accountType ?? 'the'} account ${target} in the picker`,
      })
      await this.tapAndroidCenterPoint(account)
    }

    await browser.waitUntil(async () => {
      const source = await browser.getPageSource()
      if (/resource-id="[^"]*more_screen"/.test(source)) {
        await this.tapAndroidCenterPoint(this.androidMoreCloseButton)
        return false
      }

      const homeVisible = /resource-id="[^"]*(?:home_screen|home_button_addFunds)"/.test(source)
      const pickerVisible = /resource-id="[^"]*accountSelection_screen"/.test(source)
      if (homeVisible && !pickerVisible) return true

      await this.dismissKnownAndroidBlockingPopups(1)
      return false
    }, {
      timeout: 60000,
      interval: 500,
      timeoutMsg: `Android home did not switch to account ${target}`,
    })
  }

  // The Individual profile linked to whichever user is logged in, not a configured account code.
  protected async ensureAndroidIndividualAccount() {
    await this.switchAndroidAccountByCode(undefined, 'Individual')
  }

  protected async backUntilAndroidHomeTab(maxBacks = 8) {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    const homeTab = this.byIdRx('navigation_button_home')
    for (let attempt = 0; attempt <= maxBacks; attempt += 1) {
      if (await homeTab.isDisplayed().catch(() => false)) {
        await this.tap(homeTab)
        await browser.pause(1500)
        return
      }
      await browser.back()
      await browser.pause(1500)
    }
    throw new Error(`Home tab did not appear after ${maxBacks} back presses`)
  }

  protected async ensureAndroidIndividualHomeReady(stabilizeTimeoutMs = 15000) {
    if (!browser.isAndroid) return

    await this.stabilizeAndroidHomeSurface(stabilizeTimeoutMs).catch(() => false)
    await this.ensureAndroidIndividualAccount()
  }

  async pause(ms = 1000) {
    await browser.pause(ms)
  }

  async click(el: ResolvableWdioEl, timeout = 10000) {
    return this.tap(el, timeout)
  }

  async waitForExist(el: WdioEl, timeout = 10000): Promise<WdioEl> {
    await el.waitForExist({ timeout })
    return el
  }

  async waitForDisplayed(el: WdioEl, timeout = 10000): Promise<WdioEl> {
    await el.waitForDisplayed({ timeout })
    return el
  }

  async tap(el: ResolvableWdioEl, timeout = 10000) {
    const target = (el && typeof (el as Promise<unknown>).then === 'function' && !('waitForExist' in el)
      ? await (el as Promise<WdioEl | WebdriverIO.Element>)
      : el) as WebdriverIO.Element

    if (browser.isIOS) {
      await target.waitForExist({ timeout })
      await target.click()
      return
    }
    await this.dismissKnownAndroidBlockingPopups().catch(() => {})
    try {
      await target.waitForDisplayed({ timeout })
      await target.click()
    } catch {
      const dismissed = await this.dismissKnownAndroidBlockingPopups().catch(() => false)
      if (dismissed) {
        await target.waitForDisplayed({ timeout })
        await target.click()
        return
      }
      // Jetpack Compose: elements report isDisplayed()=false but are present and clickable
      const exists = await target.isExisting().catch(() => false)
      if (exists) {
        await target.click()
        return
      }
      const sel = await Promise.resolve(target.selector).catch(() => '?')
      throw new Error(`tap: element not found — ${sel}`)
    }
  }

  async type(el: WdioEl, value: string, timeout = 10000) {
    await this.dismissKnownAndroidBlockingPopups().catch(() => {})
    try {
      await el.waitForDisplayed({ timeout })
      await el.setValue(value)
    } catch {
      const dismissed = await this.dismissKnownAndroidBlockingPopups().catch(() => false)
      if (dismissed) {
        await el.waitForDisplayed({ timeout })
        await el.setValue(value)
        return
      }
      const sel = await Promise.resolve(el.selector).catch(() => '?')
      throw new Error(`type: element not found — ${sel}`)
    }
  }

  async isDisplayed(el: WdioEl, timeout = 1000) {
    return el.waitForDisplayed({ timeout }).then(() => true).catch(() => false)
  }

  protected async tapScreenPointIOS(xRatio: number, yRatio: number, actionId: string) {
    const { width, height } = await browser.getWindowRect()
    await browser.performActions([
      {
        type: 'pointer',
        id: actionId,
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: Math.round(width * xRatio), y: Math.round(height * yRatio) },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
  }

  // One-time "More menu moved here" tooltip shown on the More screen after a Capella app update.
  // Appears over the account picker button, blocking the Sub Accounts sheet from opening.
  // Safe to call from any iOS context; no-ops on Android or when tooltip is absent.
  protected async dismissIOSMoreMenuTipIfPresent() {
    if (!browser.isIOS) return false
    const tip = $('-ios predicate string:name == "TipView" OR name == "More menu moved here" OR label == "More menu moved here"')
    const shown = await tip.isExisting().catch(() => false)
    if (!shown) return false
    const closeBtn = $('-ios predicate string:type == "XCUIElementTypeButton" AND (name == "xmark" OR name == "Close" OR label == "Close")')
    const closeBtnShown = await closeBtn.isExisting().catch(() => false)
    if (closeBtnShown) {
      await closeBtn.click().catch(async () => {
        const loc = await closeBtn.getLocation()
        const sz = await closeBtn.getSize()
        await this.tapScreenPointIOS((loc.x + sz.width / 2) / (await browser.getWindowRect()).width, (loc.y + sz.height / 2) / (await browser.getWindowRect()).height, 'finger-ios-tip-close')
      })
    } else {
      await this.tapScreenPointIOS(0.81, 0.15, 'finger-ios-tip-close-coord')
    }
    await browser.pause(500)
    return true
  }

  // In-app contacts permission screen (ic_contacts_permission) → Continue → CNContactPickerViewController sheet.
  // Appears on iOS when the Pay screen first tries to access contacts (P2P, SEPA, add-beneficiary flows).
  protected async dismissContactsPermissionIOS() {
    if (!browser.isIOS) return
    const permissionImg = $('-ios predicate string:name == "ic_contacts_permission" OR label == "ic_contacts_permission" OR name == "Enable Contacts" OR label == "Enable Contacts"')
    const shown = await permissionImg.waitForExist({ timeout: 8000 }).then(() => true).catch(() => false)
    if (!shown) return

    const continueBtn = $('~Continue')
    const continueShown = await continueBtn.waitForExist({ timeout: 3000 }).catch(() => false)
    if (continueShown) {
      await this.tap(continueBtn).catch(() => {})
    } else {
      console.warn('[iOS] Continue btn not found by a11y — coordinate fallback y=0.87')
      await this.tapScreenPointIOS(0.5, 0.87, 'finger-ios-continue-contacts')
    }
    await browser.pause(800)

    // P2P shows a system contacts permission alert ("Allow While Using App" / "OK") instead of
    // CNContactPickerViewController. Accept it if present so the Enable Contacts screen dismisses.
    await this.dismissIOSPermissionAlertsIfPresent().catch(() => {})
    await browser.pause(1500)

    // CNContactPickerViewController system sheet appears only in SEPA/SWIFT flows.
    // For P2P the app grants permission via system alert and returns directly to Pay screen.
    const payScreenBack = $('-ios predicate string:name == "pay_button_add" OR name == "pay_screen_view"')
    const alreadyOnPay = await payScreenBack.waitForExist({ timeout: 2000 }).catch(() => false)
    if (alreadyOnPay) {
      console.warn('[iOS] Pay screen visible — no CNContactPickerViewController sheet, skipping y=0.92 tap')
      return
    }

    // Dismiss CNContactPickerViewController springboard sheet.
    // Try element-based tap first; fall back to coordinate if SpringBoard hides it from accessibility tree.
    const shareAllBtn = $('-ios predicate string:label BEGINSWITH "Share All" OR name BEGINSWITH "Share All"')
    const [shownViaA11y, pageSource] = await Promise.all([
      shareAllBtn.waitForExist({ timeout: 3000 }).catch(() => false),
      browser.getPageSource().catch(() => ''),
    ])
    if (shownViaA11y) {
      await shareAllBtn.click().catch(async () => { await this.tap(shareAllBtn) })
    } else if ((pageSource as string).includes('bundleId="com.apple.springboard"')) {
      console.warn('[iOS] Share All sheet (springboard) — coordinate tap y=0.92')
      await this.tapScreenPointIOS(0.5, 0.92, 'finger-ios-contacts-sheet')
    }
    await browser.pause(1000)
  }

  async dismissIOSAlerts() {
    try {
      if (await browser.isAlertOpen()) {
        await browser.sendAlertText('123456').catch(() => {})
        await browser.acceptAlert().catch(() => browser.dismissAlert().catch(() => {}))
      }
    } catch {}
  }

  protected async dismissIOSPermissionAlertsIfPresent(): Promise<boolean> {
    if (!browser.isIOS) return false
    for (const label of ['Allow While Using App', 'Allow Once', 'OK']) {
      const btn = $(`-ios predicate string:label == "${label}"`)
      const shown = await btn.isDisplayed().catch(() => false)
      if (shown) {
        await this.tap(btn).catch(() => {})
        await browser.pause(300)
        return true
      }
    }
    return false
  }

  async debugSnapshot(tag = 'debug') {
    try {
      const src = await browser.getPageSource()
      console.log(`\n[${tag}] SOURCE HEAD:\n${src.slice(0, 2000)}\n`)
    } catch {}
  }

  protected async ensureSingleAccountAndroidFlow(params: EnsureSingleAccountAndroidParams) {
    if (!browser.isAndroid) return

    const {
      userAvatarBtn,
      businessAccountLabel,
      singleAccountItemByDesc,
      singleAccountItemByText,
      alertBtn3,
      homeRoot,
      timeoutMs = 15000,
      alertTimeoutMs = 2000,
    } = params

    const isBusiness = await businessAccountLabel.isDisplayed().catch(() => false)
    if (!isBusiness) return

    await userAvatarBtn.waitForDisplayed({ timeout: timeoutMs })
    await this.tap(userAvatarBtn)

    const byDescVisible = await singleAccountItemByDesc.isDisplayed().catch(() => false)
    if (byDescVisible) {
      await this.tap(singleAccountItemByDesc)
    } else {
      await singleAccountItemByText.waitForDisplayed({ timeout: timeoutMs })
      await this.tap(singleAccountItemByText)
    }

    const dismissedSharedAlert = await this.dismissCommonAndroidAlert(alertTimeoutMs).catch(() => false)
    if (!dismissedSharedAlert && alertBtn3) {
      await browser.switchContext('NATIVE_APP').catch(() => {})
      const alertShown = await alertBtn3.isDisplayed().catch(() => false)
      if (alertShown) {
        await this.tap(alertBtn3)
        await alertBtn3.waitForDisplayed({ reverse: true, timeout: 7000 }).catch(() => {})
      }
    }

    if (homeRoot) {
      await homeRoot.waitForDisplayed({ timeout: 20000 }).catch(() => {})
    }
  }

  protected async openAndroidMoreMenuFromProfile() {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const alreadyOpen =
      (await this.androidMoreRoot.isDisplayed().catch(() => false)) ||
      (await this.androidMoreRoot.isExisting().catch(() => false)) ||
      (await this.androidAdministrationEntry.isDisplayed().catch(() => false)) ||
      (await this.androidAdministrationEntry.isExisting().catch(() => false))
    if (alreadyOpen) return

    await this.androidProfileMoreEntry.waitForExist({
      timeout: 20000,
      timeoutMsg: 'Profile/More entry was not found on Android',
    })
    await this.tap(this.androidProfileMoreEntry).catch(async () => {
      const location = await this.androidProfileMoreEntry.getLocation()
      const size = await this.androidProfileMoreEntry.getSize()
      await browser.execute('mobile: clickGesture', {
        x: Math.round(location.x + Math.max(size.width / 2, 1)),
        y: Math.round(location.y + Math.max(size.height / 2, 1)),
      })
    })

    await browser.waitUntil(
      async () =>
        (await this.androidMoreRoot.isDisplayed().catch(() => false)) ||
        (await this.androidMoreRoot.isExisting().catch(() => false)) ||
        (await this.androidAdministrationEntry.isDisplayed().catch(() => false)) ||
        (await this.androidAdministrationEntry.isExisting().catch(() => false)),
      { timeout: 15000, interval: 300, timeoutMsg: 'More menu did not open from profile entry on Android' },
    )
  }
}
