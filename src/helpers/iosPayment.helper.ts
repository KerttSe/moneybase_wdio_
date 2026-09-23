import { $, browser } from '@wdio/globals'

export async function openIOSPaymentReview() {
  const review = $('~makePayment_button_review')
  const slider = $('~makePayment_slider_pay')
  await browser.hideKeyboard().catch(() => {})
  await browser.waitUntil(async () =>
    await slider.isExisting() || await review.isExisting(), {
    timeout: 15000, interval: 300,
    timeoutMsg: 'Payment form or review screen did not appear',
  })
  if (await slider.isExisting()) return

  const ready = await review.waitForEnabled({ timeout: 20000 }).then(() => true).catch(() => false)
  if (!ready) {
    const balance = $('-ios predicate string:type == "XCUIElementTypeStaticText" AND label BEGINSWITH "Balance:"')
    const detail = await balance.getText().catch(() => 'Balance unavailable')
    throw new Error(`TEST_PRECONDITION: Review Payment is disabled. Check the selected wallet, balance, fees and required fields. ${detail}`)
  }
  await review.click()
  await slider.waitForExist({ timeout: 20000, timeoutMsg: 'Review Payment was tapped but the payment review screen did not open' })
}
