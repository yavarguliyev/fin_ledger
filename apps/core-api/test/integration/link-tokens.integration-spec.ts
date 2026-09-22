import { CryptoHelper } from '@common/shared-libs';

import { EMAIL_TOPICS } from '../constants/email-topics.constant';
import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { EmailInboxHelper } from '../helpers/email-inbox.helper';

describe('Emailed one-time links', () => {
  afterAll(async () => DbHelper.close());

  const tokenFrom = (url: string): string => new URL(url).searchParams.get('token') as string;

  const requestReset = async (email: string, count = 1): Promise<string> => {
    await ApiHelper.request({ method: 'POST', path: '/auth/forgot-password', body: { email } });
    return tokenFrom((await EmailInboxHelper.waitFor({ to: email, topic: EMAIL_TOPICS.PASSWORD_RESET, count })).url);
  };

  const resetPassword = (token: string, password: string): Promise<{ status: number }> =>
    ApiHelper.request({ method: 'POST', path: '/auth/reset-password', body: { token, password } });

  it('stores only a SHA-256 hash of the token', async () => {
    const token = await requestReset('player10@seed.local');
    const hash = CryptoHelper.sha256({ value: token });

    await expect(DbHelper.query({ sql: 'SELECT count(*)::int AS count FROM auth_tokens WHERE token_hash = $1', params: [hash] })).resolves.toEqual([{ count: 1 }]);
    await expect(DbHelper.query({ sql: 'SELECT count(*)::int AS count FROM auth_tokens WHERE token_hash = $1', params: [token] })).resolves.toEqual([{ count: 0 }]);
  });

  it('lets a password-reset link be used exactly once', async () => {
    const email = 'player11@seed.local';
    const token = await requestReset(email);

    await expect(resetPassword(token, 'Reset#Once2026')).resolves.toMatchObject({ status: 201 });
    await expect(resetPassword(token, 'Reset#Twice2026')).resolves.toMatchObject({ status: 400 });
    await expect(ApiHelper.login({ email, password: 'Reset#Once2026' })).resolves.toEqual(expect.any(String));
  });

  it('revokes the previous link when a new one is sent', async () => {
    const email = 'player12@seed.local';
    const first = await requestReset(email, 1);
    const second = await requestReset(email, 2);

    await expect(resetPassword(first, 'Reset#First2026')).resolves.toMatchObject({ status: 400 });
    await expect(resetPassword(second, 'Reset#Second2026')).resolves.toMatchObject({ status: 201 });
  });

  it('rejects an expired link', async () => {
    const token = await requestReset('player13@seed.local');
    const hash = CryptoHelper.sha256({ value: token });

    await DbHelper.query({
      sql: "UPDATE auth_tokens SET created_at = now() - interval '2 hours', expires_at = now() - interval '1 hour' WHERE token_hash = $1",
      params: [hash]
    });

    await expect(resetPassword(token, 'Reset#Late2026')).resolves.toMatchObject({ status: 400 });
    await expect(ApiHelper.login({ email: 'player13@seed.local', password: SEED_PASSWORD })).resolves.toEqual(expect.any(String));
  });

  it('keeps each purpose to its own endpoint', async () => {
    const resetToken = await requestReset('player14@seed.local');

    await expect(ApiHelper.request({ method: 'POST', path: '/auth/verify-email', body: { token: resetToken, password: 'Cross#Purpose2026' } })).resolves.toMatchObject({ status: 400 });
    await expect(resetPassword(resetToken, 'Reset#Still2026')).resolves.toMatchObject({ status: 201 });
  });

  it('requires a password for an invitation and does not spend the link without one', async () => {
    const globalAdmin = await ApiHelper.login({ email: 'global_admin@seed.local' });
    const email = 'invite-once@integration.test';

    await ApiHelper.request({ method: 'POST', path: '/users', token: globalAdmin, body: { email, displayName: 'Invite Once', role: 'ADMIN' } });
    const token = tokenFrom((await EmailInboxHelper.waitFor({ to: email, topic: EMAIL_TOPICS.EMAIL_VERIFICATION })).url);

    await expect(ApiHelper.request({ method: 'POST', path: '/auth/verify-email', body: { token } })).resolves.toMatchObject({ status: 400 });
    await expect(ApiHelper.request({ method: 'POST', path: '/auth/verify-email', body: { token, password: 'Invite#Once2026' } })).resolves.toMatchObject({ status: 201 });
    await expect(ApiHelper.request({ method: 'POST', path: '/auth/verify-email', body: { token, password: 'Invite#Twice2026' } })).resolves.toMatchObject({ status: 400 });
  });
});
