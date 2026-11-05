const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const yaml = require('js-yaml')

const workflow = yaml.load(fs.readFileSync('.github/workflows/wdio-regression.yml', 'utf8'))
const inputs = workflow.on.workflow_dispatch.inputs
const categoryKeys = Object.entries(inputs).filter(([, input]) => input.type === 'boolean').map(([key]) => key)
const step = workflow.jobs['setup-regression'].steps.find(step => step.run?.includes('const categories ='))
const code = /^node <<'NODE'\n([\s\S]*)\nNODE\s*$/.exec(step.run)[1]

function matrix(selection, platform = 'all') {
  const output = {}
  vm.runInNewContext(code, {
    require(name) {
      assert.equal(name, 'node:fs')
      return { readdirSync: fs.readdirSync, appendFileSync(path, value) { output[path] = (output[path] || '') + value } }
    },
    process: { env: { ALL_INPUTS_JSON: JSON.stringify(selection), PLATFORM_INPUT: platform, GITHUB_OUTPUT: 'output', GITHUB_STEP_SUMMARY: 'summary' } },
    console: { log() {} },
  })
  const values = Object.fromEntries(output.output.trim().split('\n').map(line => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]))
  return JSON.parse(values.matrix).include
}

test('seven categories cover every regression spec exactly once per platform', () => {
  assert.equal(categoryKeys.length, 7)
  const entries = matrix({})
  const specs = fs.readdirSync('src/tests').filter(file => file.endsWith('.spec.ts')).map(file => `src/tests/${file}`).sort()
  for (const platform of ['android', 'ios']) {
    const actual = entries.filter(entry => entry.platform === platform).flatMap(entry => entry.specs.split(',')).sort()
    assert.deepEqual(actual, specs)
  }
})

for (const category of categoryKeys) {
  test(`selecting ${category} isolates that category and retains explicit account lanes`, () => {
    const entries = matrix(Object.fromEntries(categoryKeys.map(key => [key, key === category])), 'android')
    assert.ok(entries.length > 0)
    assert.ok(entries.every(entry => entry.categoryKey === category && ['primary', 'secondary'].includes(entry.authSlot)))
    assert.ok(entries.every(entry => entry.platform === 'android'))
  })
}

test('new scenario specs keep their category and account lane', () => {
  const entries = matrix({}, 'android')
  const mapping = {
    'beneficiary.nameValidation.spec.ts': ['bank_transfers', 'secondary'],
    'beneficiary.ibanLength.spec.ts': ['bank_transfers', 'secondary'],
    'beneficiary.ibanChecksum.spec.ts': ['bank_transfers', 'secondary'],
    'beneficiary.ibanCountry.spec.ts': ['bank_transfers', 'secondary'],
    'autoTopUp.editUnchanged.spec.ts': ['payments', 'primary'],
    'autoTopUp.currencyReset.spec.ts': ['payments', 'primary'],
    'autoTopUp.amountAboveRange.spec.ts': ['payments', 'primary'],
    'autoTopUp.amountBelowRange.spec.ts': ['payments', 'primary'],
    'onboarding.invalidNames.spec.ts': ['onboarding_account', 'secondary'],
    'onboarding.shortName.spec.ts': ['onboarding_account', 'secondary'],
  }
  for (const [spec, [category, slot]] of Object.entries(mapping)) {
    const matches = entries.filter(entry => entry.specs.split(',').includes(`src/tests/${spec}`))
    assert.equal(matches.length, 1, spec)
    assert.equal(matches[0].categoryKey, category, spec)
    assert.equal(matches[0].authSlot, slot, spec)
  }
})

test('CI forwards the explicit Auto Top-Up fixtures without adding workflow inputs', () => {
  for (const name of ['AUTO_TOP_UP_EDIT_RULE_A11Y', 'AUTO_TOP_UP_TEST_SECOND_CURRENCY', 'AUTO_TOP_UP_TEST_MIN_AMOUNT', 'AUTO_TOP_UP_TEST_MAX_AMOUNT']) {
    assert.equal(workflow.jobs['e2e-regression'].env[name], '${{ vars.' + name + ' }}')
  }
  assert.equal(categoryKeys.length, 7)
})
