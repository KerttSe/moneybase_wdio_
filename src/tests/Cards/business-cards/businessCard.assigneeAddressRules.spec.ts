import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import HomeScreenPage from '../../../pages/HomeScreenPage'
import BusinessCardPage from '../../../pages/BusinessCardPage'
import { AUTH } from '../../../data/credentials'

// Walks the business physical card assignment to the address form and leaves without submitting.
describe('Business card assignee address rules (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()

  before(async function () {
    if (!browser.isAndroid) return this.skip()
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureBusinessAccount()
    await BusinessCardPage.openCardsTab()
    await BusinessCardPage.tapAddNewCard()
    await BusinessCardPage.openCardTypeSelection()
    await BusinessCardPage.selectPhysicalCardType()
    await BusinessCardPage.selectAvailableAssignee()
    await BusinessCardPage.continueWithDefaultAssignee()
    await BusinessCardPage.orderDefaultCardDesign()
  })

  after(async function () {
    for (let i = 0; i < 5; i += 1) await browser.back().catch(() => {})
  })

  it('Assign Card needs Line 1, City and Post Code; Line 2 is optional [TC3401]', step(async function () {
    await BusinessCardPage.verifyAssigneeAddressRequiredFieldsAndroid()
  }))
})
