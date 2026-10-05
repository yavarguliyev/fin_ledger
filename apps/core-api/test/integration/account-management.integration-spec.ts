import { ACCOUNT_MANAGEMENT as A } from '../constants/account-management.constant';
import { EMAIL_TOPICS } from '../constants/email-topics.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { EmailInboxHelper } from '../helpers/email-inbox.helper';
import { AccountIpRow, AccountSignInDto } from '../interfaces/account-management.interface';
import { SessionTokens } from '../interfaces/session-tokens.interface';

let session: SessionTokens;

const signIn = async ({ email, password }: AccountSignInDto): Promise<SessionTokens> => {
  const response = await ApiHelper.request<SessionTokens>({ method: 'POST', path: A.LOGIN_PATH, body: { email, password } });
  expect(response.status).toBe(A.CREATED);
  return response.body;
};

beforeAll(async () => {
  const { EMAIL, DISPLAY_NAME, PASSWORD } = A;

  await ApiHelper.request({
    method: 'POST',
    path: A.REGISTER_PATH,
    body: { email: EMAIL, password: PASSWORD, displayName: DISPLAY_NAME, termsAccepted: true }
  });

  const sent = await EmailInboxHelper.waitFor({ to: EMAIL, topic: EMAIL_TOPICS.EMAIL_VERIFICATION });
  const token = new URL(sent.url).searchParams.get(A.TOKEN_PARAM);

  await ApiHelper.request({ method: 'POST', path: A.VERIFY_EMAIL_PATH, body: { token } });
  session = await signIn({ email: EMAIL, password: PASSWORD });
});

afterAll(async () => DbHelper.close());

describe('Signed-in account management', () => {
  it('refuses a password change that does not know the current password', async () => {
    const response = await ApiHelper.request({
      method: 'POST',
      path: A.CHANGE_PASSWORD_PATH,
      token: session.accessToken,
      body: { currentPassword: A.WRONG_PASSWORD, newPassword: A.NEW_PASSWORD }
    });

    expect(response.status).toBe(A.BAD_REQUEST);
  });

  it('changes the password, keeps this session working and signs the other ones out', async () => {
    const otherDevice = await signIn({ email: A.EMAIL, password: A.PASSWORD });

    const changed = await ApiHelper.request<SessionTokens>({
      method: 'POST',
      path: A.CHANGE_PASSWORD_PATH,
      token: session.accessToken,
      body: { currentPassword: A.PASSWORD, newPassword: A.NEW_PASSWORD }
    });

    expect(changed.status).toBe(A.CREATED);
    expect(changed.body.accessToken).not.toBe(session.accessToken);

    await expect(ApiHelper.request({ path: A.WALLETS_PATH, token: changed.body.accessToken })).resolves.toMatchObject({
      status: A.OK
    });
    await expect(ApiHelper.request({ path: A.WALLETS_PATH, token: otherDevice.accessToken })).resolves.toMatchObject({
      status: A.UNAUTHORIZED
    });

    await expect(signIn({ email: A.EMAIL, password: A.NEW_PASSWORD })).resolves.toBeDefined();
    await expect(EmailInboxHelper.waitFor({ to: A.EMAIL, topic: EMAIL_TOPICS.PASSWORD_CHANGED })).resolves.toBeDefined();

    session = changed.body;
  });

  it('records the address the sign-in came from', async () => {
    const [record] = await DbHelper.query<AccountIpRow>({
      sql: A.HAS_IP_SQL,
      params: [A.EMAIL]
    });

    expect(record).toEqual(A.HAS_IP);
  });
});

describe('Signed-in account management: email changes', () => {
  it('refuses an email change to an address somebody else already uses', async () => {
    const response = await ApiHelper.request({
      method: 'POST',
      path: A.CHANGE_EMAIL_PATH,
      token: session.accessToken,
      body: { newEmail: A.TAKEN_EMAIL, currentPassword: A.NEW_PASSWORD }
    });

    expect(response.status).toBe(A.BAD_REQUEST);
  });
});

describe('Signed-in account management: confirming an email change', () => {
  it('only moves the address once the link sent to it is opened, and tells the old address', async () => {
    const { EMAIL, NEW_EMAIL, NEW_PASSWORD } = A;

    const requested = await ApiHelper.request({
      method: 'POST',
      path: A.CHANGE_EMAIL_PATH,
      token: session.accessToken,
      body: { newEmail: NEW_EMAIL, currentPassword: NEW_PASSWORD }
    });

    expect(requested.status).toBe(A.CREATED);

    await expect(DbHelper.query({ sql: A.EMAILS_SQL, params: [EMAIL] })).resolves.toEqual([
      { email: EMAIL, pending_email: NEW_EMAIL }
    ]);
    await expect(signIn({ email: NEW_EMAIL, password: NEW_PASSWORD })).rejects.toThrow();

    const sent = await EmailInboxHelper.waitFor({ to: NEW_EMAIL, topic: EMAIL_TOPICS.EMAIL_CHANGE_CONFIRM });
    const link = new URL(sent.url);

    expect(link.pathname).toBe(A.CONFIRM_EMAIL_CHANGE_PATH);

    const confirmed = await ApiHelper.request({
      method: 'POST',
      path: A.CONFIRM_EMAIL_CHANGE_PATH,
      body: { token: link.searchParams.get(A.TOKEN_PARAM) }
    });

    expect(confirmed.status).toBe(A.CREATED);

    await expect(DbHelper.query({ sql: A.PENDING_SQL, params: [NEW_EMAIL] })).resolves.toEqual(A.NO_PENDING);
    await expect(ApiHelper.request({ path: A.WALLETS_PATH, token: session.accessToken })).resolves.toMatchObject({
      status: A.UNAUTHORIZED
    });
    await expect(signIn({ email: NEW_EMAIL, password: NEW_PASSWORD })).resolves.toBeDefined();
    await expect(EmailInboxHelper.waitFor({ to: EMAIL, topic: EMAIL_TOPICS.EMAIL_CHANGED_NOTICE })).resolves.toBeDefined();

    await expect(
      ApiHelper.request({ method: 'POST', path: A.CONFIRM_EMAIL_CHANGE_PATH, body: { token: link.searchParams.get(A.TOKEN_PARAM) } })
    ).resolves.toMatchObject({ status: A.BAD_REQUEST });
  });
});
