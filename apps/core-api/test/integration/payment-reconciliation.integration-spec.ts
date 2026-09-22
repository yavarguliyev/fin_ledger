import { setTimeout as sleep } from 'node:timers/promises';

import { DbHelper } from '../helpers/db.helper';

describe('Payment reconciliation', () => {
  const email = 'player18@seed.local';

  const staleDeposit = async (key: string, status: string, chargeId: string, amount: number): Promise<string> => {
    const [row] = await DbHelper.query<{ id: string }>({
      sql: `INSERT INTO payments (idempotency_key, user_id, wallet_id, type, amount_minor, currency, status, provider, provider_charge_id, created_at, updated_at)
            SELECT $2, u.id, w.id, 'DEPOSIT', $5, w.currency, $3::payment_status, 'stripe', $4, now() - interval '1 hour', now() - interval '1 hour'
            FROM users u JOIN wallets w ON w.user_id = u.id WHERE u.email = $1 RETURNING id`,
      params: [email, key, status, chargeId, amount]
    });
    return row?.id as string;
  };

  const state = async (paymentId: string): Promise<{ status: string; credits: number; failedEvents: number }> => {
    const [row] = await DbHelper.query<{ status: string; credits: number; failedEvents: number }>({
      sql: `SELECT p.status,
                   (SELECT count(*)::int FROM wallet_transactions w WHERE w.ledger_transaction_id = p.ledger_transaction_id) AS credits,
                   (SELECT count(*)::int FROM outbox_events o WHERE o.aggregate_id = p.id AND o.event_type = 'payment.failed') AS "failedEvents"
            FROM payments p WHERE p.id = $1`,
      params: [paymentId]
    });
    return row as { status: string; credits: number; failedEvents: number };
  };

  const balance = async (): Promise<number> => {
    const [row] = await DbHelper.query<{ balance: number }>({
      sql: 'SELECT w.available_balance_minor::int AS balance FROM wallets w JOIN users u ON u.id = w.user_id WHERE u.email = $1',
      params: [email]
    });
    return row?.balance ?? 0;
  };

  afterAll(async () => DbHelper.close());

  it('completes, fails or leaves open stale deposits according to the provider', async () => {
    const before = await balance();
    const charged = await staleDeposit('reconcile-charged', 'PROCESSING', 'pi_simulated_succeeded_reconcile', 2200);
    const declined = await staleDeposit('reconcile-declined', 'REQUIRES_ACTION', 'pi_simulated_failed_reconcile', 1100);
    const open = await staleDeposit('reconcile-open', 'PROCESSING', 'pi_still_open_reconcile', 900);

    const deadline = Date.now() + 20_000;
    while (Date.now() < deadline) {
      const [a, b] = await Promise.all([state(charged), state(declined)]);
      if (a.status === 'COMPLETED' && b.status === 'FAILED') break;
      await sleep(500);
    }

    await expect(state(charged)).resolves.toEqual({ status: 'COMPLETED', credits: 1, failedEvents: 0 });
    await expect(state(declined)).resolves.toEqual({ status: 'FAILED', credits: 0, failedEvents: 1 });
    await expect(state(open)).resolves.toEqual({ status: 'PROCESSING', credits: 0, failedEvents: 0 });
    await expect(balance()).resolves.toBe(before + 2200);
  }, 30_000);
});
