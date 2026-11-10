# Account-to-spec allocation

Date 2026-11-06

## Active Android smoke allocation

Smoke runs on 2 BrowserStack parallels. Each lane owns 3 logins and rotates them, so a login never runs in both lanes and two other logins' specs separate its consecutive sessions. Credentials stay in local environment settings or CI secrets.

| # | Lane 1 | Lane 2 |
| ---: | --- | --- |
| 1 | VEG `cardFreezeUnfreeze.joint` | KER `addfunds` |
| 2 | ROG `physicalcardcreation` | LAZ `homeSearch` |
| 3 | MUM `bankTransfer.swift.individual` | POP `cashFunds` |
| 4 | VEG `portfolio` | KER `addbeneficiary.individual` |
| 5 | ROG `homeScreen` | LAZ `homeSearch.business` |
| 6 | MUM `orders` | POP `priceAlerts` |
| 7 | VEG `autoTopUp` | KER `homeAccountSwitch` |
| 8 | ROG `launch` | LAZ `bankTransfer.p2p.individual` |
| 9 | MUM `fxExchange` | POP `watchlist` |
| 10 | VEG `bankTransfer.sepa.individual` | `onboarding` (generated number) |

Profiles: VEG40002 (primary slot), KER40014 (secondary slot), ROG40015, LAZ40012, MUM40001, POP40015.

Known Android behaviours handled by the specs:

- `physicalcardcreation`: the card is created, but the app returns to Confirm PIN after the OTP. This is an open Android bug. The spec logs `[KNOWN BUG]`, relaunches, logs in again and continues from the created card.
- MUM40001 is the only Elite login. Its tier greeting is closed automatically on Android.
- `priceAlerts` creates its alert from the Invest header search path and does not delete it, so alerts accumulate on POP40015.
- `orders` matches iOS and stops after the Preview confirmation. It no longer asserts Sell availability.

## Active regression allocation (2026-11-10)

Source of truth: `src/data/regressionAccounts.json`. `scripts/regressionLanes.cjs`
orders each lane, and both `wdio.conf.ts` (suites `regressionLane1`/`regressionLane2`)
and `.github/workflows/wdio-regression.yml` use it. CI no longer sets
`MB_AUTH_SLOT`: each spec takes its account in `beforeSession`.

| Lane | Group | Account | Specs | Why here |
|---|---|---|---|---|
| 1 | primary | VEG | 26 | Joint, business card admin, Auto Top-Up card, SEPA/VoP beneficiaries, individual card PIN, USD wallet |
| 1 | rog | ROG | 10 | Beneficiary form validation, wallet details, Home, lifecycle, logout |
| 1 | mum | MUM | 9 | SWIFT (`Swift Beneficiary`), FX, orders |
| 1 | onboarding | none (fresh applicant) | 14 | Does not log in |
| 2 | secondary | KER | 13 | Add funds, beneficiary with real OTP, account switch, salary, business statements, price plan |
| 2 | laz | LAZ | 8 | Home search, P2P, recent payees, beneficiary validation, account picker, appearance |
| 2 | pop | POP | 9 | Invest discover, support, Storyly, EUR wallet, individual statements |
| 2 | businessHolder | `BH_*` (KER phone, business SED00004) / `BC_ADMIN_SELF_ASSIGN_PHONE` | 10 | Business card admin; shares KER's phone, so the lane spaces it from KER specs |
| 2 | authSecurity | `AUTH_SECURITY_*` | 8 | Own account; `incorrectOtp`, `incorrectPasscode`, `otpLockout`, `passcodeLockout` run after the rest |
| 2 | personalDetails | `PD_*` | 2 | Own account |
| 2 | signedOut | none / `AUTH_RECOVERY_MB_PHONE` | 4 | Signed-out flows |

Rules:

- Smoke specs keep their smoke owner in regression.
- Within a lane, each group is spread evenly and one pool account never logs
  in twice in a row. A partial run (one selected category) keeps the order, but
  a lane left with one account can still run it back to back.
- CI splits each lane into blocks of 15 specs that run one after another on
  one BrowserStack parallel.
- Specs moved to ROG, LAZ, MUM and POP were chosen as account-agnostic, but
  their fixtures on those accounts are not yet verified by a full run.

## Earlier full-suite proposal

The rest of this document is the earlier five-account proposal. Its smoke lists are superseded by the table above; KAT and MAI are not part of the active pool.

## Summary

