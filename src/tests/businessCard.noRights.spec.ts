import { LoginPage } from '../pages/LoginPage'
import BusinessCardNoRightsPage from '../pages/BusinessCardNoRightsPage'

describe('Business Cards - No-Rights User Add Card Blocked', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000))

  const loginPage = new LoginPage()
  const country = process.env.BH_MB_COUNTRY || process.env.MB_COUNTRY || 'Malta'
  const phone = process.env.BC_NO_RIGHTS_PHONE || '79071814'
  const pin = process.env.BC_NO_RIGHTS_PIN || '2468'

  before(async function () {
    await loginPage.loginFlow({ country, phone, pin })
    await BusinessCardNoRightsPage.ensureSeDeKEAccount()
  })

  it('BCNR-1.1 Open Cards tab', async function () {
    await BusinessCardNoRightsPage.openCardsTab()
  })

  it('BCNR-1.2 Tap Add Card', async function () {
    await BusinessCardNoRightsPage.tapAddCard()
  })

  it('BCNR-1.3 Verify no-rights blocked alert appears', async function () {
    await BusinessCardNoRightsPage.verifyNoRightsAlert()
  })

  it('BCNR-1.4 Verify alert message content', async function () {
    await BusinessCardNoRightsPage.verifyNoRightsAlertMessage()
  })
})
