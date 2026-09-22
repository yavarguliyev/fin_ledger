# core-api improvement backlog

Known problems in `apps/core-api` (API code, business rules, migrations) and how we plan to fix each one.
Shared infrastructure (messaging, DB pool, jobs, payment adapters) is in
[`packages/IMPROVEMENT-BACKLOG.md`](../../packages/IMPROVEMENT-BACKLOG.md). The frontend is in
[`apps/client/IMPROVEMENT-BACKLOG.md`](../client/IMPROVEMENT-BACKLOG.md).

**How to use this file**

1. Pick the highest-priority open item. Fix it in its own small change.
2. Run every check in its **Verify** list against a real database. Unit tests alone don't count.
3. When every check passes, **delete the whole section** in the same commit as the fix.
   An item that is still here is not done.

Priority: **P0** money is wrong, data leaks, or the service can be knocked over ·
**P1** payments or state get stuck or go stale · **P2** schema and structure · **P3** tests and polish.
Item IDs use the `API-` prefix. Other files' items are named with their own prefix (`PKG-`, `WEB-`).

Last full review: 2026-09-22.

---

## P0 — Money correctness, security, availability

### API-P0-3 · Bet outcomes ignore the odds, so the house loses money at higher odds

**Problem.** `PlaceBetUseCase` settles every bet **immediately** after placing it. `BetHelper.resolveOutcome` decides
with `Math.random() < WIN_CHANCE` (0.45) whatever the odds or the game event.
- **Negative house edge:** at odds 3.0 the expected return is 0.45 × 3 = **1.35 per unit staked**. The house loses on
  every event priced above about 2.22.
- **Events ignored:** the event's status and result play no part.
- **Not a secure random source:** `Math.random` is predictable, which isn't acceptable for a game of chance.
- **Loose admin settlement:** `POST /bets/:betId/settlement` lets an admin pass any outcome.

**Solution** *(needs a product decision: sportsbook or instant game)*.
- **Sportsbook:** bets stay `PENDING`. Settlement is driven by the event result (`API-P2-4`) and runs as a job over all
  bets on that event. Admin settlement only records the event result, not individual bet outcomes.
- **Instant game:** remove events from the flow. The win probability comes from the offered odds with a margin
  (`p = 1 / (odds × (1 + margin))`), draws use `crypto.randomInt`, and we store the seed/draw for audit.
- Either way, keep `WIN_CHANCE` out of the payout maths.

**Verify.**
- [ ] A simulation of 1M bets at several odds shows a positive house edge equal to the configured margin.
- [ ] (Sportsbook) Placing a bet leaves it `PENDING`; recording the event result settles every bet on it exactly once.

---

## P1 — Stuck, stale or lost state

### API-P1-1 · Deposits without a stored charge ID are never resolved

**Done (2026-09-22).**
- **Webhook replay:** `WebhookReplayJob` re-handles events still `RECEIVED` / `FAILED` after
  `WEBHOOK_REPLAY_STALE_AFTER_MS`, through the same locked transaction as live deliveries, and leaves them `FAILED`
  for manual review after `MAX_ATTEMPTS` (spec `webhook-inbox`).
- **Payment reconciliation:** `PaymentReconciliationJob` looks up deposits left `PROCESSING` / `REQUIRES_ACTION`
  longer than `PAYMENT_RECONCILE_STALE_AFTER_MS` at the provider (`retrieveCharge`) and completes them through
  `CompletePaymentUseCase` or fails them through `FailPaymentUseCase` (spec `payment-reconciliation`).

**Still open.**
- **No charge ID.** A deposit whose charge call timed out (marked `REQUIRES_ACTION` with no charge ID), or that crashed
  before the ID was stored, is skipped. Find the charge by `metadata.paymentId` (Stripe PaymentIntent search); if the
  provider has none after a grace period, mark the payment `FAILED`.
- **Abandoned 3-D Secure.** A `REQUIRES_ACTION` deposit the customer never authenticates stays open forever. After an
  expiry, cancel the PaymentIntent and fail the payment.