| Owner | Full suite specs | Smoke specs | Activation |
| --- | ---: | ---: | --- |
| VEG / VEG40002-1 | 23 | 4 | Existing fixture owner. Keep these bindings. |
| KER / KER40014-1 | 15 | 4 | Existing fixture owner. Keep these bindings. |
| KAT / KAT40008-1 | 12 | 3 | Proposed target. Device verification and profile fixture configuration are required before moving the jobs. |
| MAI / MAI40018-1 | 27 | 4 | Proposed payments target. Seed and verify the listed fixtures before moving money-flow jobs. |
| LAZ / LAZ40012-1 | 6 | 4 | Proposed Invest target. Verify Invest eligibility and seed the trading fixtures before moving the jobs. |
| GENERATED / Fresh applicant or fresh install | 16 | 1 | Does not consume any of the five established logins. |
| SECURITY / AUTH_SECURITY_MB_PHONE | 9 | 0 | Dedicated existing fixture, outside the five ordinary accounts. |
| RECOVERY / AUTH_RECOVERY_MB_PHONE | 1 | 0 | Separate recovery fixture. This variable is currently not configured locally. |
| PERSONAL_DETAILS / PD_MB_PHONE | 2 | 0 | Dedicated existing personal-details fixture. |
| ADMIN_SELF / BC_ADMIN_SELF_ASSIGN_PHONE | 2 | 0 | Dedicated existing admin-role fixture. |
| NO_RIGHTS / BC_NO_RIGHTS_PHONE | 1 | 0 | Dedicated existing restricted-role fixture. |

Validated totals 114 distinct spec files and 20 smoke files.

## Smoke allocation

The previous 19 smoke files are retained. The Business assertion from homeSearch.spec.ts is split into homeSearch.business.spec.ts, giving 20 independently assigned files without removing the original Business search coverage.

### VEG / VEG40002-1

- `autoTopUp.spec.ts`
- `homeSearch.business.spec.ts`
- `portfolio.spec.ts`
- `cardFreezeUnfreeze.joint.spec.ts`

### KER / KER40014-1

- `addfunds.spec.ts`
- `physicalcardcreation.spec.ts`
- `homeAccountSwitch.spec.ts`
- `fxExchange.spec.ts`

### KAT / KAT40008-1

- `launch.spec.ts`
- `homeScreen.spec.ts`
- `homeSearch.spec.ts`

### MAI / MAI40018-1

- `addbeneficiary.individual.spec.ts`
- `bankTransfer.p2p.individual.spec.ts`
- `bankTransfer.sepa.individual.spec.ts`
- `bankTransfer.swift.individual.spec.ts`

### LAZ / LAZ40012-1

- `cashFunds.spec.ts`
- `orders.spec.ts`
- `priceAlerts.spec.ts`
- `watchlist.spec.ts`

### GENERATED / Fresh applicant or fresh install

- `onboarding.spec.ts`

## Complete allocation and fixture requirements

### VEG / VEG40002-1

Existing fixture owner. Keep these bindings.

Required fixtures

- Joint VEG40003-1 and the configured Business profile.
- Saved top-up card ending 0015 and the configured PIN-view card.
- Business search context for homeSearch.business.spec.ts. Retail search reads its payee from Home dynamically and belongs to KAT.
- The 3.5% Simonds Farsons Cisk 2027 holding used by portfolio.spec.ts.
- The Las Vegas business-card assignee and populated transaction/analytics fixtures.

Assigned files under src/tests

- `addFunds.businessMethods.spec.ts`
- `assignBusinessCard.spec.ts`
- `autoTopUp.amountAboveRange.spec.ts`
- `autoTopUp.amountBelowRange.spec.ts`
- `autoTopUp.currencyReset.spec.ts`
- `autoTopUp.editUnchanged.spec.ts`
- `autoTopUp.spec.ts`
- `autoTopUp.validation.spec.ts`
- `bankTransfer.business.spec.ts`
- `bankTransfer.businessUnavailable.spec.ts`
- `businessCard.cancelCardType.spec.ts`
- `businessCard.changeTypeClearsAssignee.spec.ts`
- `cardFreezeUnfreeze.joint.spec.ts`
- `cardManagement.joint.spec.ts`
- `cardManagement.pinTimeout.spec.ts`
- `cardManagement.viewPin.spec.ts`
- `home.cardsTabReselect.spec.ts`
- `home.recentPayees.spec.ts`
- `homeSearch.business.spec.ts`
- `homeSpendAnalytics.spec.ts`
- `portfolio.spec.ts`
- `transactions.spec.ts`
- `walletDetails.statementBusiness.spec.ts`

### KER / KER40014-1

Existing fixture owner. Keep these bindings.

Required fixtures

- Saved funding card ending 0015 and card top-up eligibility.
- Physical-card creation eligibility, delivery address and OTP access.
- The profiles used by homeAccountSwitch and accountPicker.search, including the configured Business profile.
- The currency and balance states asserted by FX tests. In particular fxExchange.regression expects a zero-balance GBP wallet.
- Business fixture BH_MB_PHONE currently resolves to the same local login as secondary. The CI alias must also be checked before assigning parallel workers.

Assigned files under src/tests

