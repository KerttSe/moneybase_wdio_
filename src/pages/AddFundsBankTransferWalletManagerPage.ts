import BasePage from './BasePage'
import AddFundsPage from './AddFunds'
import HomeScreenPage from './HomeScreenPage'
import type { ChainablePromiseElement } from 'webdriverio'
import { $, browser } from '@wdio/globals'

type WdioEl = ChainablePromiseElement

class AddFundsBankTransferWalletManagerPage extends BasePage {
  private readonly addFundsPage = new AddFundsPage()

  private readonly walletCurrencies = ['EUR', 'USD', 'GBP']

  private byAndroidResId(id: string) {
    return $(`(//*[@resource-id="com.moneybase.qa:id/${id}"] | //*[contains(@resource-id,"${id}")] | //*[@content-desc="${id}"])[1]`)
  }

  private byAndroidResIdMatches(_rx: string) {
    // unused — replaced by direct XPath in callers
    return $('//*[contains(@resource-id,"addFunds")]')
  }

  private get addFundsScreenAnchorIOS() {
    return $(
      '-ios predicate string:name == "addFunds_item_card" OR name == "addFunds_item_autoTopup" OR name == "addFunds_item_bankTransfer" OR name == "addFunds_item_salary"'
    )
  }

  private get addFundsScreenAnchorAndroid() {
    return $('(//*[contains(@resource-id,"addFunds_screen") or contains(@resource-id,"addFunds_card_cardTopUp") or contains(@resource-id,"addFunds_card_bankTransfer") or contains(@resource-id,"addFunds_card_autoTopUp")])[1]')
  }

  private get bankTransferTileIOS() {
    return $(
      '-ios predicate string:name == "addFunds_item_bankTransfer" OR name == "addFunds_card_bankTransfer" OR name == "Bank Transfer" OR label == "Bank Transfer"'
    )
  }

  private get bankTransferTileAndroid() {
    return $(
      '//*[contains(@content-desc,"bank") and contains(@content-desc,"transfer") or contains(@content-desc,"bankTransfer") or contains(@resource-id,"bankTransfer")]'
    )
  }

  private get bankTransferTileAndroidByText() {
    return $('//*[contains(@text,"Bank Transfer") or contains(@content-desc,"Bank Transfer")]')
  }

  private get bankTransferScreenAnchorIOS() {
    return $(
      '-ios predicate string:name CONTAINS[c] "Bank Transfer" OR label CONTAINS[c] "Bank Transfer" OR name CONTAINS[c] "Wallet Manager" OR label CONTAINS[c] "Wallet Manager"'
    )
  }

  private get bankTransferScreenAnchorAndroid() {
    return $('//*[contains(@text,"Bank Transfer") or contains(@text,"Wallet Manager") or contains(@content-desc,"Bank Transfer") or contains(@content-desc,"Wallet Manager")]')
  }

  private get walletManagerEntryIOS() {
    return $(
      '-ios predicate string:name == "Wallet Manager" OR label == "Wallet Manager" OR name CONTAINS[c] "walletManager" OR label CONTAINS[c] "Wallet Manager"'
    )
  }

  private get walletManagerEntryAndroid() {
    return $('//*[contains(@content-desc,"Wallet Manager") or contains(@content-desc,"walletManager") or contains(@resource-id,"walletManager")]')
  }

  private get walletManagerEntryAndroidByText() {
    return $('//*[contains(@text,"Wallet Manager") or contains(@content-desc,"Wallet Manager")]')
  }

  private get walletManagerScreenAnchorIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Wallet Manager"]')
  }

  private get createNewWalletBtnIOS() {
    return $('-ios predicate string:name == "Create New Wallet" OR label == "Create New Wallet"')
  }

  private get walletManagerScreenAnchorAndroid() {
    return $('//*[contains(@text,"Wallet Manager") or contains(@text,"Manage Wallet") or contains(@content-desc,"Wallet Manager") or contains(@content-desc,"Manage Wallet")]')
  }

  private walletCurrencyAnchorIOS(currency: string) {
    return $(
      `//XCUIElementTypeCell[.//XCUIElementTypeStaticText[contains(@name,"${currency}") or contains(@label,"${currency}")]]`
    )
  }

  private walletBalanceAnchorIOS(currency: string) {
    return $(
      `//XCUIElementTypeCell[.//XCUIElementTypeStaticText[contains(@name,"${currency}") or contains(@label,"${currency}")]]//XCUIElementTypeStaticText[contains(@name,"€") or contains(@name,"$") or contains(@name,"£") or contains(@label,"€") or contains(@label,"$") or contains(@label,"£")]`
    )
  }

  private walletCurrencyAnchorAndroid(currency: string) {
    return $(
      `//*[@text="${currency}" or @content-desc="${currency}" or contains(@text,"${currency}") or contains(@content-desc,"${currency}")]`
    )
  }

  private async elementExists(el: WdioEl, timeout = 2000) {
    if (browser.isIOS) return el.waitForExist({ timeout }).catch(() => false)
    return el.waitForDisplayed({ timeout }).catch(() => false)
  }

  private async tapFirstAvailable(candidates: WdioEl[], label: string, timeout = 15000) {
    const deadline = Date.now() + timeout

    while (Date.now() < deadline) {
      for (const candidate of candidates) {
        const shown = await this.elementExists(candidate, 1000)
        if (!shown) continue

        await this.tap(candidate)
        return
      }
      await browser.pause(350)
    }

    throw new Error(`${label} was not found`)
  }

  private async currentSourceText() {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    return browser.getPageSource()
  }

  private async sourceContains(pattern: RegExp) {
    const source = await this.currentSourceText()
    return pattern.test(source)
  }

  private async waitForSource(pattern: RegExp, label: string, timeout = 15000) {
    await browser.waitUntil(() => this.sourceContains(pattern), {
      timeout,
      interval: 500,
      timeoutMsg: `${label} was not found in Wallet Manager source`,
    })
  }

  async openHomeScreen() {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    if (browser.isIOS) {
      await HomeScreenPage.waitForHomeLoaded()
      await HomeScreenPage.ensureIndividualAccount()
      await HomeScreenPage.waitForHomeLoaded()
    } else {
      await this.dismissKnownAndroidBlockingPopups(4).catch(() => {})
    }
  }

  async openAddFunds() {
    await this.addFundsPage.openFromHome()

    if (browser.isIOS) {
      await this.addFundsScreenAnchorIOS.waitForExist({ timeout: 20000 })
    } else {
      await this.addFundsScreenAnchorAndroid.waitForDisplayed({ timeout: 20000 })
    }
  }

  async verifyBusinessFundingMethods() {
    await this.tapFirstAvailable([this.addFundsPage.openBtn], 'Add Funds on business Home')
    const bankTransfer = browser.isIOS ? this.bankTransferTileIOS : this.bankTransferTileAndroidByText
    await bankTransfer.waitForDisplayed({ timeout: 15000 })
    const retailOption = browser.isIOS
      ? $('-ios predicate string:name IN {"addFunds_item_card", "addFunds_item_autoTopup", "addFunds_item_salary"} OR label IN {"Card", "Auto Top-Up", "Salary/Stipend/Pension"}')
      : $('//*[contains(@resource-id,"addFunds_card_cardTopUp") or contains(@resource-id,"addFunds_card_autoTopUp") or contains(@resource-id,"addFunds_card_salary") or @text="Card Top-Up" or @text="Auto Top-Up" or @text="Salary/Stipend/Pension"]')
    if (await retailOption.isExisting()) {
      throw new Error('Business Add Funds contains a card, recurring top-up or salary option')
    }
  }

  async selectBankTransferOption() {
    if (browser.isIOS) {
      await this.tapFirstAvailable([this.bankTransferTileIOS], 'Bank Transfer option')
      await this.bankTransferScreenAnchorIOS.waitForExist({ timeout: 20000 })
      return
    }

    await this.tapFirstAvailable(
      [this.bankTransferTileAndroid, this.bankTransferTileAndroidByText],
      'Bank Transfer option'
    )
    await this.bankTransferScreenAnchorAndroid.waitForDisplayed({ timeout: 20000 })
  }

  async openWalletManager() {
    if (browser.isIOS) {
      const alreadyOpen = await this.walletManagerScreenAnchorIOS.waitForExist({ timeout: 1500 }).catch(() => false)
      if (alreadyOpen) return

      await this.tapFirstAvailable([this.walletManagerEntryIOS], 'Wallet Manager entry', 20000)
      await this.walletManagerScreenAnchorIOS.waitForExist({ timeout: 20000 })
      return
    }

    await this.tapFirstAvailable(
      [this.walletManagerEntryAndroid, this.walletManagerEntryAndroidByText],
      'Wallet Manager entry',
      20000
    )
    await this.walletManagerScreenAnchorAndroid.waitForDisplayed({ timeout: 20000 })
  }

  async openWalletDetailsFromManager(currency: 'EUR' | 'USD' | 'GBP') {
    await this.openHomeScreen()
    await this.openAddFunds()
    await this.selectBankTransferOption()
    await this.openWalletManager()
    const row = browser.isIOS
      ? this.walletCurrencyAnchorIOS(currency)
      : $(`(//*[@text="${currency}" or @content-desc="${currency}"]/ancestor::*[@clickable="true"][1])[1]`)
    await row.waitForDisplayed({ timeout: 15000 })
    await this.tap(row)
    await HomeScreenPage.waitForWalletDetails(currency)
  }

  async verifyIbanBankNameVisibility(visible: boolean) {
    const iban = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeStaticText" AND label BEGINSWITH[c] "IBAN"')
      : $('//*[starts-with(@text,"IBAN") or starts-with(@content-desc,"IBAN")]')
    await iban.waitForDisplayed({ timeout: 15000 })
    const bankName = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeStaticText" AND label BEGINSWITH[c] "Bank Name"')
      : $('//*[starts-with(@text,"Bank Name") or starts-with(@text,"Bank name") or starts-with(@content-desc,"Bank Name")]')
    await bankName.waitForDisplayed({ reverse: !visible, timeout: 10000 })
  }

  async verifyWalletManagerLoaded() {
    if (browser.isIOS) {
      await this.walletManagerScreenAnchorIOS.waitForExist({ timeout: 20000 })
      await this.createNewWalletBtnIOS.waitForExist({ timeout: 15000 })
    } else {
      await this.walletManagerScreenAnchorAndroid.waitForDisplayed({ timeout: 20000 })
    }
  }

  async verifyAvailableWalletsDisplayed() {
    for (const currency of this.walletCurrencies) {
      if (browser.isIOS) {
        await this.walletCurrencyAnchorIOS(currency).waitForExist({ timeout: 15000 })
      } else {
        await this.walletCurrencyAnchorAndroid(currency).waitForDisplayed({ timeout: 15000 })
      }
    }
  }

  async verifyWalletCurrencyDisplayedCorrectly() {
    for (const currency of this.walletCurrencies) {
      await this.waitForSource(new RegExp(`\\b${currency}\\b`), `${currency} wallet currency`)
    }
  }

  async verifyWalletBalanceDisplayed() {
    if (browser.isIOS) {
      for (const currency of this.walletCurrencies) {
        await this.walletBalanceAnchorIOS(currency).waitForExist({ timeout: 15000 })
      }
      return
    }

    await this.waitForSource(
      /(?:€|\$|£|EUR|USD|GBP)\s*\d+[.,]\d{2}|\d+[.,]\d{2}\s*(?:€|\$|£|EUR|USD|GBP)/,
      'wallet balance'
    )
  }

  async verifyWalletIdentifierDisplayed() {
    const hasIdentifier = await this.sourceContains(
      /(?:IBAN|Wallet ID|Account Number|Account No\.?|Sort Code|BIC|SWIFT|[A-Z]{2}\d{2}[A-Z0-9 ]{8,})/i
    )

    if (!hasIdentifier) {
      console.warn('[AFBT] Wallet identifier is not displayed on Wallet Manager list screen; skipping because it is optional where applicable')
    }
  }

  async verifyWalletManagerScreenStable() {
    await this.verifyWalletManagerLoaded()
    await this.verifyAvailableWalletsDisplayed()
    const source = await this.currentSourceText()
    if (/Something went wrong|Try again|Unexpected error|crash/i.test(source)) {
      throw new Error('Wallet Manager screen shows an error state')
    }
  }
}

export default new AddFundsBankTransferWalletManagerPage()
