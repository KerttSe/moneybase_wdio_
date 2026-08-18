import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'

const BH_ACCOUNT_CODE = process.env.CARD_LIMITS_ACCOUNT_CODE || 'ADV00003'
const BH_SELF_NAME = process.env.CARD_LIMITS_SELF_NAME || 'Brian Vindo'
const USER_CARD_LIMIT_REACHED = 'User card limit reached'

class BusinessCardCardLimitsPage extends BasePage {
  // ── Account switcher ─────────────────────────────────────────────────────

  private get userAvatarAndroid() {
    return $('android=new UiSelector().resourceId("home_button_userAvatar")')
  }

  private get subAccountsSheetAndroid() {
    return $('android=new UiSelector().text("Sub Accounts")')
  }

  private get seDeKeItemAndroid() {
    return $(`//android.view.View[@clickable="true"][.//android.widget.TextView[contains(@text,"${BH_ACCOUNT_CODE}")]]`)
  }

  private get seDeKeItemIOS() {
    return $(`-ios predicate string:label CONTAINS "${BH_ACCOUNT_CODE}" OR name CONTAINS "${BH_ACCOUNT_CODE}"`)
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
      { timeout, interval: 500, timeoutMsg: `Home did not switch to ${BH_ACCOUNT_CODE} on iOS` },
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
    const location = await el.getLocation()
    const size = await el.getSize()
    await browser.execute('mobile: clickGesture', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    })
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  private get moreTabAndroid() {
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_button_more")')
  }

  private get moreTabIOS() {
    return $('~More')
  }

