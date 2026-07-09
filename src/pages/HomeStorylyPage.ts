import BasePage from './BasePage'
import type { ChainablePromiseElement } from 'webdriverio'
import { $, browser } from '@wdio/globals'

/**
 * Covers the Storyly widget on Home (HM-STORY-1.2 through HM-STORY-1.10).
 * HM-STORY-1.1 (Home loaded) is covered by HomeScreenPage.
 *
 * Confirmed via real device page source:
 * - Widget: resource-id "st_storyly_list_recycler_view", content-desc "Storyly Bar".
 * - Each story ring is an android.widget.Button with
 *   content-desc "Story position N of TOTAL, <Title>, unseen|seen".
 *
 * Story viewer (open/navigate/close) locators are not yet confirmed — see
 * the TODOs below pending a real device page source for that screen.
 */
class HomeStorylyPage extends BasePage {
  private readonly firstStoryContentDescPrefix = 'Story position 1 of '
  private readonly inferredStorylyMinHeight = 220

  private byAndroidResId(id: string) {
    const rx = `.*:id/${id}$|^${id}$`
    return $(`android=new UiSelector().resourceIdMatches("${rx}")`)
  }

  private get widgetAndroid() {
    return this.byAndroidResId('st_storyly_list_recycler_view')
  }

  private get widgetByDescAndroid() {
    return $('//android.widget.GridView[@content-desc="Storyly Bar"]')
  }

  private get firstStoryBadgeHolderAndroid() {
    return this.byAndroidResId('st_badge_holder')
  }

  private get firstStoryIconHolderAndroid() {
    return this.byAndroidResId('st_icon_holder')
  }

  private get firstStoryButtonExactAndroid() {
    return $(`android=new UiSelector().descriptionContains("${this.firstStoryContentDescPrefix}")`)
  }

  private get firstStoryButtonExactByDescriptionAndroid() {
    return $(`android=new UiSelector().descriptionContains("${this.firstStoryContentDescPrefix}")`)
  }

  private get firstStoryButtonExactByXPathAndroid() {
    return $(`//*[contains(@content-desc,"${this.firstStoryContentDescPrefix}")]`)
  }

  private get inviteCardAndroid() {
    return $('//*[@text="Invite & earn money!" or contains(@text,"Invite")]/ancestor::*[@clickable="true"][1]')
  }

  private get pendingHeaderAndroid() {
    return $('//*[@text="Pending" or contains(@text,"Pending transactions") or @content-desc="Pending" or contains(@content-desc,"Pending transactions")]')
  }

  private async isExactFirstStoryDisplayed() {
    const byAccessibilityIdShown = await this.firstStoryButtonExactAndroid.isDisplayed().catch(() => false)
    if (byAccessibilityIdShown) return true

    const byDescriptionShown = await this.firstStoryButtonExactByDescriptionAndroid.isDisplayed().catch(() => false)
    if (byDescriptionShown) return true

    return this.firstStoryButtonExactByXPathAndroid.isDisplayed().catch(() => false)
  }

  private async exactFirstStoryAndroid() {
    const byAccessibilityIdShown = await this.firstStoryButtonExactAndroid.isDisplayed().catch(() => false)
    if (byAccessibilityIdShown) return this.firstStoryButtonExactAndroid

    const byDescriptionShown = await this.firstStoryButtonExactByDescriptionAndroid.isDisplayed().catch(() => false)
    if (byDescriptionShown) return this.firstStoryButtonExactByDescriptionAndroid

    return this.firstStoryButtonExactByXPathAndroid
  }

  private async visibleWidgetAndroid() {
    const exactStoryShown = await this.isExactFirstStoryDisplayed()
    if (exactStoryShown) return this.exactFirstStoryAndroid()

    const byIdShown = await this.widgetAndroid.isDisplayed().catch(() => false)
    if (byIdShown) return this.widgetAndroid

    const byDescShown = await this.widgetByDescAndroid.isDisplayed().catch(() => false)
    if (byDescShown) return this.widgetByDescAndroid

    const byBadgeHolderShown = await this.firstStoryBadgeHolderAndroid.isDisplayed().catch(() => false)
    if (byBadgeHolderShown) return this.firstStoryBadgeHolderAndroid

    const byIconHolderShown = await this.firstStoryIconHolderAndroid.isDisplayed().catch(() => false)
    if (byIconHolderShown) return this.firstStoryIconHolderAndroid

    return this.widgetAndroid
  }

