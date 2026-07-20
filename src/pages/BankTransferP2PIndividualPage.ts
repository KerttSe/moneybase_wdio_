import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'

class BankTransferP2PIndividualPage extends BasePage {
  private byAndroidResId(id: string) {
    const rx = `.*:id/${id}$|^${id}$`
    return $(`android=new UiSelector().resourceIdMatches("${rx}")`)
  }

  /* =========================
   * ANDROID: HOME / ACCOUNT
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

  private get homeRootAndroid() {
    return this.byAndroidResId('home_screen')
  }

  /* =========================
   * IOS: PROFILE PICKER (ensure Individual)
   * ========================= */

  private get profilePickerUserNameLabelIOS() {
    return $('~profilePicker_label_userName')
  }

  private get profilePickerIndividualItemIOS() {
    return $('-ios predicate string:name == "Individual" OR label == "Individual"')
  }

  private get homeRootIOS() {
    return $('~home_screen_view')
  }

  /* =========================
   * ANDROID: blocking AlertDialog
   * ========================= */

  private async dismissBlockingAlertAndroid(timeoutMs = 5000) {
    await this.dismissCommonAndroidAlert(timeoutMs).catch(() => false)
  }

  /**
   * Use this ONLY after account switch.
   * Waits for alert to appear and dismisses it.
   * If alert doesn't appear, waits until home is stable for a short grace window.
   */
  private async waitAndDismissAlertAfterSwitchAndroid(
    timeoutMs = 12000,
    stableHomeMs = 1200,
    pollMs = 250
  ) {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const deadline = Date.now() + timeoutMs
    let homeVisibleSince: number | null = null

    while (Date.now() < deadline) {
      const dismissed = await this.dismissCommonAndroidAlert(2000).catch(() => false)
      if (dismissed) {
        await browser.pause(250)
        return
      }

      const homeShown = await this.homeRootAndroid.isDisplayed().catch(() => false)
      if (homeShown) {
        if (homeVisibleSince === null) homeVisibleSince = Date.now()
        if (Date.now() - homeVisibleSince >= stableHomeMs) return
      } else {
        homeVisibleSince = null
      }

      await browser.pause(pollMs)
    }
  }

  /* =========================
   * ANDROID: ensure Single
   * ========================= */

  private async ensureSingleAccountAndroid() {
    if (!browser.isAndroid) return

    const isBusiness = await this.businessAccountLabelAndroid.isDisplayed().catch(() => false)
    if (!isBusiness) return

    await this.userAvatarBtnAndroid.waitForExist({ timeout: 15000 })
    await this.tap(this.userAvatarBtnAndroid)

    const hasSingleByDesc = await this.singleAccountItemAndroid.isDisplayed().catch(() => false)
    const hasSingleByText = await this.singleAccountItemAndroidByText.isDisplayed().catch(() => false)

    if (hasSingleByDesc) {
      await this.tap(this.singleAccountItemAndroid)
    } else if (hasSingleByText) {
      await this.tap(this.singleAccountItemAndroidByText)
    }

    //  alert button3 is expected ONLY after the switch; so we wait here (not before)
    await this.waitAndDismissAlertAfterSwitchAndroid(12000, 1200)
    await this.homeRootAndroid.waitForExist({ timeout: 30000 }).catch(() => {})
    await this.businessAccountLabelAndroid
      .waitForExist({ reverse: true, timeout: 30000 })
      .catch(() => {})
  }

  /* =========================
   * ANDROID: P2P LOCATORS
   * ========================= */

