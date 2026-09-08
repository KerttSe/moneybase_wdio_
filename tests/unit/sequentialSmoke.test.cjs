const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

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
