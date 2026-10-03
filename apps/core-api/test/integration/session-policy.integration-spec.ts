import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { SESSION_POLICY as S } from '../constants/session-policy.constant';
import { SessionTestHelper as T } from '../helpers/session-test.helper';

afterAll(async () => DbHelper.close());

describe('Session policy: short access tokens with a rotating refresh cookie', () => {
  it('hands out a 15 minute access token and keeps the refresh token in an http-only cookie', async () => {
    const session = await T.signIn({ email: S.REFRESH_USER });
    const [cookie] = session.headers.getSetCookie();

    expect(session.body.expiresIn).toBe(S.ACCESS_TTL_SECONDS);
    expect(session.body).not.toHaveProperty(S.TOKEN_FIELD);
    expect(cookie).toContain(S.HTTP_ONLY);
    expect(cookie).toContain(S.SAME_SITE);
  });

  it('answers a refresh with no cookie as unauthorized rather than a validation failure', async () => {
    await expect(ApiHelper.request({ method: 'POST', path: S.REFRESH_PATH, body: {} })).resolves.toMatchObject({ status: S.UNAUTHORIZED });
  });

  it('exchanges the cookie for a fresh access token and a new cookie', async () => {
    const session = await T.signIn({ email: S.REFRESH_USER });
    const rotated = await T.refresh({ cookie: ApiHelper.refreshCookie(session) });

    expect(rotated.status).toBe(S.CREATED);
    expect(rotated.body.accessToken).not.toBe(session.body.accessToken);
    expect(ApiHelper.refreshCookie(rotated)).not.toBe(ApiHelper.refreshCookie(session));
    await expect(T.walletsStatus({ token: rotated.body.accessToken })).resolves.toBe(S.OK);
  });
});

describe('Refresh token rotation', () => {
  it('ends every session of the account when an old refresh token is replayed', async () => {
    const first = await T.signIn({ email: S.REPLAY_USER });
    const second = await T.signIn({ email: S.REPLAY_USER });
    const rotated = await T.refresh({ cookie: ApiHelper.refreshCookie(first) });
    expect(rotated.status).toBe(S.CREATED);

    await new Promise(resolve => setTimeout(resolve, S.GRACE_WAIT_MS));

    for (const session of [first, rotated, second]) {
      await expect(T.refresh({ cookie: ApiHelper.refreshCookie(session) })).resolves.toMatchObject({ status: S.UNAUTHORIZED });
    }
    await expect(T.walletsStatus({ token: second.body.accessToken })).resolves.toBe(S.UNAUTHORIZED);
  });

  it('treats two refreshes racing on one cookie as the same rotation, not as theft', async () => {
    const cookie = ApiHelper.refreshCookie(await T.signIn({ email: S.REFRESH_USER }));
    const [first, second] = await Promise.all([T.refresh({ cookie }), T.refresh({ cookie })]);

    expect(first.status).toBe(S.CREATED);
    expect(second.status).toBe(S.CREATED);
    await expect(T.walletsStatus({ token: first.body.accessToken })).resolves.toBe(S.OK);
    await expect(T.walletsStatus({ token: second.body.accessToken })).resolves.toBe(S.OK);
  });
});
