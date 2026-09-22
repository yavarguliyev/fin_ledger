import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';

describe('Payment idempotency keys', () => {
  const players = ['player7@seed.local', 'player8@seed.local'];
  const methodIds: Record<string, string> = {};
  const tokens: Record<string, string> = {};

  beforeAll(async () => {
    for (const [index, email] of players.entries()) {
      const [method] = await DbHelper.query<{ id: string }>({
        sql: `INSERT INTO payment_methods (user_id, type, status, provider, provider_method_id, account_holder, last_four, card_brand, expiry_month, expiry_year, is_default, verified_at)
              SELECT id, 'CREDIT_CARD', 'VERIFIED', 'stripe', $2, display_name, '4242', 'visa', 12, 2034, true, now() FROM users WHERE email = $1 RETURNING id`,
        params: [email, `pm_integration_${index}`]
      });

      methodIds[email] = method?.id as string;
      tokens[email] = await ApiHelper.login({ email });
    }
  });

  afterAll(async () => DbHelper.close());

  const deposit = (email: string, idempotencyKey: string): Promise<{ status: number; body: { id: string; userId: string } }> =>
    ApiHelper.request({
      method: 'POST',
      path: '/payments/deposit',
      token: tokens[email] as string,
      body: { amountMinor: 1500, currency: 'USD', idempotencyKey, paymentMethodId: methodIds[email] }
    });

  it('keeps two users with the same client key apart, and a retry returns the original payment', async () => {
    const idempotencyKey = 'shared-client-key';
    const [first, second] = players as [string, string];

    const firstDeposit = await deposit(first, idempotencyKey);
    const secondDeposit = await deposit(second, idempotencyKey);
    const retry = await deposit(first, idempotencyKey);

    expect(firstDeposit.status).toBe(201);
    expect(secondDeposit.status).toBe(201);
    expect(secondDeposit.body.id).not.toBe(firstDeposit.body.id);
    expect(secondDeposit.body.userId).not.toBe(firstDeposit.body.userId);
    expect(retry.body.id).toBe(firstDeposit.body.id);

    await expect(DbHelper.query({ sql: 'SELECT count(*)::int AS count FROM payments WHERE idempotency_key = $1', params: [idempotencyKey] })).resolves.toEqual([{ count: 2 }]);
  });

  it('keeps the wallets and the ledger in agreement', async () => {
    await expect(DbHelper.query({ sql: 'SELECT count(*)::int AS count FROM v_wallet_ledger_drift' })).resolves.toEqual([{ count: 0 }]);
    await expect(DbHelper.query({ sql: 'SELECT count(*)::int AS count FROM v_ledger_balance_drift' })).resolves.toEqual([{ count: 0 }]);
  });
});
