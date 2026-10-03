import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';

interface HistoryRow {
  from_status: string | null;
  to_status: string;
  source: string;
}

const EMAIL = 'player24@realtime-wallet-payments.com';
const CHARGE_ID = 'pi_history_probe';
const IMMUTABLE = /immutable/i;

let paymentId: string;

const webhook = (type: string): ReturnType<typeof ApiHelper.request> =>
  ApiHelper.request({
    method: 'POST',
    path: '/webhooks/stripe',
    body: { id: `evt_history_${Date.now()}`, type, data: { object: { id: CHARGE_ID, metadata: {} } } }
  });

const history = (): Promise<HistoryRow[]> =>
  DbHelper.query<HistoryRow>({
    sql: 'SELECT from_status, to_status, source FROM payment_status_history WHERE payment_id = $1 ORDER BY created_at',
    params: [paymentId]
  });

beforeAll(async () => {
  const [method] = await DbHelper.query<{ id: string }>({
    sql: `INSERT INTO payment_methods (user_id, type, status, provider, provider_method_id, account_holder, last_four, card_brand, expiry_month, expiry_year, is_default, verified_at)
          SELECT id, 'CREDIT_CARD', 'VERIFIED', 'stripe', 'pm_history_probe', display_name, '4242', 'visa', 12, 2034, true, now() FROM users WHERE email = $1 RETURNING id`,
    params: [EMAIL]
  });

  const [payment] = await DbHelper.query<{ id: string }>({
    sql: `INSERT INTO payments (idempotency_key, user_id, wallet_id, payment_method_id, type, amount_minor, currency, status, provider, provider_charge_id)
          SELECT 'history-probe', u.id, w.id, $2, 'DEPOSIT', 3000, w.currency, 'PROCESSING', 'stripe', $3
          FROM users u JOIN wallets w ON w.user_id = u.id WHERE u.email = $1 RETURNING id`,
    params: [EMAIL, method?.id, CHARGE_ID]
  });

  paymentId = payment?.id as string;
});

afterAll(async () => DbHelper.close());

describe('Payment status history and financial immutability', () => {
  it('records the transition the state machine made, with the status it came from', async () => {
    await expect(webhook('payment_intent.succeeded')).resolves.toMatchObject({ status: 200 });

    const rows = await history();

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[rows.length - 1]).toMatchObject({ from_status: 'PROCESSING', to_status: 'COMPLETED' });
    expect(rows[rows.length - 1]?.source).toBeTruthy();
  });

  it('refuses to rewrite or erase a transition once it is recorded', async () => {
    await expect(
      DbHelper.query({ sql: "UPDATE payment_status_history SET to_status = 'FAILED' WHERE payment_id = $1", params: [paymentId] })
    ).rejects.toThrow();
    await expect(DbHelper.query({ sql: 'DELETE FROM payment_status_history WHERE payment_id = $1', params: [paymentId] })).rejects.toThrow();
  });

  it('refuses to change the amount of a wallet transaction that was already written', async () => {
    await expect(
      DbHelper.query({
        sql: 'UPDATE wallet_transactions SET amount_minor = amount_minor + 1 WHERE id = (SELECT id FROM wallet_transactions LIMIT 1)'
      })
    ).rejects.toThrow(IMMUTABLE);
  });

  it('still lets the status move, so a state machine is not blocked', async () => {
    const [row] = await DbHelper.query<{ id: string; status: string }>({ sql: 'SELECT id, status FROM wallet_transactions LIMIT 1' });

    await expect(
      DbHelper.query({ sql: 'UPDATE wallet_transactions SET status = $1 WHERE id = $2', params: [row?.status, row?.id] })
    ).resolves.toBeDefined();
  });

  it('no longer accepts the retired FAILED outbox status', async () => {
    await expect(
      DbHelper.query({
        sql: `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, aggregate_version, payload, status)
              VALUES ('Payment', $1, 'payment.completed', $2, '{}'::jsonb, 'FAILED')`,
        params: [paymentId, Date.now()]
      })
    ).rejects.toThrow();
  });
});
