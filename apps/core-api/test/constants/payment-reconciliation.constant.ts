import { HTTP_STATUS } from './http-status.constant';

export const PAYMENT_RECONCILIATION = {
  ...HTTP_STATUS,
  EMAIL: 'player18@realtime-wallet-payments.com',
  ADMIN_EMAIL: 'admin@realtime-wallet-payments.com',
  UNRESOLVED_PATH: '/payments/unresolved',
  DEADLINE_MS: 20_000,
  POLL_MS: 500,
  TIMEOUT_MS: 30_000,
  REVIEW_TIMEOUT_MS: 40_000,
  DEFAULT_AGE_HOURS: 1,
  MAX_ATTEMPTS: 20,
  CHARGED_MINOR: 2200,
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  COMPLETED_ONCE: { status: 'COMPLETED', credits: 1, failedEvents: 0 },
  FAILED_ONCE: { status: 'FAILED', credits: 0, failedEvents: 1 },
  STILL_PROCESSING: { status: 'PROCESSING', credits: 0, failedEvents: 0 },
  STILL_REQUIRES_ACTION: { status: 'REQUIRES_ACTION', credits: 0, failedEvents: 0 },
  NOT_FOUND_CODE: [{ failure_code: 'NOT_FOUND_AT_PROVIDER' }],
  CANCELED_CODE: [{ failure_code: 'canceled' }],
  STALE_DEPOSIT_SQL: `INSERT INTO payments (idempotency_key, user_id, wallet_id, type, amount_minor, currency, status, provider, provider_charge_id, created_at, updated_at, reconcile_attempts)
                      SELECT $2, u.id, w.id, 'DEPOSIT', $5, w.currency, $3, 'stripe', $4, now() - make_interval(hours => $6), now() - interval '1 hour', $7
                      FROM users u JOIN wallets w ON w.user_id = u.id WHERE u.email = $1 RETURNING id`,
  STATE_SQL: `SELECT p.status,
                     (SELECT count(*)::int FROM wallet_transactions w WHERE w.ledger_transaction_id = p.ledger_transaction_id) AS credits,
                     (SELECT count(*)::int FROM outbox_events o WHERE o.aggregate_id = p.id AND o.event_type = 'payment.failed') AS "failedEvents"
              FROM payments p WHERE p.id = $1`,
  BALANCE_SQL: 'SELECT w.available_balance_minor::int AS balance FROM wallets w JOIN users u ON u.id = w.user_id WHERE u.email = $1',
  DISTINCT_FAILURE_SQL: 'SELECT DISTINCT failure_code FROM payments WHERE id = ANY($1)',
  FAILURE_SQL: 'SELECT failure_code FROM payments WHERE id = $1',
  ATTEMPTS_SQL: 'SELECT reconcile_attempts AS attempts FROM payments WHERE id = $1',
  CHARGED: { key: 'reconcile-charged', status: 'PROCESSING', chargeId: 'pi_simulated_succeeded_reconcile', amount: 2200 },
  DECLINED: { key: 'reconcile-declined', status: 'REQUIRES_ACTION', chargeId: 'pi_simulated_failed_reconcile', amount: 1100 },
  OPEN: { key: 'reconcile-open', status: 'PROCESSING', chargeId: 'pi_still_open_reconcile', amount: 900 },
  NEVER_CHARGED: { key: 'reconcile-never-charged', status: 'PENDING', chargeId: null, amount: 700 },
  TIMED_OUT: { key: 'reconcile-timed-out', status: 'REQUIRES_ACTION', chargeId: null, amount: 800 },
  ABANDONED: { key: 'reconcile-abandoned-3ds', status: 'REQUIRES_ACTION', chargeId: 'pi_simulated_requires_action_old', amount: 600, ageHours: 48 },
  RECENT: { key: 'reconcile-recent-3ds', status: 'REQUIRES_ACTION', chargeId: 'pi_simulated_requires_action_new', amount: 650 },
  ALMOST: { key: 'reconcile-almost-flagged', status: 'PROCESSING', chargeId: 'pi_still_open_almost', amount: 500, attempts: 19 },
  FLAGGED: { key: 'reconcile-flagged', status: 'PROCESSING', chargeId: 'pi_still_open_flagged', amount: 510, attempts: 20 }
} as const;
