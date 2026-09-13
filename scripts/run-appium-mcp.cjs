#!/usr/bin/env node
// Cross-platform launcher for appium-mcp, invoked by .mcp.json.
//
// .mcp.json values are static strings, so environment placeholders and
// per-OS paths are not resolved there. This script resolves machine-specific
// values at launch time while keeping .mcp.json portable and committable.
'use strict'

const os = require('node:os')
const path = require('node:path')
const { spawn } = require('node:child_process')

function defaultAndroidHome() {
  if (process.env.ANDROID_HOME) return process.env.ANDROID_HOME
  if (process.env.ANDROID_SDK_ROOT) return process.env.ANDROID_SDK_ROOT

  const home = os.homedir()
  switch (os.platform()) {
    case 'win32':
      return path.join(home, 'AppData', 'Local', 'Android', 'Sdk')
    case 'darwin':
      return path.join(home, 'Library', 'Android', 'sdk')
    default:
      return path.join(home, 'Android', 'Sdk')
  }
}

const repoRoot = path.resolve(__dirname, '..')
const capabilitiesConfig =
  process.env.CAPABILITIES_CONFIG || path.join(repoRoot, 'appium-mcp.capabilities.local.json')

const env = {
  ...process.env,
  ANDROID_HOME: defaultAndroidHome(),
  CAPABILITIES_CONFIG: capabilitiesConfig,
}

const child = spawn('npx', ['-y', 'appium-mcp@latest'], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
})

child.on('exit', code => process.exit(code ?? 1))
child.on('error', err => {
  console.error('[run-appium-mcp] failed to start appium-mcp:', err)
  process.exit(1)
})
