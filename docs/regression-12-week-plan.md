# Moneybase regression: 12-week delivery plan

Planning snapshot: 2026-11-02. This is a proposal for the next 12 working weeks,
not a promise that every source case is suitable for full UI automation.

## Source and current baseline

Source: `/Users/dmytrokertys/Downloads/regression_automation_matrix_detailed_full.xlsx`,
`Detailed Regression Matrix!A1:Q520`. The source workbook is unchanged.

The matrix was previously prepared as a coverage plan. Its existing statuses
are historical classifications, not current Android/iOS execution evidence.
Its Planned Delivery column extends to Week 14, so it must be reprioritized
for a 12-week delivery window.

| Source classification | Cases |
| --- | ---: |
| Automated | 13 |
| Partially Automated | 231 |
| To DO | 238 |
| Partially Automatable | 23 |
| Manual Only | 14 |
| Total | 519 |

Priorities: 198 P1, 238 P2, 82 P3, and one case with no priority (TC3068).
Within P1, 184 cases are classified as full-automation candidates: 5 Automated,
97 Partially Automated and 82 To DO. Another 8 P1 are Partially Automatable and
6 P1 are Manual Only. These classifications must be checked during the audit.

The repository has 63 spec files. Only 22 of the source matrix's TC IDs are
explicitly referenced in current specs. Another 24 referenced TC IDs belong to
the older numbering and are outside this matrix. This is a traceability gap,
not a statement that only 22 business scenarios have any implementation.
Neither 63 files nor 13 historical Automated labels establishes passing coverage.

The matrix's own `Current Status` and `Existing WDIO Spec / Evidence` columns
are unreliable at row level: e.g. TC3163/TC3164 are both tagged `To DO` with
the same generic Authentication spec list as every other row in that area, but
`authentication.phoneValidation.spec.ts` already implements both (`AUTH-033`,
`AUTH-034`). Treat the Status column as a rough starting point, not ground
truth; confirm per TC ID against an actual `[TC####]` tag in a spec title
before counting it as done or still needed. Re-verified on 2026-11-02 by
matching every `TC\d{4}` tag found in `src/tests/*.spec.ts` against the matrix's
`Source TC` column:

| Feature / Journey | Total TCs | Real-covered | P1 total | P1 covered | P1 remaining |
| --- | ---: | ---: | ---: | ---: | ---: |
| Authentication | 56 | 3 | 34 | 3 | 31 |
| KYC / Onboarding | 47 | 2 | 23 | 1 | 22 |
| Payments / Beneficiaries | 85 | 11 | 27 | 7 | 20 |
| Cards / Business Cards | 92 | 1 | 31 | 1 | 30 |
| Wallets / Statements | 45 | 0 | 20 | 0 | 20 |
| Profile / Settings | 45 | 0 | 17 | 0 | 17 |
| Crypto / Invest | 49 | 0 | 16 | 0 | 16 |
| Dashboard / Home | 35 | 0 | 11 | 0 | 11 |
| WebViews | 23 | 0 | 7 | 0 | 7 |
| Support | 19 | 0 | 5 | 0 | 5 |
| Joint Account | 12 | 0 | 2 | 0 | 2 |
| Launch / Lifecycle | 11 | 5 | 5 | 3 | 2 |
| **Total** | **519** | **22** | **198** | **15** | **183** |

183 real P1 gaps remain, not the matrix's nominal 184 full-automation
candidates minus 13 historical Automated — the two counts coincide almost by
chance; the underlying rows differ once TC-ID tagging replaces the stale
Status column. Recompute this table whenever a batch of TC tags is added,
with:
`grep -rhoE "TC[0-9]{4}" src/tests/*.spec.ts | sort -u`, cross-checked against
the workbook's `Source TC` column.

### Launch / Lifecycle — next up (Week 2 target, smallest remaining gap)

Only 2 P1 cases remain once TC2838–TC2844-range items already covered by
`lifecycle.regression.spec.ts` / `AppLifecyclePage` are excluded:

- **TC2845** — Fresh install with no stored mobile number shows the Welcome
  carousel. Needs a true fresh-install state (clear app data / reinstall via
  Appium, not just background/foreground) before asserting the carousel.
- **TC2846** — Reinstalling the app wipes Keychain/UserDefaults except the
  device-fingerprint entry. The wipe itself is automatable via
  `removeApp`/`installApp`; the "fingerprint persists" assertion has no UI
  surface to read it from — flag as Partially Automatable pending a debug
  screen or backend check, do not fabricate a passing assertion.

### Authentication — Week 3-4 target, full P1 breakdown by implementation cost

29 P1 cases remain. Grouped by how much new Page Object work each needs,
cheapest first:

