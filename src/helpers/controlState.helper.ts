import { browser } from '@wdio/globals'
import type { ChainablePromiseElement } from 'webdriverio'

export async function waitForControlEnabled(
  control: ChainablePromiseElement,
  enabled: boolean,
  label: string,
  timeout = 10000,
) {
  await control.waitForExist({ timeout })
  await browser.waitUntil(async () => (await control.isEnabled()) === enabled, {
    timeout,
    interval: 250,
    timeoutMsg: `${label} must be ${enabled ? 'enabled' : 'disabled'}`,
  })
}