  private get administrationItemAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Administration"]]')
  }

  private get administrationItemIOS() {
    return $('-ios predicate string:name == "Administration" OR label == "Administration"')
  }

  private get manageCardsTitleAndroid() {
    return $('android=new UiSelector().text("Manage Cards")')
  }

  private get manageCardsNavBarIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Manage Cards"]')
  }

  // ── Assign Card form ──────────────────────────────────────────────────────

  private get assignCardBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Assign Card"]]')
  }

  private get assignCardBtnIOS() {
    return $('-ios predicate string:name == "Assign Card" OR label == "Assign Card"')
  }

  private get cardTypeRowAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.view.View[@content-desc="Card Type"]]')
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
    return $('//XCUIElementTypeStaticText[@name="Virtual Card" or @label="Virtual Card"]/ancestor::XCUIElementTypeCell[1]')
  }

  private get physicalCardOptionAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Physical Card"]]')
  }

  private get physicalCardOptionIOS() {
    return $('//XCUIElementTypeStaticText[@name="Physical Card" or @label="Physical Card"]/ancestor::XCUIElementTypeCell[1]')
  }

  private get assigneeRowAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.view.View[@content-desc="Assign Card To"]]')
  }

  private get assigneeRowIOS() {
    return $(
      `//XCUIElementTypeCell` +
      `[.//XCUIElementTypeStaticText[@name="Select User" or @label="Select User" or contains(@name,"${BH_SELF_NAME}") or contains(@label,"${BH_SELF_NAME}")]][1]`,
    )
  }

  private get selfUserOptionAndroid() {
    return $(`//android.view.View[@clickable="true"][.//android.widget.TextView[@text="${BH_SELF_NAME}"]]`)
  }

  private get selfUserOptionIOS() {
    return $(`//XCUIElementTypeStaticText[@name="${BH_SELF_NAME}" or @label="${BH_SELF_NAME}"]/ancestor::XCUIElementTypeCell[1]`)
  }

  private get selectUserBtnAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/assignBusinessCardUserSelection_button_select$|^assignBusinessCardUserSelection_button_select$")')
  }

  private get selectUserBtnIOS() {
    return $('-ios predicate string:name == "Select" OR label == "Select"')
  }

  private get userSelectionSheetAndroid() {
    return $('//android.view.View[@content-desc="Close sheet"]/following-sibling::android.view.View[.//android.widget.TextView[@text="Select User"]]')
  }

  private get closeUserSelectionSheetAndroid() {
    return $('//android.widget.TextView[@text="Select User"]/following-sibling::android.view.View[@clickable="true"][1]')
  }

  private get userSelectionScreenIOS() {
    return $('~assignBusinessCardUserSelection_screen')
  }

  // ── User card limit reached bottom bar ───────────────────────────────────

  private get userLimitReachedAndroid() {
    return $(`android=new UiSelector().text("${USER_CARD_LIMIT_REACHED}")`)
  }

  private get userLimitReachedIOS() {
    return $(
      '-ios predicate string:' +
        `(name == "${USER_CARD_LIMIT_REACHED}" OR ` +
        `label == "${USER_CARD_LIMIT_REACHED}" OR ` +
        `value == "${USER_CARD_LIMIT_REACHED}")`,
    )
  }

  private get userLimitReachedOkAndroid() {
    return $('android=new UiSelector().text("OK")')
  }

  private get userLimitReachedOkIOS() {
    return $('-ios predicate string:name == "OK" OR label == "OK"')
  }

  // ── Back navigation ───────────────────────────────────────────────────────

  private get backBtnAndroid() {
    return $('//android.widget.ImageButton[@content-desc="Navigate up"]')
  }

  private get backBtnIOS() {
    return $('~Back')
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
      await this.seDeKeItemIOS.waitForExist({ timeout: 10000, timeoutMsg: 'SeDeKE item not found in iOS picker' })
      await this.tap(this.seDeKeItemIOS)
      await this.subAccountsTitleIOS.waitForExist({ reverse: true, timeout: 15000 }).catch(() => {})
      await this.waitForIOSSeDeKEHome()
      return
    }

    await this.switchAndroidAccountByCode(BH_ACCOUNT_CODE, 'Business')
  }

  public async openManageCards() {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    const moreTab = browser.isIOS ? this.moreTabIOS : this.moreTabAndroid
    await moreTab.waitForExist({ timeout: 15000 })
    await this.tap(moreTab)
    await browser.pause(500)
    const adminItem = browser.isIOS ? this.administrationItemIOS : this.administrationItemAndroid
    await adminItem.waitForExist({ timeout: 15000, timeoutMsg: 'Administration item not found' })
    await this.tap(adminItem)
    if (browser.isIOS) {
      await this.manageCardsNavBarIOS.waitForExist({ timeout: 15000, timeoutMsg: 'Manage Cards screen did not load on iOS' })
    } else {
      await browser.waitUntil(
        async () => this.manageCardsTitleAndroid.isExisting().catch(() => false),
        { timeout: 15000, interval: 500, timeoutMsg: 'Manage Cards screen did not load on Android' },
      )
    }
  }

  public async tapAssignCard() {
    const btn = browser.isIOS ? this.assignCardBtnIOS : this.assignCardBtnAndroid
    await btn.waitForExist({ timeout: 15000, timeoutMsg: 'Assign Card button not found' })
    await this.tap(btn)
    const cardTypeRow = browser.isIOS ? this.cardTypeRowIOS : this.cardTypeRowAndroid
    await cardTypeRow.waitForExist({ timeout: 15000, timeoutMsg: 'Assign Card form did not open' })
  }

  public async selectVirtualCardType() {
    const cardTypeRow = browser.isIOS ? this.cardTypeRowIOS : this.cardTypeRowAndroid
    await cardTypeRow.waitForExist({ timeout: 10000 })
    await this.tap(cardTypeRow)
    const option = browser.isIOS ? this.virtualCardOptionIOS : this.virtualCardOptionAndroid
    await option.waitForExist({ timeout: 10000, timeoutMsg: 'Virtual Card option not found' })
    await this.tap(option)
    await browser.pause(600)
  }

  public async selectPhysicalCardType() {
    const cardTypeRow = browser.isIOS ? this.cardTypeRowIOS : this.cardTypeRowAndroid
    await cardTypeRow.waitForExist({ timeout: 10000 })
    await this.tap(cardTypeRow)
    const option = browser.isIOS ? this.physicalCardOptionIOS : this.physicalCardOptionAndroid
    await option.waitForExist({ timeout: 10000, timeoutMsg: 'Physical Card option not found' })
    await this.tap(option)
    await browser.pause(600)
  }

  public async selectSelfAssigneeAndExpectLimit() {
    const assigneeRow = browser.isIOS ? this.assigneeRowIOS : this.assigneeRowAndroid
    await assigneeRow.waitForExist({ timeout: 15000, timeoutMsg: 'Assign Card To row not found' })
    await this.tap(assigneeRow)

    const selfUser = browser.isIOS ? this.selfUserOptionIOS : this.selfUserOptionAndroid
    await selfUser.waitForExist({ timeout: 15000, timeoutMsg: `"${BH_SELF_NAME}" not found in user list` })

    if (browser.isAndroid) {
      await this.tapElementCenterAndroid(selfUser)
      await browser.waitUntil(
        async () =>
          (await this.userLimitReachedAndroid.isExisting().catch(() => false)) ||
          (await this.selectUserBtnAndroid.isEnabled().catch(() => false)),
        { timeout: 5000, interval: 300, timeoutMsg: `"${BH_SELF_NAME}" was not selected in user list` },
      )
      if (await this.selectUserBtnAndroid.isEnabled().catch(() => false)) {
        await this.tapElementCenterAndroid(this.selectUserBtnAndroid)
      }
    } else {
      await this.tap(selfUser)
      await browser.pause(500)
      if (await this.selectUserBtnIOS.isExisting().catch(() => false)) {
        await this.tap(this.selectUserBtnIOS)
      }
    }

    await browser.waitUntil(
      async () =>
        (await (browser.isIOS ? this.userLimitReachedIOS : this.userLimitReachedAndroid).isExisting().catch(() => false)) ||
        !(await (browser.isIOS ? this.userSelectionScreenIOS : this.userSelectionSheetAndroid).isExisting().catch(() => false)),
      { timeout: 10000, interval: 400, timeoutMsg: 'User selection sheet did not close after selecting self' },
    )

    await browser.pause(500)
  }

  public async verifyUserLimitReached() {
    const limitEl = browser.isIOS ? this.userLimitReachedIOS : this.userLimitReachedAndroid
    await limitEl.waitForExist({ timeout: 10000, timeoutMsg: `"${USER_CARD_LIMIT_REACHED}" message did not appear` })
    const text = await limitEl.getText().catch(() => '')
    if (text.trim() !== USER_CARD_LIMIT_REACHED) {
      throw new Error(`Unexpected limit message text: "${text}"`)
    }
  }

  public async dismissLimitAndReturnToAssignCardForm() {
    await this.verifyUserLimitReached()

    const okBtn = browser.isIOS ? this.userLimitReachedOkIOS : this.userLimitReachedOkAndroid
    await okBtn.waitForExist({ timeout: 10000, timeoutMsg: 'OK button not found on card limit popup' })
    if (browser.isAndroid) {
      await this.tapElementCenterAndroid(okBtn)
    } else {
      await this.tap(okBtn)
    }

    const limitEl = browser.isIOS ? this.userLimitReachedIOS : this.userLimitReachedAndroid
    await limitEl.waitForExist({
      reverse: true,
      timeout: 10000,
      timeoutMsg: `"${USER_CARD_LIMIT_REACHED}" popup did not close after tapping OK`,
    })

    const cardTypeRow = browser.isIOS ? this.cardTypeRowIOS : this.cardTypeRowAndroid
    if (browser.isAndroid && (await this.userSelectionSheetAndroid.isExisting().catch(() => false))) {
      await this.tapElementCenterAndroid(this.closeUserSelectionSheetAndroid)
      await this.userSelectionSheetAndroid.waitForExist({ reverse: true, timeout: 10000 }).catch(() => {})
    }
    for (let attempt = 0; attempt < 2; attempt += 1) {
      if (await cardTypeRow.isExisting().catch(() => false)) break
      await browser.back()
      await browser.pause(500)
    }
    await cardTypeRow.waitForExist({ timeout: 15000, timeoutMsg: 'Assign Card form did not appear after closing card limit popup' })
  }

  public async goBackToManageCards() {
    const backBtn = browser.isIOS ? this.backBtnIOS : this.backBtnAndroid
    await backBtn.waitForExist({ timeout: 5000, timeoutMsg: 'Back button not found' })
    await this.tap(backBtn)
    if (browser.isIOS) {
      await this.manageCardsNavBarIOS.waitForExist({ timeout: 10000, timeoutMsg: 'Manage Cards did not reload on iOS' })
    } else {
      await browser.waitUntil(
        async () => this.manageCardsTitleAndroid.isExisting().catch(() => false),
        { timeout: 10000, interval: 400, timeoutMsg: 'Manage Cards did not reload on Android' },
      )
    }
  }
}

export default new BusinessCardCardLimitsPage()
