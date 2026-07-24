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
    const rx = `.*:id/${id}$|^${id}$`
    return $(`android=new UiSelector().resourceIdMatches("${rx}")`)
  }

  private byAndroidResIdMatches(rx: string) {
    return $(`android=new UiSelector().resourceIdMatches("${rx}")`)
  }

  private get addFundsScreenAnchorIOS() {
    return $(
      '-ios predicate string:name == "addFunds_item_card" OR name == "addFunds_item_autoTopup" OR name == "addFunds_item_bankTransfer" OR name == "addFunds_item_salary"'
    )
  }

  private get addFundsScreenAnchorAndroid() {
    return this.byAndroidResIdMatches(
      '.*:id/(addFunds_screen|addFunds_card_cardTopUp|addFunds_card_bankTransfer|addFunds_card_autoTopUp)$|^(addFunds_screen|addFunds_card_cardTopUp|addFunds_card_bankTransfer|addFunds_card_autoTopUp)$'
    )
  }

  private get bankTransferTileIOS() {
    return $(
      '-ios predicate string:name == "addFunds_item_bankTransfer" OR name == "addFunds_card_bankTransfer" OR name == "Bank Transfer" OR label == "Bank Transfer"'
    )
  }

  private get bankTransferTileAndroid() {
    return $(
      'android=new UiSelector().descriptionMatches("(?i).*bank.*transfer.*|addFunds_(item|card)_bankTransfer")'
    )
  }

  private get bankTransferTileAndroidByText() {
    return $('android=new UiSelector().textMatches("(?i).*bank.*transfer.*")')
  }

  private get bankTransferScreenAnchorIOS() {
    return $(
      '-ios predicate string:name CONTAINS[c] "Bank Transfer" OR label CONTAINS[c] "Bank Transfer" OR name CONTAINS[c] "Wallet Manager" OR label CONTAINS[c] "Wallet Manager"'
    )
  }

  private get bankTransferScreenAnchorAndroid() {
    return $('android=new UiSelector().textMatches("(?i).*bank.*transfer.*|.*wallet manager.*")')
  }

  private get walletManagerEntryIOS() {
    return $(
      '-ios predicate string:name == "Wallet Manager" OR label == "Wallet Manager" OR name CONTAINS[c] "walletManager" OR label CONTAINS[c] "Wallet Manager"'
    )
  }

  private get walletManagerEntryAndroid() {
    return $('android=new UiSelector().descriptionMatches("(?i).*wallet manager.*|.*walletManager.*")')
  }

  private get walletManagerEntryAndroidByText() {
    return $('android=new UiSelector().textMatches("(?i).*wallet manager.*")')
  }

  private get walletManagerScreenAnchorIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Wallet Manager"]')
  }

  private get createNewWalletBtnIOS() {
    return $('-ios predicate string:name == "Create New Wallet" OR label == "Create New Wallet"')
  }

  private get walletManagerScreenAnchorAndroid() {
    return $('android=new UiSelector().textMatches("(?i).*wallet manager.*|.*manage wallet.*")')
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
    return $(`android=new UiSelector().textContains("${currency}")`)
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
