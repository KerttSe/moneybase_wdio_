import BasePage from './BasePage'
import { openIOSPaymentReview } from '../helpers/iosPayment.helper'
import { $, browser } from '@wdio/globals'
import BankTransferP2PIndividualPage from './BankTransferP2PIndividualPage'
import HomeScreenPage from './HomeScreenPage'

class BankTransferSepaIndividualPage extends BasePage {
  private readonly sepaBankName = 'HSBC Bank Malta plc'

  private readonly sepaIban = 'MT96 MMEB 4433 6000 0000 3321 1350 454'

  private readonly sepaIbanPrefix = 'MT96 MMEB'

  private readonly sepaIbanTail = '1350 454'

  private byAndroidResId(id: string) {
    return $(`(//*[@resource-id="com.moneybase.qa:id/${id}"] | //*[@resource-id="${id}"] | //*[contains(@resource-id,"${id}")] | //*[@content-desc="${id}"])[1]`)
  }


  private get payTabAndroid() {
    return this.byAndroidResId('navigation_button_pay')
  }

  private get payTabAndroidLegacy() {
    return $('(//android.widget.FrameLayout[@content-desc="Pay"] | //*[@content-desc="Pay" and @clickable="true"])[1]')
  }

  private get sepaBeneficiaryAndroidByDesc() {
    return $(`~${this.sepaBankName}\n${this.sepaIban}`)
  }

  private get sepaBeneficiaryAndroidByIbanDesc() {
    return $(`//*[contains(@content-desc,"${this.sepaIbanPrefix}") or contains(@text,"${this.sepaIbanPrefix}")]`)
  }

  private get sepaBeneficiaryAndroidByIbanText() {
    return $(`//android.widget.TextView[contains(@text,"${this.sepaIbanPrefix}")]/ancestor-or-self::*[@clickable="true"][1]`)
  }

  private get sepaBeneficiaryAndroidByIbanTailDesc() {
    return $(`//*[contains(@content-desc,"${this.sepaIbanTail}") or contains(@text,"${this.sepaIbanTail}")]`)
  }

  private get sepaBeneficiaryAndroidByIbanTailText() {
    return $(`//android.widget.TextView[contains(@text,"${this.sepaIbanTail}")]/ancestor-or-self::*[@clickable="true"][1]`)
  }

  private get sepaBeneficiaryAndroidByBankText() {
    return $(`//*[contains(@text,"${this.sepaBankName}") or contains(@content-desc,"${this.sepaBankName}")]`)
  }

  private get beneficiaryPayBtnAndroid() {
    return $('//*[contains(@resource-id,"beneficiaryDetails_button_pay") or @content-desc="beneficiaryDetails_button_pay"]')
  }

  private get amountInputAndroidLegacy() {
    return $('id=com.moneybase.qa:id/paymentAmount')
  }

  private get amountInputAndroidAcc() {
    return $('~makePayment_input_amount')
  }

  private get amountInputAndroidNew() {
    // New make-payment screen (Compose)
    return this.byAndroidResId('bankTransfer_input_amount')
  }

  private get amountInputAndroidNewAlt() {
    // Some flows still reuse p2p naming; keep as fallback
    return this.byAndroidResId('p2p_input_amount')
  }

  private async resolveAmountInputSepaAndroid() {
    const accShown = await this.amountInputAndroidAcc.isDisplayed().catch(() => false)
    if (accShown) return this.amountInputAndroidAcc

    const legacyShown = await this.amountInputAndroidLegacy.isDisplayed().catch(() => false)
    if (legacyShown) return this.amountInputAndroidLegacy

    const newShown = await this.amountInputAndroidNew.waitForExist({ timeout: 8000 }).catch(() => false)
    if (newShown) return this.amountInputAndroidNew

    await this.amountInputAndroidNewAlt.waitForExist({ timeout: 20000 })
    return this.amountInputAndroidNewAlt
  }

  private get reviewPaymentBtnAndroid() {
    return $(
      '(//*[contains(@resource-id,"sepa_button_review_payment")]' +
      ' | //*[contains(@resource-id,"bankTransfer_button_review_payment")]' +
      ' | //*[contains(@content-desc,"sepa_button_review_payment")]' +
      ' | //*[contains(@content-desc,"bankTransfer_button_review_payment")])[1]'
    )
  }

