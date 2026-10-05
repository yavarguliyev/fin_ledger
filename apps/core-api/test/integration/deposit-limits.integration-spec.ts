import { DEPOSIT_LIMITS_TEST as L } from '../constants/deposit-limits.constant';
import { EMAIL_TOPICS } from '../constants/email-topics.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { EmailInboxHelper } from '../helpers/email-inbox.helper';
import { DepositLimitResult, DepositLimitView, LimitAmountDto, LimitAmountRow, LimitDepositDto, LimitVerified } from '../interfaces/deposit-limit.interface';

let token = '';

const setLimit = ({ amountMinor }: LimitAmountDto): Promise<{ status: number; body: DepositLimitResult }> =>
  ApiHelper.request<DepositLimitResult>({
    method: 'PUT',
    path: L.LIMITS_PATH,
    token,
    body: { period: L.DAILY, currency: L.CURRENCY, amountMinor }
  });

const limits = (): Promise<{ status: number; body: DepositLimitView[] }> =>
  ApiHelper.request<DepositLimitView[]>({ path: L.LIMITS_PATH, token });

const deposit = ({ amountMinor, key }: LimitDepositDto): Promise<{ status: number }> =>
  ApiHelper.request({
    method: 'POST',
    path: L.DEPOSIT_PATH,
    token,
    body: { amountMinor, currency: L.CURRENCY, idempotencyKey: key }
  });

beforeAll(async () => {
  const { EMAIL, DISPLAY_NAME, PASSWORD } = L;

  await ApiHelper.request({
    method: 'POST',
    path: L.REGISTER_PATH,
    body: { email: EMAIL, password: PASSWORD, displayName: DISPLAY_NAME, termsAccepted: true }
  });

  const sent = await EmailInboxHelper.waitFor({ to: EMAIL, topic: EMAIL_TOPICS.EMAIL_VERIFICATION });
  const verified = await ApiHelper.request<LimitVerified>({
    method: 'POST',
    path: L.VERIFY_EMAIL_PATH,
    body: { token: new URL(sent.url).searchParams.get(L.TOKEN_PARAM) }
  });

  token = verified.body.accessToken;
});

afterAll(async () => DbHelper.close());

describe('Deposit limits', () => {
  it('sets a limit and reports it back', async () => {
    const set = await setLimit({ amountMinor: L.LIMIT_MINOR });

    expect(set.status).toBe(L.OK);
    expect(set.body.limit.amountMinor).toBe(L.LIMIT_MINOR);

    const current = await limits();
    expect(current.status).toBe(L.OK);
    expect(current.body).toHaveLength(1);
    expect(current.body[0]?.amountMinor).toBe(L.LIMIT_MINOR);
  });

  it('counts what is already spent in the period and refuses the deposit that would cross the limit', async () => {
    await DbHelper.query({
      sql: L.SEED_SQL,
      params: [L.EMAIL, L.CURRENCY, L.ALREADY_SPENT_MINOR]
    });

    await expect(deposit({ amountMinor: L.UNDER_LIMIT_MINOR, key: L.OVER_KEY })).resolves.toMatchObject({
      status: L.FORBIDDEN
    });

    await expect(deposit({ amountMinor: L.WITHIN_LIMIT_MINOR, key: L.UNDER_KEY })).resolves.not.toMatchObject({
      status: L.FORBIDDEN
    });
  });

  it('applies a lower limit straight away', async () => {
    const lowered = await setLimit({ amountMinor: L.LOWERED_MINOR });

    expect(lowered.body.limit.amountMinor).toBe(L.LOWERED_MINOR);
    expect(lowered.body.limit.pendingAmountMinor).toBeNull();

    const [row] = await DbHelper.query<LimitAmountRow>({
      sql: L.AMOUNT_SQL,
      params: [L.EMAIL]
    });

    expect(row?.amount).toBe(String(L.LOWERED_MINOR));
  });
});

describe('Deposit limits: raising a limit', () => {
  it('holds a raise behind the cooling-off period and keeps the old limit in force', async () => {
    const raised = await setLimit({ amountMinor: L.RAISED_MINOR });

    expect(raised.body.limit.amountMinor).toBe(L.LOWERED_MINOR);
    expect(raised.body.limit.pendingAmountMinor).toBe(L.RAISED_MINOR);
    expect(raised.body.limit.pendingEffectiveAt).toEqual(expect.any(String) as string);

    const current = await limits();
    expect(current.body[0]?.amountMinor).toBe(L.LOWERED_MINOR);
  });

  it('lets the raise take effect once the cooling-off period has passed', async () => {
    await DbHelper.query({
      sql: L.EXPIRE_COOLING_OFF_SQL,
      params: [L.EMAIL]
    });

    const current = await limits();

    expect(current.body[0]?.amountMinor).toBe(L.RAISED_MINOR);
    expect(current.body[0]?.pendingAmountMinor).toBeNull();
  });
});
