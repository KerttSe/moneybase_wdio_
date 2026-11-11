import * as dotenv from 'dotenv'
import type { Options } from '@wdio/types'
import { browser } from '@wdio/globals'
import { execSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { basename, resolve, sep } from 'node:path'
import { attachFailureArtifacts, writeAllureEnvironment, writeAllureExecutor } from './src/helpers/allure.helper'
import { getLastBrowserStackStep } from './src/helpers/browserstack.helper'
import { classifyFailureReason } from './src/helpers/failureClassification.helper'
// wdio loads this file as an ES module, so the shared CommonJS lane module needs createRequire.
// wdio and the CI workflow always run from the repository root.
const regressionLanes: {
  slotForSpec: (specName: string) => string
  laneOrder: (lane: string) => string[]
} = createRequire(resolve('wdio.conf.ts'))('./scripts/regressionLanes.cjs')

const envBaseDir = process.env.INIT_CWD ?? process.env.PWD ?? process.cwd()
const envPath = resolve(envBaseDir, '.env')
dotenv.config({ path: envPath })

// The business holder fixture is the secondary account (same phone), so CI only needs the MB_ALT_* secrets.
for (const [target, source] of [['BH_MB_PHONE', 'MB_ALT_PHONE'], ['BH_MB_PIN', 'MB_ALT_PIN'], ['BH_OTP_PHONE', 'MB_ALT_OTP_PHONE']]) {
  if (!process.env[target] && process.env[source]) process.env[target] = process.env[source]
}






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
const androidUseInstalledApp = process.env.ANDROID_USE_INSTALLED_APP === 'true'
const androidApp = process.env.ANDROID_APP?.trim() || '/Users/dmytrokertys/Desktop/app/app-qa-debug.apk'
const androidAppPackage = process.env.ANDROID_APP_PACKAGE?.trim() || 'com.moneybase.qa'
const androidAppActivity = process.env.ANDROID_APP_ACTIVITY?.trim() || 'com.moneybase.views.activities.LoginActivity'
if (!useBrowserStack && platformFilter !== 'ios' && androidUseInstalledApp && !androidUdid) {
  throw new Error('ANDROID_USE_INSTALLED_APP=true requires an explicit ANDROID_UDID')
}
const iosUdid = process.env.IOS_UDID?.trim()
const iosDeviceName = process.env.IOS_DEVICE_NAME?.trim() || (iosUdid ? 'iPhone' : 'iPhone 17 Pro')
const iosApp = process.env.IOS_APP?.trim() || '/Users/dmytrokertys/Desktop/app/moneybase.app'
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
const envPositiveInteger = (name: string, defaultValue: number) => {
  const value = Number(process.env[name])
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : defaultValue
}
const cliValue = (name: string) => {
  const eqArg = process.argv.find(arg => arg.startsWith(`--${name}=`))
  if (eqArg) return eqArg.slice(name.length + 3)

  const index = process.argv.indexOf(`--${name}`)
  if (index >= 0) return process.argv[index + 1]

  return undefined
}
const normalizeTag = (value?: string) => value?.trim().replace(/^\.?\//, '').replace(/[^\w.-]+/g, '-')
const cliSuiteTag = normalizeTag(cliValue('suite'))
const cliSpecTag = normalizeTag(cliValue('spec') ? basename(cliValue('spec') as string) : undefined)

const browserStackBuildTags = (platform: 'android' | 'ios') => [
  platform,
  ...(cliSuiteTag ? [cliSuiteTag] : []),
  ...(cliSpecTag ? [cliSpecTag] : []),
  ...(process.env.BS_BUILD_TAGS ? process.env.BS_BUILD_TAGS.split(',').map(t => t.trim()).filter(Boolean) : []),
]
const browserStackServicePlatform = platformFilter === 'ios' ? 'ios' : 'android'
const browserStackServiceBuildTags = browserStackBuildTags(browserStackServicePlatform)
const allureResultsDir = process.env.ALLURE_RESULTS_DIR || 'allure-results'
const allureReportDir = process.env.ALLURE_REPORT_DIR || 'allure-report'
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
const requestedMaxInstances = envPositiveInteger(
  'WDIO_MAX_INSTANCES',
  useBrowserStack ? envPositiveInteger('BS_MAX_INSTANCES', 1) : 1,
)
const hasBrowserStackAltAccount = Boolean((process.env.MB_ALT_PHONE || process.env.AUTH_OTP_MB_PHONE)?.trim())
const shouldKeepBrowserStackSmokeSingleLane =
  useBrowserStack &&
  cliSuiteTag === 'smoke' &&
  requestedMaxInstances > 1 &&
  envFlag('BS_SMOKE_SPLIT_BY_ACCOUNT', true)
const maxInstances =
  (useBrowserStack && requestedMaxInstances > 1 && !hasBrowserStackAltAccount) || shouldKeepBrowserStackSmokeSingleLane
    ? 1
    : requestedMaxInstances

if (useBrowserStack && requestedMaxInstances > 1 && !hasBrowserStackAltAccount) {
  console.warn('[WDIO] BS_MAX_INSTANCES > 1 but neither MB_ALT_PHONE nor AUTH_OTP_MB_PHONE is set; using maxInstances=1.')
}

if (shouldKeepBrowserStackSmokeSingleLane) {
  console.warn('[WDIO] Use smokeLane1 + smokeLane2 commands for account-safe 2-parallel smoke; keeping --suite smoke at maxInstances=1.')
}

const isMochaSkipError = (error: Error) => {
  const name = (error as Error & { name?: string }).name ?? ''
  const message = error.message ?? ''

  return name === 'Pending' || /sync skip; aborting execution|test has been skipped/i.test(message)
}

let browserStackFailureReported = false

const markBrowserStackFailure = async (error: Error) => {
  if (!useBrowserStack) return

  // WDIO wraps import errors in a long preamble; retain the underlying error in BS.
  const specLoadMessage = error.message.startsWith('Unable to load spec files')
    ? /\nError: ([^\n]+)/.exec(error.message)?.[1]
    : undefined
  const failure = specLoadMessage ? new Error(specLoadMessage) : error
  const { reason, httpCode } = classifyFailureReason(failure)
  const shortMsg = failure.message?.slice(0, 150) ?? ''
  const lastStep = getLastBrowserStackStep()

  await browser
    .execute(`browserstack_executor: ${JSON.stringify({
      action: 'setSessionStatus',
      arguments: {
        status: 'failed',
        reason: `${reason} after ${lastStep}: ${shortMsg}`,
      },
    })}`)
    .then(() => { browserStackFailureReported = true })
    .catch(() => { console.warn('[WDIO] Could not mark BrowserStack session failed; the worker result remains failed.') })

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
  if (needsAndroid && !process.env.BS_APP_ANDROID) console.warn('[WDIO] BS_APP_ANDROID not set — using default Android build')
  if (needsIos && !process.env.BS_APP_IOS) console.warn('[WDIO] BS_APP_IOS not set — using default Lorenzo build')
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
    'appium:app': process.env.BS_APP_ANDROID || 'bs://eb1e0a0af91cb231c3d0e60a297208e73f500670',
    'appium:autoGrantPermissions': true,
    ...(process.env.BS_ANDROID_APP_PACKAGE ? { 'appium:appPackage': process.env.BS_ANDROID_APP_PACKAGE } : {}),
    ...(process.env.BS_ANDROID_APP_ACTIVITY ? { 'appium:appActivity': process.env.BS_ANDROID_APP_ACTIVITY } : {}),
    'appium:adbExecTimeout': 120000,
    'appium:appWaitDuration': 120000,
    'appium:appWaitActivity': '*',
    'appium:newCommandTimeout': 600,
    ...({ 'appium:enforceXPath1': true } as Record<string, unknown>),
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
      deviceName: process.env.BS_IOS_DEVICE || 'iPhone 16',
      osVersion: process.env.BS_IOS_OS || '18',
      ...({
        testObservability: true,
        testObservabilityOptions: {
          projectName: process.env.BS_PROJECT || 'moneybase_wdio',
          buildName: process.env.BS_BUILD || `local-${new Date().toISOString()}`,
          buildTag: browserStackBuildTags('ios'),
        },
      } as Record<string, unknown>),
    },
    'appium:app': process.env.BS_APP_IOS || 'bs://9fa60499a6ae535455d7bae48808c549e325e8dd',
    'appium:bundleId': process.env.BS_IOS_BUNDLE_ID,
    'appium:autoAcceptAlerts': true,
    'appium:newCommandTimeout': 3600,
    'appium:waitForQuiescence': false,
    'appium:nativeWebScreenshot': true,
    'appium:permissions': '{"com.moneybase.quality":{"location":"never","notifications":"NO"}}',
    ...browserStackResetOptions,
  },
]

