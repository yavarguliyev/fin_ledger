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

Nothing open.

## P1 — Stuck, stale or lost state

### API-P1-2 · A crash between charge and credit leaves a charged, uncredited deposit

**Problem.** Deposits run synchronously in `PaymentOperationHelper.executeDepositOperation`: charge, then credit the
wallet. If the process dies between the two, Stripe has the money and the payment stays `PENDING` with nothing to
finish it. (The unused in-memory deposit saga was deleted on 2026-09-22: it kept no state, so it couldn't survive this
crash either.)

**Solution (implemented 2026-09-22, not yet verified live).** `PaymentReconciliationJob` finds the
crashed deposit (`PENDING`, no charge ID) by `metadata.paymentId` at Stripe and completes it through
`CompletePaymentUseCase`. Simulation can't produce "charged but no ID stored", so this needs a scratch run against
Stripe test mode.

**Verify.**
- [ ] Killing the API right after a successful charge: within one reconciliation cycle the wallet is credited exactly once.

---

### API-P1-4 · Two analytics events have consumers but no producer *(needs a product decision)*

**Found 2026-09-23** while moving payment analytics into the completing transaction (`PKG-P1-4`).

`PaymentHelper.emitCompletedAnalytics` returned early unless the payment was `COMPLETED`, then always passed
`isCompleted: true` — so `publishPaymentFailed` was **unreachable** and `AnalyticsEventTopic.PAYMENT_FAILED` has never
been published. `AnalyticsPaymentFailedHandler` subscribes to that topic and has therefore never run. The same is true
of the wallet side: `AnalyticsWalletDebitedHandler` subscribes to `WALLET_DEBITED`, which only fires on a debit path
that the analytics emit never reached either.

**Done.** `AnalyticsEventTopic.PAYMENT_COMPLETED` is now written to `outbox_events` (destination `KAFKA`) inside the
same transaction that marks the payment `COMPLETED`, next to the existing `DomainEventType.PAYMENT_COMPLETED` row, so
it can no longer be lost between commit and publish. The unreachable `emitCompletedAnalytics` /
`emitKafkaPaymentAnalytics` / `emitKafkaWalletAnalytics` chain and its DTOs were deleted.

**Decide.** Either emit `PAYMENT_FAILED` (and confirm `WALLET_DEBITED` fires) from the paths that own those outcomes,
or delete the two consumers. Right now they are handlers that can never be called.

**Verify.**
- [ ] Whichever way it goes: no Kafka topic has a consumer with no producer, and no producer with no consumer.



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

- **`jobs`** for `@common/tasks` (`PKG-P2-2`).
- **Outbox:** drop the `FAILED` outbox status, which nothing writes now that the relay reschedules to `PENDING` or
  `DEAD`. (`destination` was added in migration 017.)
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

**Bet model decided 2026-09-23: instant game.** `API-P0-3` was closed by deriving the win probability from the offered
odds with a configured margin (`p = 1 / (odds x (1 + margin))`, `BETTING_MARGIN`, default 0.05), drawing with
`crypto.randomInt`, and storing `bets.draw_value` / `bets.draw_threshold` for audit. Bets still settle at placement, so
this item is now only about the event lifecycle itself, not about settling bets from a result. Moving to a sportsbook
later would mean re-opening that decision: bets would stay `PENDING` and a result would settle them, and the draw
columns would become dead.

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

### API-P2-6 · Metrics breadth left

