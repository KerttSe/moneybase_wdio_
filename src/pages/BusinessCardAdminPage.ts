import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'

const BH_ACCOUNT_CODE = process.env.BH_ACCOUNT_CODE || 'SED00004'
const BH_OTHER_USER_NAME = process.env.BH_OTHER_USER_NAME || 'Dmytri Kerteusz'

class BusinessCardAdminPage extends BasePage {
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

  // ── Administration item (in More menu) ───────────────────────────────────

  private get administrationItemIOS() {
    return $('-ios predicate string:name == "Administration" OR label == "Administration"')
  }

  private get administrationItemAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.widget.TextView[@text="Administration"]]')
  }

  // ── Manage Cards screen confirmation ─────────────────────────────────────

  private get manageCardsNavBarIOS() {
    return $('//XCUIElementTypeNavigationBar[@name="Manage Cards"]')
  }

  private get manageCardsTitleAndroid() {
    return $('android=new UiSelector().text("Manage Cards")')
  }

  // ── Card list items (other user's card) ──────────────────────────────────

  private get otherUserCardIOS() {
    return $(
      `//XCUIElementTypeStaticText[contains(@name,"${BH_OTHER_USER_NAME}") or contains(@label,"${BH_OTHER_USER_NAME}")]/ancestor::XCUIElementTypeCell[1]`,
    )
  }

  private get otherUserCardAndroid() {
    return $(
      `//android.view.View[@clickable="true"][.//android.widget.TextView[contains(@text,"${BH_OTHER_USER_NAME}")]]`,
    )
  }

  // ── Card details actions ──────────────────────────────────────────────────
  // Android Freeze/Unfreeze buttons use content-desc (Compose UI, no resourceId)

  private get freezeBtnIOS() {
    return $('~cards_button_freeze')
  }

  private get freezeLabelIOS() {
    return $(
      '//XCUIElementTypeStaticText[(@name="Freeze" or @label="Freeze" or @value="Freeze") and not(ancestor::XCUIElementTypeNavigationBar)]',
    )
  }

  private get unfreezeBtnIOS() {
    return $('~cards_button_unfreeze')
  }

  private get unfreezeLabelIOS() {
    return $(
      '//XCUIElementTypeStaticText[(@name="Unfreeze" or @label="Unfreeze" or @value="Unfreeze") and not(ancestor::XCUIElementTypeNavigationBar)]',
    )
  }

  private get freezeBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.view.View[@content-desc="Freeze"]]')
  }

  private get unfreezeBtnAndroid() {
    return $('//android.view.View[@clickable="true"][.//android.view.View[@content-desc="Unfreeze"]]')
  }

  // ── State checks ──────────────────────────────────────────────────────────

  private async isFreezeVisibleIOS() {
    return (
      (await this.freezeBtnIOS.isExisting().catch(() => false)) ||
      (await this.freezeLabelIOS.isExisting().catch(() => false))
    )
  }

  private async isUnfreezeVisibleIOS() {
    return (
      (await this.unfreezeBtnIOS.isExisting().catch(() => false)) ||
      (await this.unfreezeLabelIOS.isExisting().catch(() => false))
    )
  }

  private async tapIOSCardAction(
    label: 'Freeze' | 'Unfreeze',
    waitFor: () => Promise<boolean>,
    timeoutMsg: string,
  ) {
    const el = label === 'Freeze' ? this.freezeBtnIOS : this.unfreezeBtnIOS
    const fallback = label === 'Freeze' ? this.freezeLabelIOS : this.unfreezeLabelIOS

    for (const candidate of [el, fallback]) {
      if (!(await candidate.isExisting().catch(() => false))) continue

      const location = await candidate.getLocation()
      const size = await candidate.getSize()
      await browser
        .execute('mobile: tap', {
          x: Math.round(location.x + size.width / 2),
          y: Math.round(location.y + size.height / 2),
        })
        .catch(async () => {
          await candidate.click().catch(() => {})
        })

      const done = await browser.waitUntil(waitFor, { timeout: 15000, interval: 500 }).catch(() => false)
      if (done) return
    }

    throw new Error(timeoutMsg)
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

    // Android: check if already on a Business account via the chip text
    const chip = this.accountChipAndroid
    if (await chip.isExisting().catch(() => false)) {
      const text = await chip.getText().catch(() => '')
      if (text.includes(BH_ACCOUNT_CODE)) return
    }

    await this.userAvatarAndroid.waitForExist({ timeout: 20000, timeoutMsg: 'Home user avatar not found — home screen not loaded' })
    await this.tap(this.userAvatarAndroid)
    await this.subAccountsSheetAndroid.waitForExist({ timeout: 15000, timeoutMsg: 'Sub Accounts sheet did not open' })
    await this.seDeKeItemAndroid.waitForExist({ timeout: 10000, timeoutMsg: 'SeDeKE (SED00004) not found in Sub Accounts list' })
    await this.tap(this.seDeKeItemAndroid)
    await browser.pause(1500)
    await this.userAvatarAndroid.waitForExist({ timeout: 20000, timeoutMsg: 'Home did not reload after switching to SeDeKE account' })
  }

  public async openAdministration() {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    const moreTab = browser.isIOS ? this.moreTabIOS : this.moreTabAndroid
    await moreTab.waitForExist({ timeout: 15000 })
    await this.tap(moreTab)
    await browser.pause(500)

    const adminItem = browser.isIOS ? this.administrationItemIOS : this.administrationItemAndroid
    await adminItem.waitForExist({
      timeout: 15000,
      timeoutMsg: 'Administration item not found in More section',
    })
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
      timeoutMsg: `Card for "${BH_OTHER_USER_NAME}" not found in Manage Cards list`,
    })
    await this.tap(card)

    await browser.waitUntil(
      async () =>
        browser.isIOS
          ? (await this.isFreezeVisibleIOS()) || (await this.isUnfreezeVisibleIOS())
          : (await this.freezeBtnAndroid.isExisting().catch(() => false)) ||
            (await this.unfreezeBtnAndroid.isExisting().catch(() => false)),
      {
        timeout: 20000,
        interval: 500,
        timeoutMsg: `Card Details actions did not appear for "${BH_OTHER_USER_NAME}"`,
      },
    )
  }

  public async freezeCard() {
    if (browser.isIOS) {
      const alreadyFrozen = await this.isUnfreezeVisibleIOS()
      if (alreadyFrozen) {
        await this.tapIOSCardAction(
          'Unfreeze',
          async () => this.isFreezeVisibleIOS(),
          'Could not restore card to active before freeze test',
        )
      }
      await this.tapIOSCardAction(
        'Freeze',
        async () => this.isUnfreezeVisibleIOS(),
        'Unfreeze button did not appear after freezing card on iOS',
      )
      return
    }

    const alreadyFrozen = await this.unfreezeBtnAndroid.isExisting().catch(() => false)
    if (alreadyFrozen) {
      await this.tap(this.unfreezeBtnAndroid)
      await this.freezeBtnAndroid.waitForExist({ timeout: 15000 })
    }

    await this.tap(this.freezeBtnAndroid)
    await this.unfreezeBtnAndroid.waitForExist({
      timeout: 15000,
      timeoutMsg: 'Unfreeze button did not appear after freezing card on Android',
    })
  }

  public async verifyCardFrozen() {
    if (browser.isIOS) {
      await browser.waitUntil(async () => this.isUnfreezeVisibleIOS(), {
        timeout: 10000,
        interval: 500,
        timeoutMsg: 'Card not shown as frozen (Unfreeze button not visible) on iOS',
      })
      return
    }
    await this.unfreezeBtnAndroid.waitForExist({
      timeout: 10000,
      timeoutMsg: 'Card not shown as frozen (Unfreeze button not visible) on Android',
    })
  }

  public async unfreezeCard() {
    if (browser.isIOS) {
      await this.tapIOSCardAction(
        'Unfreeze',
        async () => this.isFreezeVisibleIOS(),
        'Freeze button did not appear after unfreezing card on iOS',
      )
      return
    }
    await this.tap(this.unfreezeBtnAndroid)
    await this.freezeBtnAndroid.waitForExist({
      timeout: 15000,
      timeoutMsg: 'Freeze button did not appear after unfreezing card on Android',
    })
  }

  public async verifyCardUnfrozen() {
    if (browser.isIOS) {
      await browser.waitUntil(async () => this.isFreezeVisibleIOS(), {
        timeout: 10000,
        interval: 500,
        timeoutMsg: 'Card not shown as active (Freeze button not visible) on iOS',
      })
      return
    }
    await this.freezeBtnAndroid.waitForExist({
      timeout: 10000,
      timeoutMsg: 'Card not shown as active (Freeze button not visible) on Android',
    })
  }
}

export default new BusinessCardAdminPage()
