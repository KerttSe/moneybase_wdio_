import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'
import CardManagementPage from '../pages/CardManagementPage'

describe('Card freeze/unfreeze - Joint account', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()

  stopAfterFailedStep()

  before(async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureJointAccount()
  })

  it('CF-1.1 Freeze and unfreeze active physical card', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await CardManagementPage.freezeAndUnfreezeActiveCard()
  })
})
