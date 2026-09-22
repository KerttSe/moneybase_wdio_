const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const Mocha = require('mocha')

function register() {
  const before = [], after = []
  const module = { exports: {} }
  const source = fs.readFileSync('src/helpers/sequentialSmoke.helper.ts', 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
  vm.runInNewContext(code, {
    module, exports: module.exports,
    beforeEach: fn => before.push(fn), afterEach: fn => after.push(fn),
  })
  module.exports.stopAfterFailedStep()
  return { before: before[0], after: after[0] }
}

test('successful steps keep the next operation runnable', () => {
  const hooks = register()
  const context = { skip() { assert.fail('Unexpected skip') } }
  hooks.before.call(context)
  hooks.after.call({ currentTest: { state: 'passed' } })
  hooks.before.call(context)
})

test('a failed step prevents subsequent navigation', () => {
  const hooks = register()
  hooks.after.call({ currentTest: { state: 'failed' } })
  let skipped = false
  hooks.before.call({ skip() { skipped = true } })
  assert.equal(skipped, true)
})

test('platform-specific skips do not block supported cases', () => {
  const hooks = register()
  hooks.after.call({ currentTest: { state: 'pending' } })
  hooks.before.call({ skip() { assert.fail('Skip propagated') } })
})

test('failure state is local to the journey', () => {
  const first = register(), second = register()
  first.after.call({ currentTest: { state: 'failed' } })
  second.before.call({ skip() { assert.fail('Other journey was affected') } })
})

async function runJourney(setup) {
  const mocha = new Mocha({ reporter: function () {} })
  const suite = Mocha.Suite.create(mocha.suite, 'smoke')
  const module = { exports: {} }
  const source = fs.readFileSync('src/helpers/sequentialSmoke.helper.ts', 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
  vm.runInNewContext(code, {
    module, exports: module.exports, Error, console: { warn() {} },
    beforeEach: fn => suite.beforeEach(fn), afterEach: fn => suite.afterEach(fn),
  })
  const smokeStep = module.exports.stopAfterFailedStep()
  const beforeAll = suite.beforeAll.bind(suite)
  suite.beforeAll = fn => beforeAll(smokeStep(fn))
  const addTest = suite.addTest.bind(suite)
  suite.addTest = test => {
    test.fn = smokeStep(test.fn)
    return addTest(test)
  }
  setup(suite)
  const failures = await new Promise(resolve => mocha.run(resolve))
  return { failures, states: suite.tests.map(test => test.state) }
}

test('confirmed Device Security in login skips the suite before any navigation', async () => {
  const result = await runJourney(suite => {
    suite.beforeAll(async function () {
      throw new Error('waitUntil condition failed with the following reason: BrowserStack device is blocked by Device Security screen (VPN or security policy)')
    })
    suite.addTest(new Mocha.Test('first step', async () => assert.fail('Blocked device was used')))
    suite.addTest(new Mocha.Test('second step', async () => assert.fail('Blocked device was used')))
  })
  assert.deepEqual(result, { failures: 0, states: ['pending', 'pending'] })
})

test('Device Security during a step skips it and the rest of the journey', async () => {
  const result = await runJourney(suite => {
    suite.addTest(new Mocha.Test('first step', async () => {
      throw new Error('[Onboarding] BrowserStack device is blocked by Device Security screen: VPN')
    }))
    suite.addTest(new Mocha.Test('second step', async () => assert.fail('Navigation continued')))
  })
  assert.deepEqual(result, { failures: 0, states: ['pending', 'pending'] })
})

test('locator errors remain failures even when their selector mentions Device Security', async () => {
  const result = await runJourney(suite => {
    suite.addTest(new Mocha.Test('first step', async () => {
      throw new Error('element Device Security was not displayed after 15000ms')
    }))
    suite.addTest(new Mocha.Test('second step', async () => assert.fail('Navigation continued')))
  })
  assert.deepEqual(result, { failures: 1, states: ['failed', 'pending'] })
})

test('WDIO receives a skip instead of a failure for Device Security', async () => {
  const { testFnWrapper } = await import('@wdio/utils')
  const Pending = require('mocha/lib/pending')
  const module = { exports: {} }
  const source = fs.readFileSync('src/helpers/sequentialSmoke.helper.ts', 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
  vm.runInNewContext(code, {
    module, exports: module.exports, Error, console: { warn() {} },
    beforeEach() {}, afterEach() {},
  })
  const smokeStep = module.exports.stopAfterFailedStep()
  const specFn = smokeStep(async () => {
    throw new Error('BrowserStack device is blocked by Device Security screen')
  })
  let reported
  await assert.rejects(testFnWrapper.call(
    { skip() { throw new Pending('sync skip; aborting execution') } },
    'Test', { specFn, specFnArgs: [] },
    { beforeFn: [], beforeFnArgs: () => [] },
    { afterFn: [result => { reported = result }], afterFnArgs: () => [] },
    'unit',
  ), error => error instanceof Pending)
  assert.equal(reported.error, undefined)
  assert.equal(reported.skipped, true)
  assert.equal(reported.passed, false)
})
