import { setTimeout as sleep } from 'node:timers/promises';

import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';

describe('Payment reconciliation', () => {
  const email = 'player18@seed.local';

  const staleDeposit = async (key: string, status: string, chargeId: string | null, amount: number, ageHours = 1, attempts = 0): Promise<string> => {
    const [row] = await DbHelper.query<{ id: string }>({
      sql: `INSERT INTO payments (idempotency_key, user_id, wallet_id, type, amount_minor, currency, status, provider, provider_charge_id, created_at, updated_at, reconcile_attempts)
            SELECT $2, u.id, w.id, 'DEPOSIT', $5, w.currency, $3::payment_status, 'stripe', $4, now() - make_interval(hours => $6), now() - interval '1 hour', $7
            FROM users u JOIN wallets w ON w.user_id = u.id WHERE u.email = $1 RETURNING id`,
      params: [email, key, status, chargeId, amount, ageHours, attempts]
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

  it('fails stale deposits the provider never saw, found by our payment ID', async () => {
    const neverCharged = await staleDeposit('reconcile-never-charged', 'PENDING', null, 700);
    const timedOut = await staleDeposit('reconcile-timed-out', 'REQUIRES_ACTION', null, 800);

    const deadline = Date.now() + 20_000;

    while (Date.now() < deadline) {
      const [a, b] = await Promise.all([state(neverCharged), state(timedOut)]);
      if (a.status === 'FAILED' && b.status === 'FAILED') break;
      await sleep(500);
    }

    await expect(state(neverCharged)).resolves.toEqual({ status: 'FAILED', credits: 0, failedEvents: 1 });
    await expect(state(timedOut)).resolves.toEqual({ status: 'FAILED', credits: 0, failedEvents: 1 });

    await expect(
      DbHelper.query({ sql: 'SELECT DISTINCT failure_code FROM payments WHERE id = ANY($1)', params: [[neverCharged, timedOut]] })
    ).resolves.toEqual([{ failure_code: 'NOT_FOUND_AT_PROVIDER' }]);
  }, 30_000);

  it('cancels and fails a 3-D Secure deposit the customer abandoned, but keeps a recent one open', async () => {
    const abandoned = await staleDeposit('reconcile-abandoned-3ds', 'REQUIRES_ACTION', 'pi_simulated_requires_action_old', 600, 48);
    const recent = await staleDeposit('reconcile-recent-3ds', 'REQUIRES_ACTION', 'pi_simulated_requires_action_new', 650);

    const deadline = Date.now() + 20_000;
    while ((await state(abandoned)).status !== 'FAILED' && Date.now() < deadline) await sleep(500);

    await expect(state(abandoned)).resolves.toEqual({ status: 'FAILED', credits: 0, failedEvents: 1 });
    await expect(DbHelper.query({ sql: 'SELECT failure_code FROM payments WHERE id = $1', params: [abandoned] })).resolves.toEqual([
      { failure_code: 'canceled' }
    ]);

    await expect(state(recent)).resolves.toEqual({ status: 'REQUIRES_ACTION', credits: 0, failedEvents: 0 });
  }, 30_000);

  it('flags a deposit the provider keeps reporting as open for manual review, and stops asking about it', async () => {
    const almost = await staleDeposit('reconcile-almost-flagged', 'PROCESSING', 'pi_still_open_almost', 500, 1, 19);
    const flagged = await staleDeposit('reconcile-flagged', 'PROCESSING', 'pi_still_open_flagged', 510, 1, 20);

    const attempts = async (paymentId: string): Promise<number | undefined> => {
      const [row] = await DbHelper.query<{ attempts: number }>({
        sql: 'SELECT reconcile_attempts AS attempts FROM payments WHERE id = $1',
        params: [paymentId]
      });
      return row?.attempts;
    };

    const deadline = Date.now() + 20_000;
    while ((await attempts(almost)) !== 20 && Date.now() < deadline) await sleep(500);

    await expect(attempts(almost)).resolves.toBe(20);
    await expect(attempts(flagged)).resolves.toBe(20);

    const admin = await ApiHelper.login({ email: 'admin@seed.local' });
    const review = await ApiHelper.request<Array<{ id: string; status: string }>>({ method: 'GET', path: '/payments/unresolved', token: admin });
    expect(review.status).toBe(200);
    expect(review.body.map(({ id }) => id)).toEqual(expect.arrayContaining([almost, flagged]));

    const player = await ApiHelper.login({ email });
    await expect(ApiHelper.request({ method: 'GET', path: '/payments/unresolved', token: player })).resolves.toMatchObject({ status: 403 });
  }, 40_000);
});
