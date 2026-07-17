import * as dotenv from 'dotenv'
import type { Options } from '@wdio/types'
import { browser } from '@wdio/globals'
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
const androidUdid = process.env.ANDROID_UDID?.trim()
const onboardingCameraMediaUrls = [
  process.env.ONBOARDING_CAMERA_FRONT_MEDIA_URL,
  process.env.ONBOARDING_CAMERA_BACK_MEDIA_URL,
  process.env.ONBOARDING_CAMERA_FACE_MEDIA_URL,
].filter(Boolean)
const onboardingCameraVideoMediaUrls = [
  process.env.ONBOARDING_CAMERA_FRONT_VIDEO_MEDIA_URL,
  process.env.ONBOARDING_CAMERA_BACK_VIDEO_MEDIA_URL,
  process.env.ONBOARDING_CAMERA_LIVE_VIDEO_MEDIA_URL,
].filter(Boolean)
const enableBrowserStackVideoInjection =
  process.env.BS_ENABLE_CAMERA_VIDEO_INJECTION === 'false'
    ? false
    : process.env.BS_ENABLE_CAMERA_VIDEO_INJECTION === 'true' || onboardingCameraVideoMediaUrls.length > 0
const enableBrowserStackCameraInjection =
  process.env.BS_ENABLE_CAMERA_IMAGE_INJECTION === 'false'
    ? false
    : process.env.BS_ENABLE_CAMERA_IMAGE_INJECTION === 'true' || onboardingCameraMediaUrls.length > 0
const enableBrowserStackCameraPreview = process.env.BS_ENABLE_CAMERA_PREVIEW === 'true'
const envFlag = (name: string, defaultValue: boolean) => {
  const value = process.env[name]?.trim().toLowerCase()
  if (value === undefined || value === '') return defaultValue
  return ['1', 'true', 'yes', 'on'].includes(value)
}
const browserStackBuildTags = (platform: 'android' | 'ios') => [
  platform,
  ...(process.env.BS_BUILD_TAGS ? process.env.BS_BUILD_TAGS.split(',').map(t => t.trim()).filter(Boolean) : []),
]
const browserStackServicePlatform = platformFilter === 'ios' ? 'ios' : 'android'
const browserStackServiceBuildTags = browserStackBuildTags(browserStackServicePlatform)
const browserStackDebugOptions = {
  debug: envFlag('BS_DEBUG', true),
  appiumLogs: envFlag('BS_APPIUM_LOGS', true),
  deviceLogs: envFlag('BS_DEVICE_LOGS', true),
  networkLogs: envFlag('BS_NETWORK_LOGS', true),
  ...(envFlag('BS_NETWORK_LOGS_CAPTURE_CONTENT', false)
    ? { networkLogsOptions: { captureContent: true } }
    : {}),
}
const browserStackResetOptions = {
  ...(envFlag('BS_FULL_RESET', false) ? { 'appium:fullReset': true, 'appium:noReset': false } : {}),
}

const browserStackUser = useBrowserStack ? requireEnv('BROWSERSTACK_USERNAME') : undefined
const browserStackKey = useBrowserStack ? requireEnv('BROWSERSTACK_ACCESS_KEY') : undefined

