import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'
import BankTransferP2PIndividualPage from './BankTransferP2PIndividualPage'

class BankTransferSepaIndividualPage extends BasePage {
  private readonly sepaBankName = 'HSBC Bank Malta plc'

  private readonly sepaIban = 'MT96 MMEB 4433 6000 0000 3321 1350 454'

  private readonly sepaIbanPrefix = 'MT96 MMEB'

  private readonly sepaIbanTail = '1350 454'

  private byAndroidResId(id: string) {
    const rx = `.*:id/${id}$|^${id}$`
    return $(`android=new UiSelector().resourceIdMatches("${rx}")`)
  }

  private byAndroidResIdMatches(rx: string) {
    return $(`android=new UiSelector().resourceIdMatches("${rx}")`)
  }

  private get payTabAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_button_pay")')
  }

  private get payTabAndroidLegacy() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_bar_item_icon_container").instance(2)')
  }

  private get alertTitleAndroid() {
    return $('id=com.moneybase.qa:id/alertTitle')
  }

  private get alertBtn3Android() {
    return $('android=new UiSelector().resourceId("android:id/button3")')
  }

  private get payAddBtnAndroidByDesc() {
    return $('~pay_button_add')
  }

  private get payAddBtnAndroidById() {
    return $('//*[@resource-id="pay_button_add"]')
  }

  private get newBtnAndroid() {
    // accessibility id: New
    return $('~New')
  }

  private get newBtnAndroidByText() {
    return $('android=new UiSelector().text("New")')
  }

  private get newTransferTitleAndroid() {
    return $('android=new UiSelector().text("New Transfer")')
  }

  private get sepaBeneficiaryAndroidByDesc() {
    return $(`~${this.sepaBankName}\n${this.sepaIban}`)
  }

  private get sepaBeneficiaryAndroidByIbanDesc() {
    return $(`android=new UiSelector().descriptionContains("${this.sepaIbanPrefix}")`)
  }

  private get sepaBeneficiaryAndroidByIbanText() {
    return $(`android=new UiSelector().textContains("${this.sepaIbanPrefix}")`)
  }

  private get sepaBeneficiaryAndroidByIbanTailDesc() {
    return $(`android=new UiSelector().descriptionContains("${this.sepaIbanTail}")`)
  }

  private get sepaBeneficiaryAndroidByIbanTailText() {
    return $(`android=new UiSelector().textContains("${this.sepaIbanTail}")`)
  }

  private get sepaBeneficiaryAndroidByBankText() {
    return $(`android=new UiSelector().textContains("${this.sepaBankName}")`)
  }

  private get beneficiaryPayBtnAndroid() {
    return $('//*[@resource-id="beneficiaryDetails_button_pay"]')
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

    const newShown = await this.amountInputAndroidNew.waitForDisplayed({ timeout: 8000 }).catch(() => false)
    if (newShown) return this.amountInputAndroidNew

    await this.amountInputAndroidNewAlt.waitForDisplayed({ timeout: 20000 })
    return this.amountInputAndroidNewAlt
  }

  private get reviewPaymentBtnAndroid() {
    // New Compose flows use different prefixes
    return this.byAndroidResIdMatches(
      '.*:id/(p2p|sepa|bankTransfer)_button_review_payment$|^(p2p|sepa|bankTransfer)_button_review_payment$'
    )
  }

  private async maybeTapReviewPaymentAndroid() {
    if (!browser.isAndroid) return

    const shown = await this.reviewPaymentBtnAndroid.waitForDisplayed({ timeout: 3000 }).catch(() => false)
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
    return $('android=new UiSelector().textContains("Slide to make payment")')
  }

  private get slideDescAndroid() {
    return $('android=new UiSelector().descriptionContains("Slide to make payment")')
  }

  private get txDetailsBackAndroid() {
    return $('android=new UiSelector().resourceId("transactionDetails_button_back")')
  }

  private get headerBackAndroid() {
    return $('android=new UiSelector().resourceId("beneficiaryDetails_button_back")')
  }

  private get headerBackAltAndroid() {
    return $('android=new UiSelector().description("Back")')
  }

  private get homeTabAndroid() {
    return $('id=com.moneybase.qa:id/navigation_button_home')
  }

  private get homeTabAndroidLegacy() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_bar_item_icon_view").instance(0)')
  }

  private get profilePickerUserNameLabelIOS() {
    return $('~profilePicker_label_userName')
  }

  private get profilePickerIndividualItemIOS() {
    return $('~Individual')
  }

  private get homeRootIOS() {
    return $('~home_screen_view')
  }

  private get payTabIOS() {
    return $('~Pay')
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

  private get headerBackIOS() {
    return $('~BackButton')
  }

  private get homeTabIOS() {
    return $('~Home')
  }

  private async ensureIndividualAccountIOS() {
    if (!browser.isIOS) return

    await this.profilePickerUserNameLabelIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.profilePickerUserNameLabelIOS)

    await this.profilePickerIndividualItemIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.profilePickerIndividualItemIOS)

    await this.profilePickerIndividualItemIOS.waitForDisplayed({ reverse: true, timeout: 15000 }).catch(() => {})
    await this.homeRootIOS.waitForDisplayed({ timeout: 30000 }).catch(() => {})
    await browser.pause(300)
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

    const shown = await this.reviewPaymentBtnIOS.waitForDisplayed({ timeout: 3000 }).catch(() => false)
    if (!shown) return

    await browser
      .waitUntil(async () => await this.reviewPaymentBtnIOS.isEnabled().catch(() => false), {
        timeout: 20000,
        interval: 250,
      })
      .catch(() => {})

    await this.tap(this.reviewPaymentBtnIOS)
  }

  private async waitForPaymentCompletedIOS(timeoutMs = 15000) {
    const deadline = Date.now() + timeoutMs

    while (Date.now() < deadline) {
      const detailsShown = await this.txDetailsCloseIOS.isDisplayed().catch(() => false)
      if (detailsShown) return

      await browser.pause(250)
    }

    await this.txDetailsCloseIOS.waitForDisplayed({ timeout: 3000 })
  }

  private async dragSliderToRightIOS() {
    await this.sliderPayIconIOS.waitForDisplayed({ timeout: 20000 })

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

      await browser.releaseActions()
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

    await this.txDetailsCloseIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.txDetailsCloseIOS)

    const backShown = await this.headerBackIOS.waitForDisplayed({ timeout: 8000 }).catch(() => false)
    if (backShown) {
      await this.tap(this.headerBackIOS)
    }

    await browser.pause(800)
    await this.homeTabIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.homeTabIOS)
  }

  private formatIosAmount(amount: number | string) {
    const fixed = Number(amount).toFixed(2)
    return fixed.replace('.', ',')
  }

  private minusAmountHomeAnchorIOS(amount: number | string) {
    const formatted = this.formatIosAmount(amount)
    return $(`//XCUIElementTypeStaticText[contains(@label,"-${formatted}") and contains(@label,"€")] | //XCUIElementTypeStaticText[contains(@name,"-${formatted}") and contains(@name,"€")]`)
  }

  private async scrollHomeIOS() {
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
    await browser.pause(400)
  }

  private async waitForMinusAmountHomeIOS(amount: number | string, timeoutMs = 60000) {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      if (await this.minusAmountHomeAnchorIOS(amount).isDisplayed().catch(() => false)) return
      await this.scrollHomeIOS()
    }
    await this.minusAmountHomeAnchorIOS(amount).waitForDisplayed({ timeout: 3000 })
  }

  private minusAmountHomeAnchorAndroid(amount: number | string) {
    const formatted = Number(amount).toFixed(2)
    return $(`android=new UiSelector().textContains("- €${formatted}")`)
  }

  private sentAmountHomeAnchorAndroid(amount: number | string) {
    const formatted = Number(amount).toFixed(2)
    return $(`android=new UiSelector().textContains("Sent €${formatted}")`)
  }

  private async tapPayAddAndroidIfShown() {
    const byDesc = await this.payAddBtnAndroidByDesc.waitForDisplayed({ timeout: 5000 }).catch(() => false)
    if (byDesc) {
      await this.tap(this.payAddBtnAndroidByDesc)
      return
    }

    const byId = await this.payAddBtnAndroidById.waitForDisplayed({ timeout: 5000 }).catch(() => false)
    if (byId) {
      await this.tap(this.payAddBtnAndroidById)
    }
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
    await browser.releaseActions()
    await browser.pause(350)
  }

  private async openPayAndNewAndroid() {
    const payShown = await this.payTabAndroid.waitForDisplayed({ timeout: 12000 }).catch(() => false)
    if (payShown) {
      await this.tap(this.payTabAndroid)
    } else {
      await this.payTabAndroidLegacy.waitForDisplayed({ timeout: 12000 })
      await this.tap(this.payTabAndroidLegacy)
    }

    const newByDescShown = await this.newBtnAndroid.waitForDisplayed({ timeout: 8000 }).catch(() => false)
    if (newByDescShown) {
      await this.tap(this.newBtnAndroid)
      return
    }

    const newByTextShown = await this.newBtnAndroidByText.waitForDisplayed({ timeout: 8000 }).catch(() => false)
    if (newByTextShown) {
      await this.tap(this.newBtnAndroidByText)
      return
    }

    await this.newTransferTitleAndroid.waitForDisplayed({ timeout: 10000 }).catch(() => {})
  }

  private async openSepaBeneficiaryAndroid() {
    const deadline = Date.now() + 25000

    while (Date.now() < deadline) {
      const byIbanDesc = await this.sepaBeneficiaryAndroidByIbanDesc.isDisplayed().catch(() => false)
      if (byIbanDesc) {
        await this.tap(this.sepaBeneficiaryAndroidByIbanDesc)
        return
      }

      const byIbanText = await this.sepaBeneficiaryAndroidByIbanText.isDisplayed().catch(() => false)
      if (byIbanText) {
        await this.tap(this.sepaBeneficiaryAndroidByIbanText)
        return
      }

      const byIbanTailDesc = await this.sepaBeneficiaryAndroidByIbanTailDesc.isDisplayed().catch(() => false)
      if (byIbanTailDesc) {
        await this.tap(this.sepaBeneficiaryAndroidByIbanTailDesc)
        return
      }

      const byIbanTailText = await this.sepaBeneficiaryAndroidByIbanTailText.isDisplayed().catch(() => false)
      if (byIbanTailText) {
        await this.tap(this.sepaBeneficiaryAndroidByIbanTailText)
        return
      }

      const byDesc = await this.sepaBeneficiaryAndroidByDesc.isDisplayed().catch(() => false)
      if (byDesc) {
        await this.tap(this.sepaBeneficiaryAndroidByDesc)
        return
      }

      const byBank = await this.sepaBeneficiaryAndroidByBankText.isDisplayed().catch(() => false)
      if (byBank) {
        await this.tap(this.sepaBeneficiaryAndroidByBankText)
        return
      }

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

    await this.verificationSeekBarAndroid.waitForDisplayed({ timeout: 20000 })
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

    await this.txDetailsBackAndroid.waitForDisplayed({ timeout: 3000 })
  }

  private async dragSliderToRightAndroid() {
    const legacyShown = await this.seekBarAndroidLegacy.isDisplayed().catch(() => false)

    // Prefer dragging from the thumb/handle (works for new verification sheet)
    const thumbShown = await this.slideDescAndroid.isDisplayed().catch(() => false)
    const dragEl = legacyShown ? this.seekBarAndroidLegacy : thumbShown ? this.slideDescAndroid : await this.resolveSeekBarSepaAndroid()

    await dragEl.waitForDisplayed({ timeout: 20000 })

    const loc = await dragEl.getLocation()
    const size = await dragEl.getSize()
    const { width } = await browser.getWindowRect()

    const y = Math.round(loc.y + size.height * 0.5)
    const startX = Math.round(loc.x + size.width * 0.6)
    const endX = Math.max(startX + 260, Math.round(width - 30))

    for (let i = 0; i < 3; i++) {
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

      await browser.releaseActions()
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

    await this.txDetailsBackAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.txDetailsBackAndroid)

    const backShown = await this.headerBackAndroid.waitForDisplayed({ timeout: 8000 }).catch(() => false)
    if (backShown) {
      await this.tap(this.headerBackAndroid)
    } else {
      await this.headerBackAltAndroid.waitForDisplayed({ timeout: 8000 })
      await this.tap(this.headerBackAltAndroid)
    }

    await browser.pause(800)
    const homeShown = await this.homeTabAndroid.waitForDisplayed({ timeout: 15000 }).catch(() => false)
    if (homeShown) {
      await this.tap(this.homeTabAndroid)
      return
    }

    await this.homeTabAndroidLegacy.waitForDisplayed({ timeout: 8000 })
    await this.tap(this.homeTabAndroidLegacy)
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
    await browser.releaseActions()
    await browser.pause(700)
  }

  private async waitForMinusAmountHomeAndroid(amount: number | string, timeoutMs = 30000) {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      if (await this.minusAmountHomeAnchorAndroid(amount).isDisplayed().catch(() => false)) return
      if (await this.sentAmountHomeAnchorAndroid(amount).isDisplayed().catch(() => false)) return
      await this.scrollHomeAndroid()
    }

    const minusShown = await this.minusAmountHomeAnchorAndroid(amount).waitForDisplayed({ timeout: 2500 }).catch(() => false)
    if (minusShown) return

    await this.sentAmountHomeAnchorAndroid(amount).waitForDisplayed({ timeout: 2500 })
  }

  private async dismissBlockingAlertAndroid(timeoutMs = 8000) {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const appeared = await this.alertTitleAndroid.waitForDisplayed({ timeout: timeoutMs }).catch(() => false)
    if (!appeared) return

    await this.alertBtn3Android.waitForDisplayed({ timeout: 7000 })
    await this.tap(this.alertBtn3Android)
    await this.alertTitleAndroid.waitForDisplayed({ reverse: true, timeout: 10000 }).catch(() => {})
    await browser.pause(250)
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
      await browser.releaseActions()
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

  public async sendSepaBySlideAndroid(amount: number | string = 11) {
    if (!browser.isAndroid) return

    await BankTransferP2PIndividualPage.ensureIndividualAccount()
    await this.dismissBlockingAlertAndroid(10000)
    await this.payTabAndroid.waitForDisplayed({ timeout: 15000 }).catch(() => this.payTabAndroidLegacy.waitForDisplayed({ timeout: 15000 }))

    await this.openPayAndNewAndroid()

    await this.tapPayAddAndroidIfShown()
    await this.openSepaBeneficiaryAndroid()

    await this.beneficiaryPayBtnAndroid.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.beneficiaryPayBtnAndroid)

    const amountInput = await this.resolveAmountInputSepaAndroid()
    await amountInput.waitForDisplayed({ timeout: 20000 })
    await amountInput.clearValue().catch(() => {})
    await amountInput.setValue(String(amount))

    await this.maybeTapReviewPaymentAndroid()

    await this.ensureSliderReadyAndroid()
    await this.dragSliderToRightAndroid()

    await this.exitToHomeAfterPaymentAndroid()
    await this.waitForMinusAmountHomeAndroid(amount, 30000)
  }

  public async sendSepaBySlideIOS(amount: number | string = 11) {
    if (!browser.isIOS) return

    await this.ensureIndividualAccountIOS()
    await this.payTabIOS.waitForDisplayed({ timeout: 20000 })

    await this.payTabIOS.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.payTabIOS)

    await this.payAddBtnIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.payAddBtnIOS)

    await this.openSepaBeneficiaryIOS()

    await this.beneficiaryPayBtnIOS.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.beneficiaryPayBtnIOS)

    await this.amountInputIOS.waitForDisplayed({ timeout: 20000 })
    await this.tap(this.amountInputIOS)
    await this.amountInputIOS.clearValue().catch(() => {})
    await this.amountInputIOS.setValue(String(amount))

    await this.maybeTapReviewPaymentIOS()

    await this.ensureSliderReadyIOS()
    await this.dragSliderToRightIOS()

    await this.txDetailsCloseIOS.waitForDisplayed({ timeout: 60000 })
    await this.exitToHomeAfterPaymentIOS()
    await this.waitForMinusAmountHomeIOS(amount, 60000)
  }
}

export default new BankTransferSepaIndividualPage()
