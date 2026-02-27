import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'

describe('Matrix - Smoke', () => {
  const loginPage = new LoginPage()

  it('Login flow -> Home Screen Verification', async () => {
    await loginPage.loginFlow(AUTH)
  })
})
