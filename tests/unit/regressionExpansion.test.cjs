const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const { execFileSync } = require('node:child_process')

function load(file, mocks = {}) {
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  vm.runInNewContext(code, {
    module, exports: module.exports, process: { env: {} }, Error, console,
    require(name) {
      assert.ok(name in mocks, `Unmocked dependency ${name}`)
      return mocks[name]
    },
  })
  return module.exports
}

async function waitUntil(predicate, options) {
  for (let i = 0; i < 3; i++) if (await predicate()) return
  throw new Error(options.timeoutMsg)
}

function loadPage(name, globals = {}, dependencies = {}) {
  return load(`src/pages/${name}.ts`, {
    './BasePage': { default: class {} },
    './HomeScreenPage': { default: {} },
    './AddFunds': { default: class {} },
    '../data/credentials': { AUTH: {} },
    '../helpers/otp.helper': { default: {} },
    '../helpers/browserstack.helper': {},
    '../helpers/controlState.helper': {},
    '@wdio/globals': { browser: { isIOS: true, waitUntil }, $: selector => ({ selector }), ...globals },
    ...dependencies,
  })
}

for (const isIOS of [false, true]) {
  test(`QA login uses the bypass for every account on ${isIOS ? 'iOS' : 'Android'}`, async () => {
    for (const code of ['VEG40002', 'KER40014', 'KAT40008', 'MAI40018', 'LAZ40012']) {
      const { LoginPage } = loadPage('LoginPage', { browser: { isIOS, isAndroid: !isIOS } })
      const page = new LoginPage()
      const entered = []
      const absent = { isExisting: async () => false, isDisplayed: async () => false }
      Object.defineProperty(page, 'homeRoot', { value: absent })
      Object.defineProperty(page, 'otpContainerIOS', { value: absent })
      page.isHomeLoaded = async () => false
      page.isIOSPasscodeScreenShown = async () => false
      page.isAndroidPasscodeScreenShown = async () => false
      for (const method of ['prepare', 'selectCountry', 'enterMobile', 'continue',
        'waitForAndroidLoginNextStepAfterMobile', 'enterPin', 'waitForOtpScreen',
        'tapContinueAfterOtp', 'waitForPostOtpNextStep', 'closeApplePayIfVisible', 'waitForHome']) {
        page[method] = async () => {}
      }
      page.enterOtp = async value => entered.push(value)
      await page.loginFlow({ country: 'Malta', phone: 'fixture', pin: '2468', individualAccountCode: code })
      assert.deepEqual(entered, ['000000'], code)
    }
  })
}

for (const initial of ['pin', 'logout']) {
  test(`Android login confirms the actual logout screen when starting on ${initial}`, async () => {
    const { LoginPage } = loadPage('LoginPage', { browser: { isAndroid: true, switchContext: async () => {} } })
    const page = new LoginPage()
    let screen = initial
    const taps = []
    page.byId = id => ({ id, isDisplayed: async () =>
      (id === 'logout_screen' && screen === 'logout') ||
      (id === 'login_button_logout' && screen === 'pin') ||
      (id === 'register_screen' && screen === 'register'),
    })
    page.isAndroidMainShellShown = async () => false
    Object.defineProperty(page, 'homeRoot', { value: { isDisplayed: async () => false } })
    page.tapAndroidCenterPoint = async control => {
      taps.push(control.id)
      screen = control.id === 'login_button_logout' ? 'logout' : 'welcome'
    }
    page.tapWelcomeEntryButtonIfShown = async () => {
      if (screen !== 'welcome') return false
      screen = 'register'
      return true
    }
    page.dismissAndroidBlockersOnce = async () => {}
    page.waitForLoginEntry = async condition => {
      for (let i = 0; i < 5; i++) if (await condition()) return
      throw new Error('Login entry was not reached')
    }
    await page.prepare()
    assert.equal(screen, 'register')
    assert.deepEqual(taps, initial === 'pin' ? ['login_button_logout', 'logout_button_continue'] : ['logout_button_continue'])
  })
}

test('Android Home scroll directions are distinct and reaching an edge does not trigger a second swipe', async () => {
  const directions = []
  const { default: home } = loadPage('HomeScreenPage', { browser: {
    isAndroid: true,
    getWindowRect: async () => ({ width: 1080, height: 2340 }),
    execute: async (_command, args) => { directions.push(args.direction); return false },
    pause: async () => {},
    performActions: async () => { throw new Error('An edge is not a driver failure') },
  } })
  assert.equal(await home.scrollDownOnce(), false)
  assert.equal(await home.scrollUpOnce(), false)
  assert.deepEqual(directions, ['down', 'up'])
})