- **Manual review.** Count reconciliation attempts (needs a column) and flag payments that stay unresolved.

**Verify.**
- [ ] A payment the PSP never saw is marked `FAILED`.
- [ ] An unauthenticated 3-D Secure deposit is cancelled and failed after the expiry.

### API-P1-2 · A crash between charge and credit leaves a charged, uncredited deposit

**Problem.** Deposits run synchronously in `PaymentOperationHelper.executeDepositOperation`: charge, then credit the
wallet. If the process dies between the two, Stripe has the money and the payment stays `PENDING` with nothing to
finish it. (The unused in-memory deposit saga was deleted on 2026-09-22: it kept no state, so it couldn't survive this
crash either.)

**Solution.** Recover crashed deposits with the reconciliation job
(`API-P1-1`), which finds `PENDING`/`PROCESSING` payments older than a threshold and finishes them through
`CompletePaymentUseCase`.

**Verify.**
- [ ] Killing the API right after a successful charge: within one reconciliation cycle the wallet is credited exactly once.

### API-P1-3 · Cached money data can be stale, and each write clears every user's cache

**Problem.**
- **Cleared too early:** `@CacheEvict` on `WalletService` runs when the method returns. For callers that pass an
  `adapter` (place bet, settle, deposit credit), that's **inside the still-open transaction**, so a concurrent read
  re-caches the old balance for 60s.
- **Clears everyone:** eviction uses the pattern `wallet*` (a Redis `SCAN`), so every money movement wipes every user's
  wallet cache, at O(keys) Redis cost.
- **Never cleared:** `payment` (180s), `ledger:*` (120–600s), `wallet:transaction*`, `bet:list` and
  `payment-method*` are cached but not cleared when they change, e.g. a webhook completing a payment.

**Solution.**
- **Don't cache money:** wallet balance, payment status, ledger entries. A primary-key read is cheap.
- **Clear after commit:** if caching is kept, clear exact keys *after commit* (an `afterCommit` hook on the transaction
  adapter), never by pattern.
- **Keep caching where it's safe:** `game-events`, currencies.

**Verify.**
- [ ] A balance read immediately after a bet shows the new balance, under 50 concurrent bets on one wallet.
- [ ] `GET /payments/:id` shows `COMPLETED` immediately after the webhook.
- [ ] Redis `MONITOR` shows no `SCAN` during a money operation.

### API-P1-4 · Wallet/ledger drift checks exist but never run

**Problem.** `v_ledger_balance_drift`, `v_wallet_ledger_drift` and `v_trial_balance` exist (migrations 005/006), but no
code reads them. Drift would go unnoticed.

**Solution.** Add a scheduled job (`PKG-P2-2`) that queries all three every few minutes, exports a `ledger_drift_rows`
gauge, and alerts on anything non-zero or an unbalanced trial balance.

**Verify.**
- [ ] Manually corrupting one wallet balance in a test DB raises the alert within one cycle.

### API-P1-5 · Bet settlement side effects run outside the transaction

**Problem.**
- **Not atomic:** the win notification is created after commit with `void …`, and a failure is only logged.
- **Status set too early:** it's written as `SENT` straight away.
- **Wrong amount formatting:** the text hard-codes `/100`, which is wrong for JPY (0 decimals) and KWD (3).

**Solution.**
- **Write it with the settlement:** emit a `BET_SETTLED` event through the outbox in the settlement transaction, and let
  the notification consumer create the notification.
