import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import BankTransferP2PIndividualPage from '../pages/BankTransferP2PIndividualPage'
import { AUTH } from '../data/credentials'

describe('Bank Transfer - P2P Individual', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()

  const smokeStep = stopAfterFailedStep()

  before(smokeStep(async function () {
    await loginPage.loginFlow(AUTH)
    await BankTransferP2PIndividualPage.ensureIndividualAccount()
  }))

  if (browser.isAndroid) {
    it('P2P-1.1 Open payment screen and fill amount (Android)', smokeStep(async function () {
      await BankTransferP2PIndividualPage.prepareSmokeP2PAndroid(11)
    }))

    it('P2P-1.2 Review and slide to pay (Android)', smokeStep(async function () {
      await BankTransferP2PIndividualPage.reviewSmokeP2PAndroid(11)
    }))

    it('P2P-1.3 Submit and verify success (Android)', smokeStep(async function () {
      await BankTransferP2PIndividualPage.submitSmokeP2PAndroid(11)
    }))

    it('P2P-1.4 Verify transaction on Home (Android)', smokeStep(async function () {
      await BankTransferP2PIndividualPage.verifySmokeP2PAndroid(11)
    }))
  }

  if (browser.isIOS) {
    it('P2P-1.1 Open payment screen and fill amount (iOS)', smokeStep(async function () {
      await BankTransferP2PIndividualPage.prepareSmokeP2PIOS(11)
    }))

    it('P2P-1.2 Review and slide to pay (iOS)', smokeStep(async function () {
      await BankTransferP2PIndividualPage.reviewSmokeP2PIOS(11)
    }))

    it('P2P-1.3 Submit and verify success (iOS)', smokeStep(async function () {
      await BankTransferP2PIndividualPage.submitSmokeP2PIOS(11)
    }))

    it('P2P-1.4 Verify transaction on Home (iOS)', smokeStep(async function () {
      await BankTransferP2PIndividualPage.verifySmokeP2PIOS(11)
    }))
  }
})
