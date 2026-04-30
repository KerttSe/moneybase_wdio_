import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'

export default class PortfolioPage extends BasePage {
  private iosA11y(id: string) {
    return $(`~${id}`)
  }

  private iosClassChain(chain: string) {
    return $(`-ios class chain:${chain}`)
  }

  private byIdAndroid(name: string) {
    const rx = `.*:id/${name}$|^${name}$`
    return $(`android=new UiSelector().resourceIdMatches("${rx}")`)
  }

  private androidText(text: string) {
    return $(`android=new UiSelector().text("${text}")`)
  }

  private androidTextContains(text: string) {
    return $(`android=new UiSelector().textContains("${text}")`)
  }

  private androidDescContains(text: string) {
    return $(`android=new UiSelector().descriptionContains("${text}")`)
  }

  private get investTabIOS() {
    return this.iosA11y('Invest')
  }

  private get investTabAndroid() {
    return this.byIdAndroid('navigation_button_invest')
  }

  private get portfolioEntryIOS() {
    return this.iosClassChain('**/XCUIElementTypeOther[`name == "основний"`]/XCUIElementTypeOther[8]')
  }

  private get portfolioTitleIOS() {
    return this.iosClassChain('**/XCUIElementTypeStaticText[`name == "Portfolio"`]')
  }

  private get portfolioEntryAndroidByText() {
    return this.androidText('Portfolio')
  }

  private get portfolioEntryAndroidByTextContains() {
    return this.androidTextContains('Portfolio')
  }

  private get portfolioEntryAndroidByDescContains() {
    return this.androidDescContains('portfolio')
  }

  private get portfolioEntryAndroidByIdContains() {
    return $('//*[(@clickable="true" or @focusable="true") and contains(@resource-id,"portfolio")]')
  }

  private get portfolioTitleAndroidByText() {
    return this.androidText('Portfolio')
  }

  private get portfolioTitleAndroidByTextContains() {
    return this.androidTextContains('Portfolio')
  }

  private get nextBtnIOS() {
    return this.iosA11y('NEXT')
  }

  private get nextBtnAndroidByText() {
    return this.androidText('NEXT')
  }

  private get nextBtnAndroidByTextContains() {
    return this.androidTextContains('NEXT')
  }

  private get continueBtnAndroidByText() {
    return this.androidText('CONTINUE')
  }

  private get continueBtnAndroidByTextContains() {
    return this.androidTextContains('CONTINUE')
  }

  private get simondsFarsonsBondIOS() {
    return this.iosClassChain('**/XCUIElementTypeStaticText[`name == "3.5% Simonds Farsons Cisk 2027"`]')
  }

  private get simondsFarsonsBondAndroidByTextContains() {
    return this.androidTextContains('Simonds Farsons')
  }

  private get simondsFarsonsBondAndroidRowExact() {
    return $('//android.widget.TextView[contains(@text,"3.5% Simonds Farsons Cisk 2027")]/ancestor::*[@clickable="true" or @focusable="true"][1]')
  }

  private get firstInstrumentRowAndroidFallback() {
    return $('//android.widget.TextView[contains(@text,"(")]/ancestor::*[@clickable="true" or @focusable="true"][1]')
  }

  private get buyBtnIOS() {
    return this.iosClassChain('**/XCUIElementTypeOther[`name == "основний"`]/**/XCUIElementTypeButton[`name == "Buy"`]')
  }

  private get buyBtnAndroid() {
    return $('//*[(@class="android.widget.Button" or @clickable="true" or @focusable="true") and (contains(@text,"Buy") or contains(@text,"BUY") or contains(@content-desc,"Buy") or contains(@content-desc,"buy"))]')
  }

  private get sellBtnIOS() {
    return this.iosClassChain('**/XCUIElementTypeOther[`name == "основний"`]/**/XCUIElementTypeButton[`name == "Sell"`]')
  }

  private get sellBtnAndroid() {
    return $('//*[(@class="android.widget.Button" or @clickable="true" or @focusable="true") and (contains(@text,"Sell") or contains(@text,"SELL") or contains(@content-desc,"Sell") or contains(@content-desc,"sell"))]')
  }

