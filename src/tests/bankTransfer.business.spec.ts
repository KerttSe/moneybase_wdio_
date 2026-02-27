import { LoginPage } from '../pages/LoginPage'
import BankTransferBusinessPage from '../pages/BankTransferBusinessPage'
import { AUTH } from '../data/credentials'

describe('Bank Transfer - Business', () => {

  const loginPage = new LoginPage()

  beforeEach(async () => {
    await loginPage.loginFlow(AUTH)
  })

  it('User can open Pay tab in Business context', async () => {
    await BankTransferBusinessPage.openPayFromHomeEnsuringBusiness()
  })

})
