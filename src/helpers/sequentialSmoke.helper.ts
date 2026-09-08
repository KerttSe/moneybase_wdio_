/** A smoke journey shares one session; do not navigate after an earlier step fails. */
export function stopAfterFailedStep() {
  let failed = false

  beforeEach(function () {
    if (failed) this.skip()
  })

  afterEach(function () {
    if (this.currentTest?.state === 'failed') failed = true
  })
}
