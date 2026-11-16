import { loginPage } from '../../../pages/LoginPage'
import page from '../../../pages/BusinessCardWalletPage'
import { BH_AUTH } from '../../../data/credentials'

describe('WALLET-017 [TC2926] Cancel wallet creation', function () {
  it('Closes the wallet form and returns to the picker', async function () {
    const phone = BH_AUTH.phone
    await loginPage.loginFlow({
      country: BH_AUTH.country,
      phone,
      pin: BH_AUTH.pin,
    })
    await page.openWalletCreationFromAdministration()
    await page.enterWalletName('QA Cancel Wallet')
    await page.cancelWalletCreation()
  })
})
