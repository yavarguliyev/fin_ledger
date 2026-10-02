# Context map

Status: checked against the code and the dev database on 2026-10-02 (migrations up to 032). This is the map the
module restructure (`API-P2-5`) and the boundary lint (`MS-2`) work from. When code moves, update this file in the
same change.

## Contexts

| Context | Purpose | Today's modules |
| --- | --- | --- |
| Identity and access | Accounts, sign-in, sessions, MFA, passkeys, devices | `auth`, `user` (profile, admin user management) |
| Wallet and ledger | Balances, double-entry ledger, wallet history | `wallet`, `wallet-transactions`, `ledger` |
| Payments | Deposits, withdrawals, payment methods, PSP customers, webhooks | `payment`, `payment-methods`, `webhook` |
| Betting | Game events and bets | `game-events`, `bet` |
| Customer engagement | Notifications, e-mail, support chat and calls | `notification`, `email`, `support` |
| Compliance | Audit trail, deposit limits, self-exclusion, KYC status | `audit`, parts of `user` (deposit limits, self-exclusion, anonymization) |
| Reporting and analytics | Analytics events today; exports and reports later (`DOC-*`) | `analytics` |
| Back office | Admin dashboards over the other contexts | `admin` |

Not a business context: **Platform** — `health`, `metrics`, `retention` and the shared packages (`@common/database`,
`@common/tasks`, `@common/kafka`, `@common/rabbitmq`, …). Platform owns only infrastructure tables.

## Table ownership

Each table has exactly one owner. "Also written by" lists code outside the owner that changes the table today; every
entry there is a boundary violation to remove during `API-P2-5`.

| Table | Owner | Also written by | Also read by |
| --- | --- | --- | --- |
| `users` | Identity and access | — | Support (names in chat, `support-sql`, `support-contact-sql`) |
| `user_credentials` | Identity and access | — | — |
| `auth_tokens` | Identity and access | — | — |
| `mfa_recovery_codes` | Identity and access | — | — |
| `user_devices` | Identity and access | — | — |
| `login_events` | Identity and access | — | — |
| `wallets` | Wallet and ledger | Compliance (anonymization closes wallets) | Compliance (anonymization) |
| `currencies` | Wallet and ledger | — | — |
| `wallet_transactions` | Wallet and ledger | — | — |
| `ledger_accounts` | Wallet and ledger | — | Compliance (anonymization) |
| `ledger_transactions` | Wallet and ledger | — | Compliance (anonymization) |
| `ledger_entries` | Wallet and ledger | — | — |
| `v_trial_balance`, `v_ledger_balance_drift`, `v_wallet_ledger_drift` (views) | Wallet and ledger | — | Platform (`metrics`) |
| `payments` | Payments | — | Compliance (deposit limits, anonymization) |
| `payment_status_history` | Payments | — | — |
| `payment_methods` | Payments | Compliance (anonymization removes methods) | Compliance (anonymization) |
| `provider_customers` | Payments | — | — |
| `webhook_events` | Payments | Platform (`retention` deletes old rows) | — |
| `game_events` | Betting | — | — |
| `bets` | Betting | — | Compliance (anonymization) |
| `notifications` | Customer engagement | Compliance (anonymization deletes them) | Compliance (anonymization) |
| `support_conversations` | Customer engagement | — | — |
| `support_messages` | Customer engagement | — | — |
| `support_hidden_messages` | Customer engagement | — | — |
| `support_read_receipts` | Customer engagement | — | — |
| `audit_log` | Compliance | — | Compliance |
| `deposit_limits` | Compliance | — | — |
| `outbox_events` | Platform (`@common/database`) | Platform (`retention`) | Platform (`metrics`) |
| `inbox_messages` | Platform (`@common/database`) | — | — |
| `jobs` | Platform (`@common/tasks`) | — | — |
| `pgmigrations` | Platform (migration tool) | — | — |

Compliance data that lives on another context's table: `users.kyc_status` and `users.self_exclusion_until` are
Compliance's, stored on Identity's `users` row. Either Compliance owns those columns through an Identity port, or
they move to a Compliance table during `API-P2-5`.

## Events

All events are written to `outbox_events` in the transaction that owns the change and relayed by the outbox relay.

