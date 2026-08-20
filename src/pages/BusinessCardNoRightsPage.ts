import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'

const BH_ACCOUNT_CODE = process.env.BH_ACCOUNT_CODE || 'SED00004'
const BH_SELF_NAME = process.env.BH_SELF_NAME || 'Dmytro Kertys'

class BusinessCardNoRightsPage extends BasePage {
  // ── Account switcher ─────────────────────────────────────────────────────

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

  // ── Cards tab ─────────────────────────────────────────────────────────────

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
    return $('-ios predicate string:name CONTAINS "addCard" OR label MATCHES "(?i)Add( New)? Card" OR name MATCHES "(?i)Add( New)? Card"')
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

  // ── Assign Card form ──────────────────────────────────────────────────────

  private get cardTypeRowAndroid() {
    return $('android=new UiSelector().resourceId("assignBusinessCard_button_selectCardType")')
  }

  private get cardTypeRowIOS() {
    return $('//XCUIElementTypeStaticText[@name="Physical Card" or @label="Physical Card" or @value="Physical Card"]/ancestor::XCUIElementTypeCell[1]')
  }

  private get virtualCardOptionAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Virtual Card"]]')
  }

  private get virtualCardOptionIOS() {
    return $('//XCUIElementTypeStaticText[@name="Virtual Card" or @label="Virtual Card" or @value="Virtual Card"]/ancestor::XCUIElementTypeCell[1]')
  }

  private get changeCardTypeConfirmBtnAndroid() {
    return $('android=new UiSelector().text("Change")')
  }

  private get changeCardTypeConfirmBtnIOS() {
    return $('-ios predicate string:name == "Change" OR label == "Change"')
  }

  // ── Assignee row ──────────────────────────────────────────────────────────

  private get assigneeRowAndroid() {
    return $('android=new UiSelector().resourceId("assignBusinessCard_button_selectUser")')
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

  // ── No-rights popup ───────────────────────────────────────────────────────

  private get noRightsMessageAndroid() {
    return $('android=new UiSelector().textMatches("(?i).*create.*business card.*contact your administrator.*")')
  }

  private get noRightsMessageIOS() {
    return $(
      '-ios predicate string:' +
        '(name CONTAINS[c] "create" OR label CONTAINS[c] "create" OR value CONTAINS[c] "create") AND ' +
        '(name CONTAINS[c] "business card" OR label CONTAINS[c] "business card" OR value CONTAINS[c] "business card") AND ' +
        '(name CONTAINS[c] "contact your administrator" OR label CONTAINS[c] "contact your administrator" OR value CONTAINS[c] "contact your administrator")',
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

  private async isNoRightsPopupVisibleIOS() {
    return (
      (await this.noRightsMessageIOS.isExisting().catch(() => false)) ||
      (await this.alertCloseBtnIOS.isExisting().catch(() => false))
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
    await this.addCardBtnAndroid.waitForExist({ timeout: 15000 }).catch(async () => {
      await this.addCardBtnAndroidByText.waitForExist({
        timeout: 5000,
        timeoutMsg: 'Add Card button did not appear on Cards tab (Android)',
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
            .waitUntil(async () => await this.isNoRightsPopupVisibleIOS(), { timeout: 4000, interval: 300 })
            .then(() => true)
            .catch(() => false)
          if (opened) return
        }
      }

      throw new Error('No-rights popup did not open after tapping Add Card (iOS)')
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
    await cardTypeRow.waitForExist({ timeout: 10000 })
    await this.tap(cardTypeRow)

    const confirmBtn = browser.isIOS ? this.changeCardTypeConfirmBtnIOS : this.changeCardTypeConfirmBtnAndroid
    const confirmed = await confirmBtn.waitForExist({ timeout: 3000 }).catch(() => false)
    if (confirmed) await this.tap(confirmBtn)

    const virtualOption = browser.isIOS ? this.virtualCardOptionIOS : this.virtualCardOptionAndroid
    await virtualOption.waitForExist({ timeout: 10000, timeoutMsg: 'Virtual Card option not found' })
    await this.tap(virtualOption)
    await browser.pause(800)
  }

  public async selectSelfAsAssignee() {
    const assigneeRow = browser.isIOS ? this.assigneeRowIOS : this.assigneeRowAndroid
    await assigneeRow.waitForExist({ timeout: 15000, timeoutMsg: 'Assignee row not found' })
    await this.tap(assigneeRow)

    const selfUser = browser.isIOS ? this.selfUserOptionIOS : this.selfUserOptionAndroid
    await selfUser.waitForExist({ timeout: 15000, timeoutMsg: `"${BH_SELF_NAME}" not found in user list` })
    await this.tap(selfUser)
    await browser.pause(800)
  }

  public async verifyNoRightsAlert() {
    const message = browser.isIOS ? this.noRightsMessageIOS : this.noRightsMessageAndroid
    await message.waitForExist({
      timeout: 15000,
      timeoutMsg: `No-rights user blocked alert did not appear after tapping Add Card (${browser.isIOS ? 'iOS' : 'Android'})`,
    })
  }

  public async verifyNoRightsAlertMessage() {
    const message = browser.isIOS ? this.noRightsMessageIOS : this.noRightsMessageAndroid
    const msg = await message.getText().catch(async () => await message.getAttribute('label').catch(() => ''))
    if (!msg) throw new Error('Alert message is empty')
    const normalized = msg.toLowerCase()
    if (!/create.*business card/.test(normalized) || !normalized.includes('contact your administrator')) {
      throw new Error(`Unexpected no-rights alert message: "${msg}"`)
    }
  }

  public async dismissAlert() {
    if (browser.isIOS) {
      await this.alertCloseBtnIOS.waitForExist({ timeout: 10000, timeoutMsg: 'Close/OK button not found on no-rights alert (iOS)' })
      await this.tap(this.alertCloseBtnIOS)
      await this.noRightsMessageIOS.waitForExist({ reverse: true, timeout: 10000 }).catch(() => {})
      return
    }

    await this.alertCloseBtnAndroid.waitForExist({ timeout: 10000 }).catch(async () => {
      await this.alertCloseSheetBtnAndroid.waitForExist({ timeout: 5000 })
    })
    await this.tap(this.alertCloseBtnAndroid).catch(async () => {
      await this.tap(this.alertCloseSheetBtnAndroid)
    })
    await this.noRightsMessageAndroid.waitForExist({ reverse: true, timeout: 10000 }).catch(() => {})
  }
}

export default new BusinessCardNoRightsPage()
