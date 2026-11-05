const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

function load(env) {
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync('src/data/credentials.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText
  vm.runInNewContext(code, { module, exports: module.exports, process: { env }, Error })
  return module.exports
}

test('ordinary specs can import AUTH without unrelated specialized credentials', () => {
  const { AUTH, AUTH_SECURITY, PD_AUTH } = load({ MB_AUTH_SLOT: 'primary', MB_PHONE: 'primary-test' })
  assert.equal(AUTH.phone, 'primary-test')
  assert.throws(() => AUTH_SECURITY.phone, /AUTH_SECURITY_MB_PHONE is not set/)
  assert.throws(() => PD_AUTH.phone, /PD_MB_PHONE is not set/)
})

test('secondary credentials retain their explicit account and PIN', () => {
  const { AUTH } = load({ MB_AUTH_SLOT: 'secondary', MB_PHONE: 'primary-test', MB_ALT_PHONE: 'secondary-test', MB_ALT_PIN: '5678' })
  assert.equal(AUTH.phone, 'secondary-test')
  assert.equal(AUTH.pin, '5678')
})

test('the existing secondary fallback is preserved', () => {
  const { AUTH } = load({ MB_AUTH_SLOT: 'secondary', MB_PHONE: 'primary-test', AUTH_OTP_MB_PHONE: 'fallback-test', AUTH_OTP_MB_PIN: '5678' })
  assert.equal(AUTH.phone, 'fallback-test')
  assert.equal(AUTH.pin, '5678')
})

test('primary and secondary must remain distinct', () => {
  assert.throws(() => load({ MB_AUTH_SLOT: 'secondary', MB_PHONE: 'same', MB_ALT_PHONE: 'same' }), /different account/)
  assert.throws(() => load({ MB_AUTH_SLOT: 'primary' }), /requires MB_PHONE/)
})

test('specialized credentials are still used when configured', () => {
  const { PD_AUTH, AUTH_SECURITY } = load({ PD_MB_PHONE: 'pd-test', AUTH_SECURITY_MB_PHONE: 'security-test' })
  assert.equal(PD_AUTH.phone, 'pd-test')
  assert.equal(AUTH_SECURITY.phone, 'security-test')
})