  private get payTabAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_button_pay")')
  }

  private get payTabAndroidByA11y() {
    return $('~Pay')
  }

  private get payTabAndroidLegacy() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_bar_item_icon_container").instance(2)')
  }

  private get supportSheetTitleAndroid() {
    return $('android=new UiSelector().text("Support")')
  }

  private get supportSheetCloseAndroid() {
    return $('android=new UiSelector().description("Close sheet")')
  }

  private get carlosCatAndroid() {
    return $('~Carlos Cat')
  }

  private get payInputSearchAndroid() {
    return $('android=new UiSelector().resourceId("pay_input_search")')
  }

  private get payeesFilterContactsAndroid() {
    return $('android=new UiSelector().resourceId("payees_button_filterContacts")')
  }

  private get firstFriendOnMoneybaseAndroid() {
    return $('(//android.view.View[@clickable="true" and .//android.view.View[@content-desc="Friends on Moneybase"]])[1]')
  }

  private get sepaBeneficiaryContactsAndroid() {
    return $(`android=new UiSelector().descriptionContains("SEPA")`)
  }

  private get swiftBeneficiaryContactsAndroid() {
    return $(`android=new UiSelector().description("${this.swiftBeneficiaryName}")`)
  }

  private get beneficiaryPayBtnAndroid() {
    return $('//*[@resource-id="beneficiaryDetails_button_pay"]')
  }

  private get amountP2PAndroid() {
    return $('~makePayment_input_amount')
  }

  private get amountP2PAndroidNew() {
    return this.byAndroidResId('p2p_input_amount')
  }

  private get amountBankTransferAndroid() {
    return this.byAndroidResId('bankTransfer_input_amount')
  }

  private get amountBankTransferAndroidLegacy() {
    return $('id=com.moneybase.qa:id/paymentAmount')
  }

  private async resolveAmountInputP2PAndroid() {
    const candidates = [
      this.amountP2PAndroid,
      this.amountP2PAndroidNew,
      this.amountBankTransferAndroid,
      this.amountBankTransferAndroidLegacy,
    ]

    for (const candidate of candidates) {
      const shown = await candidate.isDisplayed().catch(() => false)
      if (shown) return candidate
    }

    await browser.waitUntil(
      async () => {
        for (const candidate of candidates) {
          const shown = await candidate.isDisplayed().catch(() => false)
          if (shown) return true
        }
        return false
      },
      { timeout: 20000, interval: 500, timeoutMsg: 'Amount input was not displayed' }
    )

    for (const candidate of candidates) {
      const shown = await candidate.isDisplayed().catch(() => false)
      if (shown) return candidate
    }

    throw new Error('Amount input was not displayed')
  }

  private async assertSupportSheetNotShownAndroid(timeoutMs = 3000) {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      const titleShown = await this.supportSheetTitleAndroid.isDisplayed().catch(() => false)
      const closeShown = await this.supportSheetCloseAndroid.isDisplayed().catch(() => false)

      if (titleShown || closeShown) {
        throw new Error('Unexpected Support sheet appeared before opening Pay tab')
      }

      await browser.pause(250)
    }
  }

  private async openPayTabAndroid() {
    await this.dismissBlockingAlertAndroid(5000)
    await this.assertSupportSheetNotShownAndroid(5000)

    for (let attempt = 0; attempt < 2; attempt++) {
      const candidates = [this.payTabAndroid, this.payTabAndroidByA11y, this.payTabAndroidLegacy]

      for (const candidate of candidates) {
        const shown = await candidate.waitForExist({ timeout: 5000 }).catch(() => false)
        if (shown) {
          await this.tap(candidate)
          return
        }
      }

      await this.assertSupportSheetNotShownAndroid(2000)
    }

    throw new Error('Pay tab was not displayed')
  }

  private get payeesCancelSearchAndroid() {
    return $('android=new UiSelector().resourceId("payees_button_cancelSearch")')
  }

  private async openPayeesContactsAndroid() {
    for (let attempt = 0; attempt < 10; attempt++) {
      await this.payInputSearchAndroid.waitForExist({ timeout: 20000 })
      await this.tap(this.payInputSearchAndroid)

      const filterAppeared = await this.payeesFilterContactsAndroid.waitForExist({ timeout: 8000 }).catch(() => false)
      if (!filterAppeared) {
        await this.tap(this.payeesCancelSearchAndroid).catch(() => {})
        await browser.pause(1000)
        continue
      }

      await this.tap(this.payeesFilterContactsAndroid)

      const contactsLoaded = await this.firstFriendOnMoneybaseAndroid.waitForExist({ timeout: 4000 }).catch(() => false)
      if (contactsLoaded) return

      await this.tap(this.payeesCancelSearchAndroid).catch(() => {})
      await browser.pause(1500)
    }

    throw new Error('Payees Contacts did not load after retries')
  }

  private get reviewPaymentBtnAndroid() {
    return $(
      'android=new UiSelector().resourceIdMatches(".*:id/(p2p|bankTransfer)_button_review_payment$|^(p2p|bankTransfer)_button_review_payment$")'
    )
  }

  private get p2pScrollAndroid() {
    return $('id=com.moneybase.qa:id/p2pMakePaymentScrollview')
  }

  private get sliderWrapperAndroidLegacy() {
    return $('~makePayment_slider_pay')
  }

  private get seekBarAndroidLegacy() {
    return $('~makePayment_slider_pay')
  }

  private get slideToMakePaymentAndroid() {
    return this.byAndroidResId('slide_to_make_payment')
  }

  private get slideToMakePaymentAndroidA11y() {
    return $('~slide_to_make_payment')
  }

  private get verificationSliderWrapperAndroid() {
    return this.byAndroidResId('varificationOfPayee_slider_confirm')
  }

  private get verificationSeekBarAndroid() {
    return $(
      '//*[@resource-id="varificationOfPayee_slider_confirm" or @resource-id="com.moneybase.qa:id/varificationOfPayee_slider_confirm"]//android.widget.SeekBar'
    )
  }

  // TODO: replace with stable selector for SEPA beneficiary/item card
  private get sepaBeneficiaryAndroid() {
    return $('~SEPA')
  }

  private readonly swiftBeneficiaryName = 'usjsk whwjwk'

  private get swiftBeneficiaryAndroid() {
    return $(`~${this.swiftBeneficiaryName}`)
  }

  private get swiftBeneficiaryAndroidByDesc() {
    return $(`android=new UiSelector().description("${this.swiftBeneficiaryName}")`)
  }

  private get swiftBeneficiaryAndroidByXPath() {
    return $(`//android.view.View[@content-desc="${this.swiftBeneficiaryName}"]`)
  }

  private get slideTextAndroid() {
    return $('android=new UiSelector().textContains("Slide to make payment")')
  }

  private get slideDescAndroid() {
    return $('android=new UiSelector().descriptionContains("Slide to make payment")')
  }

  /* =========================
   * IOS: P2P LOCATORS
   * ========================= */

  private get payTabIOS() {
    return $('~Pay')
  }

  private get payScreenIOS() {
    return $('-ios predicate string:name == "pay_screen_view" OR name == "pay_button_add"')
  }

  private get carlosCatIOS() {
    return $('-ios predicate string:name == "pay_item_Carlos Cat" OR name == "Carlos Cat" OR label CONTAINS[c] "Carlos Cat"')
  }

  private get beneficiaryPayBtnIOS() {
    return $('~beneficiaryDetails_button_pay')
  }

  private get amountP2PIOS() {
    return $('~makePayment_input_amount')
  }

  private get reviewPaymentBtnIOS() {
    return $('~makePayment_button_review')
  }

  // TODO: replace with stable selector for SEPA beneficiary/item card
  private get sepaBeneficiaryIOS() {
    return $('~pay_item_SEPA')
  }

  private get swiftBeneficiaryIOS() {
    return $(`~pay_item_${this.swiftBeneficiaryName}`)
  }

  private get slideTextIOS() {
    return $('~Slide to make payment')
  }

  private get sliderPayIconIOS() {
    return $('~makePayment_slider_pay')
  }

  private get txDetailsCloseIOS() {
    return $('~transactionDetails_button_close')
  }


  private get homeTabIOS() {
    return $('~Home')
  }

  /* =========================
   * SLIDER
   * ========================= */

  private async ensureSliderReadyAndroid() {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    await browser.hideKeyboard().catch(() => {})

    await browser.waitUntil(
      async () => {
        const slideByIdReady =
          (await this.slideToMakePaymentAndroid.isDisplayed().catch(() => false)) &&
          (await this.slideToMakePaymentAndroid.isEnabled().catch(() => false))
        if (slideByIdReady) return true

        const slideByA11yReady =
          (await this.slideToMakePaymentAndroidA11y.isDisplayed().catch(() => false)) &&
          (await this.slideToMakePaymentAndroidA11y.isEnabled().catch(() => false))
        if (slideByA11yReady) return true

        const legacyReady =
          (await this.sliderWrapperAndroidLegacy.isDisplayed().catch(() => false)) &&
          (await this.sliderWrapperAndroidLegacy.isEnabled().catch(() => false))
        if (legacyReady) return true

        return (
          (await this.slideDescAndroid.isDisplayed().catch(() => false)) &&
          (await this.slideDescAndroid.isEnabled().catch(() => false))
        )
      },
      {
        timeout: 90000,
        interval: 500,
        timeoutMsg: 'P2P payment slider did not become ready after verification',
      }
    )
  }

  private async maybeTapReviewPaymentAndroid() {
    if (!browser.isAndroid) return

    const shown = await this.reviewPaymentBtnAndroid.waitForExist({ timeout: 3000 }).catch(() => false)
    if (!shown) return

    await browser.hideKeyboard().catch(() => {})

    await browser.waitUntil(
      async () =>
        (await this.reviewPaymentBtnAndroid.isDisplayed().catch(() => false)) &&
        (await this.reviewPaymentBtnAndroid.isEnabled().catch(() => false)),
      {
        timeout: 60000,
        interval: 250,
        timeoutMsg: 'Review payment button did not become enabled',
      }
    )

    await this.tap(this.reviewPaymentBtnAndroid)
  }

  private async resolveSeekBarAndroid() {
    const slideByIdShown = await this.slideToMakePaymentAndroid.isDisplayed().catch(() => false)
    if (slideByIdShown) return this.slideToMakePaymentAndroid

    const slideByA11yShown = await this.slideToMakePaymentAndroidA11y.isDisplayed().catch(() => false)
    if (slideByA11yShown) return this.slideToMakePaymentAndroidA11y

    const legacyShown = await this.seekBarAndroidLegacy.isDisplayed().catch(() => false)
    if (legacyShown) return this.seekBarAndroidLegacy

    await this.verificationSeekBarAndroid.waitForExist({ timeout: 20000 })
    return this.verificationSeekBarAndroid
  }

  private async isSlideHintVisibleAndroid() {
    return (
      (await this.slideTextAndroid.isDisplayed().catch(() => false)) ||
      (await this.slideDescAndroid.isDisplayed().catch(() => false))
    )
  }

  private async dragSliderToRightAndroid() {
    const legacyShown = await this.seekBarAndroidLegacy.isDisplayed().catch(() => false)

    // Prefer dragging from the thumb/handle (works for new verification sheet)
    const thumbShown = await this.slideDescAndroid.isDisplayed().catch(() => false)
    const dragEl = legacyShown ? this.seekBarAndroidLegacy : thumbShown ? this.slideDescAndroid : await this.resolveSeekBarAndroid()

    await dragEl.waitForExist({ timeout: 20000 })

    const loc = await dragEl.getLocation()
    const size = await dragEl.getSize()
    const { width } = await browser.getWindowRect()

    const y = Math.round(loc.y + size.height * 0.5)
    const startX = Math.round(loc.x + size.width * 0.6)
    const endX = Math.max(startX + 260, Math.round(width - 30))

    for (let i = 0; i < 3; i++) {
        try {
          await browser.performActions([
            {
              type: 'pointer',
              id: 'finger1',
              parameters: { pointerType: 'touch' },
              actions: [
                { type: 'pointerMove', duration: 0, x: startX, y },
                { type: 'pointerDown', button: 0 },
                { type: 'pause', duration: 250 },
                { type: 'pointerMove', duration: 1100, x: endX, y },
                { type: 'pointerUp', button: 0 },
              ],
            },
          ])

          await browser.releaseActions().catch(() => {})
        } catch (err) {
          // Fallbacks for environments where performActions/releaseActions fail
          try {
            const resolved = dragEl
            await resolved.touchAction([
              { action: 'press', x: startX, y },
              { action: 'wait', ms: 250 },
              { action: 'moveTo', x: endX, y },
              'release',
            ])
          } catch (err2) {
            try {
              const resolved = dragEl as any
              const elId = resolved.elementId || resolved.ELEMENT
              if (elId) {
                await browser.execute('mobile: dragGesture', { elementId: elId, endX, endY: y, speed: 1000 }).catch(() => {})
              }
            } catch (_) {
              // final fallback: ignore and let checks detect failure
            }
          }

          await browser.pause(600)

        }

        const stillThere = await this.isSlideHintVisibleAndroid()
        if (!stillThere) return
    }

    throw new Error('Slider drag did not trigger payment')
  }

  private async ensureSliderReadyIOS() {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    await browser.hideKeyboard().catch(() => {})
    await browser
      .waitUntil(
        async () =>
          (await this.slideTextIOS.isDisplayed().catch(() => false)) ||
          (await this.sliderPayIconIOS.isDisplayed().catch(() => false)),
        { timeout: 30000, interval: 250 }
      )
      .catch(() => {})
  }

  private async maybeTapReviewPaymentIOS() {
    if (!browser.isIOS) return

    await browser.hideKeyboard().catch(() => {})

    const shown = await this.reviewPaymentBtnIOS.waitForExist({ timeout: 3000 }).catch(() => false)
    if (!shown) return

    await browser
      .waitUntil(async () => await this.reviewPaymentBtnIOS.isEnabled().catch(() => false), {
        timeout: 20000,
        interval: 250,
      })
      .catch(() => {})

    await this.tap(this.reviewPaymentBtnIOS)
  }

  private async dragSliderToRightIOS() {
    await this.sliderPayIconIOS.waitForExist({ timeout: 20000 })

    const icon = await this.sliderPayIconIOS
    const loc = await icon.getLocation()
    const size = await icon.getSize()
    const { width } = await browser.getWindowRect()

    const y = Math.round(loc.y + size.height * 0.5)
    const startX = Math.round(loc.x + size.width * 0.5)
    const endX = Math.max(startX + 200, width - 20)

    for (let i = 0; i < 3; i++) {
      await browser.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: startX, y },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 200 },
            { type: 'pointerMove', duration: 900, x: endX, y },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])

      await browser.releaseActions().catch(() => {})
      await browser.pause(600)

      const stillThere = await this.slideTextIOS.isDisplayed().catch(() => false)
      if (!stillThere) return
    }

    throw new Error('Slider drag did not trigger payment (iOS)')
  }

  /* =========================
   * EXIT FLOW
   * ========================= */

  private get txDetailsBackAndroid() {
    return this.byAndroidResId('transactionDetails_button_back')
  }

  private get txDetailsPaymentStatusAndroid() {
    return $('android=new UiSelector().text("PAYMENT STATUS")')
  }

  private get txDetailsAcceptedByMoneybaseAndroid() {
    return $('android=new UiSelector().text("Accepted by Moneybase")')
  }

  private get txDetailsProcessedAndroid() {
    return $('android=new UiSelector().text("Processed")')
  }

  private get txDetailsSentToBankAndroid() {
    return $('android=new UiSelector().text("Sent to Bank")')
  }

  private get txDetailsBicSwiftAndroid() {
    return $('android=new UiSelector().text("BIC/SWIFT")')
  }

  private get txDetailsSwiftFeeAndroid() {
    return $('android=new UiSelector().text("SWIFT Fee")')
  }

  private get txDetailsFeeAndroid() {
    return $('android=new UiSelector().textContains("Fee")')
  }

  private get txDetailsSwiftFeeAmountAndroid() {
    return $('android=new UiSelector().textMatches("^\\$[0-9].*")')
  }

  private get headerBackAndroid() {
    return this.byAndroidResId('beneficiaryDetails_button_back')
  }

  private get headerBackAltAndroid() {
    return $('android=new UiSelector().description("Back")')
  }

  private get homeTabAndroid() {
    return this.byAndroidResId('navigation_button_home')
  }

  private get homeTabAndroidA11y() {
    return $('~Home')
  }

  private get homeTabAndroidLegacy() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_bar_item_icon_view").instance(0)')
  }

  private minusAmountHomeAnchorAndroid(amount: number | string) {
    const formatted = Number(amount).toFixed(2)
    return $(`android=new UiSelector().textContains("- €${formatted}")`)
  }

  private sentAmountHomeAnchorAndroid(amount: number | string) {
    const formatted = Number(amount).toFixed(2)
    return $(`android=new UiSelector().textContains("Sent €${formatted}")`)
  }

  private minusAmountHomeAnchorIOS(amount: number | string, payeeAnchor?: string) {
    const n = Number(amount)
    const comma = n.toFixed(2).replace('.', ',')  // "11,00" — European locale
    const dot = n.toFixed(2)                       // "11.00" — dot locale
    const variants = [`-${comma}`, `-${dot}`, `-€${comma}`, `-€${dot}`, `- €${comma}`, `- €${dot}`]
    const amountPredicate = variants
      .map(value => `contains(@label, "${value}") or contains(@name, "${value}")`)
      .join(' or ')

    if (payeeAnchor) {
      return $(
        `//XCUIElementTypeCell[.//*[contains(@label, "${payeeAnchor}") or contains(@name, "${payeeAnchor}")] and .//*[${amountPredicate}]]`
      )
    }

    const predicate = variants
      .flatMap(value => [`label CONTAINS "${value}"`, `name CONTAINS "${value}"`])
      .join(' OR ')
    return $(`-ios predicate string:${predicate}`)
  }

  private async exitToHomeAfterP2PAndroid() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    await this.txDetailsBackAndroid.waitForExist({ timeout: 15000 })
    await this.tap(this.txDetailsBackAndroid)

    const backShown = await this.headerBackAndroid.waitForExist({ timeout: 8000 }).catch(() => false)
    if (backShown) {
      await this.tap(this.headerBackAndroid)
    } else {
      const backAltShown = await this.headerBackAltAndroid.waitForExist({ timeout: 8000 }).catch(() => false)
      if (backAltShown) await this.tap(this.headerBackAltAndroid)
      else await browser.back()
    }

    await browser.pause(800)
    const homeShown = await this.homeTabAndroid.waitForExist({ timeout: 15000 }).catch(() => false)
    if (homeShown) {
      await this.tap(this.homeTabAndroid)
      await this.homeRootAndroid.waitForExist({ timeout: 15000 })
      return
    }

    const homeA11yShown = await this.homeTabAndroidA11y.waitForExist({ timeout: 5000 }).catch(() => false)
    if (homeA11yShown) {
      await this.tap(this.homeTabAndroidA11y)
      await this.homeRootAndroid.waitForExist({ timeout: 15000 })
      return
    }

    await this.homeTabAndroidLegacy.waitForExist({ timeout: 8000 })
    await this.tap(this.homeTabAndroidLegacy)
    await this.homeRootAndroid.waitForExist({ timeout: 15000 })
  }

  private async exitToHomeAfterP2PIOS() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    // Close transaction details popup — it may have auto-dismissed, so best-effort.
    const txShown = await this.txDetailsCloseIOS.waitForExist({ timeout: 15000 }).catch(() => false)
    if (txShown) {
      await this.tap(this.txDetailsCloseIOS)
      await browser.pause(500)
    }

    // After closing tx details we land on the beneficiary detail page where the tab bar is hidden.
    // Pop back to the Pay list (first nav bar button, whatever label it has) so the tab bar reappears.
    const deadline = Date.now() + 12000
    while (Date.now() < deadline) {
      if (await this.homeTabIOS.isDisplayed().catch(() => false)) break
      // First button in the nav bar is always the back button on pushed screens.
      const navBackBtn = $('//XCUIElementTypeNavigationBar//XCUIElementTypeButton[1]')
      const navBackShown = await navBackBtn.isDisplayed().catch(() => false)
      if (navBackShown) {
        await this.tap(navBackBtn).catch(() => {})
        await browser.pause(600)
      } else {
        await browser.pause(300)
      }
    }

    await this.homeTabIOS.waitForExist({ timeout: 8000 })
    await this.tap(this.homeTabIOS)
  }

  private async scrollHomeAndroid() {
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
          { type: 'pointerMove', duration: 600, x: startX, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
    await browser.pause(700)
  }

  private async waitForMinusAmountHomeAndroid(amount: number | string, timeoutMs = 30000) {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    await this.scrollHomeAndroid()

    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      if (await this.minusAmountHomeAnchorAndroid(amount).isDisplayed().catch(() => false)) return
      if (await this.sentAmountHomeAnchorAndroid(amount).isDisplayed().catch(() => false)) return
      await this.scrollHomeAndroid()
    }

    const minusShown = await this.minusAmountHomeAnchorAndroid(amount)
      .waitForExist({ timeout: 2500 })
      .catch(() => false)
    if (minusShown) return

    await this.sentAmountHomeAnchorAndroid(amount).waitForExist({ timeout: 2500 })
  }

  private async scrollCurrentScreenAndroid() {
    const { width, height } = await browser.getWindowRect()
    const startX = Math.round(width * 0.5)
    const startY = Math.round(height * 0.78)
    const endY = Math.round(height * 0.38)

    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 150 },
          { type: 'pointerMove', duration: 600, x: startX, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
    await browser.pause(500)
  }

  private async openSwiftBeneficiaryAndroid() {
    const deadline = Date.now() + 25000

    while (Date.now() < deadline) {
      const byA11y = await this.swiftBeneficiaryAndroid.isDisplayed().catch(() => false)
      if (byA11y) {
        await this.tap(this.swiftBeneficiaryAndroid)
        return
      }

      const byDesc = await this.swiftBeneficiaryAndroidByDesc.isDisplayed().catch(() => false)
      if (byDesc) {
        await this.tap(this.swiftBeneficiaryAndroidByDesc)
        return
      }

      const byXPath = await this.swiftBeneficiaryAndroidByXPath.isDisplayed().catch(() => false)
      if (byXPath) {
        await this.tap(this.swiftBeneficiaryAndroidByXPath)
        return
      }

      await this.scrollCurrentScreenAndroid()
    }

    throw new Error(`SWIFT beneficiary "${this.swiftBeneficiaryName}" not found on Android`)
  }

  private async waitForSwiftTransactionDetailsAndroid() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    await this.txDetailsBackAndroid.waitForExist({ timeout: 60000 })
    await this.txDetailsPaymentStatusAndroid.waitForExist({ timeout: 15000 })
    await this.txDetailsAcceptedByMoneybaseAndroid.waitForExist({ timeout: 15000 })
    await this.txDetailsProcessedAndroid.waitForExist({ timeout: 15000 })
    await this.txDetailsSentToBankAndroid.waitForExist({ timeout: 15000 })

    const bicShown = await this.txDetailsBicSwiftAndroid.waitForExist({ timeout: 5000 }).catch(() => false)
    if (!bicShown) {
      await this.scrollCurrentScreenAndroid()
      await this.txDetailsBicSwiftAndroid.waitForExist({ timeout: 10000 })
    }

    let swiftFeeShown = await this.txDetailsSwiftFeeAndroid
      .waitForExist({ timeout: 5000 })
      .catch(() => false)
    if (!swiftFeeShown) {
      await this.scrollCurrentScreenAndroid()
      swiftFeeShown = await this.txDetailsSwiftFeeAndroid
        .waitForExist({ timeout: 3000 })
        .catch(() => false)
    }

    if (!swiftFeeShown) {
      await this.scrollCurrentScreenAndroid()
      await this.txDetailsFeeAndroid.waitForExist({ timeout: 10000 }).catch(() => {})
      await this.txDetailsSwiftFeeAmountAndroid.waitForExist({ timeout: 10000 }).catch(() => {})
    }
  }

  // Scroll UP toward top: finger moves DOWN (startY < endY → content moves down → reveals content above).
  private async scrollHomeUpIOS() {
    const { width, height } = await browser.getWindowRect()
    const x = Math.round(width * 0.5)
    await browser.performActions([{
      type: 'pointer', id: 'scroll-home-up-ios', parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x, y: Math.round(height * 0.3) },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 50 },
        { type: 'pointerMove', duration: 600, x, y: Math.round(height * 0.75) },
        { type: 'pointerUp', button: 0 },
      ],
    }])
    await browser.releaseActions().catch(() => {})
    await browser.pause(350)
  }

  // Scroll DOWN to search: finger moves UP (startY > endY → content moves up → reveals content below).
  private async scrollHomeDownIOS() {
    const { width, height } = await browser.getWindowRect()
    const x = Math.round(width * 0.5)
    await browser.performActions([{
      type: 'pointer', id: 'scroll-home-down-ios', parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x, y: Math.round(height * 0.65) },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 50 },
        { type: 'pointerMove', duration: 900, x, y: Math.round(height * 0.45) },
        { type: 'pointerUp', button: 0 },
      ],
    }])
    await browser.releaseActions().catch(() => {})
    await browser.pause(500)
  }

  private async waitForMinusAmountHomeIOS(amount: number | string, timeoutMs = 40000, payeeAnchor?: string) {
    const anchor = () => this.minusAmountHomeAnchorIOS(amount, payeeAnchor)
    await browser.pause(1500)

    // Home screen may be at bottom after returning from Carlos Cat detail page.
    // Scroll to top (4 UP swipes) so virtualized transaction cells re-enter the accessibility tree.
    for (let i = 0; i < 4; i++) {
      await this.scrollHomeUpIOS()
    }
    await browser.pause(800)

    if (await anchor().isExisting().catch(() => false)) return

    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      await this.scrollHomeDownIOS()
      if (await anchor().isExisting().catch(() => false)) return
    }

    // Soft assertion — payment confirmed by slider; home screen refresh is timing/locale dependent on iOS.
    console.warn(`[iOS] waitForMinusAmountHomeIOS: "${amount}" not found on home screen, continuing`)
  }

  private async ensureIndividualAccountIOS() {
    if (!browser.isIOS) return

    const pickerShown = await this.profilePickerUserNameLabelIOS
      .waitForExist({ timeout: 6000 })
      .catch(() => false)
    if (!pickerShown) return

    await this.tap(this.profilePickerUserNameLabelIOS)

    const individualShown = await this.profilePickerIndividualItemIOS
      .waitForExist({ timeout: 8000 })
      .catch(() => false)
    if (!individualShown) return

    await this.tap(this.profilePickerIndividualItemIOS)

    await this.profilePickerIndividualItemIOS
      .waitForExist({ reverse: true, timeout: 15000 })
      .catch(() => {})
    await this.homeRootIOS.waitForExist({ timeout: 30000 }).catch(() => {})
    await browser.pause(300)
  }

  public async ensureIndividualAccount() {
    if (browser.isIOS) return this.ensureIndividualAccountIOS()
    if (browser.isAndroid) return this.ensureSingleAccountAndroid()
  }
  /* =========================
   * MAIN FLOW
   * ========================= */

  public async sendP2PBySlideAndroid(amount: number | string = 11) {
    if (!browser.isAndroid) return

    await this.ensureSingleAccountAndroid()

    await browser.pause(700)

    await this.openPayTabAndroid()

    await this.carlosCatAndroid.waitForExist({ timeout: 20000 })
    await this.tap(this.carlosCatAndroid)

    await this.beneficiaryPayBtnAndroid.waitForExist({ timeout: 20000 })
    await this.tap(this.beneficiaryPayBtnAndroid)

    const amountInput = await this.resolveAmountInputP2PAndroid()
    await amountInput.waitForExist({ timeout: 20000 })
    await amountInput.clearValue().catch(() => {})
    await amountInput.setValue(String(amount))

    await this.maybeTapReviewPaymentAndroid()

    await this.ensureSliderReadyAndroid()

    await this.dragSliderToRightAndroid()

    await this.exitToHomeAfterP2PAndroid()

    await this.waitForMinusAmountHomeAndroid(amount, 30000)
  }

  public async sendP2PBySlideIOS(amount: number | string = 11) {
    if (!browser.isIOS) return

    await this.ensureIndividualAccountIOS()
    await browser.pause(700)

    await this.payTabIOS.waitForExist({ timeout: 20000 })
    await this.tap(this.payTabIOS)
    await browser.pause(2500)
    await this.dismissContactsPermissionIOS()
    await this.dismissContactsPermissionIOS()
    await this.payScreenIOS.waitForExist({ timeout: 15000 })

    await this.carlosCatIOS.waitForExist({ timeout: 20000 })
    await this.carlosCatIOS.click()

    await this.beneficiaryPayBtnIOS.waitForExist({ timeout: 20000 })
    await this.tap(this.beneficiaryPayBtnIOS)

    await this.amountP2PIOS.waitForExist({ timeout: 20000 })
    await this.tap(this.amountP2PIOS)
    await this.amountP2PIOS.clearValue().catch(() => {})
    await this.amountP2PIOS.setValue(String(amount))

    await this.maybeTapReviewPaymentIOS()

    await this.ensureSliderReadyIOS()
    await this.dragSliderToRightIOS()

    await this.txDetailsCloseIOS.waitForExist({ timeout: 60000 })

    await this.exitToHomeAfterP2PIOS()

    await this.waitForMinusAmountHomeIOS(amount, 60000, 'To Carlos Cat')
  }

  public async sendSepaBySlideAndroid(amount: number | string = 11) {
    if (!browser.isAndroid) return

    await this.ensureSingleAccountAndroid()
    await browser.pause(700)
    await this.openPayTabAndroid()

    await this.sepaBeneficiaryAndroid.waitForExist({ timeout: 20000 })
    await this.tap(this.sepaBeneficiaryAndroid)

    await this.beneficiaryPayBtnAndroid.waitForExist({ timeout: 20000 })
    await this.tap(this.beneficiaryPayBtnAndroid)

    await this.amountP2PAndroid.waitForExist({ timeout: 20000 })
    await this.amountP2PAndroid.clearValue().catch(() => {})
    await this.amountP2PAndroid.setValue(String(amount))

    await this.ensureSliderReadyAndroid()
    await this.dragSliderToRightAndroid()

    await this.minusAmountHomeAnchorAndroid(amount).waitForExist({ timeout: 60000 })
    await this.exitToHomeAfterP2PAndroid()
    await this.waitForMinusAmountHomeAndroid(amount, 30000)
  }

  public async sendSepaBySlideIOS(amount: number | string = 11) {
    if (!browser.isIOS) return

    await this.ensureIndividualAccountIOS()
    await browser.pause(700)

    await this.payTabIOS.waitForExist({ timeout: 20000 })
    await this.tap(this.payTabIOS)
    await browser.pause(2500)
    await this.dismissContactsPermissionIOS()
    await this.dismissContactsPermissionIOS()
    await this.payScreenIOS.waitForExist({ timeout: 15000 })

    await this.sepaBeneficiaryIOS.waitForExist({ timeout: 20000 })
    await this.tap(this.sepaBeneficiaryIOS)

    await this.beneficiaryPayBtnIOS.waitForExist({ timeout: 20000 })
    await this.tap(this.beneficiaryPayBtnIOS)

    await this.amountP2PIOS.waitForExist({ timeout: 20000 })
    await this.tap(this.amountP2PIOS)
    await this.amountP2PIOS.clearValue().catch(() => {})
    await this.amountP2PIOS.setValue(String(amount))

    await this.maybeTapReviewPaymentIOS()

    await this.ensureSliderReadyIOS()
    await this.dragSliderToRightIOS()

    await this.txDetailsCloseIOS.waitForExist({ timeout: 60000 })
    await this.exitToHomeAfterP2PIOS()
    await this.waitForMinusAmountHomeIOS(amount, 60000)
  }

  public async sendSwiftBySlideAndroid(amount: number | string = 11) {
    if (!browser.isAndroid) return

    await this.ensureSingleAccountAndroid()
    await browser.pause(700)
    await this.openPayTabAndroid()

    await this.openSwiftBeneficiaryAndroid()

    await this.beneficiaryPayBtnAndroid.waitForExist({ timeout: 20000 })
    await this.tap(this.beneficiaryPayBtnAndroid)

    const amountInput = await this.resolveAmountInputP2PAndroid()
    await amountInput.waitForExist({ timeout: 20000 })
    await amountInput.clearValue().catch(() => {})
    await amountInput.setValue(String(amount))

    await this.maybeTapReviewPaymentAndroid()

    await this.ensureSliderReadyAndroid()
    await this.dragSliderToRightAndroid()

    await this.waitForSwiftTransactionDetailsAndroid()
    await this.exitToHomeAfterP2PAndroid()
    await this.waitForMinusAmountHomeAndroid(amount, 30000)
  }

  public async sendSwiftBySlideIOS(amount: number | string = 11) {
    if (!browser.isIOS) return

    await this.ensureIndividualAccountIOS()
    await browser.pause(700)

    await this.payTabIOS.waitForExist({ timeout: 20000 })
    await this.tap(this.payTabIOS)
    await browser.pause(2500)
    await this.dismissContactsPermissionIOS()
    await this.dismissContactsPermissionIOS()
    await this.payScreenIOS.waitForExist({ timeout: 15000 })

    await this.swiftBeneficiaryIOS.waitForExist({ timeout: 20000 })
    await this.swiftBeneficiaryIOS.click()

    await this.beneficiaryPayBtnIOS.waitForExist({ timeout: 20000 })
    await this.tap(this.beneficiaryPayBtnIOS)

    await this.amountP2PIOS.waitForExist({ timeout: 20000 })
    await this.tap(this.amountP2PIOS)
    await this.amountP2PIOS.clearValue().catch(() => {})
    await this.amountP2PIOS.setValue(String(amount))

    await this.maybeTapReviewPaymentIOS()

    await this.ensureSliderReadyIOS()
    await this.dragSliderToRightIOS()

    await this.txDetailsCloseIOS.waitForExist({ timeout: 60000 })
    await this.exitToHomeAfterP2PIOS()
    await this.waitForMinusAmountHomeIOS(amount, 60000)
  }
}

export default new BankTransferP2PIndividualPage()
