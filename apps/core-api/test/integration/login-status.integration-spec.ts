import Redis from 'ioredis';
import jwt from 'jsonwebtoken';

import { EMAIL_TOPICS } from '../constants/email-topics.constant';
import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { EmailInboxHelper } from '../helpers/email-inbox.helper';

describe('Login and user status lifecycle', () => {
  beforeAll(async () => {
    await DbHelper.query({
      sql: `UPDATE users SET status = v.status::user_status
            FROM (VALUES ('player4@seed.local', 'SUSPENDED'), ('player5@seed.local', 'CLOSED'), ('player6@seed.local', 'PENDING')) v(email, status)
            WHERE users.email = v.email`
    });
  });

  afterAll(async () => DbHelper.close());

  const login = (email: string, password = SEED_PASSWORD): Promise<{ status: number; body: unknown }> =>
    ApiHelper.request({ method: 'POST', path: '/auth/login', body: { email, password } });

  it.each([
    ['player3@seed.local', 'ACTIVE', 201],
    ['player4@seed.local', 'SUSPENDED', 401],
    ['player5@seed.local', 'CLOSED', 401],
    ['player6@seed.local', 'PENDING', 401]
  ])('%s (%s) logs in with HTTP %i', async (email, _status, expected) => {
    await expect(login(email)).resolves.toMatchObject({ status: expected });
  });

  it('gives blocked users the same message as a wrong password', async () => {
    const blocked = await login('player4@seed.local');
    const wrongPassword = await login('player3@seed.local', 'Wrong#Pass2026');

    expect(blocked.body).toEqual(expect.objectContaining({ error: expect.objectContaining({ message: 'Invalid credentials' }) }));
    expect(wrongPassword.body).toEqual(expect.objectContaining({ error: expect.objectContaining({ message: 'Invalid credentials' }) }));
  });

  it('requires accepting the terms at registration and records when they were accepted', async () => {
    const email = 'terms@integration.test';
    const body = { email, password: 'Terms#Pass2026', displayName: 'Terms' };

    await expect(ApiHelper.request({ method: 'POST', path: '/auth/register', body })).resolves.toMatchObject({ status: 400 });
    await expect(ApiHelper.request({ method: 'POST', path: '/auth/register', body: { ...body, termsAccepted: false } })).resolves.toMatchObject({ status: 400 });
    await expect(DbHelper.query({ sql: 'SELECT count(*)::int AS count FROM users WHERE email = $1', params: [email] })).resolves.toEqual([{ count: 0 }]);

    await expect(ApiHelper.request({ method: 'POST', path: '/auth/register', body: { ...body, termsAccepted: true } })).resolves.toMatchObject({ status: 201 });

    const [user] = await DbHelper.query<{ accepted_recently: boolean }>({
      sql: "SELECT terms_accepted_at > now() - interval '1 minute' AS accepted_recently FROM users WHERE email = $1",
      params: [email]
    });
    expect(user).toEqual({ accepted_recently: true });
  });

  it('emails a verification link on registration and activates the user once it is opened', async () => {
    const email = 'lifecycle@integration.test';
    const password = 'Lifecycle#Pass2026';

    const registration = await ApiHelper.request<Record<string, unknown>>({ method: 'POST', path: '/auth/register', body: { email, password, displayName: 'Lifecycle', termsAccepted: true } });
    expect(registration.status).toBe(201);
    expect(registration.body).toEqual({ success: true, message: expect.any(String) as string });
    await expect(DbHelper.query({ sql: 'SELECT status FROM users WHERE email = $1', params: [email] })).resolves.toEqual([{ status: 'PENDING' }]);
    await expect(login(email, password)).resolves.toMatchObject({ status: 401 });

    const sent = await EmailInboxHelper.waitFor({ to: email, topic: EMAIL_TOPICS.EMAIL_VERIFICATION });
    const link = new URL(sent.url);
    expect(link.pathname).toBe('/auth/verify-email');

    const verification = await ApiHelper.request<Record<string, unknown>>({ method: 'POST', path: '/auth/verify-email', body: { token: link.searchParams.get('token') } });
    expect(verification.status).toBe(201);
    expect(verification.body).toHaveProperty('accessToken');
    await expect(DbHelper.query({ sql: 'SELECT status FROM users WHERE email = $1', params: [email] })).resolves.toEqual([{ status: 'ACTIVE' }]);
    await expect(login(email, password)).resolves.toMatchObject({ status: 201 });

    await expect(ApiHelper.request({ method: 'POST', path: '/auth/verify-email', body: { token: link.searchParams.get('token') } })).resolves.toMatchObject({ status: 400 });
  });

  it('sends admin-created users to the set-password page', async () => {
    const globalAdmin = await ApiHelper.login({ email: 'global_admin@seed.local' });
    const email = 'invited@integration.test';

    await expect(ApiHelper.request({ method: 'POST', path: '/users', token: globalAdmin, body: { email, displayName: 'Invited', role: 'MODERATOR' } })).resolves.toMatchObject({ status: 201 });

    const sent = await EmailInboxHelper.waitFor({ to: email, topic: EMAIL_TOPICS.EMAIL_VERIFICATION });
    const link = new URL(sent.url);
    expect(link.pathname).toBe('/auth/set-password');

    const password = 'Invited#Pass2026';
    await expect(ApiHelper.request({ method: 'POST', path: '/auth/verify-email', body: { token: link.searchParams.get('token'), password } })).resolves.toMatchObject({ status: 201 });
    await expect(login(email, password)).resolves.toMatchObject({ status: 201 });
  });

  it('activates a PENDING user when staff verify the email, but never reactivates a suspended one', async () => {
    const staff = await ApiHelper.login({ email: 'admin@seed.local' });
    const email = 'admin-verified@integration.test';

    await ApiHelper.request({ method: 'POST', path: '/auth/register', body: { email, password: 'AdminVerified#2026', displayName: 'Admin Verified', termsAccepted: true } });
    const [pending] = await DbHelper.query<{ id: string }>({ sql: 'SELECT id FROM users WHERE email = $1', params: [email] });
    const [suspended] = await DbHelper.query<{ id: string }>({ sql: "SELECT id FROM users WHERE email = 'player4@seed.local'" });

    for (const user of [pending, suspended]) {
      await ApiHelper.request({ method: 'PATCH', path: `/users/${user?.id}/email-verification`, token: staff, body: { isEmailVerified: true } });
    }

    await expect(DbHelper.query({ sql: 'SELECT status FROM users WHERE id = $1', params: [pending?.id] })).resolves.toEqual([{ status: 'ACTIVE' }]);
    await expect(DbHelper.query({ sql: 'SELECT status FROM users WHERE id = $1', params: [suspended?.id] })).resolves.toEqual([{ status: 'SUSPENDED' }]);
  });

  it('rejects a session whose snapshot is no longer ACTIVE', async () => {
    const token = await ApiHelper.login({ email: 'player3@seed.local' });
    await expect(ApiHelper.request({ path: '/wallets', token })).resolves.toMatchObject({ status: 200 });

    const { userId, jti } = jwt.decode(token) as { userId: string; jti: string };
    const key = `session:${userId}:${jti}`;
    const redis = new Redis(process.env[TEST_ENV_KEYS.REDIS_URL] as string);

    const session = JSON.parse((await redis.get(key)) as string) as Record<string, unknown>;
    await redis.set(key, JSON.stringify({ ...session, status: 'SUSPENDED' }), 'KEEPTTL');
    redis.disconnect();

    await expect(ApiHelper.request({ path: '/wallets', token })).resolves.toMatchObject({ status: 401 });
  });

  it('takes about as long for an unknown email as for a wrong password', async () => {
    const median = async (email: string): Promise<number> => {
      const timings: number[] = [];

      for (let attempt = 0; attempt < 10; attempt++) {
        const started = performance.now();
        await login(email, 'Wrong#Pass2026');
        timings.push(performance.now() - started);
      }

      return timings.sort((a, b) => a - b)[5] as number;
    };

    await login('warm-up@integration.test', 'Wrong#Pass2026');
    const unknownEmail = await median('ghost@integration.test');
    const wrongPassword = await median('player3@seed.local');

    expect(unknownEmail / wrongPassword).toBeGreaterThan(0.5);
    expect(unknownEmail / wrongPassword).toBeLessThan(2);
  });
});
