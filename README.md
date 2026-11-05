# mobile-wdio
Mobile automation framework for Moneybase built with WebdriverIO, TypeScript and Appium. The repo runs Android and iOS flows, generates Allure artifacts on every run, and keeps selectors inside page objects.

## Stack

- WebdriverIO 9
- TypeScript 5
- Appium 3
- Mocha
- Allure reporter

## Project layout

- `src/tests` contains the runnable spec files
- `src/pages` contains page objects and reusable business flows
- `src/helpers` contains Allure and OTP helpers
- `src/data/credentials.ts` reads the auth data used by login-based flows
- `wdio.conf.ts` contains the full local and BrowserStack capability setup

## Prerequisites

- Node.js `20.20.0`
- Java JDK
- Appium server
- Xcode + iOS Simulator
- Android SDK + emulator

The current local config in [`wdio.conf.ts`](/Users/dmytrokertys/mobile-wdio/wdio.conf.ts) points to machine-specific app binaries:

- iOS app: `/Users/dmytrokertys/Desktop/app/moneybase.app`
- Android app: `/Users/dmytrokertys/Desktop/app/app-qa-debug.apk`

If these paths differ on your machine, update them before running locally.

## Install

```bash
npm install
```

## Configuration

Baseline test credentials come from [`.env.example`](/Users/dmytrokertys/mobile-wdio/.env.example):

```bash
cp .env.example .env
```

- `MB_COUNTRY`
- `MB_PHONE`
- `MB_PIN`

Optional execution switches:

- `PLATFORM=ios` or `PLATFORM=android` to filter capabilities
- `APPIUM_PORT` to override the local Appium port
- `IOS_UDID` to run local iOS tests on a real iPhone instead of the configured simulator
- `IOS_DEVICE_NAME` to label the real iOS device capability, for example `iPhone`
- `IOS_APP` to override the local iOS app path
- `ANDROID_UDID` to run local Android tests on a real device instead of the configured emulator
- `ANDROID_USE_INSTALLED_APP=true` to use the QA app installed from App Tester on
  that device, without reinstalling the local APK or clearing app data. Requires
  `ANDROID_UDID`. Optional `ANDROID_APP_PACKAGE` / `ANDROID_APP_ACTIVITY` select
  the installed application; their defaults are Moneybase QA.
- `BROWSERSTACK=true` to use BrowserStack capabilities instead of local simulators/emulators

BrowserStack-specific variables:

- `BROWSERSTACK_USERNAME`
- `BROWSERSTACK_ACCESS_KEY`
- `BS_APP_ANDROID` (optional override for the default Android `bs://...` app URL)
- `BS_APP_IOS` (expects a `bs://...` app url from BrowserStack)
- `BS_PROJECT`
- `BS_BUILD`
- `BS_ANDROID_DEVICE`
- `BS_ANDROID_OS`
- `BS_ANDROID_APP_PACKAGE` (optional)
- `BS_ANDROID_APP_ACTIVITY` (optional, if you need to force the start activity)
- `BS_IOS_DEVICE`
- `BS_IOS_OS`
- `BS_IOS_BUNDLE_ID` (optional)

## Running tests

Run every spec on every enabled capability:

```bash
npm run wdio
```

Run the complete regression on BrowserStack, one spec/session at a time. Run
Android first, then iOS, because both platforms use the same test accounts.
Separate results directories keep old runs out of the new report:

```bash
MB_RUN_ID=$(date +%Y%m%d-%H%M%S)
BROWSERSTACK=true PLATFORM=android WDIO_MAX_INSTANCES=1 MB_AUTH_SLOT= \
  ALLURE_RESULTS_DIR="allure-results/regression-$MB_RUN_ID/android" \
  ALLURE_REPORT_DIR="allure-report/regression-$MB_RUN_ID/android" \
  npm run wdio -- --suite regression

BROWSERSTACK=true PLATFORM=ios WDIO_MAX_INSTANCES=1 MB_AUTH_SLOT= \
  ALLURE_RESULTS_DIR="allure-results/regression-$MB_RUN_ID/ios" \
  ALLURE_REPORT_DIR="allure-report/regression-$MB_RUN_ID/ios" \
  npm run wdio -- --suite regression
```