  private get newOrderBtnAndroid() {
    return $('//*[(@class="android.widget.Button" or @clickable="true" or @focusable="true") and (contains(@text,"Order") or contains(@text,"ORDER") or contains(@content-desc,"Order") or contains(@content-desc,"order"))]')
  }

  private async waitForAnyDisplayed(candidates: Array<ReturnType<typeof $>>, timeout = 10000, label = 'element') {
    await browser.waitUntil(
      async () => {
        for (const candidate of candidates) {
          if (await candidate.isDisplayed().catch(() => false)) return true
        }
        return false
      },
      {
        timeout,
        interval: 500,
        timeoutMsg: `${label} did not appear`,
      }
    )
  }

  private async tapFirstDisplayed(candidates: Array<ReturnType<typeof $>>, label = 'element') {
    for (const candidate of candidates) {
      const shown = await candidate.isDisplayed().catch(() => false)
      if (!shown) continue
      await candidate.click()
      return
    }

    throw new Error(`${label} did not appear`)
  }

  private async tapIOSDisplayed(el: ReturnType<typeof $>, timeout = 10000) {
    await el.waitForDisplayed({ timeout })
    const loc = await el.getLocation()
    const size = await el.getSize()
    const x = Math.round(loc.x + size.width / 2)
    const y = Math.round(loc.y + size.height / 2)
    await browser.execute('mobile: tap', { x, y })
  }

  private async ensurePortfolioOpenedIOS(timeout = 20000) {
    await browser.switchContext('NATIVE_APP')

    await this.tapIOSDisplayed(this.investTabIOS, timeout)

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      await this.tapIOSDisplayed(this.portfolioEntryIOS, timeout)

      const opened = await this.portfolioTitleIOS
        .waitForDisplayed({ timeout })
        .then(() => true)
        .catch(() => false)

      if (opened) return

      if (attempt < 2) {
        await browser.pause(600)
      }
    }

