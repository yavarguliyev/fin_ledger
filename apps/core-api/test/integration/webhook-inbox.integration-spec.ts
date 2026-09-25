import { setTimeout as sleep } from 'node:timers/promises';

import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';

describe('Webhook inbox', () => {
  const email = 'player25@seed.local';
  const failingAmount = 777;

  const send = (id: string, type: string, paymentId?: string): ReturnType<typeof ApiHelper.request> =>
    ApiHelper.request({
      method: 'POST',
      path: '/webhooks/stripe',
      body: { id, type, data: { object: { id: `pi_${id}`, metadata: paymentId ? { paymentId } : {} } } }
    });

  const eventRow = async (eventId: string): Promise<unknown> => {
    const [row] = await DbHelper.query({
      sql: 'SELECT status, attempts, processed_at IS NOT NULL AS processed FROM webhook_events WHERE provider = $1 AND event_id = $2',
      params: ['stripe', eventId]
    });

    return row;
  };

  const paymentStatus = async (paymentId: string): Promise<string | undefined> => {
    const [row] = await DbHelper.query<{ status: string }>({ sql: 'SELECT status FROM payments WHERE id = $1', params: [paymentId] });
    return row?.status;
  };

  const pendingDeposit = async (amount: number, key: string): Promise<string> => {
    const [row] = await DbHelper.query<{ id: string }>({
      sql: `INSERT INTO payments (idempotency_key, user_id, wallet_id, type, amount_minor, currency, status, provider)
            SELECT $2, u.id, w.id, 'DEPOSIT', $3, w.currency, 'PENDING', 'stripe'
            FROM users u JOIN wallets w ON w.user_id = u.id WHERE u.email = $1 RETURNING id`,
      params: [email, key, amount]
    });

    return row?.id as string;
  };

  beforeAll(async () => {
    await DbHelper.query({
      sql: `CREATE OR REPLACE FUNCTION test_fail_wallet_transaction() RETURNS trigger AS $$
            BEGIN IF NEW.amount_minor = ${failingAmount} THEN RAISE EXCEPTION 'simulated crash while handling a webhook'; END IF; RETURN NEW; END $$ LANGUAGE plpgsql`
    });

    await DbHelper.query({
      sql: 'CREATE TRIGGER test_fail_wallet_transaction BEFORE INSERT ON wallet_transactions FOR EACH ROW EXECUTE FUNCTION test_fail_wallet_transaction()'
    });
  });

  afterAll(async () => {
    await DbHelper.query({ sql: 'DROP TRIGGER IF EXISTS test_fail_wallet_transaction ON wallet_transactions' });
    await DbHelper.query({ sql: 'DROP FUNCTION IF EXISTS test_fail_wallet_transaction()' });
    await DbHelper.close();
  });

  it('leaves a webhook whose handling failed retryable, and applies it once on redelivery', async () => {
    const paymentId = await pendingDeposit(failingAmount, 'inbox-crash');
    const failed = await send('evt_inbox_crash', 'payment_intent.succeeded', paymentId);

    expect(failed.status).toBe(500);

    await expect(eventRow('evt_inbox_crash')).resolves.toEqual({ status: 'RECEIVED', attempts: 1, processed: false });
    await expect(paymentStatus(paymentId)).resolves.toBe('PENDING');
    await DbHelper.query({ sql: 'DROP TRIGGER test_fail_wallet_transaction ON wallet_transactions' });
    await expect(send('evt_inbox_crash', 'payment_intent.succeeded', paymentId)).resolves.toMatchObject({ status: 200 });
    await expect(eventRow('evt_inbox_crash')).resolves.toEqual({ status: 'PROCESSED', attempts: 2, processed: true });
    await expect(paymentStatus(paymentId)).resolves.toBe('COMPLETED');
  });

  it('replays a webhook whose handling failed, without a redelivery', async () => {
    const paymentId = await pendingDeposit(failingAmount, 'inbox-replay');

    await DbHelper.query({
      sql: 'CREATE TRIGGER test_fail_wallet_transaction BEFORE INSERT ON wallet_transactions FOR EACH ROW EXECUTE FUNCTION test_fail_wallet_transaction()'
    });

    await expect(send('evt_inbox_replay', 'payment_intent.succeeded', paymentId)).resolves.toMatchObject({ status: 500 });
    await DbHelper.query({ sql: 'DROP TRIGGER test_fail_wallet_transaction ON wallet_transactions' });

    const deadline = Date.now() + 20_000;
    while ((await paymentStatus(paymentId)) !== 'COMPLETED' && Date.now() < deadline) await sleep(500);

    await expect(paymentStatus(paymentId)).resolves.toBe('COMPLETED');
    await expect(eventRow('evt_inbox_replay')).resolves.toEqual({ status: 'PROCESSED', attempts: 2, processed: true });
  }, 30_000);

  it('does not apply a processed webhook again', async () => {
    const paymentId = await pendingDeposit(900, 'inbox-duplicate');

    await send('evt_inbox_duplicate', 'payment_intent.succeeded', paymentId);
    await send('evt_inbox_duplicate', 'payment_intent.succeeded', paymentId);

    await expect(eventRow('evt_inbox_duplicate')).resolves.toEqual({ status: 'PROCESSED', attempts: 2, processed: true });
    await expect(
      DbHelper.query({
        sql: 'SELECT count(*)::int AS count FROM wallet_transactions w JOIN payments p ON p.ledger_transaction_id = w.ledger_transaction_id WHERE p.id = $1',
        params: [paymentId]
      })
    ).resolves.toEqual([{ count: 1 }]);
  });

  it('marks event types we do not handle as ignored', async () => {
    await expect(send('evt_inbox_unhandled', 'customer.created')).resolves.toMatchObject({ status: 200 });
    await expect(eventRow('evt_inbox_unhandled')).resolves.toEqual({ status: 'IGNORED', attempts: 1, processed: false });
  });
});
