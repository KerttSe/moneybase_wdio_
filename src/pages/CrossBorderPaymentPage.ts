import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'
import BankTransferP2PIndividualPage from './BankTransferP2PIndividualPage'
import { markBrowserStackStep } from '../helpers/browserstack.helper'
import { openIOSPaymentReview } from '../helpers/iosPayment.helper'

class CrossBorderPaymentPage extends BasePage {
  /* ── ANDROID: payment input screen ── */

  private get bankTransferScreenAndroid() {
    return $('(//*[@resource-id="bankTransfer_screen"] | //*[contains(@resource-id,"bankTransfer_screen")])[1]')
  }

  private get walletSelectorAndroid() {
    return $('(//*[@resource-id="bankTransfer_button_walletSelect"] | //*[contains(@resource-id,"bankTransfer_button_walletSelect")] | //*[contains(@content-desc,"walletSelect")])[1]')
  }

  private get balanceFeeAndroid() {
    return $('//*[contains(@text,"Balance:") or contains(@content-desc,"Balance:")]')
  }

  private get feeRowAndroid() {
    return $('//android.view.View[@clickable="true" and (.//android.widget.TextView[@text="Originator Fee"] or .//android.widget.TextView[@text="Shared Fee"])]')
  }

  private get feeTitleAndroid() {
    return $('//android.widget.TextView[@text="Originator Fee" or @text="Shared Fee"]')
  }

  private get reviewPaymentBtnAndroid() {
    return $('(//*[@resource-id="bankTransfer_button_review_payment"] | //*[contains(@resource-id,"bankTransfer_button_review_payment")] | //*[contains(@content-desc,"Review Payment") or contains(@content-desc,"review_payment")])[1]')
  }

  /* ── ANDROID: wallet picker bottom sheet ── */

  private get walletSelectionScreenAndroid() {
    return $('(//*[@resource-id="walletSelection_screen"] | //*[contains(@resource-id,"walletSelection_screen")])[1]')
  }

  private walletOptionAndroid(currencyCode: string) {
    return $(`(//*[contains(@content-desc,"${currencyCode}")] | //android.view.View[@clickable="true" and ./android.widget.TextView[@text="${currencyCode}"]])[1]`)
  }

  /* ── ANDROID: review screen ── */

  private get reviewScreenAndroid() {
    return $('(//*[@resource-id="verificationOfPayee_screen"] | //*[contains(@resource-id,"verificationOfPayee_screen")])[1]')
  }

  /* ── ANDROID: fee picker bottom sheet ── */

  private get feePickerTitleAndroid() {
    return $('(//*[@resource-id="com.moneybase.qa:id/tvTitle"] | //*[@resource-id="tvTitle"] | //*[contains(@resource-id,"tvTitle")])[1]')
  }

  private get feePickerListAndroid() {
    return $('(//*[@resource-id="com.moneybase.qa:id/rvSwiftOptionsBottomDialogItems"] | //*[contains(@resource-id,"rvSwiftOptionsBottomDialogItems")])[1]')
  }

  private feePickerOptionAndroid(title: string) {
    return $(`(//*[contains(@resource-id,"tvOptionTitle") and (@text="${title}" or @content-desc="${title}")] | //*[@text="${title}" or @content-desc="${title}"])[1]`)
  }

  /* ── PUBLIC METHODS ── */

  public async openToPaymentScreenAndroid(amount: number | string = 11) {
    await BankTransferP2PIndividualPage.openSwiftPaymentInputScreenAndroid(amount)
    await this.bankTransferScreenAndroid.waitForExist({ timeout: 20000 })
    await markBrowserStackStep('Opened cross-border SWIFT payment screen')
  }

  public async verifyBankTransferScreenLoaded() {
    await this.bankTransferScreenAndroid.waitForExist({ timeout: 15000 })
  }

  public async verifyPayFromWalletCurrency(currency: string) {
    await this.walletSelectorAndroid.waitForExist({ timeout: 10000 })
    const src = await browser.getPageSource()
    if (!src.includes(`text="${currency}"`) && !src.includes(`content-desc="${currency}"`) && !src.includes(`>${currency}<`)) {
      throw new Error(`Wallet selector does not show currency "${currency}"`)
    }
  }

  public async verifyBalanceFeeDisplayed() {
    await this.balanceFeeAndroid.waitForExist({ timeout: 10000 })
  }

  public async verifyFeeRowDisplayed() {
    await this.feeRowAndroid.waitForExist({ timeout: 10000 })
  }

  public async getFeeTitle(): Promise<string> {
    await this.feeTitleAndroid.waitForExist({ timeout: 10000 })
    return this.feeTitleAndroid.getText()
  }

