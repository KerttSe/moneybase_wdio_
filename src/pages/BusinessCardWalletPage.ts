import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'
import allure from '@wdio/allure-reporter'
import type { ChainablePromiseElement } from 'webdriverio'

const BH_ACCOUNT_CODE = process.env.BH_ACCOUNT_CODE || 'SED00004'
const BH_SELF_NAME = process.env.BH_SELF_NAME || 'Dmytro Kertys'

class BusinessCardWalletPage extends BasePage {
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
      { timeout, interval: 500, timeoutMsg: `Home screen did not switch to Business account (${BH_ACCOUNT_CODE}) on iOS` },
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

  private async tapElementCenterAndroid(el: ChainablePromiseElement) {
    await el.waitForExist({ timeout: 5000 })
    const loc = await el.getLocation().catch(() => null)
    const size = await el.getSize().catch(() => null)
    if (loc && size) {
      await browser.execute('mobile: clickGesture', {
        x: Math.round(loc.x + size.width / 2),
        y: Math.round(loc.y + size.height / 2),
      })
    } else {
      await el.click().catch(() => {})
    }
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

  // ── Manage Cards: Assign Card button ─────────────────────────────────────

  private get assignCardBtnAndroid() {
    return $('(//*[contains(@content-desc,"Assign Card")] | //android.view.View[@clickable="true"][.//android.widget.TextView[@text="Assign Card"]])[1]')
  }

  private get assignCardBtnIOS() {
    return $('-ios predicate string:name == "Assign Card" OR label == "Assign Card"')
  }

  // ── Wallet creation context selectors ────────────────────────────────────

  private get cardTypeRowAndroid() {
    return $('(//*[@resource-id="assignBusinessCard_button_selectCardType"] | //*[contains(@content-desc,"Card Type") or contains(@content-desc,"Physical Card") or contains(@content-desc,"Virtual Card")])[1]')
  }

  private get cardTypeRowIOS() {
    return $(
      '//XCUIElementTypeCell' +
      '[.//XCUIElementTypeStaticText[@name="Physical Card" or @label="Physical Card" or @name="Virtual Card" or @label="Virtual Card"]][1]',
    )
  }

  private get virtualCardOptionAndroid() {
    return $('(//*[@content-desc="Virtual Card"] | //*[contains(@content-desc,"Virtual Card")] | //android.view.View[@clickable="true"][.//android.widget.TextView[@text="Virtual Card"]])[1]')
  }

  private get virtualCardOptionIOS() {
    return $('//XCUIElementTypeStaticText[@name="Virtual Card" or @label="Virtual Card" or @value="Virtual Card"]/ancestor::XCUIElementTypeCell[1]')
  }

  private get assigneeRowAndroid() {
    return $('(//*[contains(@content-desc,"Assign Card To")] | //*[@resource-id="assignBusinessCard_button_selectUser"] | //android.view.View[@clickable="true"][.//android.view.View[@content-desc="Assign Card To"]])[1]')
  }

  private get assigneeRowIOS() {
    return $(
      `//XCUIElementTypeCell` +
      `[.//XCUIElementTypeStaticText[@name="Select User" or @label="Select User" or contains(@name,"${BH_SELF_NAME}") or contains(@label,"${BH_SELF_NAME}")]][1]`,
    )
  }

  private get selfUserOptionAndroid() {
    return $(`(//*[@content-desc="${BH_SELF_NAME}"] | //*[contains(@content-desc,"${BH_SELF_NAME}")])[1]`)
  }

  private get selfUserOptionIOS() {
    return $(`//XCUIElementTypeStaticText[@name="${BH_SELF_NAME}" or @label="${BH_SELF_NAME}"]/ancestor::XCUIElementTypeCell[1]`)
  }

  private get selectUserBtnAndroid() {
    return $('(//*[@resource-id="assignBusinessCardUserSelection_button_select"] | //*[@content-desc="Select"])[1]')
  }

  private get selectUserBtnIOS() {
    return $('-ios predicate string:name == "Select" OR label == "Select"')
  }

  private get userSelectionSheetAndroid() {
    return $('(//*[@resource-id="assignBusinessCardUserSelection_screen"] | //*[contains(@content-desc,"Select User")])[1]')
  }

  private get userSelectionScreenIOS() {
    return $('~assignBusinessCardUserSelection_screen')
  }

  private get spendFromRowAndroid() {
    return $('(//*[contains(@content-desc,"Spend From")] | //android.view.View[@clickable="true"][.//android.view.View[@content-desc="Spend From"]])[1]')
  }

  private get spendFromRowIOS() {
    return $('//XCUIElementTypeCell[.//XCUIElementTypeStaticText[@name="Spend From" or @label="Spend From"]][1]')
  }

  // ── Select Wallet sheet ──────────────────────────────────────────────────

  private get selectWalletTitleAndroid() {
    return $('//*[@text="Select Wallet" or @content-desc="Select Wallet"]')
  }

  private get selectWalletTitleIOS() {
    return $('-ios predicate string:name == "Select Wallet" OR label == "Select Wallet"')
  }

  // ── Add New Wallet button ─────────────────────────────────────────────────

  private get addNewWalletBtnAndroid() {
    return $('(//*[@resource-id="businessWalletSelection_button_addNewWallet"] | //*[contains(@resource-id,"businessWalletSelection_button_addNewWallet")] | //*[contains(@content-desc,"Add New Wallet")] | //android.view.View[@clickable="true"][.//android.widget.TextView[@text="Add New Wallet"]])[1]')
  }

  private get addNewWalletBtnIOS() {
    return $('-ios predicate string:name == "Add New Wallet" OR label == "Add New Wallet"')
  }

  // ── New Wallet form ──────────────────────────────────────────────────────

  private get newWalletScreenTitleAndroid() {
    return $('//*[@text="New Wallet" or @content-desc="New Wallet"]')
  }

  private get newWalletScreenTitleIOS() {
    return $('-ios predicate string:name == "New Wallet" OR label == "New Wallet"')
  }

  private get walletNameInputAndroid() {
    return $('//android.widget.ScrollView//android.widget.EditText[1]')
  }

  private get walletNameInputIOS() {
    return $('//XCUIElementTypeTextField[1]')
  }

  private get addBtnAndroid() {
    return $('(//*[@content-desc="Add"] | //android.view.View[@clickable="true"][.//android.widget.TextView[@text="Add"]])[1]')
  }

  private get addBtnIOS() {
    return $('-ios predicate string:name == "Add" OR label == "Add"')
  }

  // ── Add Wallet result dialog ──────────────────────────────────────────────

  private get addWalletDialogTitleAndroid() {
    return $('//*[@text="Add Wallet" or @content-desc="Add Wallet"]')
  }

  private get addWalletDialogMessageAndroid() {
    return $('//*[contains(@text,"maximum number of wallets") or contains(@content-desc,"maximum number of wallets")]')
  }

  private get addWalletDialogOkAndroid() {
    return $('(//*[@text="OK" or @content-desc="OK"] | //android.view.View[@clickable="true"][.//android.widget.TextView[@text="OK"]])[1]')
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

  public async tapAssignCard() {
    const btn = browser.isIOS ? this.assignCardBtnIOS : this.assignCardBtnAndroid
    await btn.waitForExist({ timeout: 15000, timeoutMsg: 'Assign Card button not found on Manage Cards' })
    await this.tap(btn)
    const cardTypeRow = browser.isIOS ? this.cardTypeRowIOS : this.cardTypeRowAndroid
    await cardTypeRow.waitForExist({
      timeout: 15000,
      timeoutMsg: 'Assign Card form did not open (Card Type row not found)',
    })
  }

  public async selectVirtualCardType() {
    const cardTypeRow = browser.isIOS ? this.cardTypeRowIOS : this.cardTypeRowAndroid
    await cardTypeRow.waitForExist({ timeout: 15000, timeoutMsg: 'Card Type row not found after opening Wallets' })
    await this.tap(cardTypeRow)

    const virtualOption = browser.isIOS ? this.virtualCardOptionIOS : this.virtualCardOptionAndroid
    await virtualOption.waitForExist({
      timeout: 15000,
      timeoutMsg: 'Virtual Card option not found in card type selection sheet',
    })
    await this.tap(virtualOption)
    await browser.pause(800)
  }

  public async selectSelfAssignee() {
    const assigneeRow = browser.isIOS ? this.assigneeRowIOS : this.assigneeRowAndroid
    await assigneeRow.waitForExist({
      timeout: 15000,
      timeoutMsg: 'Assign Card To row not found after selecting virtual card type',
    })
    await this.tap(assigneeRow)

    if (browser.isIOS) {
      await this.selfUserOptionIOS.waitForExist({
        timeout: 15000,
        timeoutMsg: `User "${BH_SELF_NAME}" not found in Select User list`,
      })
      await this.tap(this.selfUserOptionIOS)
      await browser.pause(600)

      if (await this.selectUserBtnIOS.isExisting().catch(() => false)) {
        await this.tap(this.selectUserBtnIOS)
      }

      await browser.waitUntil(
        async () =>
          (await this.selectWalletTitleIOS.isExisting().catch(() => false)) ||
          !(await this.userSelectionScreenIOS.isExisting().catch(() => false)),
        {
          timeout: 15000,
          interval: 500,
          timeoutMsg: 'Select User sheet did not close after choosing assignee on iOS',
        },
      )
      return
    }

    await this.selfUserOptionAndroid.waitForExist({
      timeout: 15000,
      timeoutMsg: `User "${BH_SELF_NAME}" content-desc row not found in Select User list`,
    })
    await this.tapElementCenterAndroid(this.selfUserOptionAndroid)
    await browser.pause(600)

    if (await this.userSelectionSheetAndroid.isExisting().catch(() => false)) {
      await browser.waitUntil(
        async () =>
          (await this.userSelectionSheetAndroid.isExisting().catch(() => false)) &&
          (await this.selectUserBtnAndroid.isExisting().catch(() => false)) &&
          (await this.selectUserBtnAndroid.isEnabled().catch(() => false)),
        { timeout: 5000, interval: 300, timeoutMsg: 'Select button did not become enabled after choosing user' },
      )
      if (await this.userSelectionSheetAndroid.isExisting().catch(() => false)) {
        await this.tapElementCenterAndroid(this.selectUserBtnAndroid)
      }
    }

    await browser.waitUntil(
      async () =>
        (await this.selectWalletTitleAndroid.isExisting().catch(() => false)) ||
        !(await this.userSelectionSheetAndroid.isExisting().catch(() => false)),
      { timeout: 15000, interval: 500, timeoutMsg: 'Select User sheet did not close after choosing assignee' },
    )
    await browser.pause(1000)
  }

  public async verifySelectWalletSheet() {
    const title = browser.isIOS ? this.selectWalletTitleIOS : this.selectWalletTitleAndroid
    await title.waitForExist({ timeout: 10000, timeoutMsg: '"Select Wallet" sheet did not open' })
  }

  public async openWalletPickerFromSpendFrom() {
    const spendFromRow = browser.isIOS ? this.spendFromRowIOS : this.spendFromRowAndroid
    await spendFromRow.waitForExist({
      timeout: 15000,
      timeoutMsg: 'Spend From row not found on Assign Card form',
    })
    await this.tap(spendFromRow)
    await this.verifySelectWalletSheet()
  }

  public async tapAddNewWallet() {
    const btn = browser.isIOS ? this.addNewWalletBtnIOS : this.addNewWalletBtnAndroid
    await btn.waitForExist({ timeout: 10000, timeoutMsg: '"Add New Wallet" button not found' })
    if (browser.isAndroid) {
      await this.tapElementCenterAndroid(btn)
    } else {
      await this.tap(btn)
    }
  }

  public async verifyNewWalletForm() {
    const title = browser.isIOS ? this.newWalletScreenTitleIOS : this.newWalletScreenTitleAndroid
    await title.waitForExist({ timeout: 15000, timeoutMsg: '"New Wallet" screen did not open' })
  }

  public async enterWalletName(name: string) {
    const input = browser.isIOS ? this.walletNameInputIOS : this.walletNameInputAndroid
    await input.waitForExist({ timeout: 10000, timeoutMsg: 'Wallet name input not found' })
    await input.clearValue()
    await input.setValue(name)
    await browser.pause(300)
  }

  public async tapAdd() {
    const btn = browser.isIOS ? this.addBtnIOS : this.addBtnAndroid
    await btn.waitForExist({ timeout: 10000, timeoutMsg: '"Add" button not found' })
    await btn.waitForEnabled({ timeout: 5000 }).catch(() => {})
    await this.tap(btn)
  }

  public async verifyAddWalletDialog() {
    await this.addWalletDialogTitleAndroid.waitForExist({
      timeout: 15000,
      timeoutMsg: '"Add Wallet" dialog did not appear',
    })
  }

  public async verifyPlanLimitMessage() {
    await this.addWalletDialogMessageAndroid.waitForExist({
      timeout: 10000,
      timeoutMsg: 'Plan limit message not found in dialog',
    })
    const title = await this.addWalletDialogTitleAndroid.getText().catch(() => 'Add Wallet')
    const msg = await this.addWalletDialogMessageAndroid.getText()
    if (!msg.toLowerCase().includes('maximum')) {
      throw new Error(`Unexpected dialog message: "${msg}"`)
    }
    allure.addAttachment('Add Wallet alert', `${title}\n${msg}`, 'text/plain')
    const screenshot = await browser.takeScreenshot().catch(() => '')
    if (screenshot) {
      allure.addAttachment('Add Wallet alert screenshot', Buffer.from(screenshot, 'base64'), 'image/png')
    }
  }

  public async dismissAddWalletDialog() {
    await this.addWalletDialogOkAndroid.waitForExist({ timeout: 10000 })
    await this.tap(this.addWalletDialogOkAndroid)
    await this.addWalletDialogTitleAndroid.waitForExist({ reverse: true, timeout: 10000 }).catch(() => {})
  }
}

export default new BusinessCardWalletPage()