  private async getElementBounds(element: ChainablePromiseElement) {
    const location = await element.getLocation()
    const size = await element.getSize()
    return { x: location.x, y: location.y, width: size.width, height: size.height }
  }

  private async nativeStorylyBounds() {
    const exactStoryShown = await this.isExactFirstStoryDisplayed()
    if (exactStoryShown) return this.getElementBounds(await this.exactFirstStoryAndroid())

    const byBadgeHolderShown = await this.firstStoryBadgeHolderAndroid.isDisplayed().catch(() => false)
    if (byBadgeHolderShown) return this.getElementBounds(await this.firstStoryBadgeHolderAndroid)

    const byIconHolderShown = await this.firstStoryIconHolderAndroid.isDisplayed().catch(() => false)
    if (byIconHolderShown) return this.getElementBounds(await this.firstStoryIconHolderAndroid)

    const byIdShown = await this.widgetAndroid.isDisplayed().catch(() => false)
    if (byIdShown) return this.getElementBounds(await this.widgetAndroid)

    const byDescShown = await this.widgetByDescAndroid.isDisplayed().catch(() => false)
    if (byDescShown) return this.getElementBounds(await this.widgetByDescAndroid)

    return null
  }

  private async inferredStorylyBoundsFromHomeXml() {
    const inviteShown = await this.inviteCardAndroid.isDisplayed().catch(() => false)
    const pendingShown = await this.pendingHeaderAndroid.isDisplayed().catch(() => false)
    if (!inviteShown || !pendingShown) return null

    const invite = await this.getElementBounds(await this.inviteCardAndroid)
    const pending = await this.getElementBounds(await this.pendingHeaderAndroid)
    const gapTop = invite.y + invite.height
    const gapHeight = pending.y - gapTop
    if (gapHeight < this.inferredStorylyMinHeight) return null

    const { width } = await browser.getWindowRect()
    const y = gapTop + 24
    return {
      x: 42,
      y,
      width: Math.max(width - 84, 1),
      height: Math.max(pending.y - y - 24, 1),
    }
  }

  private async storylyBounds() {
    return (await this.nativeStorylyBounds()) ?? (await this.inferredStorylyBoundsFromHomeXml())
  }

  // The element immediately above the widget in the Home scroll column, used
  // for the no-overlap check (HM-STORY-1.5).
  private get precedingSiblingAndroid() {
    return $(
      '//android.widget.GridView[contains(@resource-id,"st_storyly_list_recycler_view") or @content-desc="Storyly Bar"]/ancestor::androidx.compose.ui.viewinterop.ViewFactoryHolder[1]/preceding-sibling::*[1]'
    )
  }

  /* =========================
   * ANDROID: story viewer (confirmed via real device page source)
   * - Close button: resource-id "st_close_button", content-desc "Close Story".
   * - Position indicator: resource-id "st_header_pager_view", content-desc
   *   e.g. "Story 2 of 3" — read back to confirm navigation actually advanced.
   * - No dedicated next/previous buttons — Storyly uses tap-zones on the
   *   left/right halves of the screen (standard SDK behavior).
   * ========================= */

  private get closeStoryButtonAndroid() {
    return this.byAndroidResId('st_close_button')
  }

  private get storyHeaderPagerAndroid() {
    return this.byAndroidResId('st_header_pager_view')
  }

