import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';

interface Wallet {
  id: string;
  currency: string;
  balance: number;
}

describe('Payment completion', () => {
  const email = 'player23@seed.local';
  let token: string;
  let methodId: string;
  let wallet: Wallet;

  const balance = async (): Promise<number> => {
    const [row] = await DbHelper.query<{ balance: number }>({ sql: 'SELECT available_balance_minor::int AS balance FROM wallets WHERE id = $1', params: [wallet.id] });
    return row?.balance ?? 0;
  };

  const records = async (paymentId: string): Promise<unknown> => {
    const [row] = await DbHelper.query({
      sql: `SELECT p.status,
                   (SELECT count(*)::int FROM wallet_transactions w WHERE w.ledger_transaction_id = p.ledger_transaction_id) AS wallet_transactions,
                   (SELECT count(*)::int FROM ledger_entries e WHERE e.transaction_id = p.ledger_transaction_id) AS ledger_entries,
                   (SELECT count(*)::int FROM outbox_events o WHERE o.aggregate_id = p.id AND o.event_type = 'payment.completed') AS completed_events,
                   (SELECT count(*)::int FROM outbox_events o WHERE o.aggregate_id = p.id AND o.event_type = 'payment.failed') AS failed_events
            FROM payments p WHERE p.id = $1`,
      params: [paymentId]
    });
    return row;
  };

  const webhook = (type: string, chargeId: string): ReturnType<typeof ApiHelper.request> =>
    ApiHelper.request({ method: 'POST', path: '/webhooks/stripe', body: { id: `evt_${ApiHelper.randomIp()}_${Date.now()}`, type, data: { object: { id: chargeId } } } });

  const oneCompletion = { status: 'COMPLETED', wallet_transactions: 1, ledger_entries: 2, completed_events: 1, failed_events: 0 };

  beforeAll(async () => {
    [wallet] = (await DbHelper.query<Wallet>({
      sql: 'SELECT id, currency, available_balance_minor::int AS balance FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = $1)',
      params: [email]
    })) as [Wallet];

    const [method] = await DbHelper.query<{ id: string }>({
      sql: `INSERT INTO payment_methods (user_id, type, status, provider, provider_method_id, account_holder, last_four, card_brand, expiry_month, expiry_year, is_default, verified_at)
            SELECT id, 'CREDIT_CARD', 'VERIFIED', 'stripe', 'pm_integration_completion', display_name, '4242', 'visa', 12, 2034, true, now() FROM users WHERE email = $1 RETURNING id`,
      params: [email]
    });

    methodId = method?.id as string;
    token = await ApiHelper.login({ email });
  });

  afterAll(async () => DbHelper.close());

  it('completes a deposit once, with one credit, one ledger pair and one event, even when the webhook replays', async () => {
    const before = await balance();
    const deposit = await ApiHelper.request<{ id: string; providerChargeId: string }>({
      method: 'POST',
      path: '/payments/deposit',
      token,
      body: { amountMinor: 2500, currency: wallet.currency, idempotencyKey: 'completion-sync', paymentMethodId: methodId }
    });

    expect(deposit.status).toBe(201);
    await webhook('payment_intent.succeeded', deposit.body.providerChargeId);
    await webhook('payment_intent.succeeded', deposit.body.providerChargeId);

    await expect(records(deposit.body.id)).resolves.toEqual(oneCompletion);
    await expect(balance()).resolves.toBe(before + 2500);
  });

  it('completes a processing deposit from the webhook exactly once', async () => {
    const [payment] = await DbHelper.query<{ id: string }>({
      sql: `INSERT INTO payments (idempotency_key, user_id, wallet_id, payment_method_id, type, amount_minor, currency, status, provider, provider_charge_id)
            VALUES ('completion-webhook', (SELECT id FROM users WHERE email = $1), $2, $3, 'DEPOSIT', 4000, $4, 'PROCESSING', 'stripe', 'pi_integration_processing') RETURNING id`,
      params: [email, wallet.id, methodId, wallet.currency]
    });
    const before = await balance();

    await webhook('payment_intent.succeeded', 'pi_integration_processing');
    await webhook('payment_intent.succeeded', 'pi_integration_processing');

    await expect(records(payment?.id as string)).resolves.toEqual(oneCompletion);
    await expect(balance()).resolves.toBe(before + 4000);
  });

  it('ignores a late failure for a completed payment', async () => {
    const [payment] = await DbHelper.query<{ id: string; provider_charge_id: string }>({
      sql: "SELECT id, provider_charge_id FROM payments WHERE idempotency_key = 'completion-webhook'"
    });

    await webhook('payment_intent.payment_failed', payment?.provider_charge_id as string);

    await expect(records(payment?.id as string)).resolves.toEqual(oneCompletion);
  });

  it('keeps the wallets and the ledger in agreement', async () => {
    await expect(DbHelper.query({ sql: 'SELECT count(*)::int AS count FROM v_wallet_ledger_drift' })).resolves.toEqual([{ count: 0 }]);
    await expect(DbHelper.query({ sql: 'SELECT count(*)::int AS count FROM v_ledger_balance_drift' })).resolves.toEqual([{ count: 0 }]);
  });
});
