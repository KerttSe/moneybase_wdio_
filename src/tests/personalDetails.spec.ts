import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import homeScreenPage from '../pages/HomeScreenPage'
import personalDetailsPage from '../pages/PersonalDetailsPage'
import { PD_AUTH } from '../data/credentials'

describe('Personal Details — read-only verification (TC1535-1546)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const home = homeScreenPage
  const pd = personalDetailsPage

  stopAfterFailedStep()

  before(async function () {
    await loginPage.loginFlow(PD_AUTH)
    await home.ensureIndividualAccount()
  })

  it('PD-1.1 Wait for Home', async function () {
    if (!(browser.isAndroid || browser.isIOS)) return this.skip()
    await home.waitForHomeLoaded()
  })

  it('PD-1.2 Navigate More → Settings → Personal Details', async function () {
    await pd.navigateToPersonalDetails()
  })

  it('PD-1.3 Personal Details screen is visible (TC1535)', async function () {
    await pd.verifyPersonalDetailsScreenVisible()
  })

  it('PD-1.4 First name field is displayed (TC1536)', async function () {
    await pd.verifyFirstNameFieldVisible()
  })

  it('PD-1.5 Last name field is displayed (TC1537)', async function () {
    await pd.verifyLastNameFieldVisible()
  })

  it('PD-1.6 Email field is displayed (TC1538)', async function () {
    await pd.verifyEmailFieldVisible()
  })

  it('PD-1.7 Address field is displayed (TC1539)', async function () {
    await pd.verifyAddressFieldVisible()
  })

  it('PD-1.8 Edit first name (TC1540)', async function () {
    await pd.editFirstName('AutoFirst')
  })

  it('PD-1.9 Edit last name (TC1541)', async function () {
    await pd.editLastName('AutoLast')
  })

  it('PD-1.10 Save changes (TC1542)', async function () {
    await pd.tapSave()
  })

  it('PD-1.11 Verify first name saved (TC1543)', async function () {
    await pd.verifyFieldValue('AutoFirst')
  })

  it('PD-1.12 Verify last name saved (TC1544)', async function () {
    await pd.verifyFieldValue('AutoLast')
  })
})
