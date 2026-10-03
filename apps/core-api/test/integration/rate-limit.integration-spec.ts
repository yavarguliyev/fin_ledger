import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { LockoutHelper } from '../helpers/lockout.helper';
import { REFRESH_TEST } from '../constants/refresh-rate-limit.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

const RATE_LIMIT_USERS = ['player20@realtime-wallet-payments.com', 'player21@realtime-wallet-payments.com'];

afterAll(async () => DbHelper.close());

const login = (email: string, clientIp: string): ReturnType<typeof ApiHelper.request> =>
  ApiHelper.request({ method: 'POST', path: '/auth/login', body: { email, password: 'Wrong#Pass2026' }, clientIp });

describe('Rate limiting', () => {
  it('blocks the 6th wrong login for one email from one client within a minute', async () => {
    const clientIp = ApiHelper.randomIp();

    for (let attempt = 1; attempt <= 5; attempt++) {
      await expect(login('player20@realtime-wallet-payments.com', clientIp)).resolves.toMatchObject({ status: 401 });
    }

    const blocked = await login('player20@realtime-wallet-payments.com', clientIp);
    expect(blocked).toMatchObject({ status: 429, body: { error: { code: 'HTTP_429' } } });
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);

    await expect(login('player21@realtime-wallet-payments.com', clientIp)).resolves.toMatchObject({ status: 401 });
    await expect(login('player20@realtime-wallet-payments.com', ApiHelper.randomIp())).resolves.toMatchObject({ status: 401 });
  });

  it('limits session refreshes per browser session, so tabs and people sharing one IP do not lock each other out', async () => {
    const clientIp = ApiHelper.randomIp();
    const refresh = (cookie: string): Promise<Response> =>
      fetch(`${process.env[TEST_ENV_KEYS.API_URL]}/auth/refresh`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie, 'X-Forwarded-For': clientIp },
        body: '{}'
      });

    for (let browser = 1; browser <= REFRESH_TEST.SHARED_IP_BROWSERS; browser++) {
      expect((await refresh(`${REFRESH_TEST.COOKIE_PREFIX}${browser}`)).status).toBe(401);
    }

    for (let attempt = 1; attempt <= REFRESH_TEST.LIMIT; attempt++) await refresh(REFRESH_TEST.ONE_SESSION);

    expect((await refresh(REFRESH_TEST.ONE_SESSION)).status).toBe(429);
  });
});

describe('Rate limiting: per user', () => {
  it('limits money requests per user, whatever the client IP', async () => {
    await LockoutHelper.clear({ emails: RATE_LIMIT_USERS });

    const token = await ApiHelper.login({ email: 'player20@realtime-wallet-payments.com' });
    const deposit = (): ReturnType<typeof ApiHelper.request> => ApiHelper.request({ method: 'POST', path: '/payments/deposit', token, body: {} });

    for (let attempt = 1; attempt <= 30; attempt++) {
      await expect(deposit()).resolves.toMatchObject({ status: 400 });
    }

    await expect(deposit()).resolves.toMatchObject({ status: 429 });

    const otherToken = await ApiHelper.login({ email: 'player21@realtime-wallet-payments.com' });

    await expect(ApiHelper.request({ method: 'POST', path: '/payments/deposit', token: otherToken, body: {} })).resolves.toMatchObject({
      status: 400
    });

    await expect(ApiHelper.request({ method: 'GET', path: '/wallets', token })).resolves.toMatchObject({ status: 200 });
  });
});
