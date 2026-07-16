import type { ChainablePromiseElement } from 'webdriverio'
import { $, browser } from '@wdio/globals'

type WdioEl = ChainablePromiseElement

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
      const rx = `.*:id/${name}$|^${name}$`
      return $(`android=new UiSelector().resourceIdMatches("${rx}")`)
    }
    return $(`~${name}`)
  }

  private get androidAlertBtn3() {
    return $('android=new UiSelector().resourceId("android:id/button3")')
  }

  private get androidAlertBtn3ById() {
    return $('id=android:id/button3')
  }

  private get androidAlertBtn3ByText() {
    return $('android=new UiSelector().text("OK")')
  }


  private get androidSomethingWentWrongTitle() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/alertTitle").text("Something went wrong")')
  }

  private get androidAlertTitle() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/alertTitle")')
  }

  private get androidGooglePayNotNow() {
    return $('android=new UiSelector().text("Not Now")')
  }

  private get androidGooglePayScreen() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/clSelectCardGooglePay")')
  }

  private get androidGooglePayCloseBtn() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/rightActionView")')
  }

  private get androidVerificationSuccessContinueBtn() {
    return this.byIdRx('verificationSuccess_button_continue')
  }

  private get androidVerificationSuccessScreen() {
    return this.byIdRx('verificationSuccess_screen')
  }

  private get androidHomeTab() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_button_home")')
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

      await this.dismissKnownAndroidBlockingPopups(3).catch(() => {})
      await this.dismissCommonAndroidAlert(2000).catch(() => false)

      const currentActivity = await browser.getCurrentActivity().catch(() => '')
      const isFreshchatActivity = /freshchat|CategoryListActivity|ConversationActivity/i.test(currentActivity)
      if (isFreshchatActivity) {
        await browser.back().catch(() => {})
        await browser.pause(400)
        continue
      }

      const homeShown = await this.byIdRx('home_screen').isDisplayed().catch(() => false)
      if (homeShown) return true

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

  async pause(ms = 1000) {
    await browser.pause(ms)
  }

  async tap(el: WdioEl, timeout = 10000) {
    await this.dismissKnownAndroidBlockingPopups().catch(() => {})
    try {
      await el.waitForDisplayed({ timeout })
      await el.click()
    } catch (error) {
      const dismissed = await this.dismissKnownAndroidBlockingPopups().catch(() => false)
      if (!dismissed) throw error
      await el.waitForDisplayed({ timeout })
      await el.click()
    }
  }

  async type(el: WdioEl, value: string, timeout = 10000) {
    await this.dismissKnownAndroidBlockingPopups().catch(() => {})
    try {
      await el.waitForDisplayed({ timeout })
      await el.setValue(value)
    } catch (error) {
      const dismissed = await this.dismissKnownAndroidBlockingPopups().catch(() => false)
      if (!dismissed) throw error
      await el.waitForDisplayed({ timeout })
      await el.setValue(value)
    }
  }

  async isDisplayed(el: WdioEl, timeout = 1000) {
    try {
      await el.waitForDisplayed({ timeout })
      return true
    } catch {
      return false
    }
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

  // In-app contacts permission screen (ic_contacts_permission) → Continue → CNContactPickerViewController sheet.
  // Appears on iOS when the Pay screen first tries to access contacts (P2P, SEPA, add-beneficiary flows).
  protected async dismissContactsPermissionIOS() {
    if (!browser.isIOS) return
    const permissionImg = $('~ic_contacts_permission')
    const shown = await permissionImg.waitForExist({ timeout: 4000 }).then(() => true).catch(() => false)
    if (!shown) return

    console.warn('[iOS] Contacts permission screen detected — tapping Continue')
    const continueBtn = $('-ios predicate string:name == "Continue" OR label == "Continue"')
    await continueBtn.waitForExist({ timeout: 5000 }).catch(() => {})
    await this.tap(continueBtn).catch(() => {})
    await browser.pause(1500)

    // Dismiss CNContactPickerViewController springboard sheet (runs in separate process — coordinate only).
    // y=0.92 targets "Share All X Contacts" on iPhone 16 iOS 18.
    console.warn('[iOS] Tapping y=0.92 to dismiss CNContactPickerViewController sheet')
    await this.tapScreenPointIOS(0.5, 0.92, 'finger-ios-contacts-sheet')
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
}
