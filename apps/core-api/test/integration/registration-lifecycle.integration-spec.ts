import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { EMAIL_TOPICS } from '../constants/email-topics.constant';
import { EmailInboxHelper } from '../helpers/email-inbox.helper';
import { LoginAttemptHelper } from '../helpers/login-attempt.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { LOGIN_STATUS_TEST as L } from '../constants/login-status.constant';

const register = (body: Record<string, unknown>): ReturnType<typeof ApiHelper.request<Record<string, unknown>>> =>
  ApiHelper.request<Record<string, unknown>>({ method: 'POST', path: L.REGISTER_PATH, body });

const verify = (body: Record<string, unknown>): ReturnType<typeof ApiHelper.request<Record<string, unknown>>> =>
  ApiHelper.request<Record<string, unknown>>({ method: 'POST', path: L.VERIFY_PATH, body });

beforeAll(async () => DbHelper.query({ sql: L.SEED_STATUS_SQL }));
afterAll(async () => DbHelper.close());

describe('Registration', () => {
  it('requires accepting the terms at registration and records when they were accepted', async () => {
    const body = { email: L.TERMS_EMAIL, password: L.TERMS_PASSWORD, displayName: L.TERMS_EMAIL };
    await expect(register(body)).resolves.toMatchObject({ status: L.BAD_REQUEST });
    await expect(register({ ...body, termsAccepted: false })).resolves.toMatchObject({ status: L.BAD_REQUEST });
    await expect(DbHelper.query({ sql: L.COUNT_SQL, params: [L.TERMS_EMAIL] })).resolves.toEqual([{ count: 0 }]);

    await expect(register({ ...body, termsAccepted: true })).resolves.toMatchObject({ status: L.CREATED });
    await expect(DbHelper.query({ sql: L.TERMS_SQL, params: [L.TERMS_EMAIL] })).resolves.toEqual([{ accepted_recently: true }]);
  });

  it('emails a verification link on registration and activates the user once it is opened', async () => {
    const email = L.LIFECYCLE_EMAIL;
    const password = L.LIFECYCLE_PASSWORD;
    const registration = await register({ email, password, displayName: email, termsAccepted: true });
    expect(registration.status).toBe(L.CREATED);
    await expect(DbHelper.query({ sql: L.STATUS_BY_EMAIL_SQL, params: [email] })).resolves.toEqual([{ status: L.PENDING }]);
    await expect(LoginAttemptHelper.attempt({ email, password })).resolves.toMatchObject({ status: L.UNAUTHORIZED });

    const link = new URL((await EmailInboxHelper.waitFor({ to: email, topic: EMAIL_TOPICS.EMAIL_VERIFICATION })).url);
    expect(link.pathname).toBe(L.VERIFY_PATH);
    const verification = await verify({ token: link.searchParams.get(L.TOKEN_PARAM) });
    expect(verification.status).toBe(L.CREATED);
    expect(verification.body).toHaveProperty(L.ACCESS_TOKEN);

    await expect(DbHelper.query({ sql: L.STATUS_BY_EMAIL_SQL, params: [email] })).resolves.toEqual([{ status: L.ACTIVE }]);
    await expect(LoginAttemptHelper.attempt({ email, password })).resolves.toMatchObject({ status: L.CREATED });
    await expect(verify({ token: link.searchParams.get(L.TOKEN_PARAM) })).resolves.toMatchObject({ status: L.BAD_REQUEST });
  });
});

describe('Invited and staff-verified users', () => {
  it('sends admin-created users to the set-password page', async () => {
    const globalAdmin = await ApiHelper.login({ email: L.GLOBAL_ADMIN_EMAIL });
    const body = { email: L.INVITED_EMAIL, displayName: L.INVITED_EMAIL, role: L.MODERATOR };
    await expect(ApiHelper.request({ method: 'POST', path: L.USERS_PATH, token: globalAdmin, body })).resolves.toMatchObject({ status: L.CREATED });

    const link = new URL((await EmailInboxHelper.waitFor({ to: L.INVITED_EMAIL, topic: EMAIL_TOPICS.EMAIL_VERIFICATION })).url);
    expect(link.pathname).toBe(L.SET_PASSWORD_PATH);
    await expect(verify({ token: link.searchParams.get(L.TOKEN_PARAM), password: L.INVITED_PASSWORD })).resolves.toMatchObject({ status: L.CREATED });
    await expect(LoginAttemptHelper.attempt({ email: L.INVITED_EMAIL, password: L.INVITED_PASSWORD })).resolves.toMatchObject({ status: L.CREATED });
  });

  it('activates a PENDING user when staff verify the email, but never reactivates a suspended one', async () => {
    const staff = await ApiHelper.login({ email: L.STAFF_EMAIL });
    await register({ email: L.ADMIN_VERIFIED_EMAIL, password: L.ADMIN_VERIFIED_PASSWORD, displayName: L.ADMIN_VERIFIED_EMAIL, termsAccepted: true });
    const pendingId = await TestUserHelper.idOf({ email: L.ADMIN_VERIFIED_EMAIL });
    const suspendedId = await TestUserHelper.idOf({ email: L.SUSPENDED_EMAIL });

    for (const userId of [pendingId, suspendedId]) {
      await ApiHelper.request({
        method: 'PATCH',
        path: `${L.USERS_PATH}/${userId}${L.EMAIL_VERIFICATION_SUFFIX}`,
        token: staff,
        body: { isEmailVerified: true }
      });
    }

    await expect(DbHelper.query({ sql: L.STATUS_BY_ID_SQL, params: [pendingId] })).resolves.toEqual([{ status: L.ACTIVE }]);
    await expect(DbHelper.query({ sql: L.STATUS_BY_ID_SQL, params: [suspendedId] })).resolves.toEqual([{ status: L.SUSPENDED }]);
  });
});
