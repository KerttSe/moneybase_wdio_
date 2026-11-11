import { loginPage } from '../../../pages/LoginPage'
import page from '../../../pages/BusinessCardWalletPage'

describe('WALLET-017 [TC2926] Cancel wallet creation', function () {
  it('Closes the wallet form and returns to the picker', async function () {
    const phone = process.env.BH_MB_PHONE
    if (!phone) throw new Error('BH_MB_PHONE is required for the business wallet fixture')
    await loginPage.loginFlow({
      country: process.env.BH_MB_COUNTRY || 'Malta',
      phone,
      pin: process.env.BH_MB_PIN || '2468',
    })
    await page.openWalletCreationFromAdministration()
    await page.enterWalletName('QA Cancel Wallet')
    await page.cancelWalletCreation()
  })
})
