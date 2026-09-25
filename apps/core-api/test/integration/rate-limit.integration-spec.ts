import { ApiHelper } from '../helpers/api.helper';

describe('Rate limiting', () => {
  const login = (email: string, clientIp: string): ReturnType<typeof ApiHelper.request> =>
    ApiHelper.request({ method: 'POST', path: '/auth/login', body: { email, password: 'Wrong#Pass2026' }, clientIp });

  it('blocks the 6th wrong login for one email from one client within a minute', async () => {
    const clientIp = ApiHelper.randomIp();

    for (let attempt = 1; attempt <= 5; attempt++) {
      await expect(login('player20@seed.local', clientIp)).resolves.toMatchObject({ status: 401 });
    }

    const blocked = await login('player20@seed.local', clientIp);
    expect(blocked).toMatchObject({ status: 429, body: { error: { code: 'HTTP_429' } } });
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);

    await expect(login('player21@seed.local', clientIp)).resolves.toMatchObject({ status: 401 });
    await expect(login('player20@seed.local', ApiHelper.randomIp())).resolves.toMatchObject({ status: 401 });
  });

  it('limits money requests per user, whatever the client IP', async () => {
    const token = await ApiHelper.login({ email: 'player20@seed.local' });
    const deposit = (): ReturnType<typeof ApiHelper.request> => ApiHelper.request({ method: 'POST', path: '/payments/deposit', token, body: {} });

    for (let attempt = 1; attempt <= 30; attempt++) {
      await expect(deposit()).resolves.toMatchObject({ status: 400 });
    }

    await expect(deposit()).resolves.toMatchObject({ status: 429 });

    const otherToken = await ApiHelper.login({ email: 'player21@seed.local' });

    await expect(ApiHelper.request({ method: 'POST', path: '/payments/deposit', token: otherToken, body: {} })).resolves.toMatchObject({
      status: 400
    });

    await expect(ApiHelper.request({ method: 'GET', path: '/wallets', token })).resolves.toMatchObject({ status: 200 });
  });
});
