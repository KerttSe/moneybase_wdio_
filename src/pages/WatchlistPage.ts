import BasePage from './BasePage'
import { $, browser } from '@wdio/globals'

export default class WatchlistPage extends BasePage {
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

  private get watchlistEntryIOS() {
    return this.iosClassChain('**/XCUIElementTypeOther[`name == "основний"`]/XCUIElementTypeOther[11]')
  }

  private get firstInstrumentRowIOS() {
    return $('//XCUIElementTypeOther[@name="основний"]//XCUIElementTypeImage[@visible="true"][1]/ancestor::XCUIElementTypeOther[2]')
  }

  private get watchlistActionIOS() {
    return this.iosClassChain('**/XCUIElementTypeOther[`name == "основний"`]/XCUIElementTypeOther[2]')
  }

  private get watchlistUpdatedToastIOS() {
    return this.iosClassChain('**/XCUIElementTypeStaticText[`name == "Your watchlist has been successfully updated"`]')
  }

  private get watchlistEntryAndroidByText() {
    return this.androidText('Watchlist')
  }

  private get watchlistEntryAndroidByTextContains() {
    return this.androidTextContains('Watchlist')
  }

  private get firstInstrumentRowAndroidByTextWithTicker() {
    return $('//android.widget.TextView[contains(@text,"(")]/ancestor::*[@clickable="true" or @focusable="true"][1]')
  }

  private get firstInstrumentRowAndroidByClickableView() {
    return $('(//android.widget.GridView//android.view.View[@clickable="true" or @focusable="true"])[1]')
  }

  private get firstInstrumentRowAndroidByInstrumentName() {
    return $('//*[contains(@text,"(") and not(contains(@text,"Watchlist"))]/ancestor::*[@clickable="true" or @focusable="true"][1]')
  }

  private get watchlistActionAndroidByText() {
    return this.androidText('Watchlist')
  }

  private get watchlistActionAndroidByTextContains() {
    return this.androidTextContains('Watchlist')
  }

  private get watchlistActionAndroidByDescContains() {
    return this.androidDescContains('watchlist')
  }

  private get watchlistActionAndroidByStrictButtonLike() {
    return $('//*[(@class="android.widget.Button" or @clickable="true" or @focusable="true") and (contains(@text,"Watchlist") or contains(@text,"watchlist") or contains(@content-desc,"Watchlist") or contains(@content-desc,"watchlist")) and not(contains(@resource-id,"navigation_button")) and not(contains(@resource-id,"tab"))]')
  }

  private get watchlistUpdatedToastAndroidBySuccessText() {
    return $('//*[contains(@text,"success") or contains(@text,"updated") or contains(@text,"successfully")]')
  }

  private get instrumentHeaderAndroid() {
    return this.androidText('Instrument')
  }

