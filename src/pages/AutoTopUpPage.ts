import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'

export default class AutoTopUpPage extends BasePage {
  /* =========================
   * ANDROID: HOME / ACCOUNT (ensure Individual / Single)
   * ========================= */

  private get userAvatarBtnAndroid() {
    return $('android=new UiSelector().resourceId("home_button_userAvatar")')
  }

  private get businessAccountLabelAndroid() {
    return $('android=new UiSelector().textContains("Business")')
  }

  private get singleAccountItemAndroid() {
    return $('android=new UiSelector().description("Single")')
  }

  private get singleAccountItemAndroidByText() {
    return $('android=new UiSelector().text("Single")')
  }

  private get homeRootAndroid() {
    return $('android=new UiSelector().resourceId("home_screen")')
  }

  /* =========================
   * iOS: PROFILE PICKER (ensure Individual)
   * ========================= */

  private get profilePickerUserNameLabelIOS() {
    return $('~profilePicker_label_userName')
  }

  private get profilePickerIndividualItemIOS() {
    return $('~Individual')
  }

  private async ensureIndividualAccountIOS() {
    if (!browser.isIOS) return

    await this.profilePickerUserNameLabelIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.profilePickerUserNameLabelIOS)

    await this.profilePickerIndividualItemIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.profilePickerIndividualItemIOS)

    await this.profilePickerIndividualItemIOS
      .waitForDisplayed({ reverse: true, timeout: 15000 })
      .catch(() => {})
    await browser.pause(300)
  }

  /* =========================
   * ANDROID: blocking AlertDialog
   * ========================= */

  private get alertBtn3Android() {
    return $('android=new UiSelector().resourceId("android:id/button3")')
  }

  private async dismissBlockingAlertAndroid() {
    if (!browser.isAndroid) return

    await browser.switchContext('NATIVE_APP').catch(() => {})

    const alertVisible = await this.alertBtn3Android
      .waitForDisplayed({ timeout: 2000 })
      .then(() => true)
      .catch(() => false)

    if (!alertVisible) return

    await this.tap(this.alertBtn3Android)
    await this.alertBtn3Android.waitForDisplayed({ reverse: true, timeout: 7000 }).catch(() => {})
  }

  /* =========================
   * HOME: OPEN ADD FUNDS POPUP (same as AddFunds button)
   * ========================= */

  private get addFundsBtnAndroid() {
    return $('android=new UiSelector().resourceId("home_button_addFunds")')
  }

  private get addFundsBtnIOS() {
    return $('~plus')
  }

  private get openBtn() {
    if (browser.isAndroid) return this.addFundsBtnAndroid
    return this.addFundsBtnIOS
  }

  private get addFundsScreen() {
    if (browser.isAndroid) return $('android=new UiSelector().resourceId("addFunds_screen")')
    return $('~addFunds_screen')
  }

  /* =========================
   * ADD FUNDS POPUP: AUTO TOP-UP TILE
   * ========================= */

  private get autoTopUpTileAndroid() {
    return $('android=new UiSelector().resourceId("addFunds_card_autoTopUp")')
  }

  private get autoTopUpTileIOS() {
    return $('~addFunds_card_autoTopUp')
  }

  private get autoTopUpTile() {
    if (browser.isAndroid) return this.autoTopUpTileAndroid
    return this.autoTopUpTileIOS
  }

  /* =========================
   * AUTO TOP-UP LIST SCREEN
   * autoTopUpList_screen
   * autoTopUpList_button_back
   * autoTopUpDetails_button_addNew
   * ========================= */

  get autoTopUpListScreen() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpList_screen")')
    return $('~autoTopUpList_screen')
  }

  get backBtnList() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpList_button_back")')
    return $('~autoTopUpList_button_back')
  }

  get addNewBtn() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpDetails_button_addNew")')
    return $('~autoTopUpDetails_button_addNew')
  }

  /* =========================
   * AUTO TOP-UP DETAILS SCREEN
   * autoTopUpDetails_screen
   * autoTopUpDetails_button_back
   * autoTopUpDetails_picker_card
   * autoTopUpDetails_picker_currency
   * autoTopUpDetails_button_delete
   * autoTopUpDetails_button_save
   * autoTopUpDetails_input_customAmount
   * autoTopUpDetails_button_customAmountDone
   * ========================= */

  get autoTopUpDetailsScreen() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpDetails_screen")')
    return $('~autoTopUpDetails_screen')
  }

  get backBtnDetails() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpDetails_button_back")')
    return $('~autoTopUpDetails_button_back')
  }

  get cardPicker() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpDetails_picker_card")')
    return $('~autoTopUpDetails_picker_card')
  }

  get currencyPicker() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpDetails_picker_currency")')
    return $('~autoTopUpDetails_picker_currency')
  }

  get deleteBtn() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpDetails_button_delete")')
    return $('~autoTopUpDetails_button_delete')
  }

  private get confirmDeleteBtnAndroidByText() {
    return $('android=new UiSelector().text("Confirm")')
  }

  private get confirmDeleteBtnAndroidByDesc() {
    return $('android=new UiSelector().description("Confirm")')
  }

  private get confirmDeleteBtnIOS() {
    return $('-ios predicate string: name == "Confirm" OR label == "Confirm"')
  }

  get saveBtn() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpDetails_button_save")')
    return $('~autoTopUpDetails_button_save')
  }

  get customAmountInput() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpDetails_input_customAmount")')
    return $('~autoTopUpDetails_input_customAmount')
  }

  private get presetAmount500Android() {
    return $('android=new UiSelector().description("€500")')
  }

  private get addFollowingAmount500Android() {
    return $(
      '//android.widget.TextView[@text="Add the following amount:"]/following-sibling::android.view.View[1]//android.view.View[@content-desc="€500"]'
    )
  }

  private get presetAmountOtherAndroid() {
    return $('android=new UiSelector().description("Other")')
  }

  private get thresholdOtherAndroid() {
    return $(
      '//android.widget.TextView[@text="When balance falls below:"]/following-sibling::android.view.View[1]//android.view.View[@content-desc="Other"]'
    )
  }

  private get amountEditTextAndroid() {
    return $('android=new UiSelector().className("android.widget.EditText")')
  }

  get customAmountDoneBtn() {
    if (browser.isAndroid)
      return $(
        'android=new UiSelector().resourceId("autoTopUpDetails_button_customAmountDone")'
      )
    return $('~autoTopUpDetails_button_customAmountDone')
  }

  private get customAmountDoneBtnAndroidByText() {
    return $('android=new UiSelector().text("Done")')
  }

  /* =========================
   * PUBLIC FLOWS
   * ========================= */

  /**
   * Opens the Add Funds popup from the home screen.
   * Same behaviour as the Add Funds button flow.
   */
  async openFromHome() {
    if (browser.isAndroid) {
      await this.ensureSingleAccountAndroid()
      await browser.pause(700)
      await this.alertBtn3Android.waitForDisplayed({ timeout: 7000 }).catch(() => {})
      await this.dismissBlockingAlertAndroid()
    }

    if (browser.isIOS) {
      await this.ensureIndividualAccountIOS()
    }

    const addFundsAlreadyOpen = await this.addFundsScreen.isDisplayed().catch(() => false)
    if (addFundsAlreadyOpen) return

    await this.openBtn.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.openBtn)
  }

  /**
   * Taps the Auto Top-Up tile inside the Add Funds popup
   * and waits for the Auto Top-Up List screen to appear.
   */
  async goToAutoTopUpList() {
    // Ensure Add Funds screen is visible first
    await this.addFundsScreen.waitForDisplayed({ timeout: 10000 })
    await browser.pause(500)
    
    await this.autoTopUpTile.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.autoTopUpTile)

    const openedList = await this.autoTopUpListScreen
      .waitForDisplayed({ timeout: 6000 })
      .then(() => true)
      .catch(() => false)

    if (!openedList) {
      await this.autoTopUpDetailsScreen.waitForDisplayed({ timeout: 15000 })
    }
  }

  /**
   * Taps "Add New" on the Auto Top-Up List screen
   * and waits for the Details screen to appear.
   */
  async tapAddNew() {
    const alreadyOnDetails = await this.autoTopUpDetailsScreen.isDisplayed().catch(() => false)
    if (alreadyOnDetails) return

    await this.autoTopUpListScreen.waitForDisplayed({ timeout: 15000 })
    await this.addNewBtn.waitForDisplayed({ timeout: 5000 })
    await this.tap(this.addNewBtn)
    await this.autoTopUpDetailsScreen.waitForDisplayed({ timeout: 15000 })
  }

  /**
   * Selects a card from the card picker.
   * @param cardLabel - visible label / accessibility value of the card to pick
   */
  async selectCard(cardLabel: string) {
    await this.cardPicker.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.cardPicker)

    const cardItem = browser.isAndroid
      ? $(`android=new UiSelector().textContains("${cardLabel}")`)
      : $(`-ios predicate string: label CONTAINS "${cardLabel}" OR name CONTAINS "${cardLabel}"`)

    await cardItem.waitForDisplayed({ timeout: 15000 })
    await this.tap(cardItem)
    await browser.pause(300)
  }

  /**
   * Selects a currency from the currency picker.
   * @param currency - e.g. "EUR", "USD"
   */
  async selectCurrency(currency: string) {
    await this.currencyPicker.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.currencyPicker)

    const currencyItem = browser.isAndroid
      ? $(`android=new UiSelector().textContains("${currency}")`)
      : $(`-ios predicate string: label CONTAINS "${currency}" OR name CONTAINS "${currency}"`)

    await currencyItem.waitForDisplayed({ timeout: 15000 })
    await this.tap(currencyItem)
    await browser.pause(300)
  }

  /**
   * Enters a custom top-up amount and confirms via the "Done" button.
   * @param amount - numeric amount
   */
  async enterCustomAmount(amount: number | string) {
    if (browser.isAndroid) {
      const inputInitiallyVisible = await this.customAmountInput.isDisplayed().catch(() => false)

      if (!inputInitiallyVisible) {
        const anyOtherByDesc = $('//android.view.View[contains(@content-desc,"Other")]')
        const anyOtherByText = $('android=new UiSelector().text("Other")')

        const otherCandidates = [
          this.thresholdOtherAndroid,
          this.presetAmountOtherAndroid,
          anyOtherByDesc,
          anyOtherByText,
        ]

        for (const candidate of otherCandidates) {
          const visible = await candidate.isDisplayed().catch(() => false)
          if (!visible) continue
          await this.tap(candidate)
          break
        }
      }

      const byIdVisible = await this.customAmountInput.isDisplayed().catch(() => false)
      if (byIdVisible) {
        await this.tap(this.customAmountInput)
        await this.customAmountInput.clearValue().catch(() => {})
        await this.customAmountInput.setValue(String(amount))
      } else {
        const byClassVisible = await this.amountEditTextAndroid
          .waitForDisplayed({ timeout: 7000 })
          .then(() => true)
          .catch(() => false)

        if (!byClassVisible) {
          throw new Error('Could not open custom amount input for Auto Top-Up')
        }

        await this.tap(this.amountEditTextAndroid)
        await this.amountEditTextAndroid.clearValue().catch(() => {})
        await this.amountEditTextAndroid.setValue(String(amount))
      }

      await browser.pause(300)

      const doneByIdVisible = await this.customAmountDoneBtn.isDisplayed().catch(() => false)
      if (doneByIdVisible) {
        await this.tap(this.customAmountDoneBtn)
      } else {
        await this.customAmountDoneBtnAndroidByText.waitForDisplayed({ timeout: 7000 })
        await this.tap(this.customAmountDoneBtnAndroidByText)
      }

      await browser.pause(400)
      return
    }

    await this.customAmountInput.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.customAmountInput)
    await this.customAmountInput.clearValue().catch(() => {})
    await this.customAmountInput.setValue(String(amount))

    await this.customAmountDoneBtn.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.customAmountDoneBtn)
    await browser.pause(300)
  }

  /**
   * Saves the Auto Top-Up configuration.
   */
  async saveAutoTopUp() {
    await this.saveBtn.waitForEnabled({ timeout: 15000 })
    await this.tap(this.saveBtn)
  }

  /**
   * Deletes the Auto Top-Up rule (available on the Details screen
   * when editing an existing rule).
   */
  async deleteAutoTopUp() {
    await this.deleteBtn.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.deleteBtn)
  }

  async confirmDeleteAutoTopUp() {
    if (browser.isAndroid) {
      const byTextVisible = await this.confirmDeleteBtnAndroidByText
        .isDisplayed()
        .catch(() => false)

      if (byTextVisible) {
        await this.tap(this.confirmDeleteBtnAndroidByText)
        return
      }

      await this.confirmDeleteBtnAndroidByDesc.waitForDisplayed({ timeout: 15000 })
      await this.tap(this.confirmDeleteBtnAndroidByDesc)
      return
    }

    await this.confirmDeleteBtnIOS.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.confirmDeleteBtnIOS)
  }

  private thresholdAmountFragments(amount: number | string) {
    const raw = String(amount).trim()
    const numeric = Number(String(amount).replace(/[^\d.-]/g, ''))
    const formatted = Number.isFinite(numeric) ? numeric.toLocaleString('en-US') : raw

    return Array.from(new Set([raw, formatted]))
  }

  private getThresholdRuleCandidates(amount: number | string) {
    const fragments = this.thresholdAmountFragments(amount)
    const selectors: ReturnType<typeof $>[] = []

    for (const fragment of fragments) {
      if (browser.isAndroid) {
        selectors.push(
          $(
            `//android.view.View[contains(@content-desc,"When balance falls below") and contains(@content-desc,"${fragment}")]`
          )
        )
        selectors.push(
          $(
            `//android.widget.TextView[contains(@text,"When balance falls below") and contains(@text,"${fragment}")]`
          )
        )
      } else {
        selectors.push($(`~When balance falls below: € ${fragment}`))
        selectors.push(
          $(
            `-ios predicate string: (name CONTAINS "When balance falls below" OR label CONTAINS "When balance falls below") AND (name CONTAINS "${fragment}" OR label CONTAINS "${fragment}")`
          )
        )
      }
    }

    return selectors
  }

  private async findThresholdRuleElement(amount: number | string) {
    const candidates = this.getThresholdRuleCandidates(amount)

    for (const el of candidates) {
      const visible = await el.isDisplayed().catch(() => false)
      if (visible) return el
    }

    return undefined
  }

  async verifyThresholdRuleIsVisible(amount: number | string) {
    const found = await this.findThresholdRuleElement(amount)
    if (!found) {
      throw new Error(`Auto Top-Up rule was not found for threshold amount: ${amount}`)
    }
  }

  async verifyThresholdRuleIsNotVisible(amount: number | string) {
    const found = await this.findThresholdRuleElement(amount)
    if (found) {
      throw new Error(`Auto Top-Up rule is still visible for threshold amount: ${amount}`)
    }
  }

  private async openThresholdRuleDetails(amount: number | string) {
    const alreadyOnDetails = await this.autoTopUpDetailsScreen.isDisplayed().catch(() => false)
    if (alreadyOnDetails) return

    const item = await this.findThresholdRuleElement(amount)
    if (!item) {
      throw new Error(`Could not open Auto Top-Up rule for threshold amount: ${amount}`)
    }

    await this.tap(item)
    await this.autoTopUpDetailsScreen.waitForDisplayed({ timeout: 15000 })
  }

  private async ensureOnHomeScreen() {
    const homeVisible = await this.openBtn.isDisplayed().catch(() => false)
    if (homeVisible) return

    const addFundsVisible = await this.addFundsScreen.isDisplayed().catch(() => false)
    if (addFundsVisible) return

    const onDetails = await this.autoTopUpDetailsScreen.isDisplayed().catch(() => false)
    if (onDetails) {
      await this.backBtnDetails.waitForDisplayed({ timeout: 5000 }).catch(() => {})
      const backDetailsVisible = await this.backBtnDetails.isDisplayed().catch(() => false)
      if (backDetailsVisible) {
        await this.tap(this.backBtnDetails)
      }
    }

    const onList = await this.autoTopUpListScreen.isDisplayed().catch(() => false)
    if (onList) {
      await this.backBtnList.waitForDisplayed({ timeout: 5000 }).catch(() => {})
      const backListVisible = await this.backBtnList.isDisplayed().catch(() => false)
      if (backListVisible) {
        await this.tap(this.backBtnList)
      }
    }

    const homeVisibleAfterBack = await this.openBtn.isDisplayed().catch(() => false)
    if (homeVisibleAfterBack) return

    await this.addFundsScreen.waitForDisplayed({ timeout: 15000 }).catch(async () => {
      await this.openBtn.waitForDisplayed({ timeout: 15000 })
    })
  }

  async verifyAndDeleteAutoTopUpFromHomeFlow(options: { amount: number | string }) {
    await this.openFromHome()
    await this.goToAutoTopUpList()

    await this.verifyThresholdRuleIsVisible(options.amount)
    await this.openThresholdRuleDetails(options.amount)

    await this.deleteAutoTopUp()
    await this.confirmDeleteAutoTopUp()

    const onAddFundsAfterDelete = await this.addFundsScreen.isDisplayed().catch(() => false)
    if (!onAddFundsAfterDelete) {
      await this.ensureOnHomeScreen()
      await this.openFromHome()
    }

    await this.autoTopUpTile.waitForDisplayed({ timeout: 15000 })
    await this.goToAutoTopUpList()
    await this.verifyThresholdRuleIsNotVisible(options.amount)
  }

  private async openExistingAutoTopUpFromList(cardLabel?: string) {
    await this.autoTopUpListScreen.waitForDisplayed({ timeout: 15000 })

    const candidates = [
      cardLabel
        ? $(`android=new UiSelector().resourceId("autoTopUpList_screen").childSelector(new UiSelector().textContains("${cardLabel}"))`)
        : undefined,
      cardLabel
        ? $(`android=new UiSelector().descriptionContains("${cardLabel}")`)
        : undefined,
      $('android=new UiSelector().descriptionContains("Auto Top-Up")'),
      $('android=new UiSelector().textContains("Auto Top-Up")'),
      $('(//*[@resource-id="autoTopUpList_screen"]//*[@clickable="true"])[1]'),
    ]

    for (const el of candidates) {
      if (!el) continue
      const visible = await el.isDisplayed().catch(() => false)
      if (!visible) continue
      await this.tap(el)
      return
    }

    throw new Error('Could not open existing Auto Top-Up rule from list')
  }

  async openExistingAutoTopUpDetailsFlow(cardLabel?: string) {
    await this.openFromHome()
    await this.goToAutoTopUpList()

    const alreadyOnDetails = await this.autoTopUpDetailsScreen.isDisplayed().catch(() => false)
    if (alreadyOnDetails) return

    await this.openExistingAutoTopUpFromList(cardLabel)
    await this.autoTopUpDetailsScreen.waitForDisplayed({ timeout: 15000 })
  }

  /**
   * Full creation flow:
   * Home → Add Funds popup → Auto Top-Up tile → List → Add New → fill form → Save.
   */
  async createAutoTopUpFlow(options: {
    cardLabel: string
    currency: string
    amount: number | string
  }) {
    await this.openFromHome()
    await this.goToAutoTopUpList()
    await this.tapAddNew()
    await this.selectCard(options.cardLabel)
    await this.selectCurrency(options.currency)
    await this.enterCustomAmount(options.amount)
    await this.saveAutoTopUp()
  }

  async createAutoTopUpToHomeFlow(options: {
    cardLabel: string
    currency: string
    amount: number | string
  }) {
    await this.openFromHome()
    await this.goToAutoTopUpList()
    await this.tapAddNew()
    await this.selectCard(options.cardLabel)
    await this.selectCurrency(options.currency)
    await this.enterCustomAmount(options.amount)

    if (browser.isAndroid) {
      await this.selectPreset500Android()
    }

    await this.saveAutoTopUp()

    // Після Save очікуємо повернення на Home
    await this.addFundsBtnAndroid.waitForDisplayed({ timeout: 30000 })
  }

  async selectPreset500Android() {
    if (!browser.isAndroid) return

    const second500Visible = await this.addFollowingAmount500Android
      .isDisplayed()
      .catch(() => false)

    if (second500Visible) {
      await this.tap(this.addFollowingAmount500Android)
      return
    }

    await this.presetAmount500Android.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.presetAmount500Android)
  }

  async createAndDeleteAutoTopUpFlow(options: {
    cardLabel: string
    currency: string
    amount: number | string
  }) {
    await this.openFromHome()
    await this.goToAutoTopUpList()
    await this.tapAddNew()
    await this.selectCard(options.cardLabel)
    await this.selectCurrency(options.currency)

    await this.enterCustomAmount(options.amount)

    if (browser.isAndroid) {
      await this.selectPreset500Android()
    }

    await this.saveAutoTopUp()

    // Після create додаток може повернути на Home.
    // Для стабільного delete завжди повторно відкриваємо Auto Top-Up,
    // відкриваємо існуюче правило та видаляємо його.
    await this.openExistingAutoTopUpDetailsFlow(options.cardLabel)
    await this.deleteAutoTopUp()
  }

  /* =========================
   * ANDROID: ensure Single account
   * ========================= */

  private async ensureSingleAccountAndroid() {
    const isBusiness = await this.businessAccountLabelAndroid.isDisplayed().catch(() => false)
    if (!isBusiness) return

    await this.userAvatarBtnAndroid.waitForDisplayed({ timeout: 15000 })
    await this.tap(this.userAvatarBtnAndroid)

    if (await this.singleAccountItemAndroid.isDisplayed().catch(() => false)) {
      await this.tap(this.singleAccountItemAndroid)
    } else {
      try {
        await this.tap(this.singleAccountItemAndroidByText)
      } catch {
        // element not found, continue
      }
    }

    await this.homeRootAndroid.waitForDisplayed({ timeout: 30000 }).catch(() => {})
    await this.businessAccountLabelAndroid
      .waitForDisplayed({ reverse: true, timeout: 30000 })
      .catch(() => {})
  }
}
