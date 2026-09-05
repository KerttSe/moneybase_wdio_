import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import FXExchangePage from '../pages/FXExchangePage'

describe('FX Exchange', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const fxExchangePage = new FXExchangePage()

  stopAfterFailedStep()

  before(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('FX-1.1 Exchange EUR to USD and verify on Home', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await fxExchangePage.exchangeEurToUsdFlow()
  })
})
