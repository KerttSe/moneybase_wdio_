import { browser } from '@wdio/globals'
import { stopAfterFailedStep } from '../helpers/sequentialSmoke.helper'
import { loginPage } from '../pages/LoginPage'
import HomeScreenPage from '../pages/HomeScreenPage'
import SalaryStipendPensionPage from '../pages/SalaryStipendPensionPage'
import { AUTH } from '../data/credentials'

describe('Partial salary - iOS amount validation', function () {
  this.timeout(Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 300000))
  const page = new SalaryStipendPensionPage()
  const step = stopAfterFailedStep()

  before(step(async function () {
    if (!browser.isIOS) return this.skip()
    await loginPage.loginFlow(AUTH)
    await HomeScreenPage.ensureIndividualAccount()
    await page.openFromHome()
    await page.tapSspTile()
  }))

  it('PAY-084 [TC3355] Full salary enables Next without an amount', step(async function () {
    await page.selectFullSalaryPreference()
    await page.verifyNextEnabled(true)
  }))

  it('PAY-084 [TC3355] Empty partial salary cannot continue', step(async function () {
    await page.selectPartialSalaryPreference('')
    await page.verifyNextEnabled(false)
  }))

  it('PAY-084 [TC3355] Zero partial salary cannot continue', step(async function () {
    await page.selectPartialSalaryPreference('0')
    await page.verifyNextEnabled(false)
  }))

  it('PAY-084 [TC3355] Positive partial salary opens funding instructions', step(async function () {
    await page.selectPartialSalaryPreference('100')
    await page.verifyNextEnabled(true)
    await page.tapNext()
    await page.verifyInstructionScreenContent()
  }))
})
