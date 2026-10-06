import { LOCKOUT_TEST } from '../constants/account-lockout.constant';
import { EMAIL_TOPICS } from '../constants/email-topics.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { EmailInboxHelper } from '../helpers/email-inbox.helper';
import { LockoutLogin, LockoutLoginResponse, LockoutRow } from '../interfaces/lockout-row.interface';

const login = ({ password }: LockoutLogin): Promise<LockoutLoginResponse> =>
  ApiHelper.request({ method: 'POST', path: LOCKOUT_TEST.LOGIN_PATH, body: { email: LOCKOUT_TEST.EMAIL, password } });

const lockoutState = async (): Promise<LockoutRow | undefined> => {
  const [row] = await DbHelper.query<LockoutRow>({
    sql: LOCKOUT_TEST.STATE_SQL,
    params: [LOCKOUT_TEST.EMAIL]
  });

  return row;
};

beforeAll(async () => {
  const { EMAIL, DISPLAY_NAME, PASSWORD } = LOCKOUT_TEST;

  await ApiHelper.request({
    method: 'POST',
    path: LOCKOUT_TEST.REGISTER_PATH,
    body: { email: EMAIL, password: PASSWORD, displayName: DISPLAY_NAME, termsAccepted: true }
  });

  const sent = await EmailInboxHelper.waitFor({ to: EMAIL, topic: EMAIL_TOPICS.EMAIL_VERIFICATION });

  await ApiHelper.request({
    method: 'POST',
    path: LOCKOUT_TEST.VERIFY_EMAIL_PATH,
    body: { token: new URL(sent.url).searchParams.get('token') }
  });
});

afterAll(async () => DbHelper.close());

describe('Account lockout', () => {
  it('counts a wrong password without locking straight away', async () => {
    const attempt = await login({ password: LOCKOUT_TEST.WRONG_PASSWORD });

    expect(attempt.status).toBe(LOCKOUT_TEST.UNAUTHORIZED);
    await expect(lockoutState()).resolves.toEqual({ attempts: LOCKOUT_TEST.FIRST_FAILURE, locked: null });
  });

  it('clears the count on a good password', async () => {
    await expect(login({ password: LOCKOUT_TEST.PASSWORD })).resolves.toMatchObject({ status: LOCKOUT_TEST.CREATED });
    await expect(lockoutState()).resolves.toEqual({ attempts: LOCKOUT_TEST.CLEARED_ATTEMPTS, locked: null });
  });

  it('locks the account after five wrong passwords', async () => {
    for (let attempt = 0; attempt < LOCKOUT_TEST.MAX_ATTEMPTS; attempt++) {
      await login({ password: LOCKOUT_TEST.WRONG_PASSWORD });
    }

    await expect(lockoutState()).resolves.toEqual({ attempts: LOCKOUT_TEST.MAX_ATTEMPTS, locked: true });
  });

  it('refuses the right password while the lock holds, with the same message as a wrong one', async () => {
    const locked = await login({ password: LOCKOUT_TEST.PASSWORD });

    expect(locked.status).toBe(LOCKOUT_TEST.UNAUTHORIZED);
    expect(locked.body.error?.message).toBe(LOCKOUT_TEST.INVALID_MESSAGE);
  });

  it('lets the account back in once the lock has expired', async () => {
    await DbHelper.query({
      sql: LOCKOUT_TEST.EXPIRE_LOCK_SQL,
      params: [LOCKOUT_TEST.EMAIL]
    });

    await expect(login({ password: LOCKOUT_TEST.PASSWORD })).resolves.toMatchObject({ status: LOCKOUT_TEST.CREATED });
    await expect(lockoutState()).resolves.toEqual({ attempts: LOCKOUT_TEST.CLEARED_ATTEMPTS, locked: null });
  });
});
