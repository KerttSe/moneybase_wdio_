const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const { execFileSync } = require('node:child_process')
const ts = require('typescript')

function load(file, mocks = {}, env = {}) {
  const module = { exports: {} }
  const source = fs.readFileSync(file, 'utf8')
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  vm.runInNewContext(code, {
    module, exports: module.exports, Error, URL, console,
    process: { env },
    require(name) {
      if (name in mocks) return mocks[name]
      throw new Error(`Unmocked dependency: ${name}`)
    },
  })
  return module.exports
}

async function waitUntil(predicate, options) {
  for (let i = 0; i < 5; i++) if (await predicate()) return true
  throw new Error(options.timeoutMsg || 'waitUntil timeout')
}

function loadPage(name, globals = {}, dependencies = {}, env = {}) {
  return load(`src/pages/${name}.ts`, {
    './BasePage': { default: class {} },
    './HomeScreenPage': { default: {} },
    '../data/credentials': { AUTH: { phone: '99112233', individualAccountCode: 'SECONDARY' } },
    '../helpers/browserstack.helper': { markBrowserStackStep: async () => {} },
    '@wdio/globals': { browser: { isIOS: true }, $: selector => ({ selector }), ...globals },
    ...dependencies,
  }, env).default
}

test('iOS selectors match semantic targets, not More search, Portfolio or hidden web navigation', t => {
  try { execFileSync('xmllint', ['--version'], { stdio: 'ignore' }) } catch {
    t.skip('xmllint is not installed')
    return
  }
  const cases = [
    ['HomeSearchPage', 'searchInput', 'home-search'],
    ['CashFundsPage', 'discoverTabIOS', 'discover-entry'],
    ['FXExchangePage', 'homeExchangeButton', 'home-exchange'],
    ['WatchlistPage', 'watchlistActionIOS', 'watchlist-action'],
    ['AutoTopUpPage', 'saveBtn', 'save-text'],
  ]
  for (const [name, getter, marker] of cases) {
    const exported = loadPage(name)
    const page = typeof exported === 'function' ? new exported() : exported
    const selector = page[getter].selector
    const xpath = `concat(count(${selector}), ':', string((${selector})/@marker))`
    const actual = execFileSync('xmllint', ['--xpath', xpath, 'tests/unit/fixtures/smoke72-ios.xml'], { encoding: 'utf8' })
    assert.equal(actual.trim(), `1:${marker}`, name)
  }
})

test('HTTP classification ignores source lines, numeric selectors and durations', () => {
  const { classifyFailureReason } = load('src/helpers/failureClassification.helper.ts')
  for (const number of [401, 429, 511, 529, 578, 596]) {
    const error = new Error(`element amount_${number} did not appear after 20000ms`)
    error.stack = `Error\n at Page.test (Page.ts:${number}:15)`
    assert.equal(classifyFailureReason(error).reason, 'AUTOMATION_BUG')
    assert.equal(classifyFailureReason(error).httpCode, undefined)
  }
  assert.equal(classifyFailureReason(new Error('HTTP 503 Service Unavailable')).reason, 'BE_ERROR[503]')
  assert.equal(classifyFailureReason(new Error('Request failed with status code 401')).reason, 'BE_ERROR[401]')
  assert.equal(classifyFailureReason(new Error('HTTP/1.1 511 Network Authentication Required')).reason, 'ENVIRONMENT_ISSUE[511]')
  assert.equal(classifyFailureReason(new Error('CONFIGURATION_ERROR: wrong phone')).reason, 'TEST_DATA_ISSUE')
  assert.equal(classifyFailureReason(new Error('OTP rejected by the app')).reason, 'BE_ERROR')
  assert.equal(classifyFailureReason(new Error('APP_NAVIGATION_ERROR: wrong destination')).reason, 'APP_NAVIGATION_ERROR')
})

test('account-switch smoke uses the centralized transition for both identities', async () => {
  const page = loadPage('HomeScreenPage')
  const calls = []
  page.ensureIOSHomeAccount = async (type, code) => calls.push([type, code])
  await page.verifyIOSAccountSwitchingAcrossTypes()
  assert.deepEqual(calls, [['Business', 'DER00003'], ['Individual', 'SECONDARY']])
})

test('secondary account switch selects and verifies its own business identity', async () => {
  const page = loadPage('HomeScreenPage', {}, {
    '../data/credentials': { AUTH: { individualAccountCode: 'SECONDARY', businessAccountCode: 'SECONDARY_BUSINESS' } },
  })
  const calls = []
  page.ensureIOSHomeAccount = async (type, code, item) => calls.push({ type, code, selector: item.selector })
  await page.verifyIOSAccountSwitchingAcrossTypes()
  assert.equal(calls[0].code, 'SECONDARY_BUSINESS')
  assert.match(calls[0].selector, /SECONDARY_BUSINESS/)
  assert.doesNotMatch(calls[0].selector, /DER00003/)
  assert.equal(calls[1].code, 'SECONDARY')
})

