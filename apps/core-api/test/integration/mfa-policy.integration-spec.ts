import { generateSync } from 'otplib';

import { MFA_POLICY_TEST } from '../constants/mfa-policy.constant';
import { EMAIL_TOPICS } from '../constants/email-topics.constant';
import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { EmailInboxHelper } from '../helpers/email-inbox.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { ActiveCodesRow, MfaEnrolment, MfaStatus, MfaStatusResponse, MfaTokenRef } from '../interfaces/mfa-status.interface';
import { RecoveryCodes } from '../interfaces/recovery-codes.interface';

let adminToken: string = MFA_POLICY_TEST.EMPTY;

let adminSecret: string = MFA_POLICY_TEST.EMPTY;

let adminRecoveryCodes: string[] = [];

const status = ({ token }: MfaTokenRef): Promise<MfaStatusResponse> =>
  ApiHelper.request<MfaStatus>({ path: MFA_POLICY_TEST.STATUS_PATH, token });

const enrol = async ({ token }: MfaTokenRef): Promise<MfaEnrolment> => {
  const setup = await ApiHelper.request<{ otpauthUri: string }>({ method: MFA_POLICY_TEST.POST, path: MFA_POLICY_TEST.SETUP_PATH, token });
  const secret = new URL(setup.body.otpauthUri).searchParams.get(MFA_POLICY_TEST.SECRET_PARAM) as string;

  const enabled = await ApiHelper.request<RecoveryCodes>({
    method: MFA_POLICY_TEST.POST,
    path: MFA_POLICY_TEST.ENABLE_PATH,
    token,
    body: { code: generateSync({ secret }) }
  });

  expect(enabled.status).toBe(MFA_POLICY_TEST.CREATED);
  return { secret, codes: enabled.body.recoveryCodes };
};

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [MFA_POLICY_TEST.ADMIN_EMAIL], role: MFA_POLICY_TEST.ADMIN_ROLE });
  await TestUserHelper.ensure({ emails: [MFA_POLICY_TEST.PLAYER_EMAIL] });
  adminToken = await ApiHelper.login({ email: MFA_POLICY_TEST.ADMIN_EMAIL });
});

afterAll(async () => DbHelper.close());

describe('Two-factor policy: required for admins, codes can be replaced', () => {
  it('marks two-factor required for an admin and optional for a player', async () => {
    const playerToken = await ApiHelper.login({ email: MFA_POLICY_TEST.PLAYER_EMAIL });

    await expect(status({ token: adminToken })).resolves.toMatchObject({ status: MFA_POLICY_TEST.OK, body: { required: true } });
    await expect(status({ token: playerToken })).resolves.toMatchObject({ status: MFA_POLICY_TEST.OK, body: { required: false } });
  });

  it('tells an admin without two-factor that setup is still owed', async () => {
    const signedIn = await ApiHelper.request<{ user: { mfaSetupRequired: boolean } }>({
      method: MFA_POLICY_TEST.POST,
      path: MFA_POLICY_TEST.LOGIN_PATH,
      body: { email: MFA_POLICY_TEST.ADMIN_EMAIL, password: SEED_PASSWORD }
    });

    expect(signedIn.body.user.mfaSetupRequired).toBe(true);
  });

  it('emails the account when two-factor is turned on', async () => {
    const enrolled = await enrol({ token: adminToken });
    adminSecret = enrolled.secret;
    adminRecoveryCodes = enrolled.codes;

    expect(enrolled.codes).toHaveLength(MFA_POLICY_TEST.RECOVERY_CODE_COUNT);
    await expect(EmailInboxHelper.waitFor({ to: MFA_POLICY_TEST.ADMIN_EMAIL, topic: EMAIL_TOPICS.MFA_ENABLED })).resolves.toBeDefined();
    await expect(status({ token: adminToken })).resolves.toMatchObject({ body: { enabled: true, required: true } });
  });

  it('stops asking for setup once the admin has two-factor on', async () => {
    const challenged = await ApiHelper.request<{ mfaRequired: boolean; challengeToken: string }>({
      method: MFA_POLICY_TEST.POST,
      path: MFA_POLICY_TEST.LOGIN_PATH,
      body: { email: MFA_POLICY_TEST.ADMIN_EMAIL, password: SEED_PASSWORD }
    });

    expect(challenged.body.mfaRequired).toBe(true);
  });
});

describe('Two-factor policy: replacing recovery codes', () => {
  it('replaces the recovery codes and retires the old set, taking a recovery code as the second factor', async () => {
    const [before] = await DbHelper.query<ActiveCodesRow>({
      sql: MFA_POLICY_TEST.ACTIVE_CODES_SQL,
      params: [MFA_POLICY_TEST.ADMIN_EMAIL]
    });

    const replaced = await ApiHelper.request<RecoveryCodes>({
      method: MFA_POLICY_TEST.POST,
      path: MFA_POLICY_TEST.RECOVERY_CODES_PATH,
      token: adminToken,
      body: { password: SEED_PASSWORD, code: adminRecoveryCodes[0] }
    });

    expect(replaced.status).toBe(MFA_POLICY_TEST.CREATED);
    expect(replaced.body.recoveryCodes).toHaveLength(MFA_POLICY_TEST.RECOVERY_CODE_COUNT);
    expect(before?.active).toBe(String(MFA_POLICY_TEST.RECOVERY_CODE_COUNT));

    const [after] = await DbHelper.query<ActiveCodesRow>({
      sql: MFA_POLICY_TEST.ACTIVE_CODES_SQL,
      params: [MFA_POLICY_TEST.ADMIN_EMAIL]
    });

    expect(after?.active).toBe(String(MFA_POLICY_TEST.RECOVERY_CODE_COUNT));
  });

  it('refuses a wrong password when replacing the codes', async () => {
    await expect(
      ApiHelper.request({
        method: MFA_POLICY_TEST.POST,
        path: MFA_POLICY_TEST.RECOVERY_CODES_PATH,
        token: adminToken,
        body: { password: MFA_POLICY_TEST.WRONG_PASSWORD, code: generateSync({ secret: adminSecret }) }
      })
    ).resolves.toMatchObject({ status: MFA_POLICY_TEST.UNAUTHORIZED });
  });

  it('will not let an admin turn two-factor off', async () => {
    await expect(
      ApiHelper.request({
        method: MFA_POLICY_TEST.POST,
        path: MFA_POLICY_TEST.DISABLE_PATH,
        token: adminToken,
        body: { password: SEED_PASSWORD, code: generateSync({ secret: adminSecret }) }
      })
    ).resolves.toMatchObject({ status: MFA_POLICY_TEST.FORBIDDEN });
  });
});