const localCapabilities: WebdriverIO.Capabilities[] = [
  {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:deviceName': iosDeviceName,
    'appium:udid': iosUdid || '4D8D55A7-2461-4ED7-A28B-9946162BA884',
    'appium:app': iosApp,
    'appium:noReset': false,
    'appium:newCommandTimeout': 300,
    'appium:permissions': '{"com.moneybase.quality":{"contacts":"YES","location":"no","notifications":"NO"}}',
    'appium:autoAcceptAlerts': true,
    'appium:waitForQuiescence': false,
    'appium:shouldTerminateApp': true,
    'appium:useNewWDA': true,
    'appium:wdaLaunchTimeout': 120000,
    'appium:wdaStartupRetries': 4,
    'appium:wdaStartupRetryInterval': 20000,
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
    ...(androidUseInstalledApp ? {} : { 'appium:app': androidApp }),
    'appium:appPackage': androidAppPackage,
    'appium:appActivity': androidAppActivity,
    'appium:appWaitActivity': '*',
    'appium:autoGrantPermissions': true,
    'appium:noReset': androidUseInstalledApp,
    ...({ 'appium:enforceXPath1': true } as Record<string, unknown>),
    ...(androidUseInstalledApp ? { 'appium:forceAppLaunch': true } : {}),
    'appium:fullReset': false,
    'appium:autoAcceptAlerts': true,
    'appium:ensureWebviewsHavePages': true,
    'appium:nativeWebScreenshot': false,
    'appium:newCommandTimeout': 3600,
  },
]