  private async maybeTapReviewPaymentAndroid() {
    if (!browser.isAndroid) return

    const shown = await this.reviewPaymentBtnAndroid.waitForExist({ timeout: 3000 }).catch(() => false)
    if (!shown) return

    await browser.hideKeyboard().catch(() => {})

    await browser
      .waitUntil(async () => await this.reviewPaymentBtnAndroid.isEnabled().catch(() => false), {
        timeout: 20000,
        interval: 250,
      })
      .catch(() => {})

    await this.tap(this.reviewPaymentBtnAndroid)
  }

  private get sliderWrapperAndroidLegacy() {
    return $('id=com.moneybase.qa:id/clPaymentBankTransferSliderWrapper')
  }

  private get seekBarAndroidLegacy() {
    return $('//*[@resource-id="com.moneybase.qa:id/slideButton"]//android.widget.SeekBar')
  }

  private get verificationSliderWrapperAndroid() {
    return this.byAndroidResId('varificationOfPayee_slider_confirm')
  }

  private get verificationSeekBarAndroid() {
    return $(
      '//*[@resource-id="varificationOfPayee_slider_confirm" or @resource-id="com.moneybase.qa:id/varificationOfPayee_slider_confirm"]//android.widget.SeekBar'
    )
  }

  private get slideTextAndroid() {
    return $('//*[contains(@text,"Slide to make payment") or contains(@content-desc,"Slide to make payment")]')
  }

  private get slideDescAndroid() {
    return $('//*[contains(@content-desc,"Slide to make payment") or contains(@text,"Slide to make payment")]')
  }

  private get txDetailsBackAndroid() {
    return this.byAndroidResId('transactionDetails_button_back')
  }

  private get headerBackAndroid() {
    return this.byAndroidResId('beneficiaryDetails_button_back')
  }

  private get headerBackAltAndroid() {
    return $('(//*[@content-desc="Back" and @clickable="true"] | //*[@content-desc="Navigate up"])[1]')
  }

  private get homeTabAndroid() {
    return this.byAndroidResId('navigation_button_home')
  }

  private get homeTabAndroidA11y() {
    return $('~Home')
  }

  private get homeTabAndroidLegacy() {
    return $('(//*[contains(@resource-id,"navigation_button_home")] | //*[@content-desc="Home" and @clickable="true"])[1]')
  }

  private get homeRootAndroid() {
    return this.byAndroidResId('home_screen')
  }

  private get profilePickerUserNameLabelIOS() {
    return $('~profilePicker_label_userName')
  }

  private get profilePickerIndividualItemIOS() {
    return $('-ios predicate string:name == "Individual" OR label == "Individual"')
  }

  private get homeRootIOS() {
    return $('~home_screen_view')
  }

  private get payTabIOS() {
    return $('~Pay')
  }

  private get payScreenIOS() {
    return $(
      '-ios predicate string:name == "pay_screen_view" OR name == "pay_button_add" OR (type == "XCUIElementTypeNavigationBar" AND name == "Pay") OR (type == "XCUIElementTypeButton" AND name == "New")'
    )
  }

  private get contactsPermissionScreenIOS() {
    return $('-ios predicate string:name == "ic_contacts_permission" OR label == "ic_contacts_permission" OR name == "Enable Contacts" OR label == "Enable Contacts"')
  }

  private async tapPayTabAndWaitIOS() {
    await this.payTabIOS.waitForExist({ timeout: 20000 })
    await browser.waitUntil(
      async () => {
        await this.tap(this.payTabIOS).catch(() => {})
        const onPay = await this.payScreenIOS.isExisting().catch(() => false)
        const onContacts = await this.contactsPermissionScreenIOS.isExisting().catch(() => false)
        return onPay || onContacts
      },
      { timeout: 25000, interval: 1500 }
    )
  }

  private get payAddBtnIOS() {
    return $('~pay_button_add')
  }

  private get sepaBeneficiaryIOS() {
    return $(`~${this.sepaBankName}\n${this.sepaIban}`)
  }

  private get sepaBeneficiaryIOSByIban() {
    return $(`//XCUIElementTypeCell//*[contains(@label,"${this.sepaIbanPrefix}") or contains(@name,"${this.sepaIbanPrefix}") or contains(@label,"${this.sepaIbanTail}") or contains(@name,"${this.sepaIbanTail}")]`)
  }