- **Format amounts once:** use a shared currency-aware formatter (the backend equivalent of the client's `CurrencyHelper`).

**Verify.**
- [ ] A JPY win shows the right amount. With the notification consumer down, the notification appears once it's back.

### API-P1-6 · Users can't be suspended, and a status change doesn't end live sessions

**Problem.** Login and `SessionGuard` now require `status = ACTIVE`. The session snapshot in Redis carries `status`, and
email verification moves `PENDING → ACTIVE`. But nothing can **suspend** or **reactivate** a user: no endpoint writes
`SUSPENDED`, and changing the column directly in the DB leaves existing sessions (snapshot `ACTIVE`) working until they
expire. Only anonymization (`CLOSED`) ends sessions today.

**Solution.** Admin use cases `SuspendUserUseCase` / `ReactivateUserUseCase`, audited, with validated transitions
(`ACTIVE ↔ SUSPENDED`; `CLOSED` stays terminal). Each one calls `SessionService.deleteUserSessions` in the same flow,
and the client admin table gets the matching toggle.

**Verify.**
- [ ] Suspending a user makes their open session return 401 on the next request, and login returns "Invalid credentials".
- [ ] Reactivating lets them log in again; a `CLOSED` user can't be reactivated.

---

## P2 — Schema and structure

### API-P2-1 · Replace Postgres ENUM types with `text` + CHECK constraints

**Problem.** Migration 001 creates 20 native `ENUM` types.
- **Hard to change:** values can't be removed or renamed.
- **Awkward migrations:** `ALTER TYPE … ADD VALUE` can't be used in the transaction that adds it (node-pg-migrate wraps
  each migration in one), and every `down` gets harder.
- **Duplicated lists:** the lists already live in the TS enums in `@common/shared-libs`.
- **Inconsistent today:** `notifications.type` is `varchar(50)` with no check at all.

**Solution.** Keep the domains (`currency_code`, `money_minor*`, `email_address`, `decimal_odds`).
- **Swap each ENUM** for `text NOT NULL` plus a **named** check (`chk_payments_status`) from one helper in
  `migrations/utils` (`enumCheck(table, column, values)`).
- **Adding a value later:** `DROP CONSTRAINT` + `ADD … NOT VALID` + `VALIDATE`, which is transactional and reversible.
- **Fold it in:** put this into the existing migrations while the DB is still re-creatable, and add a check for
  `notifications.type`.

**Verify.**
- [ ] `migrate:down` then `migrate:up` from zero succeeds, and seed data loads.
- [ ] A test migration adding a status value runs in a transaction and reverts cleanly.
- [ ] A unit test asserts each TS enum equals its DB check list.

### API-P2-2 · Data structure changes to make

- **`provider_customers`**:
  - `(user_id, provider, provider_customer_id)`, with `unique(provider, user_id)` and `unique(provider, provider_customer_id)`.
  - The Stripe adapter currently searches customers by email or creates a new guest customer per charge (`PKG-P3-2`).
- **`inbox_messages`** `(consumer, message_id, processed_at)`, primary key `(consumer, message_id)`, for idempotent consumers (`PKG-P1-2`).
- **`jobs`** for `@common/tasks` (`PKG-P2-2`).
- **Outbox:** add `outbox_events.destination` (`PKG-P1-4`) and drop the `FAILED` outbox status (`PKG-P1-3`).
- **`payment_status_history`** `(payment_id, from_status, to_status, source, created_at)`, written by the state machine (`PAYMENT_TRANSITIONS` / `updatePaymentStatus`).
- **`payment_methods.currency`** for payout destinations (with currency routing, `PKG-P3-1`).
- **Immutable wallet transactions:** `trg_wallet_transactions_immutable` blocks only DELETE. Block UPDATE too, except the
  columns the state machine may change.

**Verify.** Each change: migration up/down from zero, plus a test of its code against a real DB.

### API-P2-3 · Tables that only grow

**Problem.** `outbox_events`, `webhook_events`, `audit_log`, `notifications` and `ledger_entries` have no retention or partitioning.

**Solution.**
- **Retention jobs:** delete `PUBLISHED` outbox rows older than 7 days and processed webhooks older than 90 days,
  as the worker role (the API role has no DELETE).
- **Partitioning:** monthly partitions on `created_at` for `audit_log` and `ledger_entries` once they pass a few million rows.

**Verify.**
- [ ] After the job, no `PUBLISHED` outbox rows older than the window remain.
- [ ] `EXPLAIN` of the common queries still uses indexes and partition pruning.

### API-P2-4 · Game events have no lifecycle