// Specs live in domain folders (src/tests/<Area>/<feature>/); file names stay unique, so lists use names.
const specIndex = new Map<string, string>(
  (readdirSync(resolve('src/tests'), { recursive: true }) as string[])
    .filter(file => file.endsWith('.spec.ts'))
    .map(file => [basename(file), `./src/tests/${file.split(sep).join('/')}`] as const),
)
const specPath = (name: string) => {
  const file = name.endsWith('.spec.ts') ? name : `${name}.spec.ts`
  const path = specIndex.get(file)
  if (!path) throw new Error(`Spec ${file} was not found under src/tests`)
  return path
}

const smokeSpecs = [
  specPath('launch'),
  specPath('addbeneficiary.individual'),
  specPath('addfunds'),
  specPath('autoTopUp'),
  specPath('bankTransfer.p2p.individual'),
  specPath('bankTransfer.sepa.individual'),
  specPath('bankTransfer.swift.individual'),
  specPath('cardFreezeUnfreeze.joint'),
  specPath('cashFunds'),
  specPath('fxExchange'),
  specPath('homeAccountSwitch'),
  specPath('homeScreen'),
  specPath('homeSearch'),
  specPath('homeSearch.business'),
  specPath('onboarding'),
  specPath('orders'),
  specPath('physicalcardcreation'),
  specPath('portfolio'),
  specPath('priceAlerts'),
  specPath('watchlist'),
]

// One owner per smoke spec. onboarding.spec.ts creates its own applicant and only shares KER's CI queue.
const smokeSpecsByAccount: Record<string, string[]> = {
  primary: ['cardFreezeUnfreeze.joint', 'portfolio', 'autoTopUp', 'bankTransfer.sepa.individual'],
  secondary: ['addfunds', 'addbeneficiary.individual', 'homeAccountSwitch', 'onboarding'],
  rog: ['physicalcardcreation', 'homeScreen', 'launch'],
  laz: ['homeSearch', 'homeSearch.business', 'bankTransfer.p2p.individual'],
  mum: ['bankTransfer.swift.individual', 'orders', 'fxExchange'],
  pop: ['cashFunds', 'priceAlerts', 'watchlist'],
}
const smokeAccountSpecs = (slot: string) => smokeSpecsByAccount[slot].map(name => specPath(name))
// BrowserStack has 2 parallel sessions. Each lane owns 3 accounts and rotates them, so an account
// never runs in both lanes and two other accounts' specs separate its consecutive logins.
const smokeLaneSpecs = (slots: string[]) => {
  const longest = Math.max(...slots.map(slot => smokeAccountSpecs(slot).length))
  return Array.from({ length: longest }).flatMap((_, round) =>
    slots.flatMap(slot => smokeAccountSpecs(slot).slice(round, round + 1)),
  )
}
const smokeSlotBySpecName = new Map<string, string>(
  Object.entries(smokeSpecsByAccount).flatMap(([slot, names]) => names.map(name => [`${name}.spec.ts`, slot] as const)),
)

// Regression owners live in src/data/regressionAccounts.json; scripts/regressionLanes.cjs orders
// each lane so one account never logs in twice in a row. The CI workflow uses the same module.
const regressionLaneSpecs = (lane: string) => regressionLanes.laneOrder(lane).map(spec => specPath(spec))
const nativeAlertAssertionSpecs = new Set([
  'authentication.changePasscodeCancel.spec.ts',
  'profile.businessSettings.spec.ts',
  'onboarding.passcodePolicy.spec.ts',
  'personalDetails.nameEditConfirmation.spec.ts',
])

const authSlotForSpec = (specName?: string) => {
  if (!specName) return ''
  const smokeSlot = smokeSlotBySpecName.get(specName)
  if (smokeSlot) return smokeSlot
  return regressionLanes.slotForSpec(specName)
}

