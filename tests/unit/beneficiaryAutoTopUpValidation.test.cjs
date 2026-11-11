const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { specPath } = require('./fixtures/specFiles.cjs')
const vm = require('node:vm')
const ts = require('typescript')

const codeCache = new Map()
function load(file, mocks = {}, env = {}) {
  if (!codeCache.has(file)) codeCache.set(file, ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText)
  const module = { exports: {} }
  vm.runInNewContext(codeCache.get(file), {
    module, exports: module.exports, process: { env, cwd: () => '/fixture' }, Error, console,
    require(name) {
      assert.ok(name in mocks, `Unmocked dependency ${name}`)
      return mocks[name]
    },
  })
  return module.exports
}

async function waitUntil(predicate, options) {
  for (let i = 0; i < 3; i++) if (await predicate()) return
  throw new Error(options.timeoutMsg)
}

function page(name, browser = {}, $ = selector => ({ selector })) {
  const globals = { browser: { isIOS: true, waitUntil, ...browser }, $ }
  const control = load('src/helpers/controlState.helper.ts', { '@wdio/globals': globals })
  const result = load(`src/pages/${name}.ts`, {
    '@wdio/globals': globals,
    './BasePage': { default: class {} }, './HomeScreenPage': { default: {} },
    '../helpers/otp.helper': {}, '../helpers/iosOtp.helper': {},
    '../helpers/controlState.helper': control, '../data/credentials': { AUTH: {} },
  }).default
  return new result()
}

test('IBAN fixtures isolate length, checksum and country failures', () => {
  const iban = load('src/data/ibans.ts')
  const { beneficiaryValidationData } = load('src/data/beneficiaryValidation.ts', { './ibans': iban })
  for (let i = 0; i < 100; i++) {
    const data = beneficiaryValidationData()
    assert.equal(data.iban.length, 31)
    assert.equal(iban.isValidIban(data.iban), true)
    assert.equal(data.shortIban.length, 30)
    assert.equal(data.invalidChecksum.length, 31)
    assert.equal(data.invalidChecksum.startsWith('MT'), true)
    assert.equal(iban.isValidIban(data.invalidChecksum), false)
    assert.equal(iban.isValidIban(data.foreignIban), true)
    assert.equal(data.foreignIban.startsWith('DE'), true)
  }
})

for (const [min, max, below, above] of [
  ['0.30', '0.40', '0.29', '0.41'],
  ['0.01', '100', '0.00', '100.01'],
  ['10', '99.99', '9.99', '100.00'],
  ['90071992547409.90', '90071992547409.99', '90071992547409.89', '90071992547410.00'],
]) {
  test(`range boundary fixtures remain exact in cents (${min}..${max})`, () => {
    const { autoTopUpRangeFixture } = load('src/data/autoTopUpValidation.ts', {}, {
      AUTO_TOP_UP_TEST_MIN_AMOUNT: min, AUTO_TOP_UP_TEST_MAX_AMOUNT: max,
    })
    const range = autoTopUpRangeFixture()
    assert.equal(range.below, below)
    assert.equal(range.above, above)
  })
}

for (const env of [{},
  { AUTO_TOP_UP_TEST_MIN_AMOUNT: '0', AUTO_TOP_UP_TEST_MAX_AMOUNT: '100' },
  { AUTO_TOP_UP_TEST_MIN_AMOUNT: '100', AUTO_TOP_UP_TEST_MAX_AMOUNT: '10' },
  { AUTO_TOP_UP_TEST_MIN_AMOUNT: '10', AUTO_TOP_UP_TEST_MAX_AMOUNT: '10' },
  { AUTO_TOP_UP_TEST_MIN_AMOUNT: '1.001', AUTO_TOP_UP_TEST_MAX_AMOUNT: '10' },
  { AUTO_TOP_UP_TEST_MIN_AMOUNT: '1e2', AUTO_TOP_UP_TEST_MAX_AMOUNT: '1000' },
]) {
  test(`missing/invalid amount fixtures are failures, never passing skips (${JSON.stringify(env)})`, () => {
    const { autoTopUpRangeFixture } = load('src/data/autoTopUpValidation.ts', {}, env)
    assert.throws(autoTopUpRangeFixture, /CONFIGURATION_ERROR/)
  })
}

