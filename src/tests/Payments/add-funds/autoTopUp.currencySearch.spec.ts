import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import AutoTopUpPage from '../../../pages/AutoTopUpPage'
import { AUTH } from '../../../data/credentials'

// iOS only: Android shows the search field regardless of the currency count. Opens the picker and closes it;
// nothing is saved. POP (3 currencies) covers the hidden branch, VEG (13) the shown branch.
describe('Auto Top-Up currency search threshold (iOS)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()
  const page = new AutoTopUpPage()

  before(async function () {
    if (!browser.isIOS) return this.skip()
    await loginPage.loginFlow(AUTH)
    await page.openFromHome()
    await page.goToAutoTopUpList()
    await page.tapAddNew()
  })

  it('The currency search appears only with more than 10 currencies [TC3351]', step(async function () {
    await page.verifyCurrencySearchThresholdIOS()
  }))
})
