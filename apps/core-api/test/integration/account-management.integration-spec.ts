import { ACCOUNT_MANAGEMENT } from '../constants/account-management.constant';
import { EMAIL_TOPICS } from '../constants/email-topics.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { EmailInboxHelper } from '../helpers/email-inbox.helper';
import { SessionTokens } from '../interfaces/session-tokens.interface';

describe('Signed-in account management', () => {
  let session: SessionTokens;

  const signIn = async (email: string, password: string): Promise<SessionTokens> => {
    const response = await ApiHelper.request<SessionTokens>({ method: 'POST', path: ACCOUNT_MANAGEMENT.LOGIN_PATH, body: { email, password } });
    expect(response.status).toBe(ACCOUNT_MANAGEMENT.CREATED);
    return response.body;
  };

  beforeAll(async () => {
    const { EMAIL, DISPLAY_NAME, PASSWORD } = ACCOUNT_MANAGEMENT;

    await ApiHelper.request({
      method: 'POST',
      path: ACCOUNT_MANAGEMENT.REGISTER_PATH,
      body: { email: EMAIL, password: PASSWORD, displayName: DISPLAY_NAME, termsAccepted: true }
    });

    const sent = await EmailInboxHelper.waitFor({ to: EMAIL, topic: EMAIL_TOPICS.EMAIL_VERIFICATION });
    const token = new URL(sent.url).searchParams.get('token');

    await ApiHelper.request({ method: 'POST', path: ACCOUNT_MANAGEMENT.VERIFY_EMAIL_PATH, body: { token } });
    session = await signIn(EMAIL, PASSWORD);
  });

  afterAll(async () => DbHelper.close());

  it('refuses a password change that does not know the current password', async () => {
    const response = await ApiHelper.request({
      method: 'POST',
      path: ACCOUNT_MANAGEMENT.CHANGE_PASSWORD_PATH,
      token: session.accessToken,
      body: { currentPassword: ACCOUNT_MANAGEMENT.WRONG_PASSWORD, newPassword: ACCOUNT_MANAGEMENT.NEW_PASSWORD }
    });

    expect(response.status).toBe(ACCOUNT_MANAGEMENT.BAD_REQUEST);
  });

  it('changes the password, keeps this session working and signs the other ones out', async () => {
    const otherDevice = await signIn(ACCOUNT_MANAGEMENT.EMAIL, ACCOUNT_MANAGEMENT.PASSWORD);

    const changed = await ApiHelper.request<SessionTokens>({
      method: 'POST',
      path: ACCOUNT_MANAGEMENT.CHANGE_PASSWORD_PATH,
      token: session.accessToken,
      body: { currentPassword: ACCOUNT_MANAGEMENT.PASSWORD, newPassword: ACCOUNT_MANAGEMENT.NEW_PASSWORD }
    });

    expect(changed.status).toBe(ACCOUNT_MANAGEMENT.CREATED);
    expect(changed.body.accessToken).not.toBe(session.accessToken);

    await expect(ApiHelper.request({ path: ACCOUNT_MANAGEMENT.WALLETS_PATH, token: changed.body.accessToken })).resolves.toMatchObject({
      status: ACCOUNT_MANAGEMENT.OK
    });
    await expect(ApiHelper.request({ path: ACCOUNT_MANAGEMENT.WALLETS_PATH, token: otherDevice.accessToken })).resolves.toMatchObject({
      status: ACCOUNT_MANAGEMENT.UNAUTHORIZED
    });

    await expect(signIn(ACCOUNT_MANAGEMENT.EMAIL, ACCOUNT_MANAGEMENT.NEW_PASSWORD)).resolves.toBeDefined();
    await expect(EmailInboxHelper.waitFor({ to: ACCOUNT_MANAGEMENT.EMAIL, topic: EMAIL_TOPICS.PASSWORD_CHANGED })).resolves.toBeDefined();

    session = changed.body;
  });

  it('records the address the sign-in came from', async () => {
    const [record] = await DbHelper.query<{ has_ip: boolean }>({
      sql: 'SELECT last_login_ip IS NOT NULL AS has_ip FROM users WHERE email = $1',
      params: [ACCOUNT_MANAGEMENT.EMAIL]
    });

    expect(record).toEqual({ has_ip: true });
  });

  it('refuses an email change to an address somebody else already uses', async () => {
    const response = await ApiHelper.request({
      method: 'POST',
      path: ACCOUNT_MANAGEMENT.CHANGE_EMAIL_PATH,
      token: session.accessToken,
      body: { newEmail: ACCOUNT_MANAGEMENT.TAKEN_EMAIL, currentPassword: ACCOUNT_MANAGEMENT.NEW_PASSWORD }
    });

    expect(response.status).toBe(ACCOUNT_MANAGEMENT.BAD_REQUEST);
  });

  it('only moves the address once the link sent to it is opened, and tells the old address', async () => {
    const { EMAIL, NEW_EMAIL, NEW_PASSWORD } = ACCOUNT_MANAGEMENT;

    const requested = await ApiHelper.request({
      method: 'POST',
      path: ACCOUNT_MANAGEMENT.CHANGE_EMAIL_PATH,
      token: session.accessToken,
      body: { newEmail: NEW_EMAIL, currentPassword: NEW_PASSWORD }
    });

    expect(requested.status).toBe(ACCOUNT_MANAGEMENT.CREATED);

    await expect(DbHelper.query({ sql: 'SELECT email, pending_email FROM users WHERE email = $1', params: [EMAIL] })).resolves.toEqual([
      { email: EMAIL, pending_email: NEW_EMAIL }
    ]);
    await expect(signIn(NEW_EMAIL, NEW_PASSWORD)).rejects.toThrow();

    const sent = await EmailInboxHelper.waitFor({ to: NEW_EMAIL, topic: EMAIL_TOPICS.EMAIL_CHANGE_CONFIRM });
    const link = new URL(sent.url);

    expect(link.pathname).toBe(ACCOUNT_MANAGEMENT.CONFIRM_EMAIL_CHANGE_PATH);

    const confirmed = await ApiHelper.request({
      method: 'POST',
      path: ACCOUNT_MANAGEMENT.CONFIRM_EMAIL_CHANGE_PATH,
      body: { token: link.searchParams.get('token') }
    });

    expect(confirmed.status).toBe(ACCOUNT_MANAGEMENT.CREATED);

    await expect(DbHelper.query({ sql: 'SELECT pending_email FROM users WHERE email = $1', params: [NEW_EMAIL] })).resolves.toEqual([
      { pending_email: null }
    ]);
    await expect(ApiHelper.request({ path: ACCOUNT_MANAGEMENT.WALLETS_PATH, token: session.accessToken })).resolves.toMatchObject({
      status: ACCOUNT_MANAGEMENT.UNAUTHORIZED
    });
    await expect(signIn(NEW_EMAIL, NEW_PASSWORD)).resolves.toBeDefined();
    await expect(EmailInboxHelper.waitFor({ to: EMAIL, topic: EMAIL_TOPICS.EMAIL_CHANGED_NOTICE })).resolves.toBeDefined();

    await expect(
      ApiHelper.request({ method: 'POST', path: ACCOUNT_MANAGEMENT.CONFIRM_EMAIL_CHANGE_PATH, body: { token: link.searchParams.get('token') } })
    ).resolves.toMatchObject({ status: ACCOUNT_MANAGEMENT.BAD_REQUEST });
  });
});
