import { SELF_EXCLUSION_TEST } from '../constants/self-exclusion.constant';
import { EMAIL_TOPICS } from '../constants/email-topics.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { EmailInboxHelper } from '../helpers/email-inbox.helper';
import { SelfExclusionResult } from '../interfaces/self-exclusion-result.interface';

describe('Self-exclusion', () => {
  let token = '';

  const exclude = (period: string): Promise<{ status: number; body: SelfExclusionResult }> =>
    ApiHelper.request<SelfExclusionResult>({ method: 'POST', path: SELF_EXCLUSION_TEST.PATH, token, body: { period } });

  const storedUntil = async (): Promise<string | null> => {
    const [row] = await DbHelper.query<{ until: string | null }>({
      sql: 'SELECT self_exclusion_until::text AS until FROM users WHERE email = $1',
      params: [SELF_EXCLUSION_TEST.EMAIL]
    });

    return row?.until ?? null;
  };

  beforeAll(async () => {
    const { EMAIL, DISPLAY_NAME, PASSWORD } = SELF_EXCLUSION_TEST;

    await ApiHelper.request({
      method: 'POST',
      path: SELF_EXCLUSION_TEST.REGISTER_PATH,
      body: { email: EMAIL, password: PASSWORD, displayName: DISPLAY_NAME, termsAccepted: true }
    });

    const sent = await EmailInboxHelper.waitFor({ to: EMAIL, topic: EMAIL_TOPICS.EMAIL_VERIFICATION });
    const verified = await ApiHelper.request<{ accessToken: string }>({
      method: 'POST',
      path: SELF_EXCLUSION_TEST.VERIFY_EMAIL_PATH,
      body: { token: new URL(sent.url).searchParams.get('token') }
    });

    token = verified.body.accessToken;
  });

  afterAll(async () => DbHelper.close());

  it('starts an exclusion, records the date and emails a confirmation', async () => {
    const started = await exclude(SELF_EXCLUSION_TEST.SHORT_PERIOD);

    expect(started.status).toBe(SELF_EXCLUSION_TEST.CREATED);
    expect(started.body.selfExclusionUntil).toEqual(expect.any(String) as string);
    await expect(storedUntil()).resolves.not.toBeNull();
    await expect(EmailInboxHelper.waitFor({ to: SELF_EXCLUSION_TEST.EMAIL, topic: EMAIL_TOPICS.SELF_EXCLUSION_STARTED })).resolves.toBeDefined();
  });

  it('reports the date on the current user, so the client can show a banner', async () => {
    const me = await ApiHelper.request<{ user: { selfExclusionUntil: string | null } }>({ path: SELF_EXCLUSION_TEST.ME_PATH, token });

    expect(me.status).toBe(SELF_EXCLUSION_TEST.OK);
    expect(me.body.user.selfExclusionUntil).toEqual(expect.any(String) as string);
  });

  it('blocks betting and depositing with a clear message, but not withdrawing', async () => {
    const [wallet] = await DbHelper.query<{ id: string; currency: string }>({
      sql: 'SELECT w.id, w.currency FROM wallets w JOIN users u ON u.id = w.user_id WHERE u.email = $1',
      params: [SELF_EXCLUSION_TEST.EMAIL]
    });

    const [event] = await DbHelper.query<{ id: string }>({
      sql: "SELECT id FROM game_events WHERE status = 'SCHEDULED' AND betting_closes_at > now() ORDER BY starts_at LIMIT 1"
    });

    const bet = await ApiHelper.request<{ error: { message: string } }>({
      method: 'POST',
      path: SELF_EXCLUSION_TEST.BETS_PATH,
      token,
      body: {
        walletId: wallet?.id,
        eventId: event?.id,
        selection: SELF_EXCLUSION_TEST.SELECTION,
        stakeMinor: SELF_EXCLUSION_TEST.STAKE_MINOR,
        idempotencyKey: 'self-exclusion-bet'
      }
    });

    expect(bet.status).toBe(SELF_EXCLUSION_TEST.FORBIDDEN);
    expect(bet.body.error.message).toBe(SELF_EXCLUSION_TEST.BLOCKED_MESSAGE);

    const payment = { amountMinor: SELF_EXCLUSION_TEST.AMOUNT_MINOR, currency: SELF_EXCLUSION_TEST.CURRENCY, idempotencyKey: 'self-exclusion-pay' };

    await expect(ApiHelper.request({ method: 'POST', path: SELF_EXCLUSION_TEST.DEPOSIT_PATH, token, body: payment })).resolves.toMatchObject({
      status: SELF_EXCLUSION_TEST.FORBIDDEN
    });

    const withdrawal = await ApiHelper.request<{ error?: { message: string } }>({
      method: 'POST',
      path: SELF_EXCLUSION_TEST.WITHDRAW_PATH,
      token,
      body: { ...payment, idempotencyKey: 'self-exclusion-withdraw' }
    });

    expect(withdrawal.status).not.toBe(SELF_EXCLUSION_TEST.FORBIDDEN);
    expect(withdrawal.body.error?.message).not.toBe(SELF_EXCLUSION_TEST.BLOCKED_MESSAGE);
  });

  it('accepts a longer period and refuses a shorter one, leaving the date untouched', async () => {
    const started = await storedUntil();

    const extended = await exclude(SELF_EXCLUSION_TEST.LONG_PERIOD);
    expect(extended.status).toBe(SELF_EXCLUSION_TEST.CREATED);

    const longer = await storedUntil();
    expect(new Date(longer as string).getTime()).toBeGreaterThan(new Date(started as string).getTime());

    await expect(exclude(SELF_EXCLUSION_TEST.SHORT_PERIOD)).resolves.toMatchObject({ status: SELF_EXCLUSION_TEST.BAD_REQUEST });
    await expect(storedUntil()).resolves.toBe(longer);

    const permanent = await exclude(SELF_EXCLUSION_TEST.PERMANENT_PERIOD);
    expect(permanent.status).toBe(SELF_EXCLUSION_TEST.CREATED);
    expect(new Date((await storedUntil()) as string).getTime()).toBeGreaterThan(new Date(longer as string).getTime());
  });

  it('ignores the date when it arrives on a profile update, so no other route can move it', async () => {
    const before = await storedUntil();

    await ApiHelper.request({
      method: 'PATCH',
      path: SELF_EXCLUSION_TEST.USERS_PATH,
      token,
      body: { displayName: SELF_EXCLUSION_TEST.DISPLAY_NAME, selfExclusionUntil: new Date().toISOString() }
    });

    await expect(storedUntil()).resolves.toBe(before);
  });
});
