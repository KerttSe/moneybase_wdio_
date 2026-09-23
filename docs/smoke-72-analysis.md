# Smoke #72: failure analysis and verification

## Baseline

- [Original run](https://app-automate.browserstack.com/projects/moneybase_wdio/builds/smoke/72): `smoke-35866641256-1`, build hash `2a52c16cc4a1d74ae727d9bb0a4cdd7e04a0b19e`.
- Platform: iOS, iPhone 16. This is not an Android run.
- App: `bs://d3142df66fcd0172ca376867382c6fc296c32475`, version 2.22.2.
- Evidence: BrowserStack session metadata, full native XML from raw command logs, screenshots and action sequences. Raw artifacts remain outside the repository because they contain account data.
- 11 distinct specs had a failed attempt. Watchlist also had a subsequent session marked `done`; that BrowserStack status alone is not a test assertion.
- Device Security handling is unchanged. Only a confirmed Device Security error is skipped; navigation, validation and OTP failures remain failures.

## Findings

| Spec | Evidence from the failed state | Change |
| --- | --- | --- |
| Home Search | Home exposes `XCUIElementTypeSearchField` named `Search`, not `home_input_search`. More has its own Search field. | Scope the native search field to the Home navigation bar. |
| Home Account Switch | The screen remains on More while the test waits for a Home account label. | Reuse one transition that closes More and verifies the selected account code on Home. |
| Cash Funds | Index-based Discover fallback opens Portfolio; another fallback targets hidden web bottom navigation below the viewport. | Select the visible Discover dashboard entry by its text and verify the destination. |
| Auto Top-Up | Save was clicked but the form remained open. The next step incorrectly required Home. | Click the accessible Save text, require the form to close, and handle Add Funds/the saved rule list explicitly. |
| Watchlist | The failed attempt taps the star repeatedly when a short-lived toast is missed. The retry uses one tap. | Tap once, observe the acknowledgement once, and remove the coordinate re-tap and false-success fallback. |
| P2P, SEPA, SWIFT | The test searches for the payment slider while still on the entry form. Review is disabled; XML shows a zero balance, and P2P also lacks a selected currency. | Share a required Review transition; report the disabled control and displayed balance instead of proceeding to the slider. This does not replenish wallets or prove why validation is blocked. |
| Add Beneficiary | The OTP destination shown on the screen differs from the phone in the failing API request. | Validate the challenge destination before fetching OTP; respect the flow login override; stop on rejection without re-entering the same code. |
| Physical Card | Verification says the entered code is incorrect, but the test continues to wait for Freeze. | Remove implicit dummy-code fallback on iOS; resolve OTP for the active account and verify completion or rejection before card actions. |
| FX Exchange | The baseline lands on Investments instead of the exchange form. | Scope the Home entry, avoid repeated iOS taps, and require both exchange wallet fields. The rerun establishes a remaining downstream navigation problem, detailed below. |

The failure classifier also matched arbitrary numbers in stack traces as HTTP statuses, for example source line numbers in the 500s. It now reads explicit HTTP/status markers from the message only. Configuration/precondition errors are not attributed to invented backend status codes.

## FX Rerun Evidence

[Failed FX session](https://app-automate.browserstack.com/builds/8eae5b1e6fbd55635462483956be27b536e75c7d/sessions/e5efef0ff06c11504ab7c084dfa2f004c9f47496).

- At 17:27:54 UTC, the selected element is an `XCUIElementTypeImage` named `ic_exchange` under `home_screen_view`. Its rectangle is x=183, y=246, width=27, height=27. The test taps its center at (197, 260).
- Video shows Home with the Exchange quick action before the transition, then Investments.
- Application telemetry in the HAR contains `[INVEST] Navigating to: /exchange/new` and a navigation-JavaScript evaluation message.
- The resulting document route is `https://stglive.moneybase.com/investments`; the native XML and screenshot show Investments, and the network requests load portfolio/active-order content.

This disproves the claim that merely narrowing the Home locator fixes this failure. The intended Exchange command reaches the app, but the expected form is not displayed. The exact native/WebView routing defect is not established by this test repository. Do not hide it with direct URL navigation, extra taps, a skip, or a success assertion on Investments.

## Verification

- `npx tsc --noEmit`: passed.
- `node --test tests/unit/*.test.cjs`: 27 passed, including selector fixtures, payment gating, account transitions, OTP rejection/configuration and Watchlist single-tap behavior.
- `git diff --check`: passed.
- Home Search, Home Exchange and Discover selectors were also evaluated against the original full XML, each returning one intended element.
- [Repeat smoke](https://app-automate.browserstack.com/builds/8eae5b1e6fbd55635462483956be27b536e75c7d): 19 specs, Primary/Secondary, one worker per account, same app ID, no spec-file retries. Started 2026-09-23 at 17:09 UTC. Still running at the time of this entry.
- Confirmed completed in the repeat: Launch, Auto Top-Up, Add Beneficiary, Add Funds, Cash Funds, P2P, SEPA and SWIFT passed. This is not yet an all-green result.

The first repeat exposed a test regression in the strengthened Account Switch assertion: it expected the primary business code on the secondary account. Business targets are now configured per account (`MB_BUSINESS_CODE` / `MB_ALT_BUSINESS_CODE`), matching the existing individual-account configuration. That follow-up change and the refined FX readiness/error checks were made after those two specs finished and need separate device verification.
