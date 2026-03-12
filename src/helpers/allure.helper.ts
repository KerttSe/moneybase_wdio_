import { browser } from '@wdio/globals'
import allure from '@wdio/allure-reporter'
import { execSync } from 'node:child_process'

export async function attachFailureArtifacts() {
  const caps = browser.capabilities as Record<string, unknown>
  const platform = (caps?.platformName as string) ?? 'unknown'
  const isAndroid = platform.toLowerCase() === 'android'
  const isIOS = platform.toLowerCase() === 'ios'

  // Label the test with platform so devs can filter iOS vs Android in Allure UI
  try {
    allure.addLabel('platform', platform)
    const deviceName = (caps?.['appium:deviceName'] ?? caps?.deviceName ?? 'unknown') as string
    const osVersion = (caps?.['appium:platformVersion'] ?? caps?.platformVersion ?? '') as string
    allure.addLabel('device', osVersion ? `${deviceName} (${osVersion})` : deviceName)
  } catch {}

  // Switch to NATIVE_APP context before all capture attempts
  await browser.switchContext('NATIVE_APP').catch(() => {})

  // Screenshot
  try {
    const screenshot = await browser.takeScreenshot()
    if (screenshot && screenshot.length > 0) {
      allure.addAttachment(
        `Screenshot (${platform})`,
        Buffer.from(screenshot, 'base64'),
        'image/png'
      )
    } else {
      console.warn(`[Allure] takeScreenshot returned empty for ${platform}`)
    }
  } catch (err) {
    console.warn(`[Allure] Failed to take screenshot for ${platform}:`, err)
  }

  // Page source (native hierarchy)
  try {
    const source = await browser.getPageSource()
    if (source) {
      allure.addAttachment(`Page Source (${platform})`, source, 'text/xml')
    }
  } catch (err) {
    console.warn(`[Allure] Failed to get page source for ${platform}:`, err)
  }

  // Current Activity / Screen (Android only)
  if (isAndroid) {
    try {
      const activity = await (browser as any).getCurrentActivity()
      const packageName = await (browser as any).getCurrentPackage()
      allure.addAttachment(
        'Current Activity (Android)',
        `Package: ${packageName}\nActivity: ${activity}`,
        'text/plain'
      )
    } catch {}

    // Android Logcat — last 200 lines at the moment of failure
    try {
      const logcat = execSync('adb logcat -d -t 200', { encoding: 'utf8', timeout: 5000 })
      if (logcat) {
        allure.addAttachment('Logcat (last 200 lines)', logcat, 'text/plain')
      }
    } catch {}
  }

  // Current URL (iOS bundle / app info)
  if (isIOS) {
    try {
      const bundleId = (caps?.['appium:bundleId'] ?? caps?.bundleId ?? '') as string
      if (bundleId) {
        allure.addAttachment('Bundle ID (iOS)', bundleId, 'text/plain')
      }
    } catch {}
  }

  // Contexts
  try {
    const contexts = await browser.getContexts().catch(() => [])
    allure.addAttachment('Contexts', JSON.stringify(contexts, null, 2), 'application/json')
  } catch {}

  // Capabilities summary (readable for devs)
  try {
    const summary = {
      platform,
      deviceName: caps?.['appium:deviceName'] ?? caps?.deviceName,
      platformVersion: caps?.['appium:platformVersion'] ?? caps?.platformVersion,
      app: caps?.['appium:app'] ?? caps?.app,
      automationName: caps?.['appium:automationName'],
      udid: caps?.['appium:udid'] ?? caps?.udid,
    }
    allure.addAttachment('Device Info', JSON.stringify(summary, null, 2), 'application/json')
  } catch {}
}

/**
 * Call in wdio.conf.ts → onPrepare to write environment.properties
 * so Allure shows device/OS info in the Environment widget
 */
export function writeAllureEnvironment() {
  const { writeFileSync, mkdirSync } = require('fs')
  const { join } = require('path')

  try {
    mkdirSync('allure-results', { recursive: true })
    const lines: string[] = [
      `Framework=WebdriverIO`,
      `Language=TypeScript`,
      `Runner=Appium`,
    ]
    writeFileSync(join('allure-results', 'environment.properties'), lines.join('\n'), 'utf8')
  } catch (err) {
    console.warn('[Allure] Failed to write environment.properties:', err)
  }
}
