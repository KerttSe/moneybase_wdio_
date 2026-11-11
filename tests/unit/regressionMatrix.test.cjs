const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { specNames, specPaths, specPath } = require('./fixtures/specFiles.cjs')
const path = require('node:path')
const vm = require('node:vm')
const yaml = require('js-yaml')

const workflow = yaml.load(fs.readFileSync('.github/workflows/wdio-regression.yml', 'utf8'))
const inputs = workflow.on.workflow_dispatch.inputs
const categoryKeys = Object.entries(inputs).filter(([, input]) => input.type === 'boolean').map(([key]) => key)
const step = workflow.jobs['setup-regression'].steps.find(step => step.run?.includes('const categories ='))
const code = /^node <<'NODE'\n([\s\S]*)\nNODE\s*$/.exec(step.run)[1]

function run(selection, platform = 'all') {
  const output = {}
  const context = {
    require(name) {
      if (name === './scripts/regressionLanes.cjs') return require(path.resolve('scripts/regressionLanes.cjs'))
      assert.equal(name, 'node:fs')
      return { readdirSync: fs.readdirSync, appendFileSync(file, value) { output[file] = (output[file] || '') + value } }
    },
    process: { env: { ALL_INPUTS_JSON: JSON.stringify(selection), PLATFORM_INPUT: platform, GITHUB_OUTPUT: 'output', GITHUB_STEP_SUMMARY: 'summary' } },
    console: { log() {} },
  }
  vm.runInNewContext(code + '\nglobalThis.categories = categories', context)
  const values = Object.fromEntries(output.output.trim().split('\n').map(line => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]))
  const lanes = {
    lane1: JSON.parse(values.lane1_matrix).include,
    lane2: JSON.parse(values.lane2_matrix).include,
  }
  return { lanes, categories: context.categories }
}
const specsOf = entries => entries.flatMap(entry => entry.specs.split(','))

test('seven categories and both lanes cover every regression spec exactly once per platform', () => {
  assert.equal(categoryKeys.length, 7)
  const { lanes } = run({})
  const specs = specPaths()
  for (const platform of ['android', 'ios']) {
    const actual = specsOf([...lanes.lane1, ...lanes.lane2].filter(entry => entry.platform === platform)).sort()
    assert.deepEqual(actual, specs)
  }
})

for (const category of categoryKeys) {
  test(`selecting ${category} runs only that category`, () => {
    const { lanes, categories } = run(Object.fromEntries(categoryKeys.map(key => [key, key === category])), 'android')
    const entries = [...lanes.lane1, ...lanes.lane2]
    assert.ok(entries.length > 0)
    assert.ok(entries.every(entry => entry.platform === 'android'))
    const expected = Array.from(categories[category].specs, spec => specPath(spec)).sort()
    assert.deepEqual(specsOf(entries).sort(), expected)
  })
}

test('specs run in the lane of their account owner', () => {
  const { lanes } = run({}, 'android')
  const lane1 = new Set(specsOf(lanes.lane1))
  const mapping = {
    'beneficiary.nameValidation.spec.ts': true,
    'autoTopUp.amountBelowRange.spec.ts': true,
    'onboarding.shortName.spec.ts': true,
    'orders.regression.spec.ts': true,
    'beneficiary.ibanChecksum.spec.ts': false,
    'support.close.spec.ts': false,
    'authentication.passcodeLockout.spec.ts': false,
    'businessCard.terminate.spec.ts': false,
  }
  for (const [spec, inLane1] of Object.entries(mapping)) {
    assert.equal(lane1.has(specPath(spec)), inLane1, spec)
  }
})

test('blocks hold at most 15 specs', () => {
  const { lanes } = run({})
  for (const entry of [...lanes.lane1, ...lanes.lane2]) assert.ok(entry.specs.split(',').length <= 15)
})

test('CI forwards fixtures and pool accounts to both lanes without a fixed auth slot', () => {
  for (const job of ['e2e-regression', 'e2e-regression-secondary']) {
    const env = workflow.jobs[job].env
    for (const name of ['AUTO_TOP_UP_EDIT_RULE_A11Y', 'AUTO_TOP_UP_TEST_SECOND_CURRENCY', 'AUTO_TOP_UP_TEST_MIN_AMOUNT', 'AUTO_TOP_UP_TEST_MAX_AMOUNT']) {
      assert.equal(env[name], '${{ vars.' + name + ' }}')
    }
    for (const slot of ['ROG', 'LAZ', 'MUM', 'POP']) {
      assert.equal(env[`MB_${slot}_PHONE`], '${{ secrets.MB_' + slot + '_PHONE }}')
    }
    assert.equal(env.MB_AUTH_SLOT, undefined)
  }
  assert.equal(categoryKeys.length, 7)
})
