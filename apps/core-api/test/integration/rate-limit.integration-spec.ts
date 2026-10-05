import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { LockoutHelper } from '../helpers/lockout.helper';
import { RATE_LIMIT as T } from '../constants/rate-limit.constant';
import { REFRESH_TEST } from '../constants/refresh-rate-limit.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { RateLoginDto, RateRefreshDto } from '../interfaces/rate-limit.interface';

afterAll(async () => DbHelper.close());

const login = ({ email, clientIp }: RateLoginDto): ReturnType<typeof ApiHelper.request> =>
  ApiHelper.request({ method: 'POST', path: T.LOGIN_PATH, body: { email, password: T.WRONG_PASSWORD }, clientIp });

describe('Rate limiting', () => {
  it('blocks the 6th wrong login for one email from one client within a minute', async () => {
    const clientIp = ApiHelper.randomIp();

    for (let attempt = 1; attempt <= T.LOGIN_ATTEMPTS; attempt++) {
      await expect(login({ email: T.FIRST_EMAIL, clientIp })).resolves.toMatchObject({ status: T.UNAUTHORIZED });
    }

    const blocked = await login({ email: T.FIRST_EMAIL, clientIp });
    expect(blocked).toMatchObject({ status: T.TOO_MANY_REQUESTS, body: { error: { code: T.BLOCKED_CODE } } });
    expect(Number(blocked.headers.get(T.RETRY_AFTER_HEADER))).toBeGreaterThan(0);

    await expect(login({ email: T.SECOND_EMAIL, clientIp })).resolves.toMatchObject({ status: T.UNAUTHORIZED });
    await expect(login({ email: T.FIRST_EMAIL, clientIp: ApiHelper.randomIp() })).resolves.toMatchObject({ status: T.UNAUTHORIZED });
  });

  it('limits session refreshes per browser session, so tabs and people sharing one IP do not lock each other out', async () => {
    const clientIp = ApiHelper.randomIp();
    const refresh = ({ cookie }: RateRefreshDto): Promise<Response> =>
      fetch(`${process.env[TEST_ENV_KEYS.API_URL]}${T.REFRESH_PATH}`, {
        method: 'POST',
        headers: { 'content-type': T.JSON_TYPE, cookie, [T.FORWARDED_HEADER]: clientIp },
        body: T.EMPTY_JSON
      });

    for (let browser = 1; browser <= REFRESH_TEST.SHARED_IP_BROWSERS; browser++) {
      expect((await refresh({ cookie: `${REFRESH_TEST.COOKIE_PREFIX}${browser}` })).status).toBe(T.UNAUTHORIZED);
    }

    for (let attempt = 1; attempt <= REFRESH_TEST.LIMIT; attempt++) await refresh({ cookie: REFRESH_TEST.ONE_SESSION });

    expect((await refresh({ cookie: REFRESH_TEST.ONE_SESSION })).status).toBe(T.TOO_MANY_REQUESTS);
  });
});

describe('Rate limiting: per user', () => {
  it('limits money requests per user, whatever the client IP', async () => {
    await LockoutHelper.clear({ emails: [...T.USERS] });

    const token = await ApiHelper.login({ email: T.FIRST_EMAIL });
    const deposit = (): ReturnType<typeof ApiHelper.request> => ApiHelper.request({ method: 'POST', path: T.DEPOSIT_PATH, token, body: {} });

    for (let attempt = 1; attempt <= T.MONEY_ATTEMPTS; attempt++) {
      await expect(deposit()).resolves.toMatchObject({ status: T.BAD_REQUEST });
    }

    await expect(deposit()).resolves.toMatchObject({ status: T.TOO_MANY_REQUESTS });

    const otherToken = await ApiHelper.login({ email: T.SECOND_EMAIL });

    await expect(ApiHelper.request({ method: 'POST', path: T.DEPOSIT_PATH, token: otherToken, body: {} })).resolves.toMatchObject({
      status: T.BAD_REQUEST
    });

    await expect(ApiHelper.request({ method: 'GET', path: T.WALLETS_PATH, token })).resolves.toMatchObject({ status: T.OK });
  });
});
