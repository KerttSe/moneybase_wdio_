// Staging answers that block a flow no matter what the test does.
const STAGING_SCREEN = /temporarily locked|too many attempt|something went wrong|please try again,? if this problem persists|still creating your account/
// Steps that stall because staging never sends the next screen or data back (OTP, Home, order preview).
const STAGING_LOGIN_STALL = /after (?:android )?passcode: mobile verification otp screen did not appear|after otp: continue\/home|after continue: neither home nor|login otp was rejected|login was rejected by app after passcode|preview data did not load/
// Missing CI secrets or an account without the data the spec needs.
const TEST_DATA = /\b[a-z0-9_]+_(?:phone|pin)\b.* is (?:not set|required)|cards did not sync/

/**
 * Classifies a failed test for the BrowserStack session status. `screenText` is the visible page source at
 * failure time: an assertion can fail on a screen that staging has already replaced with a lock or error.
 */
export const classifyFailureReason = (error: Error, screenText = '') => {
  // Stack locations and wait durations are not HTTP response codes.
  const msg = (error.message ?? '').toLowerCase()
  const screen = screenText.toLowerCase()
  const httpCode = msg.match(/\b(?:http(?:\/\d(?:\.\d)?)?(?:\s+(?:status|error))?|status(?:\s+code)?)\s*[:=]?\s*([45]\d{2})\b/)?.[1]

  let reason: string
  if (/\b(?:configuration_error|test_precondition)\b/.test(msg) || TEST_DATA.test(msg)) {
    reason = 'TEST_DATA_ISSUE'
  } else if (/\bapp_navigation_error\b/.test(msg)) {
    reason = 'APP_NAVIGATION_ERROR'
  } else if (httpCode) {
    reason = httpCode === '511' ? `ENVIRONMENT_ISSUE[${httpCode}]` : `BE_ERROR[${httpCode}]`
  } else if (/firebase|fis_auth|fis_error|network request failed|server error|api error|request failed|account.*locked|too many attempt|otp.*reject|otp.*invalid|entered code is incorrect/.test(msg) || STAGING_SCREEN.test(msg) || STAGING_LOGIN_STALL.test(msg)) {
    reason = 'BE_ERROR'
  } else if (/browserstack|appium.*crashed|driver.*died|session.*deleted|could not.*connect|sms.*timeout|sms.*not.*received|application under test.*not running|possibly crashed|device security/.test(msg)) {
    reason = 'ENVIRONMENT_ISSUE'
  } else if (STAGING_SCREEN.test(screen)) {
    reason = 'BE_ERROR'
  } else {
    reason = 'AUTOMATION_BUG'
  }

  return { reason, httpCode }
}
