import { PASSKEY_STEP_UP_TEST } from '../constants/passkey-step-up.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { PasskeyOptions } from '../interfaces/passkey.interface';
import { SEED_PASSWORD } from '../constants/seed-password.constant';

describe('Passkey step-up before withdrawal', () => {
  let token = '';

  const withdraw = (suffix: string) =>
    ApiHelper.request<{ error?: { message: string } }>({
      method: 'POST',
      path: PASSKEY_STEP_UP_TEST.WITHDRAW_PATH,
      token,
      body: {
        amountMinor: PASSKEY_STEP_UP_TEST.AMOUNT_MINOR,
        currency: PASSKEY_STEP_UP_TEST.CURRENCY,
        idempotencyKey: `${PASSKEY_STEP_UP_TEST.WITHDRAW_KEY}-${suffix}`
      }
    });

  const seedCredential = (): Promise<unknown> =>
    DbHelper.query({
      sql: PASSKEY_STEP_UP_TEST.SEED_SQL,
      params: [PASSKEY_STEP_UP_TEST.EMAIL, PASSKEY_STEP_UP_TEST.CREDENTIAL_ID, PASSKEY_STEP_UP_TEST.PUBLIC_KEY, PASSKEY_STEP_UP_TEST.DEVICE_LABEL]
    });

  beforeAll(async () => {
    token = await ApiHelper.login({ email: PASSKEY_STEP_UP_TEST.EMAIL });
  });

  afterAll(async () => {
    await DbHelper.query({ sql: PASSKEY_STEP_UP_TEST.CLEAN_SQL, params: [PASSKEY_STEP_UP_TEST.CREDENTIAL_ID] });
    await DbHelper.close();
  });

  it('never blocks a user who has no passkey, so nobody is locked out of their own money', async () => {
    const attempted = await withdraw('no-passkey');

    expect(attempted.status).not.toBe(PASSKEY_STEP_UP_TEST.FORBIDDEN);
    expect(attempted.body.error?.message).not.toBe(PASSKEY_STEP_UP_TEST.REQUIRED_MESSAGE);
  });

  it('refuses a withdrawal once a passkey exists and nothing has been confirmed', async () => {
    await seedCredential();

    const refused = await withdraw('unconfirmed');

    expect(refused.status).toBe(PASSKEY_STEP_UP_TEST.FORBIDDEN);
    expect(refused.body.error?.message).toBe(PASSKEY_STEP_UP_TEST.REQUIRED_MESSAGE);
  });

  it('refuses to attach a new payout destination without a fresh confirmation', async () => {
    const refused = await ApiHelper.request<{ error?: { message: string } }>({
      method: 'POST',
      path: PASSKEY_STEP_UP_TEST.METHOD_CONFIRM_PATH,
      token,
      body: { sessionId: PASSKEY_STEP_UP_TEST.SESSION_ID }
    });

    expect(refused.status).toBe(PASSKEY_STEP_UP_TEST.FORBIDDEN);
    expect(refused.body.error?.message).toBe(PASSKEY_STEP_UP_TEST.REQUIRED_MESSAGE);
  });

  it('refuses to turn off two-factor without a fresh confirmation, before it reveals whether it is on', async () => {
    const refused = await ApiHelper.request<{ error?: { message: string } }>({
      method: 'POST',
      path: PASSKEY_STEP_UP_TEST.MFA_DISABLE_PATH,
      token,
      body: { password: SEED_PASSWORD, code: PASSKEY_STEP_UP_TEST.MFA_CODE }
    });

    expect(refused.status).toBe(PASSKEY_STEP_UP_TEST.FORBIDDEN);
    expect(refused.body.error?.message).toBe(PASSKEY_STEP_UP_TEST.REQUIRED_MESSAGE);
  });

  it('offers a challenge limited to the credentials the caller actually registered', async () => {
    const options = await ApiHelper.request<PasskeyOptions>({
      method: 'POST',
      path: PASSKEY_STEP_UP_TEST.OPTIONS_PATH,
      token,
      body: {}
    });

    expect(options.body.challenge).toBeTruthy();
    expect(options.body.allowCredentials?.map(({ id }) => id)).toEqual([PASSKEY_STEP_UP_TEST.CREDENTIAL_ID]);
  });

  it('refuses a forged confirmation, so the grant cannot be faked', async () => {
    const forged = await ApiHelper.request({
      method: 'POST',
      path: PASSKEY_STEP_UP_TEST.VERIFY_PATH,
      token,
      body: {
        response: {
          id: PASSKEY_STEP_UP_TEST.CREDENTIAL_ID,
          rawId: PASSKEY_STEP_UP_TEST.CREDENTIAL_ID,
          type: 'public-key',
          clientExtensionResults: {},
          response: { clientDataJSON: '', authenticatorData: '', signature: '' }
        }
      }
    });

    expect([PASSKEY_STEP_UP_TEST.UNAUTHORIZED, PASSKEY_STEP_UP_TEST.BAD_REQUEST]).toContain(forged.status);

    const stillRefused = await withdraw('after-forgery');

    expect(stillRefused.status).toBe(PASSKEY_STEP_UP_TEST.FORBIDDEN);
  });
});