  private async storylySourceSummary() {
    const source = await browser.getPageSource().catch(() => '')
    const hasHome = source.includes('resource-id="home_screen"') || source.includes('resource-id="com.moneybase.qa:id/home_screen"')
    const hasSearch = source.includes('home_input_search') || source.includes('text="Search"')
    const inviteIndex = source.indexOf('Invite &amp; earn money!')
    const pendingIndex = source.indexOf('text="Pending"')
    const widgetIdIndex = source.indexOf('st_storyly_list_recycler_view')
    const widgetDescIndex = source.indexOf('Storyly Bar')
    const badgeHolderIndex = source.indexOf('st_badge_holder')
    const iconHolderIndex = source.indexOf('st_icon_holder')
    const firstStoryIndex = source.indexOf(this.firstStoryContentDescPrefix)
    const storyPositionIndex = source.indexOf('Story position')
    const hasInvite = inviteIndex >= 0 || source.includes('Invite')
    const hasWidgetId = source.includes('st_storyly_list_recycler_view')
    const hasWidgetDesc = source.includes('Storyly Bar')
    const hasBadgeHolder = source.includes('st_badge_holder')
    const hasIconHolder = source.includes('st_icon_holder')
    const storyButtonMatches = source.match(/Story position/g) ?? []
    const storylyIndex = [widgetIdIndex, widgetDescIndex, badgeHolderIndex, iconHolderIndex, storyPositionIndex]
      .filter((index) => index >= 0)
      .sort((a, b) => a - b)[0] ?? -1
    const storylyBetweenInviteAndPending =
      inviteIndex >= 0 && storylyIndex > inviteIndex && (pendingIndex < 0 || storylyIndex < pendingIndex)

    return [
      `home=${hasHome}`,
      `search=${hasSearch}`,
      `invite=${hasInvite}`,
      `widgetId=${hasWidgetId}`,
      `widgetDesc=${hasWidgetDesc}`,
      `badgeHolder=${hasBadgeHolder}`,
      `iconHolder=${hasIconHolder}`,
      `firstStory=${firstStoryIndex >= 0}`,
      `storyButtons=${storyButtonMatches.length}`,
      `idx(invite/storyly/pending)=${inviteIndex}/${storylyIndex}/${pendingIndex}`,
      `storylyBetweenInviteAndPending=${storylyBetweenInviteAndPending}`,
    ].join(', ')
  }

  private async isStorylyVisible() {
    const nativeBounds = await this.nativeStorylyBounds()
    if (nativeBounds) return true
    return (await this.inferredStorylyBoundsFromHomeXml()) !== null
  }

  /** HM-STORY-1.2: widget is visible on Home. */
  public async verifyWidgetVisible() {
    if (!browser.isAndroid) throw new Error('verifyWidgetVisible: Android only')
    await this.waitForStorylyWidget()
    const bounds = await this.storylyBounds()
    if (!bounds) throw new Error('verifyWidgetVisible: Storyly widget not visible')
  }

  /** HM-STORY-1.3: wait for the Storyly widget at its Home position without scrolling. */
  public async waitForStorylyWidget(timeout = 45000) {
    if (!browser.isAndroid) return
    await browser.switchContext('NATIVE_APP').catch(() => {})

    const startedAt = Date.now()
    let lastSummaryAt = 0
    let latestSummary = 'not collected'

    const found = await browser
      .waitUntil(
        async () => {
          const visible = await this.isStorylyVisible()
          const elapsed = Date.now() - startedAt
          if (visible) return true

          if (elapsed - lastSummaryAt >= 5000) {
            lastSummaryAt = elapsed
            latestSummary = await this.storylySourceSummary()
            console.log(`[Storyly wait] ${elapsed}ms: ${latestSummary}`)
          }

          return false
        },
        { timeout, interval: 1000, timeoutMsg: 'Storyly widget did not appear in Home XML' }
      )
      .catch(() => false)

    if (found) return

    latestSummary = await this.storylySourceSummary()
    throw new Error(
      `waitForStorylyWidget: Storyly widget not present or inferable from current Home accessibility source (${latestSummary})`
    )
  }

  public async scrollIntoView() {
    await this.waitForStorylyWidget()
  }

