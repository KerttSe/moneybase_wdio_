import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'
import BankTransferP2PIndividualPage from './BankTransferP2PIndividualPage'
import { markBrowserStackStep } from '../helpers/browserstack.helper'

class CrossBorderPaymentPage extends BasePage {
  /* ── ANDROID: payment input screen ── */

  private get bankTransferScreenAndroid() {
    return $('android=new UiSelector().resourceId("bankTransfer_screen")')
  }

  private get walletSelectorAndroid() {
    return $('android=new UiSelector().resourceId("bankTransfer_button_walletSelect")')
  }

  private get balanceFeeAndroid() {
    return $('android=new UiSelector().textContains("Balance:")')
  }

  private get feeRowAndroid() {
    return $('//android.view.View[@clickable="true" and (.//android.widget.TextView[@text="Originator Fee"] or .//android.widget.TextView[@text="Shared Fee"])]')
  }

  private get feeTitleAndroid() {
    return $('//android.widget.TextView[@text="Originator Fee" or @text="Shared Fee"]')
  }

  private get reviewPaymentBtnAndroid() {
    return $('android=new UiSelector().resourceId("bankTransfer_button_review_payment")')
  }

  /* ── ANDROID: wallet picker bottom sheet ── */

  private get walletSelectionScreenAndroid() {
    return $('android=new UiSelector().resourceId("walletSelection_screen")')
  }

  private walletOptionAndroid(currencyCode: string) {
    return $(`//android.view.View[@clickable="true" and ./android.widget.TextView[@text="${currencyCode}"]]`)
  }

  /* ── ANDROID: review screen ── */

  private get reviewScreenAndroid() {
    return $('android=new UiSelector().resourceId("verificationOfPayee_screen")')
  }

  /* ── ANDROID: fee picker bottom sheet ── */

  private get feePickerTitleAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/tvTitle")')
  }

  private get feePickerListAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/rvSwiftOptionsBottomDialogItems")')
  }

  private feePickerOptionAndroid(title: string) {
    return $(`android=new UiSelector().resourceId("com.moneybase.qa:id/tvOptionTitle").text("${title}")`)
  }

  /* ── PUBLIC METHODS ── */

  public async openToPaymentScreenAndroid(amount: number | string = 11) {
    await BankTransferP2PIndividualPage.openSwiftPaymentInputScreenAndroid(amount)
    await this.bankTransferScreenAndroid.waitForDisplayed({ timeout: 20000 })
    await markBrowserStackStep('Opened cross-border SWIFT payment screen')
  }

  public async verifyBankTransferScreenLoaded() {
    await this.bankTransferScreenAndroid.waitForDisplayed({ timeout: 15000 })
  }

  public async verifyPayFromWalletCurrency(currency: string) {
    await this.walletSelectorAndroid.waitForExist({ timeout: 10000 })
    const src = await browser.getPageSource()
    if (!src.includes(`text="${currency}"`)) {
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

  public async verifyReviewPaymentBtnPresent() {
    await this.reviewPaymentBtnAndroid.waitForExist({ timeout: 10000 })
  }

  public async openWalletPickerAndroid() {
    await this.walletSelectorAndroid.waitForExist({ timeout: 10000 })
    await this.tap(this.walletSelectorAndroid)
    await this.walletSelectionScreenAndroid.waitForDisplayed({ timeout: 10000 })
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

  public async completeSwiftPaymentAndroid() {
    await BankTransferP2PIndividualPage.slideToPayAndroid()
    await markBrowserStackStep('Cross-border SWIFT payment submitted')
  }
}

export default new CrossBorderPaymentPage()
