import { loginPage } from '../../../pages/LoginPage'
import page from '../../../pages/BusinessCardWalletPage'

describe('WALLET-013 [TC2922] Business wallet name', function () {
  it('Disables Add until a name is entered', async function () {
    const phone = process.env.BH_MB_PHONE
    if (!phone) throw new Error('BH_MB_PHONE is required for the business wallet fixture')

    await loginPage.loginFlow({
      country: process.env.BH_MB_COUNTRY || 'Malta',
      phone,
      pin: process.env.BH_MB_PIN || '2468',
    })
    await page.openWalletCreationFromAdministration()

    await page.verifyWalletAddEnabled(false)
    await page.enterWalletName('QA Wallet')
    await page.verifyWalletAddEnabled(true)
  })
})
