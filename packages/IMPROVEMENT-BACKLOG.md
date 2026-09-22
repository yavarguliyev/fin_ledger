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

### PKG-P1-1 · Failed RabbitMQ messages are dropped; there is no DLQ

**Problem.** `RabbitmqService.subscribe` binds an **exclusive, auto-named, non-durable** queue with no dead-letter setting.
- **Failed messages deleted:** `nack(msg, false, false)` deletes the message on a handler error.
- **Offline messages lost:** messages sent while the consumer is down are lost.
- **Unconnected DLX:** the `wallet.events.dlx` exchange is declared but nothing is bound to it.
- **No publisher confirms:** `publish()` can report success for messages the broker never stored.
- **No flow control or recovery:** no `prefetch`, and no reconnect.

**Solution.** Put the following in `@common/rabbitmq` so every consumer gets it for free:
- **Queues:**
  - one durable queue per consumer, `<service>.<purpose>`, with `x-dead-letter-exchange` → retry exchange;
  - retry queues `<queue>.retry` with growing `x-message-ttl` (5s → 30s → 5m) that dead-letter back to the main queue;
  - after `maxAttempts` (read from `x-death`), publish to `<queue>.dlq` and ack.
- **Publishing:** `createConfirmChannel()` plus `waitForConfirms()`.
- **Connections:** `prefetch(n)`, reconnect with backoff, and re-create the topology after reconnecting.
- **Operations:** admin/CLI to list, inspect and replay DLQ messages, plus a DLQ-depth metric.

**Verify.**
- [ ] A handler that always throws ends in `<queue>.dlq` after N attempts with growing delays.
- [ ] Messages published while the consumer is stopped are delivered when it starts.
- [ ] Restarting RabbitMQ mid-run: the service reconnects, and outbox events stay `PENDING` until confirmed.
- [ ] Replaying from the DLQ delivers the message once.

### PKG-P1-2 · Kafka consumers swallow errors, so failed messages are committed and lost

**Problem.** `KafkaConsumerService.handleMessage` catches and logs errors. kafkajs then commits the offset, so the
message is gone. If one handler for a topic fails, the ones after it are skipped. Emails, audit and analytics ride on this.

**Solution.**
- **Retry topics:** in-process retries, then `<topic>.retry` (delayed consumer), then `<topic>.dlq`, with error,
  attempt count and original offset in headers. Commit only after the message is handled or parked.
- **Isolated handlers:** each handler runs separately.
- **Deduplication:** consumers record `(consumer, message_id)` in `inbox_messages` (table in `API-P2-2`) so replays are harmless.

**Verify.**
- [ ] A throwing email handler: the message lands in `<topic>.dlq` with headers, and other handlers still run.
- [ ] Redelivering the same message doesn't send the email twice.

### PKG-P1-3 · The outbox relay can publish twice, and loses events after one failure

**Problem.**
- **Double publish:** `OutboxRepository.findPendingBatch` is a plain `SELECT … WHERE status='PENDING'` with no lock,
  so every API instance publishes the same rows.
- **Lost events:** `markFailed` sets `FAILED`, which is never retried, so one broker hiccup loses the event.
- **Unused retry columns:** `attempts`, `max_attempts`, `available_at`, `locked_by`, `locked_until` and `DEAD` are ignored.

**Solution.**
- **Claim rows atomically:**
  `UPDATE outbox_events SET locked_by=$me, locked_until=now()+'30s' WHERE id IN (SELECT id FROM outbox_events WHERE status='PENDING' AND available_at<=now() AND (locked_until IS NULL OR locked_until<now()) ORDER BY available_at, id LIMIT $n FOR UPDATE SKIP LOCKED) RETURNING *`
  (this matches `idx_outbox_events_dispatch`).
- **Retry with backoff:** on failure, `attempts+1`, `available_at=now()+backoff(attempts)`, `last_error`,
  and `DEAD` at `max_attempts`.
- **Run it in the worker:** the relay runs in the worker process (`PKG-P2-2`), not in every API replica.

**Verify.**
- [ ] Two relays at once publish each event exactly once.
- [ ] With the broker down, events stay `PENDING` with growing `available_at`, and they publish once it's back.
- [ ] An event failing `max_attempts` times ends `DEAD` and is visible for replay.

### PKG-P1-4 · `@KafkaPublish` is a dual write

**Problem.** Emails, analytics and audit use `@KafkaPublish`, which publishes **after the method returns, outside the
DB transaction**.
- **Lost events:** if Kafka is down, the event is lost after the DB committed.
- **Phantom events:** inside a transaction that later rolls back, an event goes out for a change that never happened.
- **Two paths:** notifications meanwhile go through the outbox to RabbitMQ.

**Solution.**
- **One path for domain events:** all domain events go through `outbox_events` with a `destination` column (added in
  `API-P2-2`), and the relay (`PKG-P1-3`) routes each event to Kafka or RabbitMQ.
- **Retire the decorator:** stop using `@KafkaPublish` for domain events. In core-api, switch the six usages to
  `outboxRepository.createEvent` inside the transaction.

**Verify.**
- [ ] With Kafka stopped, a password reset still sends its email after Kafka recovers.
- [ ] A rolled-back transaction produces no email, analytics or audit event.

