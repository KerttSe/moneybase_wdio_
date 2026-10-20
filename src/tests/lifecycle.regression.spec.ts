import { browser } from '@wdio/globals'
import { loginPage } from '../pages/LoginPage'
import HomeScreenPage from '../pages/HomeScreenPage'
import AppLifecyclePage from '../pages/AppLifecyclePage'
import { AUTH } from '../data/credentials'

describe('App lifecycle - iOS authentication gates', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))

  beforeEach(async function () {
    if (!browser.isIOS) return this.skip()
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.waitForHomeLoaded()
  })

  it('LAUNCH-003/004/011 [TC2847/TC2848/TC2855] Cold launch restores the passcode gate, not Dashboard', async function () {
    await AppLifecyclePage.verifyColdLaunchRequiresLogin()
  })

  it('LAUNCH-005 [TC2849] Three-second background resumes Home without re-authentication', async function () {
    await AppLifecyclePage.verifyShortBackgroundResumesHome()
  })

  it('LAUNCH-006 [TC2850] Background beyond twenty seconds requires re-authentication', async function () {
    await AppLifecyclePage.verifyLongBackgroundRequiresLogin()
  })
})