test('FX readiness requires both wallet fields instead of a title shared with Home', async () => {
  const Page = loadPage('FXExchangePage')
  const page = new Page()
  let from = false, to = false
  Object.defineProperty(page, 'fromWalletField', { get: () => ({ isExisting: async () => from }) })
  Object.defineProperty(page, 'toWalletField', { get: () => ({ isExisting: async () => to }) })
  assert.equal(await page.isIOSExchangeFormReady(), false)
  from = true
  assert.equal(await page.isIOSExchangeFormReady(), false)
  to = true
  assert.equal(await page.isIOSExchangeFormReady(), true)
})

test('account transition closes More and waits for the requested code, not just any Home label', async () => {
  let more = true, reads = 0, closes = 0
  const page = loadPage('HomeScreenPage', { browser: { isIOS: true, waitUntil } })
  Object.defineProperty(page, 'moreNavBarIOS', { get: () => ({ isExisting: async () => more }) })
  for (const key of ['homeRootIOS', 'profilePickerAccountCodeLabelIOS']) {
    Object.defineProperty(page, key, { get: () => ({ isExisting: async () => !more }) })
  }
  page.tap = async element => { assert.match(element.selector, /More.*close/); closes++; more = false }
  page.getIOSAccountCodeLabel = async () => ++reads === 1 ? 'OLD' : 'SECONDARY'
  await page.waitForIOSHomeAccount('Individual', 'SECONDARY')
  assert.equal(closes, 1)
  assert.equal(reads, 2)
})

for (const state of ['disabled', 'enabled', 'review-open', 'click-no-transition']) {
  test(`payment review handles ${state} without blind taps or slider retries`, async () => {
    let clicks = 0, sliderWaits = 0, sliderOpen = state === 'review-open'
    const review = {
      isExisting: async () => !sliderOpen,
      waitForEnabled: async () => { if (state === 'disabled') throw new Error('disabled') },
      click: async () => { clicks++; sliderOpen = state !== 'click-no-transition' },
    }
    const slider = {
      isExisting: async () => sliderOpen,
      waitForExist: async options => { sliderWaits++; if (!sliderOpen) throw new Error(options.timeoutMsg) },
    }
    const { openIOSPaymentReview } = load('src/helpers/iosPayment.helper.ts', {
      '@wdio/globals': {
        browser: { hideKeyboard: async () => {}, waitUntil },
        $: selector => selector === '~makePayment_button_review' ? review :
          selector === '~makePayment_slider_pay' ? slider : { getText: async () => 'Balance: EUR 0.00' },
      },
    })
    if (state === 'disabled') {
      await assert.rejects(openIOSPaymentReview(), /TEST_PRECONDITION.*Balance: EUR 0.00/)
      assert.equal(clicks, 0)
      assert.equal(sliderWaits, 0)
    } else if (state === 'click-no-transition') {
      await assert.rejects(openIOSPaymentReview(), /review screen did not open/)
      assert.equal(clicks, 1)
    } else {
      await openIOSPaymentReview()
      assert.equal(clicks, state === 'enabled' ? 1 : 0)
    }
  })
}

test('OTP destination validation accepts formatting differences but rejects a different account', () => {
  const { assertOtpPhoneMatches } = load('src/helpers/iosOtp.helper.ts', { '@wdio/globals': {} })
  assertOtpPhoneMatches('99112233', '+356 9911 2233')
  assertOtpPhoneMatches('+35699112233', 'Enter the 6-digit code sent to\n+356 9911 2233')
  assert.throws(() => assertOtpPhoneMatches('99887766', '+356 9911 2233'), /CONFIGURATION_ERROR/)
  assert.throws(() => assertOtpPhoneMatches('', '+356 9911 2233'), /CONFIGURATION_ERROR/)
  assert.throws(() => assertOtpPhoneMatches('99112233', 'Enter the 6-digit code'), /CONFIGURATION_ERROR/)
})

test('an explicit OTP rejection cannot be masked by a success anchor underneath', async () => {
  let successChecks = 0
  const { waitForIOSOtpOutcome } = load('src/helpers/iosOtp.helper.ts', {
    '@wdio/globals': { browser: { waitUntil }, $: () => ({ isExisting: async () => true }) },
  })
  await assert.rejects(waitForIOSOtpOutcome(async () => { successChecks++; return true }, 'Physical Card'), /OTP rejected/)
  assert.equal(successChecks, 0)
})

test('OTP confirmation waits for positive completion', async () => {
  let checks = 0
  const { waitForIOSOtpOutcome } = load('src/helpers/iosOtp.helper.ts', {
    '@wdio/globals': { browser: { waitUntil }, $: () => ({ isExisting: async () => false }) },
  })
  await waitForIOSOtpOutcome(async () => ++checks === 3, 'Add Beneficiary')
  assert.equal(checks, 3)
  await assert.rejects(waitForIOSOtpOutcome(async () => false, 'Add Beneficiary'), /expected success screen/)
})

