import * as dotenv from 'dotenv'
import type { Options } from '@wdio/types'
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { attachFailureArtifacts, writeAllureEnvironment, writeAllureExecutor } from './src/helpers/allure.helper'

const envBaseDir = process.env.INIT_CWD ?? process.env.PWD ?? process.cwd()
const envPath = resolve(envBaseDir, '.env')
dotenv.config({ path: envPath })






const requireEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `[BrowserStack] Missing env ${name}. Fill it in .env / CI secrets and re-run (BROWSERSTACK=true).`,
    )
  }
  return value
}

const useBrowserStack = process.env.BROWSERSTACK === 'true'
const platformFilter = process.env.PLATFORM?.toLowerCase()

const browserStackUser = useBrowserStack ? requireEnv('BROWSERSTACK_USERNAME') : undefined
const browserStackKey = useBrowserStack ? requireEnv('BROWSERSTACK_ACCESS_KEY') : undefined

if (useBrowserStack) {
  const needsAndroid = !platformFilter || platformFilter === 'android'
  const needsIos = !platformFilter || platformFilter === 'ios'
  if (needsAndroid) requireEnv('BS_APP_ANDROID')
  if (needsIos) requireEnv('BS_APP_IOS')
}

const browserStackCapabilities: WebdriverIO.Capabilities[] = [
  {
    platformName: 'Android',
    'bstack:options': {
      projectName: process.env.BS_PROJECT || 'moneybase_wdio',
      buildName: process.env.BS_BUILD || `local-${new Date().toISOString()}`,
      sessionName: 'Android tests',
      userName: browserStackUser,
      accessKey: browserStackKey,
      appiumVersion: '2.0.0',
      deviceName: 'Google Pixel 9',
      osVersion: '15.0',
    },
    'appium:app': process.env.BS_APP_ANDROID,
    'appium:autoGrantPermissions': true,
    'appium:appPackage': process.env.BS_ANDROID_APP_PACKAGE,
    'appium:appActivity': process.env.BS_ANDROID_APP_ACTIVITY,
  },
  {
    platformName: 'iOS',
    'bstack:options': {
      projectName: process.env.BS_PROJECT || 'moneybase_wdio',
      buildName: process.env.BS_BUILD || `local-${new Date().toISOString()}`,
      sessionName: 'iOS tests',
      userName: browserStackUser,
      accessKey: browserStackKey,
      appiumVersion: '2.0.0',
      deviceName: process.env.BS_IOS_DEVICE || 'iPhone 14',
      osVersion: process.env.BS_IOS_OS || '16',
    },
    'appium:app': process.env.BS_APP_IOS,
    'appium:bundleId': process.env.BS_IOS_BUNDLE_ID,
  },
]

const localCapabilities: WebdriverIO.Capabilities[] = [
  {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:deviceName': 'iPhone 17 Pro',
    'appium:udid': '4D8D55A7-2461-4ED7-A28B-9946162BA884',
    'appium:app': '/Users/dmytrokertys/Desktop/app/moneybase.app',
    'appium:noReset': false,
    'appium:newCommandTimeout': 300,
    'appium:permissions': '{"com.moneybase.quality":{"contacts":"YES"}}',
    'appium:autoAcceptAlerts': true,
    'appium:waitForQuiescence': false,
    'appium:shouldTerminateApp': true,
    'appium:useNewWDA': true,
    'appium:showXcodeLog': false,
    'appium:nativeWebScreenshot': true,
  },
  {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:avd': 'Pixel_6a',
    'appium:avdLaunchTimeout': 180000,
    'appium:avdReadyTimeout': 180000,
    'appium:app': '/Users/dmytrokertys/Desktop/app/app-qa-debug.apk',
    'appium:autoGrantPermissions': true,
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:autoAcceptAlerts': true,
    'appium:ensureWebviewsHavePages': true,
    'appium:nativeWebScreenshot': false,
    'appium:newCommandTimeout': 3600,
  },
]

const capabilities = (useBrowserStack ? browserStackCapabilities : localCapabilities).filter((capability) => {
  if (!platformFilter) return true
  return String(capability.platformName).toLowerCase() === platformFilter
})

export const config: WebdriverIO.Config = {
  runner: 'local',
  specs: ['./src/tests/**/*.spec.ts'],
  maxInstances: 1,
  logLevel: 'info',
  framework: 'mocha',

  hostname: useBrowserStack ? 'hub.browserstack.com' : '127.0.0.1',
  port: useBrowserStack ? 443 : Number(process.env.APPIUM_PORT ?? 4723),
  path: useBrowserStack ? '/wd/hub' : '/',
  protocol: useBrowserStack ? 'https' : 'http',
  user: useBrowserStack ? process.env.BROWSERSTACK_USERNAME : undefined,
  key: useBrowserStack ? process.env.BROWSERSTACK_ACCESS_KEY : undefined,

  reporters: [
    'spec',
    ['allure', {
      outputDir: 'allure-results',
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: false,
    }],
  ],

  services: useBrowserStack ? ['browserstack'] : [],

  capabilities,

  mochaOpts: { ui: 'bdd', timeout: 120000 },

  onPrepare: function (_config, capabilities) {
    writeAllureEnvironment(capabilities as WebdriverIO.Capabilities[])
    writeAllureExecutor()
  },

  afterTest: async function (test, context, { error }) {
    if (!error) return
    await attachFailureArtifacts()
  },

  afterHook: async function (_test, _context, { error }) {
    if (!error) return
    await attachFailureArtifacts()
  },

  onComplete: function () {
    try {
      execSync('npx allure generate allure-results -o allure-report --clean', { stdio: 'inherit' })
    } catch (err) {
      console.warn('Allure report generation failed:', err)
    }
  },
}
