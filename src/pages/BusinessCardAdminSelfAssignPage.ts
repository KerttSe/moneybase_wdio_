import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'

const BH_ACCOUNT_CODE = process.env.BH_ACCOUNT_CODE || 'SED00004'
const BH_SELF_NAME = process.env.BH_SELF_NAME || 'Dmytro Kertys'
const ADMIN_SELF_ASSIGN_ALERT_TITLE = 'You cannot create your own card'
const ADMIN_SELF_ASSIGN_ALERT_MESSAGE = 'Please ask another administrator or account owner to create your card.'

class BusinessCardAdminSelfAssignPage extends BasePage {
  private get userAvatarAndroid() {
    return $('android=new UiSelector().resourceId("home_button_userAvatar")')
  }

  private get subAccountsSheetAndroid() {
    return $('android=new UiSelector().text("Sub Accounts")')
  }

  private get seDeKeItemAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[contains(@text,"SeDeKE") or contains(@text,"SED00004")]]')
  }

  private get seDeKeItemIOS() {
    return $('-ios predicate string:label CONTAINS "SeDeKE" OR name CONTAINS "SeDeKE" OR label CONTAINS "SED00004" OR name CONTAINS "SED00004"')
  }

  private get accountChipAndroid() {
    return $(`android=new UiSelector().textContains("${BH_ACCOUNT_CODE}")`)
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

  private get cardsTabAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_button_cards")')
  }

  private get cardsTabAndroidByA11y() {
    return $('android=new UiSelector().description("Cards")')
  }

  private get cardsTabIOS() {
    return $('~Cards')
  }

  private get addCardBtnAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/.*add.*Card.*|^.*add.*Card.*")')
  }

  private get addCardBtnAndroidByText() {
    return $('android=new UiSelector().textMatches("(?i)add( new)? card")')
  }

  private get addCardBtnIOS() {
    return $('-ios predicate string:name == "card_item_addCard" OR label MATCHES "(?i)Add( New)? Card" OR name MATCHES "(?i)Add( New)? Card"')
  }

  private get addCardCellIOS() {
    return $('~card_item_addCard')
  }

  private get addCardCellIOSByText() {
    return $('//XCUIElementTypeStaticText[@name="Add Card" or @label="Add Card" or @value="Add Card"]/ancestor::XCUIElementTypeCell[1]')
  }

  private get addCardTextIOS() {
    return $('-ios predicate string:type == "XCUIElementTypeStaticText" AND (name == "Add Card" OR label == "Add Card" OR value == "Add Card")')
  }

  private get addCardPlusIOS() {
    return $('//XCUIElementTypeCell[@name="card_item_addCard"]//XCUIElementTypeImage[@name="plus.circle.fill" or @label="plus.circle.fill" or @label="add"]')
  }

  private get cardTypeRowAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/assignBusinessCard_button_selectCardType$|^assignBusinessCard_button_selectCardType$")')
  }

  private get cardTypeRowIOS() {
    return $(
      '//XCUIElementTypeCell' +
      '[.//XCUIElementTypeStaticText[@name="Physical Card" or @label="Physical Card" or @name="Virtual Card" or @label="Virtual Card"]][1]',
    )
  }

  private get virtualCardOptionAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Virtual Card"]]')
  }

  private get virtualCardOptionIOS() {
    return $('//XCUIElementTypeStaticText[@name="Virtual Card" or @label="Virtual Card" or @value="Virtual Card"]/ancestor::XCUIElementTypeCell[1]')
  }

  private get assigneeRowAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/assignBusinessCard_button_selectUser$|^assignBusinessCard_button_selectUser$")')
  }

  private get assigneeRowIOS() {
    return $(
      `//XCUIElementTypeCell` +
      `[.//XCUIElementTypeStaticText[@name="Select User" or @label="Select User" or contains(@name,"${BH_SELF_NAME}") or contains(@label,"${BH_SELF_NAME}")]][1]`,
    )
  }

  private get selfUserOptionAndroid() {
    return $(`android=new UiSelector().description("${BH_SELF_NAME}")`)
  }

  private get selfUserOptionIOS() {
    return $(`//XCUIElementTypeStaticText[@name="${BH_SELF_NAME}" or @label="${BH_SELF_NAME}"]/ancestor::XCUIElementTypeCell[1]`)
  }

  private get selectUserBtnIOS() {
    return $('-ios predicate string:name == "Select" OR label == "Select"')
  }

  private get userSelectionScreenIOS() {
    return $('~assignBusinessCardUserSelection_screen')
  }

  private get adminSelfAssignAlertMessageAndroid() {
    return $(`android=new UiSelector().text("${ADMIN_SELF_ASSIGN_ALERT_MESSAGE}")`)
  }

  private get adminSelfAssignAlertAndroid() {
    return $(
      `//android.view.View` +
        `[.//android.widget.TextView[@text="${ADMIN_SELF_ASSIGN_ALERT_TITLE}"]` +
        ` and .//android.widget.TextView[@text="${ADMIN_SELF_ASSIGN_ALERT_MESSAGE}"]]`,
    )
  }

  private get adminSelfAssignAlertMessageIOS() {
    return $(
      '-ios predicate string:' +
        'type == "XCUIElementTypeStaticText" AND ' +
        `(name == "${ADMIN_SELF_ASSIGN_ALERT_MESSAGE}" OR ` +
        `label == "${ADMIN_SELF_ASSIGN_ALERT_MESSAGE}" OR ` +
        `value == "${ADMIN_SELF_ASSIGN_ALERT_MESSAGE}")`,
    )
  }

  private get adminSelfAssignAlertTitleIOS() {
    return $(
      '-ios predicate string:' +
        'type == "XCUIElementTypeStaticText" AND ' +
        `(name == "${ADMIN_SELF_ASSIGN_ALERT_TITLE}" OR ` +
        `label == "${ADMIN_SELF_ASSIGN_ALERT_TITLE}" OR ` +
        `value == "${ADMIN_SELF_ASSIGN_ALERT_TITLE}")`,
    )
  }

  private get alertCloseBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Close"]]')
  }

  private get alertCloseSheetBtnAndroid() {
    return $('//android.view.View[@content-desc="Close sheet"]')
  }

  private get alertCloseBtnIOS() {
    return $('-ios predicate string:name CONTAINS[c] "close" OR label CONTAINS[c] "close" OR name == "OK" OR label == "OK" OR name == "alert_button_OK"')
  }

  private async tapElementCenterIOS(el: ChainablePromiseElement) {
    await el.waitForExist({ timeout: 10000 })
    const location = await el.getLocation()
    const size = await el.getSize()
    await browser.execute('mobile: tap', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    })
  }

  private async isAdminSelfAssignPopupVisibleIOS() {
    return (
      (await this.adminSelfAssignAlertTitleIOS.isExisting().catch(() => false)) &&
      (await this.adminSelfAssignAlertMessageIOS.isExisting().catch(() => false))
    )
  }

  private async getAdminSelfAssignPopupMessageText() {
    const alertMessage = browser.isIOS ? this.adminSelfAssignAlertMessageIOS : this.adminSelfAssignAlertMessageAndroid
    const directText = (
      await alertMessage.getText().catch(async () =>
        await alertMessage.getAttribute(browser.isIOS ? 'label' : 'text').catch(() => ''),
      )
    ).trim()
    if (directText) return directText

    const source = await browser.getPageSource().catch(() => '')
    const attrPattern = browser.isIOS
      ? /\b(?:name|label|value)="([^"]+)"/g
      : /\b(?:text|content-desc)="([^"]+)"/g
    const values = [...source.matchAll(attrPattern)]
      .map((match) =>
        match[1]
          .replace(/&#10;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/\s+/g, ' ')
          .trim(),
      )
      .filter(Boolean)

    return values
      .filter((value) => value !== 'Close' && value !== 'Add Card' && value !== 'Cards')
      .join(' ')
  }

  private async getIOSAccountCodeLabel() {
    return (
      await this.profilePickerCodeLabelIOS
        .getAttribute('label')
        .catch(async () => await this.profilePickerCodeLabelIOS.getText().catch(() => ''))
    ).trim()
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

  private async waitForAndroidSeDeKEHome(timeout = 30000) {
    await browser.waitUntil(
      async () => {
        // sheet must be fully gone before checking — the seDeKe list item also contains
        // BH_ACCOUNT_CODE text, so checking chip while sheet still visible is a false positive
        const sheetGone = !(await this.subAccountsSheetAndroid.isExisting().catch(() => true))
        if (!sheetGone) return false
        const avatarShown = await this.userAvatarAndroid.isExisting().catch(() => false)
        const chipShown = await this.accountChipAndroid.isExisting().catch(() => false)
        return avatarShown && chipShown
      },
      { timeout, interval: 500, timeoutMsg: `Home screen did not switch to SeDeKE account (${BH_ACCOUNT_CODE}) on Android` },
    )
  }

  public async ensureSeDeKEAccount() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    if (browser.isIOS) {
      const chip = this.profilePickerCodeLabelIOS
      if (await chip.isExisting().catch(() => false)) {
        const text = await this.getIOSAccountCodeLabel().catch(() => '')
        if (text.includes(BH_ACCOUNT_CODE)) return
      }
      await this.openIOSSubAccountsSheet()
      await this.seDeKeItemIOS.waitForExist({ timeout: 10000, timeoutMsg: `SeDeKE (${BH_ACCOUNT_CODE}) not found in iOS picker` })
      await this.tap(this.seDeKeItemIOS)
      await this.subAccountsTitleIOS.waitForExist({ reverse: true, timeout: 15000 }).catch(() => {})
      await this.waitForIOSSeDeKEHome()
      return
    }

    // early-exit: already on SeDeKE home (require avatar visible to avoid matching stale elements)
    const avatarOnHome = await this.userAvatarAndroid.isExisting().catch(() => false)
    if (avatarOnHome && (await this.accountChipAndroid.isExisting().catch(() => false))) return

    await this.userAvatarAndroid.waitForExist({ timeout: 20000, timeoutMsg: 'Home user avatar not found' })
    await this.tap(this.userAvatarAndroid)
    await this.subAccountsSheetAndroid.waitForExist({ timeout: 15000, timeoutMsg: 'Sub Accounts sheet did not open' })
    await this.seDeKeItemAndroid.waitForExist({ timeout: 10000, timeoutMsg: `SeDeKE (${BH_ACCOUNT_CODE}) not found in Sub Accounts list` })
    await this.tap(this.seDeKeItemAndroid)
    await this.waitForAndroidSeDeKEHome()
  }

  public async openCardsTab() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    if (browser.isIOS) {
      await this.tap(this.cardsTabIOS)
      await this.addCardBtnIOS.waitForExist({ timeout: 15000, timeoutMsg: 'Add Card button did not appear on Cards tab (iOS)' })
      return
    }

    await this.tap(this.cardsTabAndroid).catch(async () => {
      await this.tap(this.cardsTabAndroidByA11y)
    })
    await this.addCardBtnAndroid.waitForExist({ timeout: 30000 }).catch(async () => {
      await this.addCardBtnAndroidByText.waitForExist({
        timeout: 10000,
        timeoutMsg: 'Add Card button did not appear on Cards tab',
      })
    })
  }

  public async tapAddCard() {
    if (browser.isIOS) {
      const candidates = [
        this.addCardTextIOS,
        this.addCardCellIOS,
        this.addCardCellIOSByText,
        this.addCardPlusIOS,
        this.addCardBtnIOS,
      ]

      for (let attempt = 0; attempt < 2; attempt += 1) {
        for (const candidate of candidates) {
          const exists = await candidate.isExisting().catch(() => false)
          if (!exists) continue

          await this.tapElementCenterIOS(candidate).catch(async () => {
            await this.tap(candidate).catch(() => {})
          })

          const opened = await browser
            .waitUntil(async () => await this.isAdminSelfAssignPopupVisibleIOS(), { timeout: 4000, interval: 300 })
            .then(() => true)
            .catch(() => false)
          if (opened) return
        }
      }

      throw new Error('Admin self-assign popup did not open after tapping Add Card (iOS)')
    }

    const addCardBtn = await this.addCardBtnAndroid.waitForExist({ timeout: 10000 }).then(
      () => this.addCardBtnAndroid,
      async () => {
        await this.addCardBtnAndroidByText.waitForExist({ timeout: 5000 })
        return this.addCardBtnAndroidByText
      },
    )
    await this.tap(addCardBtn)
  }

  public async selectVirtualCardType() {
    const cardTypeRow = browser.isIOS ? this.cardTypeRowIOS : this.cardTypeRowAndroid
    await cardTypeRow.waitForExist({ timeout: 10000, timeoutMsg: 'Card Type row not found' })
    await this.tap(cardTypeRow)

    const virtualCardOption = browser.isIOS ? this.virtualCardOptionIOS : this.virtualCardOptionAndroid
    await virtualCardOption.waitForExist({ timeout: 10000, timeoutMsg: 'Virtual Card option not found' })
    await this.tap(virtualCardOption)
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
          (await this.adminSelfAssignAlertMessageIOS.isExisting().catch(() => false)) ||
          !(await this.userSelectionScreenIOS.isExisting().catch(() => false)),
        {
          timeout: 15000,
          interval: 500,
          timeoutMsg: 'Select User sheet did not close after choosing self on iOS',
        },
      )
      return
    }

    await this.selfUserOptionAndroid.waitForExist({
      timeout: 15000,
      timeoutMsg: `User "${BH_SELF_NAME}" not found in Select User list`,
    })
    await this.tap(this.selfUserOptionAndroid)
  }

  public async verifyAdminSelfAssignAlert() {
    if (browser.isIOS) {
      await browser.waitUntil(async () => await this.isAdminSelfAssignPopupVisibleIOS(), {
        timeout: 15000,
        interval: 500,
        timeoutMsg: 'Admin self-assign popup anchor/message did not appear after tapping Add Card (iOS)',
      })
      return
    }

    await this.adminSelfAssignAlertAndroid.waitForExist({
      timeout: 15000,
      timeoutMsg: 'Admin self-assign popup anchor/message did not appear after tapping Add Card (Android)',
    })
  }

  public async verifyAdminSelfAssignAlertMessage() {
    const msg = await this.getAdminSelfAssignPopupMessageText()
    if (!msg) throw new Error('Admin self-assign popup message is empty')
    if (!msg.includes(ADMIN_SELF_ASSIGN_ALERT_MESSAGE)) {
      throw new Error(`Unexpected admin self-assign popup message: "${msg}"`)
    }
  }

  public async dismissAlert() {
    if (browser.isIOS) {
      await this.alertCloseBtnIOS.waitForExist({ timeout: 10000, timeoutMsg: 'Close button not found on admin self-assign popup (iOS)' })
      await this.tap(this.alertCloseBtnIOS)
      await this.adminSelfAssignAlertMessageIOS.waitForExist({ reverse: true, timeout: 10000 }).catch(() => {})
      return
    }

    await this.alertCloseBtnAndroid.waitForExist({ timeout: 10000 }).catch(async () => {
      await this.alertCloseSheetBtnAndroid.waitForExist({ timeout: 5000 })
    })
    await this.tap(this.alertCloseBtnAndroid).catch(async () => {
      await this.tap(this.alertCloseSheetBtnAndroid)
    })
    await this.adminSelfAssignAlertMessageAndroid.waitForExist({ reverse: true, timeout: 10000 }).catch(() => {})
  }
}

export default new BusinessCardAdminSelfAssignPage()
