const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
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
    'node:child_process': { execSync() {} },
    './src/helpers/allure.helper': { attachFailureArtifacts: async () => {} },
    './src/helpers/browserstack.helper': { getLastBrowserStackStep: () => 'Session started' },
    './src/helpers/failureClassification.helper': { classifyFailureReason: () => ({ reason: 'AUTOMATION_BUG' }) },
  }
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync('wdio.conf.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  vm.runInNewContext(code, {
    module, exports: module.exports, Error, console: { log() {}, warn() {} },
    process: { env: { BROWSERSTACK: 'true', BROWSERSTACK_USERNAME: 'unit', BROWSERSTACK_ACCESS_KEY: 'unit' }, argv: [], cwd: () => process.cwd() },
    require(name) {
      assert.ok(name in mocks, `Unmocked import ${name}`)
      return mocks[name]
    },
  })
  return { config: module.exports.config, commands, terminated, browser, mocks }
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
