# Regression Matrix Coverage

Source: `regression_automation_matrix_detailed_full.xlsx`, sheet
`Detailed Regression Matrix`, 519 source test cases. Reviewed 2026-10-16.

The current expansion adds 15 specs and 37 named checks across 8 scenario families.
It implements or extends checks for 22 source IDs. This is source-code coverage,
not 22 passing device tests and not completion of all 519 cases. Repeated
checkpoints for one source ID count as one matrix case, not multiple cases.

## Implemented Checks

| Source TC | Matrix ID | Row | Spec | Platforms | Assertion / Limit |
| --- | --- | ---: | --- | --- | --- |
| TC3163 | AUTH-033 | 34 | `authentication.phoneValidation.spec.ts` | Android, iOS | Valid configured number enables Continue. |
| TC3164 | AUTH-034 | 35 | `authentication.phoneValidation.spec.ts` | Android, iOS | Too-short number disables Continue. Partial: shake animation and alphabetic input are not asserted. |
| TC3175 | AUTH-045 | 46 | `authentication.phoneValidation.spec.ts` | Android, iOS | Registered number opens the login-specific root and keypad, not a generic registration keypad. |
| TC3299 | PAY-028 | 167 | `addfunds.validation.spec.ts` | Android, iOS | 9.99 disables Continue and shows the formatted 10.00 minimum. No payment is submitted. |
| TC3342 | PAY-071 | 210 | `autoTopUp.validation.spec.ts` | Android, iOS | Save is disabled with incomplete fields and enabled with a valid card/currency/threshold/amount. Save is never pressed. |
| TC3355 | PAY-084 | 223 | `salary.partialValidation.spec.ts` | iOS | Full enables Next; empty/zero Partial disables it; positive Partial enables it and opens instructions. |
| TC2847 | LAUNCH-003 | 479 | `lifecycle.regression.spec.ts` | iOS | Cold launch with a stored number presents the passcode login gate. |
| TC2848 | LAUNCH-004 | 480 | `lifecycle.regression.spec.ts` | iOS | Authenticated app is terminated and relaunched; login is required again. |
| TC2849 | LAUNCH-005 | 481 | `lifecycle.regression.spec.ts` | iOS | Three-second background resumes Home without the passcode gate. |
| TC2850 | LAUNCH-006 | 482 | `lifecycle.regression.spec.ts` | iOS | Twenty-one-second background presents the login gate. |
| TC2855 | LAUNCH-011 | 487 | `lifecycle.regression.spec.ts` | iOS | Same cold-launch check covers observable login gating. Partial: internal suspension-expiry storage is not inspected. |
| TC3374 | CARD-020 | 488 | `businessCard.adminSelfAssign.spec.ts` | Android, iOS | Exact restriction copy is present and the assignee picker never opens. |
| TC3304 | PAY-033 | 172 | `beneficiary.nameValidation.spec.ts` | Android, iOS | Short, numeric and emoji first/surnames are rejected; apostrophes/hyphens are accepted. A clean valid form is required before each negative case. |
| TC3305 | PAY-034 | 173 | `beneficiary.ibanLength.spec.ts` | Android, iOS | Malta: reject 30 characters with a length error and accept a valid 31-character IBAN. UK length is not exercised. |
| TC3306 | PAY-035 | 174 | `beneficiary.ibanChecksum.spec.ts` | Android, iOS | One changed digit breaks the checksum without changing the 31-character length; a validity error is required, excluding length/country errors. |
| TC3307 | PAY-036 | 175 | `beneficiary.ibanCountry.spec.ts` | Android, iOS | A checksum-valid German IBAN must produce a country mismatch for a Malta beneficiary, not merely a length error. |
| TC3343 | PAY-072 | 211 | `autoTopUp.editUnchanged.spec.ts` | Android, iOS | The exact existing rule is opened; visible Delete and selected values establish edit mode before asserting disabled Save. No rule is created as setup. |
| TC3344 | PAY-073 | 212 | `autoTopUp.currencyReset.spec.ts` | Android, iOS | Both selections must be observable before currency change, then both cleared and Save disabled. Missing selected-state accessibility is a failed precondition, not a pass. |
| TC3347 | PAY-076 | 215 | `autoTopUp.amountAboveRange.spec.ts` | Android, iOS | Partial: maximum accepted, maximum + 0.01 blocks Done, correction enables it. Red styling, shake and haptics are not asserted. |
| TC3348 | PAY-077 | 216 | `autoTopUp.amountBelowRange.spec.ts` | Android, iOS | Partial: minimum accepted, minimum - 0.01 blocks Done, correction enables it. Absence of red styling/shake/haptics is not asserted. |
| TC3085 | KYC-002 | 59 | `onboarding.invalidNames.spec.ts` | Android, iOS | Partial: digits/symbols cannot advance; disabled Next or an on-submit error is required. Both field-error states and absence of API calls are not independently inspected. |
| TC3086 | KYC-003 | 60 | `onboarding.shortName.spec.ts` | Android, iOS | Partial: a two-character first name cannot advance, valid correction recovers. Minimum-length error styling/API-call suppression are not inspected. |

