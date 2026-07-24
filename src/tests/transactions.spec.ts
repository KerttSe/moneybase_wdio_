import { $, browser } from '@wdio/globals'
import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'
import TransactionsPage from '../pages/TransactionsPage'

describe('Transactions', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const loginPage = new LoginPage()
  const transactionsPage = new TransactionsPage()

  before(async function () {
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureIndividualAccount()
  })

  it('TX-1.1 Login and land on Home screen', async function () {
    await HomeScreenPage.waitForHomeLoaded()
  })

  it('TX-1.2 Verify Recent Activity section is visible', async function () {
    await transactionsPage.verifyRecentActivityVisible()
  })

  it('TX-1.3 Tap Show All from Recent Activity', async function () {
    await transactionsPage.tapShowAll()
  })

  it('TX-1.4 Verify navigation to Transactions screen', async function () {
    await transactionsPage.verifyTransactionsScreen()
  })

  it('TX-1.5 Verify Transactions header is displayed', async function () {
    await transactionsPage.verifyTransactionsScreen()
  })

  it('TX-1.6 Verify transaction list is displayed', async function () {
    await transactionsPage.verifyTransactionListDisplayed()
  })

  it('TX-1.7 Verify transactions are grouped by date', async function () {
    await transactionsPage.verifyTransactionsGroupedByDate()
  })

  it('TX-1.8 Verify no loading or navigation errors occur', async function () {
    await transactionsPage.verifyNoErrors()
  })

  describe('Business identity', function () {
    before(async function () {
      await $('~BackButton').click().catch(() => browser.back().catch(() => {}))
      await HomeScreenPage.waitForHomeLoaded()
      await HomeScreenPage.ensureBusinessAccount()
      await HomeScreenPage.waitForHomeLoaded()
    })

    it('TX-2.1 Switch to Business identity and land on Home screen', async function () {
      await HomeScreenPage.waitForHomeLoaded()
    })

    it('TX-2.2 Verify Recent Activity section is visible', async function () {
      await transactionsPage.verifyRecentActivityVisible()
    })

    it('TX-2.3 Tap Show All from Recent Activity', async function () {
      await transactionsPage.tapShowAll()
    })

    it('TX-2.4 Verify navigation to Transactions screen', async function () {
      await transactionsPage.verifyTransactionsScreen()
    })

    it('TX-2.5 Verify Transactions header is displayed', async function () {
      await transactionsPage.verifyTransactionsScreen()
    })

    it('TX-2.6 Verify transaction list is displayed', async function () {
      await transactionsPage.verifyTransactionListDisplayed()
    })

    it('TX-2.7 Verify transactions are grouped by date', async function () {
      await transactionsPage.verifyTransactionsGroupedByDate()
    })

    it('TX-2.8 Verify no loading or navigation errors occur', async function () {
      await transactionsPage.verifyNoErrors()
    })
  })
})