**Tagging-only (functionally exercised already, just needs the TC tag and an
exact assertion, not new automation):** TC3132 (successful login), TC3133
(incorrect-passcode remaining-attempts message), TC3183 (correct
passcode reveals card PIN). Verify each against `authentication.*.spec.ts` /
`cardManagement.viewPin.spec.ts` before tagging — do not tag without checking
the assertion actually matches the TC wording.

**TC3134 — Done.** Existing coverage in `authentication.passcodeLockout.spec.ts` checks account lockout after three invalid passcodes. The spec also checks that the visible countdown decreases. Device verification is pending.

**TC3140 — Implemented.** `launch.spec.ts` verifies that the current login completes OTP verification and reaches Home. Device verification is pending.

**Cheap — new assertion on an existing page/spec:** TC3137 (valid non-easy
passcode registers), TC3138 (too-easy passcode rejected outright), TC3141
(incorrect OTP shows remaining-tries + refocuses last digit), TC3152 (Sign In CTA from any carousel
page), TC3174 (unregistered number routes to passcode registration), TC3176
(invalid mobile format shakes field, re-enables Continue).

**TC3142 — Spec added, device verification pending.** Run `authentication.otpLockout.spec.ts` on iOS with a dedicated security account that has all three OTP attempts available. Set `AUTH_SECURITY_RUN_OTP_LOCKOUT=true` and configure `AUTH_SECURITY_INVALID_OTP`. Restore the account's OTP attempt budget before reusing it.

**TC3148 — Partial coverage.** The existing login flow submits the full OTP and waits for a post-verification screen before tapping Continue. Confirm the keypad's disabled state on a device during verification. Direct callback coverage belongs in an app-level test.

**Moderate — new flow, reuses existing passcode/OTP components (Change
Passcode, Reset Passcode, generic re-auth gate):** TC3156, TC3158, TC3160,
TC3161, TC3169, TC3185.

**New Page Object needed — Change Mobile Number journey:** TC3165, TC3167,
TC3170, TC3171, TC3172.

**New Page Object needed — Security Questions journey:** TC3178, TC3180,
TC3181, TC3182.

**Reuses `AddBeneficiaryPage` OTP handling, verify before building new:**
TC3144.

**Exclude from this plan — not automatable on BrowserStack real devices via
Appium:** TC3136, TC3150 (Face ID/Touch ID auto-prompt and activation). No
programmatic biometric injection is available on the devices this project
runs against; reclassify as Manual Only in the source matrix rather than
carrying them as To DO.

## Delivery order

Update this plan and the detailed XLSX matrix together after each regression change. Record the case ID, spec, platform, implemented coverage. Keep execution results in the run logs and Allure.

Status as of 2026-11-03:

- **SEPA (iOS):** The spec fails if Home does not show an outgoing transfer for the expected amount. The assertion still needs a transaction ID or reference to distinguish the new transfer from earlier ones of the same amount. Verify which status and identifier the app exposes.
- **Business Pay (Android):** The existing spec switches to the business profile and checks that Pay opens. Device verification is pending. Run it separately with `MB_RUN_BUSINESS_PAY=true`. TC3079 covers the disabled-feature path in a separate Android spec. Run with MB_RUN_BUSINESS_PAY_UNAVAILABLE=true on a business profile with payments unavailable. Device verification is pending.
- **Beneficiaries:** Name validation and IBAN length, checksum and country checks already have specs (TC3304–TC3307). The IBAN length spec covers Malta. UK length remains open.
- **Dashboard / Home:** TC3049 checks profile, formatted balance, the Total Wealth heading and a visible amount inside Recent Transactions when `MB_RUN_POPULATED_HOME=true`. TC3053 checks the balance format. Currency icon coverage is open. TC3054 checks that Wallet Details opens. Active wallet identity, status and business flag remain open. TC3061 opens a configured recent payee and checks the selected name in details. Run it separately with `MB_RECENT_PAYEE_NAME` on the primary account. TC3078 checks navigation to Cards, Pay and Invest and back to Home on Android and iOS.
- **Storyly (TC3075):** Android requires a visible story or a successful opening of the viewer. Android account switching now recognizes the visible Add Funds control on Compose Home after the picker closes. A separate BrowserStack rerun is pending.
- **Next Dashboard case (TC3057):** Verify the loaded Total Wealth amount. The existing TC3049 check covers the heading. Capture the amount locator on Home. The skeleton transition is outside the current scope.
- **Authentication:** Device runs for TC3132, TC3133, TC3134, TC3140, TC3141 and TC3142 are deferred. TC3148 remains partially covered.

