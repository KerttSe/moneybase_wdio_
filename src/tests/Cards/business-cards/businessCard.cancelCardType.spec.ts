import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import page from '../../../pages/BusinessCardPage'

describe('CARD-017 [TC3404] Cancel card type picker', function () {
  it('Keeps the selected physical card type', async function () {
    await loginPage.loginFlow(AUTH)
    await home.ensureBusinessAccount()
    await page.openCardsTab()
    await page.tapAddNewCard()
    await page.verifyDismissingCardTypePreservesSelection()
  })
})
