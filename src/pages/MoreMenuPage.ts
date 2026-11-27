import BasePage from './BasePage'
import { $, $$, browser } from '@wdio/globals'

/**
 * More menu (Android 2.27.0): opened from the avatar on Home. Covers read-only checks of Documents,
 * Moneybase Club, Settings rows and the Support sheet's Call Us option.
 */
class MoreMenuPage extends BasePage {
  private id(name: string) {
    return $(`(//*[@resource-id="com.moneybase.qa:id/${name}"] | //*[@resource-id="${name}"] | //*[contains(@resource-id,"${name}")])[1]`)
  }

  private text(value: string) {
    return $(`(//*[@text="${value}" or @content-desc="${value}"])[1]`)
  }

  private get moreScreen() { return this.id('more_screen') }
  private get homeScreen() { return this.id('home_screen') }

  /** iOS: the More sheet (opened from Home's profile header) and its rows. */
  private get moreNavBarIOS() { return $('//XCUIElementTypeNavigationBar[@name="More"]') }

  /** iOS keeps hidden More rows in the tree collapsed to 1pt with visible=false; only a real row counts. */
  private async isRowShownIOS(label: string) {
    const rows = await $$(`//XCUIElementTypeStaticText[@name="${label}" or @label="${label}"]`)
    for (const row of rows) {
      const visible = await row.getAttribute('visible').catch(() => 'false')
      const height = Number(await row.getSize('height').catch(() => 0))
      if (visible === 'true' && height > 2) return true
    }
    return false
  }

  async openMore() {
    if (browser.isIOS) {
      const { default: home } = await import('./HomeScreenPage')
      await home.openIOSMoreMenu()
      await this.moreNavBarIOS.waitForExist({ timeout: 15000, timeoutMsg: 'More menu did not open (iOS)' })
      return
    }
    if (await this.moreScreen.isDisplayed().catch(() => false)) return
    await this.homeScreen.waitForDisplayed({ timeout: 20000, timeoutMsg: 'Home is not displayed' })
    await this.tap(this.id('home_button_userAvatar'))
    await this.moreScreen.waitForDisplayed({ timeout: 15000, timeoutMsg: 'More menu did not open from the avatar' })
  }

  /** Goes back one screen at a time until More is shown, never past it (a Back on Home asks to close the app). */
  private async backToMore() {
    for (let i = 0; i < 3 && !(await this.moreScreen.isDisplayed().catch(() => false)); i += 1) {
      const backButton = $('//*[@content-desc="Back"]')
      if (await backButton.isDisplayed().catch(() => false)) await this.tap(backButton)
      else await browser.back()
      await browser.pause(1200)
    }
    await this.moreScreen.waitForDisplayed({ timeout: 10000, timeoutMsg: 'Did not return to the More menu' })
  }

  async closeMore() {
    if (browser.isIOS) {
      if (!(await this.moreNavBarIOS.isExisting().catch(() => false))) return
      await this.tap($('//XCUIElementTypeNavigationBar[@name="More"]//XCUIElementTypeButton[@name="close"]'))
      await this.moreNavBarIOS.waitForExist({ reverse: true, timeout: 10000 })
      return
    }
    if (!(await this.moreScreen.isDisplayed().catch(() => false))) return
    await this.tap($('//*[@content-desc="Close"]'))
    await this.homeScreen.waitForDisplayed({ timeout: 15000 })
  }

  private async openItemIOS(label: string) {
    await this.openMore()
    const row = $(`//XCUIElementTypeStaticText[(@name="${label}" or @label="${label}") and @visible="true"]`)
    await row.waitForExist({ timeout: 10000, timeoutMsg: `More row "${label}" not found (iOS)` })
    await this.tap(row)
  }

  private async backToMoreIOS() {
    const back = $('//XCUIElementTypeNavigationBar//XCUIElementTypeButton[@name="More" or @label="More"]')
    for (let i = 0; i < 3 && !(await this.moreNavBarIOS.isExisting().catch(() => false)); i += 1) {
      if (await back.isExisting().catch(() => false)) await this.tap(back)
      else await this.tap($('(//XCUIElementTypeNavigationBar//XCUIElementTypeButton)[1]')).catch(() => {})
      await browser.pause(1200)
    }
    await this.moreNavBarIOS.waitForExist({ timeout: 10000, timeoutMsg: 'Did not return to the More menu (iOS)' })
  }

  private async openItem(label: string) {
    await this.openMore()
    await this.tap(this.text(label))
  }

