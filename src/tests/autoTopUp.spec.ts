import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import AutoTopUpPage from '../pages/AutoTopUpPage'
import { AUTH } from '../data/credentials'

describe('Auto Top-Up', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const loginPage = new LoginPage()
  const autoTopUpPage = new AutoTopUpPage()

  before(async function () {
    await loginPage.loginFlow(AUTH)
  })

  it('create Auto Top-Up, verify, delete and verify absence', async () => {
    await autoTopUpPage.createAutoTopUpToHomeFlow({
      cardLabel: '0015',
      currency: 'Euro',
      amount: 1500,
    })

    await autoTopUpPage.verifyAndDeleteAutoTopUpFromHomeFlow({
      amount: 1500,
    })
  })
})
