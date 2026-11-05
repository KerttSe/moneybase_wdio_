import { $, browser } from '@wdio/globals'
import { loginPage } from './LoginPage'
import HomeScreenPage from './HomeScreenPage'

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
    await carousel.waitForDisplayed({ timeout: 30000 })
    await next.waitForDisplayed({ timeout: 10000 })
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

  async verifyLongBackgroundRequiresLogin() {
    this.requireIOS()
    await browser.background(21)
    await this.verifyLoginGate()
  }
}

export default new AppLifecyclePage()
