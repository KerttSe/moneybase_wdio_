# moneybase_wdio_
Production-ready mobile automation framework built with WebdriverIO, TypeScript and Appium v3. Supports Android &amp; iOS, Allure reporting and CI integration.

## What this project includes

- WebdriverIO + TypeScript test framework
- Appium mobile automation (Android + iOS)
- Allure reporting
- Page Object Model architecture

---

## Setup

Install dependencies:

```bash
npm install
```

### Prerequisites

- Node.js `20.20.0` (see `package.json` → `volta`)
- Java JDK (for Android tooling)
- Appium server (v3)
- Xcode + iOS Simulator (for iOS runs)
- Android SDK + Emulator (for Android runs)

Optional (cloud):
- BrowserStack account and credentials

---

## How to run tests

Run all configured tests:

```bash
npm run wdio
```

Run one specific spec file:

```bash
npm run wdio -- --spec src/tests/<file>.spec.ts
```

Examples:

```bash
# Smoke login
npm run wdio -- --spec src/tests/launch.spec.ts

# Home screen checks
npm run wdio -- --spec src/tests/homeScreen.spec.ts

# Add funds flow
npm run wdio -- --spec src/tests/addfunds.spec.ts

# Add beneficiary (Individual)
npm run wdio -- --spec src/tests/addbeneficiary.individual.spec.ts

# Bank transfer (Individual)
npm run wdio -- --spec src/tests/bankTransfer.individual.spec.ts

# Virtual card creation
npm run wdio -- --spec src/tests/physicalcardcreation.spec.ts
```

---

## Allure reports

Generate report:

```bash
npx allure generate allure-results -o allure-report --clean
```

Open report:

```bash
npx allure open allure-report
```

---

## Environment variables

For BrowserStack execution, set:

- `BROWSERSTACK=true`
- `BROWSERSTACK_USERNAME`
- `BROWSERSTACK_ACCESS_KEY`
- `BS_APP_ANDROID`
- `BS_APP_IOS`

Optional BrowserStack metadata:

- `BS_PROJECT`
- `BS_BUILD`
- `BS_ANDROID_DEVICE`
- `BS_ANDROID_OS`
- `BS_IOS_DEVICE`
- `BS_IOS_OS`

Example:

```bash
export BROWSERSTACK=true
export BROWSERSTACK_USERNAME=your_user
export BROWSERSTACK_ACCESS_KEY=your_key
export BS_APP_ANDROID=bs://<android-app-id>
export BS_APP_IOS=bs://<ios-app-id>
```

---

## Platform-specific notes

- Current local config runs **both iOS and Android** capabilities.
- Running one spec still executes it on both platforms.
- To run only one platform, keep a separate single-platform config (for example `wdio.android.conf.ts` / `wdio.ios.conf.ts`) or temporarily comment out the other capability.

---

## Current test flows

- src/tests/launch.spec.ts — smoke login
- src/tests/homeScreen.spec.ts — home screen validation
- src/tests/addfunds.spec.ts — top-up flow
- src/tests/addbeneficiary.individual.spec.ts — add beneficiary (individual)
- src/tests/bankTransfer.individual.spec.ts — P2P transfer (individual)
- src/tests/physicalcardcreation.spec.ts — physical card creation
- src/tests/bankTransfer.business.spec.ts — WIP (currently skipped)

---

## Most fragile flows (current)

1. addbeneficiary.individual.spec.ts
2. bankTransfer.individual.spec.ts
3. homeScreen.spec.ts

These flows include dynamic UI, scroll dependencies, and timing-sensitive transitions.

---

## Troubleshooting

### `no such element`
- Add fallback selectors (`resourceId` + `textContains`)
- Add `waitForDisplayed` before `tap`
- Add scroll-to-anchor helper for long screens

### W3C action / swipe errors
- Increase pause before/after gestures
- Re-check element visibility before swipe

### OTP / keyboard issues
- Try alternate input strategy (`setValue`, `addValue`, platform-specific fallback)
- Hide keyboard after typing when the next control is blocked

### Context issues (Native/WebView)
- Explicitly switch to `NATIVE_APP` before native interactions
- Attach `contexts` and page source for failures

---

## Flaky test policy

- First failure: rerun the same spec once.
- If rerun passes: mark as flaky and create a stabilization task.
- If rerun fails again: treat as regression and open a bug.
- Always attach Allure artifacts (screenshot + page source + contexts).

---

## CI recommendations

- Run smoke specs first (`launch`, `addfunds`).
- Run fragile flows next (`homeScreen`, `bankTransfer.individual`, `addbeneficiary.individual`).
- Publish `allure-results` and `allure-report` as pipeline artifacts.
- Fail pipeline on any non-skipped spec failure.

---

## Test data and account usage

- Keep test accounts deterministic and reusable.
- Avoid destructive data coupling between specs.
- If a flow mutates state (e.g., transfers/cards), validate cleanup or isolate account data.

---

## Conventions

- Keep selectors inside page objects only.
- Prefer stable accessibility IDs first, text locators second.
- Add platform-specific fallback selectors for Android Compose UI.
- Name specs by business flow, e.g. `feature.context.spec.ts`.
