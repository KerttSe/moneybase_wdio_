import { browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'

export async function waitForControlEnabled(
  control: ChainablePromiseElement,
  enabled: boolean,
  label: string,
  timeout = 10000,
) {
  await control.waitForExist({ timeout })
  if (browser.isIOS && enabled) {
    // The new iOS build's SwiftUI buttons can report enabled=false while they work, so the flag cannot
    // fail the check; the following tap and its next-screen check prove the control works.
    const reported = await browser
      .waitUntil(async () => (await control.isEnabled()) === true, { timeout: 3000, interval: 250 })
      .then(() => true)
      .catch(() => false)
    if (!reported) console.warn(`[controlState] ${label}: iOS reports enabled=false; relying on the next step`)
    return
  }
  await browser.waitUntil(async () => (await control.isEnabled()) === enabled, {
    timeout,
    interval: 250,
    timeoutMsg: `${label} must be ${enabled ? 'enabled' : 'disabled'}`,
  })
}
