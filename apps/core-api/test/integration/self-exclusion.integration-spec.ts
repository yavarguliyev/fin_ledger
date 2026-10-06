import { SELF_EXCLUSION_TEST } from '../constants/self-exclusion.constant';
import { EMAIL_TOPICS } from '../constants/email-topics.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { EmailInboxHelper } from '../helpers/email-inbox.helper';
import { ExclusionPeriod, ExclusionResponse, ExclusionUntilRow, SelfExclusionResult } from '../interfaces/self-exclusion-result.interface';

let token: string = SELF_EXCLUSION_TEST.EMPTY;

const exclude = ({ period }: ExclusionPeriod): Promise<ExclusionResponse> =>
  ApiHelper.request<SelfExclusionResult>({ method: SELF_EXCLUSION_TEST.POST, path: SELF_EXCLUSION_TEST.PATH, token, body: { period } });

const storedUntil = async (): Promise<string | null> => {
  const [row] = await DbHelper.query<ExclusionUntilRow>({
    sql: SELF_EXCLUSION_TEST.UNTIL_SQL,
    params: [SELF_EXCLUSION_TEST.EMAIL]
  });

  return row?.until ?? null;
};

beforeAll(async () => {
  const { EMAIL, DISPLAY_NAME, PASSWORD } = SELF_EXCLUSION_TEST;

  await ApiHelper.request({
    method: SELF_EXCLUSION_TEST.POST,
    path: SELF_EXCLUSION_TEST.REGISTER_PATH,
    body: { email: EMAIL, password: PASSWORD, displayName: DISPLAY_NAME, termsAccepted: true }
  });

  const sent = await EmailInboxHelper.waitFor({ to: EMAIL, topic: EMAIL_TOPICS.EMAIL_VERIFICATION });
  const verified = await ApiHelper.request<{ accessToken: string }>({
    method: SELF_EXCLUSION_TEST.POST,
    path: SELF_EXCLUSION_TEST.VERIFY_EMAIL_PATH,
    body: { token: new URL(sent.url).searchParams.get(SELF_EXCLUSION_TEST.TOKEN_PARAM) }
  });

  token = verified.body.accessToken;
});

afterAll(async () => DbHelper.close());

describe('Self-exclusion', () => {
  it('starts an exclusion, records the date and emails a confirmation', async () => {
    const started = await exclude({ period: SELF_EXCLUSION_TEST.SHORT_PERIOD });

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
});

describe('Self-exclusion: what it blocks', () => {
  it('blocks betting and depositing with a clear message, but not withdrawing', async () => {
    const [wallet] = await DbHelper.query<{ id: string; currency: string }>({
      sql: SELF_EXCLUSION_TEST.WALLET_SQL,
      params: [SELF_EXCLUSION_TEST.EMAIL]
    });

    const [event] = await DbHelper.query<{ id: string }>({
      sql: SELF_EXCLUSION_TEST.OPEN_EVENT_SQL
    });

    const bet = await ApiHelper.request<{ error: { message: string } }>({
      method: SELF_EXCLUSION_TEST.POST,
      path: SELF_EXCLUSION_TEST.BETS_PATH,
      token,
      body: {
        walletId: wallet?.id,
        eventId: event?.id,
        selection: SELF_EXCLUSION_TEST.SELECTION,
        stakeMinor: SELF_EXCLUSION_TEST.STAKE_MINOR,
        idempotencyKey: SELF_EXCLUSION_TEST.BET_KEY
      }
    });

    expect(bet.status).toBe(SELF_EXCLUSION_TEST.FORBIDDEN);
    expect(bet.body.error.message).toBe(SELF_EXCLUSION_TEST.BLOCKED_MESSAGE);

    const payment = { amountMinor: SELF_EXCLUSION_TEST.AMOUNT_MINOR, currency: SELF_EXCLUSION_TEST.CURRENCY, idempotencyKey: SELF_EXCLUSION_TEST.PAY_KEY };

    await expect(ApiHelper.request({ method: SELF_EXCLUSION_TEST.POST, path: SELF_EXCLUSION_TEST.DEPOSIT_PATH, token, body: payment })).resolves.toMatchObject({
      status: SELF_EXCLUSION_TEST.FORBIDDEN
    });

    const withdrawal = await ApiHelper.request<{ error?: { message: string } }>({
      method: SELF_EXCLUSION_TEST.POST,
      path: SELF_EXCLUSION_TEST.WITHDRAW_PATH,
      token,
      body: { ...payment, idempotencyKey: SELF_EXCLUSION_TEST.WITHDRAW_KEY }
    });

    expect(withdrawal.status).not.toBe(SELF_EXCLUSION_TEST.FORBIDDEN);
    expect(withdrawal.body.error?.message).not.toBe(SELF_EXCLUSION_TEST.BLOCKED_MESSAGE);
  });
});

describe('Self-exclusion: changing the period', () => {
  it('accepts a longer period and refuses a shorter one, leaving the date untouched', async () => {
    const started = await storedUntil();

    const extended = await exclude({ period: SELF_EXCLUSION_TEST.LONG_PERIOD });
    expect(extended.status).toBe(SELF_EXCLUSION_TEST.CREATED);

    const longer = await storedUntil();
    expect(new Date(longer as string).getTime()).toBeGreaterThan(new Date(started as string).getTime());

    await expect(exclude({ period: SELF_EXCLUSION_TEST.SHORT_PERIOD })).resolves.toMatchObject({ status: SELF_EXCLUSION_TEST.BAD_REQUEST });
    await expect(storedUntil()).resolves.toBe(longer);

    const permanent = await exclude({ period: SELF_EXCLUSION_TEST.PERMANENT_PERIOD });
    expect(permanent.status).toBe(SELF_EXCLUSION_TEST.CREATED);
    expect(new Date((await storedUntil()) as string).getTime()).toBeGreaterThan(new Date(longer as string).getTime());
  });

  it('ignores the date when it arrives on a profile update, so no other route can move it', async () => {
    const before = await storedUntil();

    await ApiHelper.request({
      method: SELF_EXCLUSION_TEST.PATCH,
      path: SELF_EXCLUSION_TEST.USERS_PATH,
      token,
      body: { displayName: SELF_EXCLUSION_TEST.DISPLAY_NAME, selfExclusionUntil: new Date().toISOString() }
    });

    await expect(storedUntil()).resolves.toBe(before);
  });
});
