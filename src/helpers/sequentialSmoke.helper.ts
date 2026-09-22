/** A smoke journey shares one session; do not navigate after an earlier step fails. */
export function stopAfterFailedStep() {
  let failed = false

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
        console.warn(`[Smoke] Skipping blocked device: ${error.message}`)
        this.skip()
      }
    }
  }

  beforeEach(function () {
    if (failed) this.skip()
  })

  afterEach(function () {
    if (this.currentTest?.state === 'failed') failed = true
  })

  return smokeStep
}
