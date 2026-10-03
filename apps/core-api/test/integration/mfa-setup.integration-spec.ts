import { generateSync } from 'otplib';

import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { MFA_TEST as M } from '../constants/mfa.constant';
import { MfaTestHelper } from '../helpers/mfa-test.helper';
import { MfaEnabledBody } from '../interfaces/mfa.interface';
import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { TestUserHelper } from '../helpers/test-user.helper';

const state = { token: '', secret: '', recoveryCodes: [] as string[] };

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [M.SETUP_EMAIL] });
  state.token = await ApiHelper.login({ email: M.SETUP_EMAIL });
});

afterAll(async () => DbHelper.close());

describe('Two-factor authentication setup', () => {
  it('needs a signed-in user', async () => {
    await expect(ApiHelper.request({ path: M.STATUS_PATH })).resolves.toMatchObject({ status: M.UNAUTHORIZED });
  });

  it('starts off, then setup returns a QR code and stores the secret encrypted and pending', async () => {
    await expect(MfaTestHelper.status(state)).resolves.toMatchObject({ status: M.OK, body: { enabled: false, pending: false } });

    const setup = await MfaTestHelper.setup(state);
    expect(setup.status).toBe(M.CREATED);
    expect(setup.body.otpauthUri).toMatch(M.OTPAUTH_PATTERN);
    expect(setup.body.qrCodeDataUrl).toMatch(M.QR_PATTERN);
    state.secret = MfaTestHelper.secretOf(setup.body);

    await expect(MfaTestHelper.status(state)).resolves.toMatchObject({ body: { enabled: false, pending: true } });
    await expect(DbHelper.query({ sql: M.PLAIN_SECRET_SQL, params: [M.SETUP_EMAIL, state.secret] })).resolves.toEqual([{ plain_at: 0 }]);
  });
});

describe('Turning two-factor authentication on and off', () => {
  it('rejects a wrong code and enables with a correct one, returning the recovery codes once', async () => {
    const { token } = state;
    await expect(ApiHelper.request({ method: 'POST', path: M.ENABLE_PATH, token, body: { code: M.WRONG_CODE } })).resolves.toMatchObject({
      status: M.BAD_REQUEST
    });
    await expect(MfaTestHelper.status(state)).resolves.toMatchObject({ body: { enabled: false, pending: true } });

    const code = generateSync({ secret: state.secret });
    const enabled = await ApiHelper.request<MfaEnabledBody>({ method: 'POST', path: M.ENABLE_PATH, token, body: { code } });
    expect(enabled.status).toBe(M.CREATED);
    expect(enabled.body.recoveryCodes).toHaveLength(M.RECOVERY_CODE_COUNT);
    state.recoveryCodes = enabled.body.recoveryCodes;

    await expect(MfaTestHelper.status(state)).resolves.toMatchObject({ body: { enabled: true, pending: false } });
    await expect(MfaTestHelper.setup(state)).resolves.toMatchObject({ status: M.CONFLICT });
    await expect(MfaTestHelper.disable({ token, password: M.WRONG_PASSWORD, code: generateSync({ secret: state.secret }) })).resolves.toMatchObject({
      status: M.UNAUTHORIZED
    });
    await expect(MfaTestHelper.disable({ token, password: SEED_PASSWORD, code })).resolves.toMatchObject({ status: M.BAD_REQUEST });
  });

  it('turns off with a recovery code, clears everything, and retires the old codes', async () => {
    const { token } = state;
    const [usedCode, unusedCode] = state.recoveryCodes as [string, string];

    await expect(MfaTestHelper.disable({ token, code: usedCode })).resolves.toMatchObject({ status: M.CREATED });
    await expect(MfaTestHelper.status(state)).resolves.toMatchObject({ body: { enabled: false, pending: false } });
    await expect(DbHelper.query({ sql: M.CLEARED_SQL, params: [M.SETUP_EMAIL] })).resolves.toEqual([{ secret_cleared: true, unused_codes: 0 }]);

    const { recoveryCodes } = await MfaTestHelper.enrol({ token });
    await expect(MfaTestHelper.disable({ token, code: usedCode })).resolves.toMatchObject({ status: M.BAD_REQUEST });
    await expect(MfaTestHelper.disable({ token, code: unusedCode })).resolves.toMatchObject({ status: M.BAD_REQUEST });
    await expect(MfaTestHelper.disable({ token, code: recoveryCodes[0] as string })).resolves.toMatchObject({ status: M.CREATED });
  });
});
