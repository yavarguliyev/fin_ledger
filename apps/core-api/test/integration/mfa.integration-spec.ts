import { generateSync } from 'otplib';
import { CryptoHelper } from '@common/shared-libs';

import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';

describe('Two-factor authentication setup', () => {
  const email = 'player15@seed.local';
  let token = '';
  let secret = '';
  let firstRecoveryCodes: string[] = [];

  const status = (): Promise<{ status: number; body: unknown }> => ApiHelper.request({ path: '/auth/mfa/status', token });
  const enrol = async (): Promise<string[]> => {
    const setup = await ApiHelper.request<{ otpauthUri: string }>({ method: 'POST', path: '/auth/mfa/setup', token });
    secret = new URL(setup.body.otpauthUri).searchParams.get('secret') as string;

    const enabled = await ApiHelper.request<{ recoveryCodes: string[] }>({ method: 'POST', path: '/auth/mfa/enable', token, body: { code: generateSync({ secret }) } });
    return enabled.body.recoveryCodes;
  };

  beforeAll(async () => {
    token = await ApiHelper.login({ email });
  });

  afterAll(async () => DbHelper.close());

  it('needs a signed-in user', async () => {
    await expect(ApiHelper.request({ path: '/auth/mfa/status' })).resolves.toMatchObject({ status: 401 });
  });

  it('starts off, then setup returns a QR code and stores the secret encrypted and pending', async () => {
    await expect(status()).resolves.toMatchObject({ status: 200, body: { enabled: false, pending: false } });

    const setup = await ApiHelper.request<{ otpauthUri: string; qrCodeDataUrl: string }>({ method: 'POST', path: '/auth/mfa/setup', token });
    expect(setup.status).toBe(201);
    expect(setup.body.otpauthUri).toMatch(/^otpauth:\/\/totp\/.*issuer=Integration%20Wallet/);
    expect(setup.body.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
    secret = new URL(setup.body.otpauthUri).searchParams.get('secret') as string;

    await expect(status()).resolves.toMatchObject({ body: { enabled: false, pending: true } });
    await expect(
      DbHelper.query({
        sql: "SELECT position(convert_to($2, 'UTF8') IN mfa_secret_encrypted) AS plain_at FROM users WHERE email = $1",
        params: [email, secret]
      })
    ).resolves.toEqual([{ plain_at: 0 }]);
  });

  it('rejects a wrong code and enables with a correct one, returning 10 recovery codes once', async () => {
    await expect(ApiHelper.request({ method: 'POST', path: '/auth/mfa/enable', token, body: { code: '000000' } })).resolves.toMatchObject({ status: 400 });
    await expect(status()).resolves.toMatchObject({ body: { enabled: false, pending: true } });

    const code = generateSync({ secret });
    const enabled = await ApiHelper.request<{ recoveryCodes: string[] }>({ method: 'POST', path: '/auth/mfa/enable', token, body: { code } });
    expect(enabled.status).toBe(201);
    expect(enabled.body.recoveryCodes).toHaveLength(10);
    firstRecoveryCodes = enabled.body.recoveryCodes;

    await expect(status()).resolves.toMatchObject({ body: { enabled: true, pending: false } });
    await expect(ApiHelper.request({ method: 'POST', path: '/auth/mfa/setup', token })).resolves.toMatchObject({ status: 409 });

    const disable = (body: Record<string, string>): Promise<{ status: number }> => ApiHelper.request({ method: 'POST', path: '/auth/mfa/disable', token, body });
    await expect(disable({ password: 'Wrong#Pass2026', code: generateSync({ secret }) })).resolves.toMatchObject({ status: 401 });
    await expect(disable({ password: SEED_PASSWORD, code })).resolves.toMatchObject({ status: 400 });
  });

  it('turns off with a recovery code, clears everything, and retires the old codes', async () => {
    const disable = (code: string): Promise<{ status: number }> => ApiHelper.request({ method: 'POST', path: '/auth/mfa/disable', token, body: { password: SEED_PASSWORD, code } });
    const [usedCode, unusedCode] = firstRecoveryCodes as [string, string];

    await expect(disable(usedCode)).resolves.toMatchObject({ status: 201 });
    await expect(status()).resolves.toMatchObject({ body: { enabled: false, pending: false } });
    await expect(
      DbHelper.query({
        sql: `SELECT u.mfa_secret_encrypted IS NULL AS secret_cleared, count(c.id) FILTER (WHERE c.used_at IS NULL)::int AS unused_codes
              FROM users u LEFT JOIN mfa_recovery_codes c ON c.user_id = u.id WHERE u.email = $1 GROUP BY u.id`,
        params: [email]
      })
    ).resolves.toEqual([{ secret_cleared: true, unused_codes: 0 }]);

    const newRecoveryCodes = await enrol();

    await expect(disable(usedCode)).resolves.toMatchObject({ status: 400 });
    await expect(disable(unusedCode)).resolves.toMatchObject({ status: 400 });
    await expect(disable(newRecoveryCodes[0] as string)).resolves.toMatchObject({ status: 201 });
  });
});

describe('Two-factor login', () => {
  const email = 'player16@seed.local';
  let secret = '';
  let recoveryCodes: string[] = [];

  const loginStep = (): Promise<{ status: number; body: { mfaRequired?: boolean; challengeToken?: string; accessToken?: string } }> =>
    ApiHelper.request({ method: 'POST', path: '/auth/login', body: { email, password: SEED_PASSWORD } });
  const challenge = async (): Promise<string> => (await loginStep()).body.challengeToken as string;
  const verify = (challengeToken: string, code: string): Promise<{ status: number; body: { accessToken?: string } }> =>
    ApiHelper.request({ method: 'POST', path: '/auth/mfa/verify', body: { challengeToken, code } });
  const tokenRow = (challengeToken: string): Promise<Array<{ failed_attempts: number; revoked: boolean; used: boolean }>> =>
    DbHelper.query({
      sql: 'SELECT failed_attempts, revoked_at IS NOT NULL AS revoked, used_at IS NOT NULL AS used FROM auth_tokens WHERE token_hash = $1',
      params: [CryptoHelper.sha256({ value: challengeToken })]
    });
  const nextWindowCode = (): string => generateSync({ secret, epoch: Math.floor(Date.now() / 1000) + 30 });

  beforeAll(async () => {
    const token = await ApiHelper.login({ email });
    const setup = await ApiHelper.request<{ otpauthUri: string }>({ method: 'POST', path: '/auth/mfa/setup', token });
    secret = new URL(setup.body.otpauthUri).searchParams.get('secret') as string;

    const enabled = await ApiHelper.request<{ recoveryCodes: string[] }>({ method: 'POST', path: '/auth/mfa/enable', token, body: { code: generateSync({ secret }) } });
    recoveryCodes = enabled.body.recoveryCodes;
  });

  afterAll(async () => DbHelper.close());

  it('asks for a second factor instead of returning a session', async () => {
    const response = await loginStep();

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ mfaRequired: true, challengeToken: expect.any(String) as string });
  });

  it('counts a wrong code, signs in with a correct one, and the challenge and code are single-use', async () => {
    const challengeToken = await challenge();

    await expect(verify(challengeToken, '000000')).resolves.toMatchObject({ status: 400 });
    await expect(tokenRow(challengeToken)).resolves.toEqual([{ failed_attempts: 1, revoked: false, used: false }]);

    const code = nextWindowCode();
    const signedIn = await verify(challengeToken, code);
    expect(signedIn.status).toBe(201);
    await expect(ApiHelper.request({ path: '/wallets', token: signedIn.body.accessToken as string })).resolves.toMatchObject({ status: 200 });
    await expect(
      DbHelper.query({ sql: "SELECT last_login_at > now() - interval '1 minute' AS recent FROM users WHERE email = $1", params: [email] })
    ).resolves.toEqual([{ recent: true }]);

    await expect(verify(challengeToken, nextWindowCode())).resolves.toMatchObject({ status: 400 });
    await expect(verify(await challenge(), code)).resolves.toMatchObject({ status: 400 });
  });

  it('accepts a recovery code exactly once', async () => {
    const [recoveryCode] = recoveryCodes as [string];

    await expect(verify(await challenge(), recoveryCode)).resolves.toMatchObject({ status: 201 });
    await expect(verify(await challenge(), recoveryCode)).resolves.toMatchObject({ status: 400 });
  });

  it('revokes the challenge after 5 wrong codes without spending the recovery code tried afterwards', async () => {
    const challengeToken = await challenge();
    const recoveryCode = recoveryCodes[1] as string;

    for (let attempt = 0; attempt < 5; attempt++) {
      await expect(verify(challengeToken, '000000')).resolves.toMatchObject({ status: 400 });
    }

    await expect(verify(challengeToken, recoveryCode)).resolves.toMatchObject({ status: 400 });
    await expect(tokenRow(challengeToken)).resolves.toEqual([{ failed_attempts: 5, revoked: true, used: false }]);
    await expect(verify(await challenge(), recoveryCode)).resolves.toMatchObject({ status: 201 });
  });

  it('rejects an expired challenge', async () => {
    const challengeToken = await challenge();

    await DbHelper.query({
      sql: "UPDATE auth_tokens SET created_at = now() - interval '10 minutes', expires_at = now() - interval '5 minutes' WHERE token_hash = $1",
      params: [CryptoHelper.sha256({ value: challengeToken })]
    });

    await expect(verify(challengeToken, recoveryCodes[2] as string)).resolves.toMatchObject({ status: 400 });
  });
});
