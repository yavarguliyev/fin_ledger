import Redis from 'ioredis';
import jwt from 'jsonwebtoken';

import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { LockoutHelper } from '../helpers/lockout.helper';
import { LoginAttemptHelper } from '../helpers/login-attempt.helper';
import { LOGIN_STATUS_TEST as L } from '../constants/login-status.constant';
import { SessionClaims } from '../interfaces/login-attempt.interface';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

beforeAll(async () => DbHelper.query({ sql: L.SEED_STATUS_SQL }));
afterAll(async () => DbHelper.close());

describe('Login by account status', () => {
  it.each([
    [L.ACTIVE_EMAIL, L.ACTIVE, L.CREATED],
    [L.SUSPENDED_EMAIL, L.SUSPENDED, L.UNAUTHORIZED],
    [L.CLOSED_EMAIL, L.CLOSED, L.UNAUTHORIZED],
    [L.PENDING_EMAIL, L.PENDING, L.UNAUTHORIZED]
  ])('%s (%s) logs in with HTTP %i', async (email, _status, expected) => {
    await expect(LoginAttemptHelper.attempt({ email })).resolves.toMatchObject({ status: expected });
  });

  it('gives blocked users the same message as a wrong password', async () => {
    const blocked = await LoginAttemptHelper.attempt({ email: L.SUSPENDED_EMAIL });
    const wrongPassword = await LoginAttemptHelper.attempt({ email: L.ACTIVE_EMAIL, password: L.WRONG_PASSWORD });

    expect(blocked.body).toMatchObject({ error: { message: L.INVALID_CREDENTIALS } });
    expect(wrongPassword.body).toMatchObject({ error: { message: L.INVALID_CREDENTIALS } });
  });
});

describe('Sessions and timing', () => {
  it('rejects a session whose snapshot is no longer ACTIVE', async () => {
    const token = await ApiHelper.login({ email: L.ACTIVE_EMAIL });
    await expect(ApiHelper.request({ path: L.WALLETS_PATH, token })).resolves.toMatchObject({ status: L.OK });

    const { userId, jti } = jwt.decode(token) as SessionClaims;
    const key = `${L.SESSION_PREFIX}${userId}:${jti}`;
    const redis = new Redis(process.env[TEST_ENV_KEYS.REDIS_URL] as string);
    const session = JSON.parse((await redis.get(key)) as string) as Record<string, unknown>;
    await redis.set(key, JSON.stringify({ ...session, status: L.SUSPENDED }), L.KEEP_TTL);
    redis.disconnect();

    await expect(ApiHelper.request({ path: L.WALLETS_PATH, token })).resolves.toMatchObject({ status: L.UNAUTHORIZED });
  });

  it('takes about as long for an unknown email as for a wrong password', async () => {
    await LoginAttemptHelper.attempt({ email: L.WARM_UP_EMAIL, password: L.WRONG_PASSWORD });

    const unknownEmail = await LoginAttemptHelper.median({ email: L.UNKNOWN_EMAIL });
    const wrongPassword = await LoginAttemptHelper.median({ email: L.ACTIVE_EMAIL });

    expect(unknownEmail / wrongPassword).toBeGreaterThan(L.MIN_TIMING_RATIO);
    expect(unknownEmail / wrongPassword).toBeLessThan(L.MAX_TIMING_RATIO);
    await LockoutHelper.clear({ emails: [L.ACTIVE_EMAIL, L.SUSPENDED_EMAIL] });
  });
});
