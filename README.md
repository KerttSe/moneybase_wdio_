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
- `BROWSERSTACK=true` to use BrowserStack capabilities instead of local simulators/emulators

BrowserStack-specific variables:

- `BROWSERSTACK_USERNAME`
- `BROWSERSTACK_ACCESS_KEY`
- `BS_APP_ANDROID` (expects a `bs://...` app url from BrowserStack)
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

Run a single spec:

```bash
npm run wdio -- --spec src/tests/<file>.spec.ts
```

Run a single spec on one platform only:

```bash
PLATFORM=android npm run wdio -- --spec src/tests/launch.spec.ts
PLATFORM=ios npm run wdio -- --spec src/tests/homeScreen.spec.ts
```

Run on BrowserStack:

```bash
BROWSERSTACK=true PLATFORM=android npm run wdio -- --spec src/tests/addfunds.spec.ts
```

## Reporting

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
- one matrix entry still references the old path `src/tests/bankTransfer.individual.spec.ts`; the repo now has `bankTransfer.p2p.individual.spec.ts` and `bankTransfer.sepa.individual.spec.ts`

## Conventions

- Keep selectors in page objects
- Prefer accessibility IDs and resource IDs before text selectors
- Add platform-specific fallbacks when Compose or iOS hierarchy is unstable
- Keep spec files focused on a single business flow
