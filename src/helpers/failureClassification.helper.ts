export const classifyFailureReason = (error: Error) => {
  // Stack locations and wait durations are not HTTP response codes.
  const msg = (error.message ?? '').toLowerCase()
  const httpCode = msg.match(/\b(?:http(?:\/\d(?:\.\d)?)?(?:\s+(?:status|error))?|status(?:\s+code)?)\s*[:=]?\s*([45]\d{2})\b/)?.[1]

  let reason: string
  if (/\b(?:configuration_error|test_precondition)\b/.test(msg)) {
    reason = 'TEST_DATA_ISSUE'
  } else if (/\bapp_navigation_error\b/.test(msg)) {
    reason = 'APP_NAVIGATION_ERROR'
  } else if (httpCode) {
    reason = httpCode === '511' ? `ENVIRONMENT_ISSUE[${httpCode}]` : `BE_ERROR[${httpCode}]`
  } else if (/firebase|fis_auth|fis_error|network request failed|server error|api error|request failed|account.*locked|too many attempt|otp.*reject|otp.*invalid|entered code is incorrect/.test(msg)) {
    reason = 'BE_ERROR'
  } else if (/browserstack|appium.*crashed|driver.*died|session.*deleted|could not.*connect|sms.*timeout|sms.*not.*received|application under test.*not running|possibly crashed/.test(msg)) {
    reason = 'ENVIRONMENT_ISSUE'
  } else {
    reason = 'AUTOMATION_BUG'
  }

  return { reason, httpCode }
}