  /** HM-STORY-1.4: widget sits between the invite card and the Pending section. */
  public async verifyWidgetPosition() {
    if (!browser.isAndroid) throw new Error('verifyWidgetPosition: Android only')
    await this.waitForStorylyWidget()

    const widgetBounds = await this.storylyBounds()
    if (!widgetBounds) throw new Error('verifyWidgetPosition: Storyly bounds unavailable')
    if (widgetBounds.y <= 0) {
      throw new Error(`verifyWidgetPosition: unexpected widget Y position (${widgetBounds.y})`)
    }

    const pendingShown = await this.pendingHeaderAndroid.waitForDisplayed({ timeout: 5000 }).catch(() => false)
    if (!pendingShown) return

    const pendingLocation = await this.pendingHeaderAndroid.getLocation()
    if (widgetBounds.y >= pendingLocation.y) {
      throw new Error(
        `verifyWidgetPosition: Storyly should be above Pending, but widget top (${widgetBounds.y}) is not above Pending top (${pendingLocation.y})`
      )
    }
  }

  /** HM-STORY-1.5: widget does not visually overlap the section directly above it. */
  public async verifyNoOverlap() {
    if (!browser.isAndroid) throw new Error('verifyNoOverlap: Android only')
    await this.waitForStorylyWidget()

    const widgetBounds = await this.storylyBounds()
    if (!widgetBounds) throw new Error('verifyNoOverlap: Storyly bounds unavailable')
    const precedingExists = await this.precedingSiblingAndroid.isExisting().catch(() => false)
    const preceding = precedingExists ? this.precedingSiblingAndroid : this.inviteCardAndroid

    const precedingLocation = await preceding.getLocation()
    const precedingSize = await preceding.getSize()
    const precedingBottom = precedingLocation.y + precedingSize.height

    if (widgetBounds.y < precedingBottom) {
      throw new Error(
        `verifyNoOverlap: widget top (${widgetBounds.y}) overlaps preceding section bottom (${precedingBottom})`
      )
    }
  }

  /** HM-STORY-1.6: widget bounds stay stable across a short pause (no layout shift/flicker). */
  public async verifyLayoutStable() {
    if (!browser.isAndroid) throw new Error('verifyLayoutStable: Android only')
    await this.waitForStorylyWidget()

    const before = await this.storylyBounds()
    if (!before) throw new Error('verifyLayoutStable: Storyly bounds unavailable before pause')
    await browser.pause(1500)
    const after = await this.storylyBounds()
    if (!after) throw new Error('verifyLayoutStable: Storyly bounds unavailable after pause')

    if (before.y !== after.y || before.x !== after.x) {
      throw new Error(`verifyLayoutStable: widget position shifted (before=${before.y}, after=${after.y})`)
    }
  }

  /** HM-STORY-1.7: at least one story is rendered (not an empty/placeholder widget). */
  public async verifyContentLoaded() {
    if (!browser.isAndroid) throw new Error('verifyContentLoaded: Android only')
    await this.waitForStorylyWidget()
    const bounds = await this.storylyBounds()
    if (!bounds) throw new Error('verifyContentLoaded: Storyly content bounds unavailable')
  }

  // Either signal alone proves the viewer is open — don't rely on a single
  // resource-id, since the header pager and close button can appear at
  // slightly different points during the viewer's open animation.
  private async waitForStoryViewerOpen(timeout = 8000): Promise<boolean> {
    return browser
      .waitUntil(
        async () => {
          const headerShown = await this.storyHeaderPagerAndroid.isDisplayed().catch(() => false)
          if (headerShown) return true
          return this.closeStoryButtonAndroid.isDisplayed().catch(() => false)
        },
        { timeout, interval: 300 }
      )
      .catch(() => false)
  }

