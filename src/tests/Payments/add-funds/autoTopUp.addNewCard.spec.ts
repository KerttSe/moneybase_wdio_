import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import AutoTopUpPage from '../../../pages/AutoTopUpPage'
import { AUTH } from '../../../data/credentials'

// Opens Add New Card in the Auto Top-Up card picker and closes the deposit sheet; nothing is saved or deposited.
describe('Auto Top-Up Add New Card (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()
  const page = new AutoTopUpPage()

  before(async function () {
    if (!browser.isAndroid) return this.skip()
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
    await page.openFromHome()
    await page.goToAutoTopUpList()
    await page.tapAddNew()
  })

  after(async function () {
    if (browser.isAndroid) await page.leaveToHomeAndroid().catch(() => {})
  })

  it('Add New Card asks for a deposit by card first and says the card is usable after 30 days [TC3350]', step(async function () {
    await page.verifyAddNewCardNeedsDepositAndroid()
  }))
})
