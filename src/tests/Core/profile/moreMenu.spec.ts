import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import more from '../../../pages/MoreMenuPage'
import { AUTH } from '../../../data/credentials'

// Read-only checks on the More menu of an individual account. Call Us leaves the app, so it runs last.
describe('More menu', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()

  before(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
  })

  it('More has no Fixed Deposits row [TC2959]', step(async function () {
    await more.verifyNoFixedDepositsRow()
  }))

  it('Documents lists the identity and proof of address documents with their status [TC2982]', step(async function () {
    // iOS screens for this step are not mapped yet; only TC2959 runs on iOS.
    if (browser.isIOS) return this.skip()
    await more.verifyDocumentsList()
  }))

  it('Explore Moneybase Club Benefits opens the tier carousel on the current tier [TC2992]', step(async function () {
    // iOS screens for this step are not mapped yet; only TC2959 runs on iOS.
    if (browser.isIOS) return this.skip()
    await more.verifyClubBenefitsCarousel(process.env.MB_TIER || 'Starter')
  }))

  it('Settings shows the fingerprint sign-in row on a fingerprint device [TC2971]', step(async function () {
    // iOS screens for this step are not mapped yet; only TC2959 runs on iOS.
    if (browser.isIOS) return this.skip()
    await more.verifyFingerprintRow()
  }))

  it('Invite a Friend opens the referral screen with its reward terms [TC3064]', step(async function () {
    // iOS screens for this step are not mapped yet; only TC2959 runs on iOS.
    if (browser.isIOS) return this.skip()
    await more.verifyReferAFriendFlow()
  }))

  it('Support > Call Us opens the phone dialer [TC2866]', step(async function () {
    // iOS screens for this step are not mapped yet; only TC2959 runs on iOS.
    if (browser.isIOS) return this.skip()
    await more.verifyCallUsOpensDialer()
  }))
})
