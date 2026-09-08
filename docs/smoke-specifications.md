# Smoke Specifications

Reviewed 2026-09-05 against the 19 `smokeSpecs` entries in `wdio.conf.ts` and
`Automation Coverage 4.xlsx`, sheet `Smoke Test Automated AOS&iOS`.
This describes source-code coverage, not a passing device execution.
Only physical cards are in scope. Virtual-card wording in the workbook's
Physical Card Setup section is stale and is not a requirement for this suite.

## Finding the Failed Operation

1. Open the failed named `it` case in BrowserStack Test Observability or Allure.
2. Read its ID/title and original error to identify the action or verification.
3. Inspect the existing screenshot, page source and device information. Capture
   is best-effort; missing attachments do not establish a correct UI state.
4. Use the original stack for the exact selector/assertion. Login failure in a
   setup hook means the business scenario was not reached.

The suite has 108 named `it` cases across 19 specs. Platform-specific cases skip
on the other platform. IDs label implemented checkpoints, not one-to-one
coverage of every workbook row. A passed case means its existing implementation
returned: conditional checks can return without an assertion. Existing
BrowserStack error categories are heuristics, not confirmed root causes.

Each journey shares one session. Login runs once in `before`. Cases run in
source order and dependent cases skip after a failure. Run the whole spec,
not an isolated middle case with `grep`. A spec-file retry restarts the journey.
The former report-only `smokeStep` wrappers have been removed.

## Preconditions

- The selected Android/iOS build and Appium session are available.
- Login requires the configured test account and selected OTP mechanism. An
  existing Home session can bypass credential entry and OTP.
- Transfers, top-ups and FX require eligible funded wallets and expected test
  beneficiaries/cards. Investment flows require instrument access and data.
- Primary/secondary suites separate account usage. Account-switch smoke requires
  `MB_AUTH_SLOT=secondary`; otherwise its setup skips.
- The suite submits payments, creates accounts/orders and operates physical
  cards. It is intended for the configured test environment.

## Scenario Contracts

### Login: LF, Workbook Rows 25-33

`src/tests/launch.spec.ts`: authenticate or resume the configured session, handle
required credentials/OTP/prompts and reach Home. Login is a business step; its
original stack identifies internal failures. A pass does not prove every login
screen appeared when the session was reused.

### Home: HS, Rows 35-45

`src/tests/homeScreen.spec.ts`: log in, select Individual and wait for Home.
Separate steps check holder name, balance, actions, banners, transactions,
Recent Activities, Spend Analytics and navigation. Account type, Exchange and
Details are best-effort. Notification/promo banners and pending/recent
transactions may be absent without failing. Action navigation is Android-only.
Balance is a visibility check, not backend reconciliation. Bottom navigation
accepts one candidate, not the complete icon set. Recent Activities is not an
assertion of recent payees; transaction field values are not compared.

### Beneficiary: ABS, Rows 138-143

`src/tests/addbeneficiary.individual.spec.ts`: requires beneficiary-capable
credentials and configured/generated test IBAN. Open Pay/Add Beneficiary, choose
Another person and country/currency, fill generated names and bank details,
submit/review and complete OTP handling. Named cases distinguish form entry,
submission and OTP. Generated names vary; retain the run evidence to reproduce.

### Card Top-Up: AFC, Rows 128-136

`src/tests/addfunds.spec.ts`: requires an eligible saved funding card. Open Add
Funds, open top-up, enter 11 and complete payment verification. Android waits for
deposit success/error and throws on error. iOS returns Home and checks the
deposit-approved anchor. No exact credited balance comparison is performed.
Auto Top-Up activation/rule wording in these workbook rows is copied text.

### Auto Top-Up: ATU, Rows 47-55

`src/tests/autoTopUp.spec.ts`: use saved card `0015`, Euro, preset 500 and custom
amount 1500. Open the rule list, add/select/configure/save, find the rule, delete
it and verify absence. Platform input order differs. Workbook card 0036 and
example amounts are not the active spec data. Named cases locate selection,
save, lookup and deletion failures.

### P2P and SEPA: Rows 57-73 and 110-126

`src/tests/bankTransfer.p2p.individual.spec.ts` and
`src/tests/bankTransfer.sepa.individual.spec.ts`: use Individual and a funded
wallet, select the expected beneficiary, enter 11, review if applicable, slide
to submit and inspect the returned Home result. P2P targets Carlos Cat; iOS also
checks its destination text. Both flows check negative amounts. A Home amount
alone does not uniquely identify a newly submitted transaction. Workbook
Business-wallet wording and the complete date/BIC/IBAN/bank/fees/backend-status
contract are not established by these specs.

