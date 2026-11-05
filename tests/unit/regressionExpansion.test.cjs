const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

function load(file, mocks = {}) {
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  vm.runInNewContext(code, {
    module, exports: module.exports, process: { env: {} }, Error, console,
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

function loadPage(name, globals = {}, dependencies = {}) {
  return load(`src/pages/${name}.ts`, {
    './BasePage': { default: class {} },
    './HomeScreenPage': { default: {} },
    './AddFunds': { default: class {} },
    '../data/credentials': { AUTH: {} },
    '../helpers/otp.helper': { default: {} },
    '../helpers/browserstack.helper': {},
    '../helpers/controlState.helper': {},
    '@wdio/globals': { browser: { isIOS: true, waitUntil }, $: selector => ({ selector }), ...globals },
    ...dependencies,
  })
}

for (const enabled of [false, true]) {
  test(`button assertion checks the actual ${enabled ? 'enabled' : 'disabled'} state`, async () => {
    let present = false, reads = 0
    const control = { waitForExist: async () => { present = true }, isEnabled: async () => { reads++; return reads > 1 ? enabled : !enabled } }
    const { waitForControlEnabled } = load('src/helpers/controlState.helper.ts', { '@wdio/globals': { browser: { waitUntil } } })
    await waitForControlEnabled(control, enabled, 'fixture')
    assert.equal(present, true)
    assert.equal(reads, 2)
    control.isEnabled = async () => !enabled
    await assert.rejects(waitForControlEnabled(control, enabled, 'fixture'), /must be/)
  })
}

test('missing controls and driver errors cannot masquerade as disabled buttons', async () => {
  const { waitForControlEnabled } = load('src/helpers/controlState.helper.ts', { '@wdio/globals': { browser: { waitUntil } } })
  await assert.rejects(waitForControlEnabled({ waitForExist: async () => { throw new Error('missing') } }, false, 'fixture'), /missing/)
  await assert.rejects(waitForControlEnabled({ waitForExist: async () => {}, isEnabled: async () => { throw new Error('transport') } }, false, 'fixture'), /transport/)
})

test('Auto Top-Up checks the iOS save control, not its always-enabled text child', async () => {
  const calls = []
  const { default: Page } = loadPage('AutoTopUpPage', {
    $: selector => ({ selector, waitForExist: async () => {} }),
  }, { '../helpers/controlState.helper': { waitForControlEnabled: async (control, enabled) => calls.push({ selector: control.selector, enabled }) } })
  await new Page().verifySaveEnabled(false)
  assert.equal(calls[0].enabled, false)
  assert.doesNotMatch(calls[0].selector, /XCUIElementTypeStaticText/)
  assert.match(calls[0].selector, /autoTopup_button_save/)
})

test('empty partial salary clears the input without leaving the previous amount', async () => {
  let clears = 0, sets = 0
  const { default: Page } = loadPage('SalaryStipendPensionPage', { $: selector => ({
    waitForExist: async () => {}, clearValue: async () => { clears++ }, setValue: async () => { sets++ },
  }) })
  const page = new Page()
  page.tap = async () => {}
  await page.selectPartialSalaryPreference('')
  assert.equal(clears, 1)
  assert.equal(sets, 0)
})

for (const text of ['Minimum amount: EUR 10.00', 'Minimum amount: 10,00 EUR', 'Minimum amount: EUR 100.00', '']) {
  test(`top-up minimum validation is exact (${text || 'missing copy'})`, async () => {
    const { default: Page } = loadPage('AddFunds', {
      browser: { isIOS: true }, $: () => ({ waitForDisplayed: async () => {}, getAttribute: async () => text }),
    })
    if (text.includes('100.00') || !text) await assert.rejects(new Page().verifyMinimumTopUpError(), /formatted 10.00/)
    else await new Page().verifyMinimumTopUpError()
  })
}

test('cold launch uses the configured app and observes login without preparing or bypassing it', async () => {
  const calls = []
  const { default: page } = load('src/pages/AppLifecyclePage.ts', {
    '@wdio/globals': { browser: {
      isIOS: true, capabilities: { 'appium:bundleId': 'fixture.app' },
      terminateApp: async id => calls.push(['terminate', id]), activateApp: async id => calls.push(['activate', id]),
      switchContext: async context => calls.push(['context', context]),
    } },
    './LoginPage': { loginPage: { authLoginNavBar: { waitForDisplayed: async () => calls.push(['gate']) } } },
    './HomeScreenPage': { default: {} },
  })
  await page.verifyColdLaunchRequiresLogin()
  assert.deepEqual(calls, [['terminate', 'fixture.app'], ['activate', 'fixture.app'], ['context', 'NATIVE_APP'], ['gate']])
})

test('short and long background cases stay on opposite sides of the source grace period', async () => {
  const durations = [], states = []
  const { default: page } = load('src/pages/AppLifecyclePage.ts', {
    '@wdio/globals': { browser: { isIOS: true, background: async seconds => durations.push(seconds), switchContext: async () => {} } },
    './LoginPage': { loginPage: { authLoginNavBar: { isDisplayed: async () => false, waitForDisplayed: async () => states.push('gate') } } },
    './HomeScreenPage': { default: { waitForHomeLoaded: async () => states.push('home') } },
  })
  await page.verifyShortBackgroundResumesHome()
  await page.verifyLongBackgroundRequiresLogin()
  assert.deepEqual(durations, [3, 21])
  assert.deepEqual(states, ['home', 'gate'])
})

test('Android lifecycle calls fail explicitly instead of silently passing iOS contracts', async () => {
  const { default: page } = load('src/pages/AppLifecyclePage.ts', {
    '@wdio/globals': { browser: { isIOS: false } }, './LoginPage': {}, './HomeScreenPage': {},
  })
  await assert.rejects(page.verifyShortBackgroundResumesHome(), /iOS-only/)
})

test('an unexpected login gate after a short background is a real failure', async () => {
  const { default: page } = load('src/pages/AppLifecyclePage.ts', {
    '@wdio/globals': { browser: { isIOS: true, background: async () => {} } },
    './LoginPage': { loginPage: { authLoginNavBar: { isDisplayed: async () => true } } },
    './HomeScreenPage': { default: { waitForHomeLoaded: async () => {} } },
  })
  await assert.rejects(page.verifyShortBackgroundResumesHome(), /Re-authentication appeared/)
})

test('the registered-number assertion requires a login root, not only a generic keypad', async () => {
  const selectors = []
  const { default: Page } = loadPage('AuthenticationPage', {
    browser: { isAndroid: true }, $: selector => ({ waitForDisplayed: async () => selectors.push(selector) }),
  }, { './LoginPage': {} })
  const page = new Page()
  await page.verifyRegisteredNumberLoginScreen()
  assert.match(selectors[0], /login_screen/)
  assert.doesNotMatch(selectors[0], /RegistrationConfirmPasscode/)
  assert.match(selectors[1], /keypad_text_1/)
})

test('admin restriction fails if an assignee picker was opened underneath the popup', async () => {
  const { default: page } = loadPage('BusinessCardAdminSelfAssignPage', {
    browser: { isAndroid: true }, $: () => ({ isExisting: async () => true }),
  })
  page.verifyAdminSelfAssignAlert = async () => {}
  await assert.rejects(page.verifyAssigneePickerNotOpened(), /incorrectly opened/)
})
