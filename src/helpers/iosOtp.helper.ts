import { $, browser } from '@wdio/globals'

export function assertOtpPhoneMatches(configuredPhone: string, challengeText: string, countryCode = '356') {
  const digits = configuredPhone.replace(/\D/g, '')
  const expected = digits.startsWith(countryCode) ? digits : `${countryCode}${digits}`
  const displayedPhone = challengeText.match(/\+\d[\d ()-]{6,}\d/)?.[0].replace(/\D/g, '')
  if (!digits || !displayedPhone || expected !== displayedPhone) {
    throw new Error('CONFIGURATION_ERROR: OTP phone does not match the active verification challenge. Check the flow override and primary/secondary account settings.')
  }
}

export async function assertIOSOtpPhone(configuredPhone: string) {
  const destination = $('//XCUIElementTypeStaticText[@visible="true" and (starts-with(@label,"+") or (contains(@label,"sent to") and contains(@label,"+")))]')
  await destination.waitForExist({ timeout: 15000, timeoutMsg: 'OTP destination did not appear on the verification screen' })
  assertOtpPhoneMatches(configuredPhone, await destination.getText(), process.env.OTP_COUNTRY_CODE || '356')
}

export async function waitForIOSOtpOutcome(isComplete: () => Promise<boolean>, flow: string, timeout = 60000) {
  const rejection = $('-ios predicate string:type == "XCUIElementTypeStaticText" AND (label CONTAINS[c] "code is incorrect" OR label CONTAINS[c] "invalid code" OR label CONTAINS[c] "too many attempts" OR label CONTAINS[c] "code has expired")')
  let rejected = false
  await browser.waitUntil(async () => {
    rejected = await rejection.isExisting()
    return rejected || await isComplete()
  }, { timeout, interval: 500, timeoutMsg: `${flow}: OTP submission did not reach the expected success screen` })
  if (rejected) throw new Error(`${flow}: OTP rejected by the app; stopping without re-entering the same code`)
}
