import { browser } from '@wdio/globals'
import { loginPage } from './LoginPage'
import HomeScreenPage from './HomeScreenPage'

class AppLifecyclePage {
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