`regression` selects all current spec files. Each spec still runs independently
with its existing Page Objects and primary/secondary account assignment.
Existing platform/WIP skips remain visible in Allure. Expected negative
scenarios pass when the application rejects invalid input. A failure remains a
failure and the existing spec-file retry policy applies.

Open a platform's report with:

```bash
npx allure open "allure-report/regression-$MB_RUN_ID/android"
npx allure open "allure-report/regression-$MB_RUN_ID/ios"
```

For a focused fix, keep the same environment variables and replace
`--suite regression` with `--spec src/tests/autoTopUp.amountBelowRange.spec.ts`.
See [the 12-week delivery plan](docs/regression-12-week-plan.md) for priorities,
source-matrix counts and criteria for verified coverage.

Run a single spec:

```bash
npm run wdio -- --spec src/tests/<file>.spec.ts
```

Run the smoke suite:

```bash
npm run wdio -- --suite smoke
```

Run smoke on BrowserStack Android:

```bash
BROWSERSTACK=true PLATFORM=android npm run wdio -- --suite smoke
```

Run a single spec on one platform only:

```bash
PLATFORM=android npm run wdio -- --spec src/tests/launch.spec.ts
PLATFORM=ios npm run wdio -- --spec src/tests/homeScreen.spec.ts
```

Run a single spec on a connected real iPhone:

```bash
BROWSERSTACK=false PLATFORM=ios IOS_UDID=<device-udid> IOS_DEVICE_NAME=iPhone npm run wdio -- --spec src/tests/launch.spec.ts
```

Run on BrowserStack:

```bash
BROWSERSTACK=true PLATFORM=android npm run wdio -- --spec src/tests/addfunds.spec.ts
```

Onboarding is included in the main smoke suite. For a faster run without the identity verification path:

```bash
BROWSERSTACK=true PLATFORM=android npm run wdio -- --suite onboarding
BROWSERSTACK=true PLATFORM=android npm run wdio -- --suite smokeWithoutOnboarding
```

## Reporting

The 19 smoke specs use named, sequential `it` cases like the regression specs.
These cases appear individually in BrowserStack Test Observability and Allure.
See [Smoke Specifications](docs/smoke-specifications.md) for scope and limitations.

`wdio.conf.ts` generates `allure-results` during execution and runs:

```bash
npx allure generate allure-results -o allure-report --clean
```

automatically in `onComplete`.

To open the generated report manually:

```bash
npx allure open allure-report
```

## Current automated coverage

The repo currently contains these runnable flows:

- `launch.spec.ts` - login smoke through to Home
- `homeScreen.spec.ts` - Home screen verification
- `homeSearch.spec.ts` - Home search result validation
- `addfunds.spec.ts` - card top-up flow
- `autoTopUp.spec.ts` - create, verify, and delete Auto Top-Up
- `addbeneficiary.individual.spec.ts` - add beneficiary for another person
- `bankTransfer.p2p.individual.spec.ts` - individual P2P transfer
- `bankTransfer.sepa.individual.spec.ts` - individual SEPA transfer
- `fxExchange.spec.ts` - EUR to USD exchange
- `priceAlerts.spec.ts` - create and delete price alerts
- `physicalcardcreation.spec.ts` - physical card creation

Work in progress:

- `bankTransfer.business.spec.ts` is present but wrapped in `describe.skip`

Detailed repo-synced coverage notes live in [docs/automation-coverage.md](/Users/dmytrokertys/mobile-wdio/docs/automation-coverage.md).

## CI

The GitHub Actions workflow is defined in [`.github/workflows/ci.yml`](/Users/dmytrokertys/mobile-wdio/.github/workflows/ci.yml) and is designed to run a smoke subset on a self-hosted runner.

Current CI notes:

- the workflow uploads both `allure-results` and `allure-report`
- the matrix currently targets a smoke subset only

## Conventions

- Keep selectors in page objects
- Prefer accessibility IDs and resource IDs before text selectors
- Add platform-specific fallbacks when Compose or iOS hierarchy is unstable
- Keep spec files focused on a single business flow
