# Moneybase regression coverage audit

Snapshot: 2026-11-04, local workspace (113 spec files). Published baseline:
[Moneybase main at 0ff9c01](https://github.com/KerttSe/moneybase_wdio_/commit/0ff9c01f3c3e3df969c9d6f94d49c46a60a5cfbf) (66 spec files).
The counts below describe the **local workspace**, not a claim about the published commit or a successful full regression.

The [row-by-row audit](regression-matrix-row-audit-2026-11-04.md) lists all 519 workbook cases, the assertion that supports each match, and what remains.

## Findings

- **101 of 519 distinct source test cases** have matched UI evidence. There are **18 UI asserted** and **83 partial**.
- **69 additional cases** have checks awaiting BrowserStack verification. The required-name spec strengthens KYC-011, which was already counted as partial.
- 28 cases have reusable setup. Another 321 are pending attribution.
- Of 198 P1 cases, 13 are UI asserted, 52 partial, 28 awaiting BrowserStack, 18 reuse only and 87 pending attribution.

| Feature | Matrix | UI asserted | Partial | Awaiting BrowserStack | Reuse only | Unmapped | P1 not fully UI-asserted |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Authentication | 56 | 2 | 18 | 6 | 1 | 29 | 32 |
| KYC and Onboarding | 47 | 1 | 11 | 4 | 6 | 25 | 22 |
| Launch and Lifecycle | 11 | 4 | 2 | 0 | 1 | 4 | 2 |
| Dashboard and Home | 35 | 1 | 8 | 5 | 2 | 19 | 10 |
| Payments and Beneficiaries | 85 | 7 | 19 | 11 | 3 | 45 | 22 |
| Cards and Business Cards | 92 | 2 | 13 | 5 | 6 | 66 | 30 |
| Wallets and Statements | 45 | 1 | 5 | 20 | 1 | 18 | 20 |
| Profile and Settings | 45 | 0 | 6 | 12 | 0 | 27 | 17 |
| Crypto | 49 | 0 | 0 | 0 | 3 | 46 | 16 |
| WebViews | 23 | 0 | 1 | 0 | 2 | 20 | 7 |
| Support | 19 | 0 | 0 | 6 | 0 | 13 | 5 |
| Joint Accounts | 12 | 0 | 0 | 0 | 3 | 9 | 2 |
| **Total** | **519** | **18** | **83** | **69** | **28** | **321** | **185** |

A spec can support several source test cases. [Business card relink](../src/tests/businessCard.relink.spec.ts) provides evidence for four cases spanning entry permissions, another user's card, wallet selection and relinking. [Lifecycle regression](../src/tests/lifecycle.regression.spec.ts) provides evidence for five cases spanning cold launch, session restoration and short/long backgrounding. The audit counts each source case once across all specs and platforms.

The Account Picker, applicant passcode policy and logout journeys share one setup per feature and exercise eight distinct case IDs. The individual Wallet Details spec now opens the statement report and exercises two additional export-option cases. [Account Picker](../src/tests/accountPicker.search.spec.ts), [Passcode policy](../src/tests/onboarding.passcodePolicy.spec.ts), [Logout](../src/tests/profile.logout.spec.ts), [Statements](../src/tests/walletDetails.statementIndividual.spec.ts)

## Existing regression by CI block

The local [workflow](../.github/workflows/wdio-regression.yml) assigns all 113 spec files exactly once. The historical Android columns count deduplicated BrowserStack checkpoint results. A spec can have several checkpoints, including setup.

| CI block | Primary specs | Secondary specs | #3 specs seen | #3 pass / fail | #2 pass / fail / timeout |
| --- | ---: | ---: | ---: | ---: | ---: |
| Home & Navigation | 13 | 3 | 6 | 24 / 5 | 13 / 5 / 0 |
| Bank Transfers & Beneficiaries | 21 | 7 | 8 | 47 / 2 | 22 / 2 / 1 |
| Payments, Top-ups & FX | 8 | 6 | 6 | 37 / 0 | — |
| Cards | 14 | 4 | 4 | 10 / 8 | — |
| Invest | 4 | 2 | 4 | 8 / 1 | — |
| Authentication | 0 | 11 | 2 | 2 / 0 | — |
| Onboarding & Account | 0 | 20 | 2 | 11 / 0 | — |
| **Total** | **60** | **53** | **32** | **139 / 16** | **35 / 7 / 1** |

Invest has six local specs. Portfolio, BMW buy order, price alert creation/deletion and opening Cash Funds had passing checkpoints in #3. The local suite also includes watchlist and order regression. This is existing Invest coverage beyond the worksheet's Crypto cases.

## Evidence That Changes The Count

| Case | Found in existing code | Gap or limit |
| --- | --- | --- |
| AUTH-001, AUTH-016, AUTH-018, AUTH-055 | [Phone validation](../src/tests/authentication.phoneValidation.spec.ts) requires the authentication screen and keypad. [Incorrect PIN](../src/tests/authentication.incorrectPasscode.spec.ts) requires feedback after individual key taps, and [OTP countdown](../src/tests/authentication.otpCountdown.spec.ts) requires the next flow's Resend control. [View PIN](../src/tests/cardManagement.viewPin.spec.ts) requires a passcode prompt and the revealed card PIN. | Scope is limited to the visible screen, feedback and transition. Per-digit values, keypad lock and the exact caller-supplied text remain unverified. |
| KYC-011, KYC-015 | [Invalid names](../src/tests/onboarding.invalidNames.spec.ts) checks Next with valid names and rejection of invalid input. [Employment fields](../src/tests/onboarding.employmentFields.spec.ts) checks visible Company and Occupation for Employed. [Email consent](../src/tests/onboarding.emailTerms.spec.ts) exercises the positive route to email. | Empty-name combinations and individual required employment fields remain unverified. |
| PAY-082, PAY-085 | [Auto Top-Up](../src/tests/autoTopUp.spec.ts) requires the Add Funds tile and opens the flow. [Partial salary](../src/tests/salary.partialValidation.spec.ts) requires the iOS field with the exact €0 placeholder. | Flag-off behavior and the salary currency rule with a non-EUR active wallet remain unverified. |
| CARD-085 | [Terminate business card](../src/tests/businessCard.terminate.spec.ts) creates, freezes and terminates a new virtual card and checks the Inactive tab. | Transaction history is not independently verified. The comparison with a frozen card that has transactions remains open. |
| CARD-012 / TC3399 | [Assign card](../src/tests/assignBusinessCard.spec.ts) verifies Continue becomes enabled on Android and proceeds to the next step. | Covers the positive state for the existing wallet context. No disabled-state or explicit wallet-selection assertion. |
| CARD-015 / TC3402 | [Assign card](../src/tests/assignBusinessCard.spec.ts) submits the Android assignee address without field edits and checks success and a pending card. | Indirect evidence that the address step can complete. Field-by-field prefill and country mapping remain unverified. |
| PROFILE-007 / TC2961 | [Relink](../src/tests/businessCard.relink.spec.ts) and [Card Limits](../src/tests/businessCard.cardLimits.spec.ts) require the Administration row and open Manage Cards. | Only the visible branch on the configured business account is exercised. |
| PROFILE-015 / TC2969 | [Change Passcode](../src/tests/authentication.changePasscode.spec.ts) requires the Settings row to proceed and confirms successful change. | The configured account exercises one branch. Flag states and visibility direction remain unverified. |
| PAY-068 / TC3339 | [FX regression](../src/tests/fxExchange.regression.spec.ts) taps the iOS currency wallet row, waits for dismissal and checks the applied currency. | Evidence applies to the live FX picker. The standalone native currency list and its dismissal timing remain unverified. |
| PAY-001 / TC3272 | [P2P transfer](../src/tests/bankTransfer.p2p.individual.spec.ts) submits by slider and checks the outgoing amount; iOS also waits for details. | Zero fee and terminal status for a uniquely identified new transaction are not asserted. |
| WALLET-001 / TC2910 | [Wallet Manager](../src/tests/addFundsBankTransferWalletManager.spec.ts) checks configured currencies and a displayed balance. | Does not compare every row against a seeded wallet inventory or validate each balance/icon. |
| CARD-080, CARD-082 / TC3379, TC3381 | [Relink](../src/tests/businessCard.relink.spec.ts) changes an existing wallet on another user's card and checks updated Spend From. | The observable other-user permission is covered; loader and backend from/to keys are not. |
| CARD-019, CARD-083 / TC3406, TC3382 | [Card limits](../src/tests/businessCard.cardLimits.spec.ts) asserts the same limit title for both card types. | No exact body comparison or proof that a blocked row stays unselected. |
| PROFILE-024 / TC2978 | [Personal Details](../src/tests/personalDetails.spec.ts) edits names, taps Save and reads back visible values. | Values can still be in the unsaved form; no navigation pop or reopen/persistence assertion. |
| WEB-001 / TC2887 | [Card top-up](../src/tests/addfunds.spec.ts) asserts the deposit success outcome. | It does not drive a specific gateway callback URL or check the amount on the success screen. |

Do not map Invest watchlist/BMW orders to Crypto, joint card management to joint artwork, or ordinary Invest navigation to webview persistence. Do not map onboarding name validation to Profile name validation. Uncalled Onfido helpers are reuse, not an executed test.

## Device Evidence

- This expansion maps 44 cases to 37 spec files. The checks target Android and iOS through shared assertions and platform-specific Page Objects. The Welcome spec requests a clean BrowserStack session, and the iOS specs that assert native alert choices disable automatic alert acceptance for their sessions.
- TC3147 passed the iOS keypad check in the BrowserStack secondary run. The result covers three digits without entering OTP. Android and the source case's delete-key behavior remain open.
- Historical Android regression #3 passed VOP-1.3 sheet dismissal for TC3291. That checkpoint does not establish focus on the payment input after returning.
- The current cross-platform revision still needs BrowserStack results on both platforms. Earlier run outcomes below refer to the versions that were actually executed.

- The next 11 cases include Welcome Sign In, partial passcode, backing out of Change Passcode, onboarding keyboard behavior, Support close/chat, SEPA reference length and fee display, and business card type changes. Welcome Sign In started in a fresh BrowserStack Android session. The other new checks were queued behind the corresponding active account slots.
- The initial TC3152 run hit a WDIO error while reading carousel slide text. The collection handling is corrected and a fresh Android BrowserStack recheck has started. TC3274 stopped at OTP on its retry, before the amount assertion.
- With the TC3094 locator corrected, the next iOS attempt found both typed values on the form and observed Next still disabled. Name validation now uses the same keystroke helper as the established iOS onboarding flow. The updated implementation still needs a device result.
- The TC3097 iOS run showed Pensioner selected, Company hidden and the occupation field enabled. The accessibility hierarchy did not expose a previous-employment label. The iOS spec now targets the observed occupation field, with the wording still open.

- BrowserStack build group `coverage-120-20261104-143942` contains the first 13 specs. TC3352 and TC2911 stopped in post-OTP setup on their first attempts. On iOS, the BrowserStack hierarchy exposed the Continue control inside the success modal even though Appium marked it invisible. The login flow now uses the modal control's coordinates for that specific state.
- TC3352's Android retry also stopped at login after OTP. The Add Funds assertion was not reached on either attempt.
- Both original TC3094 iOS attempts picked the keyboard's Next. The hierarchy showed the actual form button (`personalDetails_button_next`) disabled. The test now selects that exact button and a BrowserStack recheck was started.
- The remaining nine specs and a TC2911 recheck are queued to start after the earlier runs release their corresponding account slots.

- [Historical regression #3](https://observability.browserstack.com/projects/moneybase_wdio/builds/regression/3): 139 passed and 16 failed execution records across 32 spec files after deduplication. Examples with case-level relevance include Wallet Manager currencies/balance, SWIFT review/result, SEPA VOP and Auto Top-Up deletion. The count includes setup, navigation and sequential checkpoints; it cannot be converted directly into distinct worksheet cases.
- [Historical regression #2](https://observability.browserstack.com/projects/moneybase_wdio/builds/regression/2): 35 passed, 7 failed and 1 timeout across 8 spec files. Historical checkpoint evidence does not establish that later assertions or full workbook requirements passed.
- Admin Self Assign passed opening Cards and tapping Add Card in #3. The restriction popup check failed. Card Limits passed opening Manage Cards, entering Assign Card and selecting Virtual Card. The limit checks failed.
- TC3088 and TC3096 passed once on Android in the [KYC forms build](https://automation.browserstack.com/builds/gdn7ud0sjud5jsh5uouw12abkubocfmfkjhsuva8). Both remain partial against the complete workbook expectations.
- TC3092 passed once on Android in the [targeted rerun](https://automation.browserstack.com/builds/wgitcdkwswzoxrenkbxrzscxw1ekhdkis028i7i2), after correcting the Compose Continue locator. TC3089 is implemented but not device-verified.
- TC3075 has an [Android pass](../allure-results/regression-TC3075-20261103-151821/4a2319bc-9aab-428b-9327-d15b6a761c00-result.json). The TC3053 run was [Android blocked in OTP setup](https://app-automate.browserstack.com/builds/dd771a1679886d43a5a766dd73cf561811cf8605/sessions/02b2d33f8100451795fa3657a23196b15bc3f10a); its balance assertion did not execute. No final TC3078 result was found in its targeted Allure directory.
- An iOS SEPA run has all three smoke checkpoints passing in `allure-results/sepa-bs-ios-20261103-133122`; it does not establish unique transfer identity or the exact timing/failure half of PAY-053.
- These are the case-specific results identified in the available artifacts, not an inventory of every historical BrowserStack run. Unit, import and mock results are not device evidence.

## Work Order

The current footprint is 170 cases with an existing or newly implemented check. The target of 200 needs 30 additional source cases. BrowserStack verification is pending for the 69 cases listed in that column.

The final 12 cases to reach 170 share their platform assertions and reuse five existing spec files. TC3158 runs in the secondary lane with its own `AUTH_RECOVERY_MB_PHONE` secret for a registered Malta QA account with a security question. The fixture rejects shared account numbers before opening the recovery flow. The added checks also cover SEPA amount rules and SWIFT rates, statement date boundaries, retail search, Business Home search scope and P2P privacy preferences.

| Cases | Setup needed |
| --- | --- |
| AUTH-025 | Fresh welcome session and a build exposing the legacy Continue behavior. |
| KYC-010, KYC-025, KYC-028, KYC-030, KYC-031 | Seed a known duplicate email and an applicant at the appropriate AML step. |
| PAY-014 | Seed the SWIFT EEA route. Assertions can stop before submission. |
| CARD-014 | Use a business fixture with a physical-card assignment draft. |

1. **Verify the new KYC negative path:** run TC3089 on Android. Then strengthen the existing address spec one field at a time, including unset Country, instead of adding another generic onboarding journey.
2. **Finish partial P1s on proven KYC screens:** TC3098 (Employed requires company, occupation, tax country and PEP), then TC3097 (Pensioner/Homemaker). Reuse the same setup and group related checks within the employment suite. Add no-request evidence where required via a spy.
3. **Make payment assertions identify the new operation:** TC3272/TC3273 require new reference/transaction ID, fee value and terminal outcome. TC3279 no-fee and TC3274 amount-digit cap are good non-submitting follow-ups. Keep the existing P2P/SEPA/SWIFT setup.
4. **Use the existing card and wallet surfaces:** extend TC3394/TC3395 with before/after control states and exact last-four confirmation, and TC3406/TC3382 with body and selection state. Add TC2922 (empty wallet name) and TC2911 (Wallet Manager row to matching Details) as independent cases.
5. **Stabilize fixtures before broad device runs:** make Account Switch fail or explicitly skip when the configured target is absent; replace silent optional assertions; use dedicated resettable OTP, role and disposable card fixtures. Keep primary/secondary unchanged.
6. **Separate product hooks from ordinary WDIO work:** inject controlled network errors/quotes and capture callbacks at the right layer. Onfido, PassKit, biometrics, analytics events, storage, exact timing and bridge payloads need approved fixtures, test hooks or a manual/native test, depending on the row. Don't copy observed defects into expected passing behavior.

## Method

Read the 519 source rows from `Detailed Regression Matrix`, compared scenario/steps/expected result against WDIO test bodies and the invoked Page Object methods. Historical workbook statuses and legacy TC numbers were not used as proof. A fixture, navigation action, unused helper, runtime skip or unrelated screen did not qualify as a matching assertion. Both the platform and any opt-in gates are part of the scope. This conservative audit is a lower bound for the assertions that could be tied to the current workbook; existing specs also test behavior not represented in these 519 rows.