  /** TC2959: More has no Fixed Deposits row while the feature flag is off. */
  async verifyNoFixedDepositsRow() {
    await this.openMore()
    if (browser.isIOS) {
      await browser.waitUntil(() => this.isRowShownIOS('Documents'), { timeout: 10000, interval: 500, timeoutMsg: 'More menu rows did not load (iOS)' })
      if (await this.isRowShownIOS('Fixed Deposits')) throw new Error('TC2959: the Fixed Deposits row should be hidden on the More menu')
      return
    }
    await this.text('Documents').waitForDisplayed({ timeout: 10000 })
    if (await $('//*[contains(@text,"Fixed Deposit") or contains(@content-desc,"Fixed Deposit")]').isExisting().catch(() => false)) {
      throw new Error('TC2959: the Fixed Deposits row should be hidden on the More menu')
    }
  }

  /** TC2982: Documents lists each attached document with its status. */
  async verifyDocumentsList() {
    if (browser.isIOS) {
      // iOS Documents: one row per document ("Identity Document - Passport") with a status line
      // ("Expires 28 May 2031 - VERIFIED").
      await this.openItemIOS('Documents')
      await $('//XCUIElementTypeNavigationBar[@name="Documents"]').waitForExist({ timeout: 15000, timeoutMsg: 'TC2982: Documents did not open (iOS)' })
      await $('-ios predicate string:type == "XCUIElementTypeStaticText" AND label BEGINSWITH "Identity Document"').waitForExist({ timeout: 10000, timeoutMsg: 'TC2982: no identity document row' })
      await $('-ios predicate string:type == "XCUIElementTypeStaticText" AND label BEGINSWITH "Proof of Address"').waitForExist({ timeout: 10000, timeoutMsg: 'TC2982: no proof of address row' })
      const statuses = await $$('-ios predicate string:type == "XCUIElementTypeStaticText" AND (label CONTAINS "VERIFIED" OR label CONTAINS "PENDING" OR label CONTAINS "EXPIRED" OR label CONTAINS "REJECTED" OR label CONTAINS[c] "expires")').length
      if (statuses < 1) throw new Error('TC2982: expected document rows with a status')
      await this.backToMoreIOS()
      return
    }
    await this.openItem('Documents')
    await this.text('Documents').waitForDisplayed({ timeout: 15000 })
    await this.id('recyclerDocuments').waitForDisplayed({ timeout: 15000, timeoutMsg: 'TC2982: Documents list did not load' })
    await $('//*[starts-with(@text,"Identity Document")]').waitForDisplayed({ timeout: 10000, timeoutMsg: 'TC2982: no identity document row' })
    await this.text('Proof of Address').waitForDisplayed({ timeout: 10000, timeoutMsg: 'TC2982: no proof of address row' })
    const statuses = await $$('//*[contains(@resource-id,"textStatus")]').length
    const titles = await $$('//*[contains(@resource-id,"textTitle")]').length
    if (titles < 2 || statuses < 1) throw new Error(`TC2982: expected document rows with statuses, found ${titles} titles and ${statuses} statuses`)
    await this.backToMore()
  }

