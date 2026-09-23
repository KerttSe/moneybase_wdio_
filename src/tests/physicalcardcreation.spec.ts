import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import BankTransferP2PIndividualPage from '../pages/BankTransferP2PIndividualPage'
import PhysicalCardCreationPage from '../pages/PhysicalCardCreationPage'

describe('Physical card creation, freezing and deletion - Individual', function () {
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

  const smokeStep = stopAfterFailedStep()

  before(smokeStep(async function () {
    await loginPage.loginFlow(cardCreationAuth, {
      useApiOtp: useApiLoginOtp,
      otpPhone: process.env.PHYSICAL_CARD_OTP_PHONE,
    })
    if (browser.isAndroid) {
      await PhysicalCardCreationPage.dismissGooglePayPromoAndroid()
      await BankTransferP2PIndividualPage.ensureIndividualAccount()
    }
  }))

  if (browser.isAndroid) {
    it('PC-1.1 Open Cards tab (Android)', smokeStep(async function () {
      await PhysicalCardCreationPage.openCardsTabAndroid()
    }))

    it('PC-1.2 Create physical card (Android)', smokeStep(async function () {
      await PhysicalCardCreationPage.createPhysicalCardAndroid('2468')
    }))
  }

  if (browser.isIOS) {
    it('PC-1.1 Create physical card (iOS)', smokeStep(async function () {
      await PhysicalCardCreationPage.createPhysicalCardIOS('2468')
    }))
  }
})
