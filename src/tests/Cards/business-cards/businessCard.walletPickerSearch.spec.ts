import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../../../helpers/sequentialSmoke.helper'
import { loginPage } from '../../../pages/LoginPage'
import wallet from '../../../pages/BusinessCardWalletPage'
import { BH_AUTH } from '../../../data/credentials'

// Opens Assign Card > Spend From on SeDeKE and searches the wallet list; nothing is assigned.
describe('Business card wallet picker search (Android)', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const step = stopAfterFailedStep()

  before(async function () {
    if (!browser.isAndroid) return this.skip()
    await loginPage.loginFlow(BH_AUTH)
    await wallet.ensureSeDeKEAccount()
    await wallet.openAdministration()
    await wallet.openManageCards()
    await wallet.openAssignCardFormAndroid()
    await wallet.selectVirtualCardType()
    await wallet.selectSelfAssignee()
    await wallet.openWalletPickerFromSpendFrom()
  })

  after(async function () {
    if (browser.isAndroid) await wallet.leaveAssignCardAndroid().catch(() => {})
  })

  it('A wallet search with no match shows "No results found" and keeps Add New Wallet [TC2930]', step(async function () {
    await wallet.verifyWalletPickerNoResultsAndroid()
  }))
})
