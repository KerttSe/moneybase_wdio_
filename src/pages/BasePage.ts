import type { ChainablePromiseElement } from 'webdriverio'
import { $, browser } from '@wdio/globals'
import { AUTH } from '../data/credentials'

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
      return $(`(//*[@resource-id="com.moneybase.qa:id/${name}"] | //*[@resource-id="${name}"] | //*[contains(@resource-id,"${name}")])[1]`)
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
    return $('//android.widget.TextView[@text="Device Not Synced"]/ancestor::*[android.widget.TextView[@text="OK"]][1]//android.widget.TextView[@text="OK"]/ancestor::*[@clickable="true"][1]')
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
    return $('~Close')
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

    const moreMenuTooltipShown = await this.androidMoreMenuMovedTooltipTitle.isDisplayed().catch(() => false)
    const moreMenuTooltipDismissShown = await this.androidMoreMenuMovedTooltipDismiss.isDisplayed().catch(() => false)
    if (moreMenuTooltipShown || moreMenuTooltipDismissShown) {
      if (moreMenuTooltipDismissShown) {
        const clicked = await this.androidMoreMenuMovedTooltipDismiss.click().then(() => true).catch(() => false)
        if (!clicked) {
          const textShown = await this.androidMoreMenuMovedTooltipDismissText.isDisplayed().catch(() => false)
          if (textShown) {
            const location = await this.androidMoreMenuMovedTooltipDismissText.getLocation()
            const size = await this.androidMoreMenuMovedTooltipDismissText.getSize()
            await browser.performActions([
              {
                type: 'pointer',
                id: 'finger-more-menu-tooltip-dismiss',
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
          }
        }
      } else {
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

      const homeEl = this.byIdRx('home_screen')
      const homeShown = await homeEl.isDisplayed().catch(() => false)
        || await homeEl.isExisting().catch(() => false)
      if (homeShown) return true

      await this.dismissKnownAndroidBlockingPopups(3).catch(() => {})
      await this.dismissCommonAndroidAlert(500).catch(() => false)

      const currentActivity = await browser.getCurrentActivity().catch(() => '')
      const isFreshchatActivity = /freshchat|CategoryListActivity|ConversationActivity/i.test(currentActivity)
      if (isFreshchatActivity) {
        await browser.back().catch(() => {})
        await browser.pause(400)
        continue
      }

      const moreShown = await this.androidMoreRoot.isDisplayed().catch(() => false)
      const drawerShown = (
        moreShown ||
        await this.androidAccountSelectionRoot.isDisplayed().catch(() => false) ||
        await this.androidDrawerLogoutItem.isDisplayed().catch(() => false) ||
        await this.androidDrawerSettingsItem.isDisplayed().catch(() => false) ||
        await this.androidDrawerWalletsItem.isDisplayed().catch(() => false)
      )
      if (drawerShown) {
        const closeShown = await this.androidMoreCloseButton.isDisplayed().catch(() => false)
        if (closeShown) {
          await this.androidMoreCloseButton.click().catch(() => {})
        } else {
          await browser.back().catch(() => {})
        }
        await browser.pause(400)
        continue
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

  protected async switchAndroidAccountByCode(accountCode: string, accountType?: string) {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})
    await this.stabilizeAndroidHomeSurface(20000).catch(() => false)

    const homeAccountLabel = $(`//android.widget.TextView[contains(@text,"${accountCode}")]`)
    const alreadyOnAccount =
      await homeAccountLabel.isDisplayed().catch(() => false) ||
      await homeAccountLabel.isExisting().catch(() => false)
    if (alreadyOnAccount) return

    // Compose builds may expose the avatar via content-desc rather than resource-id
    const userAvatarBtn = $('//*[contains(@resource-id,"home_button_userAvatar") or @content-desc="home_button_userAvatar"]')
    const moreScreen = this.byIdRx('more_screen')
    const accountPickerButton = this.byIdRx('more_button_accountPicker')
    const accountSelectionScreen = this.byIdRx('accountSelection_screen')
    const oldSubAccountsTitle = $('//*[@text="Sub Accounts" or @content-desc="Sub Accounts"]')

    await userAvatarBtn.waitForExist({ timeout: 20000 })
    await this.tap(userAvatarBtn)

    const targetAccountText = $(`//android.widget.TextView[contains(@text,"${accountCode}")] | //*[contains(@content-desc,"${accountCode}")]`)

    await browser.waitUntil(
      async () => {
        if (await accountSelectionScreen.isDisplayed().catch(() => false)
          || await accountSelectionScreen.isExisting().catch(() => false)) return true
        if (await oldSubAccountsTitle.isDisplayed().catch(() => false)) return true

        // Check more_screen BEFORE anyAccountText — the picker button label contains account
        // type text (e.g. "DER00003  Business") which would cause anyAccountText to exit early
        const moreShown = await moreScreen.isDisplayed().catch(() => false)
          || await moreScreen.isExisting().catch(() => false)
        if (moreShown) {
          const pickerShown = await accountPickerButton.isDisplayed().catch(() => false)
            || await accountPickerButton.isExisting().catch(() => false)
          if (pickerShown) {
            await this.tap(accountPickerButton)
          }
          return false
        }

        // Compose fallback: account selection opened without a container resource-id.
        // Do not use generic account type text here: Home itself contains "Individual"
        // before the picker has finished opening.
        if (await targetAccountText.isDisplayed().catch(() => false)
          || await targetAccountText.isExisting().catch(() => false)) return true

        return false
      },
      {
        timeout: 15000,
        interval: 500,
        timeoutMsg: 'Android account picker did not open',
      }
    )

    const accountByCode = $(`//*[contains(@resource-id,"accountSelection_screen")]//android.widget.TextView[contains(@text,"${accountCode}")]/ancestor::*[@clickable="true"][1]`)
    const accountSearchInput = $('//*[contains(@resource-id,"accountSelection_screen")]//android.widget.EditText')
    const legacyByCode = $(`//android.widget.TextView[contains(@text,"${accountCode}")]/ancestor::*[@clickable="true"][1]`)
    const legacyByType = accountType
      ? $(`//*[@content-desc="${accountType}"]/ancestor::*[@clickable="true"][1] | //android.widget.TextView[contains(@text,"${accountType}")]/ancestor::*[@clickable="true"][1]`)
      : legacyByCode
    // Compose fallback: content-desc contains (no clickable ancestor required)
    const composeByCodeContentDesc = $(`//*[contains(@resource-id,"accountSelection_screen")]//*[contains(@content-desc,"${accountCode}")]`)
    const composeByTypeContentDesc = accountType
      ? $(`//*[contains(@resource-id,"accountSelection_screen")]//*[contains(@content-desc,"${accountType}")]`)
      : composeByCodeContentDesc
    const composeByCode = $(`//android.widget.TextView[contains(@text,"${accountCode}")]`)
    const composeByType = accountType
      ? $(`//android.widget.TextView[contains(@text,"${accountType}")] | //*[@content-desc="${accountType}"]`)
      : composeByCode
    const uiSelectorDescCode = $(`//*[contains(@content-desc,"${accountCode}") or contains(@text,"${accountCode}")]`)

    if (!(await accountByCode.isDisplayed().catch(() => false)) && await accountSearchInput.isDisplayed().catch(() => false)) {
      await accountSearchInput.setValue(accountCode).catch(async () => {
        await this.tap(accountSearchInput)
        await browser.keys(accountCode)
      })
      await browser.pause(500)
    }

    if (await accountByCode.isDisplayed().catch(() => false)) {
      await this.tap(accountByCode)
    } else if (await legacyByCode.isDisplayed().catch(() => false)) {
      await this.tap(legacyByCode)
    } else if (await legacyByType.isExisting().catch(() => false)) {
      await this.tap(legacyByType)
    } else if (await composeByCodeContentDesc.isExisting().catch(() => false)) {
      await this.tap(composeByCodeContentDesc)
    } else if (await composeByTypeContentDesc.isExisting().catch(() => false)) {
      await this.tap(composeByTypeContentDesc)
    } else if (await uiSelectorDescCode.isExisting().catch(() => false)) {
      await this.tap(uiSelectorDescCode)
    } else if (await composeByCode.isExisting().catch(() => false)) {
      await this.tap(composeByCode)
    } else {
      await composeByType.waitForExist({ timeout: 10000 })
      await this.tap(composeByType)
    }

    await this.dismissCommonAndroidAlert(5000).catch(() => false)
    await this.dismissKnownAndroidBlockingPopups(3).catch(() => false)
    await this.stabilizeAndroidHomeSurface(30000).catch(() => false)

    await browser.waitUntil(
      async () => {
        await this.dismissKnownAndroidBlockingPopups(2).catch(() => false)
        const tv = $(`//android.widget.TextView[contains(@text,"${accountCode}")]`)
        const cdEl = $(`//*[contains(@content-desc,"${accountCode}")]`)
        const homeAccountChip = $(
          `//*[contains(@resource-id,"home_button_userAvatar") and .//android.widget.TextView[contains(@text,"${accountCode}")]]`,
        )
        return (
          await tv.isDisplayed().catch(() => false) ||
          await tv.isExisting().catch(() => false) ||
          await cdEl.isExisting().catch(() => false) ||
          await homeAccountChip.isExisting().catch(() => false)
        )
      },
      {
        timeout: 30000,
        interval: 500,
        timeoutMsg: `Android home did not switch to account ${accountCode}`,
      }
    )
  }

  protected async ensureAndroidIndividualAccount() {
    const accountCode = AUTH.individualAccountCode
    if (accountCode) {
      await this.switchAndroidAccountByCode(accountCode, 'Individual')
    }
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

  // In-app contacts permission screen (ic_contacts_permission) → Continue → CNContactPickerViewController sheet.
  // Appears on iOS when the Pay screen first tries to access contacts (P2P, SEPA, add-beneficiary flows).
  protected async dismissContactsPermissionIOS() {
    if (!browser.isIOS) return
    const permissionImg = $('-ios predicate string:name == "ic_contacts_permission" OR label == "ic_contacts_permission" OR name == "Enable Contacts" OR label == "Enable Contacts"')
    const shown = await permissionImg.waitForExist({ timeout: 8000 }).then(() => true).catch(() => false)
    if (!shown) return

    console.warn('[iOS] Contacts permission screen detected — tapping Continue by coordinate')
    // Continue button at ~87% screen height; use coordinate tap — button may be enabled=false
    await this.tapScreenPointIOS(0.5, 0.87, 'finger-ios-continue-contacts')
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