2026-11-04: While the Dashboard reruns are deferred, KYC-005, KYC-009 and KYC-013 now have separate specs for optional Address Line 2, email consent and employment field visibility. Each passed once on BrowserStack Android; KYC-009 passed on a targeted rerun after fixing the Continue locator. They use generated QA phone numbers and stop before completing onboarding. See [the coverage notes](regression-matrix-coverage.md) for run evidence and assertion limits. iOS and repeatability runs are pending.

| Weeks | Work | Exit condition |
| --- | --- | --- |
| 1 | Map all 519 IDs to existing specs/Page Objects; review partial assertions, stale references and test data. Run the current suites separately on Android/iOS and classify failures. | A reviewed backlog and platform-specific baseline. Current Auto Top-Up fixes are either device-verified or explicitly pending. |
| 2 | Stabilize login/OTP, account assignment, data setup/cleanup and reports. Review Launch/Lifecycle P1. Finish the cheapest applicable P1 gaps in existing specs. | A repeatable smoke baseline and a measured delivery rate for setting the remaining numeric commitment. |
| 3–4 | Authentication and KYC P1 first; extend existing Page Objects for validation, PIN and OTP flows. Use dedicated accounts for lockout, reset and phone-number changes. | Selected source cases have exact assertions, independent execution and results on applicable platforms. External verification has an explicit test seam or recorded manual scope. |
| 5–6 | Payments/Beneficiaries and Dashboard P1; finish Auto Top-Up, amount/IBAN/name validations and current transfer assertions before building new flows. | Payment outcomes are asserted and test artifacts/data are repeatable. Easy P2 variants are added after their P1 journey is stable. |
| 7–8 | Cards/Business Cards and Joint Account P1. Review role restrictions, limits, freeze/unfreeze and card lifecycle. | Each destructive test has dedicated renewable data and cleanup. A helper visiting a screen is not counted as the complete case. |
| 9 | Wallets/Statements and Profile/Settings P1. | Persisted state, exported content or expected backend/UI outcome is verified according to the individual case. |
| 10 | Crypto/Invest, Support and WebViews P1 with usable fixtures and test hooks. Complete high-value P2 cases in already stable pages. | Trading and external-service cases are implemented only with controlled data and observable outcomes. Blockers remain visible. |
| 11–12 | Full Android/iOS regression, product/automation defect triage, repeat runs, flaky-test fixes and final matrix reconciliation. | Platform-specific verified coverage and an explicit list of partial/manual/product-blocked cases. |

The primary planning target is the 184 P1 full-automation candidates. It is a
target, not a confirmed capacity estimate. Reforecast after Weeks 1–2 from
actual accepted cases per week, execution time and fixture availability.
Next take P2 cases that extend existing pages and share proven prerequisites.
Reserve roughly 25% of delivery capacity for execution, review and repairs.
Do not spend the final weeks adding unverified specs merely to increase counts.

## Implementation conventions

- Keep the existing architecture: `src/tests/<feature>.<scenario>.spec.ts` and
  methods/selectors in `src/pages/<Feature>Page.ts`.
- Put the source TC ID in the named test, with a precise assertion for that TC.
  Related checks can share a Page Object. Do not duplicate page navigation for
  every spreadsheet row or count many checkpoints as many completed source IDs.
- Each spec is runnable with the existing `npm run wdio -- --spec ...` command.
  Keep the existing `regression`, `regressionPrimary` and `regressionSecondary`
  suites. No new execution framework is needed.
- Implement one small scenario family, run it on the applicable platforms,
  fix it and update its evidence before starting the next family.
- Use APIs for controlled fixture setup/cleanup where appropriate; retain the
  source case's required UI assertions. Never derive an expected value from the
  same success/failure state that the test is supposed to verify.
- Keep platform-specific skip reasons and implementation gaps explicit.

## Evidence required to close a source case

1. Correct source TC ID, preconditions and expected-result assertions are mapped.
2. A fresh standalone spec run reaches those assertions without relying on a
   previous spec, a stale session or manually prepared untracked state.
3. It passes twice on each applicable platform using the selected app build,
   with run/build IDs and Allure results retained.
4. Test data is reproducible and owned changes are cleaned up. Destructive
   scenarios do not consume the shared smoke account's only reusable fixture.
5. A negative case passes because the expected rejection is asserted. A skipped
   case, swallowed exception, import failure or setup failure is not a pass.

Track code implementation, Android result and iOS result separately. An
implemented test that reproduces a product defect is useful coverage, but its
execution remains failed/product-blocked until the product is fixed. A partial
assertion remains partial even if that assertion passes on both platforms.

At each weekly review record unique source IDs added/verified, platform results,
new product defects, missing fixtures and the next small batch. Do not use spec
file count or commit count as the delivery metric.