  /** TC2992: Explore Moneybase Club Benefits opens the tier carousel on the account's tier. */
  async verifyClubBenefitsCarousel(currentTier: string) {
    if (browser.isIOS) {
      await this.openItemIOS('Moneybase Club')
      await $('//XCUIElementTypeNavigationBar[@name="Moneybase Club"]').waitForExist({ timeout: 15000, timeoutMsg: 'Moneybase Club did not open (iOS)' })
      const explore = $('//XCUIElementTypeStaticText[@name="Explore Moneybase Club Benefits"] | //XCUIElementTypeButton[@name="Explore Moneybase Club Benefits"]')
      await explore.waitForExist({ timeout: 10000, timeoutMsg: 'TC2992: Explore Moneybase Club Benefits is missing' })
      await this.tap(explore)
      await $('//XCUIElementTypeNavigationBar[@name="Moneybase Club Benefits"]').waitForExist({ timeout: 15000, timeoutMsg: 'TC2992: Explore did not open the tier carousel' })
      for (const tier of ['Starter', 'Select', 'Premier', 'Elite']) {
        await $(`//XCUIElementTypeButton[@name="${tier}"]`).waitForExist({ timeout: 10000, timeoutMsg: `TC2992: the tier picker has no "${tier}"` })
      }
      // The current tier's button is the selected one (traits "Selected", value "1").
      const selected = $(`//XCUIElementTypeButton[@name="${currentTier}" and (@value="1" or contains(@traits,"Selected"))]`)
      await selected.waitForExist({ timeout: 5000, timeoutMsg: `TC2992: the carousel should open on the current tier ${currentTier}` })
      await this.tap($('//XCUIElementTypeNavigationBar[@name="Moneybase Club Benefits"]//XCUIElementTypeButton[@name="Moneybase Club"]')).catch(() => {})
      await browser.pause(800)
      await this.backToMoreIOS()
      return
    }
    await this.openItem('Moneybase Club')
    await this.id('tierDetails_screen').waitForDisplayed({ timeout: 15000, timeoutMsg: 'Moneybase Club did not open' })
    const explore = this.id('tierDetails_button_exploreClubBenefits')
    await explore.waitForDisplayed({ timeout: 10000, timeoutMsg: 'TC2992: Explore Moneybase Club Benefits is missing' })
    await this.tap(explore)
    await explore.waitForDisplayed({ reverse: true, timeout: 15000, timeoutMsg: 'TC2992: Explore did not open the tier carousel' })
    for (const tier of ['Starter', 'Select', 'Premier', 'Elite']) {
      await this.text(tier).waitForExist({ timeout: 10000, timeoutMsg: `TC2992: the tier picker has no "${tier}"` })
    }
    await $(`//*[@text="${currentTier}" and @selected="true"] | //*[@selected="true"]//*[@text="${currentTier}"]`).waitForExist({
      timeout: 5000, timeoutMsg: `TC2992: the carousel should open on the current tier ${currentTier}`,
    })
    await this.backToMore()
  }

  /** TC2971 (Android counterpart): Settings shows the fingerprint sign-in row on a fingerprint device. */
  async verifyFingerprintRow() {
    await this.openItem('Settings')
    await this.text('Theme').waitForDisplayed({ timeout: 15000, timeoutMsg: 'Settings did not open' })
    await this.text('Sign in with Fingerprint').waitForDisplayed({ timeout: 10000, timeoutMsg: 'TC2971: no "Sign in with Fingerprint" row on a fingerprint device' })
    if (await $('//*[contains(@text,"Face ID")]').isExisting().catch(() => false)) {
      throw new Error('TC2971: Face ID row should not show on an Android fingerprint device')
    }
    await this.backToMore()
  }

  /**
   * TC3064 (Android counterpart): a retail account is offered the referral flow; Invite a Friend opens the
   * referral screen with the reward terms and the Invite Friends action. Nothing is sent.
   */
  async verifyReferAFriendFlow() {
    if (browser.isIOS) {
      await this.openItemIOS('Invite a friend')
      await $('-ios predicate string:type == "XCUIElementTypeStaticText" AND label CONTAINS[c] "for each friend you invite"').waitForExist({ timeout: 15000, timeoutMsg: 'TC3064: the referral screen did not open' })
      await $('-ios predicate string:type IN {"XCUIElementTypeStaticText", "XCUIElementTypeButton"} AND label ==[c] "Invite friends"').waitForExist({ timeout: 10000, timeoutMsg: 'TC3064: the referral screen has no Invite Friends action' })
      await this.backToMoreIOS()
      return
    }
    await this.openItem('Invite a Friend')
    await $('//*[contains(@text,"for each friend you invite")]').waitForDisplayed({ timeout: 15000, timeoutMsg: 'TC3064: the referral screen did not open' })
    await this.text('Invite Friends').waitForDisplayed({ timeout: 10000, timeoutMsg: 'TC3064: the referral screen has no Invite Friends action' })
    await this.backToMore()
  }

  /**
   * TC2960 (Android counterpart): Approvals and Beneficiaries are business-only More rows. `business` says
   * which account is current; the rows must show on a business account and be absent on an individual one.
   */
  async verifyBusinessOnlyRows(business: boolean) {
    await this.openMore()
    if (browser.isIOS) {
      await browser.waitUntil(() => this.isRowShownIOS('Documents'), { timeout: 10000, interval: 500, timeoutMsg: 'More menu rows did not load (iOS)' })
    } else {
      await this.text('Documents').waitForDisplayed({ timeout: 10000, timeoutMsg: 'More menu rows did not load' })
    }
    for (const row of ['Approvals', 'Beneficiaries']) {
      const shown = browser.isIOS ? await this.isRowShownIOS(row) : await this.text(row).isDisplayed().catch(() => false)
      if (shown !== business) {
        throw new Error(`TC2960: the "${row}" row should be ${business ? 'shown on a business' : 'hidden on an individual'} account`)
      }
    }
    await this.closeMore()
  }

