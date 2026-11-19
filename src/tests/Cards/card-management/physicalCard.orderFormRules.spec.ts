import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import card from '../../../pages/PhysicalCardCreationPage'
import { AUTH } from '../../../data/credentials'

// Walks the physical card order up to Create PIN and leaves before the OTP, so no card is ordered.
describe('Physical card order form rules (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()

  before(async function () {
    if (!browser.isAndroid) return this.skip()
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
    await card.openPhysicalCardDeliveryFormAndroid()
  })

  after(async function () {
    if (browser.isAndroid) await card.abandonCardOrderAndroid().catch(() => {})
  })

  it('Confirm Address needs Line 1, City and Post Code; Line 2 is optional [TC3223]', step(async function () {
    await card.verifyDeliveryRequiredFieldsAndroid()
  }))

  it('Card PIN 0000 is blocked; 1234 and 2580 warn with a choice [TC3226, TC3227, TC3229]', step(async function () {
    await card.verifyEasyPinRulesAndroid()
  }))

  it('A different confirmation PIN shows an inline mismatch error and goes no further [TC3230]', step(async function () {
    await card.verifyConfirmPinMismatchAndroid()
  }))
})
