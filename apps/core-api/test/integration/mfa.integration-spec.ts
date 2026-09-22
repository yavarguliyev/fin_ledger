import { generateSync } from 'otplib';

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
