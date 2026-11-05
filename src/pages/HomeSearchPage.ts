import BasePage from './BasePage'
import HomeScreenPage from './HomeScreenPage'
import { $, browser } from '@wdio/globals'

class HomeSearchPage extends BasePage {
  private get searchInput() {
    if (browser.isAndroid) {
      return $('(//*[@resource-id="home_input_search" or @resource-id="com.moneybase.qa:id/home_input_search"] | //*[@content-desc="Search"]/ancestor::*[@clickable="true"][1] | //android.widget.TextView[@text="Search"]/ancestor::*[@clickable="true"][1])[1]')
    }
    return $('//XCUIElementTypeNavigationBar[@name="Home"]//XCUIElementTypeSearchField[@name="Search" or @label="Search"] | //*[@name="home_screen_view"]//XCUIElementTypeSearchField[@name="Search" or @label="Search"]')
  }

  private get androidEditText() {
    return $('(//android.widget.EditText)[1]')
  }

  private get searchResult() {
    if (browser.isAndroid) {
      return $('//*[contains(@content-desc,"Carlos Cat") or contains(@text,"Carlos Cat")]')
    }
    return $('-ios predicate string: label CONTAINS "Carlos Cat" OR name CONTAINS "Carlos Cat"')
  }

  private async revealSearchInput() {
    if (await this.searchInput.isDisplayed().catch(() => false)) return

    const { width, height } = await browser.getWindowRect()
    const x = Math.round(width * 0.5)

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await browser.performActions([
        {
          type: 'pointer',
          id: `finger-home-search-${attempt}`,
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x, y: Math.round(height * 0.35) },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerMove', duration: 500, x, y: Math.round(height * 0.78) },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])
      await browser.releaseActions().catch(() => {})
      await browser.pause(500)
      if (await this.searchInput.isDisplayed().catch(() => false)) return
    }
  }

  public async verifySearchVisibilityOnScroll() {
    await this.revealSearchInput()
    await this.searchInput.waitForDisplayed({ timeout: 10000 })
    const { width, height } = await browser.getWindowRect()
    const x = Math.round(width / 2)
    await browser.performActions([{
      type: 'pointer',
      id: 'finger-home-search-hide',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x, y: Math.round(height * 0.78) },
        { type: 'pointerDown', button: 0 },
        { type: 'pointerMove', duration: 160, x, y: Math.round(height * 0.24) },
        { type: 'pointerUp', button: 0 },
      ],
    }])
    await browser.releaseActions()
    await this.searchInput.waitForDisplayed({ reverse: true, timeout: 5000 })
    await this.revealSearchInput()
    await this.searchInput.waitForDisplayed({ timeout: 10000 })
  }

  private async typeIntoSearch(value: string) {
    const input = await this.searchInput
    await input.click()
    await browser.pause(300)

    if (browser.isIOS) {
      await input.clearValue().catch(() => {})
      await input.setValue(value).catch(async () => {
        await browser.execute('mobile: type', { text: value })
      })
      return
    }

    await browser.pause(350)
    const editTextVisible = await this.androidEditText.isDisplayed().catch(() => false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const target: WebdriverIO.Element = (editTextVisible ? await this.androidEditText : input) as any

    await target.click().catch(() => {})
    await target.clearValue().catch(() => {})
    await target.addValue(value).catch(async () => {
      await browser.execute('mobile: shell', {
        command: 'input',
        args: ['text', value.replace(/ /g, '%s')],
      })
    })
  }

  private get activeSearchField() {
    return browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeSearchField" AND (name == "Search" OR label == "Search" OR visible == 1)')
      : this.androidEditText
  }

  private searchSection(title: string) {
    return browser.isIOS
      ? $(`-ios predicate string:type == "XCUIElementTypeStaticText" AND label ==[c] "${title}"`)
      : $(`//*[@text="${title}" or @content-desc="${title}"]`)
  }

  private async dismissSearch() {
    if (await browser.isKeyboardShown()) await browser.hideKeyboard()
    const cancel = browser.isIOS ? $('~Cancel') : $('//*[@text="Cancel" or @content-desc="Cancel search"]')
    if (await cancel.isDisplayed()) await this.tap(cancel)
    else if (browser.isAndroid && await this.activeSearchField.isDisplayed()) await browser.back()
    await HomeScreenPage.waitForHomeLoaded()
  }

  public async verifySearchQueryRules() {
    await this.dismissSearch()
    await HomeScreenPage.ensureIndividualAccount()
    await this.revealSearchInput()
    await this.tap(this.searchInput, 10000)
    const field = this.activeSearchField
    await field.waitForDisplayed({ timeout: 10000 })
    await field.clearValue()

    await this.searchSection('Recent').waitForDisplayed({ timeout: 10000 })
    const clearAll = browser.isIOS ? $('~Clear All') : $('//*[@text="Clear All" or @content-desc="Clear All"]')
    await clearAll.waitForDisplayed({ timeout: 10000, timeoutMsg: 'TC2949: the retail fixture should have recent search entries' })

    const instruments = this.searchSection('Instruments')
    const crypto = this.searchSection('Crypto')
    for (const query of ['b', 'bm']) {
      await field.setValue(query)
      await browser.pause(1100)
      if (await instruments.isDisplayed() || await crypto.isDisplayed()) {
        throw new Error(`TC2950: remote result sections should be hidden for ${query.length} characters`)
      }
    }

    await field.setValue('bmw')
    await instruments.waitForDisplayed({ timeout: 15000, timeoutMsg: 'TC2951: BMW should trigger an Instruments result' })
    const bmw = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeStaticText" AND (label ==[c] "BMW" OR label CONTAINS[c] "Bayerische Motoren Werke")')
      : $('//*[translate(@text,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")="bmw" or contains(@text,"Bayerische Motoren Werke")]')
    await bmw.waitForDisplayed({ timeout: 10000 })
  }

  public async verifyBusinessHomeSearchScope() {
    await this.dismissSearch()
    await HomeScreenPage.ensureBusinessAccount()
    await HomeScreenPage.waitForHomeLoaded()

    const help = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeButton" AND (name == "home_button_help" OR label IN {"Help", "Support"})')
      : $('//*[contains(@resource-id,"home_button_help") or contains(@resource-id,"home_button_support") or @content-desc="Help" or @content-desc="Support"]')
    const stats = browser.isIOS
      ? $('-ios predicate string:type == "XCUIElementTypeButton" AND (name CONTAINS[c] "statistics" OR label ==[c] "Statistics")')
      : $('//*[contains(@resource-id,"statistics") or @content-desc="Statistics"]')
    await help.waitForDisplayed({ timeout: 10000 })
    if (await stats.isDisplayed()) throw new Error('TC3051: Statistics should be hidden on Business Home')

    await this.revealSearchInput()
    await this.tap(this.searchInput, 10000)
    const field = this.activeSearchField
    await field.setValue('bmw')
    await this.searchSection('Instruments').waitForDisplayed({ timeout: 15000 })
    await field.setValue('cat')
    await browser.pause(1100)
    for (const section of ['Beneficiaries', 'P2P', 'Crypto']) {
      if (await this.searchSection(section).isDisplayed()) {
        throw new Error(`TC3051: ${section} should not appear in Business Home search`)
      }
    }
  }

  public async verifyHomeSearch(query = 'cat') {
    await this.dismissIOSAlerts()
    await HomeScreenPage.waitForHomeLoaded()
    await HomeScreenPage.ensureIndividualAccount()
    await HomeScreenPage.waitForHomeLoaded()
    await this.dismissIOSAlerts()

    await this.revealSearchInput()
    await this.searchInput.waitForDisplayed({ timeout: 15000 })
    await this.typeIntoSearch(query)

    await this.searchResult.waitForDisplayed({ timeout: 15000 })
  }
}

export default HomeSearchPage
