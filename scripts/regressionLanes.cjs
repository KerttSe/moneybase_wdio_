// Regression lane order, shared by wdio.conf.ts and .github/workflows/wdio-regression.yml.
// Owners come from src/data/regressionAccounts.json.
const accounts = require('../src/data/regressionAccounts.json')

// Groups that log in with a pool account and therefore set MB_AUTH_SLOT.
const POOL_SLOTS = new Set(['primary', 'secondary', 'rog', 'laz', 'mum', 'pop'])

const specFile = name => `${name}.spec.ts`

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
    .map(group => ({ group, names: accounts.groups[group].map(specFile).filter(include), next: 0 }))
    .filter(entry => entry.names.length > 0)
  const ordered = []
  let lastSlot = ''
  for (;;) {
    const ready = groups
      .filter(entry => entry.next < entry.names.length)
      .sort((a, b) => (a.next + 0.5) / a.names.length - (b.next + 0.5) / b.names.length)
    if (ready.length === 0) return ordered
    const pick = ready.find(entry => entry.group !== lastSlot) ?? ready[0]
    ordered.push(pick.names[pick.next])
    pick.next += 1
    lastSlot = POOL_SLOTS.has(pick.group) ? pick.group : ''
  }
}

module.exports = { accounts, POOL_SLOTS, slotForSpec, laneOrder }