- `accountPicker.search.spec.ts`
- `addfunds.spec.ts`
- `addfunds.validation.spec.ts`
- `businessCard.activeFilterDefault.spec.ts`
- `businessCard.freezeUnfreeze.otherPerson.spec.ts`
- `businessCard.relink.spec.ts`
- `businessCard.terminate.spec.ts`
- `businessCard.walletReachOut.spec.ts`
- `businessWallet.cancelCreation.spec.ts`
- `businessWallet.requiredName.spec.ts`
- `fxExchange.regression.spec.ts`
- `fxExchange.spec.ts`
- `homeAccountSwitch.spec.ts`
- `physicalcardcreation.spec.ts`
- `profile.businessSettings.spec.ts`

### KAT / KAT40008-1

Proposed target. Device verification and profile fixture configuration are required before moving the jobs.

Required fixtures

- Working QA login, registered individual profile and an available wallet. homeSearch.spec.ts prefers a displayed Recent Payees name on Home and otherwise reads the recipient of an outgoing person transfer from Recent Activity. It excludes incoming transfers and merchant-logo rows on Android. An account with neither source fails an explicit precondition. The Recent search-history assertion also needs the application to retain completed search history.
- Support, profile settings, price-plan and Home features available to this profile.
- Home checks that require populated history must receive an explicit populated-home fixture or remain gated.

Assigned files under src/tests

- `authentication.phoneValidation.spec.ts`
- `homeScreen.spec.ts`
- `homeSearch.spec.ts`
- `homeStoryly.spec.ts`
- `launch.spec.ts`
- `lifecycle.regression.spec.ts`
- `pricePlan.spec.ts`
- `profile.appearance.spec.ts`
- `profile.logout.spec.ts`
- `support.close.spec.ts`
- `support.loggedInOptions.spec.ts`
- `support.openChat.spec.ts`

### MAI / MAI40018-1

Proposed payments target. Seed and verify the listed fixtures before moving money-flow jobs.

Required fixtures

- Working QA login and transfer-enabled individual profile.
- EUR balance sufficient for the test payments and all required currency wallets, including USD and GBP for wallet-manager coverage.
- P2P target currently identified as SEPA in BankTransferP2PIndividualPage.
- The HSBC Bank Malta SEPA recipient configured in BankTransferSepaIndividualPage, with its expected IBAN.
- The SWIFT recipient currently identified as usjsk whwjwk, plus the cross-border and VoP fixtures.
- OTP access and transfer permissions. Keep the existing account owner until these prerequisites are verified.
- Global ADD_BENEFICIARY_MB_PHONE and OTP overrides must resolve to MAI or be replaced with profile-specific settings.

Assigned files under src/tests

- `addFundsBankTransferWalletManager.spec.ts`
- `addbeneficiary.individual.spec.ts`
- `addbeneficiary.individual.usBicSwiftInvalid.spec.ts`
- `addbeneficiary.individual.usd.steps.spec.ts`
- `bankTransfer.p2p.individual.spec.ts`
- `bankTransfer.sepa.individual.spec.ts`
- `bankTransfer.sepaAmountLength.spec.ts`
- `bankTransfer.sepaNoFee.spec.ts`
- `bankTransfer.sepaReferenceLimit.spec.ts`
- `bankTransfer.sepaReviewClose.spec.ts`
- `bankTransfer.swift.individual.spec.ts`
- `bankTransfer.swiftFeeCancel.spec.ts`
- `bankTransfer.swiftFeeDisclaimer.spec.ts`
- `bankTransfer.swiftWalletCancel.spec.ts`
- `beneficiary.ibanChecksum.spec.ts`
- `beneficiary.ibanCountry.spec.ts`
- `beneficiary.ibanLength.spec.ts`
- `beneficiary.nameValidation.spec.ts`
- `crossBorder.swift.retail.spec.ts`
- `salary.partialValidation.spec.ts`
- `salaryStipendPension.spec.ts`
- `vop.beneficiary.spec.ts`
- `vop.sepa.spec.ts`
- `walletDetails.statementIndividual.spec.ts`
- `walletManager.ibanBankNameEUR.spec.ts`
- `walletManager.ibanBankNameUSD.spec.ts`
- `walletManager.openDetails.spec.ts`

### LAZ / LAZ40012-1

Proposed Invest target. Verify Invest eligibility and seed the trading fixtures before moving the jobs.

Required fixtures

- Invest enabled with cash available for the existing order scenarios.
- BMW search/trading available, with the quantities and order states expected by orders.spec.ts and orders.regression.spec.ts.
- The Cash Funds, watchlist and price-alert fixtures used by their Page Objects.
- home.totalWealthNavigation requires navigation to Invest and wallet destinations.
- portfolio.spec.ts stays on VEG because it asserts a specific existing bond holding.

