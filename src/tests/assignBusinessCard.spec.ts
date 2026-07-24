import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'
import BusinessCardPage from '../pages/BusinessCardPage'

/**
 * Step-by-step breakdown of assigning a new Physical business card to the
 * Las Vegas business member. Each it() is a checkpoint in ONE
 * continuous session (login + ensureBusinessAccount run once in `before`,
 * not per test). No Spend From step for Physical cards.
 * After Continue, the default card design is confirmed with the "Order" CTA.
 */
describe('Business Cards - Assign Physical card', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))
  const loginPage = new LoginPage()

  before(async function () {
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureBusinessAccount()
  })

  it('ABC-1.1 Open Cards tab', async function () {
    await BusinessCardPage.openCardsTab()
  })

  it('ABC-1.2 Tap Add New Card', async function () {
    await BusinessCardPage.tapAddNewCard()
  })

  it('ABC-1.3 Open Card Type selection and confirm change', async function () {
    await BusinessCardPage.openCardTypeSelection()
  })

  it('ABC-1.4 Select Physical Card type', async function () {
    await BusinessCardPage.selectPhysicalCardType()
  })

  it('ABC-1.5 Select Las Vegas assignee', async function () {
    await BusinessCardPage.selectLasVegasAssignee()
  })

  it('ABC-1.6 Continue with selected assignee', async function () {
    await BusinessCardPage.continueWithDefaultAssignee()
  })

  it('ABC-1.7 Order default card design', async function () {
    await BusinessCardPage.orderDefaultCardDesign()
  })

  it('ABC-1.8 Confirm assignee address and submit', async function () {
    await BusinessCardPage.confirmAssigneeAddressAndSubmit()
  })

  it('ABC-1.9 Verify success modal and close', async function () {
    await BusinessCardPage.verifySuccessAndClose()
  })

  it('ABC-1.10 Wait for created card details screen', async function () {
    await BusinessCardPage.waitForCreatedCardReady()
  })

  it('ABC-1.11 Freeze created card', async function () {
    await BusinessCardPage.tapFreeze()
  })

  it('ABC-1.12 Delete created card via report/block', async function () {
    await BusinessCardPage.tapReport()
    await BusinessCardPage.verifyCardBlocked()
  })

  it('ABC-1.13 Return to cards list', async function () {
    await BusinessCardPage.tapViewMyCards()
  })

  it('ABC-1.14 Verify created card was removed', async function () {
    await BusinessCardPage.verifyCardRemoved()
  })
})
