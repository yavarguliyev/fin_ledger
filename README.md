# Real-Time Financial Ledger & Payments Core (Monorepo)

##### A robust, scalable, and enterprise-grade financial ledger, multi-currency wallet, and real-time payments platform built with Domain-Driven Design (DDD) and NestJS architecture. Featuring immutable double-entry bookkeeping, transactional fund reservation, PostgreSQL row-level security, passkey and TOTP authentication, a transactional outbox over RabbitMQ and Kafka, a Postgres-backed job queue, flexible object storage (MinIO / AWS S3), real-time SSE notifications, interactive Swagger documentation, and comprehensive observability.

---

# 📖 Table of Contents

1. [Features](#-features)
2. [Architecture Overview](#-architecture-overview)
3. [How the Important Parts Work](#-how-the-important-parts-work)
4. [Security Model](#-security-model)
5. [Background Jobs & the Outbox Relay](#-background-jobs--the-outbox-relay)
6. [Database Migrations & Security Setup](#-database-migrations--security-setup)
7. [Key Technical Features](#-key-technical-features)
8. [Design Patterns](#-design-patterns)
9. [Principles](#-principles)
10. [Technologies](#-technologies)
11. [Getting Started](#-getting-started)
12. [Environment Configuration & .env Locations](#-environment-configuration--env-locations)
13. [RSA Key Generation (JWT Authentication)](#-rsa-key-generation-jwt-authentication)
14. [Project Structure](#-project-structure)
15. [API Documentation (Interactive Swagger)](#-api-documentation-interactive-swagger)
16. [Running the Application](#-running-the-application)
17. [Event-Driven Messaging (RabbitMQ & Kafka)](#-event-driven-messaging-rabbitmq--kafka)
18. [Usage](#-usage)
19. [Health Monitoring & Observability](#-health-monitoring--observability)
20. [Flexible Storage: Local MinIO to AWS S3](#-flexible-storage-local-minio-to-aws-s3)
21. [Testing & Validation](#-testing--validation)
22. [Enterprise Orchestration (Kubernetes & Docker)](#-enterprise-orchestration-kubernetes--docker)
23. [Observability (Prometheus & Grafana)](#-observability-prometheus--grafana)
24. [Contributing](#-contributing)
25. [License](#-license)

---

# ✨ Features

## User Management & Security

- **Complete User Lifecycle**: Registration, email verification, login, password reset, verified email change, profile management, and session invalidation.
- **Asymmetric RSA JWT Authentication**: Public/private RSA key-pair signature validation for stateless, high-security token verification (`JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY`), with short-lived access tokens and a rotating refresh cookie.
- **Passkeys (WebAuthn)**: Sign in with Face ID, a fingerprint, a security key or a password manager. Only a public key is stored — no biometric ever reaches the server. Includes cloned-authenticator detection and **step-up re-authentication** before a withdrawal, before attaching a payout destination, and before turning off two-factor.
- **Two-Factor Authentication (TOTP)**: Authenticator-app enrolment with encrypted secrets, single-use recovery codes, and a policy that can require 2FA for privileged roles.
- **Account Lockout & Device Tracking**: Failed-attempt lockout, per-device login history, and a shared-device report for administrators.
- **Row-Level Security**: PostgreSQL RLS is enforced in the database, not only in application code — see [Security Model](#-security-model).
- **Role-Based Access Control (RBAC)**: Fine-grained permissions across hierarchical roles (`user`, `moderator`, `admin`, `global_admin`).
- **Strict Data Validation**: Zod 4 contract validation across incoming HTTP payloads with `nestjs-zod`.

## Responsible Gambling Controls

- **Self-Exclusion**: A user can lock themselves out of betting and depositing for a chosen period; withdrawals stay open by design.
- **Deposit Limits**: Daily, weekly and monthly caps enforced against actual spend at deposit time.

## Double-Entry Financial Ledger

- **Immutable Financial Records**: Compliant double-entry bookkeeping (Assets, Liabilities, Equity, Revenue, Expense).
- **Balanced Transaction Invariance**: Every transaction enforces $\sum \text{Debits} = \sum \text{Credits}$ within atomic PostgreSQL transactions.
- **Auditability**: Complete audit trails for every ledger entry with account linkage and chronological sequence tracking.

## Multi-Currency Wallet & Betting Engine

- **Minor Currency Precision**: Balances stored as minor units (cents, satoshis) to eliminate IEEE 754 floating-point rounding errors.
- **Two-Phase Fund Management**: Real-time balance isolation between `available` and `reserved` funds.
- **Betting & Winnings Settlement**: Atomically reserve stake on bet placement and settle winnings/forfeitures upon game event resolution.
- **Currency Conversion (FX)**: Real-time foreign exchange conversion and historical rate ledger tracking.

## Event-Driven & Async Architecture

- **Transactional Outbox**: Every domain event is written to `outbox_events` **inside the transaction that owns the state change**, then published by a relay. Each row carries a `destination` (`KAFKA` or `RABBITMQ`), so one relay feeds both brokers with no dual-write window.
- **Postgres-Backed Job Queue**: `@common/tasks` claims work with `FOR UPDATE SKIP LOCKED`, retries with exponential backoff, and serialises recurring schedules across instances with `pg_try_advisory_xact_lock`.
- **Real-Time Analytics Streaming**: Kafka event pipelines stream financial operations and game events for downstream analytics in ClickHouse.
- **Live Notifications (SSE)**: Server-Sent Events stream instant balance updates, security alerts, and transaction statuses directly to connected clients.

## Shared Contracts

- **One Source of Truth for Shapes**: `@common/contracts` holds a Zod definition per domain object. The API and the Angular client both derive their types from it, so renaming a field breaks **both** typechecks instead of silently breaking the UI.

## Flexible Storage & Observability

- **Pluggable Object Storage**: Unified `@aws-sdk/client-s3` storage strategy supporting local **MinIO** for development and **AWS S3** / Cloudflare R2 for production.
- **Interactive Swagger Documentation**: Built-in OpenAPI explorer at `http://localhost:3000/api-docs` with Bearer token authorization.
- **Full Observability Stack**: Prometheus metrics endpoint (`/api/metrics`) and pre-configured Grafana dashboards.

---

# 🏗 Architecture Overview

The system is a **Domain-Driven Design (DDD) modular monolith** with an **event-driven transactional outbox**. One
codebase runs as two kinds of process — the **API** (HTTP and live streams) and the **worker** (background jobs) — and
both share the same PostgreSQL database, which is the single source of truth for money.

Three ideas carry most of the weight:

| Idea | In one sentence | Why it is there |
| :--- | :--- | :--- |
| **Double-entry ledger** | Every movement writes balanced debit and credit rows that are never updated or deleted. | Money cannot be created or destroyed by a bug; the books can always be re-derived. |
| **Transactional outbox** | Events are written in the same transaction as the change, and a relay publishes them afterwards. | A message can never describe a change that rolled back, and a change can never fail to produce its message. |
| **Row-level security** | The database itself decides which rows an account can see. | A forgotten `WHERE` clause returns nothing instead of leaking another customer's data. |

## The big picture

```mermaid
flowchart LR
    Browser["📱 Angular client"]
    Peer["📱 Other participant"]

    subgraph App["Core API (NestJS)"]
        API["🧠 API process<br/>REST · live streams"]
        Worker["⚙️ Worker process<br/>jobs · outbox relay · consumers"]
    end

    subgraph Data["Data"]
        DB[("💾 PostgreSQL<br/>ledger · state · outbox · jobs")]
        Redis[("⚡ Redis<br/>sessions · presence · rate limits")]
        Files[("🗄️ MinIO / S3<br/>images · attachments · recordings")]
    end

    subgraph Messaging["Messaging"]
        Rabbit["🐰 RabbitMQ<br/>notifications"]
        Kafka["📨 Kafka<br/>email · audit · analytics"]
    end

    PSP["💳 Payment providers (PSPs)<br/>one adapter per provider"]

    Browser <-->|REST + SSE| API
    Browser -.->|"calls: peer-to-peer WebRTC"| Peer
    API --> DB
    API --> Redis
    API --> Files
    API <--> PSP
    Worker --> DB
    Worker --> Rabbit
    Worker --> Kafka
    Rabbit --> Worker
    Kafka --> Worker
```

**How to read it:**
- The **browser** only talks to the API: REST for actions, one Server-Sent Events stream per feature for live updates.
- The **API** never publishes to a broker. It writes events into PostgreSQL, and the **worker** relays them.
- **Calls** carry audio and video directly between the two browsers; the API only passes the setup messages.
- **Payments** go through a provider-agnostic layer (`@common/payment-provider`): each PSP is an adapter behind the
  same interface, with routing and failover between them. Stripe is the first adapter; more can be added without
  changing the payment flows.
- **Monitoring** (not drawn): Prometheus scrapes `/metrics`, Grafana shows it. ClickHouse runs in the dev stack but is
  not fed yet — see `PROJECT-BACKLOG.md` (`NEW-P2-7`, `NEW-P2-8`).

> [!NOTE]
> Today the API process also runs the background jobs, so a single process is enough locally. Splitting them so that
> only the worker does background work is planned (`SCALE-1` in `PROJECT-BACKLOG.md`).

## Inside the API

```mermaid
flowchart LR
    Req["HTTP request"] --> Guard["🛡️ Guards<br/>session · roles · rate limit"]
    Guard --> Ctrl["🚪 Controller<br/>validates the DTO"]
    Ctrl --> Svc["📮 Module service<br/>one line, delegates"]
    Svc --> UC["🧠 Use case<br/>the business rules"]
    UC --> Repo["🗃️ Repository"]
    Repo --> DB[("💾 PostgreSQL<br/>RLS enforced")]
```

Every request takes the same path: guards check who you are, the controller validates input, the module service hands
it to one **use case**, and only the use case contains business logic. Repositories are the only code that writes SQL.

---

# 🧩 How the Important Parts Work

Each flow below covers one part of the application, in as few steps as possible.

## 1. Signing in and staying signed in

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as 📱 Client
    participant API as 🧠 API
    participant Redis as ⚡ Redis

    User->>Client: Email + password (or passkey)
    Client->>API: POST /auth/login
    API->>API: Check password (Argon2id), then 2FA if enabled
    API->>Redis: Create session
    API-->>Client: Short-lived access token + refresh cookie
    Note over Client,API: When the access token is about to expire, the client calls /auth/refresh with the cookie
    User->>Client: Log out
    Client->>API: POST /auth/logout
    API->>Redis: Delete session, mark the user offline
```

- **Access token:** RS256 JWT, short-lived, sent as `Authorization: Bearer`.
- **Refresh cookie:** `HttpOnly`, rotated on every refresh; reuse of an old one revokes every session of that user.
- **Admins and global admins** must set up two-factor before they can use the app.

## 2. Placing a bet (moving money)

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant API as 🧠 API
    participant DB as 💾 PostgreSQL

    User->>API: Place a $25 bet
    rect rgb(238, 246, 255)
        Note over API,DB: One database transaction
        API->>DB: Lock the wallet and check the balance
        API->>DB: Debit the wallet + write balanced ledger rows
        API->>DB: Write the event into outbox_events
    end
    API-->>User: ✅ Confirmed with the new balance
```

Everything in the shaded box commits together or not at all, so money and its event can never disagree. Notifications
and emails go out afterwards through the outbox (flow 5).

## 3. Deposits

```mermaid
flowchart LR
    A([Deposit request]) --> B{Allowed?<br/>limits · self-exclusion}
    B -->|No| X([Refused])
    B -->|Yes| C[Create payment PENDING]
    C --> D[Charge the provider]
    D -->|Paid| E([Credit wallet + ledger + event<br/>in one transaction])
    D -->|Declined| F([FAILED])
    D -->|No answer| G([REQUIRES_ACTION<br/>reconciliation decides])
```

- Every deposit carries an **idempotency key**, so a double click or a retry charges once.
- An unclear answer from the provider is never treated as a failure; the reconciliation job asks the provider later.
- Card details never reach our servers: cards are added on the provider's own hosted page, and we keep only a token.

## 4. Withdrawals

```mermaid
flowchart LR
    A([Withdraw $50]) --> S{Passkey step-up<br/>if enabled}
    S --> B[Reserve $50<br/>available → reserved]
    B --> C[Ask the provider to pay out]
    C -->|Paid| D([Settle: money leaves])
    C -->|Declined| E([Release back to available])
    C -->|No answer| F([Keep reserved,<br/>reconciliation decides])
```

Money is **reserved first** and only leaves once the provider confirms, so a failed payout can always be undone.

## 5. Events: the outbox

```mermaid
flowchart LR
    T["Business transaction"] -->|same COMMIT| O[("📬 outbox_events")]
    O --> R["🔁 Relay<br/>(worker)"]
    R -->|notifications| Q["🐰 RabbitMQ"]
    R -->|email · audit · analytics| K["📨 Kafka"]
    Q --> N["Notification consumer → live stream"]
    K --> M["Email · audit · analytics consumers"]
```

Events are never published from a request. The relay picks up committed rows and publishes them; if a broker is down
the rows wait and are sent when it returns.

## 6. Live updates in the browser

```mermaid
sequenceDiagram
    autonumber
    participant Client as 📱 Client
    participant API as 🧠 API

    Client->>API: POST …/stream-ticket (with access token)
    API-->>Client: One-time ticket (30 seconds)
    Client->>API: GET …/stream?ticket=… (EventSource)
    API-->>Client: Events as they happen
    Note over Client,API: On disconnect the client reconnects with backoff and a new ticket
```

A short one-time ticket is used because `EventSource` cannot send an `Authorization` header. Notifications and the
support chat each have their own stream.

## 7. Support chat

```mermaid
sequenceDiagram
    autonumber
    actor Player
    participant API as 🧠 API
    participant DB as 💾 PostgreSQL
    participant Files as 🗄️ MinIO
    actor Staff

    Player->>API: Pick a staff member → open conversation
    Player->>API: Send text, files, a voice or a video message
    API->>Files: Store files (type checked from their bytes)
    API->>DB: Save the message
    API-->>Staff: Pushed live on the support stream
    Staff->>API: Open the conversation (mark read)
    API-->>Player: Pushed live: ticks turn blue
```

- Each player has a **separate private conversation per staff member**; other staff cannot read it.
- **Presence:** the app sends a heartbeat every 20 seconds; logging out shows "Last seen" immediately.
- **Edit** for 15 minutes; **delete for everyone** within 48 hours; **delete for me** at any time — own messages only.

## 8. Voice and video calls

```mermaid
sequenceDiagram
    autonumber
    actor Caller
    participant API as 🧠 API
    actor Callee

    Caller->>API: Start call (offer)
    API-->>Callee: Ringing (live stream)
    Callee->>API: Accept (answer)
    API-->>Caller: Answer
    Caller-->>Callee: Connection details exchanged through the API
    Note over Caller,Callee: Audio · video · screen share flow directly between the browsers
    Caller->>API: Hang up
    API-->>Callee: Call ended + "Voice call · 02:13" in the chat
```

The API only relays the setup; the media never passes through our servers. Calls work on the same network today;
across the internet they need STUN/TURN servers (`SUPPORT_ICE_SERVERS`, see `NEW-P1-1` in `PROJECT-BACKLOG.md`).

## 9. Background jobs

```mermaid
flowchart LR
    S["Scheduler<br/>(every N seconds)"] -->|enqueue| J[("💾 jobs table")]
    U["Any use case"] -->|enqueue| J
    J -->|"claim: FOR UPDATE SKIP LOCKED"| W["⚙️ Worker"]
    W -->|success| D([done])
    W -->|failure| B([retry with backoff, then park])
```

Recurring jobs: payment reconciliation, webhook replay, ledger integrity check, data retention. An advisory lock makes
sure each schedule runs once even with several instances.

## 10. Who can see which rows (row-level security)

```mermaid
flowchart LR
    R["User request"] --> A["app_api login<br/>RLS enforced"]
    A --> P{"Row belongs to<br/>this user? or staff?"}
    P -->|yes| OK([visible])
    P -->|no| NO([invisible])
    B["Background work<br/>RequestScope.runSystem"] --> W["app_worker login<br/>bypasses RLS"]
```

Requests run as `app_api`, which PostgreSQL limits to the user's own rows. Background work runs as `app_worker` and
must be wrapped in `RequestScope.runSystem(...)` — without it, it silently reads zero rows instead of leaking data.

---

# 🔐 Security Model

## Authentication Ladder

| Factor | Mechanism | Where it applies |
| :--- | :--- | :--- |
| **Password** | Argon2id hashes, per-account lockout after repeated failures | Every sign-in |
| **TOTP (2FA)** | Authenticator app, encrypted secret, single-use recovery codes | Optional; can be **required** by role policy |
| **Passkey (WebAuthn)** | Platform authenticator, security key or password manager | Sign in with no password at all |
| **Step-up** | A fresh passkey assertion, single-use, 5-minute TTL | Withdrawal · attaching a payout destination · disabling 2FA |

### Why passkeys and not a face scan

The biometric never leaves the device. The authenticator unlocks a private key locally and we verify a **signature**;
we store only a public key. Sending a face or fingerprint to the server would make us a controller of special-category
data (GDPR Article 9), a webcam face match is defeated by a photo without paid liveness, and a biometric cannot be
rotated — a leaked template is leaked for life. Passkeys are also phishing-resistant, which a TOTP code is not.

Step-up is off unless `PASSKEY_STEP_UP_ENABLED=true`, and a user who has registered no passkey is **never** blocked
from their own money by it.

## Row-Level Security

RLS is enforced by PostgreSQL, so a missing `WHERE user_id = …` in application code cannot leak another account's rows.

- **`app_api`** is `NOBYPASSRLS`. The adapter sets `app.current_user_id` per transaction, and every owner-scoped table
  has an owner policy plus a staff policy.
- **`app_worker`** bypasses RLS and is used only for background work.
- **Background work must run inside `RequestScope.runSystem(...)`** — jobs, Kafka and RabbitMQ handlers, the outbox
  relay, webhook ingestion and registration. Inside it, `PostgresService` hands back the worker connection. Forget the
  wrapper and the code reads **zero rows** rather than leaking them, which is the safe direction to fail.

Provision the two login roles once per database:

```bash
# Requires APP_WORKER_DB_USERNAME and APP_WORKER_DB_PASSWORD; DATABASE_URL must be an owner connection
npm run db:provision-roles
```

---

# ⚙️ Background Jobs & the Outbox Relay

Two separate mechanisms, often confused:

| | Transactional Outbox | Task Queue (`@common/tasks`) |
| :--- | :--- | :--- |
| **Table** | `outbox_events` | `jobs` |
| **Purpose** | Publish a domain event that *already happened* | Run work that should happen *later* |
| **Written** | Inside the transaction that owns the state change | By any caller, or on a recurring schedule |
| **Claimed by** | The relay, in publish order | Workers, via `FOR UPDATE SKIP LOCKED` |
| **On failure** | Retried until published | Exponential backoff, then parked |

```mermaid
sequenceDiagram
    autonumber
    participant Tx as 💾 Business Transaction
    participant Outbox as 📬 outbox_events
    participant Relay as 🔁 Outbox Relay
    participant Rabbit as 🐰 RabbitMQ
    participant Kafka as 📨 Kafka

    Tx->>Outbox: INSERT event (same COMMIT as the state change)
    Note over Tx,Outbox: Both commit together, or neither does
    Relay->>Outbox: Claim PENDING rows
    alt destination = RABBITMQ
        Relay->>Rabbit: Publish (notifications)
    else destination = KAFKA
        Relay->>Kafka: Publish (email, audit, analytics)
    end
    Relay->>Outbox: Mark PUBLISHED
```

### Rules the codebase relies on

- **Never do network I/O inside a database transaction.** A retry re-runs the whole callback.
- **Transaction retries are limited to `40001` / `40P01` / `55P03`, and only before `COMMIT`.** A `COMMIT` that fails
  with a lost connection may already have committed; retrying it would double-write money.
- **Write the event inside the transaction that owns the change** — never post-commit, never fire-and-forget.

### Recurring work

Scheduled jobs take a `pollMs` interval and are serialised across API instances with
`pg_try_advisory_xact_lock(hashtext(name))`, so running several instances does not run the same schedule several times.
Current schedules: outbox relay, webhook replay, payment reconciliation, and retention pruning.

---

# 🗄 Database Migrations & Security Setup

Migrations and database logins are the most security-sensitive commands in the project: they run as the database
**owner**, and they decide what the application is allowed to see. Run them in this order and with these settings.

## Which settings each command reads

| Command | Reads | Connects as |
| :--- | :--- | :--- |
| `npm run migrate:up` / `migrate:down` | root `.env` → `DATABASE_URL`, `DEMO_USER_PASSWORD` | the **owner** (`postgres` locally) |
| `npm run db:provision-roles` | `apps/core-api/.env` → `DATABASE_URL`, `DB_USERNAME`/`APP_API_DB_*`, `APP_WORKER_DB_*` | the **owner**, to create the two app logins |
| `npm run dev` (the app) | `apps/core-api/.env` → `DB_USERNAME`/`DB_PASSWORD`, `DB_WORKER_USERNAME`/`DB_WORKER_PASSWORD` | `app_api` for requests, `app_worker` for background work |

> [!IMPORTANT]
> `DB_USERNAME` in `apps/core-api/.env` must be the **API login** (`app_api`), never the owner. `db:provision-roles`
> refuses to run if it is the owner. `APP_WORKER_DB_*` (used to create the worker login) and `DB_WORKER_*` (used by
> the app to connect) must hold the same username and password.

## First-time setup, in order

```bash
npm run generate:keys        # 1. RSA key pair for signing tokens (keys/ is git-ignored)
npm run infra:up:dev         # 2. Start PostgreSQL, Redis, brokers, MinIO, monitoring
npm run migrate:up           # 3. Create every table, policy and trigger (runs as the owner)
npm run db:provision-roles   # 4. Create app_api (RLS enforced) and app_worker (bypasses RLS)
npm run dev                  # 5. Start the API and the client
```

Demo users are created by migration `014` **only** when the database name contains `distributed_db`, `test` or
`local`, and only if `DEMO_USER_PASSWORD` is set. Any other database name — staging or production — gets no demo data.

## Day-to-day migration commands

```bash
npm run migrate:create -- add-payout-currency   # new file in apps/core-api/migrations/
npm run migrate:up                              # apply every pending migration
npm run migrate:down                            # roll back the most recent migration only
```

Rules every migration follows:
- **Always a working `down`.** A migration that cannot be rolled back is not merged.
- **Never edit an applied migration.** Add a new one; the dev database and every environment already ran the old one.
- **Grant and protect new tables in the same migration:** `GRANT` to `app_readwrite` / `app_readonly`, `ENABLE ROW
  LEVEL SECURITY`, and an owner policy plus a staff policy for any table with user data.
- **Test up and down on a throwaway database** before applying it anywhere shared:

```bash
PW=$(grep '^DB_PASSWORD=' apps/core-api/.env | cut -d= -f2-)
docker exec ddd_postgres_db psql -U postgres -c "CREATE DATABASE scratch_test;"
DATABASE_URL="postgres://postgres:${PW}@127.0.0.1:54320/scratch_test" DEMO_USER_PASSWORD='ScratchPass123!' \
  npx node-pg-migrate up --migrations-dir apps/core-api/migrations
DATABASE_URL="postgres://postgres:${PW}@127.0.0.1:54320/scratch_test" \
  npx node-pg-migrate down --migrations-dir apps/core-api/migrations
docker exec ddd_postgres_db psql -U postgres -c "DROP DATABASE scratch_test;"
```

## Check that the security setup is right

```bash
docker exec ddd_postgres_db psql -U postgres -d distributed_db -c \
  "SELECT rolname, rolbypassrls, rolcanlogin FROM pg_roles WHERE rolname IN ('app_api', 'app_worker');"
```

Expected: `app_api` → `rolbypassrls = f`, `app_worker` → `rolbypassrls = t`, both can log in. If `app_api` can bypass
RLS, row-level security is not protecting anything.

## Production checklist

- Run migrations from the deployment pipeline (a one-off job before the new version starts), never by hand from a
  laptop, and take a backup first.
- The owner password, `app_api` and `app_worker` passwords and the JWT keys come from a secret store (Kubernetes
  Secrets, Vault, AWS Secrets Manager) — never from committed files.
- `DB_SSL=true`, a database name without `test`, `local` or `distributed_db` (so no demo data), and no
  `DEMO_USER_PASSWORD`.
- The application never connects as the owner; only migrations and `db:provision-roles` do.
- Rotate the JWT keys and database passwords on a schedule and whenever someone with access leaves.

---

# ⚙️ Key Technical Features

- **Domain-Driven Design (DDD)**: Clean domain models, bounded contexts, and separation of business rules from transport protocols.
- **Double-Entry Bookkeeping**: Strict adherence to formal accounting principles ensuring balanced journal entries.
- **Minor Currency Representation**: Storing monetary values as integers (`amountMinor`) to prevent floating-point truncation bugs.
- **Transactional Outbox Pattern**: Guaranteed event publishing without dual-write consistency issues, with per-row `destination` routing to Kafka or RabbitMQ.
- **Row-Level Security**: Ownership enforced in PostgreSQL, so a forgotten `WHERE` clause reads nothing rather than leaking.
- **Passkeys & Step-Up**: WebAuthn sign-in plus single-use re-authentication in front of the actions that move money.
- **Postgres-Backed Job Queue**: `FOR UPDATE SKIP LOCKED` claiming, exponential backoff, and advisory-lock scheduling across instances.
- **Server-Sent Events (SSE)**: Native real-time streaming endpoint at `/api/v1/notifications/stream`.
- **Asymmetric RSA Authentication**: Secure JWT signing with private RSA keys and public key verification.
- **Fine-Grained RBAC**: Multi-role security model protecting administrative and financial endpoints.
- **Idempotent Money Paths**: Client-supplied idempotency keys plus a webhook inbox, so a retry or a replayed webhook can never double-charge.
- **Interactive Swagger Documentation**: Automatically generated OpenAPI 3.0 schema and web test UI at `/api-docs`.
- **Automated Schema Migrations**: Version-controlled migrations via `node-pg-migrate`, every one with a working `down`.
- **Pre-commit Quality Checks (Husky)**: Automated linting, formatting, and type-checking across all monorepo workspaces.

---

# 🧩⚙️🛠️📐 Design Patterns

## 1. Domain-Driven Design (DDD) & Bounded Contexts
- Segregates complex business domains (`auth`, `users`, `wallets`, `ledger`, `payments`, `game-events`, `notifications`) into isolated, high-cohesion modules.

## 2. Repository Pattern
- Isolates persistence logic from domain services, enabling clean testing and storage decoupling.

## 3. Unit of Work & Transactional Isolation
- Encapsulates multi-table mutations (e.g., wallet balance update + ledger entries + transaction history) inside atomic database transactions.

## 4. Transactional Outbox Pattern
- Persists events to the database within the same transaction as state changes before publishing to message brokers.

## 5. Decorator Pattern
- Custom decorators (`@Roles()`, `@User()`, `@Public()`) enhance route handlers with declarative authorization and context injection.

## 6. Strategy Pattern (Storage & Notification)
- Pluggable storage provider interface supporting **MinIO** (local S3 emulator) and **AWS S3 / Cloudflare R2** via `S3StorageStrategy`.

## 7. Factory Pattern
- Dynamic instantiation of NestJS modules, database clients, and messaging connections across environments.

## 8. Circuit Breaker & Retry Strategy
- Resilient external service communication with exponential backoff for message consumers and external providers.

## 9. Migration Strategy Pattern
- Decouples database schema evolution from application deployments via versioned migration scripts.

## 10. Compensating Transactions (Explicit, Not Orchestrated)
- A payment spans the database **and** an outside provider, so it cannot be held in one transaction. Each failure is answered with a specific compensating action rather than a generic rollback: refund the charge, release the reservation, or park the payment as `REQUIRES_ACTION`.
- Compensation is written inline in `PaymentOperationHelper` where the failure happens. There is deliberately **no** workflow engine or step registry — the number of steps is small, and explicit handling makes it obvious what becomes of the money in every branch.
- Indeterminate provider results are never compensated automatically. They are parked for the reconciliation job, because undoing something that may not have happened is how money gets moved twice.

## 11. Idempotency & Inbox Pattern
- Money-moving requests carry a client idempotency key; a repeat returns the original payment instead of creating a second one.
- Inbound webhooks are recorded in a `webhook_inbox` keyed by provider and event id, so a provider re-sending an event changes nothing.

## 12. Row-Level Security as a Backstop
- Ownership is enforced by PostgreSQL policies, not only by application filters, so a missing predicate fails closed.

---

# 📏🧭💡⚖️ Principles

- **SOLID Principles**: Single responsibility, open-closed interfaces, and dependency inversion across all shared libraries.
- **DRY (Don't Repeat Yourself)**: Shared utilities, DTOs, domain models, and error filters unified in `@common/libs` and `@core/shared-libs`.
- **KISS (Keep It Simple, Stupid)**: Clean modular architecture avoiding unnecessary abstraction layers while preserving enterprise readiness.
- **Zero-Sum Ledger Invariance**: Total debits must equal total credits in all financial transactions ($\Delta \text{Assets} - \Delta \text{Liabilities} = \Delta \text{Equity}$).
- **ACID Financial Guarantees**: Strict atomicity and consistency for all monetary ledger updates.

---

# 💻 Technologies

- **Monorepo Management**: NPM Workspaces & Turborepo (`turbo`)
- **Backend Framework**: NestJS 12, Node.js (v22+), TypeScript 5.7+
- **Validation**: Zod 4 & `nestjs-zod`, with shared contracts in `@common/contracts`
- **Passwordless Authentication**: WebAuthn via `@simplewebauthn/server` and `@simplewebauthn/browser`
- **Two-Factor**: TOTP with encrypted secrets and single-use recovery codes
- **Integration Testing**: Testcontainers (Postgres, Redis, RabbitMQ, Kafka) against the built API
- **Frontend**: Angular 21 (Standalone Components), RxJS, Tailwind CSS
- **Primary Database**: PostgreSQL 16 (via `node-pg-migrate` & native client pool)
- **In-Memory Cache**: Redis 7
- **Message Broker**: RabbitMQ 3 (AMQP)
- **Event Streaming**: Apache Kafka (`kafkajs`)
- **OLAP Analytics**: ClickHouse
- **Object Storage**: MinIO (Local) / AWS S3 (Production) via `@aws-sdk/client-s3`
- **API Documentation**: Swagger / OpenAPI 3.0 (`@nestjs/swagger`)
- **Observability**: Prometheus & Grafana
- **Authentication**: Asymmetric RSA-256 JWT & Session Management

---

# 🚀 Getting Started

## 1. Prerequisites

- **Node.js**: v22.x or higher
- **npm**: v10.x or higher
- **Docker & Docker Compose**: For local infrastructure services
- **OpenSSL**: For generating RSA key pairs

## 2. Installation

```bash
# Clone the repository and install all workspace dependencies
npm install
# or
npm run install:all
```

## 3. Generate RSA Key Pairs for JWT

```bash
npm run generate:keys
```

*(See [RSA Key Generation](#-rsa-key-generation-jwt-authentication) for details on how keys are configured in `.env`).*

## 4. Setup Environment Files

Configure the environment files for migrations and the core API:

```bash
# 1. Root .env (Required for node-pg-migrate SQL migrations)
cp .env.example .env

# 2. Core API .env (Required for NestJS API runtime & JWT keys)
cp .env.example apps/core-api/.env
```

*(See [Environment Configuration & .env Locations](#-environment-configuration--env-locations) for the complete reference and Docker `.env`).*

## 5. Infrastructure Setup (Docker)

Start all local infrastructure services (PostgreSQL, Redis, RabbitMQ, Kafka, MinIO, ClickHouse, Prometheus, Grafana):

```bash
npm run infra:up:dev
```

## 6. Run Database Migrations

Execute database migrations to initialize tables, schemas, and extensions:

```bash
npm run migrate:up
```

## 7. Provision the Row-Level Security Roles

The API runs as a role that **cannot** bypass RLS, and background work runs as one that can. Create both once:

```bash
npm run db:provision-roles
```

This reads `APP_WORKER_DB_USERNAME` and `APP_WORKER_DB_PASSWORD`; without them, background work falls back to the API
role and RLS will block it — see [Security Model](#-security-model).

---

# 🔐 RSA Key Generation (JWT Authentication)

The system uses asymmetric **RSA (2048-bit)** key pairs to sign and verify JWT tokens. This ensures stateless and tamper-proof authentication across microservices.

### Automated Key Generation

Run the key generation script:

```bash
npm run generate:keys
```

This runs `scripts/generate-rsa-keys.sh`, which performs:
1. Generates an RSA private key: `keys/jwt-private.pem` via OpenSSL PKCS#8.
2. Extracts the RSA public key: `keys/jwt-public.pem`.
3. Outputs formatted, single-line strings with escaped `\n` ready for your `.env` file.

### Adding RSA Keys to `.env`

Add the generated keys to your root `.env` file:

```env
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----"

JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----"

JWT_EXPIRES_IN=7d
JWT_ISSUER=distributed-system
JWT_AUDIENCE=distributed-system-users
```

> [!IMPORTANT]
> - Never commit `keys/` or private keys into version control.
> - In production, store `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` in AWS Secrets Manager, HashiCorp Vault, or Kubernetes Secrets.

---

# ⚙️ Environment Configuration & .env Locations

The monorepo uses **three distinct `.env` files**, each serving a dedicated purpose in the system lifecycle:

```
/
├── .env                              # 1. Database Migrations (node-pg-migrate)
├── apps/
│   └── core-api/
│       └── .env                      # 2. NestJS Core API Runtime Configuration
└── infrastructure/
    └── dev/
        └── .env                      # 3. Docker Compose Infrastructure Services
```

---

### Summary of the 3 `.env` Locations

| Location | Exact File Path | Purpose | Loaded By |
| :--- | :--- | :--- | :--- |
| **1. Migrations** | `/.env` (Root) | Database credentials for executing SQL migrations | `node-pg-migrate` via `apps/core-api/database.json` (`npm run migrate:up`) |
| **2. Core API** | `/apps/core-api/.env` | Backend runtime settings, RSA JWT keys, Redis, RabbitMQ, Kafka, S3/MinIO | NestJS `@nestjs/config` & `@common/env` when starting the API (`npm run dev:api`) |
| **3. Docker / Infra** | `/infrastructure/dev/.env` | Service credentials, root passwords, and port bindings for Docker containers | Docker Compose (`infrastructure/dev/start.sh` / `docker-compose.yml`) |

---

### 1. Database Migrations `.env` (`/.env`)

**Path**: `/Users/yavarguliyev/Desktop/practice/projects/ddd/.env`

When you run `npm run migrate:up` or `npm run migrate:down`, `node-pg-migrate` reads from `apps/core-api/database.json`, which resolves environment variables from this root file:

```env
# Database Connection for SQL Migrations
DB_HOST=127.0.0.1
DB_PORT=54320
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=distributed_db
DB_NAME=distributed_db
DB_SSL=false
DATABASE_URL=postgresql://postgres:password@127.0.0.1:54320/distributed_db
DB_CONNECTION_LIMIT=10
DB_MIN_LIMIT=2
DB_CONNECTION_TIMEOUT=5000
DB_ACQUIRE_TIMEOUT=5000
DB_PRIMARY_POOL_MAX=20
DB_REPLICA_POOL_MAX=10
```

---

### 2. NestJS Core API `.env` (`/apps/core-api/.env`)

**Path**: `/Users/yavarguliyev/Desktop/practice/projects/ddd/apps/core-api/.env`

Used during runtime by the NestJS API application for business logic, caching, authentication, messaging, and storage:

```env
# Server & Environment
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database Pool (PostgreSQL)
DB_HOST=127.0.0.1
DB_PORT=54320
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=distributed_db
DB_NAME=distributed_db
DB_SSL=false
DATABASE_URL=postgresql://postgres:password@127.0.0.1:54320/distributed_db

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=my_secure_password

# RabbitMQ Message Broker
RABBITMQ_URL=amqp://ddd_user:ddd_pass@localhost:5672

# Kafka Event Streaming
KAFKA_BROKERS=127.0.0.1:9092
KAFKA_CLIENT_ID=fin-ledger-api

# Asymmetric RSA JWT Keys (Generated via npm run generate:keys)
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
JWT_EXPIRES_IN=7d
JWT_ISSUER=distributed-system
JWT_AUDIENCE=distributed-system-users

# Storage Strategy (MinIO local or AWS S3 cloud)
STORAGE_STRATEGY=s3
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_ACCESS_KEY=minio_admin
STORAGE_SECRET_KEY=minio_password
STORAGE_BUCKET_NAME=fin-ledger-storage
STORAGE_REGION=us-east-1
STORAGE_FORCE_PATH_STYLE=true

# Row-Level Security: the login background work uses (bypasses RLS)
DB_WORKER_USERNAME=app_worker
DB_WORKER_PASSWORD=worker_password

# Two-Factor (TOTP). 32 random bytes, base64; rotating it invalidates every enrolled secret
MFA_ENCRYPTION_KEY=
MFA_ISSUER=Wallet

# Passkeys. Both default from FRONTEND_URL, so local development needs neither
PASSKEY_RP_NAME=Wallet
PASSKEY_RP_ID=localhost
PASSKEY_ORIGIN=http://localhost:4200
# Ask for the passkey again before a withdrawal, a payout change or disabling 2FA
PASSKEY_STEP_UP_ENABLED=false

# Payment providers (PSPs). Each provider adapter has its own credentials; Stripe is the first adapter.
# With no provider credentials, set this to run without a live provider
PAYMENT_SIMULATION=true
# Stripe adapter
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=
```

> [!WARNING]
> `PAYMENT_SIMULATION=true` is refused in production. If a provider's credentials **are** present they are used, so a
> development run with real keys will call that provider's live API.

> [!NOTE]
> `npm run db:provision-roles` reads `APP_WORKER_DB_USERNAME` / `APP_WORKER_DB_PASSWORD` (it creates the role), while
> the running API reads `DB_WORKER_USERNAME` / `DB_WORKER_PASSWORD` (it connects as the role). Set both pairs to the
> same values.

---

### 3. Docker Infrastructure `.env` (`/infrastructure/dev/.env`)

**Path**: `/Users/yavarguliyev/Desktop/practice/projects/ddd/infrastructure/dev/.env`

Automatically created by `infrastructure/dev/start.sh` if not present. Controls the local containerized services:

```env
# PostgreSQL Container
DB_HOST=127.0.0.1
DB_PORT=54320
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=distributed_db
DB_NAME=distributed_db

# Redis Container
REDIS_PORT=6379
REDIS_PASSWORD=my_secure_password

# RabbitMQ Container
RABBITMQ_DEFAULT_USER=ddd_user
RABBITMQ_DEFAULT_PASS=ddd_pass

# Kafka Container
KAFKA_BROKER_PORT=9092
KAFKA_ADVERTISED_HOST=127.0.0.1

# MinIO Container
MINIO_ROOT_USER=minio_admin
MINIO_ROOT_PASSWORD=minio_password

# ClickHouse & Grafana
CLICKHOUSE_DB=analytics
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=clickhouse_pass
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
```

---

# 📂 Project Structure

```bash
/
├── apps/
│   ├── core-api/                  # NestJS API Application & Domain Modules
│   │   ├── src/
│   │   │   ├── modules/           # Bounded contexts, each with dtos/ constants/ helpers/
│   │   │   │                      # interfaces/ repositories/ use-cases/{commands,queries}
│   │   │   ├── shared/            # Shared constants, helpers, and configurations
│   │   │   ├── app.module.ts      # Root NestJS application module
│   │   │   └── main.ts            # Application bootstrap & Swagger initialization
│   │   ├── test/                  # Unit specs and the Testcontainers integration suite
│   │   ├── migrations/            # node-pg-migrate SQL migrations (currently 026)
│   │   └── database.json          # Migration database connection configuration
│   └── client/                    # Angular 21 Standalone Frontend Application
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/          # Interceptors, guards, and singleton services
│       │   │   ├── features/      # Feature views (auth, dashboard, wallet, ledger, etc.)
│       │   │   └── shared/        # Reusable UI components (tables, modals, forms)
│       │   └── index.html         # Application entrypoint
├── packages/                      # Shared Monorepo Packages (NPM Workspaces)
│   ├── common/                    # @common/libs — aggregate barrel re-exporting the packages below
│   ├── contracts/                 # Zod domain shapes shared by the API and the Angular client
│   ├── database/                  # PostgreSQL pool, transactions, RLS-aware connection routing
│   ├── env/                       # Zod-validated environment schema
│   ├── kafka/                     # Kafka producer and consumer adapters
│   ├── mailer/                    # Transactional email adapter (NodeMailer / SMTP)
│   ├── mfa/                       # TOTP enrolment, verification and recovery codes
│   ├── payment-provider/          # Pluggable PSP adapters, routing, circuit breaker, bulkhead
│   ├── rabbitmq/                  # RabbitMQ publisher, consumer, retry and DLQ topology
│   ├── redis/                     # Redis caching and key-value client
│   ├── session/                   # RSA JWT authentication, SessionGuard, RolesGuard, RequestScope
│   ├── shared-libs/               # Shared DTOs, decorators, error filters, lifecycle and types
│   ├── sms/                       # Transactional SMS provider adapter
│   ├── storage/                   # Flexible S3/MinIO object storage provider
│   └── tasks/                     # Postgres-backed job queue, scheduler and CPU task runner
├── infrastructure/
│   ├── dev/                       # Local Docker Compose setup, Grafana, Prometheus
│   │   ├── docker-compose.yml     # Multi-container local infrastructure stack
│   │   ├── start.sh               # Idempotent startup and health-check script
│   │   ├── stop.sh                # Graceful service shutdown
│   │   ├── restart.sh             # Infrastructure restart
│   │   └── remove.sh              # Full cleanup of containers and volumes
│   └── infra/                     # Cloud / Kubernetes deployment manifests
├── keys/                          # Generated RSA Public/Private key pairs (.gitignore)
├── scripts/                       # Developer lifecycle scripts (dev, clean, keygen)
├── package.json                   # Root monorepo workspace configuration
├── turbo.json                     # Turborepo task pipeline configuration
└── tsconfig.base.json             # Root TypeScript compiler settings and path aliases
```

---

# 📚 API Documentation (Interactive Swagger)

The API includes comprehensive, real-time **Swagger (OpenAPI 3.0)** documentation.

## Accessing Swagger UI

Start the backend and navigate to:

👉 **`http://localhost:3000/api-docs`**

```
 ┌─────────────────────────────────────────────────────────────┐
 │                                                             │
 │   FinLedger Core API - Swagger OpenAPI Documentation        │
 │   http://localhost:3000/api-docs                            │
 │                                                             │
 └─────────────────────────────────────────────────────────────┘
```

## How to Authenticate in Swagger UI

1. **Register / Login**: Execute `POST /api/v1/auth/login` to obtain an access token.
2. **Authorize**: Click the **"Authorize" 🔓** button at the top right of the Swagger UI.
3. **Set Bearer Token**: Paste the token in the `Bearer <token>` format.
4. **Execute Requests**: All protected endpoints will now include the RSA-verified session token.

## Core API Endpoints

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Register a new user account |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate and obtain an RSA-signed JWT |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Exchange the refresh cookie for a new access token |
| **Auth** | `POST` | `/api/v1/auth/logout` · `/logout-all` | End this session, or every session |
| **Auth** | `GET` | `/api/v1/auth/session` | Current session and user |
| **Auth** | `POST` | `/api/v1/auth/forgot-password` · `/reset-password` | Password reset by single-use link |
| **Auth** | `POST` | `/api/v1/auth/change-password` · `/change-email` · `/confirm-email-change` | Verified credential changes |
| **2FA** | `GET` | `/api/v1/auth/mfa/status` | Whether TOTP is enabled or required |
| **2FA** | `POST` | `/api/v1/auth/mfa/setup` · `/enable` · `/disable` | Enrol, confirm or turn off TOTP |
| **2FA** | `POST` | `/api/v1/auth/mfa/recovery-codes` · `/verify` | Regenerate recovery codes · complete an MFA sign-in |
| **Passkeys** | `POST` | `/api/v1/auth/passkeys/register/options` · `/verify` | Register a passkey on this device |
| **Passkeys** | `POST` | `/api/v1/auth/passkeys/login/options` · `/verify` | Sign in with a passkey, no password |
| **Passkeys** | `POST` | `/api/v1/auth/passkeys/step-up/options` · `/verify` | Re-confirm before a sensitive action |
| **Passkeys** | `GET` `DELETE` | `/api/v1/auth/passkeys` · `/passkeys/:id` | List or remove registered passkeys |
| **Users** | `GET` `PATCH` | `/api/v1/users/me` · `/users` | Read or update the current profile |
| **Users** | `POST` `GET` `DELETE` | `/api/v1/users/upload` · `/users/images` | Profile images in object storage |
| **Users** | `GET` `PUT` | `/api/v1/users/me/deposit-limits` | Read or set daily / weekly / monthly caps |
| **Users** | `POST` | `/api/v1/users/me/self-exclusion` | Lock yourself out of betting and deposits |
| **Users** | `DELETE` `POST` | `/api/v1/users/:userId` · `/anonymize` · `/suspend` · `/reactivate` | Administrative lifecycle actions |
| **Wallets** | `GET` `POST` | `/api/v1/wallets` · `/wallets/currencies` · `/wallets/:walletId` | List, open and read wallets |
| **Wallets** | `PATCH` | `/api/v1/wallets/:walletId/status` | Change wallet status (staff) |
| **Wallet History** | `GET` | `/api/v1/wallets/:walletId/transactions` · `/bets` · `/summary` | Paginated history and totals |
| **Bets** | `POST` `GET` | `/api/v1/bets` · `/bets/:betId/settlement` | Place a bet (reserving the stake) and settle it |
| **Ledger** | `GET` | `/api/v1/ledger/accounts/:id` · `/accounts/:id/entries` | Account and its journal entries |
| **Ledger** | `GET` | `/api/v1/ledger/transactions/:id/entries` · `/ledger/integrity` | Entries of a transaction · balance-drift check |
| **Payments** | `POST` | `/api/v1/payments/deposit` · `/payments/withdraw` | Move money in or out (withdrawal may require step-up) |
| **Payments** | `GET` | `/api/v1/payments/:id` · `/payments/unresolved` | Payment status · anything still open |
| **Payment Methods** | `POST` | `/api/v1/payment-methods/:provider/session` · `/confirm` | Hosted setup; card details never reach us |
| **Payment Methods** | `GET` `DELETE` | `/api/v1/payment-methods` · `/:id` | List, read or remove a saved method |
| **Game Events** | `GET` `POST` `PATCH` | `/api/v1/game-events` · `/:eventId/status` · `/:eventId/result` | Fixture lifecycle and results |
| **Webhooks** | `POST` | `/api/v1/webhooks/:provider` | Ingest a provider webhook (idempotent) |
| **Notifications** | `GET` `PATCH` | `/api/v1/notifications` · `/:id/read` | List notifications, mark one read |
| **Notifications** | `POST` | `/api/v1/notifications/stream-ticket` | Short-lived ticket for the SSE stream |
| **Notifications** | `GET` | `/api/v1/notifications/stream` | **Server-Sent Events** real-time stream |
| **Audit** | `GET` | `/api/v1/audit` | Query the immutable audit log (staff) |
| **Admin** | `GET` | `/api/v1/admin/dashboard` · `/admin/shared-devices` | Operational overview · accounts sharing a device |
| **Metrics** | `GET` | `/api/metrics` | Prometheus metrics scraping endpoint |

---

# 🚀 Running the Application

### Development Mode (All Services)

Start both Backend API and Frontend Client concurrently:

```bash
npm run dev
```

### Individual Service Execution

```bash
# Start NestJS Core API (Port 3000)
npm run dev:api

# Start Angular Frontend Client (Port 4200)
npm run dev:client
```

### Production Build

```bash
# Build all monorepo packages and applications
npm run build

# Build specific applications
npm run build:api
npm run build:client
```

---

# 📨 Event-Driven Messaging (RabbitMQ & Kafka)

Both brokers are fed by the **same outbox relay**, chosen per event by the `destination` column: **RabbitMQ** carries
user-facing notifications, **Apache Kafka** carries email, audit and analytics streams.

```mermaid
graph LR
    API[🧠 NestJS Core] -->|"write in transaction"| Outbox[(📬 outbox_events)]
    Outbox --> Relay[🔁 Outbox Relay]
    Relay -->|RABBITMQ| Rabbit[🐰 Notifications]
    Relay -->|KAFKA| Kafka[📨 Email · Audit · Analytics]
    Kafka --> Consumers[⚙️ Email · audit · analytics consumers]
```

### Event Lifecycle:

1. **State Mutation**: A financial action occurs (e.g. bet placement, deposit).
2. **Transactional Outbox**: The state change and the event row are committed together in PostgreSQL.
3. **Relay**: A single relay claims pending rows in order and publishes each to the broker its `destination` names.
4. **Consumption**: Notification consumers fan out to SSE; Kafka consumers handle email, the audit trail and analytics.

> [!IMPORTANT]
> Every consumer runs inside `RequestScope.runSystem(...)`. Without it the handler uses the RLS-restricted API role and
> silently reads zero rows.

---

# 🛠 Usage

### 1. Placing a Bet

The stake is debited and the ledger rows written in a single transaction. The idempotency key makes a retry safe: send
the same key twice and you get the same bet back, not a second one.

```bash
curl -X POST http://localhost:3000/api/v1/bets \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": "8f1c…",
    "eventId": "3ab9…",
    "selection": "HOME",
    "stakeMinor": 2500,
    "idempotencyKey": "bet-2026-09-29-001"
  }'
```

### 2. Creating a Balanced Double-Entry Ledger Transaction

```typescript
// Enforces: Total Debits == Total Credits
const entries = await ledgerService.createTransaction([
  {
    accountId: 'acc_user_wallet_liability',
    entryType: EntryType.DEBIT,
    amountMinor: 5000,
    currency: 'USD'
  },
  {
    accountId: 'acc_house_revenue',
    entryType: EntryType.CREDIT,
    amountMinor: 5000,
    currency: 'USD'
  }
]);
```

### 3. Server-Sent Events (SSE) Client Consumption

`EventSource` cannot send an `Authorization` header, so the stream is opened with a **short-lived ticket** rather than
by putting the access token in the URL where it would end up in logs and browser history:

```typescript
// 1. Exchange the session for a single-use, short-lived stream ticket
const { ticket } = await fetch('/api/v1/notifications/stream-ticket', {
  method: 'POST',
  headers: { Authorization: `Bearer ${accessToken}` }
}).then(response => response.json());

// 2. Open the stream with the ticket
const eventSource = new EventSource(`/api/v1/notifications/stream?ticket=${encodeURIComponent(ticket)}`);

eventSource.onmessage = event => {
  const notification = JSON.parse(event.data);
  logger.log('Real-Time Notification:', notification);
};

// 3. Reconnect on drop — the client re-requests a ticket rather than reusing the old one
eventSource.onerror = () => eventSource.close();
```

---

# 🗄 Flexible Storage: Local MinIO to AWS S3

The application uses an S3-compatible abstraction layer (`@aws-sdk/client-s3`) via `S3StorageStrategy`. You can switch between local **MinIO** and **AWS S3** simply by modifying environment variables.

### Local Development (MinIO)

In local Docker environments, MinIO acts as an S3 drop-in emulator:

```env
STORAGE_STRATEGY=s3
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_ACCESS_KEY=minio_admin
STORAGE_SECRET_KEY=minio_password
STORAGE_BUCKET_NAME=fin-ledger-storage
STORAGE_REGION=us-east-1
STORAGE_FORCE_PATH_STYLE=true
```

- **MinIO API**: `http://localhost:9000`
- **MinIO Web Console**: `http://localhost:9001` (User: `minio_admin` / Pass: `minio_password`)

### Production (AWS S3 / Cloudflare R2)

To migrate to AWS S3, omit `STORAGE_ENDPOINT` (or point to Cloudflare R2) and set `STORAGE_FORCE_PATH_STYLE=false`:

```env
STORAGE_STRATEGY=s3
STORAGE_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
STORAGE_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
STORAGE_BUCKET_NAME=production-fin-ledger-bucket
STORAGE_REGION=eu-central-1
STORAGE_FORCE_PATH_STYLE=false
```

---

# 🏥 Health Monitoring & Observability

The platform includes built-in health monitoring and metrics aggregation.

### Endpoints

- **Liveness & Readiness**: Integrated health checks for database and cache connectivity.
- **Prometheus Metrics**: Scrape endpoint at `/api/metrics` exposing request durations, memory usage, active connections, and queue depths.

### Monitored Infrastructure Components:

- **PostgreSQL**: Connection pool health, query latency, active transactions.
- **Redis**: PING health, memory consumption, key evictions.
- **RabbitMQ**: Channel status, queue lengths, message consumption rates.
- **Kafka**: Producer readiness, consumer lag, topic partitioning.

---

# 🛡 Testing & Validation

Run quality checks across all workspaces using Turborepo:

```bash
# Run linting across all packages and apps
npm run lint

# Run TypeScript typechecks across all projects
npm run typecheck

# Run unit tests
npm run test

# Clean build artifacts and cache
npm run clean
```

> [!IMPORTANT]
> Always build with `npx turbo run build --concurrency=1`. `nest build` wipes `dist/` before writing, so parallel
> builds make dependents fail with phantom `Cannot find module '@common/…'` errors. A failure that disappears on
> re-run was this, not a real error.

### Integration Suite (Testcontainers)

The integration suite is black-box: it starts **real** PostgreSQL, Redis, RabbitMQ and Kafka containers, runs the
migrations and seed from zero, boots the **built** API, and drives it over HTTP.

```bash
npm run test:integration

# or, to target one spec
cd apps/core-api && TESTCONTAINERS_RYUK_PRIVILEGED=true NODE_OPTIONS=--experimental-vm-modules \
  npx jest --config jest.integration.config.js --runInBand --testPathPatterns "outbox-relay"
```

- `npm run build` must succeed first — the stack runs `dist/main.js`.
- The stack is fully isolated and provisions its own `app_api` and `app_worker` logins, so RLS is exercised for real.
- Current coverage: **214 tests across 43 suites**, plus the unit suites.

### Workspace-Specific Checks

```bash
# Typecheck API only
npm run typecheck -w apps/core-api

# Typecheck Angular Client only
npm run typecheck -w apps/client
```

---

# ☸️ Enterprise Orchestration (Kubernetes & Docker)

### Docker Compose Lifecycle Scripts

The development environment is controlled via modular management scripts:

```bash
# Start infrastructure and run health checks
npm run infra:up:dev

# Graceful stop
npm run infra:down:dev

# Restart services
npm run infra:restart:dev

# Teardown and prune volumes
npm run infra:rm:dev
```

### Service Endpoints Matrix

| Service | Local Endpoint | Port |
| :--- | :--- | :--- |
| **Angular Client** | `http://localhost:4200` | `4200` |
| **NestJS Core API** | `http://localhost:3000` | `3000` |
| **Swagger API Docs** | `http://localhost:3000/api-docs` | `3000` |
| **PostgreSQL** | `localhost:54320` | `54320` |
| **Redis** | `localhost:6379` | `6379` |
| **RabbitMQ Management** | `http://localhost:15672` | `15672` |
| **Kafka Broker** | `localhost:9092` | `9092` |
| **MinIO Console** | `http://localhost:9001` | `9001` |
| **ClickHouse HTTP** | `http://localhost:8123` | `8123` |
| **Prometheus UI** | `http://localhost:9090` | `9090` |
| **Grafana UI** | `http://localhost:3001` | `3001` |

---

# 📊 Observability (Prometheus & Grafana)

Comprehensive telemetry is integrated via Prometheus metrics collection and Grafana visualization.

### Grafana Dashboards
- **URL**: `http://localhost:3001`
- **Default Credentials**: `admin` / `admin`
- **Key Dashboards**: API Request Rate, Latency (p50/p95/p99), HTTP Error Rates, Database Connection Pool, RabbitMQ Queue Depth.

### Prometheus Query Engine
- **URL**: `http://localhost:9090`
- **Scrape Target**: Core API `/api/metrics`

---

# 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: add amazing feature'`).
4. Ensure all tests and typechecks pass (`npm run typecheck && npm run test`).
5. Push to the branch (`git push origin feature/amazing-feature`).
6. Open a Pull Request.

---

# 📝 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more details.
