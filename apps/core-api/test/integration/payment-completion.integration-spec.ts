import { PAYMENT_COMPLETION } from '../constants/payment-completion.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import {
  CompletionBalanceRow,
  CompletionChargeRow,
  CompletionDeposit,
  CompletionIdRow,
  CompletionPaymentDto,
  CompletionWallet,
  CompletionWebhookDto
} from '../interfaces/payment-completion.interface';

let token: string;

let methodId: string;

let wallet: CompletionWallet;

const balance = async (): Promise<number> => {
  const [row] = await DbHelper.query<CompletionBalanceRow>({ sql: PAYMENT_COMPLETION.BALANCE_SQL, params: [wallet.id] });
  return row?.balance ?? 0;
};

const records = async ({ paymentId }: CompletionPaymentDto): Promise<unknown> => {
  const [row] = await DbHelper.query({ sql: PAYMENT_COMPLETION.RECORDS_SQL, params: [paymentId] });
  return row;
};

const webhook = ({ type, chargeId, metadata = {} }: CompletionWebhookDto): ReturnType<typeof ApiHelper.request> =>
  ApiHelper.request({
    method: 'POST',
    path: PAYMENT_COMPLETION.WEBHOOK_PATH,
    body: { id: `${PAYMENT_COMPLETION.EVENT_PREFIX}${ApiHelper.randomIp()}_${Date.now()}`, type, data: { object: { id: chargeId, metadata } } }
  });

beforeAll(async () => {
  [wallet] = (await DbHelper.query<CompletionWallet>({ sql: PAYMENT_COMPLETION.WALLET_SQL, params: [PAYMENT_COMPLETION.EMAIL] })) as [CompletionWallet];

  const [method] = await DbHelper.query<CompletionIdRow>({ sql: PAYMENT_COMPLETION.METHOD_SQL, params: [PAYMENT_COMPLETION.EMAIL] });

  methodId = method?.id as string;
  token = await ApiHelper.login({ email: PAYMENT_COMPLETION.EMAIL });
});

afterAll(async () => DbHelper.close());

describe('Payment completion', () => {
  it('completes a deposit once, with one credit, one ledger pair and one event, even when the webhook replays', async () => {
    const before = await balance();
    const deposit = await ApiHelper.request<CompletionDeposit>({
      method: 'POST',
      path: PAYMENT_COMPLETION.DEPOSIT_PATH,
      token,
      body: { amountMinor: PAYMENT_COMPLETION.SYNC_MINOR, currency: wallet.currency, idempotencyKey: PAYMENT_COMPLETION.SYNC_KEY, paymentMethodId: methodId }
    });

    expect(deposit.status).toBe(PAYMENT_COMPLETION.CREATED);

    await webhook({ type: PAYMENT_COMPLETION.SUCCEEDED, chargeId: deposit.body.providerChargeId });
    await webhook({ type: PAYMENT_COMPLETION.SUCCEEDED, chargeId: deposit.body.providerChargeId });

    await expect(records({ paymentId: deposit.body.id })).resolves.toEqual(PAYMENT_COMPLETION.ONE_COMPLETION);
    await expect(balance()).resolves.toBe(before + PAYMENT_COMPLETION.SYNC_MINOR);
  });

  it('completes a processing deposit from the webhook exactly once', async () => {
    const [payment] = await DbHelper.query<CompletionIdRow>({
      sql: PAYMENT_COMPLETION.PROCESSING_SQL,
      params: [PAYMENT_COMPLETION.EMAIL, wallet.id, methodId, wallet.currency]
    });

    const before = await balance();

    await webhook({ type: PAYMENT_COMPLETION.SUCCEEDED, chargeId: PAYMENT_COMPLETION.PROCESSING_CHARGE });
    await webhook({ type: PAYMENT_COMPLETION.SUCCEEDED, chargeId: PAYMENT_COMPLETION.PROCESSING_CHARGE });

    await expect(records({ paymentId: payment?.id as string })).resolves.toEqual(PAYMENT_COMPLETION.ONE_COMPLETION);
    await expect(balance()).resolves.toBe(before + PAYMENT_COMPLETION.PROCESSING_MINOR);
  });

  it('ignores a late failure for a completed payment', async () => {
    const [payment] = await DbHelper.query<CompletionChargeRow>({ sql: PAYMENT_COMPLETION.COMPLETED_SQL });

    await webhook({ type: PAYMENT_COMPLETION.FAILED, chargeId: payment?.provider_charge_id as string });
    await expect(records({ paymentId: payment?.id as string })).resolves.toEqual(PAYMENT_COMPLETION.ONE_COMPLETION);
  });
});

describe('Payment completion: matching payments', () => {
  it('finds a payment by our own ID when its charge ID was never stored', async () => {
    const [payment] = await DbHelper.query<CompletionIdRow>({
      sql: PAYMENT_COMPLETION.METADATA_SQL,
      params: [PAYMENT_COMPLETION.EMAIL, wallet.id, methodId, wallet.currency]
    });

    const paymentId = payment?.id as string;
    const before = await balance();
    const chargeId = PAYMENT_COMPLETION.NEVER_STORED_CHARGE;

    await expect(webhook({ type: PAYMENT_COMPLETION.SUCCEEDED, chargeId, metadata: { paymentId: PAYMENT_COMPLETION.BAD_PAYMENT_ID } })).resolves.toMatchObject({
      status: PAYMENT_COMPLETION.OK
    });
    await expect(records({ paymentId })).resolves.toMatchObject({ status: PAYMENT_COMPLETION.PENDING });

    await webhook({ type: PAYMENT_COMPLETION.SUCCEEDED, chargeId, metadata: { paymentId } });
    await webhook({ type: PAYMENT_COMPLETION.CHARGE_SUCCEEDED, chargeId: PAYMENT_COMPLETION.NEVER_STORED_CH, metadata: { paymentId } });

    await expect(records({ paymentId })).resolves.toEqual(PAYMENT_COMPLETION.ONE_COMPLETION);
    await expect(DbHelper.query({ sql: PAYMENT_COMPLETION.CHARGE_SQL, params: [paymentId] })).resolves.toEqual([{ provider_charge_id: chargeId }]);

    await expect(balance()).resolves.toBe(before + PAYMENT_COMPLETION.METADATA_MINOR);
  });

  it('keeps the wallets and the ledger in agreement', async () => {
    await expect(DbHelper.query({ sql: PAYMENT_COMPLETION.WALLET_DRIFT_SQL })).resolves.toEqual(PAYMENT_COMPLETION.NO_DRIFT);
    await expect(DbHelper.query({ sql: PAYMENT_COMPLETION.LEDGER_DRIFT_SQL })).resolves.toEqual(PAYMENT_COMPLETION.NO_DRIFT);
  });
});