for (const isIOS of [false, true]) {
  test(`Home reads a visible recent payee on ${isIOS ? 'iOS' : 'Android'} without a fixed account name`, async () => {
    const labels = [
      { text: 'Recent Payees', visible: true },
      { text: 'View All', visible: true },
      { text: 'Hidden Person', visible: false },
      { text: '  Anne  O\'Neil  ', visible: true },
    ]
    const { default: home } = loadPage('HomeScreenPage', {
      browser: { isIOS },
      $: () => ({ $$: async () => labels.map(label => ({
        isDisplayed: async () => label.visible,
        getText: async () => label.text,
      })) }),
    })
    home.ensureVisibleByScrolling = async () => {}
    assert.equal(await home.readRecentPayeeName(), "Anne O'Neil")
  })
}

test('empty Recent Payees fails the fixture precondition instead of using a default person', async () => {
  const { default: home } = loadPage('HomeScreenPage', {
    $: () => ({ $$: async () => [] }),
  })
  home.ensureVisibleByScrolling = async () => {}
  await assert.rejects(home.readRecentPayeeName(), /TEST_PRECONDITION.*visible payee/)
})

test('Home Search searches the name captured before entering search and waits for its result', async () => {
  const calls = []
  const name = `Anne O'Neil "QA"`
  const home = {
    waitForHomeLoaded: async () => {},
    ensureIndividualAccount: async () => {},
    readHomeSearchPayeeName: async () => { calls.push('read'); return name },
    recentPayeesSection: { waitForDisplayed: async options => {
      assert.equal(options.reverse, true)
      calls.push('home-hidden')
    } },
    recentActivityHeader: { waitForDisplayed: async options => {
      assert.equal(options.reverse, true)
      calls.push('activity-hidden')
    } },
  }
  const { default: Page } = loadPage('HomeSearchPage', {
    $: selector => ({ waitForDisplayed: async () => {
      if (!selector.includes('normalize-space')) return
      assert.ok(selector.includes('concat('))
      assert.ok(selector.includes('self::XCUIElementTypeStaticText'))
      assert.ok(!selector.includes('self::XCUIElementTypeSearchField'))
      assert.ok(selector.includes('Anne O'))
      assert.ok(selector.includes('Neil "QA"'))
      assert.equal(calls.at(-1), 'activity-hidden')
      calls.push('result')
    } }),
  }, { './HomeScreenPage': { default: home } })
  const page = new Page()
  page.dismissIOSAlerts = async () => {}
  page.revealSearchInput = async () => {}
  page.typeIntoSearch = async query => { assert.equal(query, name); calls.push('type') }
  await page.verifyHomeSearch()
  assert.deepEqual(calls, ['read', 'type', 'home-hidden', 'activity-hidden', 'result'])
})

for (const source of ['payees', 'activity', 'missing']) {
  test(`Home Search auto-selects its recipient source (${source})`, async () => {
    let position = 0
    const { default: home } = loadPage('HomeScreenPage', { browser: { isAndroid: true } })
    home.ensureHomeBeforeSectionLookup = async () => {}
    home.scrollToHomeTop = async () => {}
    home.scrollDownOnce = async () => ++position < 2
    home.readActivityRecipientName = async () => source === 'missing' ? null : 'Activity Person'
    home.readRecentPayeeName = async () => 'Payee Person'
    Object.defineProperty(home, 'recentPayeesSection', { value: { isDisplayed: async () => source === 'payees' && position === 1 } })
    Object.defineProperty(home, 'recentActivityHeader', { value: { isDisplayed: async () => position === 0 } })
    if (source === 'missing') await assert.rejects(home.readHomeSearchPayeeName(), /TEST_PRECONDITION/)
    else assert.equal(await home.readHomeSearchPayeeName(), source === 'payees' ? 'Payee Person' : 'Activity Person')
  })
}

test('Recent Activity fallback takes the first person or company, skipping system entries', async () => {
  const label = text => ({ isDisplayed: async () => true, getText: async () => text })
  const row = (name, amount) => ({
    isDisplayed: async () => true,
    $$: async () => [name, '6 Nov 2026, 12:00', amount].map(label),
  })
  const { default: home } = loadPage('HomeScreenPage', { browser: { isAndroid: true } })
  Object.defineProperty(home, 'recentActivityRows', { value: [
    row('Exchanged From Eur', '- €5.00'),
    row('Example Store', '- €5.00'),
    row('Alex Example', '+ €8.00'),
  ] })
  assert.equal(await home.readActivityRecipientName(), 'Example Store')
})