  private get sepaBeneficiaryIOSByBankName() {
    return $(`//XCUIElementTypeCell//*[contains(@label,"${this.sepaBankName}") or contains(@name,"${this.sepaBankName}")]`)
  }

  private get beneficiaryPayBtnIOS() {
    return $('~beneficiaryDetails_button_pay')
  }

  private get amountInputIOS() {
    return $('~makePayment_input_amount')
  }

  private get reviewPaymentBtnIOS() {
    return $('~makePayment_button_review')
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

  private async ensureIndividualAccountIOS() {
    if (!browser.isIOS) return

    await HomeScreenPage.ensureIndividualAccount()
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
    await openIOSPaymentReview()
  }

  private async waitForPaymentCompletedIOS(timeoutMs = 15000) {
    const deadline = Date.now() + timeoutMs

    while (Date.now() < deadline) {
      const detailsShown = await this.txDetailsCloseIOS.isDisplayed().catch(() => false)
      if (detailsShown) return

      // Lorenzo build navigates back to beneficiary detail screen after payment instead of
      // showing a transaction details popup — treat that as payment completed too.
      const beneficiaryDetailShown = await this.beneficiaryPayBtnIOS.isDisplayed().catch(() => false)
      if (beneficiaryDetailShown) return

      await browser.pause(250)
    }

    // Accept either outcome: tx details popup or beneficiary detail screen.
    const txShown = await this.txDetailsCloseIOS.isDisplayed().catch(() => false)
    const beneficiaryShown = await this.beneficiaryPayBtnIOS.isDisplayed().catch(() => false)
    if (!txShown && !beneficiaryShown) {
      await this.txDetailsCloseIOS.waitForExist({ timeout: 3000 })
    }
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

      const detailsShown = await this.txDetailsCloseIOS.isDisplayed().catch(() => false)
      if (detailsShown) return

      const stillThere = await this.slideTextIOS.isDisplayed().catch(() => false)
      if (!stillThere) {
        await this.waitForPaymentCompletedIOS()
        return
      }
    }

    throw new Error('Slider drag did not trigger payment (SEPA iOS)')
  }

