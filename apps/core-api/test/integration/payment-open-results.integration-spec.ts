import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';

interface Deposit {
  id: string;
  status: string;
  clientSecret?: string;
}

describe('Deposits the provider has not settled yet', () => {
  const email = 'player24@seed.local';
  const cards = ['pm_card_threeDSecure2Required', 'pm_simulated_processing', 'pm_card_chargeDeclinedInsufficientFunds'] as const;
  const methodIds: Record<string, string> = {};

  let token: string;
  let wallet: { id: string; currency: string };

  const balance = async (): Promise<number> => {
    const [row] = await DbHelper.query<{ balance: number }>({
      sql: 'SELECT available_balance_minor::int AS balance FROM wallets WHERE id = $1',
      params: [wallet.id]
    });

    return row?.balance ?? 0;
  };

  const stored = async (paymentId: string): Promise<unknown> => {
    const [row] = await DbHelper.query({
      sql: 'SELECT status, failure_code, provider_charge_id IS NOT NULL AS has_charge_id, ledger_transaction_id IS NOT NULL AS credited FROM payments WHERE id = $1',
      params: [paymentId]
    });

    return row;
  };

  const deposit = (card: (typeof cards)[number], idempotencyKey: string): ReturnType<typeof ApiHelper.request<Deposit>> =>
    ApiHelper.request<Deposit>({
      method: 'POST',
      path: '/payments/deposit',
      token,
      body: { amountMinor: 3000, currency: wallet.currency, idempotencyKey, paymentMethodId: methodIds[card] }
    });

  beforeAll(async () => {
    [wallet] = (await DbHelper.query<{ id: string; currency: string }>({
      sql: 'SELECT id, currency FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = $1)',
      params: [email]
    })) as [{ id: string; currency: string }];

    for (const card of cards) {
      const [method] = await DbHelper.query<{ id: string }>({
        sql: `INSERT INTO payment_methods (user_id, type, status, provider, provider_method_id, account_holder, last_four, card_brand, expiry_month, expiry_year, is_default, verified_at)
              SELECT id, 'CREDIT_CARD', 'VERIFIED', 'stripe', $2, display_name, '4242', 'visa', 12, 2034, false, now() FROM users WHERE email = $1 RETURNING id`,
        params: [email, card]
      });

      methodIds[card] = method?.id as string;
    }

    token = await ApiHelper.login({ email });
  });

  afterAll(async () => DbHelper.close());

  it('keeps a 3-D Secure deposit open with a client secret, then completes it from the webhook', async () => {
    const before = await balance();
    const { status, body } = await deposit('pm_card_threeDSecure2Required', 'open-3ds');

    expect(status).toBe(201);
    expect(body).toMatchObject({ status: 'REQUIRES_ACTION', clientSecret: expect.stringContaining('_secret_') });

    await expect(stored(body.id)).resolves.toEqual({ status: 'REQUIRES_ACTION', failure_code: null, has_charge_id: true, credited: false });
    await expect(balance()).resolves.toBe(before);

    const [payment] = await DbHelper.query<{ provider_charge_id: string }>({
      sql: 'SELECT provider_charge_id FROM payments WHERE id = $1',
      params: [body.id]
    });

    await ApiHelper.request({
      method: 'POST',
      path: '/webhooks/stripe',
      body: { id: `evt_open_3ds_${Date.now()}`, type: 'payment_intent.succeeded', data: { object: { id: payment?.provider_charge_id } } }
    });

    await expect(stored(body.id)).resolves.toMatchObject({ status: 'COMPLETED', credited: true });
    await expect(balance()).resolves.toBe(before + 3000);
  });

  it('keeps a processing deposit open without crediting it', async () => {
    const { status, body } = await deposit('pm_simulated_processing', 'open-processing');

    expect(status).toBe(201);
    await expect(stored(body.id)).resolves.toEqual({ status: 'PROCESSING', failure_code: null, has_charge_id: true, credited: false });
  });

  it('fails a declined deposit with the decline code and moves no money', async () => {
    const before = await balance();
    const { status } = await deposit('pm_card_chargeDeclinedInsufficientFunds', 'open-declined');

    expect(status).toBe(400);

    const [payment] = await DbHelper.query<{ status: string; failure_code: string }>({
      sql: "SELECT status, failure_code FROM payments WHERE idempotency_key = 'open-declined'"
    });

    expect(payment).toEqual({ status: 'FAILED', failure_code: 'insufficient_funds' });
    await expect(balance()).resolves.toBe(before);
  });
});
