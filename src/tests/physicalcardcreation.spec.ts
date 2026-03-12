import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import BankTransferIndividualPage from '../pages/BankTransferIndividualPage'
import PhysicalCardCreationPage from '../pages/PhysicalCardCreationPage'

describe('Physical card creation - Individual', function () {
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
      await PhysicalCardCreationPage.openCardsTabAndroid()
      await PhysicalCardCreationPage.createPhysicalCardAndroid('2468', '000000')
      return
    }

    if (browser.isIOS) {
      await PhysicalCardCreationPage.createPhysicalCardIOS('2468', '000000')
    }
  })
})
