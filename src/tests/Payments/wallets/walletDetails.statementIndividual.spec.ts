import { browser } from '@wdio/globals'
import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'

describe('WALLET-008 [TC2917] Individual wallet statements', function () {
  before(async function () {
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
    await home.openCurrentWalletDetails()
  })

  it('[TC2917] Opens statements from wallet details', async function () {
    await home.verifyWalletStatementAction(true)
  })

  it('[TC2933/TC2935] Statement date range', async function () {
    // The new iOS Statement screen has no From/To dates (single generated statement); not checkable on iOS.
    if (browser.isIOS) return this.skip()
    await home.verifyStatementDateRange()
  })

  it('[TC2936] Statement export formats', async function () {
    await home.verifyStatementFormatSelection()
  })

  it('[TC2937] Statement account type selection', async function () {
    await home.verifyStatementTypeSelection()
  })
})
