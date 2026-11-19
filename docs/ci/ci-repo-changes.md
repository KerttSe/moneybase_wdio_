# Changes to copy into the CI repository (2026-11-17)

The regression and smoke workflows that run with secrets live in a separate CI repository. The workflow files in this repository are a mirror, so the changes below reach real CI only after they are copied there.

## 1. New specs in the regression categories

Add each spec to the category list in that repository's `wdio-regression.yml`, after the spec shown.

| Spec | Category | Add after | Account group |
| --- | --- | --- | --- |
| `crypto.spec.ts` | `invest` | `watchlist.spec.ts` | primary |
| `moreMenu.spec.ts` | `onboarding_account` | `profile.logout.spec.ts` | primary |
| `personalDetails.nameValidation.spec.ts` | `onboarding_account` | `personalDetails.spec.ts` | primary |
| `homeSearch.scope.spec.ts` | `home_navigation` | `homeSearch.spec.ts` | primary |
| `transactions.personalNote.spec.ts` | `payments` | `transactions.spec.ts` | primary |
| `businessCard.assigneeAddressRules.spec.ts` | `cards` | `assignBusinessCard.spec.ts` | primary |
| `physicalCard.orderFormRules.spec.ts` | `cards` | `physicalcardcreation.spec.ts` | rog |
| `payees.search.spec.ts` | `bank_transfers` | `beneficiary.ibanLength.spec.ts` | rog |
| `businessCard.reportSheet.spec.ts` | `cards` | `businessCard.terminate.spec.ts` | businessHolder |
| `moreMenu.businessRows.spec.ts` | `onboarding_account` | `moreMenu.spec.ts` | primary |
| `walletDetails.statementGenerate.spec.ts` | `bank_transfers` | `walletDetails.statementIndividual.spec.ts` | primary |

The account group comes from `src/data/regressionAccounts.json`, which is part of the code checkout, so it needs no change in the CI repository if CI checks out this code.

Both `rog` specs also passed on the Samsung under ROG40015 on 2026-11-17.

`payees.search` step TC3292 taps a phone contact that is not on Moneybase. A BrowserStack device has no phone contacts, so expect that step to fail there; it is verified on the local Samsung.

## 2. Onboarded account pool cache

Copy the restore and save steps from `docs/ci/onboarded-pool-cache.md` around `Run tests` in every smoke job that runs `onboarding.spec.ts` and every regression job that runs the `authSecurity` group. No secret is needed.

## 3. Secrets

| Secret | Change |
| --- | --- |
| `AUTH_SECURITY_MB_PHONE`, `AUTH_SECURITY_MB_PIN`, `AUTH_SECURITY_OTP_PHONE` | Point to the CRO40021 security account. CI still logged in with the locked 99981234 on 2026-11-11. |
| `AUTH_RECOVERY_MB_PHONE` | Must be a separate registered Malta QA account with a security question; `authentication.recoveryQuestions` fails without it. |

## 4. Check after the next run

- The restore step logs `Cache restored from key` from the second run on.
- `authentication.incorrectPasscode` logs `[Pool] ... took onboarded account`, not a login with `AUTH_SECURITY`.
