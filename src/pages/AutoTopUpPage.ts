
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
    // iOS: anchor to a cell unique to Add Funds screen (addFunds_item_card is accessible=true
    // and only exists here; avoids false-positive on the home "plus" button whose label is "Add Funds")
    return $('-ios predicate string: name == "addFunds_item_card" OR name == "addFunds_item_autoTopup" OR name == "addFunds_item_bankTransfer"')
  }

  /* =========================
   * ADD FUNDS POPUP: AUTO TOP-UP TILE
   * ========================= */

  private get autoTopUpTileAndroid() {
    return $('android=new UiSelector().resourceId("addFunds_card_autoTopUp")')
  }

  private get autoTopUpTileIOS() {
    return $('-ios predicate string: name == "addFunds_item_autoTopup" OR name == "addFunds_card_autoTopUp"')
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
    return $('-ios predicate string: name == "autoTopUpList_screen" OR name == "Auto Top-Up"')
  }

  get backBtnList() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpList_button_back")')
    return $('-ios predicate string: name == "BackButton" OR name == "autoTopUpList_button_back"')
  }

  get addNewBtn() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpDetails_button_addNew")')
    return $('-ios predicate string: name == "autoTopUpDetails_button_addNew" OR label == "Add New" OR name == "Add New"')
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
    return $('-ios predicate string: name == "autoTopUpDetails_screen" OR name == "Auto Top-Up"')
  }

  get backBtnDetails() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpDetails_button_back")')
    return $('-ios predicate string: name == "BackButton" OR name == "autoTopUpDetails_button_back"')
  }

  get cardPicker() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpDetails_button_pickCard")')
    return $('-ios predicate string: name == "autoTopup_item_cardPicker" OR name == "autoTopUpDetails_picker_card"')
  }

  get currencyPicker() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpDetails_button_pickCurrency")')
    return $('-ios predicate string: name == "autoTopup_item_currencyPicker" OR name == "autoTopUpDetails_picker_currency"')
  }

  get deleteBtn() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpDetails_button_delete")')
    return $('-ios predicate string: name == "autoTopup_button_delete" OR name == "autoTopUpDetails_button_delete"')
  }

  private get confirmDeleteBtnAndroidByText() {
    return $('android=new UiSelector().text("Confirm")')
  }

  private get confirmDeleteBtnAndroidByDesc() {
    return $('android=new UiSelector().description("Confirm")')
  }

  private get confirmDeleteBtnIOS() {
    return $('-ios predicate string: name == "alert_button_Confirm" OR name == "Confirm" OR label == "Confirm"')
  }

  get saveBtn() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpDetails_button_save")')
    return $('-ios predicate string: name == "autoTopup_button_save" OR name == "autoTopUpDetails_button_save"')
  }

  get customAmountInput() {
    if (browser.isAndroid)
      return $('android=new UiSelector().resourceId("autoTopUpDetails_input_customAmount")')
    return $('-ios predicate string: name == "autoTopUpDetails_input_customAmount" OR type == "XCUIElementTypeTextField"')
  }

  private get customAmountModalScreenAndroid() {
    return $('android=new UiSelector().resourceId("autoTopUpCustomAmountModal_screen")')
  }

  private get customAmountModalInputAndroid() {
    return $('android=new UiSelector().resourceId("autoTopUpCustomAmountModal_input")')
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
    return $('-ios predicate string: name == "autoTopUpDetails_button_customAmountDone" OR name == "Done" OR label == "Done"')
  }

  private get customAmountModalDoneBtnAndroid() {
    return $('android=new UiSelector().resourceId("autoTopUpCustomAmountModal_button_done")')
  }

  private get amountOtherBtnIOS() {
    return $('-ios predicate string: name == "amountPicker_item_Other" OR name == "Other" OR label == "Other"')
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

    if (browser.isIOS) {
      await browser.pause(800)
      // Try full name first, then ISO code (e.g. "Euro" → "EUR")
      const currencyCode = currency.length === 3 ? currency.toUpperCase() : currency.slice(0, 3).toUpperCase()
      const predicates = [
        `-ios predicate string: label CONTAINS "${currency}" OR name CONTAINS "${currency}"`,
        `-ios predicate string: label CONTAINS "${currencyCode}" OR name CONTAINS "${currencyCode}"`,
        `-ios predicate string: value CONTAINS "${currency}" OR value CONTAINS "${currencyCode}"`,
        `-ios class chain:**/XCUIElementTypeCell[\`label CONTAINS "${currency}"\`]`,
        `-ios class chain:**/XCUIElementTypeStaticText[\`label CONTAINS "${currency}"\`]`,
      ]
      for (const pred of predicates) {
        const el = $(pred)
        const found = await el.waitForDisplayed({ timeout: 4000 }).then(() => true).catch(() => false)
        if (found) {
          await this.tap(el)
          await browser.pause(300)
          return
        }
      }
      throw new Error(`Currency item "${currency}" not found on iOS after trying multiple selectors`)
    }

    const currencyItem = $(`android=new UiSelector().textContains("${currency}")`)
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
      const modalVisible = await this.customAmountModalScreenAndroid.isDisplayed().catch(() => false)
      const modalInputVisible = await this.customAmountModalInputAndroid.isDisplayed().catch(() => false)

      if (byIdVisible) {
        await this.tap(this.customAmountInput)
        await this.customAmountInput.clearValue().catch(() => {})
        await this.customAmountInput.setValue(String(amount))
      } else if (modalVisible || modalInputVisible) {
        await this.customAmountModalInputAndroid.waitForDisplayed({ timeout: 7000 })
        await this.tap(this.customAmountModalInputAndroid)
        await this.customAmountModalInputAndroid.clearValue().catch(() => {})
        await this.customAmountModalInputAndroid.setValue(String(amount))
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
      const modalDoneVisible = await this.customAmountModalDoneBtnAndroid.isDisplayed().catch(() => false)
      if (doneByIdVisible) {
        await this.tap(this.customAmountDoneBtn)
      } else if (modalDoneVisible) {
        await this.customAmountModalDoneBtnAndroid.waitForEnabled({ timeout: 7000 })
        await this.tap(this.customAmountModalDoneBtnAndroid)
      } else {
        await this.customAmountDoneBtnAndroidByText.waitForDisplayed({ timeout: 7000 })
        await this.tap(this.customAmountDoneBtnAndroidByText)
      }

      await browser.pause(400)
      return
    }

    if (browser.isIOS) {
      // iOS: шукаємо саме у нижньому блоці (autoTopup_item_amountPicker)
      const amountCell = await $('-ios predicate string: name == "autoTopup_item_amountPicker"')
      const cellVisible = await amountCell.isDisplayed().catch(() => false)
      if (!cellVisible) throw new Error('Amount picker cell not visible on iOS')
      const normalized = String(amount).replace(/^€\s?/, '').trim()
      // Якщо amount = 50/200/500 — клікнути preset
      const presetBtn = await amountCell.$(`-ios predicate string: name == "amountPicker_item_€${normalized}" OR label == "€${normalized}"`)
      if (await presetBtn.isDisplayed().catch(() => false)) {
        await this.tap(presetBtn)
        await browser.pause(300)
        return
      }
      // Вводимо суму у input (спочатку пробуємо знайти поле, якщо не знайдено — тиснемо Other і пробуємо ще раз)
      let inputSet = false
      let inputCandidates = [
        this.customAmountInput,
        await amountCell.$('-ios class chain:**/XCUIElementTypeTextField[`visible == 1`]'),
        await amountCell.$('-ios class chain:**/XCUIElementTypeTextView[`visible == 1`]'),
      ]
      for (const input of inputCandidates) {
        const visible = await input.isDisplayed().catch(() => false)
        if (!visible) continue
        await this.tap(input)
        await input.clearValue().catch(() => {})
        await input.setValue(String(amount))
        inputSet = true
        break
      }
      if (!inputSet) {
        // Якщо поле не знайдено — тиснемо Other і пробуємо ще раз
        const otherBtn = await amountCell.$('-ios predicate string: name == "amountPicker_item_Other" OR label == "Other"')
        if (await otherBtn.isDisplayed().catch(() => false)) {
          await this.tap(otherBtn)
          await browser.pause(300)
        }
        inputCandidates = [
          this.customAmountInput,
          await amountCell.$('-ios class chain:**/XCUIElementTypeTextField[`visible == 1`]'),
          await amountCell.$('-ios class chain:**/XCUIElementTypeTextView[`visible == 1`]'),
        ]
        for (const input of inputCandidates) {
          const visible = await input.isDisplayed().catch(() => false)
          if (!visible) continue
          await this.tap(input)
          await input.clearValue().catch(() => {})
          await input.setValue(String(amount))
          inputSet = true
          break
        }
      }
      if (!inputSet) {
        throw new Error('Could not open custom amount input for iOS Auto Top-Up')
      }
      // Done
      const doneCandidates = [
        this.customAmountDoneBtn,
        $('~Done'),
        $('-ios predicate string: name == "Done" OR label == "Done"'),
      ]
      for (const done of doneCandidates) {
        const visible = await done.isDisplayed().catch(() => false)
        if (!visible) continue
        await this.tap(done)
        await browser.pause(300)
        return
      }
      throw new Error('Could not confirm custom amount for iOS Auto Top-Up')
    }
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
        // Добавляем поиск по accessibility id, если сумма похожа на число
        const addNum = Number(String(amount).replace(/[^\d.]/g, ''))
        if (Number.isFinite(addNum) && addNum > 0) {
          // Пробуем найти cell по accessibility id вида autoTopupList_item_active_€500_€1500
          selectors.push($(`~autoTopupList_item_active_€500_€${addNum}`))
        }
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

    //for ios: search by accessibility id autoTopupList_item_active_€500_€{amount}

    let ruleItem: any;
    if (browser.isIOS) {
      ruleItem = this.getAutoTopUpListItemByAmount(options.amount);
      if (!ruleItem) throw new Error('Could not build locator for autoTopupList_item_active');
      const visible = await ruleItem.isDisplayed().catch(() => false);
      if (!visible) throw new Error(`Auto Top-Up rule not found by accessibility id: autoTopupList_item_active_€500_€${options.amount}`);
      await this.tap(ruleItem);
    } else {
      await this.verifyThresholdRuleIsVisible(options.amount);
      await this.openThresholdRuleDetails(options.amount);
    }

    await this.deleteAutoTopUp()
    await this.confirmDeleteAutoTopUp()

    const onAddFundsAfterDelete = await this.addFundsScreen.isDisplayed().catch(() => false)
    if (!onAddFundsAfterDelete) {
      await this.ensureOnHomeScreen()
      await this.openFromHome()
    }

    await this.autoTopUpTile.waitForDisplayed({ timeout: 15000 })
    await this.goToAutoTopUpList()
    if (browser.isIOS) {
      // Проверяем, что элемент исчез
      ruleItem = this.getAutoTopUpListItemByAmount(options.amount);
      const stillVisible = ruleItem && (await ruleItem.isDisplayed().catch(() => false));
      if (stillVisible) throw new Error(`Auto Top-Up rule все еще виден по accessibility id: autoTopupList_item_active_€500_€${options.amount}`);
    } else {
      await this.verifyThresholdRuleIsNotVisible(options.amount);
    }
  }

  private async openExistingAutoTopUpFromList(cardLabel?: string) {
    await this.autoTopUpListScreen.waitForDisplayed({ timeout: 15000 })

    const candidates = browser.isAndroid
      ? [
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
      : [
          cardLabel
            ? $(`-ios predicate string: (name CONTAINS "${cardLabel}" OR label CONTAINS "${cardLabel}")`)
            : undefined,
          $('-ios class chain:**/XCUIElementTypeCollectionView/XCUIElementTypeCell[`visible == 1`][1]'),
          $('-ios class chain:**/XCUIElementTypeCell[`visible == 1`][1]'),
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

    if (browser.isAndroid) {
      // Android: threshold → amount
      await this.selectPreset500Android()
      await this.enterCustomAmount(options.amount)
    } else {
      // iOS: amount → threshold
      await this.enterCustomAmount(options.amount)
      await this.selectPreset500IOS()
    }
    await this.saveAutoTopUp()

    // iOS повертається на Add Funds screen, Android — на Home
    if (browser.isIOS) {
      const backOnAddFunds = await this.addFundsScreen
        .waitForDisplayed({ timeout: 20000 })
        .then(() => true)
        .catch(() => false)
      if (!backOnAddFunds) {
        await this.openBtn.waitForDisplayed({ timeout: 15000 })
      }
    } else {
      await this.openBtn.waitForDisplayed({ timeout: 30000 })
    }
  }

  async selectPreset500IOS() {
    if (!browser.isIOS) return

    // Threshold preset €500 — шукаємо тільки у cell name="autoTopup_item_lowBarierPicker"
    const thresholdCell = await $('-ios predicate string: name == "autoTopup_item_lowBarierPicker"')
    const appeared = await thresholdCell.waitForDisplayed({ timeout: 7000 }).then(() => true).catch(() => false)
    if (!appeared) throw new Error('Threshold picker cell not visible on iOS')
    const candidates = [
      await thresholdCell.$('-ios predicate string: name == "amountPicker_item_€500"'),
      await thresholdCell.$('-ios predicate string: label == "€500" OR name == "€500"'),
      await thresholdCell.$('-ios class chain:**/XCUIElementTypeButton[`label == "€500"`]'),
      await thresholdCell.$('-ios class chain:**/XCUIElementTypeCell[`label CONTAINS "€500" OR name CONTAINS "€500"`]'),
      await thresholdCell.$('-ios class chain:**/XCUIElementTypeStaticText[`label == "€500"`]'),
    ]
    for (const el of candidates) {
      const visible = await el.isDisplayed().catch(() => false)
      if (!visible) continue
      await this.tap(el)
      await browser.pause(300)
      return
    }
    throw new Error('Could not select threshold preset €500 on iOS')
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
    await this.confirmDeleteAutoTopUp()
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

  /**
   * Returns a locator for an existing Auto Top-Up rule by amount.
   * @param amount - sum
   */
  private getAutoTopUpListItemByAmount(amount: number | string) {
    const addNum = Number(String(amount).replace(/[^\d.]/g, ''));
    if (!Number.isFinite(addNum) || addNum <= 0) return undefined;
    return $(`~autoTopupList_item_active_€500_€${addNum}`);
  }
}
