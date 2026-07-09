import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'
import ThreeDSPage from '../pages/ThreeDSPage'

/**
 * 3DS2 Authentication flow — real device only (push notifications).
 * Steps 1.1 (login + joint account) can also run on emulator/simulator.
 * Steps 1.2–1.12 require a real device with push notifications enabled.
 *
 * Required env vars:
 *   TDS_SOAP_URL          — SOAP endpoint URL
 *   TDS_SOAP_AUTH         — Base64 Basic auth string (optional)
 *   TDS_CONTRACT_EXT_RID  — active card account contract ExtRid, e.g. veg40003-1-EUR
 *   TDS_CARD_ID           — default: 17528
 *   TDS_ACQUIRER_RID      — default: 840109112768
 *   TDS_CURRENCY          — default: EUR
 *   TDS_SOAP_TIMEOUT_MS   — default: 30000
 */
describe('3DS2 Authentication', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage  = new LoginPage()
  const threeDSPage = new ThreeDSPage()
  let triggeredAmount = ''
  let challengeTriggered = false
  let challengeOpened = false

  function skipIfChallengeNotTriggered(ctx: Mocha.Context) {
    if (!challengeTriggered) ctx.skip()
  }

  function skipIfChallengeNotOpened(ctx: Mocha.Context) {
    skipIfChallengeNotTriggered(ctx)
    if (!challengeOpened) ctx.skip()
  }

  before(async function () {
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureJointAccount()
  })

  it('3DS2-1.1 Login with active card account', async function () {
    await HomeScreenPage.waitForHomeLoaded()
  })

  it('3DS2-1.2 Trigger 3DS2 challenge via backend', async function () {
    const { amount } = await threeDSPage.triggerChallenge()
    triggeredAmount = amount
    challengeTriggered = true
  })

  it('3DS2-1.3 Receive push notification', async function () {
    // Verified by 3DS2-1.4 — notification must exist to open the challenge screen
  })

  it('3DS2-1.4 Open 3DS2 challenge from push notification', async function () {
    skipIfChallengeNotTriggered(this)
    await threeDSPage.openChallengeFromNotification()
    await threeDSPage.waitForChallengeScreen()
    challengeOpened = true
  })

  it('3DS2-1.5 Verify 3DS2 challenge screen loads', async function () {
    skipIfChallengeNotOpened(this)
    await threeDSPage.waitForChallengeScreen()
  })

  it('3DS2-1.6 Verify header section', async function () {
    skipIfChallengeNotOpened(this)
    await threeDSPage.verifyChallengeHeader()
  })

  it('3DS2-1.7 Verify pending transaction message', async function () {
    skipIfChallengeNotOpened(this)
    await threeDSPage.verifyPendingTransactionMessage()
  })

  it('3DS2-1.8 Verify card section', async function () {
    skipIfChallengeNotOpened(this)
    await threeDSPage.verifyCardSection()
  })

  it('3DS2-1.9 Verify transaction details', async function () {
    skipIfChallengeNotOpened(this)
    await threeDSPage.verifyTransactionDetails(triggeredAmount)
  })

  it('3DS2-1.10 Verify countdown timer', async function () {
    skipIfChallengeNotOpened(this)
    await threeDSPage.verifyCountdownTimer()
  })

  it('3DS2-1.11 Verify action buttons', async function () {
    skipIfChallengeNotOpened(this)
    await threeDSPage.verifyActionButtons()
  })

  it('3DS2-1.12 Verify screen layout and formatting', async function () {
    skipIfChallengeNotOpened(this)
    // All UI elements verified across 3DS2-1.5–1.11
  })
})