function rejectionPage({ enabled, error, otp = false, afterClickEnabled = enabled }) {
  const events = []
  const p = page('AddBeneficiaryPage', {}, () => ({ isExisting: async () => otp }))
  let state = enabled
  const control = {
    waitForExist: async () => {}, isEnabled: async () => state,
    click: async () => { events.push('click'); state = afterClickEnabled },
  }
  Object.defineProperty(p, 'validationContinue', { value: control })
  p.validationField = () => ({ waitForDisplayed: async () => events.push('form') })
  p.validationError = kind => ({ waitForDisplayed: async () => { events.push(kind); if (!error) throw new Error('no validation error') } })
  return { p, events }
}

test('disabled name validation does not submit or request OTP', async () => {
  const { p, events } = rejectionPage({ enabled: false })
  await p.verifyBankDetailsRejected('name')
  assert.deepEqual(events, ['form'])
})

test('a temporary disabled state after clicking cannot masquerade as a name validation error', async () => {
  const { p } = rejectionPage({ enabled: true, error: false, afterClickEnabled: false })
  await assert.rejects(p.verifyBankDetailsRejected('name'), /no validation error/)
})

for (const kind of ['length', 'checksum', 'country']) {
  test(`IBAN ${kind} requires its specific error even if Continue is disabled`, async () => {
    const { p, events } = rejectionPage({ enabled: false, error: true })
    await p.verifyBankDetailsRejected(kind)
    assert.deepEqual(events, [kind, 'form'])
    const missing = rejectionPage({ enabled: false, error: false }).p
    await assert.rejects(missing.verifyBankDetailsRejected(kind), /no validation error/)
  })
}

test('unexpected OTP after invalid beneficiary entry fails the test', async () => {
  const { p } = rejectionPage({ enabled: false, error: true, otp: true })
  await assert.rejects(p.verifyBankDetailsRejected('checksum'), /unexpectedly opened OTP/)
})

