import { browser } from '@wdio/globals'

type BrowserStackStatus = 'passed' | 'failed'
type BrowserStackAnnotationLevel = 'info' | 'debug' | 'warn' | 'error'

let lastBrowserStackStep = 'Session started'

function truncate(value: string, max = 240) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

async function executeBrowserStack(action: string, args: Record<string, unknown>) {
  if (process.env.BROWSERSTACK !== 'true') return

  await browser
    .execute(`browserstack_executor: ${JSON.stringify({ action, arguments: args })}`)
    .catch(() => {})
}

export function getLastBrowserStackStep() {
  return lastBrowserStackStep
}

export async function markBrowserStackStep(
  step: string,
  level: BrowserStackAnnotationLevel = 'info',
) {
  lastBrowserStackStep = truncate(step)
  console.log(`[BS_STEP] ${lastBrowserStackStep}`)

  if (process.env.BS_STEP_ANNOTATIONS === 'false') return

  await executeBrowserStack('annotate', {
    data: lastBrowserStackStep,
    level,
  })
}

export async function setBrowserStackSessionName(name: string) {
  await executeBrowserStack('setSessionName', { name: truncate(name, 180) })
  await markBrowserStackStep(`Session: ${name}`)
}

export async function setBrowserStackSessionStatus(
  status: BrowserStackStatus,
  reason: string,
) {
  await executeBrowserStack('setSessionStatus', {
    status,
    reason: truncate(reason, 240),
  })
}