  public async openFeePicker() {
    await this.feeRowAndroid.waitForExist({ timeout: 10000 })
    await this.tap(this.feeRowAndroid)
    await this.feePickerListAndroid.waitForExist({ timeout: 10000 })
    await markBrowserStackStep('Opened fee picker')
  }

  public async verifyFeePickerDisplayed() {
    await this.feePickerListAndroid.waitForExist({ timeout: 10000 })
    const title = await this.feePickerTitleAndroid.getText().catch(() => '')
    if (!title.includes('SWIFT')) {
      throw new Error(`Fee picker title unexpected: "${title}"`)
    }
    await this.feePickerOptionAndroid('Shared Fee').waitForExist({ timeout: 5000 })
    await this.feePickerOptionAndroid('Originator Fee').waitForExist({ timeout: 5000 })
  }

  public async selectFeeOption(option: 'SHA' | 'OUR') {
    const titleMap = { SHA: 'Shared Fee', OUR: 'Originator Fee' }
    const targetTitle = titleMap[option]
    await this.tap(this.feePickerOptionAndroid(targetTitle))
    await browser.waitUntil(
      async () => (await this.getFeeTitle()) === targetTitle,
      { timeout: 10000, interval: 500, timeoutMsg: `Fee did not change to "${targetTitle}"` }
    )
    await markBrowserStackStep(`Fee changed to ${option}`)
  }

  public async verifyFeeTitle(expected: string) {
    const actual = await this.getFeeTitle()
    if (actual !== expected) throw new Error(`Fee title: expected "${expected}", got "${actual}"`)
  }

  public async verifyClosingFeePickerPreservesFee() {
    if (browser.isIOS) {
      await BankTransferP2PIndividualPage.prepareSmokeSwiftIOS(11)
      await this.selectSwiftFeeIOS('Shared Fee')
      await this.tap(this.swiftFeeRowIOS, 10000)
      const picker = this.swiftFeePickerIOS
      await picker.waitForDisplayed({ timeout: 10000 })
      await this.closeIOSPicker()
      await picker.waitForDisplayed({ reverse: true, timeout: 10000 })
      await this.swiftFeeTitleIOS('Shared Fee').waitForDisplayed({ timeout: 10000 })
      return
    }

    await this.openToPaymentScreenAndroid(11)
    await this.openFeePicker()
    await this.selectFeeOption('SHA')
    await this.openFeePicker()
    await browser.back()
    await this.feePickerListAndroid.waitForDisplayed({ reverse: true, timeout: 10000 })
    await this.verifyFeeTitle('Shared Fee')
  }

  public async verifyClosingWalletPickerPreservesWallet() {
    if (browser.isIOS) {
      await BankTransferP2PIndividualPage.prepareSmokeSwiftIOS(11)
      const selector = $('-ios predicate string:type IN {"XCUIElementTypeButton", "XCUIElementTypeCell"} AND (name == "makePayment_button_walletSelect" OR label BEGINSWITH[c] "Pay from")')
      const picker = $('-ios predicate string:name == "walletSelection_screen" OR (type == "XCUIElementTypeNavigationBar" AND label IN {"Select Wallet", "Wallets"})')
      const euro = $('-ios predicate string:type == "XCUIElementTypeCell" AND (label CONTAINS[c] "EUR" OR name CONTAINS[c] "EUR")')
      const selected = selector.$('.//*[contains(@label,"EUR") or contains(@name,"EUR")] | self::*[contains(@label,"EUR")]')
      if (!await selected.isDisplayed()) {
        await this.tap(selector, 10000)
        await picker.waitForDisplayed({ timeout: 10000 })
        await this.tap(euro, 10000)
        await picker.waitForDisplayed({ reverse: true, timeout: 10000 })
      }
      await selected.waitForDisplayed({ timeout: 10000 })
      await this.tap(selector)
      await picker.waitForDisplayed({ timeout: 10000 })
      await euro.waitForDisplayed({ timeout: 10000 })
      if (await euro.isEnabled()) await euro.click()
      if (!await picker.isDisplayed()) throw new Error('TC2920: reselecting EUR should leave the picker open')
      await this.closeIOSPicker()
      await picker.waitForDisplayed({ reverse: true, timeout: 10000 })
      await selected.waitForDisplayed({ timeout: 10000 })
      return
    }

    await this.openToPaymentScreenAndroid(11)
    const selectedWallet = this.walletSelectorAndroid.$('.//*[@text="EUR" or @content-desc="EUR"]')
    if (!await selectedWallet.isDisplayed()) {
      await this.openWalletPickerAndroid()
      await this.selectWalletAndroid('EUR')
      await this.walletSelectionScreenAndroid.waitForDisplayed({ reverse: true, timeout: 10000 })
    }
    await selectedWallet.waitForDisplayed({ timeout: 10000 })
    await this.openWalletPickerAndroid()
    const euro = this.walletSelectionScreenAndroid.$('.//*[@content-desc="EUR" or @text="EUR"]/ancestor-or-self::*[@clickable="true" or @selected="true"][1]')
    await euro.waitForDisplayed({ timeout: 10000 })
    if (await euro.isEnabled()) await euro.click()
    if (!await this.walletSelectionScreenAndroid.isDisplayed()) {
      throw new Error('TC2920: reselecting EUR should leave the picker open')
    }
    await browser.back()
    await this.walletSelectionScreenAndroid.waitForDisplayed({ reverse: true, timeout: 10000 })
    await selectedWallet.waitForDisplayed({ timeout: 10000 })
  }