const capabilities = (useBrowserStack ? browserStackCapabilities : localCapabilities)
  .filter((capability) => {
    if (!platformFilter) return true
    return String(capability.platformName).toLowerCase() === platformFilter
  })

export const config: WebdriverIO.Config = {
  runner: 'local',
  specs: ['./src/tests/**/*.spec.ts'],
  suites: {
    smoke: smokeSpecs,
    regression: ['./src/tests/**/*.spec.ts'],
    launchOnly: [specPath('launch')],
    onboarding: [specPath('onboarding')],
    pricePlan: [specPath('pricePlan')],
    smokeLane1: smokeLaneSpecs(['primary', 'rog', 'mum']),
    smokeLane2: smokeLaneSpecs(['secondary', 'laz', 'pop']),
    smokeWithoutOnboarding: smokeSpecs.filter((spec) => spec !== specPath('onboarding')),
    regressionLane1: regressionLaneSpecs('lane1'),
    regressionLane2: regressionLaneSpecs('lane2'),
  },
  maxInstances,
  specFileRetries: Number(process.env.SPEC_FILE_RETRIES ?? 1),
  specFileRetriesDelay: 0,
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
      outputDir: allureResultsDir,
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
    writeAllureEnvironment(capabilities as WebdriverIO.Capabilities[], allureResultsDir)
    writeAllureExecutor(allureResultsDir)
  },

  beforeSession: function (_config, capabilities, specs) {
    browserStackFailureReported = false
    const specName = specs.length > 0 ? basename(specs[0]) : 'unknown-spec'
    const requested = capabilities as Record<string, unknown>
    const sessionCaps = (requested.alwaysMatch as Record<string, unknown> | undefined) ?? requested
    if (useBrowserStack && specName === 'authentication.welcomeSignIn.spec.ts') {
      Object.assign(sessionCaps, { 'appium:fullReset': true, 'appium:noReset': false })
    }
    if (String(sessionCaps.platformName ?? platformFilter).toLowerCase() === 'ios' && nativeAlertAssertionSpecs.has(specName)) {
      sessionCaps['appium:autoAcceptAlerts'] = false
    }
    const authSlot = String(
      process.env.MB_AUTH_SLOT ||
      authSlotForSpec(specName),
    )
    if (['primary', 'secondary', 'kat', 'mai', 'laz', 'rog', 'mum', 'pop'].includes(authSlot)) {
      process.env.MB_AUTH_SLOT = authSlot
      console.log(`[WDIO] Auth slot for ${specName}: ${authSlot}`)
    } else {
      delete process.env.MB_AUTH_SLOT
    }
  },

  after: async function (result, _capabilities, specs) {
    if (!useBrowserStack) return
    if (typeof browser.execute !== 'function') return
    const platform = String(browser.capabilities.platformName ?? platformFilter ?? 'unknown')
    const specName = specs.length > 0 ? basename(specs[0]) : 'unknown-spec'
    const suiteName = cliSuiteTag ? `${cliSuiteTag} :: ` : ''
    const sessionName = `${platform} :: ${suiteName}${specName}`
    await browser
      .execute(`browserstack_executor: ${JSON.stringify({
        action: 'setSessionName',
        arguments: { name: sessionName },
      })}`)
      .catch(() => {})

    if (result !== 0) {
      // Import/runtime failures can bypass both afterTest and afterHook.
      if (!browserStackFailureReported) {
        const workerResult: unknown = result
        await markBrowserStackFailure(
          workerResult instanceof Error
            ? workerResult
            : new Error(`WDIO worker exited with result ${String(workerResult)} (${specName})`),
        )
      }
      const caps = browser.capabilities as Record<string, unknown>
      const appId = String(
        caps['appium:appPackage']
          ?? caps.appPackage
          ?? caps['appium:bundleId']
          ?? caps.bundleId
          ?? '',
      )
      if (appId) await browser.terminateApp(appId).catch(() => {})
    }
  },

  afterTest: async function (test, context, { error }) {
    if (!error) return
    if (isMochaSkipError(error)) {
      console.log(`[WDIO] Skipped test ignored for BrowserStack failure status: ${test.title}`)
      return
    }
    await markBrowserStackFailure(error)
    await attachFailureArtifacts()
  },

  afterHook: async function (_test, _context, { error }) {
    if (!error) return
    if (isMochaSkipError(error)) return
    await markBrowserStackFailure(error)
    await attachFailureArtifacts()
  },

  onComplete: function () {
    try {
      execSync(`npx allure generate ${allureResultsDir} -o ${allureReportDir} --clean`, { stdio: 'inherit' })
    } catch (err) {
      console.warn('Allure report generation failed:', err)
    }
  },
}
