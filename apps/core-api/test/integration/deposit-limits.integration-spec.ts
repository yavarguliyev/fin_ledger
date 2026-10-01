import { DEPOSIT_LIMITS_TEST } from '../constants/deposit-limits.constant';
import { EMAIL_TOPICS } from '../constants/email-topics.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { EmailInboxHelper } from '../helpers/email-inbox.helper';
import { DepositLimitResult, DepositLimitView } from '../interfaces/deposit-limit.interface';

describe('Deposit limits', () => {
  let token = '';

  const setLimit = (amountMinor: number): Promise<{ status: number; body: DepositLimitResult }> =>
    ApiHelper.request<DepositLimitResult>({
      method: 'PUT',
      path: DEPOSIT_LIMITS_TEST.LIMITS_PATH,
      token,
      body: { period: DEPOSIT_LIMITS_TEST.DAILY, currency: DEPOSIT_LIMITS_TEST.CURRENCY, amountMinor }
    });

  const limits = (): Promise<{ status: number; body: DepositLimitView[] }> =>
    ApiHelper.request<DepositLimitView[]>({ path: DEPOSIT_LIMITS_TEST.LIMITS_PATH, token });

  const deposit = (amountMinor: number, key: string): Promise<{ status: number }> =>
    ApiHelper.request({
      method: 'POST',
      path: DEPOSIT_LIMITS_TEST.DEPOSIT_PATH,
      token,
      body: { amountMinor, currency: DEPOSIT_LIMITS_TEST.CURRENCY, idempotencyKey: key }
    });

  beforeAll(async () => {
    const { EMAIL, DISPLAY_NAME, PASSWORD } = DEPOSIT_LIMITS_TEST;

    await ApiHelper.request({
      method: 'POST',
      path: DEPOSIT_LIMITS_TEST.REGISTER_PATH,
      body: { email: EMAIL, password: PASSWORD, displayName: DISPLAY_NAME, termsAccepted: true }
    });

    const sent = await EmailInboxHelper.waitFor({ to: EMAIL, topic: EMAIL_TOPICS.EMAIL_VERIFICATION });
    const verified = await ApiHelper.request<{ accessToken: string }>({
      method: 'POST',
      path: DEPOSIT_LIMITS_TEST.VERIFY_EMAIL_PATH,
      body: { token: new URL(sent.url).searchParams.get('token') }
    });

    token = verified.body.accessToken;
  });

  afterAll(async () => DbHelper.close());

  it('sets a limit and reports it back', async () => {
    const set = await setLimit(DEPOSIT_LIMITS_TEST.LIMIT_MINOR);

    expect(set.status).toBe(DEPOSIT_LIMITS_TEST.OK);
    expect(set.body.limit.amountMinor).toBe(DEPOSIT_LIMITS_TEST.LIMIT_MINOR);

    const current = await limits();
    expect(current.status).toBe(DEPOSIT_LIMITS_TEST.OK);
    expect(current.body).toHaveLength(1);
    expect(current.body[0]?.amountMinor).toBe(DEPOSIT_LIMITS_TEST.LIMIT_MINOR);
  });

  it('counts what is already spent in the period and refuses the deposit that would cross the limit', async () => {
    await DbHelper.query({
      sql: DEPOSIT_LIMITS_TEST.SEED_SQL,
      params: [DEPOSIT_LIMITS_TEST.EMAIL, DEPOSIT_LIMITS_TEST.CURRENCY, DEPOSIT_LIMITS_TEST.ALREADY_SPENT_MINOR]
    });

    await expect(deposit(DEPOSIT_LIMITS_TEST.UNDER_LIMIT_MINOR, 'limit-over')).resolves.toMatchObject({
      status: DEPOSIT_LIMITS_TEST.FORBIDDEN
    });

    await expect(deposit(DEPOSIT_LIMITS_TEST.WITHIN_LIMIT_MINOR, 'limit-under')).resolves.not.toMatchObject({
      status: DEPOSIT_LIMITS_TEST.FORBIDDEN
    });
  });

  it('applies a lower limit straight away', async () => {
    const lowered = await setLimit(DEPOSIT_LIMITS_TEST.LOWERED_MINOR);

    expect(lowered.body.limit.amountMinor).toBe(DEPOSIT_LIMITS_TEST.LOWERED_MINOR);
    expect(lowered.body.limit.pendingAmountMinor).toBeNull();

    const [row] = await DbHelper.query<{ amount: string }>({
      sql: 'SELECT amount_minor::text AS amount FROM deposit_limits d JOIN users u ON u.id = d.user_id WHERE u.email = $1',
      params: [DEPOSIT_LIMITS_TEST.EMAIL]
    });

    expect(row?.amount).toBe(String(DEPOSIT_LIMITS_TEST.LOWERED_MINOR));
  });

  it('holds a raise behind the cooling-off period and keeps the old limit in force', async () => {
    const raised = await setLimit(DEPOSIT_LIMITS_TEST.RAISED_MINOR);

    expect(raised.body.limit.amountMinor).toBe(DEPOSIT_LIMITS_TEST.LOWERED_MINOR);
    expect(raised.body.limit.pendingAmountMinor).toBe(DEPOSIT_LIMITS_TEST.RAISED_MINOR);
    expect(raised.body.limit.pendingEffectiveAt).toEqual(expect.any(String) as string);

    const current = await limits();
    expect(current.body[0]?.amountMinor).toBe(DEPOSIT_LIMITS_TEST.LOWERED_MINOR);
  });

  it('lets the raise take effect once the cooling-off period has passed', async () => {
    await DbHelper.query({
      sql: "UPDATE deposit_limits SET pending_effective_at = now() - interval '1 minute' WHERE user_id = (SELECT id FROM users WHERE email = $1)",
      params: [DEPOSIT_LIMITS_TEST.EMAIL]
    });

    const current = await limits();

    expect(current.body[0]?.amountMinor).toBe(DEPOSIT_LIMITS_TEST.RAISED_MINOR);
    expect(current.body[0]?.pendingAmountMinor).toBeNull();
  });
});
