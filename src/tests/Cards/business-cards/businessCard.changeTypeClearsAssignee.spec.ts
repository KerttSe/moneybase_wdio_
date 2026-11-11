import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'
import page from '../../../pages/BusinessCardPage'

describe('CARD-013 [TC3400] Change assigned card type', function () {
  it('Warns and clears the selected assignee', async function () {
    await loginPage.loginFlow(AUTH)
    await home.ensureBusinessAccount()
    await page.openCardsTab()
    await page.tapAddNewCard()
    await page.verifyChangingCardTypeClearsAssignee()
  })
})