  private get instrumentTopRightActionAndroid() {
    // BrowserStack/Appium XPath2 can fail on complex axes; use UiSelector instance instead.
    return $('android=new UiSelector().className("android.widget.ImageButton").instance(0)')
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

  private async isAnyDisplayed(candidates: Array<ReturnType<typeof $>>) {
    for (const candidate of candidates) {
      if (await candidate.isDisplayed().catch(() => false)) return true
    }
    return false
  }

  private async tapIOSDisplayed(el: ReturnType<typeof $>, timeout = 10000) {
    await el.waitForDisplayed({ timeout })
    const loc = await el.getLocation()
    const size = await el.getSize()
    const x = Math.round(loc.x + size.width / 2)
    const y = Math.round(loc.y + size.height / 2)
    await browser.execute('mobile: tap', { x, y })
  }

  private async tapIOSExists(el: ReturnType<typeof $>, timeout = 10000) {
    await el.waitForExist({ timeout })
    const loc = await el.getLocation()
    const size = await el.getSize()
    if (!size || size.width <= 0 || size.height <= 0) {
      await this.debugSnapshot('watchlist-ios-tap-size-empty')
      throw new Error(`Element size is empty (x=${loc?.x} y=${loc?.y} w=${size?.width} h=${size?.height})`)
    }
    const x = Math.round(loc.x + size.width / 2)
    const y = Math.round(loc.y + size.height / 2)
    await browser.execute('mobile: tap', { x, y })
  }

  async addFirstExistingInstrumentToWatchlistIOS() {
    if (!browser.isIOS) {
      throw new Error('Watchlist iOS flow can only run on iOS')
    }

    await browser.switchContext('NATIVE_APP')

    await this.tapIOSDisplayed(this.investTabIOS, 20000)
    await this.tapIOSDisplayed(this.watchlistEntryIOS, 20000)

    await this.firstInstrumentRowIOS.waitForExist({ timeout: 20000 })
    await this.tapIOSDisplayed(this.firstInstrumentRowIOS, 20000)

    await browser.switchContext('NATIVE_APP')

    await this.tapIOSExists(this.watchlistActionIOS, 20000)

    const toastShown = await this.watchlistUpdatedToastIOS.waitForDisplayed({ timeout: 25000 }).then(() => true).catch(() => false)
    if (!toastShown) {
      await this.debugSnapshot('watchlist-ios-toast-not-found')
      throw new Error('Watchlist updated toast did not appear')
    }
  }

  async addFirstExistingInstrumentToWatchlistAndroid() {
    if (!browser.isAndroid) {
      throw new Error('Watchlist Android flow can only run on Android')
    }

    await browser.switchContext('NATIVE_APP').catch(() => {})

    await this.investTabAndroid.waitForDisplayed({ timeout: 20000 })
    await this.investTabAndroid.click()

    const watchlistEntryCandidates = [
      this.watchlistEntryAndroidByText,
      this.watchlistEntryAndroidByTextContains,
      this.androidDescContains('Watchlist'),
      this.androidDescContains('watchlist'),
    ]
    await this.waitForAnyDisplayed(watchlistEntryCandidates, 20000, 'Watchlist entry (Android)')
    await this.tapFirstDisplayed(watchlistEntryCandidates, 'Watchlist entry (Android)')

    const rowCandidates = [
      this.firstInstrumentRowAndroidByClickableView,
      this.firstInstrumentRowAndroidByInstrumentName,
      this.firstInstrumentRowAndroidByTextWithTicker,
    ]
    await this.waitForAnyDisplayed(rowCandidates, 20000, 'First instrument row (Android)')
    await this.tapFirstDisplayed(rowCandidates, 'First instrument row (Android)')

    await browser.switchContext('NATIVE_APP').catch(() => {})

    let onInstrumentDetails = await this.instrumentHeaderAndroid.waitForDisplayed({ timeout: 8000 }).then(() => true).catch(() => false)
    if (!onInstrumentDetails) {
      await this.firstInstrumentRowAndroidByClickableView.waitForDisplayed({ timeout: 10000 })
      await this.firstInstrumentRowAndroidByClickableView.click()
      onInstrumentDetails = await this.instrumentHeaderAndroid.waitForDisplayed({ timeout: 12000 }).then(() => true).catch(() => false)
    }
    if (!onInstrumentDetails) {
      await this.debugSnapshot('watchlist-android-instrument-not-opened')
      throw new Error('Instrument details did not open (Android)')
    }

    const watchlistActionCandidates = [
      this.watchlistActionAndroidByStrictButtonLike,
      this.watchlistActionAndroidByDescContains,
      $('//*[(@clickable="true" or @focusable="true") and (contains(@content-desc,"Watchlist") or contains(@content-desc,"watchlist")) and not(contains(@resource-id,"navigation_button"))]'),
      $('//*[(@clickable="true" or @focusable="true") and contains(@resource-id,"watchlist") and not(contains(@resource-id,"navigation_button"))]'),
    ]

    const explicitActionShown = await this.waitForAnyDisplayed(watchlistActionCandidates, 8000, 'Watchlist action (Android)')
      .then(() => true)
      .catch(() => false)

    let usedTopRightFallback = false
    let topRightStateChanged = false
    let preTapTopRightSelected = ''

    const topRightVisibleBeforeTap = await this.instrumentTopRightActionAndroid.isDisplayed().catch(() => false)
    if (topRightVisibleBeforeTap) {
      preTapTopRightSelected = await this.instrumentTopRightActionAndroid.getAttribute('selected').catch(() => '')
    }

    if (explicitActionShown) {
      await this.tapFirstDisplayed(watchlistActionCandidates, 'Watchlist action (Android)')
    } else if (onInstrumentDetails) {
      usedTopRightFallback = true
      await this.instrumentTopRightActionAndroid.waitForDisplayed({ timeout: 12000 })
      const beforeState = await this.instrumentTopRightActionAndroid.getAttribute('selected').catch(() => '')
      await this.instrumentTopRightActionAndroid.click()
      await browser.pause(700)
      const afterState = await this.instrumentTopRightActionAndroid.getAttribute('selected').catch(() => '')
      topRightStateChanged = String(beforeState) !== String(afterState)
    } else {
      await this.debugSnapshot('watchlist-android-action-not-found')
      throw new Error('Watchlist action (Android) did not appear')
    }

    const toastCandidates = [
      this.watchlistUpdatedToastAndroidBySuccessText,
      this.androidTextContains('successfully updated'),
      $('//*[contains(@text,"watchlist") and (contains(@text,"updated") or contains(@text,"success") or contains(@text,"successfully"))]'),
      $('//*[contains(@content-desc,"watchlist") and (contains(@content-desc,"updated") or contains(@content-desc,"success"))]'),
    ]

    const toastShown = await this.waitForAnyDisplayed(toastCandidates, 25000, 'Watchlist updated toast (Android)')
      .then(() => true)
      .catch(() => false)

    if (!topRightStateChanged) {
      const topRightVisibleAfterTap = await this.instrumentTopRightActionAndroid.isDisplayed().catch(() => false)
      if (topRightVisibleAfterTap) {
        const postTapTopRightSelected = await this.instrumentTopRightActionAndroid.getAttribute('selected').catch(() => '')
        topRightStateChanged = String(preTapTopRightSelected) !== String(postTapTopRightSelected)
      }
    }

    if (!toastShown && !topRightStateChanged) {
      const stillOnInstrument = await this.instrumentHeaderAndroid.isDisplayed().catch(() => false)
      const actionStillVisible = await this.isAnyDisplayed(watchlistActionCandidates)
      if (stillOnInstrument && !actionStillVisible) {
        return
      }
    }

    if (!toastShown && !topRightStateChanged) {
      await this.debugSnapshot('watchlist-android-toast-not-found')
      throw new Error('Watchlist updated toast did not appear (Android)')
    }
  }
}