  public async verifyReviewPaymentBtnPresent() {
    await this.reviewPaymentBtnAndroid.waitForExist({ timeout: 10000 })
  }

  public async openWalletPickerAndroid() {
    await this.walletSelectorAndroid.waitForExist({ timeout: 10000 })
    await this.tap(this.walletSelectorAndroid)
    await this.walletSelectionScreenAndroid.waitForExist({ timeout: 10000 })
    await markBrowserStackStep('Opened wallet picker')
  }

  public async ensureWalletCurrencyAndroid(currencyCode: string) {
    const src = await browser.getPageSource()
    if (src.includes(`text="${currencyCode}"`)) return
    await this.openWalletPickerAndroid()
    await this.selectWalletAndroid(currencyCode)
  }

  public async selectWalletAndroid(currencyCode: string) {
    await this.walletOptionAndroid(currencyCode).waitForExist({ timeout: 10000 })
    await this.tap(this.walletOptionAndroid(currencyCode))
    await this.bankTransferScreenAndroid.waitForDisplayed({ timeout: 15000 })
    await markBrowserStackStep(`Selected ${currencyCode} wallet`)
  }

  public async tapReviewPaymentAndroid() {
    await this.reviewPaymentBtnAndroid.waitForExist({ timeout: 10000 })
    await this.tap(this.reviewPaymentBtnAndroid)
    await this.reviewScreenAndroid.waitForDisplayed({ timeout: 15000 })
    await markBrowserStackStep('Tapped Review Payment')
  }

  public async verifyReviewScreenSwiftType() {
    await $('//android.widget.TextView[@text="SWIFT"]').waitForExist({ timeout: 10000 })
    await $('//android.widget.TextView[@text="Fee"]').waitForExist({ timeout: 10000 })
  }

  public async verifySwiftFeeDisclaimer() {
    const disclaimer = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeStaticText" AND label CONTAINS[c] "may receive less"')
      // A full XPath, not a child of reviewScreenAndroid: the review sheet is reopened, so a cached parent goes stale.
      : $('//*[contains(@resource-id,"verificationOfPayee_screen")]//*[contains(@text,"may receive less") or contains(@content-desc,"may receive less")]')

    if (browser.isIOS) await BankTransferP2PIndividualPage.prepareSmokeSwiftIOS(11)
    else await this.openToPaymentScreenAndroid(11)

    await this.openSwiftReviewWithFee('SHA')
    await disclaimer.waitForDisplayed({ timeout: 10000 })
    await this.closeSwiftReview()
    await this.openSwiftReviewWithFee('OUR')
    await disclaimer.waitForDisplayed({ reverse: true, timeout: 10000 })
  }

  private async closeSwiftReview() {
    if (browser.isIOS) {
      const close = $('-ios predicate string:type == "XCUIElementTypeButton" AND (name == "verificationOfPayee_button_close" OR label == "Close" OR name == "BackButton")')
      await this.tap(close, 10000)
      await $('~makePayment_button_review').waitForExist({ timeout: 15000 })
    } else {
      await browser.back()
      await this.bankTransferScreenAndroid.waitForDisplayed({ timeout: 10000 })
    }
  }

  public async verifySwiftExchangeRateBreakdown() {
    await this.closeSwiftReview()
    await this.selectDraftWallet('EUR')
    await this.verifyRateInBreakdown(true)
    await this.closeSwiftReview()
    await this.selectDraftWallet('USD')
    await this.verifyRateInBreakdown(false)
  }