### PKG-P1-5 · The mailer never sends email, and it logs every link

**Problem.** `MailerService.sendEmail` in `@common/mailer` only writes a log line. Registration verification, admin
invitations and password resets reach Kafka with a recipient (`to`, added 2026-09-22), but no email is ever
delivered. The log line includes the full URL, which carries a valid verification or reset token.

**Solution.** Add a transport behind a `MailTransport` interface (SMTP, SES or Resend: your choice), selected by
config, with a console transport for local development only. Log recipient and subject, never the URL. Retries and
dead-lettering come from `PKG-P1-2`.

**Verify.**
- [ ] Registering in a staging environment delivers the verification email to a real inbox.
- [ ] No log line contains a token.

---

## P2 — Connections, jobs, structure

### PKG-P2-1 · Database connection pool: missing safety settings, and no plan for more instances

**Problem.** Found in `database/src/modules/postgres/adapters/postgresql.adapter.ts`:
- **Pool errors crash the process:** there's no `pool.on('error')`, so an idle client losing its connection kills the process.
- **Broken connections go back to the pool:** if `ROLLBACK` throws, `client.release()` returns the broken client.
  It should be `release(err)`.
- **No timeouts:**
  - no `statement_timeout`, `idle_in_transaction_session_timeout` or `query_timeout`;
  - no `application_name`, `keepAlive` or `maxLifetimeSeconds`.
- **Risky retries:** `transactionWithRetry` retries connection-loss codes (`08xxx`) and `57014`. A `COMMIT` that fails
  with a lost connection **may have committed**, and retrying re-runs the callback. That's a double write of money.
  Retries also re-run any side effects inside the callback.
- **Unused config:** `DB_ACQUIRE_TIMEOUT`, `DB_PRIMARY_POOL_MAX` and `DB_REPLICA_POOL_MAX` are never read, and there's
  no read-replica routing.
- **Connection budget:** `max=10` per process × instances must stay under Postgres `max_connections` (default 100),
  and nothing enforces that.

**Solution.**
- **Handle pool errors:** `pool.on('error', log)`, and `release(err)` for broken clients.
- **Configure the pool:** set `options: '-c statement_timeout=5000 -c idle_in_transaction_session_timeout=10000'`,
  plus `application_name`, `keepAlive: true` and `maxLifetimeSeconds: 1800`, all env-configurable through `@common/env`.
- **Retry only safe errors:** `40001`/`40P01`/`55P03`, and only before `COMMIT`. Document the rule:
  **no network I/O inside a DB transaction**.
- **Actor-aware transactions:** `transaction({ callback, actor })` runs `set_config('app.current_user_id', …, true)`
  first (needed by `API-P0-5`).
- **Transaction hooks:** an `afterCommit(fn)` hook on the transaction adapter (needed by `API-P1-3`).
- **Scale out safely:** before more than two API instances, put **PgBouncer in transaction mode** in front.
  `SET LOCAL` is safe there.
- **Replicas:** add `getReadConnection()` with replica routing, or delete the three unused variables.
- **Monitoring:** pool gauges (`totalCount`, `idleCount`, `waitingCount`) for `/metrics`.

**Verify.**
- [ ] `pg_terminate_backend` on a pool connection doesn't crash the API, and the pool recovers.
- [ ] `SELECT pg_sleep(30)` is cancelled at the statement timeout.
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

### PKG-P2-3 · Structure cleanup

- **Two brokers.** Kafka (email, analytics, audit) plus RabbitMQ (notifications). After `PKG-P1-4`, decide whether one
  is enough: Kafka alone covers both, since per-key ordering is what notifications need.
- **Leftover folders.** `apps/gateway` and `apps/services` are empty. Delete them or give them a purpose.
- **Typo.** `ClientIds.DEAFULT` → `DEFAULT`.

**Verify.** Build, typecheck, lint and tests pass; nothing references removed names.

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

- **Customers:**
  - `StripeMethodHelper.getOrCreateCustomer` searches customers by email (not unique, can race) or creates a **new
    guest customer per charge**.
  - `resolveCustomerForCharge` swallows errors.
  - Fix: read and write `provider_customers` (table in `API-P2-2`) and let errors surface.
- **Limit each call:** a 20s timeout × 2 network retries means one call can hang about 60s. Add a total deadline per
  operation and a bulkhead (max concurrent calls per PSP).
- **Share breaker state:** each instance has its own in-memory `CircuitBreaker`. Keep state in Redis if all instances
  should trip together.
- **Parse webhooks safely:** `parseRawPayload` returns `{}` on invalid JSON. Reject instead (400, webhook recorded `FAILED`).
- **Remove the method cache:** `BasePaymentAdapter.paymentMethods` is an in-memory `Map` never filled in production.
  Remove it or make it an explicit test double.
- **Grow the contract suite:** `testing/provider-contract.ts` should cover status mapping, idempotency-key format,
  webhook signature failure and every `ProviderErrorCategory`, so every new PSP passes the same tests.
- **Test the real sandbox:** one opt-in Stripe test-mode integration test, run nightly in CI.

**Verify.** Contract suite passes for Stripe and a stub adapter; the nightly sandbox run is green.