  private async exitToHomeAfterPaymentIOS() {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    const txShown = await this.txDetailsCloseIOS.waitForExist({ timeout: 15000 }).catch(() => false)
    if (txShown) {
      await this.tap(this.txDetailsCloseIOS)
      await browser.pause(500)
    }
    // After closing tx details the app may be on the beneficiary detail page with the tab bar hidden.
    // Poll for nav-bar back button (name varies by screen) until Home tab is visible.
    const deadline = Date.now() + 12000
    while (Date.now() < deadline) {
      if (await this.homeTabIOS.isDisplayed().catch(() => false)) break
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

  private minusAmountHomeAnchorIOS(amount: number | string) {
    const n = Number(amount)
    const comma = n.toFixed(2).replace('.', ',')  // "11,00" — European locale
    const dot = n.toFixed(2)                       // "11.00" — dot locale
    // No € requirement — currency symbol may be a separate element on the home screen.
    // XPath union operator is broken in Appium XCUITest → use predicate string with OR.
    const variants = [`-${comma}`, `-${dot}`, `-€${comma}`, `-€${dot}`, `- €${comma}`, `- €${dot}`]
    const predicate = variants
      .flatMap(v => [`label CONTAINS "${v}"`, `name CONTAINS "${v}"`])
      .join(' OR ')
    return $(`-ios predicate string:${predicate}`)
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

  private async waitForMinusAmountHomeIOS(amount: number | string, timeoutMs = 40000) {
    const anchor = () => this.minusAmountHomeAnchorIOS(amount)
    await browser.pause(1500)
    // Home screen may be at bottom after returning from beneficiary detail page.
    // Scroll to top so virtualized transaction cells re-enter the accessibility tree.
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
    throw new Error(`[iOS] Expected an outgoing SEPA transaction for ${amount} on Home`)
  }

  private minusAmountHomeAnchorAndroid(amount: number | string) {
    const formatted = Number(amount).toFixed(2)
    return $(`//*[contains(@text,"- €${formatted}") or contains(@content-desc,"- €${formatted}")]`)
  }

  private sentAmountHomeAnchorAndroid(amount: number | string) {
    const formatted = Number(amount).toFixed(2)
    return $(`//*[contains(@text,"Sent €${formatted}") or contains(@content-desc,"Sent €${formatted}")]`)
  }

  private async scrollBeneficiariesAndroid() {
    const { width, height } = await browser.getWindowRect()
    const x = Math.round(width * 0.5)
    const startY = Math.round(height * 0.78)
    const endY = Math.round(height * 0.38)

    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 120 },
          { type: 'pointerMove', duration: 500, x, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
    await browser.pause(350)
  }

  private get paySearchInputAndroid() {
    return $('(//*[contains(@resource-id,"pay_input_search") or contains(@resource-id,"payees_input_search")])[1]')
  }

  private async searchAndSelectSepaBeneficiaryAndroid(): Promise<boolean> {
    const searchInput = this.paySearchInputAndroid
    const searchVisible = await searchInput.isDisplayed().catch(() => false)
    if (!searchVisible) return false

    await this.tap(searchInput)
    await browser.pause(300)

    const editText = $('(//android.widget.EditText)[1]')
    const editVisible = await editText.isDisplayed().catch(() => false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typingTarget: WebdriverIO.Element = (editVisible ? editText : searchInput) as any

    await typingTarget.clearValue().catch(() => {})
    await typingTarget.addValue(this.sepaIbanPrefix).catch(async () => {
      await typingTarget.setValue(this.sepaIbanPrefix)
    })
    await browser.pause(800)

    const deadline = Date.now() + 10000
    while (Date.now() < deadline) {
      const byIbanDesc = await this.sepaBeneficiaryAndroidByIbanDesc.isDisplayed().catch(() => false)
      if (byIbanDesc) { await this.tap(this.sepaBeneficiaryAndroidByIbanDesc); return true }
      const byIbanText = await this.sepaBeneficiaryAndroidByIbanText.isDisplayed().catch(() => false)
      if (byIbanText) { await this.tap(this.sepaBeneficiaryAndroidByIbanText); return true }
      const byBank = await this.sepaBeneficiaryAndroidByBankText.isDisplayed().catch(() => false)
      if (byBank) { await this.tap(this.sepaBeneficiaryAndroidByBankText); return true }
      await browser.pause(500)
    }
    return false
  }

  private async openSepaBeneficiaryAndroid() {
    const deadline = Date.now() + 25000

    while (Date.now() < deadline) {
      const byIbanDesc = await this.sepaBeneficiaryAndroidByIbanDesc.isDisplayed().catch(() => false)
      if (byIbanDesc) { await this.tap(this.sepaBeneficiaryAndroidByIbanDesc); return }

      const byIbanText = await this.sepaBeneficiaryAndroidByIbanText.isDisplayed().catch(() => false)
      if (byIbanText) { await this.tap(this.sepaBeneficiaryAndroidByIbanText); return }

      const byIbanTailDesc = await this.sepaBeneficiaryAndroidByIbanTailDesc.isDisplayed().catch(() => false)
      if (byIbanTailDesc) { await this.tap(this.sepaBeneficiaryAndroidByIbanTailDesc); return }

      const byIbanTailText = await this.sepaBeneficiaryAndroidByIbanTailText.isDisplayed().catch(() => false)
      if (byIbanTailText) { await this.tap(this.sepaBeneficiaryAndroidByIbanTailText); return }

      const byDesc = await this.sepaBeneficiaryAndroidByDesc.isDisplayed().catch(() => false)
      if (byDesc) { await this.tap(this.sepaBeneficiaryAndroidByDesc); return }

      const byBank = await this.sepaBeneficiaryAndroidByBankText.isDisplayed().catch(() => false)
      if (byBank) { await this.tap(this.sepaBeneficiaryAndroidByBankText); return }

      // Compose build: IBANs not visible in list — try searching via pay_input_search
      const found = await this.searchAndSelectSepaBeneficiaryAndroid()
      if (found) return

      await this.scrollBeneficiariesAndroid()
    }

    throw new Error('SEPA beneficiary not found on Android')
  }

  private async ensureSliderReadyAndroid() {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    await browser.hideKeyboard().catch(() => {})

    await browser
      .waitUntil(
        async () =>
          (await this.sliderWrapperAndroidLegacy.isDisplayed().catch(() => false)) ||
          (await this.verificationSliderWrapperAndroid.isDisplayed().catch(() => false)),
        { timeout: 30000, interval: 250 }
      )
      .catch(() => {})
  }

  private async resolveSeekBarSepaAndroid() {
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

  private async waitForPaymentCompletedAndroid(timeoutMs = 15000) {
    const deadline = Date.now() + timeoutMs

    while (Date.now() < deadline) {
      const detailsShown = await this.txDetailsBackAndroid.isDisplayed().catch(() => false)
      if (detailsShown) return

      await browser.pause(250)
    }

    await this.txDetailsBackAndroid.waitForExist({ timeout: 3000 })
  }

  private async dragSliderToRightAndroid() {
    const legacyShown = await this.seekBarAndroidLegacy.isDisplayed().catch(() => false)

    // Prefer dragging from the thumb/handle (works for new verification sheet)
    const thumbShown = await this.slideDescAndroid.isDisplayed().catch(() => false)
    const dragEl = legacyShown ? this.seekBarAndroidLegacy : thumbShown ? this.slideDescAndroid : await this.resolveSeekBarSepaAndroid()

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

      await browser.pause(600)

      const detailsShown = await this.txDetailsBackAndroid.isDisplayed().catch(() => false)
      if (detailsShown) return

      const stillThere = await this.isSlideHintVisibleAndroid()
      if (!stillThere) {
        await this.waitForPaymentCompletedAndroid()
        return
      }
    }

    throw new Error('Slider drag did not trigger payment (SEPA Android)')
  }

  private async exitToHomeAfterPaymentAndroid() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    const txBackShown = await this.txDetailsBackAndroid.waitForExist({ timeout: 15000 }).catch(() => false)
    if (txBackShown) await this.txDetailsBackAndroid.click()
    else await browser.back()

    const backShown = await this.headerBackAndroid.waitForExist({ timeout: 8000 }).catch(() => false)
    if (backShown) {
      await this.headerBackAndroid.click()
    } else {
      const backAltShown = await this.headerBackAltAndroid.waitForExist({ timeout: 8000 }).catch(() => false)
      if (backAltShown) await this.headerBackAltAndroid.click()
      else await browser.back()
    }

    await browser.pause(800)
    const homeShown = await this.homeTabAndroid.waitForExist({ timeout: 15000 }).catch(() => false)
    if (homeShown) {
      await this.homeTabAndroid.click()
      await this.homeRootAndroid.waitForExist({ timeout: 15000 })
      return
    }

    const homeA11yShown = await this.homeTabAndroidA11y.waitForExist({ timeout: 5000 }).catch(() => false)
    if (homeA11yShown) {
      await this.homeTabAndroidA11y.click()
      await this.homeRootAndroid.waitForExist({ timeout: 15000 })
      return
    }

    await this.homeTabAndroidLegacy.waitForExist({ timeout: 8000 })
    await this.homeTabAndroidLegacy.click()
    await this.homeRootAndroid.waitForExist({ timeout: 15000 })
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

    const minusShown = await this.minusAmountHomeAnchorAndroid(amount).waitForExist({ timeout: 2500 }).catch(() => false)
    if (minusShown) return

    await this.sentAmountHomeAnchorAndroid(amount).waitForExist({ timeout: 2500 })
  }

  private async dismissBlockingAlertAndroid(timeoutMs = 8000) {
    const dismissed = await this.dismissCommonAndroidAlert(timeoutMs).catch(() => false)
    if (dismissed) await browser.pause(250)
  }

  private async openSepaBeneficiaryIOS() {
    const deadline = Date.now() + 25000

    while (Date.now() < deadline) {
      const byIban = await this.sepaBeneficiaryIOSByIban.isDisplayed().catch(() => false)
      if (byIban) {
        await this.tap(this.sepaBeneficiaryIOSByIban)
        return
      }

      const byA11y = await this.sepaBeneficiaryIOS.isDisplayed().catch(() => false)
      if (byA11y) {
        await this.tap(this.sepaBeneficiaryIOS)
        return
      }

      const byBank = await this.sepaBeneficiaryIOSByBankName.isDisplayed().catch(() => false)
      if (byBank) {
        await this.tap(this.sepaBeneficiaryIOSByBankName)
        return
      }

      const { width, height } = await browser.getWindowRect()
      const x = Math.round(width * 0.5)
      const startY = Math.round(height * 0.78)
      const endY = Math.round(height * 0.38)

      await browser.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x, y: startY },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 120 },
            { type: 'pointerMove', duration: 500, x, y: endY },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])
      await browser.releaseActions().catch(() => {})
      await browser.pause(350)
    }

