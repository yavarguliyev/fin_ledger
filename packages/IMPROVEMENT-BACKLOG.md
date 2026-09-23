# Packages improvement backlog

Known problems in the shared packages (`packages/*`: messaging, database, jobs, payment adapters) and how we plan to
fix each one. App-specific items are in [`apps/core-api/IMPROVEMENT-BACKLOG.md`](../apps/core-api/IMPROVEMENT-BACKLOG.md)
(`API-`) and [`apps/client/IMPROVEMENT-BACKLOG.md`](../apps/client/IMPROVEMENT-BACKLOG.md) (`WEB-`).

**How to use this file**

1. Pick the highest-priority open item. Fix it in its own small change.
2. Run every check in its **Verify** list against a real database and broker. Unit tests alone don't count.
3. When every check passes, **delete the whole section** in the same commit as the fix.
   An item that is still here is not done.

Priority: **P0** money is wrong · **P1** messages get lost · **P2** scaling and structure · **P3** robustness.
Item IDs use the `PKG-` prefix.

Last full review: 2026-09-22.

---

## P0 — Payment adapters move money wrongly

### PKG-P0-2 · Withdrawals pay the platform, not the user *(needs a product decision)*

**Problem.** `StripeOperationHelper.createPayout` calls `payouts.create` for any recipient not starting with `acct_`.
That moves money from the platform balance to **the platform's own bank account**.

**Solution.** Pick one model per PSP, add it behind `SupportsPayout`, and refuse withdrawals the PSP can't honour:
- **Connect transfer:** each user has a connected account, and we `transfers.create` to it.
- **Refund to source:** capped at the net deposited amount.
- **Manual/ops:** withdrawal creates a review task.
- **Failure webhooks (core-api):** a `FAILED` payout webhook must release the reserved funds in the same transaction
  as the status change (today the handler only sets `FAILED`).

**Verify.**
- [ ] A test-mode withdrawal shows funds going to the user's destination in the Stripe dashboard.
- [ ] A destination the PSP can't pay is rejected before any reservation.

---

## P1 — Messages must not get lost

### PKG-P1-5 · Delivery is built; only the staging smoke test is left

**Done 2026-09-23.** `@common/mailer` selects a transport by `MAIL_TRANSPORT` behind the `MailTransport` interface:
`SmtpTransport` (nodemailer, `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASSWORD`, TLS on port 465) and
`ConsoleTransport` for local development. Logs carry recipient, subject and purpose only — never the URL or its
token, on success or failure. Covered by `packages/mailer/src/testing/mailer.service.spec.ts`. SMTP delivery itself
was verified on 2026-09-23 against a real SMTP server (a throwaway Mailpit container): the message arrived with the
right from/to/subject and the link in the body, while the log line carried only recipient, subject and purpose.
What is left below is pointing it at your provider, not code.

**Verify (needs a real environment, so it is yours to run).**
- [ ] Set `MAIL_TRANSPORT=smtp` with real credentials in staging, register a user, and confirm the verification
      email arrives in a real inbox.

---

## P2 — Connections, jobs, structure

### PKG-P2-1 · Connection pool: scale-out decisions left

**Done 2026-09-23 — pool safety.** `postgresql.adapter.ts` now registers `pool.on('error')` (a killed backend is
logged, not fatal), releases broken clients with `release(err)` after a failed `ROLLBACK`, and builds its pool through
`PoolHelper` with `statement_timeout`, `idle_in_transaction_session_timeout`, `application_name`, `keepAlive` and
`maxLifetimeSeconds`, all env-configurable. **Transaction retries are now limited to `40001`/`40P01`/`55P03` and only
before `COMMIT`** — a `COMMIT` that fails with a lost connection may have committed, so retrying it was a double write
of money. `transaction({ callback, actor })` sets `app.current_user_id` for the RLS work in `API-P2-9`, and
`poolStats()` exposes `totalCount`/`idleCount`/`waitingCount`. `DB_ACQUIRE_TIMEOUT` and `DB_PRIMARY_POOL_MAX` are read
now; `DB_REPLICA_POOL_MAX` was deleted because nothing routes to a replica. Covered by
`apps/core-api/test/integration/db-pool.integration-spec.ts`.

**The rule this establishes: no network I/O inside a DB transaction.** A retry re-runs the whole callback.

**Known behaviour:** when the server kills a pooled connection, the next query that picks up that dead client
still fails once; the pool then discards it and the following query succeeds. `query()` deliberately does not
retry, because a connection can die *after* the server applied a write — retrying would double it. Callers that
need a retry do it at their own level.

**Still open (decisions and ops, not bug fixes).**
- **Scale out safely:** before more than two API instances, put **PgBouncer in transaction mode** in front.
  `SET LOCAL` is safe there. Connection budget: `max` per process × instances must stay under Postgres
  `max_connections`, and nothing enforces that.
- **Replicas:** `getReadConnection()` exists but delegates to the primary. Either route it to a replica or drop it.
- **Transaction hooks:** an `afterCommit(fn)` hook on the transaction adapter, if a caller ever needs one.
- **Monitoring:** feed `poolStats()` into `/metrics` (`API-P2-6`).

**Verify.**
- [ ] k6 load test at N concurrent users: `waitingCount` stays near 0 and p95 is stable.

### PKG-P2-2 · No background jobs, scheduler, or CPU offloading; add `@common/tasks`

**Problem.** The only background work is a `setInterval` outbox poller running in every API instance.
- **Nowhere for recurring work:** there's no place for reconciliation, relay, retention, drift checks, settlement
  batches or exports.
