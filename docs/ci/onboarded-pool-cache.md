# Onboarded account pool across CI runs

Lockout specs (`authentication.incorrectPasscode`, `authentication.passcodeLockout`, and on iOS `incorrectOtp` and `otpLockout`) lock the account they use. To avoid locking a shared login, they take a fresh account that a previous onboarding created.

## How the pool works

- `onboarding.spec.ts` appends every account it finishes to `.generated/onboarded-pool.json` (`saveOnboardedAccount` in `src/helpers/phone.helper.ts`).
- `lockoutAuth()` in `src/data/lockoutAuth.ts` takes an unused account and marks it `usedAt` / `usedBy`. Specs that lock the account consume it; specs that do not lock it reuse it without marking.
- If the pool is empty, the specs fall back to `AUTH_SECURITY_*`. They also fall back when `AUTH_LOCKOUT_USE_POOL=false`.
- The file path can be changed with `ONBOARDED_POOL_FILE`.

A CI runner starts empty, so without a cache every run sees an empty pool and falls back to `AUTH_SECURITY_*`.

## What the workflows do

`smoke.yml` (both smoke jobs) and `wdio-regression.yml` (both lane jobs) wrap `Run tests` with three steps.

```yaml
      - name: Restore onboarded account pool
        uses: actions/cache/restore@v4
        with:
          path: .generated/onboarded-pool.json
          key: onboarded-pool-${{ matrix.platform }}-${{ github.run_id }}
          restore-keys: |
            onboarded-pool-${{ matrix.platform }}-

      - name: Remember onboarded pool state
        id: pool-before
        shell: bash
        run: echo "hash=${{ hashFiles('.generated/onboarded-pool.json') }}" >> "$GITHUB_OUTPUT"

      - name: Run tests
        # unchanged

      - name: Save onboarded account pool
        if: always() && hashFiles('.generated/onboarded-pool.json') != '' && hashFiles('.generated/onboarded-pool.json') != steps.pool-before.outputs.hash
        uses: actions/cache/save@v4
        with:
          path: .generated/onboarded-pool.json
          key: onboarded-pool-${{ matrix.platform }}-${{ github.run_id }}-${{ github.run_attempt }}-${{ strategy.job-index }}
```

- **Restore:** the exact key never exists, so `restore-keys` returns the most recently saved pool for the platform.
- **Save:** a cache key cannot be overwritten, so each save gets a unique key. Saving only when the file changed keeps a parallel job that did not touch the pool from saving an older copy over a newer one.
- **`always()`:** a failed run still records the account it used, so the next run does not pick an account that is already locked.

## Copying this to the CI repository

The regression CI runs from a separate repository. Copy the three steps into each job there that runs `onboarding.spec.ts` or the `authSecurity` lane, around its `Run tests` step. Nothing else needs to be configured: `actions/cache` needs no secret.

## Limits

- **Branches:** a cache saved on `main` is visible to every branch. A cache saved on another branch is visible only to that branch. Schedule the onboarding run on `main`.
- **Parallel runs:** two regressions running at the same time can restore the same pool and take the same account. Within one run the lockout specs share the `authSecurity` lane, so they do not collide.
- **Self-hosted runners:** ARC runners reach the GitHub cache service over the network. Check once that the restore step logs `Cache restored from key`.
- **Retention:** GitHub evicts caches unused for 7 days. If no onboarding or lockout run happens for a week, the pool starts empty again.
- **Supply:** the pool grows only when onboarding finishes. While staging fails at OB-1.2, no new accounts are added.