**Done 2026-09-23.** `/health/live` and `/health/ready` (terminus; readiness pings Postgres and reports pool gauges).
`/metrics` serves `prom-client` output — default process metrics plus `db_pool_connections_{total,idle,waiting}` and
`outbox_events_{pending,dead}`. `main.ts` read `NODE_ENV` with `get<number>` into a variable spelled `environemnt` and
compared it to the *default*, so Swagger mounted whenever those matched rather than outside production; it now reads
`Environment` and gates on `!== Production`. **The old `/metrics` was unreachable anyway** — `MetricsController` never
declared `version`, so the versioned router never mapped it; both it and the new health routes declare `V1` now.
Correlation IDs: `CorrelationIdMiddleware` honours an incoming `x-correlation-id` or issues one, echoes it on the
response, and puts it in `RequestScope` (AsyncLocalStorage) — `OutboxRepository.createEvent` reads it from there, so
every event a request writes carries its `trace_id`. Covered by `health-metrics` and `correlation-id` specs.

`RequestScope` is also what `API-P2-9` uses for `app.current_user_id`, so there is one request store, not two.

**Still open.**
- **More gauges:** HTTP latency, DLQ depth (`RabbitmqService.queueDepth`), ledger drift from `LedgerIntegrityJob`.
- **Readiness breadth:** the check covers Postgres only; Redis and the brokers are not checked yet.

**Verify.**
- [ ] `/health/ready` also fails when Redis or a broker is down, and `/metrics` carries the gauges above.

### API-P2-7 · Session policy

**Problem.** Access tokens live for `JWT_EXPIRES_IN=7d`, with no refresh or rotation. A stolen token works for a week
unless the session is deleted.

**Solution.** Short access sessions (15 min) plus a rotating refresh session in Redis, reuse detection (a replayed
refresh token revokes the whole family), and a "log out all devices" endpoint. The client side is `WEB-P1-2`.

**Verify.**
- [ ] The access token expires after 15 min and refresh works.
- [ ] Replaying an old refresh token logs out every session of that user.

### API-P2-9 · Row-level security: PgBouncer is the one thing left

**Done 2026-09-23 — the policies are enforced.** `app_api` is created `NOBYPASSRLS`, so the policies from migration
013 now apply to it. A request's user reaches the database through `RequestScope` (AsyncLocalStorage, shared with the
correlation ID from `API-P2-6`): `SessionGuard` puts the user id in the scope, and the adapter issues
`set_config('app.current_user_id', …, true)` at the start of every transaction **and wraps standalone queries in one**,
because a bare `pool.query` carries no GUC and would have returned zero rows.

System work runs as a second login, `app_worker` (`BYPASSRLS`), provisioned by `npm run db:provision-roles` alongside
`app_api`. Nothing had to thread a connection through the repositories: background entry points wrap themselves in
`RequestScope.runSystem(...)` — the three jobs, the Kafka and RabbitMQ handlers, the outbox relay poll, webhook
ingestion and registration (which creates a wallet before any session exists) — and `PostgresService` hands back the
worker adapter while that scope is active. Staff reach every row through a `*_staff_access` policy keyed on
`app_current_role()` (migration 018, revertible).

Covered by `apps/core-api/test/integration/rls.integration-spec.ts`: `app_api` really has no bypass, an owner reads
their own wallet, another user's wallet is invisible **even when asked for by id**, an unset actor returns nothing at
all (fails closed), and staff see every row. The whole suite passes with the bypass gone, which is what exercises the
system paths.

**Still open.**
- **PgBouncer:** `SET LOCAL` is safe in transaction mode, which is what this uses — but the pooler is still not in
  front. Needed before more than two API instances (`PKG-P2-1`).
- **Cost:** a standalone read by an authenticated user is now `BEGIN`/`set_config`/query/`COMMIT`. That is the price of
  enforcing RLS without session-level pooling; measure it under the k6 run in `PKG-P2-1` before scaling out.

**Verify.**
- [x] With the ownership guards removed, user B still can't read user A's rows.
- [x] Webhooks, consumers and the outbox relay still work as `app_worker`.

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
| `status` | ✅ used | `PENDING → ACTIVE` on verification; login and session require `ACTIVE`. Admins suspend/reactivate via `POST /users/:userId/suspend|reactivate` (UI: `WEB-P1-4`) |
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