test('generic checksum selectors exclude length/country errors on both platforms', () => {
  for (const isIOS of [true, false]) {
    const p = page('AddBeneficiaryPage', { isIOS, isAndroid: !isIOS })
    const selector = p.validationError('checksum').selector
    assert.match(selector, /checksum/)
    assert.match(selector, /NOT|not\(/)
    assert.match(selector, /length/)
    assert.match(selector, /country/)
  }
})

test('a pre-existing validation message cannot count as a new rejection', async () => {
  const p = page('AddBeneficiaryPage')
  p.validationError = () => ({ isDisplayed: async () => true })
  await assert.rejects(p.verifyNoValidationError('length'), /already shows/)
})

test('typing failure cannot count as app input validation', async () => {
  const p = page('AddBeneficiaryPage', { hideKeyboard: async () => {} })
  p.validationField = () => ({
    waitForDisplayed: async () => {}, clearValue: async () => {}, setValue: async () => {},
    getAttribute: async () => 'unchanged', click: async () => {},
  })
  await assert.rejects(p.enterValidationField('name', 'Alex7'), /did not retain/)
})

test('currency reset cannot pass when selected-state metadata was never available', async () => {
  const p = page('AutoTopUpPage')
  for (const key of ['validationThresholdSection', 'validationAmountSection']) {
    Object.defineProperty(p, key, { value: { waitForExist: async () => {}, $$: async () => [] } })
  }
  await assert.rejects(p.verifyValidationSelections(true), /expose a selected value/)
})

test('currency reset must clear both amount and threshold, not just one', async () => {
  const p = page('AutoTopUpPage')
  Object.defineProperty(p, 'validationThresholdSection', { value: { waitForExist: async () => {}, $$: async () => [] } })
  Object.defineProperty(p, 'validationAmountSection', { value: { waitForExist: async () => {}, $$: async () => [{}] } })
  await assert.rejects(p.verifyValidationSelections(false), /amount must be cleared/)
})

test('Android amount setup selects the threshold section explicitly and never saves a rule', async () => {
  const events = []
  const p = page('AutoTopUpPage', { isIOS: false, isAndroid: true })
  const preset = { waitForDisplayed: async () => {} }
  Object.defineProperty(p, 'validationThresholdSection', { value: { $: () => preset } })
  p.tap = async el => events.push(el === preset ? 'threshold' : 'Done')
  p.openValidationAmountEditor = async () => events.push('open amount')
  p.enterValidationCustomAmount = async value => events.push(value)
  p.verifyValidationAmountDoneEnabled = async enabled => events.push(enabled)
  p.validationAmountControls = async () => ({ input: { waitForDisplayed: async ({ reverse }) => events.push(reverse) }, done: {} })
  p.saveAutoTopUp = async () => assert.fail('Save must not be called')
  await p.configureValidationAmounts('1500')
  assert.deepEqual(events, ['threshold', 'open amount', '1500', true, 'Done', true])
})

for (const [requested, actual] of [['1500', '1500.00'], ['1500.50', '1500,50'], ['0.30', 'EUR 0.30']]) {
  test(`custom amount readback accepts equivalent decimal formatting (${actual})`, async () => {
    for (const isIOS of [true, false]) {
      const p = page('AutoTopUpPage', { isIOS, isAndroid: !isIOS })
      p.validationAmountControls = async () => ({ input: {
        waitForDisplayed: async () => {}, clearValue: async () => {}, setValue: async () => {},
        getAttribute: async () => actual, getText: async () => actual,
      } })
      await p.enterValidationCustomAmount(requested)
    }
  })
}

for (const actual of ['', '10.00', '100.0.1']) {
  test(`custom amount typing failure cannot masquerade as a range rejection (${actual || 'empty'})`, async () => {
    const p = page('AutoTopUpPage')
    p.validationAmountControls = async () => ({ input: {
      waitForDisplayed: async () => {}, clearValue: async () => {}, setValue: async () => {},
      getAttribute: async () => actual,
    } })
    await assert.rejects(p.enterValidationCustomAmount('100.01'), /did not retain/)
  })
}

for (const deleteVisible of [true, false]) {
  test(`existing-rule setup requires visible Delete before verifying selections (${deleteVisible})`, async () => {
    const events = []
    const p = page('AutoTopUpPage', {}, selector => ({ selector, waitForDisplayed: async () => {} }))
    p.openFromHome = async () => events.push('home')
    p.goToAutoTopUpList = async () => events.push('list')
    p.tap = async rule => { assert.equal(rule.selector, '~existing-rule'); events.push('rule') }
    Object.defineProperty(p, 'autoTopUpDetailsScreen', { value: { waitForExist: async () => {} } })
    Object.defineProperty(p, 'deleteBtn', { value: { waitForDisplayed: async () => {
      events.push('delete')
      if (!deleteVisible) throw new Error('Delete hidden')
    } } })
    p.verifyValidationSelections = async selected => { assert.equal(selected, true); events.push('selected') }
    if (deleteVisible) {
      await p.openValidationExistingRule('existing-rule')
      assert.deepEqual(events, ['home', 'list', 'rule', 'delete', 'selected'])
    } else {
      await assert.rejects(p.openValidationExistingRule('existing-rule'), /Delete hidden/)
      assert.deepEqual(events, ['home', 'list', 'rule', 'delete'])
    }
  })
}

test('KYC setup reaches Personal Details without submitting names or saving an incomplete account', async () => {
  const events = []
  const { default: Page } = load('src/pages/OnboardingPage.ts', {
    '@wdio/globals': { browser: {}, $: () => {} }, './BasePage': { default: class {} },
    'node:fs': {}, 'node:path': {}, '../helpers/otp.helper': {}, '../helpers/phone.helper': {}, './LoginPage': {},
    '../helpers/controlState.helper': {},
  })
  const p = new Page()
  p.prepareSmokeOnboarding = async () => { events.push('new phone'); return { token: 'fixture' } }
  p.verifySmokeOnboardingMobile = async context => { assert.equal(context.token, 'fixture'); events.push('mobile verified') }
  Object.defineProperty(p, 'onboardingNameScreen', { value: { waitForDisplayed: async () => events.push('name screen') } })
  p.setValidationPersonalNames = async (first, last) => events.push(`${first}/${last}`)
  p.verifyValidationPersonalDetailsReady = async () => events.push('valid baseline')
  p.fillSmokeOnboardingPersonalDetails = async () => assert.fail('Must not submit names')
  p.finishSmokeOnboarding = async () => assert.fail('Must not complete account creation')
  await p.prepareValidationPersonalDetails()
  assert.deepEqual(events, ['new phone', 'mobile verified', 'name screen', 'John/Borg', 'valid baseline'])
})

test('KYC phone generation excludes every configured account, including secondary and security', () => {
  const keys = ['MB_PHONE', 'MB_ALT_PHONE', 'AUTH_OTP_MB_PHONE', 'AUTH_SECURITY_MB_PHONE', 'PD_MB_PHONE', 'BH_MB_PHONE', 'BC_ADMIN_SELF_ASSIGN_PHONE', 'ADD_BENEFICIARY_MB_PHONE']
  const env = Object.fromEntries(keys.map((key, index) => [key, index % 2 ? `+356 9900 000${index + 1}` : `9900000${index + 1}`]))
  let candidate = 0
  const writes = []
  const { generateUniqueMalteseMobileNumber } = load('src/helpers/phone.helper.ts', {
    'node:crypto': { randomInt: () => ++candidate },
    'node:fs': { existsSync: () => false, mkdirSync() {}, writeFileSync: (path, data) => writes.push(data) },
    'node:path': { resolve: (...parts) => parts.join('/'), dirname: () => '/fixture' },
  }, env)
  assert.equal(generateUniqueMalteseMobileNumber().local, '99000009')
  assert.equal(candidate, 9)
  assert.equal(writes.length, 1)
})

test('every new matrix case is implemented in its own independent spec', () => {
  const cases = {
    'beneficiary.nameValidation.spec.ts': 'TC3304', 'beneficiary.ibanLength.spec.ts': 'TC3305',
    'beneficiary.ibanChecksum.spec.ts': 'TC3306', 'beneficiary.ibanCountry.spec.ts': 'TC3307',
    'autoTopUp.editUnchanged.spec.ts': 'TC3343', 'autoTopUp.currencyReset.spec.ts': 'TC3344',
    'autoTopUp.amountAboveRange.spec.ts': 'TC3347', 'autoTopUp.amountBelowRange.spec.ts': 'TC3348',
    'onboarding.invalidNames.spec.ts': 'TC3085', 'onboarding.shortName.spec.ts': 'TC3086',
  }
  for (const [file, id] of Object.entries(cases)) {
    const source = fs.readFileSync(specPath(file), 'utf8')
    assert.deepEqual([...new Set(source.match(/TC\d+/g))], [id], file)
    assert.doesNotMatch(source, /\.saveAutoTopUp\(|\.submitSmokeBeneficiary|\.confirmSmokeBeneficiary|\.finishSmokeOnboarding\(/, file)
  }
})

for (const enabled of [false, true]) {
  test(`KYC rejection validates the ${enabled ? 'on-submit error' : 'disabled Next'} path`, async () => {
    const events = []
    const next = { waitForExist: async () => {}, isEnabled: async () => enabled, click: async () => events.push('submit') }
    const { default: Page } = load('src/pages/OnboardingPage.ts', {
      '@wdio/globals': { browser: { isIOS: true }, $: () => {} }, './BasePage': { default: class {} },
      'node:fs': {}, 'node:path': {}, '../helpers/otp.helper': {}, '../helpers/phone.helper': {}, './LoginPage': {},
      '../helpers/controlState.helper': {},
    })
    const p = new Page()
    Object.defineProperty(p, 'onboardingNameNextBtn', { value: next })
    Object.defineProperty(p, 'validationPersonalNameError', { value: { waitForDisplayed: async () => events.push('error') } })
    Object.defineProperty(p, 'onboardingNameScreen', { value: { waitForDisplayed: async () => events.push('same screen') } })
    p.verifyValidationPersonalDetailsNext = async value => { assert.equal(value, enabled); events.push('button checked') }
    await p.verifyValidationPersonalDetailsRejected()
    assert.deepEqual(events, enabled ? ['submit', 'error', 'button checked', 'same screen'] : ['button checked', 'same screen'])
  })
}

test('KYC submission without a validation error cannot be counted as rejection', async () => {
  const { default: Page } = load('src/pages/OnboardingPage.ts', {
    '@wdio/globals': { browser: { isIOS: true }, $: () => {} }, './BasePage': { default: class {} },
    'node:fs': {}, 'node:path': {}, '../helpers/otp.helper': {}, '../helpers/phone.helper': {}, './LoginPage': {},
    '../helpers/controlState.helper': {},
  })
  const p = new Page()
  Object.defineProperty(p, 'onboardingNameNextBtn', { value: { waitForExist: async () => {}, isEnabled: async () => true, click: async () => {} } })
  Object.defineProperty(p, 'validationPersonalNameError', { value: { waitForDisplayed: async () => { throw new Error('no inline error') } } })
  await assert.rejects(p.verifyValidationPersonalDetailsRejected(), /no inline error/)
})
