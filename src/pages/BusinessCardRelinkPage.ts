import BasePage from './BasePage'
import { $, $$, browser } from '@wdio/globals'

const BH_ACCOUNT_CODE = process.env.BH_ACCOUNT_CODE || 'SED00004'
const BH_OTHER_USER_NAME = process.env.BH_OTHER_USER_NAME || 'Dmytri Kerteusz'

class BusinessCardRelinkPage extends BasePage {
  private _currentWallet = ''
  private _targetWallet = ''

  // ── Account switcher ─────────────────────────────────────────────────────

  private get userAvatarAndroid() {
    return $('(//*[@resource-id="home_button_userAvatar"] | //*[contains(@resource-id,"userAvatar")])[1]')
  }

  private get subAccountsSheetAndroid() {
    return $('//*[@text="Sub Accounts" or @content-desc="Sub Accounts"]')
  }

  private get seDeKeItemAndroid() {
    return $('(//*[contains(@content-desc,"SeDeKE") or contains(@content-desc,"SED00004")] | //android.view.View[@clickable="true"][.//android.widget.TextView[contains(@text,"SeDeKE") or contains(@text,"SED00004")]])[1]')
  }

  private get seDeKeItemIOS() {
    return $('-ios predicate string:label CONTAINS "SeDeKE" OR name CONTAINS "SeDeKE" OR label CONTAINS "SED00004" OR name CONTAINS "SED00004"')
  }

  private get accountChipAndroid() {
    return $(`(//*[contains(@content-desc,"${BH_ACCOUNT_CODE}")] | //*[contains(@text,"${BH_ACCOUNT_CODE}")])[1]`)
  }

  private get profilePickerCodeLabelIOS() {
    return $('~profilePicker_label_accountCode')
  }

  private get profilePickerUserNameLabelIOS() {
    return $('~profilePicker_label_userName')
  }

  private get subAccountsTitleIOS() {
    return $('~Sub Accounts')
  }

  private get homeRootIOS() {
    return $('~home_screen_view')
  }

  private async getIOSAccountCodeLabel() {
    return (
      await this.profilePickerCodeLabelIOS
        .getAttribute('label')
        .catch(async () => await this.profilePickerCodeLabelIOS.getText().catch(() => ''))
    ).trim()
  }

  private async waitForIOSSeDeKEHome(timeout = 30000) {
    await browser.waitUntil(
      async () => {
        const homeShown = await this.homeRootIOS.isExisting().catch(() => false)
        const chipShown = await this.profilePickerCodeLabelIOS.isExisting().catch(() => false)
        if (!homeShown || !chipShown) return false

        const label = await this.getIOSAccountCodeLabel()
        return label.includes(BH_ACCOUNT_CODE) && (!label.includes('•') || label.includes('Business'))
      },
      {
        timeout,
        interval: 500,
        timeoutMsg: `Home screen did not switch to Business account (${BH_ACCOUNT_CODE}) on iOS`,
      },
    )
  }

  private async openIOSSubAccountsSheet() {
    await this.homeRootIOS.waitForExist({ timeout: 30000, timeoutMsg: 'Home screen did not load on iOS' })
    await this.profilePickerCodeLabelIOS.waitForExist({ timeout: 20000 })

    const tapAttempts = [
      async () => this.tap(this.profilePickerUserNameLabelIOS),
      async () => this.tap(this.profilePickerCodeLabelIOS),
      async () => {
        const location = await this.profilePickerCodeLabelIOS.getLocation()
        const size = await this.profilePickerCodeLabelIOS.getSize()
        await browser.execute('mobile: tap', {
          x: Math.max(24, location.x - 34),
          y: location.y + Math.round(size.height / 2),
        })
      },
    ]

    for (const attempt of tapAttempts) {
      await attempt().catch(() => {})
      const opened = await this.subAccountsTitleIOS.waitForExist({ timeout: 3000 }).catch(() => false)
      if (opened) return
    }

    await this.subAccountsTitleIOS.waitForExist({ timeout: 15000, timeoutMsg: 'Sub Accounts sheet did not open on iOS' })
  }

