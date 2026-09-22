import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';

interface Wallet {
  id: string;
  availableBalanceMinor: number;
}

describe('Money reads right after writes', () => {
  const email = 'player2@seed.local';
  let token: string;
  let wallet: { id: string; currency: string };

  beforeAll(async () => {
    token = await ApiHelper.login({ email });
    [wallet] = (await DbHelper.query<{ id: string; currency: string }>({
      sql: 'SELECT w.id, w.currency FROM wallets w JOIN users u ON u.id = w.user_id WHERE u.email = $1',
      params: [email]
    })) as [{ id: string; currency: string }];
  });

  afterAll(async () => DbHelper.close());

  const readBalance = async (): Promise<number> => {
    const response = await ApiHelper.request<Wallet>({ method: 'GET', path: `/wallets/${wallet.id}`, token });
    return Number(response.body.availableBalanceMinor);
  };

  const storedBalance = async (): Promise<number> => {
    const [row] = await DbHelper.query<{ balance: number }>({ sql: 'SELECT available_balance_minor::int AS balance FROM wallets WHERE id = $1', params: [wallet.id] });
    return row?.balance ?? 0;
  };

  it('shows the new balance immediately after a bet', async () => {
    await readBalance();

    const [event] = await DbHelper.query<{ id: string }>({
      sql: "SELECT id FROM game_events WHERE status = 'SCHEDULED' AND betting_closes_at > now() ORDER BY starts_at LIMIT 1"
    });
    const bet = await ApiHelper.request({
      method: 'POST',
      path: '/bets',
      token,
      body: { walletId: wallet.id, eventId: event?.id, selection: 'Away', stakeMinor: 300, idempotencyKey: 'freshness-bet' }
    });
    expect(bet).toMatchObject({ status: 201 });

    await expect(readBalance()).resolves.toBe(await storedBalance());
  });

  it('shows a payment as completed immediately after the webhook', async () => {
    const [method] = await DbHelper.query<{ id: string }>({
      sql: `INSERT INTO payment_methods (user_id, type, status, provider, provider_method_id, account_holder, last_four, card_brand, expiry_month, expiry_year, is_default, verified_at)
            SELECT id, 'CREDIT_CARD', 'VERIFIED', 'stripe', 'pm_simulated_processing_freshness', display_name, '4242', 'visa', 12, 2034, false, now() FROM users WHERE email = $1 RETURNING id`,
      params: [email]
    });
    const deposit = await ApiHelper.request<{ id: string; status: string }>({
      method: 'POST',
      path: '/payments/deposit',
      token,
      body: { amountMinor: 1800, currency: wallet.currency, idempotencyKey: 'freshness-deposit', paymentMethodId: method?.id }
    });
    expect(deposit).toMatchObject({ status: 201, body: { status: 'PROCESSING' } });
    await expect(ApiHelper.request({ method: 'GET', path: `/payments/${deposit.body.id}`, token })).resolves.toMatchObject({ body: { status: 'PROCESSING' } });

    const [payment] = await DbHelper.query<{ provider_charge_id: string }>({ sql: 'SELECT provider_charge_id FROM payments WHERE id = $1', params: [deposit.body.id] });
    await ApiHelper.request({
      method: 'POST',
      path: '/webhooks/stripe',
      body: { id: 'evt_freshness', type: 'payment_intent.succeeded', data: { object: { id: payment?.provider_charge_id } } }
    });

    await expect(ApiHelper.request({ method: 'GET', path: `/payments/${deposit.body.id}`, token })).resolves.toMatchObject({ body: { status: 'COMPLETED' } });
    await expect(readBalance()).resolves.toBe(await storedBalance());
  });
});
