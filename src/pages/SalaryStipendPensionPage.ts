import BasePage from './BasePage'
import AddFundsPage from './AddFunds'
import { $, browser } from '@wdio/globals'

export default class SalaryStipendPensionPage extends BasePage {
  private readonly addFundsPage = new AddFundsPage()

  /* ========================
   * ADD FUNDS SCREEN
   * ====================== */

  private get addFundsScreenAnchorIOS() {
    return $('-ios predicate string:name == "addFunds_item_card" OR name == "addFunds_item_autoTopup" OR name == "addFunds_item_bankTransfer" OR name == "addFunds_item_salary"')
  }

  private get sspTileIOS() {
    return $('~addFunds_item_salary')
  }

  private get sspTileAndroid() {
    return $('android=new UiSelector().description("addFunds_item_salary")')
  }

  /* ========================
   * PREFERENCE SCREEN
   * Unique anchor: "Select your preference" — NOT the NavBar (same name on instruction screen)
   * ====================== */

  private get selectPreferenceHeadingIOS() {
    return $('-ios predicate string:name == "Select your preference" OR label == "Select your preference"')
  }

  private get fullSalaryOptionIOS() {
    return $('//XCUIElementTypeCell[.//XCUIElementTypeStaticText[@name="Salary, Stipend or Pension"]]')
  }

  private get partialSalaryOptionIOS() {
    return $('//XCUIElementTypeCell[.//XCUIElementTypeStaticText[@name="Part of my Salary"]]')
  }

  private get salaryAmountFieldIOS() {
    return $('//XCUIElementTypeTextField[@placeholderValue="€0"]')
  }

  private get nextBtnIOS() {
    return $('~Next')
  }

  /* ========================
   * INSTRUCTION SCREEN
   * Unique anchor: "Share this email with your employer" — only on this screen
   * ====================== */

  private get instructionScreenHeadingIOS() {
    return $('-ios predicate string:name == "Share this email with your employer" OR label == "Share this email with your employer"')
  }

  private get ibanLabelIOS() {
    return $('//XCUIElementTypeTextView[@name="IBAN:"]')
  }

  private get bicLabelIOS() {
    return $('//XCUIElementTypeTextView[@name="BIC:"]')
  }

  private get bankNameLabelIOS() {
    return $('//XCUIElementTypeTextView[@name="Bank Name:"]')
  }

  private get copyTextBtnIOS() {
    return $('~Copy Text')
  }

  private get shareBtnIOS() {
    return $('~Share')
  }

  private get closeBtnIOS() {
    return $('~close')
  }

  /* ========================
   * PUBLIC FLOW
   * ====================== */

  async openFromHome() {
    await this.addFundsPage.openFromHome()
  }

  async tapSspTile() {
    if (browser.isIOS) {
      await browser.waitUntil(
        async () => {
          if (!(await this.sspTileIOS.isExisting().catch(() => false))) return false
          await this.tap(this.sspTileIOS).catch(() => {})
          return this.selectPreferenceHeadingIOS.isExisting().catch(() => false)
        },
        { timeout: 25000, interval: 1500 }
      )
    } else {
      await this.sspTileAndroid.waitForDisplayed({ timeout: 15000 })
      await this.tap(this.sspTileAndroid)
    }
  }

  async selectFullSalaryPreference() {
    if (browser.isIOS) {
      await this.selectPreferenceHeadingIOS.waitForExist({ timeout: 15000 })
      const cell = this.fullSalaryOptionIOS
      if (await cell.isExisting().catch(() => false)) {
        await this.tap(cell).catch(() => {})
      }
    }
  }

  async selectPartialSalaryPreference(amount?: string) {
    if (browser.isIOS) {
      await this.selectPreferenceHeadingIOS.waitForExist({ timeout: 15000 })
      await this.tap(this.partialSalaryOptionIOS)
      if (amount) {
        const field = this.salaryAmountFieldIOS
        await field.waitForExist({ timeout: 8000 })
        await field.clearValue()
        await field.setValue(amount)
      }
    }
  }

  async tapNext() {
    if (browser.isIOS) {
      await this.nextBtnIOS.waitForExist({ timeout: 10000 })
      await browser.waitUntil(
        async () => {
          await this.tap(this.nextBtnIOS).catch(() => {})
          return this.instructionScreenHeadingIOS.isExisting().catch(() => false)
        },
        { timeout: 15000, interval: 1500 }
      )
    }
  }

  async verifyInstructionScreenContent() {
    if (browser.isIOS) {
      await this.copyTextBtnIOS.waitForExist({ timeout: 15000 })
      const hasIban = await this.ibanLabelIOS.isExisting().catch(() => false)
      const hasBic = await this.bicLabelIOS.isExisting().catch(() => false)
      const hasBankName = await this.bankNameLabelIOS.isExisting().catch(() => false)
      if (!hasIban || !hasBic || !hasBankName) {
        throw new Error('SSP instruction screen missing expected fields (IBAN / BIC / Bank Name)')
      }
    }
  }

  async tapCopyText() {
    if (browser.isIOS) {
      await this.copyTextBtnIOS.waitForExist({ timeout: 10000 })
      await this.tap(this.copyTextBtnIOS)
    }
  }

  async tapShare() {
    if (browser.isIOS) {
      await this.shareBtnIOS.waitForExist({ timeout: 10000 })
      await this.tap(this.shareBtnIOS)
    }
  }

  async tapClose() {
    if (browser.isIOS) {
      await this.closeBtnIOS.waitForExist({ timeout: 10000 })
      await this.tap(this.closeBtnIOS)
    }
  }
}
