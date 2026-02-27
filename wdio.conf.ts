import type { Options } from '@wdio/types'
import { browser } from '@wdio/globals'
import allure from '@wdio/allure-reporter'





export const config: WebdriverIO.Config = {
  runner: 'local',
  specs: ['./src/tests/**/*.spec.ts'],
  maxInstances: 1,
  logLevel: 'info',
  framework: 'mocha',

  hostname: '127.0.0.1',
  port: 4723,
  path: '/',

  reporters: [
    'spec',
    ['allure', {
      outputDir: 'allure-results',
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: false,
    }],
  ],

  services: [],

  capabilities: [
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
      'appium:nativeWebScreenshot': true
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
  ],

  mochaOpts: { ui: 'bdd', timeout: 120000 },

  //  Add this without changing anything else
  afterTest: async function (test, context, { error }) {
    if (!error) return

    // 1) Screenshot
    const screenshot = await browser.takeScreenshot()
    allure.addAttachment(
      'Screenshot',
      Buffer.from(screenshot, 'base64'),
      'image/png'
    )

    // 2) Page source (native hierarchy)
    const source = await browser.getPageSource()
    allure.addAttachment('Page Source', source, 'text/xml')

    // 3) Contexts (useful for WebView)
    const contexts = await browser.getContexts().catch(() => [])
    allure.addAttachment('Contexts', JSON.stringify(contexts, null, 2), 'application/json')

    // 4) Capabilities (device/os/build)
    const caps = browser.capabilities
    allure.addAttachment('Capabilities', JSON.stringify(caps, null, 2), 'application/json')
  },
}
