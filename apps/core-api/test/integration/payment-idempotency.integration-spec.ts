import { PAYMENT_IDEMPOTENCY as T } from '../constants/payment-idempotency.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { ApiResponse } from '../interfaces/api-response.interface';
import { IdempotencyDeposit, IdempotencyDepositDto, IdempotencyIdRow } from '../interfaces/payment-idempotency.interface';

const methodIds: Record<string, string> = {};

const tokens: Record<string, string> = {};

beforeAll(async () => {
  for (const [index, email] of T.PLAYERS.entries()) {
    const [method] = await DbHelper.query<IdempotencyIdRow>({ sql: T.METHOD_SQL, params: [email, `${T.METHOD_PREFIX}${index}`] });

    methodIds[email] = method?.id as string;
    tokens[email] = await ApiHelper.login({ email });
  }
});

afterAll(async () => DbHelper.close());

const deposit = ({ email, idempotencyKey }: IdempotencyDepositDto): Promise<ApiResponse<IdempotencyDeposit>> =>
  ApiHelper.request<IdempotencyDeposit>({
    method: 'POST',
    path: T.DEPOSIT_PATH,
    token: tokens[email] as string,
    body: { amountMinor: T.DEPOSIT_MINOR, currency: T.CURRENCY, idempotencyKey, paymentMethodId: methodIds[email] }
  });

describe('Payment idempotency keys', () => {
  it('keeps two users with the same client key apart, and a retry returns the original payment', async () => {
    const idempotencyKey = T.SHARED_KEY;
    const [first, second] = T.PLAYERS;

    const firstDeposit = await deposit({ email: first, idempotencyKey });
    const secondDeposit = await deposit({ email: second, idempotencyKey });
    const retry = await deposit({ email: first, idempotencyKey });

    expect(firstDeposit.status).toBe(T.CREATED);
    expect(secondDeposit.status).toBe(T.CREATED);
    expect(secondDeposit.body.id).not.toBe(firstDeposit.body.id);
    expect(secondDeposit.body.userId).not.toBe(firstDeposit.body.userId);
    expect(retry.body.id).toBe(firstDeposit.body.id);

    await expect(DbHelper.query({ sql: T.COUNT_BY_KEY_SQL, params: [idempotencyKey] })).resolves.toEqual(T.TWO_PAYMENTS);
  });

  it('keeps the wallets and the ledger in agreement', async () => {
    await expect(DbHelper.query({ sql: T.WALLET_DRIFT_SQL })).resolves.toEqual(T.NO_DRIFT);
    await expect(DbHelper.query({ sql: T.LEDGER_DRIFT_SQL })).resolves.toEqual(T.NO_DRIFT);
  });
});
