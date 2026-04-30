# Automation Coverage

This document syncs the old `Automation Coverage.xlsx` with the current state of the repository. It reflects what is actually implemented in `src/tests` and `src/pages`, not the broader wish-list from the spreadsheet.

## Implemented In Repo

| Spec | Flow | Platforms | Status | CI | Notes |
| --- | --- | --- | --- | --- | --- |
| `src/tests/launch.spec.ts` | Login flow to Home | Android, iOS | Automated | No | Uses `LoginPage.loginFlow()` |
| `src/tests/homeScreen.spec.ts` | Home screen verification | Android, iOS | Automated | Yes | Verifies header, balance, action buttons, banners, transactions, analytics, nav |
| `src/tests/homeSearch.spec.ts` | Home search | Android, iOS | Automated | No | Validates search result for `Carlos Cat` |
| `src/tests/addfunds.spec.ts` | Card top-up | Android, iOS | Automated | Yes | Goes to 3DS / pay processing flow |
| `src/tests/autoTopUp.spec.ts` | Auto Top-Up create and delete | Android, iOS | Automated | No | Covers create, verify, delete, verify absence |
| `src/tests/addbeneficiary.individual.spec.ts` | Add beneficiary - another person | Android, iOS | Automated | Yes | Uses individual account context |
| `src/tests/bankTransfer.p2p.individual.spec.ts` | Individual P2P transfer | Android, iOS | Automated | Not yet synced | Replaces old generic `bankTransfer.individual.spec.ts` naming |
| `src/tests/bankTransfer.sepa.individual.spec.ts` | Individual SEPA transfer | Android, iOS | Automated | No | Separate spec and page object from P2P |
| `src/tests/fxExchange.spec.ts` | EUR to USD exchange | Android, iOS | Automated | No | Verifies exchange result on Home |
| `src/tests/priceAlerts.spec.ts` | Price alert create and delete | Android, iOS | Automated | No | Platform-specific create/delete implementations |
| `src/tests/physicalcardcreation.spec.ts` | Physical card creation | Android, iOS | Automated | Yes | This is physical card coverage, not virtual card coverage |
| `src/tests/bankTransfer.business.spec.ts` | Business bank transfer | Android, iOS | In progress | No | `describe.skip`, only early navigation step exists |

## Spreadsheet-To-Repo Mapping

The spreadsheet has several sections that still match the repo conceptually, but their status should be read differently now.

| Spreadsheet section | Repo reality |
| --- | --- |
| `LOGIN FLOW` | Implemented via `launch.spec.ts` and reused in most other specs through `LoginPage.loginFlow()` |
| `Home Screen Verification` | Implemented via `homeScreen.spec.ts` |
| `Auto Top-Up` | Implemented via `autoTopUp.spec.ts` |
| `Bank Transfer - Business Account` | Only partial/WIP; current business spec is skipped |
| `Virtual Card Setup` | Not implemented in the repo; current card flow is physical card creation |
| `Switch Account` | Covered only as helper logic inside page objects, not as a standalone spec |

## Covered But Missing In The Spreadsheet

The current repo has automated flows that are not represented clearly in the spreadsheet:

- Home search
- Add beneficiary for another person
- Individual P2P transfer
- Individual SEPA transfer
- FX exchange
- Price alerts
- Physical card creation

## Not Implemented As Standalone Repo Flows

These spreadsheet areas do not currently exist as standalone runnable specs in the repo:

- full onboarding and KYC journey
- virtual card setup
- freeze / unfreeze card
- standalone switch-account validation
- spreadsheet-style API assertions for balance or transaction backend checks

## Important Notes

- Most specs log in first and then switch to the required account context inside page objects.
- Several spreadsheet rows are marked as `UI+API`, but the repo currently verifies them at UI level only unless explicitly noted otherwise.
- The GitHub Actions matrix still contains the outdated spec path `src/tests/bankTransfer.individual.spec.ts`; if CI should cover transfers again, the workflow needs to point to `bankTransfer.p2p.individual.spec.ts` and/or `bankTransfer.sepa.individual.spec.ts`.