Assigned files under src/tests

- `cashFunds.spec.ts`
- `home.totalWealthNavigation.spec.ts`
- `orders.regression.spec.ts`
- `orders.spec.ts`
- `priceAlerts.spec.ts`
- `watchlist.spec.ts`

### GENERATED / Fresh applicant or fresh install

Does not consume any of the five established logins.

Required fixtures

- Onboarding creates a new applicant with its own phone number.
- Fresh-install entry and welcome checks start without a stored login.

Assigned files under src/tests

- `authentication.welcomeSignIn.spec.ts`
- `lifecycle.freshInstallWelcome.spec.ts`
- `onboarding.addressOptional.spec.ts`
- `onboarding.addressRequired.spec.ts`
- `onboarding.emailTerms.spec.ts`
- `onboarding.employmentFields.spec.ts`
- `onboarding.invalidNames.spec.ts`
- `onboarding.keyboardRaise.spec.ts`
- `onboarding.keyboardRestore.spec.ts`
- `onboarding.nameRequired.spec.ts`
- `onboarding.otpResend.spec.ts`
- `onboarding.otpRetry.spec.ts`
- `onboarding.passcodePolicy.spec.ts`
- `onboarding.previousEmployment.spec.ts`
- `onboarding.shortName.spec.ts`
- `onboarding.spec.ts`

### SECURITY / AUTH_SECURITY_MB_PHONE

Dedicated existing fixture, outside the five ordinary accounts.

Required fixtures

- Intentional wrong-PIN, wrong-OTP and lockout scenarios retain their isolated security account.
- A test that intentionally locks the account must be followed by a verified recovery/reset before another scenario needs a successful login.

Assigned files under src/tests

- `authentication.changePasscodeCancel.spec.ts`
- `authentication.incorrectOtp.spec.ts`
- `authentication.incorrectPasscode.spec.ts`
- `authentication.otpCountdown.spec.ts`
- `authentication.otpLockout.spec.ts`
- `authentication.partialPasscode.spec.ts`
- `authentication.passcodeLockout.spec.ts`
- `authentication.securityAccount.spec.ts`

### RECOVERY / AUTH_RECOVERY_MB_PHONE

Separate recovery fixture. This variable is currently not configured locally.

Required fixtures

- A dedicated registered account with a configured security question, separate from the ordinary pool and security account.

Assigned files under src/tests

- `authentication.recoveryQuestions.spec.ts`

### PERSONAL_DETAILS / PD_MB_PHONE

Dedicated existing personal-details fixture.

Required fixtures

- Preserve the expected personal details and the configured PIN.

Assigned files under src/tests

- `personalDetails.nameEditConfirmation.spec.ts`
- `personalDetails.spec.ts`

### ADMIN_SELF / BC_ADMIN_SELF_ASSIGN_PHONE

Dedicated existing admin-role fixture.

Required fixtures

- SeDeKE Business access and the admin/self-assignment restriction used by these tests.

Assigned files under src/tests

- `businessCard.adminSelfAssign.spec.ts`
- `businessCard.cardLimits.spec.ts`

### NO_RIGHTS / BC_NO_RIGHTS_PHONE

Dedicated existing restricted-role fixture.

Required fixtures

- The user must retain the no-rights Business role. A normal pool account cannot substitute for this role.

Assigned files under src/tests

- `businessCard.noRights.spec.ts`

## Activation and run rules

- Configure phone, PIN, individual profile code and per-account fixtures for each target. Do not change only the phone while retaining another account's profile code, card or OTP target.
- Replace embedded account-specific values in Page Objects with the assigned account fixture. Keep the asserted instrument, recipient, role and transaction semantics.
- The MAI and LAZ moves require fixture preparation and device verification. Their account codes alone do not prove payment permissions, trading eligibility, balances or holdings.
- homeAccountSwitch currently has a secondary-slot gate and hardcoded profile assumptions. Retain KER ownership and parameterize those profile values before renaming slots.
- Physical-card creation currently passes a literal creation PIN. Treat it as a card fixture value, independent from the login PIN.
- Resolve dedicated credential aliases to a physical login before scheduling. BH currently aliases KER locally, so BH and ordinary KER specs share one execution queue. Validate the corresponding CI secrets as well.
- One active session per physical login across platforms. Local and CI launches need coordinated account reservations if they run concurrently.
- Respect the available BrowserStack parallel-session limit. Five accounts do not imply five available cloud device slots.
- On an authentication lockout, stop further jobs for that login and report them as blocked. Preserve the first failed attempt. Resume only after verified account recovery.
- Avoid automatic spec-file retries after authentication rejection. Retrying a failed assertion on a healthy account should preserve its owner and fixture.
- Run independent spec files with explicit owner metadata in reports. Onboarding and fresh-install entry checks stay in their own queue.
