import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'
import PricePlanPage from '../pages/PricePlanPage'

/**
 * Sequential checkpoints in ONE continuous session (login runs once in `before`,
 * not per test) — each step continues from where the previous one left off:
 * open More once, open Price Plan once, then verify fee/billing/benefits on
 * that same already-loaded screen.
 */
describe('My Price Plan', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const loginPage = new LoginPage()

  before(async function () {
    await loginPage.loginFlow(AUTH)
    if (browser.isAndroid || browser.isIOS) {
      await HomeScreenPage.ensureIndividualAccount()
    }
  })

  it('MPP-1.1 Login and land on Home screen', async function () {
    await HomeScreenPage.waitForHomeLoaded()
  })

  it('MPP-1.2 Open More tab', async function () {
    await PricePlanPage.openMoreTab()
  })

  it('MPP-1.3 Select Price Plan option', async function () {
    await PricePlanPage.openPricePlanScreen()
  })

  it('MPP-1.4 Verify Price Plan page loads successfully', async function () {
    await PricePlanPage.verifyScreenLoaded()
  })

  it('MPP-1.6 Verify plan fee displayed', async function () {
    const fee = await PricePlanPage.getPlanFee()
    console.log(`[TEST] Plan fee: ${fee}`)
    if (!fee) throw new Error('Plan fee was empty')
  })

  it('MPP-1.9 Verify included benefits displayed', async function () {
    const count = await PricePlanPage.verifyBenefitsDisplayed()
    console.log(`[TEST] Benefit rows: ${count}`)
  })
})