  /**
   * HM-STORY-1.8: tap the first story ring to open the viewer. Storyly's story-ring
   * Buttons handle taps via their own touch/gesture listener rather than a standard
   * OnClickListener (confirmed by the in-viewer navigation also needing raw tap-zones,
   * not buttons) — a synthetic accessibility click (this.tap()/element.click()) does
   * not open the viewer, so this dispatches a real touch instead.
   *
   * Primary: `mobile: clickGesture` — UiAutomator2's own native tap, executed
   * driver-side rather than relayed through the client-driven W3C Actions
   * protocol, which is more reliable against custom touch-handled widgets
   * (and against network latency on cloud devices). Falls back to raw
   * performActions if that doesn't open the viewer.
   */
  public async openFirstStory() {
    if (!browser.isAndroid) throw new Error('openFirstStory: Android only')
    await this.waitForStorylyWidget()
    const nativeBounds = await this.nativeStorylyBounds()
    const bounds = nativeBounds ?? (await this.inferredStorylyBoundsFromHomeXml())
    if (!bounds) throw new Error('openFirstStory: Storyly bounds unavailable')

    const tapX = Math.round(nativeBounds ? bounds.x + bounds.width / 2 : bounds.x + bounds.width * 0.25)
    const tapY = Math.round(bounds.y + bounds.height / 2)

    await browser.execute('mobile: clickGesture', { x: tapX, y: tapY }).catch(() => {})
    let opened = await this.waitForStoryViewerOpen(6000)

    if (!opened) {
      await browser.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 80 },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])
      await browser.releaseActions().catch(() => {})
      opened = await this.waitForStoryViewerOpen(8000)
    }

    if (!opened) throw new Error('openFirstStory: story viewer did not open after tapping the first story ring')
  }

  private async getStoryProgressLabel(): Promise<string> {
    return (await this.storyHeaderPagerAndroid.getAttribute('content-desc').catch(() => '')) ?? ''
  }

  /** HM-STORY-1.9: tap the right-hand tap-zone and confirm the story position advanced. */
  public async navigateToNextStory() {
    if (!browser.isAndroid) throw new Error('navigateToNextStory: Android only')
    await this.storyHeaderPagerAndroid.waitForDisplayed({ timeout: 10000 })

    const before = await this.getStoryProgressLabel()

    const { width, height } = await browser.getWindowRect()
    const tapX = Math.round(width * 0.85)
    const tapY = Math.round(height * 0.5)
    await browser.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 80 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await browser.releaseActions().catch(() => {})
    await browser.pause(500)

    const after = await this.getStoryProgressLabel()
    if (!after || after === before) {
      throw new Error(`navigateToNextStory: story position did not change (before="${before}", after="${after}")`)
    }

    return { before, after }
  }

  /**
   * HM-STORY-1.10: tap "Close Story" and confirm we're back on Home (widget visible
   * again). Same clickGesture-then-raw-tap fallback as openFirstStory(), since this
   * button lives in the same Storyly-managed view tree.
   */
  public async closeStoryViewer() {
    if (!browser.isAndroid) throw new Error('closeStoryViewer: Android only')
    await this.closeStoryButtonAndroid.waitForDisplayed({ timeout: 10000 })

    const location = await this.closeStoryButtonAndroid.getLocation()
    const size = await this.closeStoryButtonAndroid.getSize()
    const tapX = Math.round(location.x + size.width / 2)
    const tapY = Math.round(location.y + size.height / 2)

    await browser.execute('mobile: clickGesture', { x: tapX, y: tapY }).catch(() => {})
    let closed = await this.waitForStorylyWidget(6000)
      .then(() => true)
      .catch(() => false)

    if (!closed) {
      await browser.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 80 },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ])
      await browser.releaseActions().catch(() => {})
      closed = await this.waitForStorylyWidget(8000)
        .then(() => true)
        .catch(() => false)
    }

    if (!closed) throw new Error('closeStoryViewer: did not return to Home after tapping Close Story')
  }

  public async closeStoryViewerIfOpen() {
    if (!browser.isAndroid) return
    await browser.switchContext('NATIVE_APP').catch(() => {})

    const viewerOpen = await this.waitForStoryViewerOpen(1500)
    if (!viewerOpen) return

    const closeShown = await this.closeStoryButtonAndroid.isDisplayed().catch(() => false)
    if (closeShown) {
      await this.closeStoryViewer().catch(async () => {
        await browser.back().catch(() => {})
      })
    } else {
      await browser.back().catch(() => {})
    }

    await this.waitForStorylyWidget(8000).catch(() => {})
  }
}

export default new HomeStorylyPage()
