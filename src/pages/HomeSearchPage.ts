import BasePage from './BasePage'
import HomeScreenPage from './HomeScreenPage'
import { $, browser } from '@wdio/globals'

class HomeSearchPage extends BasePage {
  private get searchInput() {
    if (browser.isAndroid) {
      return $('(//*[@resource-id="home_input_search" or @resource-id="com.moneybase.qa:id/home_input_search"] | //*[@content-desc="Search"]/ancestor::*[@clickable="true"][1] | //android.widget.TextView[@text="Search"]/ancestor::*[@clickable="true"][1])[1]')
    }
    return $('-ios predicate string:type == "XCUIElementTypeSearchField" AND (name == "Search" OR label == "Search")')
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
