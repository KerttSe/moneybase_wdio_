const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const { execFileSync } = require('node:child_process')
const ts = require('typescript')

function loadPage(name, globals = {}, env = {}) {
  const module = { exports: {} }
  const mocks = {
    './BasePage': { default: class {} },
    './HomeScreenPage': { default: {} },
    '../helpers/otp.helper': { default: {} },
    '@wdio/globals': { browser: { isAndroid: true }, $: selector => ({ selector }), ...globals },
  }
  const code = ts.transpileModule(fs.readFileSync(`src/pages/${name}.ts`, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  vm.runInNewContext(code, {
    module, exports: module.exports, process: { env }, Error, console,
    require(name) {
      assert.ok(name in mocks, `Unmocked dependency: ${name}`)
      return mocks[name]
    },
  })
  return module.exports.default
}

test('Analytics targets the clickable parent of the real Home icon', () => {
  const page = loadPage('SpendAnalyticsPage')
  const selector = page.statisticsBtnAndroid.selector
  const marker = execFileSync('xmllint', [
    '--xpath', `string((${selector})/@marker)`, 'tests/unit/fixtures/regression37641012749.xml',
  ], { encoding: 'utf8' }).trim()
  assert.equal(marker, 'analytics-button')
})

test('admin self-assign selectors match the popup from the failed session without env overrides', () => {
  const page = loadPage('BusinessCardAdminSelfAssignPage')
  for (const key of ['adminSelfAssignAlertAndroid', 'adminSelfAssignAlertMessageAndroid']) {
    const count = execFileSync('xmllint', [
      '--xpath', `count(${page[key].selector})`, 'tests/unit/fixtures/regression37641012749.xml',
    ], { encoding: 'utf8' }).trim()
    assert.equal(count, '1', key)
  }
})

for (const state of ['both-visible', 'title-only', 'hidden', 'unrelated-error']) {
  test(`admin restriction requires its visible title and message (${state})`, async () => {
    const browser = {
      isAndroid: true,
      waitUntil: async (predicate, options) => {
        if (!await predicate()) throw new Error(options.timeoutMsg)
      },
    }
    const page = loadPage('BusinessCardAdminSelfAssignPage', { browser, $: selector => ({
      isDisplayed: async () => state === 'both-visible' || (state === 'title-only' && selector.includes('You cannot create your own card')),
    }) })
    if (state === 'both-visible') await page.verifyAdminSelfAssignAlert()
    else await assert.rejects(page.verifyAdminSelfAssignAlert(), /popup anchor\/message did not appear/)
  })
}
