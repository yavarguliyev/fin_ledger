# Real-Time Financial Ledger & Payments Core (Monorepo)

##### A robust, scalable, and enterprise-grade financial ledger, multi-currency wallet, and real-time payments platform built with Domain-Driven Design (DDD) and NestJS architecture. Featuring immutable double-entry bookkeeping, transactional fund reservation, event-driven messaging (RabbitMQ & Kafka), flexible object storage (MinIO / AWS S3), real-time SSE notifications, interactive Swagger documentation, and comprehensive observability.

---

# 📖 Table of Contents

1. [Features](#-features)
2. [Architecture Overview](#-architecture-overview)
3. [Interaction Flow in DDD and Architecture](#-interaction-flow-in-ddd-and-architecture)
4. [Key Technical Features](#-key-technical-features)
5. [Design Patterns](#-design-patterns)
6. [Principles](#-principles)
7. [Technologies](#-technologies)
8. [Getting Started](#-getting-started)
9. [Environment Configuration & .env Locations](#-environment-configuration--env-locations)
10. [RSA Key Generation (JWT Authentication)](#-rsa-key-generation-jwt-authentication)
11. [Project Structure](#-project-structure)
12. [API Documentation (Interactive Swagger)](#-api-documentation-interactive-swagger)
13. [Running the Application](#-running-the-application)
14. [Event-Driven Messaging (RabbitMQ & Kafka)](#-event-driven-messaging-rabbitmq--kafka)
15. [Usage](#-usage)
16. [Health Monitoring & Observability](#-health-monitoring--observability)
17. [Flexible Storage: Local MinIO to AWS S3](#-flexible-storage-local-minio-to-aws-s3)
18. [Testing & Validation](#-testing--validation)
19. [Enterprise Orchestration (Kubernetes & Docker)](#-enterprise-orchestration-kubernetes--docker)
20. [Observability (Prometheus & Grafana)](#-observability-prometheus--grafana)
21. [Contributing](#-contributing)
22. [License](#-license)

---

# ✨ Features

## User Management & Security

- **Complete User Lifecycle**: Registration, email verification, login, password reset, profile management, and session invalidation.
- **Asymmetric RSA JWT Authentication**: Public/private RSA key-pair signature validation for stateless, high-security token verification (`JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY`).
- **Role-Based Access Control (RBAC)**: Fine-grained permissions across hierarchical roles (`user`, `moderator`, `admin`, `global_admin`).
- **Strict Data Validation**: Zod-based contract validation across incoming HTTP payloads with `nestjs-zod`.

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

- **Transactional Outbox & Job Queues**: RabbitMQ handles asynchronous task distribution, payment webhooks, and background processing.
- **Real-Time Analytics Streaming**: Kafka event pipelines stream financial operations and game events for downstream analytics in ClickHouse.
- **Live Notifications (SSE)**: Server-Sent Events stream instant balance updates, security alerts, and transaction statuses directly to connected clients.

## Flexible Storage & Observability

- **Pluggable Object Storage**: Unified `@aws-sdk/client-s3` storage strategy supporting local **MinIO** for development and **AWS S3** / Cloudflare R2 for production.
- **Interactive Swagger Documentation**: Built-in OpenAPI explorer at `http://localhost:3000/api-docs` with Bearer token authorization.
- **Full Observability Stack**: Prometheus metrics endpoint (`/api/metrics`) and pre-configured Grafana dashboards.

---

# 🏗 Architecture Overview

The system implements a **Domain-Driven Design (DDD) Modular Monolith** combined with an **Event-Driven & Outbox** architecture.

```mermaid
graph TD
    Client["📱 Angular Client (Port 4200)"]
    API["🧠 NestJS Core API (Port 3000)"]
    DB[("💾 PostgreSQL 16 (Ledger & State)")]
    Redis[("⚡ Redis 7 (Cache & Sessions)")]
    Rabbit["🐰 RabbitMQ (Async Task Queue)"]
    Kafka["📨 Apache Kafka (Analytics Stream)"]
    Storage[("🗄️ Object Storage (MinIO / AWS S3)")]
    ClickHouse[("📊 ClickHouse (Analytics OLAP)")]
    Prometheus["📈 Prometheus (Metrics Engine)"]
    Grafana["🖥️ Grafana (Dashboards)"]

    Client <-->|REST API / SSE Streams| API
    API <-->|ACID Transactions| DB
    API <-->|Fast-Path Cache| Redis
    API -->|Publish Tasks| Rabbit
    API -->|Stream Events| Kafka
    API <-->|Uploads / Images| Storage
    Kafka --> ClickHouse
    API -->|Scrape /api/metrics| Prometheus
    Prometheus --> Grafana
```

---

# 🧩 Interaction Flow in DDD and Architecture

### How a Financial Transaction Works (In Plain English)

Think of the system like a modern digital bank: when a user clicks **"Place Bet"**, **"Deposit"**, or **"Transfer Funds"**, the platform ensures **instant response time** while guaranteeing that **not a single cent is ever lost or double-spent**.

---

### The 4-Step Money Movement Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 User / App
    participant API as 🧠 The Brain (NestJS API)
    participant Vault as 🔒 Secure Vault (PostgreSQL Database)
    participant Cache as ⚡ Fast Memory (Redis Cache)
    participant Streams as 📨 Background Engines (RabbitMQ & Kafka)

    User->>API: 1. "Place $50 Bet / Transfer"
    API->>Vault: 2. Lock balance & check funds
    Note over Vault: Move $50 from 'Available' to 'Reserved'<br/>Write balanced double-entry receipt
    API->>Cache: 3. Update cached balance
    API-->>User: 🚀 Instant "Success" & Updated Balance!
    
    par Background Work
        API->>Streams: 4. Dispatch background jobs & analytics
    end
```

---

### Why It Feels Instant & Never Loses Money

| Principle | What It Means | Why It Matters |
| :--- | :--- | :--- |
| ⚡ **Instant Response** | The user gets a green "Success" confirmation in milliseconds. | No spinning wheels or frozen interfaces; the UI stays fast and responsive. |
| 🔒 **No Double-Spending** | The system locks the user's balance row during the transaction. | A user cannot open two tabs and spend the same $50 balance twice at the exact same millisecond. |
| 📖 **Balanced Accounting** | Every movement creates an immutable **Debit** and **Credit** entry. | Money cannot be created or lost from thin air ($\sum \text{Debits} = \sum \text{Credits}$). |
| 🔄 **Guaranteed Background Tasks** | Heavy analytics, email receipts, and external webhooks run in background queues. | Complex background jobs never slow down the primary checkout or betting experience. |

---

### How the System Layers Work Together

1. **🚪 The Front Door (Request Layer)**
   - Checks security badges (RSA JWT tokens) and validates user inputs before anything touches the core database.
2. **🧠 The Business Brain (Domain & Application Layer)**
   - Enforces financial rules: checks if the wallet has enough funds, calculates currency conversions, and creates balanced accounting movements.
3. **⚙️ The Engine Room (Infrastructure Layer)**
   - **PostgreSQL**: Stores the permanent, tamper-proof financial ledger.
   - **Redis**: Keeps balances hot in memory for lightning-fast lookups.
   - **RabbitMQ & Kafka**: Handles background jobs, notifications, and analytics streaming without delaying the user.


---

# ⚙️ Key Technical Features

- **Domain-Driven Design (DDD)**: Clean domain models, bounded contexts, and separation of business rules from transport protocols.
- **Double-Entry Bookkeeping**: Strict adherence to formal accounting principles ensuring balanced journal entries.
- **Minor Currency Representation**: Storing monetary values as integers (`amountMinor`) to prevent floating-point truncation bugs.
- **Transactional Outbox Pattern**: Guaranteed event publishing without dual-write consistency issues.
- **Server-Sent Events (SSE)**: Native real-time streaming endpoint at `/api/v1/notifications/stream`.
- **Asymmetric RSA Authentication**: Secure JWT signing with private RSA keys and public key verification.
- **Fine-Grained RBAC**: Multi-role security model protecting administrative and financial endpoints.
- **Interactive Swagger Documentation**: Automatically generated OpenAPI 3.0 schema and web test UI at `/api-docs`.
- **Automated Schema Migrations**: Version-controlled migrations via `node-pg-migrate`.
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
- **Validation**: Zod & `nestjs-zod`
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
```

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
│   │   │   ├── modules/           # Bounded contexts (auth, wallet, ledger, payment, etc.)
│   │   │   ├── shared/            # Shared constants, helpers, and configurations
│   │   │   ├── app.module.ts      # Root NestJS application module
│   │   │   └── main.ts            # Application bootstrap & Swagger initialization
│   │   ├── migrations/            # node-pg-migrate SQL migrations
│   │   └── database.json          # Migration database connection configuration
│   └── client/                    # Angular 21 Standalone Frontend Application
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/          # Interceptors, guards, and singleton services
│       │   │   ├── features/      # Feature views (auth, dashboard, wallet, ledger, etc.)
│       │   │   └── shared/        # Reusable UI components (tables, modals, forms)
│       │   └── index.html         # Application entrypoint
├── packages/                      # Shared Monorepo Packages (NPM Workspaces)
│   ├── common/                    # Shared NestJS exports and infrastructure wiring
│   ├── database/                  # PostgreSQL pool and transactional query helpers
│   ├── email-provider/            # Transactional email adapter
│   ├── env/                       # Zod-validated environment schema
│   ├── kafka/                     # Kafka producer and consumer adapters
│   ├── rabbitmq/                  # RabbitMQ queue publisher and consumer
│   ├── redis/                     # Redis caching and key-value client
│   ├── session/                   # RSA JWT authentication, SessionGuard, and RolesGuard
│   ├── shared-libs/               # Shared DTOs, custom decorators, error filters, and types
│   └── storage/                   # Flexible S3/MinIO object storage provider
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
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate and obtain RSA-signed JWT |
| **Auth** | `POST` | `/api/v1/auth/forgot-password` | Request password reset token |
| **Auth** | `POST` | `/api/v1/auth/reset-password` | Reset password using verified token |
| **Auth** | `POST` | `/api/v1/auth/verify-email` | Confirm email address |
| **Users** | `GET` | `/api/v1/users` | List users with pagination (Admin/Moderator) |
| **Users** | `POST` | `/api/v1/users/images` | Upload user profile image to object storage |
| **Wallets** | `GET` | `/api/v1/wallets/:walletId` | Retrieve wallet balance (available & reserved) |
| **Wallets** | `POST` | `/api/v1/wallets/:walletId/bets` | Place bet and atomically reserve stake |
| **Wallets** | `POST` | `/api/v1/wallets/:walletId/winnings` | Settle bet winnings and credit wallet |
| **Wallets** | `POST` | `/api/v1/wallets/:walletId/credit` | Credit wallet balance |
| **Wallets** | `POST` | `/api/v1/wallets/:walletId/debit` | Debit wallet balance |
| **Wallets** | `POST` | `/api/v1/wallets/:walletId/reserve` | Lock funds into reserved balance |
| **Wallets** | `POST` | `/api/v1/wallets/:walletId/release` | Release reserved funds back to available |
| **Ledger** | `POST` | `/api/v1/ledger/accounts` | Create double-entry ledger account |
| **Ledger** | `POST` | `/api/v1/ledger/transactions` | Post multi-entry balanced transaction |
| **Ledger** | `GET` | `/api/v1/ledger/accounts/:id/entries` | Get paginated journal entries for account |
| **Payments** | `POST` | `/api/v1/payments/deposit` | Initiate deposit transaction |
| **Payments** | `POST` | `/api/v1/payments/withdraw` | Request fund withdrawal |
| **Payment Methods** | `GET` | `/api/v1/payment-methods` | List user payment methods |
| **Notifications** | `GET` | `/api/v1/notifications/stream` | **Server-Sent Events (SSE)** real-time stream |
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

The system leverages a hybrid messaging architecture: **RabbitMQ** for task execution / job queues, and **Apache Kafka** for high-throughput analytics event streaming.

```mermaid
graph LR
    API[🧠 NestJS Core] -->|Job Queue| Rabbit[🐰 RabbitMQ]
    API -->|Analytics Event| Kafka[📨 Apache Kafka]
    Rabbit --> Worker[⚙️ Background Task Workers]
    Kafka --> StreamConsumer[📊 ClickHouse Ingestion]
```

### Event Lifecycle:

1. **State Mutation**: A financial action occurs (e.g., bet placement, deposit).
2. **Transactional Outbox**: The state change and event payload are committed together in PostgreSQL.
3. **Queue Distribution**: RabbitMQ dispatches tasks (notifications, webhook callbacks) to worker consumers.
4. **Analytics Streaming**: Kafka streams immutable state change events (`wallet.credited`, `bet.placed`, `ledger.posted`) for real-time aggregation.

---

# 🛠 Usage

### 1. Placing a Bet & Reserving Funds

```typescript
// Reserve stake and update ledger atomically
const updatedWallet = await walletService.placeBet({
  walletId: 'w_123456',
  amountMinor: 2500, // $25.00
  gameId: 'game_789',
  betId: 'bet_999'
});

logger.log(`Available Balance: ${updatedWallet.balanceMinor}`);
logger.log(`Reserved Balance: ${updatedWallet.reservedBalanceMinor}`);
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

```typescript
const eventSource = new EventSource('/api/v1/notifications/stream', {
  withCredentials: true
});

eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  logger.log('Real-Time Notification:', notification);
};
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

# Run unit and integration tests
npm run test

# Clean build artifacts and cache
npm run clean
```

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