  private async selectDraftWallet(currency: 'EUR' | 'USD') {
    if (browser.isAndroid) {
      const selected = this.walletSelectorAndroid.$(`.//*[@text="${currency}" or @content-desc="${currency}"]`)
      if (!await selected.isDisplayed()) {
        await this.openWalletPickerAndroid()
        await this.selectWalletAndroid(currency)
      }
      await selected.waitForDisplayed({ timeout: 10000 })
      return
    }

    const selector = $('-ios predicate string:type IN {"XCUIElementTypeButton", "XCUIElementTypeCell"} AND (name == "makePayment_button_walletSelect" OR label BEGINSWITH[c] "Pay from")')
    const selected = selector.$(`.//*[contains(@label,"${currency}") or contains(@name,"${currency}")] | self::*[contains(@label,"${currency}")]`)
    if (!await selected.isDisplayed()) {
      await this.tap(selector, 10000)
      const option = $(`-ios predicate string:type == "XCUIElementTypeCell" AND (label CONTAINS[c] "${currency}" OR name CONTAINS[c] "${currency}")`)
      await this.tap(option, 10000)
    }
    await selected.waitForDisplayed({ timeout: 10000 })
  }

  private async verifyRateInBreakdown(visible: boolean) {
    await this.openSwiftReviewWithFee('SHA')
    const info = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeButton" AND (name CONTAINS[c] "feeInfo" OR label IN {"Fee information", "Payment breakdown"})')
      : $('//*[contains(@resource-id,"feeInfo") or @content-desc="Fee information" or @content-desc="Payment breakdown"]')
    await this.tap(info, 10000)
    const breakdown = browser.isIOS
      ? $('-ios predicate string:label IN {"Payment Breakdown", "Payment breakdown"}')
      : $('//*[@text="Payment Breakdown" or @text="Payment breakdown"]')
    await breakdown.waitForDisplayed({ timeout: 10000 })
    const rate = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeStaticText" AND label BEGINSWITH[c] "Exchange rate"')
      : $('//*[starts-with(@text,"Exchange rate") or starts-with(@content-desc,"Exchange rate")]')
    await rate.waitForDisplayed({ reverse: !visible, timeout: 10000 })
    if (visible) {
      const row = rate.$('..')
      const values = await row.$$(browser.isIOS ? './/XCUIElementTypeStaticText' : './/android.widget.TextView').map(el => el.getText())
      if (!/\b\d+[.,]\d{6}\b/.test([await rate.getText(), ...values].join(' '))) {
        throw new Error('TC3287: the exchange rate should display six decimal places')
      }
    }
    if (browser.isIOS) await this.closeIOSPicker()
    else await browser.back()
    await breakdown.waitForDisplayed({ reverse: true, timeout: 10000 })
  }

  private async openSwiftReviewWithFee(option: 'SHA' | 'OUR') {
    if (browser.isAndroid) {
      await this.openFeePicker()
      await this.selectFeeOption(option)
      await this.tapReviewPaymentAndroid()
      await this.verifyReviewScreenSwiftType()
      return
    }

    await this.selectSwiftFeeIOS(option === 'SHA' ? 'Shared Fee' : 'Originator Fee')
    await openIOSPaymentReview()
  }

  private get swiftFeeRowIOS() {
    return $('-ios predicate string:name == "makePayment_button_feeOption" OR (type IN {"XCUIElementTypeButton", "XCUIElementTypeCell"} AND label IN {"Shared Fee", "Originator Fee"})')
  }

  private get swiftFeePickerIOS() {
    return $('-ios predicate string:name == "swiftOptions_screen" OR (type == "XCUIElementTypeNavigationBar" AND label IN {"SWIFT", "SWIFT Fee", "SWIFT Fees"})')
  }

  private swiftFeeTitleIOS(title: 'Shared Fee' | 'Originator Fee') {
    return $('-ios predicate string:label == "' + title + '" OR name == "' + title + '"')
  }

  private async selectSwiftFeeIOS(title: 'Shared Fee' | 'Originator Fee') {
    await this.tap(this.swiftFeeRowIOS, 15000)
    await this.swiftFeePickerIOS.waitForDisplayed({ timeout: 10000 })
    const choice = $('//XCUIElementTypeCell[.//XCUIElementTypeStaticText[@label="' + title + '"]] | //XCUIElementTypeButton[@label="' + title + '"]')
    await this.tap(choice, 10000)
    await this.swiftFeePickerIOS.waitForDisplayed({ reverse: true, timeout: 10000 })
    await this.swiftFeeTitleIOS(title).waitForDisplayed({ timeout: 10000 })
  }

  private async closeIOSPicker() {
    const close = $('-ios predicate string:type == "XCUIElementTypeButton" AND (name IN {"Close", "Cancel", "modal_button_close", "BackButton"} OR label IN {"Close", "Cancel"})')
    await this.tap(close, 10000)
  }

  public async completeSwiftPaymentAndroid() {
    await BankTransferP2PIndividualPage.slideToPayAndroid()
    await markBrowserStackStep('Cross-border SWIFT payment submitted')
  }
}

export default new CrossBorderPaymentPage()
