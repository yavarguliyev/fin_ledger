import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { SESSION_POLICY as S } from '../constants/session-policy.constant';
import { SessionTestHelper as T } from '../helpers/session-test.helper';
import { StreamTicket } from '../interfaces/stream-ticket.interface';

afterAll(async () => DbHelper.close());

describe('Logging out', () => {
  it('revokes the refresh token and clears the cookie on logout', async () => {
    const session = await T.signIn({ email: S.REFRESH_USER });
    const cookie = ApiHelper.refreshCookie(session);
    const loggedOut = await ApiHelper.request({ method: 'POST', path: S.LOGOUT_PATH, token: session.body.accessToken, cookie, body: {} });

    expect(loggedOut.status).toBe(S.CREATED);
    expect(ApiHelper.refreshCookie(loggedOut)).toBe(`${S.TOKEN_COOKIE}=`);
    await expect(T.refresh({ cookie })).resolves.toMatchObject({ status: S.UNAUTHORIZED });
  });

  it('logs out every device on request', async () => {
    const first = await T.signIn({ email: S.LOGOUT_ALL_USER });
    const second = await T.signIn({ email: S.LOGOUT_ALL_USER });
    await expect(ApiHelper.request({ method: 'POST', path: S.LOGOUT_ALL_PATH, token: first.body.accessToken, body: {} })).resolves.toMatchObject({
      status: S.CREATED
    });

    for (const session of [first, second]) {
      await expect(T.walletsStatus({ token: session.body.accessToken })).resolves.toBe(S.UNAUTHORIZED);
    }
    await expect(T.refresh({ cookie: ApiHelper.refreshCookie(second) })).resolves.toMatchObject({ status: S.UNAUTHORIZED });
  });
});

describe('Reading the session', () => {
  it('opens the notification stream with a single-use ticket instead of the access token', async () => {
    const session = await T.signIn({ email: S.REFRESH_USER });
    const issued = await ApiHelper.request<StreamTicket>({ method: 'POST', path: S.TICKET_PATH, token: session.body.accessToken, body: {} });
    expect(issued.status).toBe(S.CREATED);

    const withTicket = `${S.STREAM_PATH}${S.TICKET_QUERY}${issued.body.ticket}`;
    await expect(ApiHelper.stream({ path: withTicket })).resolves.toBe(S.OK);
    await expect(ApiHelper.stream({ path: withTicket })).resolves.toBe(S.UNAUTHORIZED);
    await expect(ApiHelper.stream({ path: `${S.STREAM_PATH}${S.TOKEN_QUERY}${session.body.accessToken}` })).resolves.toBe(S.UNAUTHORIZED);
  });

  it('reads the current user without minting a new access token', async () => {
    const session = await T.signIn({ email: S.REFRESH_USER });
    const me = await ApiHelper.request<Record<string, unknown>>({ path: S.ME_PATH, token: session.body.accessToken });

    expect(me.status).toBe(S.OK);
    expect(me.body).not.toHaveProperty(S.ACCESS_TOKEN_FIELD);
    expect(me.body).toHaveProperty(S.USER_FIELD);
  });
});