| Event | Published by | Transport | Consumed by |
| --- | --- | --- | --- |
| `WALLET_CREDITED`, `WALLET_DEBITED` | Wallet and ledger | RabbitMQ | Customer engagement (notifications) |
| `analytics.wallet.credited`, `analytics.wallet.debited` | Wallet and ledger | Kafka | Reporting (`analytics`), Compliance (`audit`) |
| `PAYMENT_COMPLETED`, `PAYMENT_FAILED` | Payments | RabbitMQ | Customer engagement (notifications) |
| `analytics.payment.completed`, `analytics.payment.failed` | Payments | Kafka | Reporting (`analytics`), Compliance (`audit`) |
| `BET_SETTLED` | Betting | RabbitMQ | Customer engagement (notifications) |
| `USER_REGISTERED` | Identity and access | RabbitMQ | Customer engagement (notifications) |
| `email.user.*` (verification, password reset/changed, e-mail change, MFA, new device) | Identity and access | Kafka | Customer engagement (`email`) |
| `email.user.verification` (invitation), `email.user.self-exclusion-started` | Identity / Compliance (`user`) | Kafka | Customer engagement (`email`) |
| `audit.log.recorded` | Every context, through the `@Audited` HTTP interceptor | Kafka | Compliance (`audit`) |
| Support stream events (presence, messages, calls) | Customer engagement | In-process SSE | Browsers only |

## Calls that cross a boundary today

Direct imports between modules in different contexts. Imports of another module only to reuse its guards
(`AuthModule` for `SessionGuard`) are listed once at the end. Each line here should become a port (`MS-3`) or an event.

**Identity and access →**
- Wallet and ledger: `auth` calls `WalletService` and `LedgerService` (opening a wallet on registration); `user`
  imports `WalletModule` and `LedgerModule`.
- Customer engagement: `auth` and `user` use `EmailHelper` and the email step DTOs to queue e-mails; `auth` calls
  `LeavePresenceUseCase` from `support` on logout.

**Wallet and ledger →**
- Customer engagement: `wallet` imports `NotificationModule`.
- Reporting: `wallet` uses `AnalyticsEventPayloadDto` from `analytics`.
- Identity: `wallet-transactions` imports `AuthModule`.

**Payments →**
- Wallet and ledger: `payment` calls `WalletService` and uses `WalletHelper`, `WalletSummaryDto`,
  `WalletOperationResultDto`.
- Compliance: `payment` calls `AssertDepositAllowedUseCase` and `SelfExclusionHelper` from `user`.
- Identity: `payment` and `payment-methods` use `AuthRepository` and `PasskeyStepUpService`.

**Betting →**
- Wallet and ledger: `bet` calls `WalletService`, uses `WalletDto`.
- Compliance: `bet` uses `SelfExclusionHelper` from `user`.
- Identity: `bet` uses `AuthRepository`.

**Customer engagement →**
- Betting and Wallet: `notification` uses `BetSettledPayloadDto`, `BET_STATUS` and `WalletEventPayloadDto` to read
  event payloads (should come from `@common/contracts`).

**Compliance →**
- Identity: `user` uses `AuthTokenHelper`, `AuthTokenRepository`, `SessionUserDto`.
- Wallet, Payments, Betting, Customer engagement: anonymization (`user/constants/anonymization/user.constant.ts`) reads
  and writes their tables directly with SQL (see the ownership table).

**Back office →**
- Identity: `admin` uses `UserRepository`, `UserWithWalletDto`, `DeviceTrackerService`, `SharedDeviceDto`.
- Wallet and ledger: `admin` uses `WalletTransactionRepository`.

**Platform →**
- `metrics` imports `LedgerIntegrityJob` from `ledger` and the notification queue constant; `health` imports the
  notification queue constant.

**Guard-only imports of `AuthModule`:** `audit`, `bet`, `game-events`, `payment`, `payment-methods`,
`wallet-transactions`, `admin`. These go away once the guards live in a shared package.

Inside one context (not boundary crossings): `wallet → ledger`, `wallet → wallet-transactions`,
`wallet-transactions → wallet`, `ledger → wallet`, `bet → game-events`, `payment → payment-methods`,
`webhook → payment`, `webhook → payment-methods`, `user ↔ auth` for Identity work.
