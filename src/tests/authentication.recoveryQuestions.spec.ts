import { getPasscodeRecoveryPhone } from '../data/credentials'
import { authenticationPage as page } from '../pages/AuthenticationPage'

describe('Passcode recovery', function () {
  it('[TC3158] Loads the security question for the registered recovery fixture', async function () {
    await page.verifyForgotPasscodeOpensSecurityQuestions(getPasscodeRecoveryPhone())
  })
})
