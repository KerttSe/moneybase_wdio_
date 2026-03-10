import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import BankTransferIndividualPage from '../pages/BankTransferIndividualPage'
import VirtualCardCreationPage from '../pages/VirtualCardCreationPage'

describe('Virtual card creation - Individual', function () {
  this.timeout(240000)
  const loginPage = new LoginPage()

  beforeEach(async function () {
    await loginPage.loginFlow(AUTH)
    if (browser.isAndroid) {
      await BankTransferIndividualPage.ensureIndividualAccount()
    }
  })

  it('Create card -> success', async function () {
    if (browser.isAndroid) {
      await VirtualCardCreationPage.openCardsTabAndroid()
      await VirtualCardCreationPage.createPhysicalCardAndroid('2468', '000000')
      return
    }

    if (browser.isIOS) {
      await VirtualCardCreationPage.createPhysicalCardIOS('2468', '000000')
    }
  })
})