    await this.debugSnapshot('portfolio-ios-bounced-after-open')
    throw new Error('Portfolio screen did not stay open (iOS)')
  }

  private async ensureInstrumentTradeActionsVisibleIOS(timeout = 20000) {
    await browser.switchContext('NATIVE_APP')
    await this.buyBtnIOS.waitForDisplayed({ timeout })
    await this.sellBtnIOS.waitForDisplayed({ timeout })
  }

  private async ensurePortfolioOpenedAndroid(timeout = 20000) {
    await browser.switchContext('NATIVE_APP').catch(() => {})

    const portfolioEntryCandidates = [
      this.portfolioEntryAndroidByText,
      this.portfolioEntryAndroidByTextContains,
      this.portfolioEntryAndroidByDescContains,
      this.portfolioEntryAndroidByIdContains,
    ]

    const portfolioTitleCandidates = [
      this.portfolioTitleAndroidByText,
      this.portfolioTitleAndroidByTextContains,
      this.buyBtnAndroid,
      this.sellBtnAndroid,
    ]

    const alreadyOpened = await this.waitForAnyDisplayed(
      [...portfolioTitleCandidates, this.nextBtnAndroidByText, this.nextBtnAndroidByTextContains],
      3500,
      'Portfolio screen (Android)'
    )
      .then(() => true)
      .catch(() => false)

    if (alreadyOpened) return

    const investShown = await this.investTabAndroid
      .waitForDisplayed({ timeout: 7000 })
      .then(() => true)
      .catch(() => false)

    if (investShown) {
      await this.investTabAndroid.click()
    }

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      await this.waitForAnyDisplayed(portfolioEntryCandidates, timeout, 'Portfolio entry (Android)')
      await this.tapFirstDisplayed(portfolioEntryCandidates, 'Portfolio entry (Android)')

      const opened = await this.waitForAnyDisplayed(portfolioTitleCandidates, timeout, 'Portfolio screen (Android)')
        .then(() => true)
        .catch(() => false)

      if (opened) return

      if (attempt < 2) {
        await browser.pause(700)
      }
    }

    await this.debugSnapshot('portfolio-android-bounced-after-open')
    throw new Error('Portfolio screen did not stay open (Android)')
  }

  private async ensureInstrumentTradeActionsVisibleAndroid(timeout = 20000) {
    await browser.switchContext('NATIVE_APP').catch(() => {})
    await this.waitForAnyDisplayed([this.buyBtnAndroid, this.sellBtnAndroid, this.newOrderBtnAndroid], timeout, 'Instrument trade actions (Android)')
  }

  async openPortfolioFromInvestIOS() {
    if (!browser.isIOS) {
      throw new Error('Portfolio iOS flow can only run on iOS')
    }

    await this.ensurePortfolioOpenedIOS(20000)
  }

  async openPortfolioFromInvestAndroid() {
    if (!browser.isAndroid) {
      throw new Error('Portfolio Android flow can only run on Android')
    }

    await this.ensurePortfolioOpenedAndroid(20000)
  }

  async openSimondsFarsonsBondFromInvestIOS() {
    if (!browser.isIOS) {
      throw new Error('Bond iOS flow can only run on iOS')
    }

    await this.ensurePortfolioOpenedIOS(20000)

    // After Portfolio is open, the onboarding/wizard should show NEXT.
    // Wait for it; if the screen bounced again, re-open Portfolio once using the same selector.
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const nextVisible = await this.nextBtnIOS
        .waitForDisplayed({ timeout: 20000 })
        .then(() => true)
        .catch(() => false)

      if (nextVisible) break

      if (attempt < 2) {
        await this.ensurePortfolioOpenedIOS(20000)
      }
    }

    await this.tapIOSDisplayed(this.nextBtnIOS, 20000)
    await this.tapIOSDisplayed(this.nextBtnIOS, 20000)

    // Bond tap can be flaky (sometimes it doesn't navigate on first tap).
    // Tap up to 3 times using the same selector and stop early if Instrument actions appear.
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await this.tapIOSDisplayed(this.simondsFarsonsBondIOS, 20000)

      const buyVisible = await this.buyBtnIOS
        .waitForDisplayed({ timeout: 2500 })
        .then(() => true)
        .catch(() => false)

      if (buyVisible) break

      if (attempt < 3) {
        await browser.pause(400)
      }
    }

    // Instrument screen should show trade actions.
    await this.ensureInstrumentTradeActionsVisibleIOS(20000)
  }

  async openSimondsFarsonsBondFromInvestAndroid() {
    if (!browser.isAndroid) {
      throw new Error('Bond Android flow can only run on Android')
    }

    await this.ensurePortfolioOpenedAndroid(20000)

    const tutorialCandidates = [
      this.nextBtnAndroidByText,
      this.nextBtnAndroidByTextContains,
      this.continueBtnAndroidByText,
      this.continueBtnAndroidByTextContains,
    ]
    for (let step = 1; step <= 4; step += 1) {
      const tutorialShown = await this.waitForAnyDisplayed(tutorialCandidates, 4000, 'Tutorial button (Android)')
        .then(() => true)
        .catch(() => false)

      if (!tutorialShown) break

      await this.tapFirstDisplayed(tutorialCandidates, 'Tutorial button (Android)')
      await browser.pause(300)
    }

    const instrumentCandidates = [
      this.simondsFarsonsBondAndroidRowExact,
      this.simondsFarsonsBondAndroidByTextContains,
      this.firstInstrumentRowAndroidFallback,
    ]

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await this.waitForAnyDisplayed(instrumentCandidates, 20000, 'Simonds Farsons bond row (Android)')
      await this.tapFirstDisplayed(instrumentCandidates, 'Simonds Farsons bond row (Android)')

      const tradeActionsVisible = await this.ensureInstrumentTradeActionsVisibleAndroid(3000)
        .then(() => true)
        .catch(() => false)

      if (tradeActionsVisible) return

      if (attempt < 3) {
        await browser.pause(500)
      }
    }

    await this.debugSnapshot('portfolio-android-bond-open-failed')
    throw new Error('Instrument trade actions did not appear (Android)')
  }
}
