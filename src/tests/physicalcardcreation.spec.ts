import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import BankTransferP2PIndividualPage from '../pages/BankTransferP2PIndividualPage'
import PhysicalCardCreationPage from '../pages/PhysicalCardCreationPage'

describe('Physical card creation - Individual', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 800000))
  const loginPage = new LoginPage()
  const cardCreationAuth = {
    ...AUTH,
    phone: process.env.PHYSICAL_CARD_MB_PHONE || AUTH.phone,
    pin: process.env.PHYSICAL_CARD_MB_PIN || AUTH.pin,
  }
  const useApiLoginOtp = ['1', 'true', 'yes', 'on'].includes(
    String(process.env.PHYSICAL_CARD_LOGIN_USE_API_OTP || '').toLowerCase(),
  )

  beforeEach(async function () {
    await loginPage.loginFlow(cardCreationAuth, {
      useApiOtp: useApiLoginOtp,
      otpPhone: process.env.PHYSICAL_CARD_OTP_PHONE,
    })
    if (browser.isAndroid) {
      await BankTransferP2PIndividualPage.ensureIndividualAccount()
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
