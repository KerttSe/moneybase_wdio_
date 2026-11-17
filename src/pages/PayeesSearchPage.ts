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

  /**
   * TC3292: tapping a phone contact that is not on Moneybase opens an SMS invite instead of a payment.
   * The message app opens with a draft; nothing is sent. Leaving the app may ask for the passcode again, so this runs last.
   */
  async verifyNonMoneybaseContactOpensInvite() {
    await this.openPayeesSearch()
    await this.tap(this.filter('Contacts'))
    // Moneybase users show a name (e.g. "Kertesz"); a phone-only row named by its number is not on Moneybase.
    const contact = $('(//*[starts-with(@content-desc,"+") and string-length(@content-desc)>8 and not(contains(@content-desc," "))])[1]')
    await contact.waitForDisplayed({ timeout: 15000, timeoutMsg: 'TC3292: no phone contact listed under Contacts' })
    await this.tap(contact)
    let pkg = 'com.moneybase.qa'
    const left = await browser.waitUntil(async () => {
      pkg = await browser.getCurrentPackage()
      return pkg !== 'com.moneybase.qa'
    }, { timeout: 10000, interval: 500 }).then(() => true).catch(() => false)
    if (left) {
      console.log(`[Payees] contact tap opened ${pkg}`)
      if (!/messag|mms|sms|android\.intentresolver|resolver|chooser/i.test(pkg)) throw new Error(`TC3292: contact tap opened ${pkg}, not an SMS invite`)
      await browser.activateApp('com.moneybase.qa')
      await browser.pause(2000)
      return
    }
    // Some builds show an in-app invite sheet first.
    const invite = $('//*[contains(@text,"Invite") or contains(@text,"invite") or contains(@text,"SMS")]')
    await invite.waitForDisplayed({ timeout: 5000, timeoutMsg: 'TC3292: tapping a non-Moneybase contact neither opened an SMS invite nor an invite prompt' })
    if (await $('//*[contains(@resource-id,"bankTransfer") or contains(@text,"Amount")]').isDisplayed().catch(() => false)) {
      throw new Error('TC3292: a non-Moneybase contact should not open a payment')
    }
  }
}

export default new PayeesSearchPage()