**Problem.** `game-events` only has a list query. Events exist only as seed data: there's no create, no status change
(`SCHEDULED → LIVE → FINISHED → SETTLED`), and no result. Nothing stops bets on an event that has started, other than
the seeded status.

**Solution.** Admin use cases to create events, change status (validated transitions) and record the result.
Recording a result enqueues settlement of that event's bets (`API-P0-3`, sportsbook option).

**Verify.**
- [ ] Bets are refused once the event is `LIVE`.
- [ ] Recording a result settles every bet on the event exactly once, even if the job is retried.

### API-P2-5 · Module structure *(to discuss before changing)*

**Problem.**
- **Too many small modules:** 17 modules, several tiny ones (`metrics` returns `'hello'`, `email`, `analytics` log-only),
  plus `wallet` / `wallet-transactions` / `ledger` split along tables rather than business boundaries.
- **Circular dependencies:** `forwardRef` pairs `auth ↔ wallet`, `wallet ↔ wallet-transactions`, `wallet-transactions ↔ auth`.
- **Thin services:** services are mostly one-line pass-throughs to use cases, plus caching.

**Proposed direction.** About 8 modules along business boundaries:
- **identity** (auth, user)
- **wallet** (wallet, wallet-transactions, ledger)
- **payments** (payment, payment-methods, webhook)
- **betting** (bet, game-events)
- **notifications** (notification, email)
- **audit**
- **admin**
- **platform** (health, metrics)

Break the cycles with events rather than `forwardRef`. Controllers call use cases directly, and services go.

**Verify.**
- [ ] No `forwardRef` left.
- [ ] Build, typecheck, lint and tests pass.
- [ ] Every route still answers the same (Swagger diff shows no change).

### API-P2-6 · Health, metrics and bootstrap

**Problem.**
- **No real metrics:** `GET /metrics` returns `'hello'`.
- **No health checks:** there's no health or readiness endpoint.
- **Env bugs in `main.ts`:** it reads `NODE_ENV` with `get<number>`, the variable is misspelled `environemnt`, and
  Swagger is gated on a string comparison.
- **No request IDs:** there's no request/correlation ID, although `outbox_events.trace_id` exists.

**Solution.**
- **Health:** `@nestjs/terminus` `/health/live` and `/health/ready` (DB, Redis, brokers).
- **Metrics:** Prometheus metrics via `prom-client` (HTTP latency, DB pool gauges `PKG-P2-1`, outbox lag, DLQ depth,
  drift `API-P1-4`).
- **Correlation IDs:** a request-ID middleware that stores the ID in AsyncLocalStorage and passes it into logs and outbox `trace_id`.
- **Env reading:** fix the typed env read.

**Verify.**
- [ ] `/health/ready` fails when Postgres is stopped.
- [ ] `/metrics` scrapes in Prometheus format.
- [ ] One request's ID appears in its logs and in its outbox rows.

### API-P2-7 · Session policy

**Problem.** Access tokens live for `JWT_EXPIRES_IN=7d`, with no refresh or rotation. A stolen token works for a week
unless the session is deleted.

**Solution.** Short access sessions (15 min) plus a rotating refresh session in Redis, reuse detection (a replayed
refresh token revokes the whole family), and a "log out all devices" endpoint. The client side is `WEB-P1-2`.

**Verify.**
- [ ] The access token expires after 15 min and refresh works.
- [ ] Replaying an old refresh token logs out every session of that user.

### API-P2-8 · Last positional-parameter methods

`AuthRepository.findByEmail` and `findByEmailAny` still take positional arguments `(email, adapter?)`, against the
one-DTO-per-method convention. (`createUser` and `IdempotencyHelper.forPayment` were converted on 2026-09-22.)

**Verify.** No method in `apps/core-api/src` takes more than one parameter, apart from framework-called signatures.

---

### API-P2-9 · Row-level security is written but not enforced (moved from P0 on 2026-09-22)

