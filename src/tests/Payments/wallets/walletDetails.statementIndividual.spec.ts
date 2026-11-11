import { AUTH } from '../../../data/credentials'
import { loginPage } from '../../../pages/LoginPage'
import home from '../../../pages/HomeScreenPage'

describe('WALLET-008 [TC2917] Individual wallet statements', function () {
  it('[TC2917/TC2935/TC2933/TC2936/TC2937] Opens statements and checks dates and export options', async function () {
    await loginPage.loginFlow(AUTH)
    await home.ensureIndividualAccount()
    await home.openCurrentWalletDetails()
    await home.verifyWalletStatementAction(true)
    await home.verifyStatementDateRange()
    await home.verifyStatementFormatSelection()
    await home.verifyStatementTypeSelection()
  })
})
