import { CryptoHelper } from '@common/shared-libs';

import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { MFA_TEST as M } from '../constants/mfa.constant';
import { MfaTestHelper } from '../helpers/mfa-test.helper';
import { TestUserHelper } from '../helpers/test-user.helper';

const state = { secret: '', recoveryCodes: [] as string[] };
const challenge = async (): Promise<string> => (await MfaTestHelper.login({ email: M.LOGIN_EMAIL })).body.challengeToken as string;

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [M.LOGIN_EMAIL] });
  Object.assign(state, await MfaTestHelper.enrol({ token: await ApiHelper.login({ email: M.LOGIN_EMAIL }) }));
});

afterAll(async () => DbHelper.close());

describe('Two-factor login', () => {
  it('asks for a second factor instead of returning a session', async () => {
    const response = await MfaTestHelper.login({ email: M.LOGIN_EMAIL });

    expect(response.status).toBe(M.CREATED);
    expect(response.body.mfaRequired).toBe(true);
    expect(typeof response.body.challengeToken).toBe('string');
  });

  it('counts a wrong code, signs in with a correct one, and the challenge and code are single-use', async () => {
    const challengeToken = await challenge();
    await expect(MfaTestHelper.verify({ challengeToken, code: M.WRONG_CODE })).resolves.toMatchObject({ status: M.BAD_REQUEST });
    await expect(MfaTestHelper.tokenRow({ challengeToken })).resolves.toEqual([{ failed_attempts: 1, revoked: false, used: false }]);

    const code = MfaTestHelper.nextWindowCode(state);
    const signedIn = await MfaTestHelper.verify({ challengeToken, code });
    expect(signedIn.status).toBe(M.CREATED);
    await expect(ApiHelper.request({ path: M.WALLETS_PATH, token: signedIn.body.accessToken as string })).resolves.toMatchObject({ status: M.OK });
    await expect(DbHelper.query({ sql: M.RECENT_LOGIN_SQL, params: [M.LOGIN_EMAIL] })).resolves.toEqual([{ recent: true }]);

    await expect(MfaTestHelper.verify({ challengeToken, code: MfaTestHelper.nextWindowCode(state) })).resolves.toMatchObject({
      status: M.BAD_REQUEST
    });
    await expect(MfaTestHelper.verify({ challengeToken: await challenge(), code })).resolves.toMatchObject({ status: M.BAD_REQUEST });
  });
});

describe('Two-factor recovery and lockout', () => {
  it('accepts a recovery code exactly once', async () => {
    const [code] = state.recoveryCodes as [string];

    await expect(MfaTestHelper.verify({ challengeToken: await challenge(), code })).resolves.toMatchObject({ status: M.CREATED });
    await expect(MfaTestHelper.verify({ challengeToken: await challenge(), code })).resolves.toMatchObject({ status: M.BAD_REQUEST });
  });

  it('revokes the challenge after 5 wrong codes without spending the recovery code tried afterwards', async () => {
    const challengeToken = await challenge();
    const code = state.recoveryCodes[1] as string;
    for (let attempt = 0; attempt < M.MAX_FAILED_ATTEMPTS; attempt++) {
      await expect(MfaTestHelper.verify({ challengeToken, code: M.WRONG_CODE })).resolves.toMatchObject({ status: M.BAD_REQUEST });
    }

    await expect(MfaTestHelper.verify({ challengeToken, code })).resolves.toMatchObject({ status: M.BAD_REQUEST });
    await expect(MfaTestHelper.tokenRow({ challengeToken })).resolves.toEqual([
      { failed_attempts: M.MAX_FAILED_ATTEMPTS, revoked: true, used: false }
    ]);
    await expect(MfaTestHelper.verify({ challengeToken: await challenge(), code })).resolves.toMatchObject({ status: M.CREATED });
  });

  it('rejects an expired challenge', async () => {
    const challengeToken = await challenge();
    await DbHelper.query({ sql: M.EXPIRE_SQL, params: [CryptoHelper.sha256({ value: challengeToken })] });

    await expect(MfaTestHelper.verify({ challengeToken, code: state.recoveryCodes[2] as string })).resolves.toMatchObject({ status: M.BAD_REQUEST });
  });
});
