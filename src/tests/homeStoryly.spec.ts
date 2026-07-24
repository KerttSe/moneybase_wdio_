import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'
import HomeStorylyPage from '../pages/HomeStorylyPage'

describe('Home Screen - Storyly widget', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const loginPage = new LoginPage()

  beforeEach(async function () {
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureIndividualAccount()
  })

  afterEach(async function () {
    await HomeStorylyPage.closeStoryViewerIfOpen()
  })

  it('HM-STORY-1.1 Login and land on Home screen', async function () {
    await HomeScreenPage.waitForHomeLoaded()
  })

  it('HM-STORY-1.2 Verify Storyly widget is visible', async function () {
    await HomeScreenPage.waitForHomeLoaded()
    await HomeStorylyPage.verifyWidgetVisible()
  })

  it('HM-STORY-1.3 Wait for Storyly widget on Home', async function () {
    await HomeScreenPage.waitForHomeLoaded()
    await HomeStorylyPage.waitForStorylyWidget()
  })

  it('HM-STORY-1.4 Verify Storyly widget position', async function () {
    await HomeScreenPage.waitForHomeLoaded()
    await HomeStorylyPage.verifyWidgetPosition()
  })

  it('HM-STORY-1.5 Verify Storyly widget does not overlap other sections', async function () {
    await HomeScreenPage.waitForHomeLoaded()
    await HomeStorylyPage.verifyNoOverlap()
  })

  it('HM-STORY-1.6 Verify Home screen layout remains stable', async function () {
    await HomeScreenPage.waitForHomeLoaded()
    await HomeStorylyPage.verifyLayoutStable()
  })

  it('HM-STORY-1.7 Verify Storyly content loads successfully', async function () {
    await HomeScreenPage.waitForHomeLoaded()
    await HomeStorylyPage.verifyContentLoaded()
  })

  it('HM-STORY-1.8 Open Storyly content', async function () {
    await HomeScreenPage.waitForHomeLoaded()
    await HomeStorylyPage.openFirstStory()
  })

  it('HM-STORY-1.9 Navigate between stories', async function () {
    await HomeScreenPage.waitForHomeLoaded()
    await HomeStorylyPage.openFirstStory()
    const { before, after } = await HomeStorylyPage.navigateToNextStory()
    console.log(`[TEST] Story position changed: "${before}" -> "${after}"`)
  })

  it('HM-STORY-1.10 Close Storyly viewer and return to Home', async function () {
    await HomeScreenPage.waitForHomeLoaded()
    await HomeStorylyPage.openFirstStory()
    await HomeStorylyPage.closeStoryViewer()
  })
})
