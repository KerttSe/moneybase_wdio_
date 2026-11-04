import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import Mocha from 'mocha'
import { _setGlobal } from '@wdio/globals'

// No real credentials or device commands are used by this import-only check.
process.env = {
  MB_AUTH_SLOT: 'secondary',
  MB_PHONE: 'primary-fixture',
  MB_PIN: '1234',
  AUTH_OTP_MB_PHONE: 'secondary-fixture',
  AUTH_OTP_MB_PIN: '5678',
  AUTH_SECURITY_MB_PHONE: 'security-fixture',
  AUTH_SECURITY_MB_PIN: '4321',
  BH_MB_PHONE: 'business-fixture',
  PLATFORM: process.argv[2] || 'android',
}
const platform = process.env.PLATFORM
const browser = new Proxy({
  capabilities: { platformName: platform },
  isAndroid: platform === 'android', isIOS: platform === 'ios', isMobile: true,
}, {
  get(target, key) {
    if (key in target) return target[key]
    throw new Error(`Device property accessed while loading specs: ${String(key)}`)
  },
})
_setGlobal('browser', browser)
_setGlobal('driver', browser)
for (const key of ['$', '$$']) {
  _setGlobal(key, () => { throw new Error('Element lookup attempted while loading specs') })
}

const directory = resolve('src/tests')
const specs = readdirSync(directory).filter(file => file.endsWith('.spec.ts')).sort()
const loaded = []
for (const file of specs) {
  const mocha = new Mocha({ ui: 'bdd' })
  mocha.addFile(resolve(directory, file))
  await mocha.loadFilesAsync()
  const tests = []
  mocha.suite.eachTest(test => tests.push(test))
  assert.ok(tests.length > 0, `${file} did not register any tests`)
  loaded.push({ file, registered: tests.length, active: tests.filter(test => !test.isPending()).length })
}
console.log(JSON.stringify({ platform, loaded }))