test('OTP API literal URLs cannot silently override the requested account', () => {
  const { OtpHelper } = load('src/helpers/otp.helper.ts', { axios: {} })
  const phone = '356 9911 2233'
  assert.equal(OtpHelper.buildUrl(phone, { urlTemplate: 'https://example.test/getLatest/{phone}' }), 'https://example.test/getLatest/356%209911%202233')
  assert.equal(OtpHelper.buildUrl(phone, { urlTemplate: 'https://example.test/getLatest/356%209911%202233' }), 'https://example.test/getLatest/356%209911%202233')
  assert.throws(() => OtpHelper.buildUrl(phone, { urlTemplate: 'https://example.test/getLatest/356%209988%207766' }), /CONFIGURATION_ERROR/)
})

test('physical card uses the active account for API OTP and never falls back to the dummy code', async () => {
  let phone, options
  const dependencies = {
    '../helpers/otp.helper': { default: { getLatestOtp: async value => { options = value; return '123456' } } },
    '../helpers/iosOtp.helper': { assertIOSOtpPhone: async value => { phone = value } },
  }
  const page = loadPage('PhysicalCardCreationPage', {}, dependencies, {
    OTP_API_BASE_URL: 'https://example.test', LAST_LOGIN_OTP: '654321', PHYSICAL_CARD_OTP: '000000',
  })
  assert.equal(await page.getPhysicalCardOtp(), '123456')
  assert.equal(phone, '99112233')
  assert.equal(options.phone, phone)
  assert.equal(options.excludeTokens[0], '654321')
  const unconfigured = loadPage('PhysicalCardCreationPage', {}, dependencies, { PHYSICAL_CARD_OTP: '000000' })
  await assert.rejects(unconfigured.getPhysicalCardOtp(), /CONFIGURATION_ERROR.*OTP API endpoint/)
})

for (const platform of ['IOS', 'Android']) {
  for (const apiFails of [false, true]) {
    test(`physical card ${platform} waits for OTP, calls API, and never types a fallback (API failure: ${apiFails})`, async () => {
      const calls = []
      const page = loadPage('PhysicalCardCreationPage', {
        browser: { isIOS: platform === 'IOS' },
      }, {
        '../helpers/otp.helper': { default: { getLatestOtp: async () => {
          calls.push('api')
          if (apiFails) throw new Error('OTP API unavailable')
          return '123456'
        } } },
        '../helpers/iosOtp.helper': {
          assertIOSOtpPhone: async () => calls.push('phone'),
          waitForIOSOtpOutcome: async () => calls.push('confirmed'),
        },
      }, { OTP_API_BASE_URL: 'https://example.test', PHYSICAL_CARD_OTP: '000000' })
      page.waitForOtpEntryIOS = async () => calls.push('screen')
      Object.defineProperty(page, 'otpInputAndroid', { get: () => ({ waitForDisplayed: async () => calls.push('screen') }) })
      page[`enterOtp${platform}`] = async otp => { assert.equal(otp, '123456'); calls.push('type') }
      page.closeApplePayProposalIOS = page.closeCardSheetAndroid = async () => calls.push('close')
      if (apiFails) await assert.rejects(page[`confirmPhysicalCardOtp${platform}`](), /OTP API unavailable/)
      else await page[`confirmPhysicalCardOtp${platform}`]()
      assert.deepEqual(calls, [
        'screen', ...(platform === 'IOS' ? ['phone'] : []), 'api',
        ...(apiFails ? [] : ['type', ...(platform === 'IOS' ? ['confirmed'] : []), 'close']),
      ])
    })
  }
}

for (const acknowledged of [true, false]) {
  test(`Watchlist taps once and consumes its acknowledgement once (${acknowledged})`, async () => {
    let taps = 0, waits = 0
    const Page = loadPage('WatchlistPage', {
      $: () => ({ waitForExist: async () => { waits++; if (!acknowledged) throw new Error('not acknowledged') } }),
    })
    const page = new Page()
    page.tapIOSExists = async () => { taps++ }
    if (acknowledged) await page.tapWatchlistActionIOS()
    else await assert.rejects(page.tapWatchlistActionIOS(), /not acknowledged/)
    assert.equal(taps, 1)
    assert.equal(waits, 1)
  })
}

test('Auto Top-Up does not report a save when the form stays open', async () => {
  const Page = loadPage('AutoTopUpPage', {
    $: () => ({
      waitForEnabled: async () => {},
      waitForExist: async options => { assert.equal(options.reverse, true); throw new Error(options.timeoutMsg) },
    }),
  })
  const page = new Page()
  let taps = 0
  page.tap = async () => { taps++ }
  await assert.rejects(page.saveAutoTopUp(), /rule has not been confirmed as saved/)
  assert.equal(taps, 1)
})

test('Auto Top-Up can reopen from Add Funds without requiring a hidden Home screen', async () => {
  const Page = loadPage('AutoTopUpPage', { $: () => ({ isExisting: async () => true }) })
  const page = new Page()
  page.ensureIndividualAccountIOS = async () => assert.fail('Unexpected Home navigation')
  await page.openFromHome()
})
