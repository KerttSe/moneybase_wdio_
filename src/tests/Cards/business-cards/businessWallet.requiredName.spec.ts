import { loginPage } from '../../../pages/LoginPage'
import page from '../../../pages/BusinessCardWalletPage'
import { BH_AUTH } from '../../../data/credentials'

describe('WALLET-013 [TC2922] Business wallet name', function () {
  it('Disables Add until a name is entered', async function () {
    const phone = BH_AUTH.phone

    await loginPage.loginFlow({
      country: BH_AUTH.country,
      phone,
      pin: BH_AUTH.pin,
    })
    await page.openWalletCreationFromAdministration()

    await page.verifyWalletAddEnabled(false)
    await page.enterWalletName('QA Wallet')
    await page.verifyWalletAddEnabled(true)
  })
})
