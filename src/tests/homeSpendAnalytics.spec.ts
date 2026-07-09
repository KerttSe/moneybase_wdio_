import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'
import SpendAnalyticsPage from '../pages/SpendAnalyticsPage'

describe('Home Screen - Spend Analytics', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const loginPage = new LoginPage()

  beforeEach(async function () {
    if (!browser.isAndroid) this.skip()
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureIndividualAccount()
  })

  afterEach(async function () {
    // Tests that call openDetails() leave the app on the Analytics screen —
    // back out so the next test's beforeEach starts from a predictable state.
    await SpendAnalyticsPage.closeDetailsIfOpen().catch(() => {})
  })

  it('HS-SA-1.1 Login and land on Home screen', async function () {
    await HomeScreenPage.waitForHomeLoaded()
  })

  it('HS-SA-1.2 Spend Analytics section is visible', async function () {
    await HomeScreenPage.waitForHomeLoaded()
    await HomeScreenPage.verifySpendAnalytics()
  })

  it('HS-SA-1.3 Validate current month spend', async function () {
    await HomeScreenPage.waitForHomeLoaded()
    const amount = await SpendAnalyticsPage.getCurrentAmount()
    console.log(`[TEST] Current period spend: ${amount}`)
    if (!amount) throw new Error('Current period spend amount was empty')
  })

  it('HS-SA-1.4 Validate previous month spend', async function () {
    await HomeScreenPage.waitForHomeLoaded()
    const lastMonth = await SpendAnalyticsPage.getLastMonthAmount()
    console.log(`[TEST] Last month spend: ${lastMonth}`)
    if (!lastMonth.startsWith('Last Month:')) {
      throw new Error(`Unexpected last month label: "${lastMonth}"`)
    }
  })

  it('HS-SA-1.5 Open Spend Analytics details', async function () {
    await HomeScreenPage.waitForHomeLoaded()
    await SpendAnalyticsPage.openDetails()
  })

  it('HS-SA-1.6 Validate category breakdown', async function () {
    await HomeScreenPage.waitForHomeLoaded()
    await SpendAnalyticsPage.openDetails()
    const rowCount = await SpendAnalyticsPage.verifyCategoryBreakdown()
    if (rowCount === 0) {
      console.log('[TEST] No transactions in the current period — skipping category breakdown check')
      this.skip()
    }
    console.log(`[TEST] Category breakdown rows: ${rowCount}`)
  })

  it('HS-SA-1.7 Change Spend Analytics period', async function () {
    await HomeScreenPage.waitForHomeLoaded()
    await SpendAnalyticsPage.openDetails()
    const { before, after } = await SpendAnalyticsPage.changePeriod('Monthly')
    console.log(`[TEST] Period label changed: "${before}" -> "${after}"`)
  })
})
