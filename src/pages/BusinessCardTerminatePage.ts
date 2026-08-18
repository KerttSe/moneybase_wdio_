import BasePage from './BasePage'
import { $, $$, browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'

const BH_ACCOUNT_CODE = process.env.BH_ACCOUNT_CODE || 'SED00004'
const BH_SELF_NAME = process.env.BH_SELF_NAME || 'Dmytro Kertys'
const BUSINESS_CARD_ACTIVE_TIMEOUT_MS = Number(process.env.BUSINESS_CARD_ACTIVE_TIMEOUT_MS || 180000)

class BusinessCardTerminatePage extends BasePage {
  private ownVirtualActiveCountBeforeCreateAndroid = 0
  private ownVirtualActiveCountBeforeCreateIOS = 0

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
    return $('android=new UiSelector().resourceId("com.moneybase.qa:id/navigation_button_more")')
  }

  // ── Administration item ──────────────────────────────────────────────────

  private get administrationItemIOS() {
    return $('-ios predicate string:name == "Administration" OR label == "Administration"')
  }

  private get administrationItemAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Administration"]]')
  }

  // ── Manage Cards screen ──────────────────────────────────────────────────

  private get manageCardsNavBarIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Manage Cards"]')
  }

  private get manageCardsTitleAndroid() {
    return $('android=new UiSelector().text("Manage Cards")')
  }

  // ── Manage Cards: Assign Card button ─────────────────────────────────────

  private get assignCardBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Assign Card"]]')
  }

  private get assignCardBtnIOS() {
    return $('-ios predicate string:name == "Assign Card" OR label == "Assign Card"')
  }

  // ── Assign Card form: Card Type row ──────────────────────────────────────

  private get cardTypeRowAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.view.View[@content-desc="Card Type"]]')
  }

  private get cardTypeRowIOS() {
    return $(
      '//XCUIElementTypeCell' +
      '[.//XCUIElementTypeStaticText[@name="Physical Card" or @label="Physical Card" or @name="Virtual Card" or @label="Virtual Card"]][1]',
    )
  }

  // ── Select Card Type sheet: Virtual Card option ───────────────────────────

  private get virtualCardOptionAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Virtual Card"]]')
  }

  private get virtualCardOptionIOS() {
    return $('//XCUIElementTypeStaticText[@name="Virtual Card" or @label="Virtual Card" or @value="Virtual Card"]/ancestor::XCUIElementTypeCell[1]')
  }

  // ── Assign Card form: Assign Card To row ──────────────────────────────────

  private get assigneeRowAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.view.View[@content-desc="Assign Card To"]]')
  }

  private get assigneeRowIOS() {
    return $(
      `//XCUIElementTypeCell` +
      `[.//XCUIElementTypeStaticText[@name="Select User" or @label="Select User" or contains(@name,"${BH_SELF_NAME}") or contains(@label,"${BH_SELF_NAME}")]][1]`,
    )
  }

  // ── Select User sheet ────────────────────────────────────────────────────

  private get selfUserOptionAndroid() {
    return $(`android=new UiSelector().description("${BH_SELF_NAME}")`)
  }

  private get selfUserOptionIOS() {
    return $(`//XCUIElementTypeStaticText[@name="${BH_SELF_NAME}" or @label="${BH_SELF_NAME}"]/ancestor::XCUIElementTypeCell[1]`)
  }

  // Enabled only after a user is tapped
  private get selectUserBtnAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/assignBusinessCardUserSelection_button_select$|^assignBusinessCardUserSelection_button_select$")')
  }

  private get selectUserBtnIOS() {
    return $('-ios predicate string:name == "Select" OR label == "Select"')
  }

  // ── Assign Card form: Continue button ─────────────────────────────────────

  private get continueBtnAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/assignBusinessCard_button_continue$|^assignBusinessCard_button_continue$")')
  }

  private get continueBtnIOS() {
    return $('-ios predicate string:name == "Continue" OR label == "Continue"')
  }

  private get selectWalletTitleAndroid() {
    return $('android=new UiSelector().text("Select Wallet")')
  }

  private get walletSelectionFirstWalletAndroid() {
    return $('//android.view.View[@resource-id="businessWalletSelection_screen"]//android.view.View[@scrollable="true"]/android.view.View[1]//android.view.View[@clickable="true"][1]')
  }

  private get assignCardSubmitBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Assign Card"]]')
  }

  private get selectCardTitleIOS() {
    return $('-ios predicate string:name == "Select a Card" OR label == "Select a Card"')
  }

  private get getVirtualCardBtnIOS() {
    return $('~addCardDesign_button_order')
  }

  // ── Card assigned successfully ────────────────────────────────────────────

  private get cardAssignedSuccessAndroid() {
    return $('android=new UiSelector().text("Card assigned successfully")')
  }

  private get cardAssignedSuccessIOS() {
    return $('-ios predicate string:name CONTAINS[c] "assigned successfully" OR label CONTAINS[c] "assigned successfully"')
  }

  private get closeSheetBackdropAndroid() {
    return $('//android.view.View[@content-desc="Close sheet"]')
  }

  private get userSelectionSheetAndroid() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/assignBusinessCardUserSelection_screen$|^assignBusinessCardUserSelection_screen$")')
  }

  private get userSelectionScreenIOS() {
    return $('~assignBusinessCardUserSelection_screen')
  }

  // ── Manage Cards tabs ────────────────────────────────────────────────────

  private get inactiveTabAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Inactive"]]')
  }

  private get inactiveTabIOS() {
    return $('-ios predicate string:name == "Inactive" OR label == "Inactive"')
  }

  // ── Own ACTIVE virtual card in the list ──────────────────────────────────
  // "ACTIVE" badge filter ensures we don't accidentally open a frozen virtual card

  private get ownVirtualCardAndroid() {
    return $(
      `//android.view.View[@clickable="true"]` +
      `[.//android.widget.TextView[contains(@text,"${BH_SELF_NAME}")]]` +
      `[.//android.widget.TextView[contains(@text,"Virtual")]]` +
      `[.//android.widget.TextView[@text="ACTIVE"]]`,
    )
  }

  private get ownVirtualCardsActiveAndroid() {
    return $$(
      `//android.view.View[@clickable="true"]` +
      `[.//android.widget.TextView[contains(@text,"${BH_SELF_NAME}")]]` +
      `[.//android.widget.TextView[contains(@text,"Virtual")]]` +
      `[.//android.widget.TextView[@text="ACTIVE"]]`,
    )
  }

  private get ownVirtualCardPendingAndroid() {
    return $(
      `//android.view.View` +
      `[.//android.widget.TextView[contains(@text,"${BH_SELF_NAME}")]]` +
      `[.//android.widget.TextView[contains(@text,"Virtual")]]` +
      `[.//android.widget.TextView[@text="PENDING"]]`,
    )
  }

  private get ownVirtualCardIOS() {
    return $(
      `//XCUIElementTypeCell` +
      `[.//*[contains(@name,"${BH_SELF_NAME}") or contains(@label,"${BH_SELF_NAME}")]]` +
      `[.//*[contains(@name,"Virtual") or contains(@label,"Virtual")]]` +
      `[.//*[@name="ACTIVE" or @label="ACTIVE"]][1]`,
    )
  }

  private get ownVirtualCardsActiveIOS() {
    return $$(
      `//XCUIElementTypeCell` +
      `[.//*[contains(@name,"${BH_SELF_NAME}") or contains(@label,"${BH_SELF_NAME}")]]` +
      `[.//*[contains(@name,"Virtual") or contains(@label,"Virtual")]]` +
      `[.//*[@name="ACTIVE" or @label="ACTIVE"]]`,
    )
  }

  private get ownVirtualCardPendingIOS() {
    return $(
      `//XCUIElementTypeCell` +
      `[.//*[contains(@name,"${BH_SELF_NAME}") or contains(@label,"${BH_SELF_NAME}")]]` +
      `[.//*[contains(@name,"Virtual") or contains(@label,"Virtual")]]` +
      `[.//*[@name="PENDING" or @label="PENDING"]][1]`,
    )
  }

  private get offlineBannerIOS() {
    return $('-ios predicate string:name CONTAINS[c] "currently offline" OR label CONTAINS[c] "currently offline"')
  }

  // ── Card Details screen title ─────────────────────────────────────────────

  private get cardDetailsTitleAndroid() {
    return $('android=new UiSelector().text("Card Details")')
  }

  private get cardDetailsTitleIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Card Details"]')
  }

  // ── Freeze / Unfreeze buttons on Card Details ─────────────────────────────

  private get freezeBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.view.View[@content-desc="Freeze"]]')
  }

  private get unfreezeBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.view.View[@content-desc="Unfreeze"]]')
  }

  private get freezeBtnIOS() {
    return $('//XCUIElementTypeOther[@name="businessCard_button_freeze"]')
  }

  private get unfreezeBtnIOS() {
    return $('//XCUIElementTypeOther[@name="businessCard_button_unfreeze"]')
  }

  // ── Terminate action on Card Details ─────────────────────────────────────
  // May appear in the action row (content-desc pattern like Freeze)
  // or as a row below Recent Activity — both are tried before scrolling

  private get terminateBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.view.View[@content-desc="Terminate"]]')
  }

  private get terminateRowAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Terminate"]]')
  }

  private get terminateBtnIOS() {
    return $('//XCUIElementTypeOther[@name="businessCard_button_terminate"]')
  }

  private get terminateLabelIOS() {
    return $('//XCUIElementTypeStaticText[(@name="Terminate" or @label="Terminate" or @value="Terminate") and not(ancestor::XCUIElementTypeNavigationBar)]')
  }

  // ── Terminate Card confirmation bottom sheet ──────────────────────────────
  // Button text is "Terminate Card" (not just "Terminate")

  private get terminateCardConfirmAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Terminate Card"]]')
  }

  private get terminateCardConfirmIOS() {
    return $('//XCUIElementTypeOther[@name="terminateBusinessCardConfirmation_button_terminate"]')
  }

  // ── Card terminated success sheet ────────────────────────────────────────

  private get cardTerminatedSuccessAndroid() {
    return $('android=new UiSelector().text("Card terminated")')
  }

  private get cardTerminatedSuccessIOS() {
    return $('-ios predicate string:name CONTAINS[c] "Card terminated" OR label CONTAINS[c] "Card terminated"')
  }

  // ── Back button ───────────────────────────────────────────────────────────

  private get backBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.view.View[@content-desc="Back"]]')
  }

  private get backBtnIOS() {
    return $('//XCUIElementTypeButton[@name="BackButton" or @name="Back" or @label="Back" or @label="Manage Cards" or @label="More"]')
  }

  // ── Own virtual card in Inactive tab ──────────────────────────────────────

  private get ownVirtualCardInactiveAndroid() {
    return $(
      `//android.view.View` +
      `[.//android.widget.TextView[contains(@text,"${BH_SELF_NAME}")]]` +
      `[.//android.widget.TextView[contains(@text,"Virtual")]]` +
      `[.//android.widget.TextView[@text="TERMINATED"]]`,
    )
  }

  private get ownVirtualCardInactiveIOS() {
    return $(
      `//XCUIElementTypeCell` +
      `[.//*[contains(@name,"${BH_SELF_NAME}") or contains(@label,"${BH_SELF_NAME}")]]` +
      `[.//*[contains(@name,"Virtual") or contains(@label,"Virtual")]]` +
      `[.//*[@name="TERMINATED" or @label="TERMINATED"]][1]`,
    )
  }

  // ── Public methods ────────────────────────────────────────────────────────

  private async tapElementCenterAndroid(el: ChainablePromiseElement) {
    await el.waitForExist({ timeout: 5000 })
    const location = await el.getLocation()
    const size = await el.getSize()
    await browser.execute('mobile: clickGesture', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    })
  }

  private async tapElementCenterIOS(el: ChainablePromiseElement) {
    await el.waitForExist({ timeout: 5000 })
    const location = await el.getLocation()
    const size = await el.getSize()
    await browser.execute('mobile: tap', {
      x: Math.round(location.x + size.width / 2),
      y: Math.round(location.y + size.height / 2),
    })
  }

  private async returnToManageCardsAndroid() {
    for (let attempt = 0; attempt < 4; attempt++) {
      if (await this.manageCardsTitleAndroid.isExisting().catch(() => false)) return
      await browser.back().catch(() => {})
      await browser.pause(800)
    }

    await browser.waitUntil(
      async () => this.manageCardsTitleAndroid.isExisting().catch(() => false),
      { timeout: 15000, interval: 500, timeoutMsg: 'Did not return to Manage Cards after termination (Android)' },
    )
  }

  private async returnToManageCardsIOS() {
    for (let attempt = 0; attempt < 4; attempt++) {
      if (await this.manageCardsNavBarIOS.isExisting().catch(() => false)) return
      if (await this.backBtnIOS.isExisting().catch(() => false)) {
        await this.tap(this.backBtnIOS).catch(() => {})
      } else {
        await browser.back().catch(() => {})
      }
      await browser.pause(800)
    }

    await this.manageCardsNavBarIOS.waitForExist({
      timeout: 15000,
      timeoutMsg: 'Did not return to Manage Cards after termination (iOS)',
    })
  }

  private async dismissWalletPickerAndroid() {
    if (!(await this.selectWalletTitleAndroid.isExisting().catch(() => false))) return false

    await browser.back().catch(() => {})
    await browser.waitUntil(
      async () =>
        !(await this.selectWalletTitleAndroid.isExisting().catch(() => false)) &&
        (await this.continueBtnAndroid.isExisting().catch(() => false)),
      {
        timeout: 10000,
        interval: 500,
        timeoutMsg: 'Assign Card form did not return after closing Select Wallet picker',
      },
    )
    return true
  }

  private async selectDefaultWalletIfPickerOpenAndroid() {
    if (!(await this.selectWalletTitleAndroid.isExisting().catch(() => false))) return false

    await this.walletSelectionFirstWalletAndroid.waitForExist({
      timeout: 10000,
      timeoutMsg: 'Wallet picker opened but no wallet row was available',
    })
    await this.tapElementCenterAndroid(this.walletSelectionFirstWalletAndroid)
    await browser.waitUntil(
      async () =>
        !(await this.selectWalletTitleAndroid.isExisting().catch(() => false)) &&
        (
          (await this.continueBtnAndroid.isExisting().catch(() => false)) ||
          (await this.assignCardSubmitBtnAndroid.isExisting().catch(() => false)) ||
          (await this.cardAssignedSuccessAndroid.isExisting().catch(() => false))
        ),
      {
        timeout: 15000,
        interval: 500,
        timeoutMsg: 'Assign Card flow did not continue after selecting default wallet',
      },
    )
    return true
  }

  private async waitForAssignCardOutcomeAndroid(timeout = 30000) {
    await browser.waitUntil(
      async () =>
        (await this.cardAssignedSuccessAndroid.isExisting().catch(() => false)) ||
        (await this.selectWalletTitleAndroid.isExisting().catch(() => false)) ||
        (await this.assignCardSubmitBtnAndroid.isExisting().catch(() => false)),
      {
        timeout,
        interval: 500,
        timeoutMsg: 'Assign Card did not submit and no next assignment step appeared',
      },
    )
  }

  private async refreshManageCardsListAndroid() {
    await browser.execute('mobile: swipeGesture', {
      left: 100,
      top: 420,
      width: 880,
      height: 900,
      direction: 'down',
      percent: 0.75,
    }).catch(async () => {
      await browser.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: 540, y: 720 },
            { type: 'pointerDown', button: 0 },
            { type: 'pointerMove', duration: 500, x: 540, y: 1300 },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])
      await browser.releaseActions().catch(() => {})
    })
    await browser.pause(1000)
  }

  private async refreshManageCardsListIOS() {
    const { width, height } = await browser.getWindowRect()
    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger-ios-manage-cards-refresh',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: Math.round(width * 0.5), y: Math.round(height * 0.35) },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 500, x: Math.round(width * 0.5), y: Math.round(height * 0.62) },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]).catch(async () => {
      await browser.execute('mobile: scroll', { direction: 'down' }).catch(() => {})
    })
    await browser.releaseActions().catch(() => {})
    await browser.pause(1000)
  }

  private async reloadManageCardsScreenAndroid() {
    await browser.back().catch(() => {})
    await browser.pause(1000)

    if (await this.manageCardsTitleAndroid.isExisting().catch(() => false)) return

    if (!(await this.administrationItemAndroid.isExisting().catch(() => false))) {
      await this.tap(this.moreTabAndroid)
      await browser.pause(500)
    }

    await this.administrationItemAndroid.waitForExist({
      timeout: 15000,
      timeoutMsg: 'Administration item not found while reopening Manage Cards from More tab',
    })
    await this.tap(this.administrationItemAndroid)
    await this.openManageCards()
  }

  private async reloadManageCardsScreenIOS() {
    if (await this.backBtnIOS.isExisting().catch(() => false)) {
      await this.tap(this.backBtnIOS).catch(() => {})
    } else {
      await browser.back().catch(() => {})
    }
    await browser.pause(1000)

    if (await this.manageCardsNavBarIOS.isExisting().catch(() => false)) return

    if (!(await this.administrationItemIOS.isExisting().catch(() => false))) {
      await this.moreTabIOS.waitForExist({ timeout: 15000 })
      await this.tap(this.moreTabIOS)
      await browser.pause(500)
    }

    await this.administrationItemIOS.waitForExist({
      timeout: 15000,
      timeoutMsg: 'Administration item not found while reopening Manage Cards from More tab (iOS)',
    })
    await this.tap(this.administrationItemIOS)
    await this.openManageCards()
  }

  private async getOwnVirtualActiveCountAndroid() {
    return (await this.ownVirtualCardsActiveAndroid).length
  }

  private async getOwnVirtualActiveCountIOS() {
    return (await this.ownVirtualCardsActiveIOS).length
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
    const moreTab = browser.isIOS ? this.moreTabIOS : this.moreTabAndroid
    await moreTab.waitForExist({ timeout: 15000 })
    await this.tap(moreTab)
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
    if (browser.isAndroid) {
      this.ownVirtualActiveCountBeforeCreateAndroid = await this.getOwnVirtualActiveCountAndroid()
    } else {
      this.ownVirtualActiveCountBeforeCreateIOS = await this.getOwnVirtualActiveCountIOS()
    }
    await this.tap(btn)
    const cardTypeRow = browser.isIOS ? this.cardTypeRowIOS : this.cardTypeRowAndroid
    await cardTypeRow.waitForExist({
      timeout: 15000,
      timeoutMsg: 'Assign Card form did not open (Card Type row not found)',
    })
  }

  public async selectVirtualCardType() {
    const cardTypeRow = browser.isIOS ? this.cardTypeRowIOS : this.cardTypeRowAndroid
    await cardTypeRow.waitForExist({ timeout: 10000 })
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
        async () => {
          const sheetOpen = await this.userSelectionScreenIOS.isExisting().catch(() => false)
          const selectedAssignee = await this.assigneeRowIOS.isExisting().catch(() => false)
          const continueVisible = await this.continueBtnIOS.isExisting().catch(() => false)
          return !sheetOpen || selectedAssignee || continueVisible
        },
        {
          timeout: 10000,
          interval: 500,
          timeoutMsg: 'Select User sheet did not close after choosing assignee on iOS',
        },
      )
    } else {
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
        async () => !(await this.userSelectionSheetAndroid.isExisting().catch(() => false)),
        { timeout: 10000, interval: 500, timeoutMsg: 'Select User sheet did not close after choosing assignee' },
      )
    }
    await browser.pause(1000)
  }

  public async tapContinue() {
    const continueBtn = browser.isIOS ? this.continueBtnIOS : this.continueBtnAndroid
    await continueBtn.waitForExist({
      timeout: 15000,
      timeoutMsg: 'Continue button not found on Assign Card form',
    })

    if (browser.isIOS) {
      await this.tapElementCenterIOS(continueBtn)

      await browser.waitUntil(
        async () =>
          (await this.cardAssignedSuccessIOS.isExisting().catch(() => false)) ||
          (await this.selectCardTitleIOS.isExisting().catch(() => false)) ||
          (await this.getVirtualCardBtnIOS.isExisting().catch(() => false)),
        {
          timeout: 30000,
          interval: 500,
          timeoutMsg: 'iOS Assign Card did not submit and Select a Card did not open',
        },
      )

      if (await this.getVirtualCardBtnIOS.isExisting().catch(() => false)) {
        await this.tapElementCenterIOS(this.getVirtualCardBtnIOS)
      }

      await this.cardAssignedSuccessIOS.waitForExist({
        timeout: 30000,
        timeoutMsg: '"Card assigned successfully" not shown after completing iOS card design step',
      })
      return
    }

    await this.tapElementCenterAndroid(this.continueBtnAndroid)
    await this.waitForAssignCardOutcomeAndroid()

    if (await this.selectDefaultWalletIfPickerOpenAndroid()) {
      await this.tapElementCenterAndroid(this.continueBtnAndroid)
      await this.waitForAssignCardOutcomeAndroid()
    }

    if (await this.selectWalletTitleAndroid.isExisting().catch(() => false)) {
      throw new Error('Select Wallet picker remained open after selecting default wallet')
    }

    if (await this.assignCardSubmitBtnAndroid.isExisting().catch(() => false)) {
      await this.tapElementCenterAndroid(this.assignCardSubmitBtnAndroid)
      await this.cardAssignedSuccessAndroid.waitForExist({
        timeout: 30000,
        timeoutMsg: '"Card assigned successfully" not shown after tapping Assign Card',
      })
    }

    await this.cardAssignedSuccessAndroid.waitForExist({
      timeout: 30000,
      timeoutMsg: '"Card assigned successfully" not shown after Assign Card flow completed',
    })
  }

  public async verifyCardAssignedSuccess() {
    const successEl = browser.isIOS ? this.cardAssignedSuccessIOS : this.cardAssignedSuccessAndroid
    await successEl.waitForExist({
      timeout: 30000,
      timeoutMsg: '"Card assigned successfully" not shown after virtual card creation',
    })
  }

  public async closeSuccessAndReturnToManageCards() {
    if (browser.isIOS) {
      const { width, height } = await browser.getWindowRect()
      await browser.execute('mobile: tap', {
        x: Math.round(width / 2),
        y: Math.round(height * 0.34),
      })
    } else {
      const backdrop = this.closeSheetBackdropAndroid
      if (await backdrop.isExisting().catch(() => false)) {
        await this.tap(backdrop)
      } else {
        await browser.execute('mobile: clickGesture', { x: 540, y: 300 })
      }
    }
    await browser.pause(1500)
    await this.openManageCards()
  }

  public async openOwnVirtualCard() {
    // Virtual card starts as PENDING after creation — backend activation can be slow on BS.
    const card = browser.isIOS ? this.ownVirtualCardIOS : this.ownVirtualCardAndroid

    if (browser.isAndroid) {
      await this.openManageCards()
      let refreshAttempts = 0
      await browser.waitUntil(
        async () => {
          const activeCount = await this.getOwnVirtualActiveCountAndroid()
          if (activeCount > this.ownVirtualActiveCountBeforeCreateAndroid) return true

          // PENDING is an expected intermediate backend state; keep polling until ACTIVE.
          await this.ownVirtualCardPendingAndroid.isExisting().catch(() => false)
          refreshAttempts += 1
          if (refreshAttempts % 3 === 0) {
            await this.reloadManageCardsScreenAndroid()
          } else {
            await this.refreshManageCardsListAndroid()
          }
          return false
        },
        {
          timeout: BUSINESS_CARD_ACTIVE_TIMEOUT_MS,
          interval: 5000,
          timeoutMsg: `Active virtual card of "${BH_SELF_NAME}" not found after ${BUSINESS_CARD_ACTIVE_TIMEOUT_MS}ms (still PENDING?)`,
        },
      )
      const activeCards = await this.ownVirtualCardsActiveAndroid
      await this.tap(activeCards[0])
    } else {
      await this.openManageCards()
      let refreshAttempts = 0
      const activated = await browser.waitUntil(
        async () => {
          const activeCount = await this.getOwnVirtualActiveCountIOS()
          if (activeCount > this.ownVirtualActiveCountBeforeCreateIOS) return true

          // PENDING is an expected intermediate state after iOS virtual card creation.
          await this.ownVirtualCardPendingIOS.isExisting().catch(() => false)
          refreshAttempts += 1
          if (refreshAttempts % 3 === 0) {
            await this.reloadManageCardsScreenIOS()
          } else {
            await this.refreshManageCardsListIOS()
          }
          return false
        },
        {
          timeout: BUSINESS_CARD_ACTIVE_TIMEOUT_MS,
          interval: 5000,
          timeoutMsg: `Active virtual card of "${BH_SELF_NAME}" not found after ${BUSINESS_CARD_ACTIVE_TIMEOUT_MS}ms (still PENDING?)`,
        },
      ).catch(() => false)

      if (!activated) {
        const offline = await this.offlineBannerIOS.isExisting().catch(() => false)
        if (offline) {
          throw new Error(`Active virtual card of "${BH_SELF_NAME}" did not appear because iOS app is offline; card is still PENDING`)
        }
        throw new Error(`Active virtual card of "${BH_SELF_NAME}" not found after ${BUSINESS_CARD_ACTIVE_TIMEOUT_MS}ms (still PENDING?)`)
      }
      const activeCards = await this.ownVirtualCardsActiveIOS
      await this.tap(activeCards[0])
    }

    // Wait for Card Details screen to load (title confirmed from page source)
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

  public async freezeCardBeforeTerminate() {
    // Card must be frozen before termination is available
    if (browser.isIOS) {
      await this.freezeBtnIOS.waitForExist({
        timeout: 20000,
        timeoutMsg: 'Freeze button not visible on own virtual card (iOS) — card may still be pending',
      })
      await this.tap(this.freezeBtnIOS)
      await this.unfreezeBtnIOS.waitForExist({
        timeout: 20000,
        timeoutMsg: 'Card did not freeze — Unfreeze button not visible after tapping Freeze (iOS)',
      })
    } else {
      await this.freezeBtnAndroid.waitForExist({
        timeout: 20000,
        timeoutMsg: 'Freeze button not visible on own virtual card (Android) — card may still be pending',
      })
      await this.tap(this.freezeBtnAndroid)
      await this.unfreezeBtnAndroid.waitForExist({
        timeout: 20000,
        timeoutMsg: 'Card did not freeze — Unfreeze button not visible after tapping Freeze (Android)',
      })
    }
  }

  public async terminateCard() {
    if (browser.isIOS) {
      // Try the accessibility-id button first, then fall back to static text label
      let found = await this.terminateBtnIOS.isExisting().catch(() => false)
      if (!found) {
        found = await this.terminateLabelIOS.isExisting().catch(() => false)
      }
      if (!found) {
        // Scroll down — Terminate may be below Recent Activity
        await browser.execute('mobile: scroll', { direction: 'down' })
        await browser.pause(500)
      }
      const el = (await this.terminateBtnIOS.isExisting().catch(() => false))
        ? this.terminateBtnIOS
        : this.terminateLabelIOS
      await el.waitForExist({ timeout: 15000, timeoutMsg: 'Terminate action not found on Card Details (iOS)' })
      await this.tap(el)

      // "Terminate Card" confirmation bottom sheet
      await this.terminateCardConfirmIOS.waitForExist({
        timeout: 10000,
        timeoutMsg: '"Terminate Card" confirm button not found (iOS)',
      })
      await this.tap(this.terminateCardConfirmIOS)

      // Wait for "Card terminated" success sheet then close it
      await this.cardTerminatedSuccessIOS.waitForExist({
        timeout: 20000,
        timeoutMsg: '"Card terminated" success not shown (iOS)',
      })
      const { width, height } = await browser.getWindowRect()
      await browser.execute('mobile: tap', {
        x: Math.round(width / 2),
        y: Math.round(height * 0.34),
      })
    } else {
      // Try the content-desc action-row pattern first, then the text-row pattern
      let found =
        (await this.terminateBtnAndroid.isExisting().catch(() => false)) ||
        (await this.terminateRowAndroid.isExisting().catch(() => false))
      if (!found) {
        // Scroll down — Terminate may be below Recent Activity
        await browser.execute('mobile: scrollGesture', {
          left: 540, top: 1200, width: 200, height: 600, direction: 'down', percent: 0.8,
        })
        await browser.pause(500)
      }

      await browser.waitUntil(
        async () =>
          (await this.terminateBtnAndroid.isExisting().catch(() => false)) ||
          (await this.terminateRowAndroid.isExisting().catch(() => false)),
        { timeout: 10000, interval: 500, timeoutMsg: 'Terminate action not found on Card Details (Android)' },
      )

      const btn = (await this.terminateBtnAndroid.isExisting().catch(() => false))
        ? this.terminateBtnAndroid
        : this.terminateRowAndroid
      await this.tap(btn)

      // "Terminate Card" confirmation bottom sheet
      await this.terminateCardConfirmAndroid.waitForExist({
        timeout: 10000,
        timeoutMsg: '"Terminate Card" confirm button not found (Android)',
      })
      await this.tap(this.terminateCardConfirmAndroid)

      // Wait for "Card terminated" success sheet then close it via backdrop
      await this.cardTerminatedSuccessAndroid.waitForExist({
        timeout: 20000,
        timeoutMsg: '"Card terminated" success not shown (Android)',
      })
      const backdrop = this.closeSheetBackdropAndroid
      if (await backdrop.isExisting().catch(() => false)) {
        await this.tap(backdrop)
      } else {
        await browser.execute('mobile: clickGesture', { x: 540, y: 300 })
      }
    }

    await browser.pause(1500)
  }

  public async verifyCardInInactiveTab() {
    // After terminateCard() closes the success sheet we should be back on Manage Cards.
    // If not (e.g. navigated to Card Details), press Back first.
    if (browser.isIOS) {
      const onManageCards = await this.manageCardsNavBarIOS.isExisting().catch(() => false)
      if (!onManageCards) {
        await this.returnToManageCardsIOS()
      }
      if (await this.inactiveTabIOS.isExisting().catch(() => false)) {
        await this.tap(this.inactiveTabIOS)
      }
    } else {
      const onManageCards = await this.manageCardsTitleAndroid.isExisting().catch(() => false)
      if (!onManageCards) {
        await this.returnToManageCardsAndroid()
      }
      await this.inactiveTabAndroid.waitForExist({ timeout: 10000 })
      await this.tap(this.inactiveTabAndroid)
    }

    await browser.pause(1000)

    const card = browser.isIOS ? this.ownVirtualCardInactiveIOS : this.ownVirtualCardInactiveAndroid
    await card.waitForExist({
      timeout: 15000,
      timeoutMsg: `Terminated virtual card of "${BH_SELF_NAME}" not found in Inactive tab`,
    })
  }
}

export default new BusinessCardTerminatePage()