**Done (2026-09-22): least privilege.** The API no longer connects as the table owner. `npm run db:provision-roles`
(owner connection) creates the `app_api` login, a member of `app_readwrite`: no ownership, no DDL or `TRUNCATE`,
`DELETE` only on `users` and `notifications`. The integration stack runs the API as `app_api`
(spec `database-privileges`). `app_api` still has `BYPASSRLS`, so the policies from migration 013 don't apply yet.

**Still open: enforce the policies.**
1. **Request-scoped user.** Keep the authenticated user (and role) in `AsyncLocalStorage`; the database adapter runs
   `SELECT set_config('app.current_user_id', $1, true)` at the start of every transaction and wraps standalone queries
   in one. That's `SET LOCAL`, which is safe behind PgBouncer.
2. **Staff and system access.** Staff through an explicit policy (`app_current_role() IN (…)`); webhooks, consumers,
   the outbox relay and jobs through a separate `app_worker` login with `BYPASSRLS`.
3. **Drop `BYPASSRLS` from `app_api`.**

**Verify.**
- [ ] With the ownership guards (`ResourceOwnerGuard` children) temporarily removed, user B still can't read user A's rows.
- [ ] Webhooks, consumers and the outbox relay still work as `app_worker`.

## P3 — Tests

### API-P3-1 · Integration tests: the harness exists; every fix must add its test

**Done (2026-09-22).** `npm run test:integration` (turbo, core-api only) boots a throwaway stack with **Testcontainers**
(Postgres 16, Redis, RabbitMQ, Kafka), runs the real migrations and seed, starts the **built API** (`dist/main.js`)
from an empty working directory with generated secrets and simulated payments, and runs black-box HTTP tests from
`apps/core-api/test/integration`. It currently has 17 tests covering the ownership guards, the login status
lifecycle and timing, and per-user payment idempotency, plus drift = 0. A mutation check (removing
`PaymentAccessGuard`) made the suite fail as expected. CI runs it after the typecheck.

**Still open.**
- **CI not yet seen green.** The CI step is added but hasn't run on GitHub yet.
- **Each fix adds a test.** Every remaining P0/P1 fix adds its integration test in the same change, money paths first:
  bet settlement (`API-P0-3`).

**Verify.**
- [ ] The CI run on GitHub shows the `Integration Tests` step green.
- [ ] Each P0 item still open above has at least one integration test by the time it is closed.

---

## P4 — Planned features (the schema has columns for them, the code has nothing)

Researched 2026-09-22. Effort is for one developer and includes integration tests. Build each one as its own series
of small changes. Prices are from the vendors' own pages; check them again before signing up.

### API-F-7 · Two-factor follow-ups

Two-factor authentication shipped on 2026-09-22 (TOTP, recovery codes, two-step login, profile set-up and turn-off).
Still to decide or build:
- **Required for staff:** make it mandatory for `ADMIN`/`GLOBAL_ADMIN`, so an admin without it is sent to the set-up
  wizard after login.
- **Passkeys:** WebAuthn with `@simplewebauthn/server` (MIT) as a second option alongside authenticator apps.
- **Regenerate recovery codes:** from the profile page (password + current code), replacing the old set.
- **Notify on changes:** email when two-factor is turned on or off (needs `PKG-P1-5` for real delivery).

**Verify.** Each bullet, once built, has an integration test and a browser check like the one used for the set-up wizard.

### API-F-2 · Identity verification (KYC)

**Today.** `users.kyc_status` (`NOT_STARTED/PENDING/APPROVED/REJECTED`) exists and is set only by the seed data.
`date_of_birth` and `country_code` are never written.

**Design.** Checking documents and faces (document scan, selfie, liveness) needs an outside provider; it isn't
realistic to build in-house.
- **Package:** `packages/kyc` (`@common/kyc`), built like `packages/payment-provider`: a provider-agnostic
  `KycProvider` interface (`createSession`, `verifyWebhook`, `mapStatus`), a registry, and one adapter per vendor.