    throw new Error('SEPA beneficiary not found on iOS')
  }

  public async ensureIndividualAccount() {
    if (browser.isIOS) {
      await this.ensureIndividualAccountIOS()
      return
    }

    await BankTransferP2PIndividualPage.ensureIndividualAccount()
  }

  public async openSepaToReviewPaymentAndroid(amount: number | string = 11) {
    if (!browser.isAndroid) return

    const amountInput = await this.openSepaAmountInputAndroid()
    await amountInput.clearValue().catch(() => {})
    await amountInput.setValue(String(amount))

    await this.maybeTapReviewPaymentAndroid()
  }

  private async openSepaAmountInputAndroid() {
    await this.openSepaBeneficiaryDetailsAndroid()
    return this.continueToSepaAmountAndroid()
  }

  private async openSepaBeneficiaryDetailsAndroid() {
    await BankTransferP2PIndividualPage.ensureIndividualAccount()
    const payDeadline = Date.now() + 45000
    let payOpened = false

    while (Date.now() < payDeadline && !payOpened) {
      await this.dismissKnownAndroidBlockingPopups(4).catch(() => false)
      await this.dismissBlockingAlertAndroid(1500)
      await this.stabilizeAndroidHomeSurface(3000).catch(() => false)

      if (await this.payTabAndroid.isDisplayed().catch(() => false)) {
        await this.tap(this.payTabAndroid)
        payOpened = true
      } else if (await this.payTabAndroidLegacy.isDisplayed().catch(() => false)) {
        await this.tap(this.payTabAndroidLegacy)
        payOpened = true
      } else {
        await browser.pause(500)
      }
    }

    if (!payOpened) throw new Error('Pay navigation was not available after dismissing Android blocking surfaces')

    await this.openSepaBeneficiaryAndroid()
  }

  private async continueToSepaAmountAndroid() {
    await this.beneficiaryPayBtnAndroid.waitForExist({ timeout: 20000 })
    await this.tap(this.beneficiaryPayBtnAndroid)

    const amountInput = await this.resolveAmountInputSepaAndroid()
    await amountInput.waitForExist({ timeout: 20000 })
    return amountInput
  }

  private async openSepaAmountInput() {
    return browser.isIOS ? this.openSepaAmountInputIOS() : this.openSepaAmountInputAndroid()
  }

  public async openSepaToReview(amount: number | string) {
    if (browser.isAndroid) {
      await this.openSepaToReviewPaymentAndroid(amount)
    } else {
      await this.prepareSmokeSepaIOS(amount)
      await this.maybeTapReviewPaymentIOS()
    }
  }

  public async verifySepaAmountRules() {
    const input = await this.openSepaAmountInput()
    const read = () => browser.isIOS ? input.getAttribute('value') : input.getText()
    await input.click()
    await input.clearValue()
    await input.addValue('12345678')
    const baseline = await read()
    if (!baseline.replace(/\D/g, '').startsWith('12345678')) {
      throw new Error('Expected eight leading digits before testing the ninth digit')
    }
    await input.addValue('9')
    const actual = await read()
    if (actual !== baseline) {
      throw new Error(`Expected ninth digit to be rejected, amount changed from "${baseline}" to "${actual}"`)
    }

    await input.clearValue()
    const belowMinimum = process.env.SEPA_TEST_BELOW_MIN_AMOUNT || '0.01'
    if (!/^\d+(?:\.\d+)?$/.test(belowMinimum) || Number(belowMinimum) <= 0) {
      throw new Error('SEPA_TEST_BELOW_MIN_AMOUNT must be a positive decimal amount')
    }
    await input.setValue(belowMinimum)
    const entered = (await read()).replace(/[^\d.,]/g, '').replace(',', '.')
    if (!entered || Number(entered) !== Number(belowMinimum)) throw new Error('The payment draft did not retain the below-minimum fixture amount')
    if (await browser.isKeyboardShown()) await browser.hideKeyboard()
    const minimumError = browser.isIOS
      ? $('-ios predicate string:label CONTAINS[c] "minimum" AND (label CONTAINS[c] "amount" OR label CONTAINS[c] "payment")')
      : $('//*[contains(translate(@text,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz"),"minimum") and (contains(translate(@text,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz"),"amount") or contains(translate(@text,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz"),"payment"))]')
    await minimumError.waitForDisplayed({ timeout: 10000, timeoutMsg: 'TC3276: the seeded below-minimum amount should show a minimum error' })
    const review = browser.isIOS ? this.reviewPaymentBtnIOS : this.reviewPaymentBtnAndroid
    await review.waitForEnabled({ reverse: true, timeout: 10000 })

    await input.clearValue()
    await input.setValue('11')
    if (await browser.isKeyboardShown()) await browser.hideKeyboard()
    const instant = browser.isIOS
      ? $('-ios predicate string:label CONTAINS[c] "within seconds" OR (label CONTAINS[c] "instant" AND label CONTAINS[c] "second")')
      : $('//*[contains(translate(@text,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz"),"within seconds") or (contains(translate(@text,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz"),"instant") and contains(translate(@text,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz"),"second"))]')
    await instant.waitForDisplayed({ timeout: 10000, timeoutMsg: 'TC3278: the SEPA Instant fixture should show a timing hint for EUR 11' })
  }

  public async verifyPaymentReferenceLimit() {
    await this.openSepaAmountInput()
    const reference = browser.isIOS
      ? $('-ios predicate string:type IN {"XCUIElementTypeTextField", "XCUIElementTypeTextView"} AND (name CONTAINS[c] "reference" OR label CONTAINS[c] "reference" OR value == "Reference")')
      : $('(//android.widget.EditText[contains(@resource-id,"reference") or @content-desc="Reference" or @text="Reference" or .//android.widget.TextView[@text="Reference"]] | //*[contains(@resource-id,"input_reference")]//android.widget.EditText)[1]')
    const read = () => browser.isIOS ? reference.getAttribute('value') : reference.getText()
    await reference.waitForDisplayed({ timeout: 15000 })
    await reference.clearValue()
    const limit = '1234567890'.repeat(14)
    await reference.setValue(limit)
    if (await read() !== limit) throw new Error('Expected the form to retain a 140-character reference')
    await reference.addValue('X')
    if (await read() !== limit) throw new Error('The payment reference accepted a 141st character')
  }

  public async verifyNoFeeInSepaReview() {
    const feeRow = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeStaticText" AND (label IN {"Fee", "Transfer Fee"} OR label BEGINSWITH[c] "Fee:")')
      : $('(//*[@text="Fee" or @text="Transfer Fee" or @content-desc="Fee" or starts-with(@content-desc,"Fee:")])[1]')
    if (!await feeRow.isDisplayed()) return
    const value = await feeRow.getText()
    const row = feeRow.$('..')
    const content = [value, await feeRow.getAttribute(browser.isIOS ? 'label' : 'content-desc'), await row.getText()]
    const children = row.$$(browser.isIOS ? './/XCUIElementTypeStaticText' : './/android.widget.TextView')
    content.push(...await children.map(child => child.getText()))
    const amounts = content.join(' ').match(/[€£$]\s*\d+(?:[.,]\d{2})?|\b\d+[.,]\d{2}\s*(?:EUR|GBP|USD)\b/g) || []
    if (amounts.length === 0 || amounts.some(amount => /[1-9]/.test(amount))) {
      throw new Error('The SEPA review fee row was present without an observable zero fee')
    }
  }

  public async verifyReturningFromReviewPreservesAmount(amount: string) {
    const input = browser.isIOS ? this.amountInputIOS : await this.resolveAmountInputSepaAndroid()
    await input.waitForDisplayed({ timeout: 15000 })
    const actual = (browser.isIOS ? await input.getAttribute('value') : await input.getText()).replace(/[^\d.,]/g, '')
    if (actual !== amount && actual !== `${amount}.00` && actual !== `${amount},00`) {
      throw new Error(`Expected amount ${amount} after closing review, got "${actual}"`)
    }
  }

  public async sendSepaBySlideAndroid(amount: number | string = 11) {
    if (!browser.isAndroid) return
    await this.prepareSmokeSepaAndroid(amount)
    await this.submitSmokeSepaAndroid(amount)
    await this.verifySmokeSepaAndroid(amount)
  }

  public async prepareSmokeSepaAndroid(amount: number | string = 11) {

    await this.openSepaToReviewPaymentAndroid(amount)
  }

  public async submitSmokeSepaAndroid(amount: number | string = 11) {

    await this.ensureSliderReadyAndroid()
    await this.dragSliderToRightAndroid()
  }

  public async verifySmokeSepaAndroid(amount: number | string = 11) {

    await this.exitToHomeAfterPaymentAndroid()
    await this.waitForMinusAmountHomeAndroid(amount, 30000)
  }

  public async sendSepaBySlideIOS(amount: number | string = 11) {
    if (!browser.isIOS) return
    await this.prepareSmokeSepaIOS(amount)
    await this.submitSmokeSepaIOS(amount)
    await this.verifySmokeSepaIOS(amount)
  }

  public async prepareSmokeSepaIOS(amount: number | string = 11) {
    const input = await this.openSepaAmountInputIOS()
    await this.tap(input)
    await input.clearValue().catch(() => {})
    await input.setValue(String(amount))
  }

  private async openSepaAmountInputIOS() {
    await this.openSepaBeneficiaryDetailsIOS()
    return this.continueToSepaAmountIOS()
  }

  private async openSepaBeneficiaryDetailsIOS() {
    await this.ensureIndividualAccountIOS()
    await this.tapPayTabAndWaitIOS()
    await browser.pause(2500)
    await this.dismissContactsPermissionIOS()
    await this.dismissContactsPermissionIOS()
    await this.payScreenIOS.waitForExist({ timeout: 15000 })

    await this.payAddBtnIOS.waitForExist({ timeout: 15000 })
    await this.tap(this.payAddBtnIOS)

    await this.openSepaBeneficiaryIOS()
  }

  private async continueToSepaAmountIOS() {
    await this.beneficiaryPayBtnIOS.waitForExist({ timeout: 20000 })
    await this.tap(this.beneficiaryPayBtnIOS)

    await this.amountInputIOS.waitForExist({ timeout: 20000 })
    return this.amountInputIOS
  }

  public async verifyBeneficiaryCopyAndOpenReview(amount: number | string) {
    if (browser.isIOS) await this.openSepaBeneficiaryDetailsIOS()
    else await this.openSepaBeneficiaryDetailsAndroid()

    for (const field of ['IBAN', 'BIC']) {
      const row = browser.isIOS
        ? $(`//XCUIElementTypeCell[.//XCUIElementTypeStaticText[@label="${field}"]] | //XCUIElementTypeButton[@label="${field}" or contains(@name,"copy${field}")]`)
        : $(`(//*[@text="${field}" or @content-desc="${field}"]/ancestor-or-self::*[@clickable="true"][1])[1]`)
      await this.tap(row, 10000)
      const copied = browser.isIOS
        ? $(`-ios predicate string:label CONTAINS[c] "${field}" AND label CONTAINS[c] "copied"`)
        : $(`//*[contains(@text,"${field}") and contains(translate(@text,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz"),"copied")]`)
      await copied.waitForExist({ timeout: 5000, timeoutMsg: `TC3321: expected copy confirmation for ${field}` })
    }

    const input = browser.isIOS ? await this.continueToSepaAmountIOS() : await this.continueToSepaAmountAndroid()
    if (browser.isIOS) await this.tap(input)
    await input.clearValue().catch(() => {})
    await input.setValue(String(amount))
    if (browser.isIOS) await this.maybeTapReviewPaymentIOS()
    else await this.maybeTapReviewPaymentAndroid()
  }

  public async submitSmokeSepaIOS(amount: number | string = 11) {

    await this.maybeTapReviewPaymentIOS()

    await this.ensureSliderReadyIOS()
    await this.dragSliderToRightIOS()
  }

  public async verifySmokeSepaIOS(amount: number | string = 11) {

    // Lorenzo build may navigate to beneficiary detail screen instead of tx details popup.
    const txShown = await this.txDetailsCloseIOS.waitForExist({ timeout: 60000 }).catch(() => false)
    if (!txShown) {
      await this.beneficiaryPayBtnIOS.waitForExist({ timeout: 5000 })
    }
    await this.exitToHomeAfterPaymentIOS()
    await this.waitForMinusAmountHomeIOS(amount, 60000)
  }
}

export default new BankTransferSepaIndividualPage()
