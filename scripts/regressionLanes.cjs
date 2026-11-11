// Regression lane order, shared by wdio.conf.ts and .github/workflows/wdio-regression.yml.
// Owners come from src/data/regressionAccounts.json.
const accounts = require('../src/data/regressionAccounts.json')

// Groups that log in with a pool account and therefore set MB_AUTH_SLOT.
const POOL_SLOTS = new Set(['primary', 'secondary', 'rog', 'laz', 'mum', 'pop'])

// Groups with their own credentials that still share a phone with a pool account. businessHolder logs in
// with BH_MB_PHONE, which is KER's number (business profile SED00004), so it counts as KER for spacing.
const SAME_PHONE_AS = { businessHolder: 'secondary' }
const phoneOf = group => SAME_PHONE_AS[group] ?? (POOL_SLOTS.has(group) ? group : '')

const specFile = name => `${name}.spec.ts`

// Specs that lock AUTH_SECURITY (wrong OTP / passcode). passcodeLockout unlocks through OTP afterwards,
// but if that fails the lock lasts a while, so the account's next spec waits at least LOCK_GAP specs
// (about 40 minutes at ~5 minutes per spec) after any of them.
const LOCKING_SPECS = new Set([
  'authentication.incorrectOtp',
  'authentication.incorrectPasscode',
  'authentication.otpLockout',
  'authentication.passcodeLockout',
].map(specFile))
const LOCK_GAP = 8

function slotForSpec(specName) {
  for (const [group, names] of Object.entries(accounts.groups)) {
    if (POOL_SLOTS.has(group) && names.some(name => specFile(name) === specName)) return group
  }
  return ''
}

// Each group keeps its own order and is spread evenly over the lane (its i-th of n specs aims at
// (i + 0.5) / n). A pool account never runs twice in a row while another group has specs left.
// `include` filters spec files first, so a partial run (selected categories) is spaced the same way.
function laneOrder(lane, include = () => true) {
  const groups = accounts.lanes[lane]
    .map(group => ({ group, names: accounts.groups[group].map(specFile).filter(include), next: 0, coolUntil: 0 }))
    .filter(entry => entry.names.length > 0)
  const ordered = []
  let lastSlot = ''
  for (;;) {
    const remaining = groups.filter(entry => entry.next < entry.names.length)
    if (remaining.length === 0) return ordered
    // A group cooling down after a locking spec waits, unless nothing else is left to run.
    const cooled = remaining.filter(entry => entry.coolUntil <= ordered.length)
    const ready = (cooled.length > 0 ? cooled : remaining)
      .sort((a, b) => (a.next + 0.5) / a.names.length - (b.next + 0.5) / b.names.length)
    const pick = ready.find(entry => !lastSlot || phoneOf(entry.group) !== lastSlot) ?? ready[0]
    const name = pick.names[pick.next]
    ordered.push(name)
    pick.next += 1
    if (LOCKING_SPECS.has(name)) pick.coolUntil = ordered.length + LOCK_GAP
    lastSlot = phoneOf(pick.group)
  }
}

module.exports = { accounts, POOL_SLOTS, LOCKING_SPECS, LOCK_GAP, slotForSpec, laneOrder }
