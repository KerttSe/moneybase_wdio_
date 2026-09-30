import allure from '@wdio/allure-reporter'

/** A smoke journey shares one session; do not navigate after an earlier step fails. */
export function stopAfterFailedStep() {
  let failed = false
  let failureReason = ''

  // Pass wrapped callbacks to before/it so WDIO receives Mocha's skip signal.
  const smokeStep = (run: (this: Mocha.Context) => unknown) => {
    return async function (this: Mocha.Context) {
      try {
        await (run as Mocha.AsyncFunc).call(this)
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes('BrowserStack device is blocked by Device Security screen')) {
          throw error
        }
        failed = true
        failureReason = error.message
        console.warn(`[Smoke] Skipping blocked device: ${error.message}`)
        this.skip()
      }
    }
  }

  beforeEach(function () {
    if (!failed) return

    const reason = failureReason || 'previous smoke step failed'
    const message = `[Smoke] Skipping "${this.currentTest?.fullTitle() ?? this.currentTest?.title ?? 'next step'}" because: ${reason}`
    console.warn(message)
    try {
      allure.addAttachment('Smoke skip reason', message, 'text/plain')
    } catch {}
    this.skip()
  })

  afterEach(function () {
    if (this.currentTest?.state !== 'failed') return

    failed = true
    const err = this.currentTest.err
    failureReason = `${this.currentTest.fullTitle()}: ${err?.message ?? 'failed without message'}`
    console.warn(`[Smoke] Root failure for following skipped steps: ${failureReason}`)
  })

  return smokeStep
}
