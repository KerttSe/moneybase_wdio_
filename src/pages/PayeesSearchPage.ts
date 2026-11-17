import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'

/** Pay > search (payees screen, Android 2.27.0): All / Accounts / Contacts filters. */
class PayeesSearchPage extends BasePage {
  private id(name: string) {
    return $(`(//*[@resource-id="${name}"] | //*[contains(@resource-id,"${name}")])[1]`)
  }

  private get payScreen() { return this.id('pay_screen') }
  private get payeesScreen() { return this.id('payees_screen') }
  private filter(name: 'All' | 'Accounts' | 'Contacts') { return this.id(`payees_button_filter${name}`) }

  async openPayeesSearch() {
    if (await this.payeesScreen.isDisplayed().catch(() => false)) return
    if (!(await this.payScreen.isDisplayed().catch(() => false))) {
      await this.tap(this.id('navigation_button_pay'))
      await this.payScreen.waitForDisplayed({ timeout: 20000, timeoutMsg: 'Pay did not open' })
    }
    await this.tap(this.id('pay_input_search'))
    await this.payeesScreen.waitForDisplayed({ timeout: 15000, timeoutMsg: 'Payees search did not open' })
    await this.filter('All').waitForDisplayed({ timeout: 10000 })
  }

  private async selectedFilter() {
    for (const name of ['All', 'Accounts', 'Contacts'] as const) {
      if ((await this.filter(name).getAttribute('selected').catch(() => 'false')) === 'true') return name
    }
    return 'none'
  }

  /** TC3297: a non-default filter does not survive leaving and re-entering search; it resets to All. */
  async verifyFilterResetsOnReentry() {
    await this.openPayeesSearch()
    if ((await this.selectedFilter()) !== 'All') throw new Error(`TC3297: search should open on All, got ${await this.selectedFilter()}`)
    await this.tap(this.filter('Accounts'))
    await browser.waitUntil(async () => (await this.selectedFilter()) === 'Accounts', {
      timeout: 10000, interval: 500, timeoutMsg: 'TC3297: tapping Accounts did not select it',
    })
    const back = $('//*[@content-desc="Back" or @content-desc="Navigate up"]')
    if (await back.isDisplayed().catch(() => false)) await this.tap(back)
    else await browser.back()
    await this.payScreen.waitForDisplayed({ timeout: 15000, timeoutMsg: 'Leaving search did not return to Pay' })
    await this.openPayeesSearch()
    const now = await this.selectedFilter()
    if (now !== 'All') throw new Error(`TC3297: re-entering search should reset the filter to All, got ${now}`)
  }
}

export default new PayeesSearchPage()
