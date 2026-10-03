import { READ_FRESHNESS } from '../constants/read-freshness.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { FreshBalanceRow, FreshChargeRow, FreshIdRow, FreshPayment, FreshWallet, FreshWalletRow } from '../interfaces/read-freshness.interface';

let token: string;

let wallet: FreshWalletRow;

beforeAll(async () => {
  token = await ApiHelper.login({ email: READ_FRESHNESS.EMAIL });
  [wallet] = (await DbHelper.query<FreshWalletRow>({ sql: READ_FRESHNESS.WALLET_SQL, params: [READ_FRESHNESS.EMAIL] })) as [FreshWalletRow];
});

afterAll(async () => DbHelper.close());

const readBalance = async (): Promise<number> => {
  const response = await ApiHelper.request<FreshWallet>({ method: 'GET', path: READ_FRESHNESS.WALLET_PATH(wallet.id), token });
  return Number(response.body.availableBalanceMinor);
};

const storedBalance = async (): Promise<number> => {
  const [row] = await DbHelper.query<FreshBalanceRow>({ sql: READ_FRESHNESS.BALANCE_SQL, params: [wallet.id] });
  return row?.balance ?? 0;
};

describe('Money reads right after writes', () => {
  it('shows the new balance immediately after a bet', async () => {
    await readBalance();

    const [event] = await DbHelper.query<FreshIdRow>({ sql: READ_FRESHNESS.OPEN_EVENT_SQL });

    const bet = await ApiHelper.request({
      method: 'POST',
      path: READ_FRESHNESS.BETS_PATH,
      token,
      body: {
        walletId: wallet.id,
        eventId: event?.id,
        selection: READ_FRESHNESS.SELECTION,
        stakeMinor: READ_FRESHNESS.STAKE_MINOR,
        idempotencyKey: READ_FRESHNESS.BET_KEY
      }
    });

    expect(bet).toMatchObject({ status: READ_FRESHNESS.CREATED });
    await expect(readBalance()).resolves.toBe(await storedBalance());
  });
});

describe('Money reads right after writes: payments', () => {
  it('shows a payment as completed immediately after the webhook', async () => {
    const [method] = await DbHelper.query<FreshIdRow>({ sql: READ_FRESHNESS.METHOD_SQL, params: [READ_FRESHNESS.EMAIL] });

    const deposit = await ApiHelper.request<FreshPayment>({
      method: 'POST',
      path: READ_FRESHNESS.DEPOSIT_PATH,
      token,
      body: { amountMinor: READ_FRESHNESS.DEPOSIT_MINOR, currency: wallet.currency, idempotencyKey: READ_FRESHNESS.DEPOSIT_KEY, paymentMethodId: method?.id }
    });

    expect(deposit).toMatchObject({ status: READ_FRESHNESS.CREATED, body: { status: READ_FRESHNESS.PROCESSING } });
    await expect(ApiHelper.request({ method: 'GET', path: READ_FRESHNESS.PAYMENT_PATH(deposit.body.id), token })).resolves.toMatchObject({
      body: { status: READ_FRESHNESS.PROCESSING }
    });

    const [payment] = await DbHelper.query<FreshChargeRow>({ sql: READ_FRESHNESS.CHARGE_SQL, params: [deposit.body.id] });

    await ApiHelper.request({
      method: 'POST',
      path: READ_FRESHNESS.WEBHOOK_PATH,
      body: { id: READ_FRESHNESS.WEBHOOK_EVENT_ID, type: READ_FRESHNESS.SUCCEEDED, data: { object: { id: payment?.provider_charge_id } } }
    });

    await expect(ApiHelper.request({ method: 'GET', path: READ_FRESHNESS.PAYMENT_PATH(deposit.body.id), token })).resolves.toMatchObject({
      body: { status: READ_FRESHNESS.COMPLETED }
    });

    await expect(readBalance()).resolves.toBe(await storedBalance());
  });
});

describe('Money reads right after writes: notifications', () => {
  it('lists a notification stored outside the API without waiting for a cache to expire', async () => {
    const listed = async (): Promise<string[]> => {
      const response = await ApiHelper.request<FreshIdRow[]>({ method: 'GET', path: READ_FRESHNESS.NOTIFICATIONS_PATH, token });
      return response.body.map(notification => notification.id);
    };

    const before = await listed();

    const [stored] = await DbHelper.query<FreshIdRow>({ sql: READ_FRESHNESS.NOTIFICATION_SQL, params: [READ_FRESHNESS.EMAIL] });

    expect(before).not.toContain(stored?.id);
    await expect(listed()).resolves.toContain(stored?.id);
  });
});
