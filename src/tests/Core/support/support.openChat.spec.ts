import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'

describe('SUPPORT-004 [TC2859] Open Support chat', function () {
  it('Opens the signed-in Conversations screen', async function () {
    await loginPage.loginFlow(AUTH)
    await home.verifySupportOpensChat()
  })
})
