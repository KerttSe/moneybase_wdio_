const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { specNames } = require('./fixtures/specFiles.cjs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function loadConfig() {
  const commands = [], terminated = []
  const browser = {
    capabilities: { platformName: 'Android', 'appium:appPackage': 'test.app' },
    execute: async command => commands.push(JSON.parse(command.slice('browserstack_executor: '.length))),
    terminateApp: async app => terminated.push(app),
  }
  const mocks = {
    dotenv: { config() {} },
    '@wdio/globals': { browser },
    'node:path': path,
    'node:fs': { readdirSync: fs.readdirSync },
    'node:child_process': { execSync() {} },
    './src/helpers/allure.helper': { attachFailureArtifacts: async () => {} },
    './src/helpers/browserstack.helper': { getLastBrowserStackStep: () => 'Session started' },
    './src/helpers/failureClassification.helper': { classifyFailureReason: () => ({ reason: 'AUTOMATION_BUG' }) },
    'node:module': { createRequire: () => file => require(path.resolve(file)) },
  }
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync('wdio.conf.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const env = { BROWSERSTACK: 'true', BROWSERSTACK_USERNAME: 'unit', BROWSERSTACK_ACCESS_KEY: 'unit' }
  vm.runInNewContext(code, {
    module, exports: module.exports, Error, console: { log() {}, warn() {} },
    process: { env, argv: [], cwd: () => process.cwd() },
    require(name) {
      assert.ok(name in mocks, `Unmocked import ${name}`)
      return mocks[name]
    },
  })
  return { config: module.exports.config, commands, terminated, browser, mocks, env }
}

test('a spec-load exception marks the session failed even without afterTest', async () => {
  const { config, commands, terminated } = loadConfig()
  const error = new Error('Unable to load spec files quite likely because they rely on `browser` object that is not fully initialized.\nSpec file(s): example.spec.ts\nError: Error: BH_MB_PHONE is not set\n at example.spec.ts:14')
  await config.after(error, {}, ['example.spec.ts'])
  const status = commands.find(command => command.action === 'setSessionStatus')
  assert.equal(status?.arguments.status, 'failed')
  assert.match(status.arguments.reason, /BH_MB_PHONE is not set/)
  assert.deepEqual(terminated, ['test.app'])
})

test('a numeric worker failure also marks the session failed', async () => {
  const { config, commands } = loadConfig()
  await config.after(1, {}, ['example.spec.ts'])
  assert.equal(commands.find(command => command.action === 'setSessionStatus')?.arguments.status, 'failed')
})

test('the worker fallback preserves the detailed test failure', async () => {
  const { config, commands } = loadConfig()
  await config.afterTest({ title: 'login' }, {}, { error: new Error('OTP rejected') })
  await config.after(1, {}, ['example.spec.ts'])
  const statuses = commands.filter(command => command.action === 'setSessionStatus')
  assert.equal(statuses.length, 1)
  assert.match(statuses[0].arguments.reason, /OTP rejected/)
})

test('successful and intentionally skipped workers are not marked failed', async () => {
  const { config, commands, terminated } = loadConfig()
  const pending = new Error('sync skip; aborting execution')
  pending.name = 'Pending'
  await config.afterTest({ title: 'unsupported platform' }, {}, { error: pending })
  await config.after(0, {}, ['example.spec.ts'])
  assert.equal(commands.some(command => command.action === 'setSessionStatus'), false)
  assert.deepEqual(terminated, [])
})

test('a new session clears the previous worker failure state', async () => {
  const { config, commands } = loadConfig()
  await config.afterTest({ title: 'first' }, {}, { error: new Error('first failure') })
  config.beforeSession({}, {}, ['second.spec.ts'])
  await config.after(1, {}, ['second.spec.ts'])
  assert.equal(commands.filter(command => command.action === 'setSessionStatus').length, 2)
})

test('beforeSession retains the explicitly selected kat profile', () => {
  const { config, env } = loadConfig()
  env.MB_AUTH_SLOT = 'kat'
  config.beforeSession({}, {}, ['src/tests/homeSearch.spec.ts'])
  assert.equal(env.MB_AUTH_SLOT, 'kat')
})

test('a failed status request is retried at worker teardown', async () => {
  const { config, browser, commands } = loadConfig()
  const execute = browser.execute
  browser.execute = async () => { throw new Error('temporary transport error') }
  await config.afterTest({ title: 'login' }, {}, { error: new Error('OTP rejected') })
  browser.execute = execute
  await config.after(1, {}, ['example.spec.ts'])
  assert.equal(commands.find(command => command.action === 'setSessionStatus')?.arguments.status, 'failed')
})

test('hook failures retain their original reason at worker teardown', async () => {
  const { config, commands } = loadConfig()
  await config.afterHook({}, {}, { error: new Error('Login setup failed') })
  await config.after(1, {}, ['example.spec.ts'])
  const statuses = commands.filter(command => command.action === 'setSessionStatus')
  assert.equal(statuses.length, 1)
  assert.match(statuses[0].arguments.reason, /Login setup failed/)
})

test('artifact collection cannot prevent reporting a failed test', async () => {
  const { config, commands, mocks } = loadConfig()
  mocks['./src/helpers/allure.helper'].attachFailureArtifacts = async () => { throw new Error('screenshot failed') }
  await assert.rejects(config.afterTest({ title: 'login' }, {}, { error: new Error('OTP rejected') }), /screenshot failed/)
  assert.equal(commands.find(command => command.action === 'setSessionStatus')?.arguments.status, 'failed')
})

test('regression lanes include every spec exactly once', () => {
  const { config } = loadConfig()
  const actual = [...config.suites.regressionLane1, ...config.suites.regressionLane2].map(file => path.basename(file)).sort()
  const expected = specNames()
  assert.deepEqual(Array.from(actual), expected)
})

test('regression specs take their account slot, own-credential specs take none', () => {
  const { config, env } = loadConfig()
  const slots = {
    'autoTopUp.validation.spec.ts': 'primary',
    'cardManagement.joint.spec.ts': 'primary',
    'addfunds.validation.spec.ts': 'secondary',
    'beneficiary.nameValidation.spec.ts': 'rog',
    'beneficiary.ibanChecksum.spec.ts': 'laz',
    'orders.regression.spec.ts': 'mum',
    'support.close.spec.ts': 'pop',
    'homeScreen.spec.ts': 'rog',
    'businessCard.terminate.spec.ts': undefined,
    'authentication.incorrectPasscode.spec.ts': undefined,
    'onboarding.shortName.spec.ts': undefined,
  }
  for (const [spec, slot] of Object.entries(slots)) {
    delete env.MB_AUTH_SLOT
    config.beforeSession({}, {}, [spec])
    assert.equal(env.MB_AUTH_SLOT, slot, spec)
  }
})

test('regression lanes never log one account in twice in a row', () => {
  const { config, env } = loadConfig()
  for (const lane of ['regressionLane1', 'regressionLane2']) {
    const owners = config.suites[lane].map(file => {
      delete env.MB_AUTH_SLOT
      config.beforeSession({}, {}, [path.basename(file)])
      return env.MB_AUTH_SLOT
    })
    owners.forEach((owner, index) => {
      if (owner && index > 0) assert.notEqual(owner, owners[index - 1], `${lane}: ${config.suites[lane][index]}`)
    })
  }
})

test('account-locking authentication specs run after the rest of that account', () => {
  const { config } = loadConfig()
  const lane = config.suites.regressionLane2.map(file => path.basename(file, '.spec.ts'))
  const locking = ['authentication.incorrectOtp', 'authentication.otpLockout', 'authentication.incorrectPasscode', 'authentication.passcodeLockout']
  const firstLock = Math.min(...locking.map(name => lane.indexOf(name)))
  for (const name of ['authentication.securityAccount', 'authentication.changePasscodeCancel', 'authentication.partialPasscode', 'authentication.otpCountdown']) {
    assert.ok(lane.indexOf(name) < firstLock, name)
  }
})