const classifyFailureReason = (error: Error) => {
  const msg = `${error.message ?? ''} ${error.stack ?? ''}`.toLowerCase()

  // Classify by HTTP code first (most precise), then fall back to text patterns.
  // This guarantees the code in brackets always matches the actual error.
  const httpCodeMatch = msg.match(/\b(429|403|401|511|5[0-9]{2})\b/)
  const httpCode = httpCodeMatch?.[1]

  let reason: string
  if (httpCode) {
    if (['500', '502', '503', '504', '429'].includes(httpCode)) {
      reason = `BE_ERROR[${httpCode}]`
    } else if (httpCode === '511') {
      reason = `ENVIRONMENT_ISSUE[${httpCode}]`
    } else {
      // 401, 403 — backend rejected the request
      reason = `BE_ERROR[${httpCode}]`
    }
  } else if (
    /firebase|fis_auth|fis_error|something went wrong|network request failed|backend|server error|api error|request failed|account.*locked|too many attempt|otp.*reject|otp.*invalid|beneficiar.*not.*accept|otp.*did not complete|otp.*step.*did not|otp.*not.*appear|beneficiar.*screen.*not appear|add card did not open card type selection|card eligibility/.test(msg)
  ) {
    reason = 'BE_ERROR'
  } else if (
    /browserstack|appium.*crashed|driver.*died|session.*deleted|could not.*connect|sms.*timeout|sms.*not.*received|application under test.*not running|possibly crashed/.test(msg)
  ) {
    reason = 'ENVIRONMENT_ISSUE'
  } else {
    reason = 'AUTOMATION_BUG'
  }

  return { reason, httpCode }
}