- **First adapter: [Didit](https://didit.me/pricing/).** It advertises **500 free verifications a month**, then about
  $0.30–0.33 each, with a free sandbox and no contract.
- **Alternatives:** Sumsub, Veriff, Onfido and Persona are established but paid (their sandboxes are usually free).
  The adapter interface keeps switching cheap.
- **Schema:** a `kyc_verifications` table (`user_id`, `provider`, `provider_session_id`, `status`, `decided_at`,
  minimal decision data). **Never store document images.** The provider keeps them.
- **Flow:**
  1. `POST /kyc/sessions` creates a provider session.
  2. The client opens the provider's hosted page or SDK.
  3. A signed webhook moves `kyc_status` through a validated state machine (reuse the `PAYMENT_TRANSITIONS` pattern), and fills
     in `date_of_birth`/`country_code` from the verified data.
- **Enforcement:** withdrawals need `APPROVED`. Optionally, so do deposits above a threshold. An age check of 18+
  runs on the verified date of birth.
- **Client:** a "Verify your identity" card on the profile page, showing the status.

**Effort.** About 4–6 days, plus provider sign-up and compliance review.

**Verify.**
- [ ] A sandbox verification (approved and rejected cases) updates `kyc_status` from the webhook, and replayed webhooks change nothing.
- [ ] An unverified user can't withdraw.

### API-F-3 · Self-exclusion (responsible gambling)

**What it is.** A player can block themselves from gambling for a chosen period (e.g. 24 hours, 7 days, 30 days,
6 months, permanent). Until `self_exclusion_until` passes they can't place bets or deposit, and **it can't be
shortened or cancelled early**, not even by support. Gambling regulators (UK, most of the EU) require it, usually
together with deposit limits and time reminders.

**Today.** The `users.self_exclusion_until` column exists, and nothing reads or writes it.

**Design.**
- **Endpoint:** `POST /users/me/self-exclusion {period}`. It can only **extend** the date, never move it earlier.
- **Enforcement:** checked in place-bet and deposit (under the same row lock as the wallet status check), and
  withdrawals stay allowed. The session carries the date, so the client can show a banner.
- **Confirmation:** an email when it starts.
- **Staff can't lift it early.**
- **Later:** deposit limits (daily/weekly/monthly) and time reminders.

**Effort.** About 1–1.5 days. No external service.

**Verify.**
- [ ] A self-excluded user gets a clear error when betting or depositing, but can still withdraw.
- [ ] Moving the date earlier is rejected, including by an admin.

### API-F-4 · Device fingerprinting (fraud and new-device alerts)

**Today.** `users` has **no** fingerprint column. The existing `payment_methods.fingerprint` is Stripe's **card**
fingerprint, used to spot the same card added twice. That's a different thing.

**What it's for.** Recognising the same browser or device across logins, to:
- catch one person running several accounts (bonus abuse, getting around self-exclusion);
- warn users about logins from a new device;
- feed risk scoring before withdrawals.

**Options.**
- **Open-source FingerprintJS:** now released under a **Business Source License**, which restricts some production
  use, and less accurate than the paid version.
- **[ThumbmarkJS](https://www.thumbmarkjs.com/):** MIT, free, client-side only.
- **[Fingerprint Pro](https://fingerprint.com/):** a free plan of about 1,000 requests a month, then about $99 a month
  for 20k. Server-verified, and much more accurate.

**Design.**
- **Tables, not a `users` column** (a user has many devices):
  - `user_devices` (`user_id`, `visitor_id`, `first_seen_at`, `last_seen_at`, `last_ip`, `user_agent`);
  - `login_events` for history.
- **Collection:** the client sends the visitor ID with login.
- **New devices:** an unseen device triggers the new-device email.
- **Shared devices:** staff see accounts that share a device.
- **Privacy:** it needs consent under GDPR and ePrivacy.

**Effort.** About 1–2 days with ThumbmarkJS; about half a day more to add Fingerprint Pro's server check.

**Verify.**
- [ ] Logging in from a new browser records a device and sends the alert. The same browser doesn't.
- [ ] Staff can see two accounts that share a device.

### API-F-5 · `users` table: column-by-column audit

Every column of `users` (migration 003) checked against the code on 2026-09-22.

| Column | State | What's needed |
|---|---|---|
| `id`, `email`, `display_name`, `role`, `created_at`, `updated_at` | ✅ used | `updated_at` is kept by its trigger |
| `password_hash`, `password_algo` | ✅ used | login rehashes legacy bcrypt to argon2id |
| `password_changed_at` | ✅ written | set on reset, invite and verify. Also set by the change-password flow (`API-F-6`) |
| `status` | ✅ used | `PENDING → ACTIVE` on verification; login and session require `ACTIVE`. Suspend/reactivate is `API-P1-6` |
| `is_email_verified`, `email_verified_at` | ✅ used | |
| `profile_images_key`, `profile_images`, `profile_image_index` | ✅ used | the unchecked `profileImagesKey` issue is listed under "Reported earlier" below |
| `deleted_at` | ✅ used | soft delete, restore and anonymize |
| `last_login_at` | ⚠️ written, never shown | show it, with the IP, in the profile "Security" section (`API-F-6`) |
| `terms_accepted_at` | ✅ used (2026-09-22) | registration requires `termsAccepted: true` (400 otherwise) and saves the time; covered by an integration test |
| `failed_login_attempts`, `locked_until` | ❌ unused | account lockout: count failures, lock for N minutes after M tries, reset on success. Complements the per-IP+email rate limit (done): stops a slow or distributed guess against one account |
| `last_login_ip` | ❌ never written | set it at login, using `req.ip`, which is already the real client IP behind the proxy (`TRUST_PROXY`) |
| `mfa_secret_encrypted`, `mfa_enabled_at`, `mfa_last_used_step` | ✅ used (2026-09-22) | two-factor authentication: `@common/mfa`, `/auth/mfa/*`, two-step login and the profile wizard |
| `kyc_status` | ❌ seed only | KYC, `API-F-2` |
| `date_of_birth`, `country_code` | ❌ never written | filled from verified KYC data. Enforce a minimum age of 18 and allowed countries (`API-F-2`) |
| `self_exclusion_until` | ❌ unused | responsible gambling, `API-F-3` |
| `version` | ❌ dead | no trigger bumps it (`bump_row_version()` exists but **no table uses it**) and nothing reads it. Either use it for optimistic locking on profile updates (compare-and-set), or drop the column and the unused function |

**Verify.** Each ❌/⚠️ row is either wired to the flow named here, with an integration test, or removed with a
working migration `down`.

### API-F-6 · Signed-in account management: change password, change email, recent login

**Today.** A signed-in user can only change their display name and images (`PATCH /users`). There is no way to change
the password without the "forgot password" email, no way to change the email address, and no view of recent sign-in
activity.

**Design.** Reuse the one-time link tokens (`auth_tokens`) and `SessionService`.
- **Change password:** `POST /auth/change-password {currentPassword, newPassword}`.
  - Checks the current password and sets `password_changed_at`.
  - **Ends every other session** and keeps the current one.
  - Sends a "your password was changed" email.
- **Change email:** `POST /auth/change-email {newEmail, currentPassword}` emails a one-time link to the **new**
  address (new `email_change` purpose, 24 h). Opening it switches the address, ends the other sessions, and sends a
  notice to the **old** address.
- **Recent sign-in:** show `last_login_at` and `last_login_ip` in the profile "Security" section. Later, show the
  device list from `API-F-4`.
- **Client:** "Change password" and "Change email" dialogs in the profile page's Security section.

**Effort.** About 1.5–2 days, including tests.

**Verify.**
- [ ] Changing the password needs the current one, keeps this session and logs out the others.
- [ ] Changing the email only takes effect after opening the link sent to the new address, and the old address gets a notice.

---

## Reported earlier and not re-checked on 2026-09-22

Confirm each one first; fix it or delete the line.
- **Unchecked storage key:** `PATCH /users` accepts any `profileImagesKey`, and `delete_all` then deletes that storage key.
- **Audit source:** audit for money movement should come from `outbox_events`, not the HTTP interceptor.
  Keep `@Audited()` for admin and lifecycle actions.
