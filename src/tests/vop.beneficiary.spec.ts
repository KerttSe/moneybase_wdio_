import { browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import AddBeneficiaryPage from '../pages/AddBeneficiaryPage'
import VopPage from '../pages/VopPage'
import { AUTH } from '../data/credentials'

const BENEFICIARY = {
  name: 'Lucia',
  surname: 'Torres',
  iban: 'ES4604879976999668582488',
  country: 'Spain',
}

describe('VOP - Beneficiary Creation (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const addBeneficiaryPage = new AddBeneficiaryPage()

  before(async function () {
    if (!browser.isAndroid) return this.skip()
    await loginPage.loginFlow(AUTH)
    await addBeneficiaryPage.navigateBeneficiaryToVopAndroid(BENEFICIARY)
  })

  it('VOP-2.1 VOP screen is displayed after submitting beneficiary details', async function () {
    await VopPage.waitForVopScreen(30000)
  })

  it('VOP-2.2 VOP screen shows the passed first name', async function () {
    await VopPage.assertPayeeName(BENEFICIARY.name)
  })

  it('VOP-2.3 VOP screen shows the passed last name', async function () {
    await VopPage.assertPayeeName(BENEFICIARY.surname)
  })

  it('VOP-2.4 VOP close button is present', async function () {
    const visible = await VopPage.isCloseBtnVisible()
    if (!visible) throw new Error('VOP close button not found')
  })

  it('VOP-2.5 Close VOP sheet', async function () {
    await VopPage.close()
    const gone = await VopPage.isVopScreenVisible()
    if (gone) throw new Error('VOP sheet did not close')
  })
})