const markBrowserStackFailure = async (error: Error) => {
  if (!useBrowserStack) return

  const { reason, httpCode } = classifyFailureReason(error)
  const shortMsg = error.message?.slice(0, 150) ?? ''

  await browser
    .execute(`browserstack_executor: ${JSON.stringify({
      action: 'setSessionStatus',
      arguments: {
        status: 'failed',
        reason: `${reason}: ${shortMsg}`,
      },
    })}`)
    .catch(() => {})

  if (httpCode) {
    await browser
      .execute(`browserstack_executor: ${JSON.stringify({
        action: 'annotate',
        arguments: {
          data: `HTTP_${httpCode}`,
          level: 'error',
        },
      })}`)
      .catch(() => {})
  }
}

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
      buildTag: 'android',
      sessionName: 'Android tests',
      userName: browserStackUser,
      accessKey: browserStackKey,
      ...browserStackDebugOptions,
      appiumVersion: '2.6.0',
      deviceName: process.env.BS_ANDROID_DEVICE || 'Samsung Galaxy S24',
      osVersion: process.env.BS_ANDROID_OS || '16.0',
      ...(enableBrowserStackCameraInjection ? { enableCameraImageInjection: true } : {}),
      ...(enableBrowserStackVideoInjection ? { enableCameraVideoInjection: true } : {}),
      ...(enableBrowserStackCameraPreview ? { enableCameraPreview: true } : {}),
      ...({
        testObservability: true,
        testObservabilityOptions: {
          projectName: process.env.BS_PROJECT || 'moneybase_wdio',
          buildName: process.env.BS_BUILD || `local-${new Date().toISOString()}`,
          buildTag: browserStackBuildTags('android'),
        },
      } as Record<string, unknown>),
    },
    'appium:app': process.env.BS_APP_ANDROID,
    'appium:autoGrantPermissions': true,
    'appium:appPackage': process.env.BS_ANDROID_APP_PACKAGE,
    'appium:appActivity': process.env.BS_ANDROID_APP_ACTIVITY,
    'appium:adbExecTimeout': 120000,
    'appium:appWaitDuration': 120000,
    'appium:appWaitActivity': '*',
    ...browserStackResetOptions,
  },
  {
    platformName: 'iOS',
    'bstack:options': {
      projectName: process.env.BS_PROJECT || 'moneybase_wdio',
      buildName: process.env.BS_BUILD || `local-${new Date().toISOString()}`,
      buildTag: 'ios',
      sessionName: 'iOS tests',
      userName: browserStackUser,
      accessKey: browserStackKey,
      ...browserStackDebugOptions,
      appiumVersion: '2.6.0',
      deviceName: process.env.BS_IOS_DEVICE || 'iPhone 15',
      osVersion: process.env.BS_IOS_OS || '17.5',
      ...({
        testObservability: true,
        testObservabilityOptions: {
          projectName: process.env.BS_PROJECT || 'moneybase_wdio',
          buildName: process.env.BS_BUILD || `local-${new Date().toISOString()}`,
          buildTag: browserStackBuildTags('ios'),
        },
      } as Record<string, unknown>),
    },
    'appium:app': process.env.BS_APP_IOS,
    'appium:bundleId': process.env.BS_IOS_BUNDLE_ID,
    'appium:autoAcceptAlerts': true,
    'appium:newCommandTimeout': 300,
    'appium:waitForQuiescence': false,
    'appium:nativeWebScreenshot': true,
    'appium:permissions': '{"com.moneybase.quality":{"contacts":"YES","location":"never","notifications":"NO"}}',
    ...browserStackResetOptions,
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
    'appium:permissions': '{"com.moneybase.quality":{"contacts":"YES","location":"never","notifications":"NO"}}',
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
    ...(androidUdid
      ? {
        'appium:udid': androidUdid,
      }
      : {
        'appium:avd': 'Pixel_7',
        'appium:avdLaunchTimeout': 180000,
        'appium:avdReadyTimeout': 180000,
      }),
    'appium:app': '/Users/dmytrokertys/Desktop/app/app-qa-debug.apk',
    'appium:appPackage': 'com.moneybase.qa',
    'appium:appActivity': 'com.moneybase.views.activities.LoginActivity',
    'appium:appWaitActivity': '*',
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

const smokeSpecs = [
  './src/tests/addbeneficiary.individual.spec.ts',
  './src/tests/addfunds.spec.ts',
  './src/tests/autoTopUp.spec.ts',
  './src/tests/bankTransfer.p2p.individual.spec.ts',
  './src/tests/bankTransfer.sepa.individual.spec.ts',
  './src/tests/bankTransfer.swift.individual.spec.ts',
  './src/tests/cardFreezeUnfreeze.joint.spec.ts',
  './src/tests/cashFunds.spec.ts',
  './src/tests/fxExchange.spec.ts',
  './src/tests/homeAccountSwitch.spec.ts',
  './src/tests/homeScreen.spec.ts',
  './src/tests/homeSearch.spec.ts',
  './src/tests/onboarding.spec.ts',
  './src/tests/orders.spec.ts',
  './src/tests/physicalcardcreation.spec.ts',
  './src/tests/portfolio.spec.ts',
  './src/tests/priceAlerts.spec.ts',
  './src/tests/watchlist.spec.ts',
]

export const config: WebdriverIO.Config = {
  runner: 'local',
  specs: ['./src/tests/**/*.spec.ts'],
  suites: {
    smoke: smokeSpecs,
    launchOnly: ['./src/tests/launch.spec.ts'],
    onboarding: ['./src/tests/onboarding.spec.ts'],
    smokeWithoutOnboarding: smokeSpecs.filter((spec) => spec !== './src/tests/onboarding.spec.ts'),
  },
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

  services: useBrowserStack
    ? [[
      'browserstack',
      {
        testObservabilityOptions: {
          projectName: process.env.BS_PROJECT || 'moneybase_wdio',
          buildName: process.env.BS_BUILD || `local-${new Date().toISOString()}`,
          buildTag: browserStackServiceBuildTags,
        },
      },
    ]]
    : [],

  capabilities,

  mochaOpts: { ui: 'bdd', timeout: Number(process.env.SPEC_MOCHA_TIMEOUT_MS || 600000) },

  onPrepare: function (_config, capabilities) {
    writeAllureEnvironment(capabilities as WebdriverIO.Capabilities[])
    writeAllureExecutor()
  },

  afterTest: async function (test, context, { error }) {
    if (!error) return
    await attachFailureArtifacts()
    await markBrowserStackFailure(error)
  },

  afterHook: async function (_test, _context, { error }) {
    if (!error) return
    await attachFailureArtifacts()
    await markBrowserStackFailure(error)
  },

  onComplete: function () {
    try {
      execSync('npx allure generate allure-results -o allure-report --clean', { stdio: 'inherit' })
    } catch (err) {
      console.warn('Allure report generation failed:', err)
    }
  },
}
