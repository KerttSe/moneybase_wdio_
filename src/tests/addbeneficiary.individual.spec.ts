import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import AddBeneficiaryPage from '../pages/AddBeneficiaryPage'
import { AUTH } from '../data/credentials'
import { getMalteseIbanForTest } from '../data/ibans'

function randomBeneficiaryDetails() {
  const firstNames = ['Alex', 'Danieltest', 'Mark', 'Nina', 'Sofiatest', 'Victor']
  const surnames = ['automationtest', 'Cassar', 'test', 'Mifsud', 'Sammut', 'Zammit']
  const suffix = Array.from({ length: 2 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('')
  const pick = (values: string[]) => values[Math.floor(Math.random() * values.length)]
  const name = pick(firstNames)
  const surname = `${pick(surnames)} ${suffix}`
  return { name, surname, friendName: `${name} ${suffix}` }
}

const beneficiaryParams = (() => {
  const { name, surname, friendName } = randomBeneficiaryDetails()
  return { name, surname, friendName, iban: process.env.TEST_IBAN || getMalteseIbanForTest(), bic: 'CCUHMTMTXXX' }
})()

describe('Add Beneficiary - Another person', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const addBeneficiaryPage = new AddBeneficiaryPage()
  const beneficiaryAuth = {
    ...AUTH,
    phone: process.env.ADD_BENEFICIARY_MB_PHONE || AUTH.phone,
    pin: process.env.ADD_BENEFICIARY_MB_PIN || AUTH.pin,
  }
  const useApiLoginOtp = ['1', 'true', 'yes', 'on'].includes(
    String(process.env.ADD_BENEFICIARY_LOGIN_USE_API_OTP || '').toLowerCase(),
  )

  stopAfterFailedStep()

  before(async function () {
    await loginPage.loginFlow(beneficiaryAuth, {
      useApiOtp: useApiLoginOtp,
      otpPhone: process.env.ADD_BENEFICIARY_LOGIN_OTP_PHONE || beneficiaryAuth.otpPhone,
    })
  })

  if (browser.isAndroid) {
    it('ABS-1.1 Open Add Beneficiary and select Another person (Android)', async function () {
      await addBeneficiaryPage.selectSmokeBeneficiaryAndroid(beneficiaryParams)
    })

    it('ABS-1.2 Fill beneficiary details and submit (Android)', async function () {
      await addBeneficiaryPage.submitSmokeBeneficiaryDetailsAndroid(beneficiaryParams)
    })

    it('ABS-1.3 Complete OTP and verify success (Android)', async function () {
      await addBeneficiaryPage.confirmSmokeBeneficiaryAndroid(beneficiaryParams)
    })
  }

  if (browser.isIOS) {
    it('ABS-1.1 Open Add Beneficiary and select Another person (iOS)', async function () {
      await addBeneficiaryPage.selectSmokeBeneficiaryIOS(beneficiaryParams)
    })

    it('ABS-1.2 Fill beneficiary details and confirm review (iOS)', async function () {
      await addBeneficiaryPage.submitSmokeBeneficiaryDetailsIOS(beneficiaryParams)
    })

    it('ABS-1.3 Complete OTP and verify success (iOS)', async function () {
      await addBeneficiaryPage.confirmSmokeBeneficiaryIOS(beneficiaryParams)
    })
  }
})
