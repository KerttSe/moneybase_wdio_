export function requiredAutoTopUpFixture(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`CONFIGURATION_ERROR: ${name} is required for this Auto Top-Up validation spec`)
  return value
}

export function autoTopUpRangeFixture() {
  const cents = (name: string) => {
    const value = requiredAutoTopUpFixture(name)
    if (!/^\d+(?:\.\d{1,2})?$/.test(value)) throw new Error(`CONFIGURATION_ERROR: ${name} must be a non-negative decimal with at most two places`)
    const [whole, fraction = ''] = value.split('.')
    return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
  }
  const min = cents('AUTO_TOP_UP_TEST_MIN_AMOUNT')
  const max = cents('AUTO_TOP_UP_TEST_MAX_AMOUNT')
  if (min <= 0n || max <= min) throw new Error('CONFIGURATION_ERROR: Auto Top-Up range must satisfy 0 < min < max')
  const format = (value: bigint) => `${value / 100n}.${String(value % 100n).padStart(2, '0')}`
  return { min: format(min), max: format(max), below: format(min - 1n), above: format(max + 1n) }
}