  // ── More tab ─────────────────────────────────────────────────────────────

  private get moreTabIOS() {
    return $('~More')
  }

  private get moreTabAndroid() {
    return $('(//*[@content-desc="More"] | //*[contains(@resource-id,"navigation_button_more")] | //*[contains(@resource-id,"nav_graph_more")])[1]')
  }

  // ── Administration item ──────────────────────────────────────────────────

  private get administrationItemIOS() {
    return $('-ios predicate string:name == "Administration" OR label == "Administration"')
  }

  private get administrationItemAndroid() {
    return $('(//*[contains(@content-desc,"Administration")] | //android.view.View[@clickable="true"][.//android.widget.TextView[@text="Administration"]])[1]')
  }

  // ── Manage Cards screen ──────────────────────────────────────────────────

  private get manageCardsNavBarIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Manage Cards"]')
  }

  private get manageCardsTitleAndroid() {
    return $('//*[@text="Manage Cards" or @content-desc="Manage Cards"]')
  }

  // ── Other user's card ─────────────────────────────────────────────────────

  private get otherUserCardAndroid() {
    return $(`(//*[contains(@content-desc,"${BH_OTHER_USER_NAME}")] | //android.view.View[@clickable="true"][.//android.widget.TextView[contains(@text,"${BH_OTHER_USER_NAME}")]])[1]`)
  }

  private get otherUserCardIOS() {
    return $(`//XCUIElementTypeStaticText[contains(@name,"${BH_OTHER_USER_NAME}") or contains(@label,"${BH_OTHER_USER_NAME}")]/ancestor::XCUIElementTypeCell[1]`)
  }

  // ── Card Details title ────────────────────────────────────────────────────

  private get cardDetailsTitleAndroid() {
    return $('//*[@text="Card Details" or @content-desc="Card Details"]')
  }

  private get cardDetailsTitleIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Card Details"]')
  }

  // ── Spend From row ────────────────────────────────────────────────────────
  // Clickable row that sits directly after the "Spend From" label

  private get spendFromRowAndroid() {
    return $('(//*[contains(@content-desc,"Spend From")] | //android.widget.TextView[@text="Spend From"]/following-sibling::android.view.View[@clickable="true"][1])[1]')
  }

  private get spendFromRowIOS() {
    return $('//XCUIElementTypeCell[@name="businessCard_button_spendFrom"]')
  }

  // First StaticText in Spend From row = wallet code (excludes IBAN line with "·")
  private get spendFromCurrentWalletIOS() {
    return $('//XCUIElementTypeCell[@name="businessCard_button_spendFrom"]//XCUIElementTypeStaticText[not(contains(@value,"·"))][1]')
  }

  // Inner view inside Spend From row carries content-desc = current wallet code
  private get spendFromCurrentWalletAndroid() {
    return $('//android.widget.TextView[@text="Spend From"]/following-sibling::android.view.View[@clickable="true"][1]//android.view.View[@content-desc and string-length(@content-desc) > 0]')
  }

  // ── Select Wallet sheet ───────────────────────────────────────────────────

  private get selectWalletTitleAndroid() {
    return $('//*[@text="Select Wallet" or @content-desc="Select Wallet"]')
  }

  private get selectWalletTitleIOS() {
    return $('-ios predicate string:name == "Select Wallet" OR label == "Select Wallet"')
  }

  // All wallet name TextViews in the scrollable list (first TextView in each clickable row)
  // Excludes the IBAN line (contains "·") and balance line
  private get walletNameRowsAndroid() {
    return $$(
      '(//*[@resource-id="businessWalletSelection_screen"]//android.view.View[@clickable="true"]/android.widget.TextView[1] | //*[@resource-id="businessWalletSelection_screen"]//android.view.View[@clickable="true"]/*[@content-desc and string-length(@content-desc) > 2 and not(contains(@content-desc,"Navigate")) and not(contains(@content-desc,"Back")) and not(contains(@content-desc,"Close"))])',
    )
  }

  // iOS: wallet code StaticText — direct child of the text-area Other (not wrapped in a name container)
  private get walletNameRowsIOS() {
    return $$(
      '//XCUIElementTypeOther[@name="businessWalletSelection_screen"]' +
      '//XCUIElementTypeCell' +
      '//XCUIElementTypeOther[XCUIElementTypeOther and XCUIElementTypeStaticText]' +
      '/XCUIElementTypeStaticText',
    )
  }

  private walletRowAndroid(name: string) {
    return $(`(//*[@content-desc="${name}"] | //android.view.View[@clickable="true"][.//android.widget.TextView[@text="${name}"]])[1]`)
  }

  private walletRowIOS(name: string) {
    return $(
      `//XCUIElementTypeOther[@name="businessWalletSelection_screen"]` +
      `//XCUIElementTypeStaticText[@name="${name}" or @label="${name}"]`,
    )
  }

  // ── Spend From verification on Card Details ───────────────────────────────

  private spendFromUpdatedAndroid(walletName: string) {
    return $(`//android.view.View[@content-desc="${walletName}"]`)
  }

  private spendFromUpdatedIOS(walletName: string) {
    return $(
      `//XCUIElementTypeCell[@name="businessCard_button_spendFrom"]` +
      `//XCUIElementTypeStaticText[@name="${walletName}" or @label="${walletName}"]`,
    )
  }

  // ── Public methods ────────────────────────────────────────────────────────

  public async ensureSeDeKEAccount() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    if (browser.isIOS) {
      const chip = this.profilePickerCodeLabelIOS
      if (await chip.isExisting().catch(() => false)) {
        const text = await this.getIOSAccountCodeLabel().catch(() => '')
        if (text.includes(BH_ACCOUNT_CODE)) return
      }
      await this.openIOSSubAccountsSheet()
      await this.seDeKeItemIOS.waitForExist({ timeout: 10000, timeoutMsg: 'SeDeKE account item not found in iOS picker' })
      await this.tap(this.seDeKeItemIOS)
      await this.subAccountsTitleIOS.waitForExist({ reverse: true, timeout: 15000 }).catch(() => {})
      await this.waitForIOSSeDeKEHome()
      return
    }

    await this.switchAndroidAccountByCode(BH_ACCOUNT_CODE, 'Business')
  }

  public async openAdministration() {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    if (browser.isIOS) {
      await this.moreTabIOS.waitForExist({ timeout: 15000 })
      await this.tap(this.moreTabIOS)
    } else {
      await this.openAndroidMoreMenuFromProfile()
    }
    await browser.pause(500)
    const adminItem = browser.isIOS ? this.administrationItemIOS : this.administrationItemAndroid
    await adminItem.waitForExist({ timeout: 15000, timeoutMsg: 'Administration item not found in More section' })
    await this.tap(adminItem)
    await browser.pause(500)
  }

  public async openManageCards() {
    if (browser.isIOS) {
      await this.manageCardsNavBarIOS.waitForExist({
        timeout: 15000,
        timeoutMsg: 'Manage Cards screen did not open on iOS',
      })
      return
    }
    await browser.waitUntil(async () => this.manageCardsTitleAndroid.isExisting().catch(() => false), {
      timeout: 15000,
      interval: 500,
      timeoutMsg: 'Manage Cards screen did not open on Android',
    })
  }

  public async openOtherUserCard() {
    const card = browser.isIOS ? this.otherUserCardIOS : this.otherUserCardAndroid
    await card.waitForExist({
      timeout: 15000,
      timeoutMsg: `Card for "${BH_OTHER_USER_NAME}" not found in Active tab`,
    })
    await this.tap(card)

    if (browser.isIOS) {
      await this.cardDetailsTitleIOS.waitForExist({
        timeout: 20000,
        timeoutMsg: 'Card Details screen did not open on iOS',
      })
    } else {
      await browser.waitUntil(
        async () => this.cardDetailsTitleAndroid.isExisting().catch(() => false),
        { timeout: 20000, interval: 500, timeoutMsg: 'Card Details screen did not open on Android' },
      )
    }
  }

  public async tapSpendFromRow() {
    if (browser.isIOS) {
      await this.spendFromRowIOS.waitForExist({
        timeout: 15000,
        timeoutMsg: 'Spend From row not found on Card Details (iOS)',
      })
      this._currentWallet = await this.spendFromCurrentWalletIOS.getText().catch(() => '')
      await this.tap(this.spendFromRowIOS)
    } else {
      await this.spendFromRowAndroid.waitForExist({
        timeout: 15000,
        timeoutMsg: 'Spend From row not found on Card Details (Android)',
      })
      // Read the current wallet name before opening the sheet
      this._currentWallet = await this.spendFromCurrentWalletAndroid
        .getAttribute('content-desc')
        .catch(() => '')
      await this.tap(this.spendFromRowAndroid)
    }
  }

  public async verifySelectWalletSheet() {
    const title = browser.isIOS ? this.selectWalletTitleIOS : this.selectWalletTitleAndroid
    await title.waitForExist({
      timeout: 10000,
      timeoutMsg: '"Select Wallet" sheet did not open',
    })
  }

  public async selectRandomExistingWallet() {
    if (browser.isIOS) {
      const nameEls = await this.walletNameRowsIOS
      const names: string[] = []
      for (const el of nameEls) {
        if (!el) continue
        const text = await el.getText().catch(() => '')
        if (text && !text.includes('·') && text !== 'Add New Wallet' && text !== this._currentWallet) {
          names.push(text)
        }
      }
      if (names.length === 0) throw new Error(`No alternative wallet found (current: "${this._currentWallet}")`)
      this._targetWallet = names[Math.floor(Math.random() * names.length)]
      await this.tap(this.walletRowIOS(this._targetWallet))
    } else {
      const nameEls = await this.walletNameRowsAndroid
      const names: string[] = []
      for (const el of nameEls) {
        if (!el) continue
        const text = (await el.getText().catch(() => ''))
          || (await el.getAttribute('content-desc').catch(() => ''))
        const name = text.split('\n')[0].trim()
        if (name && name !== 'Add New Wallet' && name !== this._currentWallet) names.push(name)
      }
      if (names.length === 0) throw new Error(`No alternative wallet found (current: "${this._currentWallet}")`)
      this._targetWallet = names[Math.floor(Math.random() * names.length)]
      await this.tap(this.walletRowAndroid(this._targetWallet))
    }
    await browser.pause(1000)
  }

  public async verifySpendFromUpdated() {
    if (!this._targetWallet) throw new Error('Target wallet not set — call selectRandomExistingWallet() first')

    if (browser.isIOS) {
      await this.cardDetailsTitleIOS.waitForExist({
        timeout: 15000,
        timeoutMsg: 'Did not return to Card Details after wallet relink (iOS)',
      })
      await this.spendFromUpdatedIOS(this._targetWallet).waitForExist({
        timeout: 10000,
        timeoutMsg: `Spend From not updated to "${this._targetWallet}" on Card Details (iOS)`,
      })
    } else {
      await browser.waitUntil(
        async () => this.cardDetailsTitleAndroid.isExisting().catch(() => false),
        { timeout: 15000, interval: 500, timeoutMsg: 'Did not return to Card Details after wallet relink (Android)' },
      )
      await this.spendFromUpdatedAndroid(this._targetWallet).waitForExist({
        timeout: 10000,
        timeoutMsg: `Spend From not updated to "${this._targetWallet}" on Card Details (Android)`,
      })
    }
  }

  public get targetWalletName(): string {
    return this._targetWallet
  }
}

export default new BusinessCardRelinkPage()