Empty login-form and zero top-up guards are additional checks, not extra matrix
IDs. In particular, the login-form check does not cover AUTH-036 / TC3166:
that case specifically requires the change-mobile-number screen.

## Preconditions And Execution

- Phone-entry tests use the selected lane's already registered account. They
  do not enter a PIN or request an OTP. The account's country must be configured.
- Auto Top-Up requires the lane's active saved card and a currency available
  for a new rule. A fixture with an existing EUR rule may prevent selecting EUR;
  that is a data prerequisite, not a reason to ignore the failed assertion.
- Top-up minimum is 10.00 in the matrix's fixture. Update both expected data and
  assertions deliberately if the configured product minimum changes.
- Partial salary requires an existing EUR wallet. Android implementation is
  absent, so the suite explicitly skips Android rather than calling no-op
  page methods and reporting a pass.
- Lifecycle expectations come from iOS AppDelegate/AppCoordinator contracts.
  Android is explicitly skipped until its lifecycle behaviour is established.
- Lifecycle setup authenticates before each independent scenario. Observation
  after a cold launch does not call login preparation or enter credentials.
- Beneficiary fixtures use the existing IBAN validation helper: a valid Malta
  IBAN, its one-character-short variant, a same-length checksum-invalid variant
  and a known checksum-valid German example. Successful details are not submitted.
  Negative submission can trigger validation but never confirms review or OTP.
- Auto Top-Up edit, currency reset and range tests need explicit fixtures:
  `AUTO_TOP_UP_EDIT_RULE_A11Y`, `AUTO_TOP_UP_TEST_SECOND_CURRENCY`,
  `AUTO_TOP_UP_TEST_MIN_AMOUNT` and `AUTO_TOP_UP_TEST_MAX_AMOUNT` respectively.
  The limits must describe the EUR add-amount picker, not the threshold picker.
  Configure these in `.env` locally or matching GitHub repository variables for
  CI. Missing/invalid fixture values fail with `CONFIGURATION_ERROR`, not skips.
  Boundary arithmetic uses integer cents; no limits are guessed or rules saved.
- KYC name tests verify a new generated test mobile number through the existing
  onboarding setup and stop on Personal Details. This creates partial test
  registrations, requires a working OTP fixture, and does not complete KYC or
  save an incomplete account as the shared onboarded-account fixture. Generated
  numbers exclude configured primary, secondary, security and business accounts.
  These cases do not cover KYC-011, which uses a different confirmation controller.

The existing seven workflow categories include every spec exactly once per
platform. New specs keep explicit primary/secondary lanes; no existing lane is
reassigned. Previously omitted legacy entries are now included in the local
split suites as well. The WIP business-transfer spec remains skipped: listing
it in a suite does not establish implemented transfer coverage.

## Verification Status

Local verification on 2026-10-16:

- 85 targeted unit/import/configuration checks passed, including loading all
  62 specs on both Android and iOS without device commands.
- `npx tsc --noEmit` and `git diff --check` passed.
- The complete unit suite passed 107 of 116 checks. Its nine pre-existing
  harness failures remain: eight missing Allure dependency mocks in
  `sequentialSmoke.test.cjs`, and one iOS predicate incorrectly evaluated as
  XPath by `smoke72.test.cjs`. This is not a fully green unit-suite result.

Import checks, unit tests, category-selection tests and TypeScript compilation
run locally without device commands. The new checks have not been executed on
BrowserStack. Selector compatibility, real fixtures, login/OTP availability and
timing behaviour still require targeted device runs before marking matrix rows
as verified automated coverage. Existing workbook statuses have not been changed.

Remaining matrix work includes the change-mobile-number screens, additional KYC
validation and external verification, crypto trading/search/watchlists, profile/settings,
support, wallets/statements and injected API/offline failures. No generic page
navigation or shared login is treated as full coverage of those source cases.
