import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'

const BH_ACCOUNT_CODE = process.env.CARD_LIMITS_ACCOUNT_CODE || 'ADV00003'
const BH_SELF_NAME = process.env.CARD_LIMITS_SELF_NAME || 'Brian Vindo'
const USER_CARD_LIMIT_REACHED = 'User card limit reached'
const USER_CARD_LIMIT_REACHED_RX = '(?i).*user.*limit.*reached.*'

class BusinessCardCardLimitsPage extends BasePage {
  // ── Account switcher ─────────────────────────────────────────────────────

  private get userAvatarAndroid() {
    return $('(//*[@resource-id="home_button_userAvatar"] | //*[contains(@content-desc,"avatar") or contains(@content-desc,"Avatar")])[1]')
  }

  private get subAccountsSheetAndroid() {
    return $('//*[@text="Sub Accounts" or @content-desc="Sub Accounts"]')
  }

  private get cardsTabAndroid() {
    return $('(//*[@resource-id="com.moneybase.qa:id/navigation_button_cards"] | //*[contains(@content-desc,"Cards") and not(contains(@content-desc,"card_item"))])[1]')
  }

  private get cardsScreenAndroid() {
    return $('(//*[@resource-id="cards_screen"] | //*[contains(@content-desc,"cards_screen")])[1]')
  }

  private get addNewCardAndroid() {
    return $('(//*[contains(@content-desc,"Add New Card") or contains(@content-desc,"Add Card")] | //*[contains(@text,"Add New Card") or contains(@text,"Add Card")])[1]')
  }

  private get addNewCardTextAndroid() {
    return $('(//*[contains(@content-desc,"Add New Card") or contains(@content-desc,"Add Card")] | //android.widget.TextView[@text="Add New Card" or @text="Add Card"]/ancestor::*[@clickable="true"][1])[1]')
  }

  private get seDeKeItemAndroid() {
    return $(`(//*[contains(@content-desc,"${BH_ACCOUNT_CODE}")] | //android.view.View[@clickable="true"][.//android.widget.TextView[contains(@text,"${BH_ACCOUNT_CODE}")]])[1]`)
  }

