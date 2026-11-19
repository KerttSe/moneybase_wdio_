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

  private async swipeListUp() {
    const { width, height } = await browser.getWindowSize()
    await browser.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: Math.round(width / 2), y: Math.round(height * 0.75) }).down().pause(100)
      .move({ duration: 600, x: Math.round(width / 2), y: Math.round(height * 0.4) }).up().perform()
    await browser.pause(1000)
  }

  /**
   * TC3293 (Android counterpart): Delete on a beneficiary's details asks for confirmation before anything is
   * deleted, and Cancel keeps the beneficiary. Android's sheet does not name the beneficiary. Confirm is never tapped.
   */
  async verifyDeleteBeneficiaryNeedsConfirmation(name: string) {
    if (!(await this.payScreen.isDisplayed().catch(() => false))) {
      await this.tap(this.id('navigation_button_pay'))
      await this.payScreen.waitForDisplayed({ timeout: 20000, timeoutMsg: 'Pay did not open' })
    }
    const row = $(`//*[@content-desc="${name}"]`)
    for (let i = 0; i < 4 && !(await row.isDisplayed().catch(() => false)); i += 1) await this.swipeListUp()
    await this.tap(row)
    const details = this.id('beneficiaryDetails_screen')
    await details.waitForDisplayed({ timeout: 15000, timeoutMsg: `Beneficiary details for ${name} did not open` })
    await this.tap(this.id('beneficiaryDetails_button_delete'))
    await $('//*[@text="Delete Beneficiary"]').waitForDisplayed({ timeout: 10000, timeoutMsg: 'TC3293: Delete did not ask for confirmation' })
    await $('//*[@text="Are you sure you want to delete this beneficiary?"]').waitForDisplayed({ timeout: 5000 })
    await $('//*[@text="Confirm"]').waitForDisplayed({ timeout: 5000, timeoutMsg: 'TC3293: the confirmation has no Confirm action' })
    await this.tap($('//*[@text="Cancel"]'))
    await $('//*[@text="Delete Beneficiary"]').waitForDisplayed({ reverse: true, timeout: 10000, timeoutMsg: 'TC3293: Cancel did not close the confirmation' })
    await details.waitForDisplayed({ timeout: 10000, timeoutMsg: 'TC3293: after Cancel the beneficiary details should still be open' })
    await $(`//*[@text="${name}"]`).waitForDisplayed({ timeout: 5000, timeoutMsg: `TC3293: ${name} should be kept after Cancel` })
    await this.tap(this.id('beneficiaryDetails_button_back'))
    await this.payScreen.waitForDisplayed({ timeout: 15000 })
    await row.waitForExist({ timeout: 10000, timeoutMsg: `TC3293: ${name} disappeared from Pay after Cancel` })
  }
}

export default new PayeesSearchPage()
