const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { execFileSync } = require('node:child_process')

for (const platform of ['android', 'ios']) {
  test(`all regression specs load with CI secondary aliases (${platform})`, () => {
    const output = execFileSync(process.execPath, [
      '--import', 'tsx', 'tests/unit/fixtures/loadRegressionSpecs.mjs', platform,
    ], { encoding: 'utf8', timeout: 30000 })
    const { loaded } = JSON.parse(output.trim())
    const expected = fs.readdirSync('src/tests').filter(file => file.endsWith('.spec.ts')).sort()
    assert.deepEqual(loaded.map(item => item.file), expected)
    assert.ok(loaded.find(item => item.file === 'authentication.otpCountdown.spec.ts').active > 0)
    // Loading a WIP spec is not evidence that its skipped test was executed.
    assert.equal(loaded.find(item => item.file === 'bankTransfer.business.spec.ts').active, 0)
  })
}