### SWIFT: No Dedicated Workbook Section

`src/tests/bankTransfer.swift.individual.spec.ts`: submit amount 11 to the
configured SWIFT beneficiary. Android runs the SWIFT success helper; iOS exits
details and checks the negative amount on Home. Named cases distinguish review,
slider submission and result failures. This is not full metadata reconciliation.

### Physical Card: PC, Rows 75-91

`src/tests/physicalcardcreation.spec.ts`: requires a card-eligible Individual
account, delivery details and test PIN/OTP. Select a physical card, confirm
design/type and delivery, enter/confirm PIN, complete OTP and finish the flow.
Android first cleans up an existing card and ends with report/block. iOS handles
Apple Pay, exercises Freeze and blocks the card. Its wait for Unfreeze is
best-effort. Blocking does not assert deletion. Virtual-card creation, colours
and virtual-card list expectations do not apply.

### Joint Card Freeze: FC, Rows 93-103

`src/tests/cardFreezeUnfreeze.joint.spec.ts`: log in, select Joint, open Cards,
normalize frozen state if needed and exercise Freeze/Unfreeze. Each action waits
for its opposite action. Android finishes with Freeze available. iOS can finish
frozen when it started active. The method does not independently assert physical
card type, recent transactions or overlay styling. The workbook final-active
expectation is therefore not guaranteed on iOS.

### Account Switching: SA, Rows 105-108

`src/tests/homeAccountSwitch.spec.ts`: secondary slot only. Android switches
Business then Individual, but can return without switching if the picker or
Business entry is unavailable. iOS checks Business, Individual, Joint, Business.
Android Joint coverage and a final Individual account on iOS are not asserted.

### Home Search: No Dedicated Workbook Section

`src/tests/homeSearch.spec.ts`: log in, select Individual, wait for Home and
search `cat`, targeting Carlos Cat. That recipient must exist in test data.

### Onboarding: O, Rows 3-23

`src/tests/onboarding.spec.ts`: generate a Maltese number, enter PIN/confirmation,
complete OTP, personal details, employment/address and email/terms, then save
the generated account. Full Onfido document/liveness and final Home/Pending
Verification are outside this flow. Workbook rows 14-23 are not executed here.

### Orders: PO, Rows 146-151

`src/tests/orders.spec.ts`: use Individual and BMW. iOS creates quantity 5,
asserts ACTIVE, modifies to 15, asserts ACTIVE/15, cancels and asserts
CANCELLED/15. Android buys quantity 5 and checks Sell availability. Android
smoke does not call modify/cancel even though a separate page method exists.
Do not assume Android cleans up the order/resulting account state.

### Cash Funds: DS, Rows 153-154

`src/tests/cashFunds.spec.ts`: open Individual, Invest, Discover, Cash Funds.
Checks accept a fund anchor or Cash Funds header. They do not independently
validate instrument name, APY, currency and price values.

### Watchlist: WL, Rows 156-158

`src/tests/watchlist.spec.ts`: add an existing instrument through the platform
flow and check the Watchlist updated toast. Reordering and deletion are not
called by smoke. Workbook edit/delete rows are not verified by this scenario.

### Price Alerts: CPA, Rows 160-164

`src/tests/priceAlerts.spec.ts`: Android creates a BMW alert, checks its Overview
row, exercises deletion and checks return to a Price Alerts anchor. Row absence
after deletion is not asserted. iOS checks the +1% creation confirmation only.
Neither branch modifies alerts; iOS does not check Overview or delete.

### Portfolio: No Dedicated Workbook Section

`src/tests/portfolio.spec.ts`: open Portfolio from Invest, then in a second test
open the Simonds Farsons Cisk 2027 bond using platform navigation. Login runs
once; account for prior test state when diagnosing the second test. These are
UI navigation flows, not valuation assertions.

## Defect Handoff

Include build, platform/device, spec/test title, account slot (no credentials),
failed substep, expected result, actual error, screenshot/page source and run
link. State whether setup completed and whether the operation had already been
submitted. Separate observed evidence from a suspected root cause.

## Maintaining Steps

Use a separate `it('ID Action or expected result', async function () { ... })`
for each checkpoint, keeping page-object operations in the same order. Keep
login in `before` and register `stopAfterFailedStep()` once per journey. Never
put PINs, OTPs or passwords in titles. Names do not add assertions or coverage.