test('Home recent-transactions assertion fails when the header has no transaction rows', async () => {
  const { default: home } = loadPage('HomeScreenPage', { browser: { isAndroid: true, waitUntil } })
  home.ensureHomeBeforeSectionLookup = async () => {}
  home.scrollToHomeTop = async () => {}
  home.ensureVisibleByScrolling = async () => {}
  Object.defineProperty(home, 'recentActivityRows', { value: [] })
  await assert.rejects(home.verifyRecentTransactions(), /visible transaction row/)
})

for (const isIOS of [false, true]) {
  test(`Recent Activity rows exclude unrelated Home sections on ${isIOS ? 'iOS' : 'Android'}`, () => {
    const { default: home } = loadPage('HomeScreenPage', {
      browser: { isIOS, isAndroid: !isIOS }, $$: selector => ({ selector }),
    })
    const selector = home.recentActivityRows.selector
    const fixture = 'tests/unit/fixtures/home-current.xml'
    const count = execFileSync('xmllint', ['--xpath', `count(${selector})`, fixture], { encoding: 'utf8' }).trim()
    const marker = execFileSync('xmllint', ['--xpath', `string((${selector})/@marker)`, fixture], { encoding: 'utf8' }).trim()
    assert.equal(count, '1')
    assert.equal(marker, 'person-transfer')
  })
}

test('current Home selectors find the holder, account, balance and actions without legacy label IDs', () => {
  const { default: home } = loadPage('HomeScreenPage', { browser: { isAndroid: true } })
  for (const control of [home.accountHolderNameCandidates[0], home.accountTypeCandidates[0],
    home.accountBalanceCandidates[0], home.addFundsButton, home.exchangeButton, home.detailsButton,
    home.recentActivityHeader, home.spendAnalyticsCandidates[0]]) {
    const count = execFileSync('xmllint', ['--xpath', `count(${control.selector})`, 'tests/unit/fixtures/home-current.xml'], { encoding: 'utf8' }).trim()
    assert.equal(count, '1', control.selector)
  }
})

test('a Recent Payees section cannot satisfy the Home Recent Activity check', () => {
  const { default: home } = loadPage('HomeScreenPage', { browser: { isAndroid: true } })
  for (const candidate of home.recentActivitiesCandidates) assert.ok(!candidate.selector.includes('recentPayees'))
})

for (const enabled of [false, true]) {
  test(`button assertion checks the actual ${enabled ? 'enabled' : 'disabled'} state`, async () => {
    let present = false, reads = 0
    const control = { waitForExist: async () => { present = true }, isEnabled: async () => { reads++; return reads > 1 ? enabled : !enabled } }
    const { waitForControlEnabled } = load('src/helpers/controlState.helper.ts', { '@wdio/globals': { browser: { waitUntil } } })
    await waitForControlEnabled(control, enabled, 'fixture')
    assert.equal(present, true)
    assert.equal(reads, 2)
    control.isEnabled = async () => !enabled
    await assert.rejects(waitForControlEnabled(control, enabled, 'fixture'), /must be/)
  })
}

test('missing controls and driver errors cannot masquerade as disabled buttons', async () => {
  const { waitForControlEnabled } = load('src/helpers/controlState.helper.ts', { '@wdio/globals': { browser: { waitUntil } } })
  await assert.rejects(waitForControlEnabled({ waitForExist: async () => { throw new Error('missing') } }, false, 'fixture'), /missing/)
  await assert.rejects(waitForControlEnabled({ waitForExist: async () => {}, isEnabled: async () => { throw new Error('transport') } }, false, 'fixture'), /transport/)
})

test('Auto Top-Up checks the iOS save control, not its always-enabled text child', async () => {
  const calls = []
  const { default: Page } = loadPage('AutoTopUpPage', {
    $: selector => ({ selector, waitForExist: async () => {} }),
  }, { '../helpers/controlState.helper': { waitForControlEnabled: async (control, enabled) => calls.push({ selector: control.selector, enabled }) } })
  await new Page().verifySaveEnabled(false)
  assert.equal(calls[0].enabled, false)
  assert.doesNotMatch(calls[0].selector, /XCUIElementTypeStaticText/)
  assert.match(calls[0].selector, /autoTopup_button_save/)
})

