import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import BankTransferIndividualPage from '../pages/BankTransferIndividualPage'
import VirtualCardCreationPage from '../pages/VirtualCardCreationPage'

describe('Virtual card creation - Individual', () => {
  const loginPage = new LoginPage()

  beforeEach(async function () {
    await loginPage.loginFlow(AUTH)
    await BankTransferIndividualPage.ensureIndividualAccount()
  })

  it('Create virtual card -> success', async function () {
    if (!browser.isAndroid) this.skip()

    await VirtualCardCreationPage.openCardsTabAndroid()
    await VirtualCardCreationPage.createVirtualCardAndroid('2468', '000000')
  })
})