- **Nothing for CPU-heavy work:** `sharp` and `argon2` share libuv's default pool of 4 threads, and pure-JS CPU work
  would block the event loop.

**Solution.** A new package `packages/tasks` (`@common/tasks`) with three generic parts:

1. **Durable job queue in Postgres** (`jobs` table, claimed with `FOR UPDATE SKIP LOCKED`; pg-boss or graphile-worker
   are ready-made options).
   - **Why Postgres and not BullMQ/Redis:** a job can be **enqueued in the same DB transaction** as the business
     change, so work can't half-happen.
   - **API:** `enqueue({ name, payload, runAt?, dedupeKey?, adapter })`; `@TaskHandler({ name, maxAttempts, backoff })`;
     each attempt in its own transaction.
   - **Failure handling:** exponential retry, then `dead` (the job-level DLQ) with replay.
2. **Scheduler:** `@Scheduled({ cron, name })`. Each tick runs on one instance only (`pg_try_advisory_xact_lock`).
3. **CPU pool:** `CpuTaskRunner.run({ task, input })` on a `worker_threads` pool (piscina), sized
   `availableParallelism() - 1`, with a timeout and a queue limit, and task files registered by name.
   Set `UV_THREADPOOL_SIZE` explicitly (8–16).

Then add a **worker entry point** (`apps/core-api/src/main.worker.ts`), the same modules without HTTP, so API and
workers scale independently.

**Verify.**
- [ ] A job enqueued in a rolled-back transaction never runs; a committed one runs exactly once.
- [ ] Two worker instances: every cron fires once per tick.
- [ ] A 50k-row CSV export in the CPU pool keeps API p95 flat under load (measured before and after).
- [ ] A job failing `maxAttempts` times is dead and can be replayed.

### PKG-P2-3 · One broker or two? *(needs a product decision)*

**Done 2026-09-23.** `apps/gateway` and `apps/services` were empty and are gone. `ClientIds.DEAFULT` is now `DEFAULT`
everywhere. `StorageService` no longer evicts with a bare `storage:file-urls:*`, which ran a Redis `SCAN` over the whole
keyspace and dropped **every** user's signed URLs whenever anyone uploaded or deleted a file: `@Cacheable` and
`@CacheEvict` now take an optional `scope`, the storage key becomes a key segment, and eviction matches only
`storage:file-urls:<that key>:*`. Covered by `packages/storage/src/testing/storage-cache.helper.spec.ts`.

**Still open.** Kafka (email, analytics, audit) plus RabbitMQ (notifications) are both fed by the one outbox relay
through `outbox_events.destination`. Decide whether one broker is enough: Kafka alone covers both, since per-key
ordering is what notifications need. Dropping RabbitMQ would also retire the retry/DLQ topology in `@common/rabbitmq`.

**Verify.**
- [ ] Whichever way it goes: build, typecheck, lint and tests pass, and nothing references the removed broker.

---

## P3 — Payment provider robustness (`packages/payment-provider`)

### PKG-P3-1 · Pick the provider by currency and capability, with failover

**Problem.** The caller names the provider explicitly, and the registry checks only capability. Adapters don't declare
currencies or countries, and when one PSP's circuit is open there's nothing to fall back to.

**Solution.**
- **Declare support:** adapters declare `supportedCurrencies` / `supportedCountries`.
- **Route:** `PaymentProviderRegistry.route({ capability, currency, exclude? })` returns candidates in configured priority.
- **Fail over:** only on **definite, retryable** failures (`CIRCUIT_OPEN`, `PROVIDER_DOWN` before sending). Never after `INDETERMINATE`.
- **Remember the choice:** store the chosen provider on the payment.

**Verify.**
- [ ] With a stub second adapter: circuit open on the first routes to the second, and an indeterminate result does not fail over.

### PKG-P3-2 · Adapter hardening

**Done 2026-09-23.**
- **Webhooks are parsed safely:** `parseRawPayload` returned `{}` for invalid JSON, so a malformed body became an
  empty event that looked successful. It now raises a `ProviderError` with `INVALID_REQUEST`, and anything that is not
  a JSON *object* (`[]`, `null`, `42`, a truncated body) is rejected too.
- **The dead method cache is gone:** `BasePaymentAdapter.paymentMethods` was an in-memory `Map` nothing ever wrote to,
  so `verifyPaymentMethod` always fell through to the not-found path anyway.
- **The contract suite grew:** it now covers malformed webhook bodies and every `ProviderErrorCategory`
  (retryable/indeterminate pairing). Writing it caught a real contract violation — the stub adapter built its promise
  with `Promise.resolve(this.simulateWebhook(dto))`, which throws **synchronously** out of a method typed
  `Promise<…>`, so a caller using `.catch()` would have crashed. The Stripe adapter already did this correctly with
  `Promise.resolve().then(...)`; the stub now matches.

**Still open.**
- **Customers:** `StripeMethodHelper.getOrCreateCustomer` still searches by email (not unique, can race) or creates a
  new guest customer per charge, and `resolveCustomerForCharge` swallows errors. Needs the `provider_customers` table
  (`API-P2-2`) before it can be fixed properly.
- **Limit each call:** a 20s timeout × 2 network retries still lets one call hang about 60s. Add a total deadline per
  operation and a bulkhead (max concurrent calls per PSP).
- **Share breaker state:** each instance has its own in-memory `CircuitBreaker`. Keep state in Redis if all instances
  should trip together.
- **Test the real sandbox:** one opt-in Stripe test-mode integration test, run nightly in CI.

**Verify.**
- [ ] Contract suite passes for Stripe and a stub adapter *(passing now)*; the nightly sandbox run is green.
