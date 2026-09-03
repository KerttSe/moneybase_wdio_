import { LoginPage } from '../pages/LoginPage'
import { AUTH } from '../data/credentials'
import HomeScreenPage from '../pages/HomeScreenPage'
import BusinessCardPage from '../pages/BusinessCardPage'

/**
 * Step-by-step breakdown of assigning a new Physical business card to the
 * available business member. Each it() is a checkpoint in ONE
 * continuous session (login + ensureBusinessAccount run once in `before`,
 * not per test). No Spend From step for Physical cards.
 * After Continue, the default card design is confirmed with the "Order" CTA.
 * Physical cards return to Manage Cards as Pending; freeze/report cleanup is
 * covered by virtual-card termination flows once a card can become Active.
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

  it('ABC-1.5 Select available assignee', async function () {
    await BusinessCardPage.selectAvailableAssignee()
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

  it('ABC-1.10 Verify physical card appears as Pending in Manage Cards', async function () {
    await BusinessCardPage.verifyCreatedPhysicalCardPending()
  })
})