test('empty partial salary clears the input without leaving the previous amount', async () => {
  let clears = 0, sets = 0
  const { default: Page } = loadPage('SalaryStipendPensionPage', { $: selector => ({
    waitForExist: async () => {}, clearValue: async () => { clears++ }, setValue: async () => { sets++ },
  }) })
  const page = new Page()
  page.tap = async () => {}
  await page.selectPartialSalaryPreference('')
  assert.equal(clears, 1)
  assert.equal(sets, 0)
})

for (const text of ['Minimum amount: EUR 10.00', 'Minimum amount: 10,00 EUR', 'Minimum amount: EUR 100.00', '']) {
  test(`top-up minimum validation is exact (${text || 'missing copy'})`, async () => {
    const { default: Page } = loadPage('AddFunds', {
      browser: { isIOS: true }, $: () => ({ waitForDisplayed: async () => {}, getAttribute: async () => text }),
    })
    if (text.includes('100.00') || !text) await assert.rejects(new Page().verifyMinimumTopUpError(), /formatted 10.00/)
    else await new Page().verifyMinimumTopUpError()
  })
}

test('cold launch uses the configured app and observes login without preparing or bypassing it', async () => {
  const calls = []
  const { default: page } = load('src/pages/AppLifecyclePage.ts', {
    '@wdio/globals': { browser: {
      isIOS: true, capabilities: { 'appium:bundleId': 'fixture.app' },
      terminateApp: async id => calls.push(['terminate', id]), activateApp: async id => calls.push(['activate', id]),
      switchContext: async context => calls.push(['context', context]),
    } },
    './LoginPage': { loginPage: { authLoginNavBar: { waitForDisplayed: async () => calls.push(['gate']) } } },
    './HomeScreenPage': { default: {} },
  })
  await page.verifyColdLaunchRequiresLogin()
  assert.deepEqual(calls, [['terminate', 'fixture.app'], ['activate', 'fixture.app'], ['context', 'NATIVE_APP'], ['gate']])
})

test('short and long background cases stay on opposite sides of the source grace period', async () => {
  const durations = [], states = []
  const { default: page } = load('src/pages/AppLifecyclePage.ts', {
    '@wdio/globals': { browser: { isIOS: true, background: async seconds => durations.push(seconds), switchContext: async () => {} } },
    './LoginPage': { loginPage: { authLoginNavBar: { isDisplayed: async () => false, waitForDisplayed: async () => states.push('gate') } } },
    './HomeScreenPage': { default: { waitForHomeLoaded: async () => states.push('home') } },
  })
  await page.verifyShortBackgroundResumesHome()
  await page.verifyLongBackgroundRequiresLogin()
  assert.deepEqual(durations, [3, 21])
  assert.deepEqual(states, ['home', 'gate'])
})

test('Android lifecycle calls fail explicitly instead of silently passing iOS contracts', async () => {
  const { default: page } = load('src/pages/AppLifecyclePage.ts', {
    '@wdio/globals': { browser: { isIOS: false } }, './LoginPage': {}, './HomeScreenPage': {},
  })
  await assert.rejects(page.verifyShortBackgroundResumesHome(), /iOS-only/)
})

test('an unexpected login gate after a short background is a real failure', async () => {
  const { default: page } = load('src/pages/AppLifecyclePage.ts', {
    '@wdio/globals': { browser: { isIOS: true, background: async () => {} } },
    './LoginPage': { loginPage: { authLoginNavBar: { isDisplayed: async () => true } } },
    './HomeScreenPage': { default: { waitForHomeLoaded: async () => {} } },
  })
  await assert.rejects(page.verifyShortBackgroundResumesHome(), /Re-authentication appeared/)
})

test('the registered-number assertion requires a login root, not only a generic keypad', async () => {
  const selectors = []
  const { default: Page } = loadPage('AuthenticationPage', {
    browser: { isAndroid: true }, $: selector => ({ waitForDisplayed: async () => selectors.push(selector) }),
  }, { './LoginPage': {}, '../helpers/passcodeWarning.helper': {} })
  const page = new Page()
  await page.verifyRegisteredNumberLoginScreen()
  assert.match(selectors[0], /login_screen/)
  assert.doesNotMatch(selectors[0], /RegistrationConfirmPasscode/)
  assert.match(selectors[1], /keypad_text_1/)
})

test('admin restriction fails if an assignee picker was opened underneath the popup', async () => {
  const { default: page } = loadPage('BusinessCardAdminSelfAssignPage', {
    browser: { isAndroid: true }, $: () => ({ isExisting: async () => true }),
  })
  page.verifyAdminSelfAssignAlert = async () => {}
  await assert.rejects(page.verifyAssigneePickerNotOpened(), /incorrectly opened/)
})
