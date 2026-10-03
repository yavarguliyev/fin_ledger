import { PAYMENT_OPEN_RESULTS as OPEN } from '../constants/payment-open-results.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import {
  OpenBalanceRow,
  OpenChargeRow,
  OpenDeposit,
  OpenDepositDto,
  OpenFailureRow,
  OpenIdRow,
  OpenPaymentDto,
  OpenWalletRow
} from '../interfaces/payment-open-results.interface';

const methodIds: Record<string, string> = {};

let token: string;

let wallet: OpenWalletRow;

const balance = async (): Promise<number> => {
  const [row] = await DbHelper.query<OpenBalanceRow>({ sql: OPEN.BALANCE_SQL, params: [wallet.id] });
  return row?.balance ?? 0;
};

const stored = async ({ paymentId }: OpenPaymentDto): Promise<unknown> => {
  const [row] = await DbHelper.query({ sql: OPEN.STORED_SQL, params: [paymentId] });
  return row;
};

const deposit = ({ card, idempotencyKey }: OpenDepositDto): ReturnType<typeof ApiHelper.request<OpenDeposit>> =>
  ApiHelper.request<OpenDeposit>({
    method: 'POST',
    path: OPEN.DEPOSIT_PATH,
    token,
    body: { amountMinor: OPEN.DEPOSIT_MINOR, currency: wallet.currency, idempotencyKey, paymentMethodId: methodIds[card] }
  });

beforeAll(async () => {
  [wallet] = (await DbHelper.query<OpenWalletRow>({ sql: OPEN.WALLET_SQL, params: [OPEN.EMAIL] })) as [OpenWalletRow];

  for (const card of OPEN.CARDS) {
    const [method] = await DbHelper.query<OpenIdRow>({ sql: OPEN.METHOD_SQL, params: [OPEN.EMAIL, card] });
    methodIds[card] = method?.id as string;
  }

  token = await ApiHelper.login({ email: OPEN.EMAIL });
});

afterAll(async () => DbHelper.close());

describe('Deposits the provider has not settled yet', () => {
  it('keeps a 3-D Secure deposit open with a client secret, then completes it from the webhook', async () => {
    const before = await balance();
    const { status, body } = await deposit({ card: OPEN.THREE_DS_CARD, idempotencyKey: OPEN.THREE_DS_KEY });

    expect(status).toBe(OPEN.CREATED);
    expect(body).toMatchObject({ status: OPEN.REQUIRES_ACTION });
    expect(String(body.clientSecret)).toContain(OPEN.SECRET_FRAGMENT);

    await expect(stored({ paymentId: body.id })).resolves.toEqual(OPEN.OPEN_3DS);
    await expect(balance()).resolves.toBe(before);

    const [payment] = await DbHelper.query<OpenChargeRow>({ sql: OPEN.CHARGE_SQL, params: [body.id] });

    await ApiHelper.request({
      method: 'POST',
      path: OPEN.WEBHOOK_PATH,
      body: { id: `${OPEN.EVENT_PREFIX}${Date.now()}`, type: OPEN.SUCCEEDED, data: { object: { id: payment?.provider_charge_id } } }
    });

    await expect(stored({ paymentId: body.id })).resolves.toMatchObject(OPEN.COMPLETED_CREDITED);
    await expect(balance()).resolves.toBe(before + OPEN.DEPOSIT_MINOR);
  });

  it('keeps a processing deposit open without crediting it', async () => {
    const { status, body } = await deposit({ card: OPEN.PROCESSING_CARD, idempotencyKey: OPEN.PROCESSING_KEY });

    expect(status).toBe(OPEN.CREATED);
    await expect(stored({ paymentId: body.id })).resolves.toEqual(OPEN.OPEN_PROCESSING);
  });

  it('fails a declined deposit with the decline code and moves no money', async () => {
    const before = await balance();
    const { status } = await deposit({ card: OPEN.DECLINED_CARD, idempotencyKey: OPEN.DECLINED_KEY });

    expect(status).toBe(OPEN.BAD_REQUEST);

    const [payment] = await DbHelper.query<OpenFailureRow>({ sql: OPEN.DECLINED_SQL, params: [OPEN.DECLINED_KEY] });

    expect(payment).toEqual(OPEN.DECLINED);
    await expect(balance()).resolves.toBe(before);
  });
});
