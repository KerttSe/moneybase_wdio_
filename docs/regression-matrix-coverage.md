# Regression Matrix Coverage

For the full worksheet-to-code audit, use
[Regression Coverage Audit](regression-coverage-audit-2026-11-04.md).
The table below records the expansion, not all matching assertions in the repo.

Source: `regression_automation_matrix_detailed_full.xlsx`, sheet
`Detailed Regression Matrix`, 519 source test cases. Updated 2026-11-04.

The initial expansion tracked 19 new specs and 41 named checks across 26 source IDs.
This is source-code coverage, not 26 passing device tests and not completion of
all 519 cases. Repeated checkpoints for one source ID count as one matrix case.

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
| TC3343 | PAY-072 | 211 | `autoTopUp.editUnchanged.spec.ts` | Android, iOS | Open the specified/first active rule, or create a temporary rule if none is present. Visible Delete and selected values establish edit mode before asserting disabled Save. Cleanup deletes only a rule created by this spec. |
| TC3344 | PAY-073 | 212 | `autoTopUp.currencyReset.spec.ts` | Android, iOS | Both selections must be observable before currency change, then both cleared and Save disabled. Missing selected-state accessibility is a failed precondition, not a pass. |
| TC3347 | PAY-076 | 215 | `autoTopUp.amountAboveRange.spec.ts` | Android, iOS | Partial: maximum accepted, maximum + 1 blocks Done, correction enables it. Red styling, shake and haptics are not asserted. |
| TC3348 | PAY-077 | 216 | `autoTopUp.amountBelowRange.spec.ts` | Android, iOS | Partial: minimum accepted, minimum - 1 blocks Done, correction enables it. Absence of red styling/shake/haptics is not asserted. |
| TC3085 | KYC-002 | 59 | `onboarding.invalidNames.spec.ts` | Android, iOS | Partial: digits/symbols cannot advance; disabled Next or an on-submit error is required. Both field-error states and absence of API calls are not independently inspected. |
| TC3086 | KYC-003 | 60 | `onboarding.shortName.spec.ts` | Android, iOS | Partial: a two-character first name cannot advance, valid correction recovers. Minimum-length error styling/API-call suppression are not inspected. |
| TC3088 | KYC-005 | 62 | `onboarding.addressOptional.spec.ts` | Android, iOS | Submitting the required address with Line 2 untouched advances to Employment, or Email if Employment came first. Does not inspect the request or loader. |
| TC3089 | KYC-006 | 63 | `onboarding.addressRequired.spec.ts` | Android, iOS | Partial: blank text fields block Next or show a new required-field error; a corrected address advances. Country is left untouched; per-field errors and API suppression are not independently asserted. Device run pending. |
| TC3092 | KYC-009 | 66 | `onboarding.emailTerms.spec.ts` | Android, iOS | With a valid email, Continue goes disabled, enabled, then disabled as consent is checked and unchecked. Continue is never pressed; API suppression is not independently inspected. |
| TC3096 | KYC-013 | 70 | `onboarding.employmentFields.spec.ts` | Android, iOS | Partial: Student and Unemployed hide both fields; Employed restores them. Hidden fields' validation is not inspected and Employment is not submitted in this spec. |

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
- Auto Top-Up overrides are optional: `AUTO_TOP_UP_EDIT_RULE_A11Y` selects a
  particular existing rule; otherwise setup reuses an active rule or creates a
  temporary one and cleanup deletes only its own rule. Currency reset selects a
  visible USD/GBP/CHF option unless `AUTO_TOP_UP_TEST_SECOND_CURRENCY` is set.
  EUR add-amount defaults are 10–2500, read from the Android QA amount sheet on
  2026-11-02; these defaults are independent of the Done-button assertions.
  Set `AUTO_TOP_UP_TEST_MIN_AMOUNT` and `AUTO_TOP_UP_TEST_MAX_AMOUNT` together to
  override them. Invalid/partial overrides fail with `CONFIGURATION_ERROR`.
  Boundary arithmetic remains exact in cents, but these device cases use a
  whole-unit step: Android transformed a requested `0.01` into `1` in inspection.
  Integer values omit trailing decimal zeros on input and are read back before
  assertions. The same expected range still requires device verification on iOS.
- KYC name tests verify a new generated test mobile number through the existing
  onboarding setup and stop on Personal Details. This creates partial test
  registrations, requires a working OTP fixture, and does not complete KYC or
  save an incomplete account as the shared onboarded-account fixture. Generated
  numbers exclude configured primary, secondary, security and business accounts.
  These cases do not cover KYC-011, which uses a different confirmation controller.
- The KYC form specs use the same generated-phone onboarding setup. They
  may save earlier applicant steps on QA but never complete registration, enter
  external identity verification, or overwrite the shared onboarded-account
  fixture. They need a working OTP setup for new QA numbers, not an existing
  primary or secondary login. TC3088, TC3092 and TC3096 passed on Android; iOS
  and the new TC3089 device run are pending.

The existing seven workflow categories include every spec exactly once per
platform. New specs keep explicit primary/secondary lanes; no existing lane is
reassigned. Previously omitted legacy entries are now included in the local
split suites as well. Opt-in cases keep their runtime gates: listing a spec
in a category does not mean its cases executed or passed.

## Verification Status

BrowserStack Android on 2026-11-04:

- [Initial KYC forms run](https://automation.browserstack.com/builds/gdn7ud0sjud5jsh5uouw12abkubocfmfkjhsuva8): TC3088 and TC3096 passed. TC3092 reached Email but failed because the tagged Compose Continue control has no nested `android.widget.Button`; its `enabled` state is on the tagged view itself.
- [TC3092 targeted rerun](https://automation.browserstack.com/builds/wgitcdkwswzoxrenkbxrzscxw1ekhdkis028i7i2): passed after checking Continue directly. The button went disabled, enabled, then disabled as consent changed. The test did not submit email.
- The three executed KYC specs each have one passing Android execution. TC3089,
  iOS and repeatability runs are pending.

Local readiness fixes on 2026-11-02:

- The full unit/import/configuration suite passes 124/124 checks. Missing
  reporter mocks were repaired; the Home search selector is now scoped to Home
  instead of matching the More search field as well.
- TypeScript compilation and `git diff --check` pass.
- One Android BrowserStack inspection reached the Auto Top-Up amount sheet and
  captured its EUR 10–2500 range. That inspection failed its decimal readback
  precondition (`0.01` appeared as `1`), prompting the whole-unit input fix.
- This inspection is not a passing regression run. The revised Auto Top-Up
  scenarios and their iOS behaviour still require focused device verification.

Local verification on 2026-10-16:

- 85 targeted unit/import/configuration checks passed, including loading all
  62 specs on both Android and iOS without device commands.
- `npx tsc --noEmit` and `git diff --check` passed.
- The complete unit suite passed 107 of 116 checks. Its nine pre-existing
  harness failures remain: eight missing Allure dependency mocks in
  `sequentialSmoke.test.cjs`, and one iOS predicate incorrectly evaluated as
  XPath by `smoke72.test.cjs`. This is not a fully green unit-suite result.

Import checks, unit tests, category-selection tests and TypeScript compilation
run locally without device commands. Only the device results noted above have
been confirmed here. Existing workbook statuses have not been changed.

Remaining matrix work includes the change-mobile-number screens, additional KYC
validation and external verification, crypto trading/search/watchlists, profile/settings,
support, wallets/statements and injected API/offline failures. No generic page
navigation or shared login is treated as full coverage of those source cases.