  private get seDeKeItemIOS() {
    return $(`-ios predicate string:label CONTAINS "${BH_ACCOUNT_CODE}" OR name CONTAINS "${BH_ACCOUNT_CODE}"`)
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

  private async getFirstExisting(candidates: ChainablePromiseElement[], timeout: number, timeoutMsg: string) {
    await browser.waitUntil(
      async () => {
        for (const candidate of candidates) {
          if (await candidate.isExisting().catch(() => false)) return true
        }
        return false
      },
      { timeout, interval: 500, timeoutMsg },
    )

    for (const candidate of candidates) {
      if (await candidate.isExisting().catch(() => false)) return candidate
    }
    throw new Error(timeoutMsg)
  }

  private async getCardTypeRowAndroid(timeout = 15000) {
    return this.getFirstExisting(
      [
        this.cardTypeRowAndroid,
        this.cardTypeRowAndroidByText,
        this.cardTypeRowAndroidByDesc,
        this.selectedCardTypeRowAndroid,
      ],
      timeout,
      'Card Type row not found on Android',
    )
  }

  private async waitForCardTypeRow(timeout = 15000) {
    if (browser.isAndroid) {
      await this.getCardTypeRowAndroid(timeout)
      return
    }

    await this.cardTypeRowIOS.waitForExist({ timeout, timeoutMsg: 'Card Type row not found on iOS' })
  }

  private async tapCardTypeRow() {
    if (browser.isAndroid) {
      await this.tapElementCenterAndroid(await this.getCardTypeRowAndroid(10000))
      return
    }

    await this.tap(this.cardTypeRowIOS)
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  private get moreTabAndroid() {
    return $('(//*[@content-desc="More"] | //*[contains(@resource-id,"navigation_button_more")] | //*[contains(@resource-id,"nav_graph_more")])[1]')
  }

  private get moreTabIOS() {
    return $('~More')
  }

  private get administrationItemAndroid() {
    return $('(//*[contains(@content-desc,"Administration")] | //android.view.View[@clickable="true"][.//android.widget.TextView[@text="Administration"]])[1]')
  }

  private get administrationItemAndroidByDesc() {
    return $('//android.view.View[contains(@content-desc,"Administration")]/ancestor-or-self::*[@clickable="true"][1]')
  }

  private get administrationItemAndroidByText() {
    return $('//android.widget.TextView[@text="Administration"]/ancestor::*[@clickable="true"][1]')
  }

  private get administrationItemIOS() {
    return $('-ios predicate string:name == "Administration" OR label == "Administration"')
  }

  private get manageCardsTitleAndroid() {
    return $('//*[@text="Manage Cards" or @content-desc="Manage Cards"]')
  }

  private get manageCardsNavBarIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Manage Cards"]')
  }

  // ── Assign Card form ──────────────────────────────────────────────────────

  private get assignCardBtnAndroid() {
    return $('(//*[contains(@content-desc,"Assign Card")] | //android.view.View[@clickable="true"][.//android.widget.TextView[@text="Assign Card"]])[1]')
  }

  private get assignCardBtnAndroidByDesc() {
    return $('//android.view.View[contains(@content-desc,"Assign Card")]/ancestor-or-self::*[@clickable="true"][1]')
  }

  private get assignCardBtnAndroidByText() {
    return $('//android.widget.TextView[@text="Assign Card"]/ancestor::*[@clickable="true"][1]')
  }

  private get assignCardBtnIOS() {
    return $('-ios predicate string:name == "Assign Card" OR label == "Assign Card"')
  }

  private get cardTypeRowAndroid() {
    return $('(//*[@resource-id="assignBusinessCard_button_selectCardType"] | //*[contains(@content-desc,"Card Type") or contains(@content-desc,"Physical Card") or contains(@content-desc,"Virtual Card")])[1]')
  }

  private get cardTypeRowAndroidByText() {
    return $('(//*[@content-desc="Card Type"] | //android.widget.TextView[@text="Card Type"]/ancestor::*[@clickable="true"][1])[1]')
  }

  private get cardTypeRowAndroidByDesc() {
    return $('//*[contains(@content-desc,"Card Type")]')
  }

  private get selectedCardTypeRowAndroid() {
    return $('(//*[contains(@content-desc,"Physical Card") or contains(@content-desc,"Virtual Card")] | //android.widget.TextView[@text="Physical Card" or @text="Virtual Card"]/ancestor::*[@clickable="true"][1])[1]')
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
    return $('//XCUIElementTypeStaticText[@name="Virtual Card" or @label="Virtual Card"]/ancestor::XCUIElementTypeCell[1]')
  }

  private get physicalCardOptionAndroid() {
    return $('(//*[@content-desc="Physical Card"] | //*[contains(@content-desc,"Physical Card")] | //android.view.View[@clickable="true"][.//android.widget.TextView[@text="Physical Card"]])[1]')
  }

  private get physicalCardOptionIOS() {
    return $('//XCUIElementTypeStaticText[@name="Physical Card" or @label="Physical Card"]/ancestor::XCUIElementTypeCell[1]')
  }

  private get assigneeRowAndroid() {
    return $('(//*[contains(@content-desc,"Assign Card To")] | //android.view.View[@clickable="true"][.//android.view.View[@content-desc="Assign Card To"]])[1]')
  }

  private get assigneeRowAndroidById() {
    return $('(//*[@resource-id="assignBusinessCard_button_selectUser"] | //*[contains(@content-desc,"Select User") or contains(@content-desc,"Card Assignee")])[1]')
  }

  private get assigneeRowAndroidByDesc() {
    return $('//*[contains(@content-desc,"Assign Card To")]/ancestor-or-self::*[@clickable="true"][1]')
  }

  private get assigneeRowAndroidByText() {
    return $('//android.widget.TextView[@text="Assign Card To" or @text="Select User"]/ancestor::*[@clickable="true"][1]')
  }

  private get assigneeRowIOS() {
    return $(
      `//XCUIElementTypeCell` +
      `[.//XCUIElementTypeStaticText[@name="Select User" or @label="Select User" or contains(@name,"${BH_SELF_NAME}") or contains(@label,"${BH_SELF_NAME}")]][1]`,
    )
  }

  private get selfUserOptionAndroid() {
    return $(`(//*[@content-desc="${BH_SELF_NAME}"] | //android.view.View[@clickable="true"][.//android.widget.TextView[@text="${BH_SELF_NAME}"]])[1]`)
  }

  private get selfUserOptionIOS() {
    return $(`//XCUIElementTypeStaticText[@name="${BH_SELF_NAME}" or @label="${BH_SELF_NAME}"]/ancestor::XCUIElementTypeCell[1]`)
  }

  private get selectUserBtnAndroid() {
    return $('(//*[@resource-id="assignBusinessCardUserSelection_button_select"] | //*[contains(@content-desc,"Select") and not(contains(@content-desc,"Select User"))])[1]')
  }

  private get selectUserBtnIOS() {
    return $('-ios predicate string:name == "Select" OR label == "Select"')
  }

  private get userSelectionSheetAndroid() {
    return $('//*[@content-desc="Close sheet"]/following-sibling::*[.//*[@text="Select User" or @content-desc="Select User"]]')
  }

  private get userSelectionSheetTitleAndroid() {
    return $('//*[@text="Select User" or @content-desc="Select User"]')
  }

  private get closeUserSelectionSheetAndroid() {
    return $('(//*[@content-desc="Close sheet"] | //android.widget.TextView[@text="Select User"]/following-sibling::android.view.View[@clickable="true"][1])[1]')
  }

  private get userSelectionScreenIOS() {
    return $('~assignBusinessCardUserSelection_screen')
  }

  // ── User card limit reached bottom bar ───────────────────────────────────

  private get userLimitReachedAndroid() {
    return $(`(//*[contains(@content-desc,"User card limit reached") or contains(@content-desc,"user limit reached") or contains(@content-desc,"limit reached")] | //*[contains(@text,"User card limit reached")])[1]`)
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
    return $('//*[@text="OK" or @content-desc="OK"]')
  }

  private get userLimitReachedOkIOS() {
    return $('-ios predicate string:name == "OK" OR label == "OK"')
  }

  // ── Back navigation ───────────────────────────────────────────────────────

  private get backBtnAndroid() {
    return $('//*[@content-desc="Navigate up" or @content-desc="Back" or contains(@resource-id,"button_back")]')
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
    if (browser.isIOS) {
      await this.tap(this.moreTabIOS)
    } else {
      await this.openAndroidMoreMenuFromProfile()
    }
    await browser.pause(500)
    const adminItem = browser.isIOS
      ? this.administrationItemIOS
      : await this.getFirstExisting(
        [this.administrationItemAndroid, this.administrationItemAndroidByDesc, this.administrationItemAndroidByText],
        15000,
        'Administration item not found',
      )
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
    const btn = browser.isIOS
      ? this.assignCardBtnIOS
      : await this.getFirstExisting(
        [this.assignCardBtnAndroid, this.assignCardBtnAndroidByDesc, this.assignCardBtnAndroidByText],
        15000,
        'Assign Card button not found',
      )
    await this.tap(btn)
    await this.waitForCardTypeRow(15000)
  }

  public async selectVirtualCardType() {
    await this.tapCardTypeRow()
    const option = browser.isIOS ? this.virtualCardOptionIOS : this.virtualCardOptionAndroid
    await option.waitForExist({ timeout: 10000, timeoutMsg: 'Virtual Card option not found' })
    await this.tap(option)
    await browser.pause(600)
  }

  public async selectPhysicalCardType() {
    await this.tapCardTypeRow()
    const option = browser.isIOS ? this.physicalCardOptionIOS : this.physicalCardOptionAndroid
    await option.waitForExist({ timeout: 10000, timeoutMsg: 'Physical Card option not found' })
    await this.tap(option)
    await browser.pause(600)
  }

  public async selectSelfAssigneeAndExpectLimit() {
    const assigneeRow = browser.isIOS
      ? this.assigneeRowIOS
      : await this.getFirstExisting(
        [this.assigneeRowAndroidById, this.assigneeRowAndroid, this.assigneeRowAndroidByDesc, this.assigneeRowAndroidByText],
        15000,
        'Assign Card To row not found',
      )
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
        !(await (browser.isIOS ? this.userSelectionScreenIOS : this.userSelectionSheetTitleAndroid).isExisting().catch(() => false)),
      { timeout: 10000, interval: 400, timeoutMsg: 'User selection sheet did not close after selecting self' },
    )

    await browser.pause(500)
  }

  public async verifyUserLimitReached() {
    const limitEl = browser.isIOS ? this.userLimitReachedIOS : this.userLimitReachedAndroid
    await limitEl.waitForExist({ timeout: 10000, timeoutMsg: `"${USER_CARD_LIMIT_REACHED}" message did not appear` })
    const text = await limitEl.getText().catch(async () => limitEl.getAttribute('content-desc').catch(() => ''))
    if (!/user.*limit.*reached/i.test(text.trim())) {
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

    if (browser.isAndroid && (await this.userSelectionSheetAndroid.isExisting().catch(() => false))) {
      await this.tapElementCenterAndroid(this.closeUserSelectionSheetAndroid)
      await this.userSelectionSheetAndroid.waitForExist({ reverse: true, timeout: 10000 }).catch(() => {})
    }
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const formShown = browser.isAndroid
        ? await this.getCardTypeRowAndroid(1500).then(() => true).catch(() => false)
        : await this.cardTypeRowIOS.isExisting().catch(() => false)
      if (formShown) break
      await browser.back()
      await browser.pause(500)
    }
    await this.waitForCardTypeRow(15000)
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
