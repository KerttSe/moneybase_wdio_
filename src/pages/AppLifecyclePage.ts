import { $, browser } from '@wdio/globals'
import { loginPage } from './LoginPage'
import HomeScreenPage from './HomeScreenPage'
import { navTab } from '../helpers/navTab'

class AppLifecyclePage {
  async verifyWelcomeCarousel() {
    await browser.switchContext('NATIVE_APP')
    const next = $('//*[contains(@resource-id,"welcomeToMoneybase_button_next")]')
    await next.waitForDisplayed({
      timeout: 30000,
      timeoutMsg: 'Expected the Welcome carousel on the first launch of Moneybase QA',
    })
  }

  async verifyWelcomeSignInAfterAdvancing() {
    await browser.switchContext('NATIVE_APP')
    const next = browser.isIOS
      ? $('~welcomeToMoneybase_button_next')
      : $('//*[contains(@resource-id,"welcomeToMoneybase_button_next")]')
    const carousel = browser.isIOS
      ? $('~welcomeToMoneybase_screen')
      : $('//*[contains(@resource-id,"welcomeToMoneybase_screen")]')
    const progress = carousel.$('.//*[@resource-id="welcomeToMoneybase_button_progressBar"]')
    const currentSlide = async () => {
      if (browser.isIOS) {
        const titles = await carousel.$$('.//XCUIElementTypeStaticText[@label!=""]').map(title => title.getText())
        return titles.filter(Boolean).join('\n')
      }

      // Android renders the slides as animation. A completed segment's fill
      // covers its entire track, so the progress bar exposes the slide index.
      return progress.$$('.//android.view.View[@bounds = parent::*/@bounds]').length
    }
    // New iOS build: a system "Enter Password" alert can cover the first launch; cancel it (never type).
    await browser.waitUntil(async () => {
      if (browser.isIOS && await $('-ios predicate string:label BEGINSWITH "Enter Password for"').isExisting().catch(() => false)) {
        await browser.dismissAlert().catch(() => {})
      }
      return carousel.isDisplayed().catch(() => false)
    }, { timeout: 30000, interval: 1000, timeoutMsg: 'Welcome screen did not appear' })
    const iosSignIn = carousel.$('.//XCUIElementTypeButton[@label="Sign In" or @label="Sign in" or @name="welcomeToMoneybase_button_signIn" or @name="welcomeToMoneybase_button_logIn"]')
    const hasNext = await next.waitForDisplayed({ timeout: 10000 }).then(() => true).catch(() => false)
    if (!hasNext && browser.isIOS && await iosSignIn.isDisplayed().catch(() => false)) {
      // The new iOS build replaced the carousel with one welcome screen that already shows Sign in.
      console.warn('[Welcome] No carousel (single welcome screen); continuing with Sign in')
      await iosSignIn.click()
      await loginPage.mobileInput.waitForDisplayed({ timeout: 15000 })
      return
    }
    if (!hasNext) {
      const src = String(await browser.getPageSource().catch(() => ''))
      const texts = [...new Set([...src.matchAll(/ (?:name|label|text|content-desc)="([^"]{1,60})"/g)].map((m) => m[1]))]
      console.log(`[Welcome] Next missing; screen shows: ${texts.join(' | ').slice(0, 1000)}`)
      throw new Error('Welcome carousel Next did not appear')
    }
    if (browser.isAndroid) await progress.waitForExist({ timeout: 10000 })
    else await browser.waitUntil(async () => await currentSlide() !== '', { timeout: 10000 })
    const firstSlide = await currentSlide()
    await next.click()
    await browser.waitUntil(async () => {
      const secondSlide = await currentSlide()
      return secondSlide !== '' && secondSlide !== firstSlide
    }, { timeout: 5000, timeoutMsg: 'Expected the Welcome carousel to advance to a different slide' })

    const signIn = browser.isIOS
      ? carousel.$('.//XCUIElementTypeButton[@label="Sign In" or @name="welcomeToMoneybase_button_signIn" or @name="welcomeToMoneybase_button_logIn"]')
      : loginPage.welcomeLogInBtn
    await signIn.waitForDisplayed({ timeout: 10000 })
    await signIn.click()
    await loginPage.mobileInput.waitForDisplayed({ timeout: 15000 })
  }

  private requireIOS() {
    if (!browser.isIOS) throw new Error('Lifecycle grace-period contracts are currently iOS-only')
  }

  private async verifyLoginGate() {
    await browser.switchContext('NATIVE_APP')
    await loginPage.authLoginNavBar.waitForDisplayed({ timeout: 30000 })
  }

  async verifyColdLaunchRequiresLogin() {
    this.requireIOS()
    const caps = browser.capabilities as Record<string, unknown>
    const bundleId = String(caps['appium:bundleId'] || caps.bundleId || process.env.BS_IOS_BUNDLE_ID || 'com.moneybase.quality')
    await browser.terminateApp(bundleId)
    await browser.activateApp(bundleId)
    await this.verifyLoginGate()
  }

  async verifyShortBackgroundResumesHome() {
    this.requireIOS()
    await browser.background(3)
    await HomeScreenPage.waitForHomeLoaded()
    if (await loginPage.authLoginNavBar.isDisplayed()) {
      throw new Error('Re-authentication appeared within the 20-second grace period')
    }
  }

  async verifyCardsTabSurvivesBackground() {
    this.requireIOS()
    const cardsContent = () => $('-ios predicate string:name == "cards_screen" OR name == "card_item_addCard" OR name BEGINSWITH "CARDS_"')
    await navTab('Cards').click()
    await cardsContent().waitForDisplayed({ timeout: 20000 })
    if (!await navTab('Cards').isSelected()) {
      throw new Error('TC3083: Cards tab was not selected before backgrounding')
    }

    await browser.background(3)
    await browser.waitUntil(async () => {
      return await navTab('Cards').isSelected().catch(() => false)
        && await cardsContent().isDisplayed().catch(() => false)
    }, { timeout: 15000, interval: 500, timeoutMsg: 'TC3083: Cards selection and content were not retained after foregrounding' })
    if (await loginPage.authLoginNavBar.isDisplayed().catch(() => false)) {
      throw new Error('TC3083: short background unexpectedly returned to authentication')
    }
  }

  async verifyLongBackgroundRequiresLogin() {
    this.requireIOS()
    await browser.background(21)
    await this.verifyLoginGate()
  }
}

export default new AppLifecyclePage()
