import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import FXExchangePage from '../pages/FXExchangePage'

describe('FX Exchange', function () {
  this.timeout(180000)

  const loginPage = new LoginPage()
  const fxExchangePage = new FXExchangePage()

  beforeEach(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('exchanges from EUR to Dollar wallet and verifies Exchanged to USD on home', async function () {
    await fxExchangePage.exchangeEurToUsdFlow()
  })
})
