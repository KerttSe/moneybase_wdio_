import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'
import PhysicalCardCreationPage from '../pages/PhysicalCardCreationPage'

describe('Card freeze/unfreeze - Joint account', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()

  beforeEach(async function () {
    if (!(browser.isAndroid || browser.isIOS)) this.skip()

    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureJointAccount()
  })

  it('freezes and unfreezes an active physical card', async function () {
    if (browser.isAndroid) {
      await PhysicalCardCreationPage.freezeAndUnfreezeActivePhysicalCardAndroid()
      return
    }

    await PhysicalCardCreationPage.freezeAndUnfreezeActivePhysicalCardIOS()
  })
})