  /** Initials avatars (two capital letters) shown in the More header. */
  private async headerInitials() {
    if (browser.isIOS) {
      // iOS More header: initials avatars are two-capital texts above the first row (Moneybase Club).
      const clubY = Number(await $('//XCUIElementTypeStaticText[@name="Moneybase Club"]').getLocation('y').catch(() => 400))
      const out: string[] = []
      for (const el of await $$('//XCUIElementTypeStaticText')) {
        const t = String((await el.getAttribute('label').catch(() => '')) || '')
        if (/^[A-Z]{2}$/.test(t) && Number(await el.getLocation('y').catch(() => 9999)) < clubY) out.push(t)
      }
      return out
    }
    const texts = await $$('//*[contains(@resource-id,"more_screen")]//android.widget.TextView').map((el) => el.getText().catch(() => ''))
    return texts.filter((t) => /^[A-Z]{2}$/.test(t))
  }

  /**
   * TC2875/TC2876 (Android counterpart): the More header of a joint account lists every holder, with an
   * initials avatar each and their names joined with "&"; an individual account shows one holder only.
   */
  async verifyJointHolders(joint: boolean, minHolders = 2) {
    await this.openMore()
    await this.text('Documents').waitForDisplayed({ timeout: 10000, timeoutMsg: 'More menu rows did not load' })
    const initials = await this.headerInitials()
    const names = browser.isIOS
      ? $('//XCUIElementTypeStaticText[contains(@label," & ")]')
      : $('//*[contains(@resource-id,"more_screen")]//android.widget.TextView[contains(@text," & ")]')
    const namesShown = await names.isDisplayed().catch(() => false)
    if (joint) {
      if (initials.length < minHolders) throw new Error(`TC2876: a joint account should show ${minHolders}+ holder avatars, got [${initials.join(', ')}]`)
      if (!namesShown) throw new Error('TC2876: a joint account should show the holder names joined with "&"')
      console.log(`[More] joint holders: ${await names.getAttribute(browser.isIOS ? 'label' : 'text').catch(() => '')} [${initials.join(', ')}]`)
      // TC2878: with two holders everything fits, so there is no show-more toggle or "+N" avatar.
      const more = browser.isIOS
        ? $('-ios predicate string:type == "XCUIElementTypeStaticText" AND (label CONTAINS[c] "show more" OR label CONTAINS[c] "more names" OR label MATCHES "^[+][0-9]+$")')
        : $('//*[contains(@resource-id,"more_screen")]//*[contains(translate(@text,"SHOWMRE","showmre"),"show more") or contains(translate(@content-desc,"SHOWMRE","showmre"),"show more") or starts-with(@text,"+") or contains(@text,"more names")]')
      if (await more.isExisting().catch(() => false)) throw new Error(`TC2878: two holders should not show a "more" indicator, found "${await more.getAttribute(browser.isIOS ? 'label' : 'text').catch(() => '')}"`)
    } else {
      if (initials.length !== 1) throw new Error(`TC2875: an individual account should show one holder avatar, got [${initials.join(', ')}]`)
      if (namesShown) throw new Error('TC2875: an individual account should not list joint holder names')
    }
    await this.closeMore()
  }

  /**
   * TC2866: Call Us hands off to the phone dialer. The app is reopened afterwards; it may ask for the
   * passcode again, so this check runs last.
   */
  async verifyCallUsOpensDialer() {
    await this.openItem('Support')
    await this.text('Call Us').waitForDisplayed({ timeout: 15000, timeoutMsg: 'Support sheet has no Call Us' })
    await this.tap(this.text('Call Us'))
    let pkg = ''
    await browser.waitUntil(async () => {
      pkg = await browser.getCurrentPackage()
      return pkg !== 'com.moneybase.qa'
    }, { timeout: 15000, interval: 500, timeoutMsg: 'TC2866: Call Us did not leave the app for the dialer' })
    if (!/dialer|phone|telecom|contacts/i.test(pkg)) throw new Error(`TC2866: Call Us opened ${pkg}, not a phone dialer`)
    console.log(`[More] Call Us opened ${pkg}`)
    await browser.activateApp('com.moneybase.qa')
    await browser.pause(2000)
  }
}

export default new MoreMenuPage()
