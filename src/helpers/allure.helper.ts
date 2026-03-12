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

/**
 * Call in wdio.conf.ts → onPrepare to write executor.json
 * Allure shows this in the Executors widget and uses buildOrder for trend history.
 *
 * Supports:
 *  - GitHub Actions  (GITHUB_ACTIONS, GITHUB_RUN_NUMBER, GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID)
 *  - GitLab CI       (GITLAB_CI, CI_PIPELINE_IID, CI_PIPELINE_URL, CI_JOB_URL)
 *  - Jenkins         (JENKINS_URL, BUILD_NUMBER, BUILD_URL)
 *  - Local fallback
 */
export function writeAllureExecutor() {
  const { writeFileSync, mkdirSync } = require('fs')
  const { join } = require('path')
  const env = process.env

  let executor: Record<string, unknown>

  if (env.GITHUB_ACTIONS === 'true') {
    const runNumber = env.GITHUB_RUN_NUMBER ?? '0'
    const serverUrl = env.GITHUB_SERVER_URL ?? 'https://github.com'
    const repo = env.GITHUB_REPOSITORY ?? ''
    const runId = env.GITHUB_RUN_ID ?? ''
    executor = {
      name: 'GitHub Actions',
      type: 'github',
      url: `${serverUrl}/${repo}`,
      buildOrder: Number(runNumber),
      buildName: `Run #${runNumber}`,
      buildUrl: `${serverUrl}/${repo}/actions/runs/${runId}`,
      reportUrl: `${serverUrl}/${repo}/actions/runs/${runId}`,
    }
  } else if (env.GITLAB_CI === 'true') {
    const pipelineId = env.CI_PIPELINE_IID ?? '0'
    executor = {
      name: 'GitLab CI',
      type: 'gitlab',
      url: env.CI_PROJECT_URL ?? '',
      buildOrder: Number(pipelineId),
      buildName: `Pipeline #${pipelineId}`,
      buildUrl: env.CI_PIPELINE_URL ?? '',
      reportUrl: env.CI_JOB_URL ?? '',
    }
  } else if (env.JENKINS_URL) {
    const buildNumber = env.BUILD_NUMBER ?? '0'
    executor = {
      name: 'Jenkins',
      type: 'jenkins',
      url: env.JENKINS_URL,
      buildOrder: Number(buildNumber),
      buildName: `Build #${buildNumber}`,
      buildUrl: env.BUILD_URL ?? '',
      reportUrl: env.BUILD_URL ?? '',
    }
  } else {
    executor = {
      name: 'Local',
      type: 'local',
      buildOrder: Date.now(),
      buildName: `Local run — ${new Date().toLocaleString()}`,
    }
  }

  try {
    mkdirSync('allure-results', { recursive: true })
    writeFileSync(
      join('allure-results', 'executor.json'),
      JSON.stringify(executor, null, 2),
      'utf8'
    )
    console.log(`[Allure] executor.json written: ${executor.name} — ${executor.buildName}`)
  } catch (err) {
    console.warn('[Allure] Failed to write executor.json:', err)
  }
}
