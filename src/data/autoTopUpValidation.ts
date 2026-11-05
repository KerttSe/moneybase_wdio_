export function requiredAutoTopUpFixture(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`CONFIGURATION_ERROR: ${name} is required for this Auto Top-Up validation spec`)
  return value
}

// EUR add-amount limits observed in the Android QA amount sheet on 2026-11-02.
// Keep an independent expected range; never infer expected acceptance from Done.
export const autoTopUpEurLimits = { min: '10.00', max: '2500.00' } as const

export function autoTopUpRangeFixture(stepInCents = 1n) {
  const explicit = Boolean(process.env.AUTO_TOP_UP_TEST_MIN_AMOUNT?.trim() || process.env.AUTO_TOP_UP_TEST_MAX_AMOUNT?.trim())
  const cents = (name: string) => {
    const value = explicit ? requiredAutoTopUpFixture(name) : name === 'AUTO_TOP_UP_TEST_MIN_AMOUNT' ? autoTopUpEurLimits.min : autoTopUpEurLimits.max
    if (!/^\d+(?:\.\d{1,2})?$/.test(value)) throw new Error(`CONFIGURATION_ERROR: ${name} must be a non-negative decimal with at most two places`)
    const [whole, fraction = ''] = value.split('.')
    return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
  }
  const min = cents('AUTO_TOP_UP_TEST_MIN_AMOUNT')
  const max = cents('AUTO_TOP_UP_TEST_MAX_AMOUNT')
  if (min <= 0n || max <= min) throw new Error('CONFIGURATION_ERROR: Auto Top-Up range must satisfy 0 < min < max')
  if (stepInCents <= 0n || stepInCents > min) throw new Error('CONFIGURATION_ERROR: Auto Top-Up boundary step must be positive and no greater than the minimum')
  const format = (value: bigint) => `${value / 100n}.${String(value % 100n).padStart(2, '0')}`
  return { min: format(min), max: format(max), below: format(min - stepInCents), above: format(max + stepInCents) }
}
