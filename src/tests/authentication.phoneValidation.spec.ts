import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { authenticationPage } from '../pages/AuthenticationPage'
import { loginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'

describe('Authentication - Mobile number validation', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))
  const step = stopAfterFailedStep()

  before(step(async function () {
    await authenticationPage.restartToLoginScreen()
    await loginPage.selectCountry(AUTH.country)
  }))

  it('Mobile entry guard: empty number disables Continue before and after clearing', step(async function () {
    await loginPage.clearMobile()
    await loginPage.verifyMobileContinueEnabled(false)
    await loginPage.enterMobile(AUTH.phone)
    await loginPage.clearMobile()
    await loginPage.verifyMobileContinueEnabled(false)
  }))

  it('AUTH-034 [TC3164] Too-short number keeps Continue disabled', step(async function () {
    await loginPage.enterMobile('1')
    await loginPage.verifyMobileContinueEnabled(false)
  }))

  it('AUTH-033 [TC3163] Registered valid number enables Continue', step(async function () {
    await loginPage.enterMobile(AUTH.phone)
    await loginPage.verifyMobileContinueEnabled(true)
  }))

  it('AUTH-045 [TC3175] Registered number opens passcode login', step(async function () {
    await loginPage.continue()
    await authenticationPage.verifyRegisteredNumberLoginScreen()
  }))
})
