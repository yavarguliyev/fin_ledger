import { SESSION_POLICY } from '../constants/session-policy.constant';
import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { ApiResponse } from '../interfaces/api-response.interface';
import { SessionTokens } from '../interfaces/session-tokens.interface';
import { StreamTicket } from '../interfaces/stream-ticket.interface';

describe('Session policy: short access tokens with a rotating refresh cookie', () => {
  afterAll(async () => DbHelper.close());

  const signIn = async (email: string): Promise<ApiResponse<SessionTokens>> => {
    const response = await ApiHelper.request<SessionTokens>({
      method: 'POST',
      path: SESSION_POLICY.LOGIN_PATH,
      body: { email, password: SEED_PASSWORD }
    });

    expect(response.status).toBe(SESSION_POLICY.CREATED);
    return response;
  };

  const refresh = async (cookie: string): Promise<ApiResponse<SessionTokens>> =>
    ApiHelper.request<SessionTokens>({ method: 'POST', path: SESSION_POLICY.REFRESH_PATH, cookie, body: {} });

  it('hands out a 15 minute access token and keeps the refresh token in an http-only cookie', async () => {
    const session = await signIn(SESSION_POLICY.REFRESH_USER);
    const [cookie] = session.headers.getSetCookie();

    expect(session.body.expiresIn).toBe(SESSION_POLICY.ACCESS_TTL_SECONDS);
    expect(session.body).not.toHaveProperty(SESSION_POLICY.TOKEN_FIELD);
    expect(cookie).toContain(SESSION_POLICY.HTTP_ONLY);
    expect(cookie).toContain(SESSION_POLICY.SAME_SITE);
  });

  it('answers a refresh with no cookie as unauthorized rather than a validation failure', async () => {
    const response = await ApiHelper.request({ method: 'POST', path: SESSION_POLICY.REFRESH_PATH, body: {} });

    expect(response.status).toBe(SESSION_POLICY.UNAUTHORIZED);
  });

  it('exchanges the cookie for a fresh access token and a new cookie', async () => {
    const session = await signIn(SESSION_POLICY.REFRESH_USER);
    const rotated = await refresh(ApiHelper.refreshCookie(session));

    expect(rotated.status).toBe(SESSION_POLICY.CREATED);
    expect(rotated.body.accessToken).not.toBe(session.body.accessToken);
    expect(ApiHelper.refreshCookie(rotated)).not.toBe(ApiHelper.refreshCookie(session));

    await expect(ApiHelper.request({ path: SESSION_POLICY.WALLETS_PATH, token: rotated.body.accessToken })).resolves.toMatchObject({
      status: SESSION_POLICY.OK
    });
  });

  it('ends every session of the account when an old refresh token is replayed', async () => {
    const first = await signIn(SESSION_POLICY.REPLAY_USER);
    const second = await signIn(SESSION_POLICY.REPLAY_USER);
    const rotated = await refresh(ApiHelper.refreshCookie(first));

    expect(rotated.status).toBe(SESSION_POLICY.CREATED);

    await new Promise(resolve => setTimeout(resolve, SESSION_POLICY.GRACE_WAIT_MS));

    await expect(refresh(ApiHelper.refreshCookie(first))).resolves.toMatchObject({ status: SESSION_POLICY.UNAUTHORIZED });
    await expect(refresh(ApiHelper.refreshCookie(rotated))).resolves.toMatchObject({ status: SESSION_POLICY.UNAUTHORIZED });
    await expect(refresh(ApiHelper.refreshCookie(second))).resolves.toMatchObject({ status: SESSION_POLICY.UNAUTHORIZED });
    await expect(ApiHelper.request({ path: SESSION_POLICY.WALLETS_PATH, token: second.body.accessToken })).resolves.toMatchObject({
      status: SESSION_POLICY.UNAUTHORIZED
    });
  });

  it('treats two refreshes racing on one cookie as the same rotation, not as theft', async () => {
    const session = await signIn(SESSION_POLICY.REFRESH_USER);
    const cookie = ApiHelper.refreshCookie(session);

    const [first, second] = await Promise.all([refresh(cookie), refresh(cookie)]);

    expect(first.status).toBe(SESSION_POLICY.CREATED);
    expect(second.status).toBe(SESSION_POLICY.CREATED);

    await expect(ApiHelper.request({ path: SESSION_POLICY.WALLETS_PATH, token: first.body.accessToken })).resolves.toMatchObject({
      status: SESSION_POLICY.OK
    });
    await expect(ApiHelper.request({ path: SESSION_POLICY.WALLETS_PATH, token: second.body.accessToken })).resolves.toMatchObject({
      status: SESSION_POLICY.OK
    });
  });

  it('revokes the refresh token and clears the cookie on logout', async () => {
    const session = await signIn(SESSION_POLICY.REFRESH_USER);
    const cookie = ApiHelper.refreshCookie(session);

    const loggedOut = await ApiHelper.request({
      method: 'POST',
      path: SESSION_POLICY.LOGOUT_PATH,
      token: session.body.accessToken,
      cookie,
      body: {}
    });

    expect(loggedOut.status).toBe(SESSION_POLICY.CREATED);
    expect(ApiHelper.refreshCookie(loggedOut)).toBe(`${SESSION_POLICY.TOKEN_COOKIE}=`);
    await expect(refresh(cookie)).resolves.toMatchObject({ status: SESSION_POLICY.UNAUTHORIZED });
  });

  it('logs out every device on request', async () => {
    const first = await signIn(SESSION_POLICY.LOGOUT_ALL_USER);
    const second = await signIn(SESSION_POLICY.LOGOUT_ALL_USER);

    await expect(
      ApiHelper.request({ method: 'POST', path: SESSION_POLICY.LOGOUT_ALL_PATH, token: first.body.accessToken, body: {} })
    ).resolves.toMatchObject({ status: SESSION_POLICY.CREATED });

    for (const session of [first, second]) {
      await expect(ApiHelper.request({ path: SESSION_POLICY.WALLETS_PATH, token: session.body.accessToken })).resolves.toMatchObject({
        status: SESSION_POLICY.UNAUTHORIZED
      });
    }

    await expect(refresh(ApiHelper.refreshCookie(second))).resolves.toMatchObject({ status: SESSION_POLICY.UNAUTHORIZED });
  });

  it('opens the notification stream with a single-use ticket instead of the access token', async () => {
    const session = await signIn(SESSION_POLICY.REFRESH_USER);
    const issued = await ApiHelper.request<StreamTicket>({
      method: 'POST',
      path: SESSION_POLICY.TICKET_PATH,
      token: session.body.accessToken,
      body: {}
    });

    expect(issued.status).toBe(SESSION_POLICY.CREATED);

    const streamed = await ApiHelper.stream({ path: `${SESSION_POLICY.STREAM_PATH}?ticket=${issued.body.ticket}` });
    expect(streamed).toBe(SESSION_POLICY.OK);

    await expect(ApiHelper.stream({ path: `${SESSION_POLICY.STREAM_PATH}?ticket=${issued.body.ticket}` })).resolves.toBe(SESSION_POLICY.UNAUTHORIZED);
    await expect(ApiHelper.stream({ path: `${SESSION_POLICY.STREAM_PATH}?token=${session.body.accessToken}` })).resolves.toBe(
      SESSION_POLICY.UNAUTHORIZED
    );
  });

  it('reads the current user without minting a new access token', async () => {
    const session = await signIn(SESSION_POLICY.REFRESH_USER);
    const me = await ApiHelper.request<Record<string, unknown>>({ path: SESSION_POLICY.ME_PATH, token: session.body.accessToken });

    expect(me.status).toBe(SESSION_POLICY.OK);
    expect(me.body).not.toHaveProperty('accessToken');
    expect(me.body).toHaveProperty('user');
  });
});
