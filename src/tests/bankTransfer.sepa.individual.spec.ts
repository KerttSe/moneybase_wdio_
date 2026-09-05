import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import BankTransferSepaIndividualPage from '../pages/BankTransferSepaIndividualPage'
import { AUTH } from '../data/credentials'

describe('Bank Transfer - SEPA Individual', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()

  stopAfterFailedStep()

  before(async function () {
    await loginPage.loginFlow(AUTH)
    await BankTransferSepaIndividualPage.ensureIndividualAccount()
  })

  if (browser.isAndroid) {
    it('SEPA-1.1 Open payment screen and fill amount (Android)', async function () {
      await BankTransferSepaIndividualPage.prepareSmokeSepaAndroid(11)
    })

    it('SEPA-1.2 Review and slide to pay (Android)', async function () {
      await BankTransferSepaIndividualPage.submitSmokeSepaAndroid(11)
    })

    it('SEPA-1.3 Verify transaction on Home (Android)', async function () {
      await BankTransferSepaIndividualPage.verifySmokeSepaAndroid(11)
    })
  }

  if (browser.isIOS) {
    it('SEPA-1.1 Open payment screen and fill amount (iOS)', async function () {
      await BankTransferSepaIndividualPage.prepareSmokeSepaIOS(11)
    })

    it('SEPA-1.2 Review and slide to pay (iOS)', async function () {
      await BankTransferSepaIndividualPage.submitSmokeSepaIOS(11)
    })

    it('SEPA-1.3 Verify transaction on Home (iOS)', async function () {
      await BankTransferSepaIndividualPage.verifySmokeSepaIOS(11)
    })
  }
})
