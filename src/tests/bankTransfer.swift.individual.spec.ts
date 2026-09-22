import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import BankTransferP2PIndividualPage from '../pages/BankTransferP2PIndividualPage'
import { AUTH } from '../data/credentials'

describe('Bank Transfer - SWIFT Individual', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()

  const smokeStep = stopAfterFailedStep()

  before(smokeStep(async function () {
    await loginPage.loginFlow(AUTH)
    await BankTransferP2PIndividualPage.ensureIndividualAccount()
  }))

  if (browser.isAndroid) {
    it('SWIFT-1.1 Open payment screen and fill amount (Android)', smokeStep(async function () {
      await BankTransferP2PIndividualPage.prepareSmokeSwiftAndroid(11)
    }))

    it('SWIFT-1.2 Submit and verify success (Android)', smokeStep(async function () {
      await BankTransferP2PIndividualPage.submitSmokeSwiftAndroid(11)
    }))

    it('SWIFT-1.3 Verify transaction on Home (Android)', smokeStep(async function () {
      await BankTransferP2PIndividualPage.verifySmokeSwiftAndroid(11)
    }))
  }

  if (browser.isIOS) {
    it('SWIFT-1.1 Open payment screen and fill amount (iOS)', smokeStep(async function () {
      await BankTransferP2PIndividualPage.prepareSmokeSwiftIOS(11)
    }))

    it('SWIFT-1.2 Submit and verify success (iOS)', smokeStep(async function () {
      await BankTransferP2PIndividualPage.submitSmokeSwiftIOS(11)
    }))

    it('SWIFT-1.3 Verify transaction on Home (iOS)', smokeStep(async function () {
      await BankTransferP2PIndividualPage.verifySmokeSwiftIOS(11)
    }))
  }
})
