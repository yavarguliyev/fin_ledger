import { PASSKEY_STEP_UP_TEST } from '../constants/passkey-step-up.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { PasskeyOptions, StepUpError, StepUpWithdrawal } from '../interfaces/passkey.interface';
import { SEED_PASSWORD } from '../constants/seed-password.constant';

let token: string = PASSKEY_STEP_UP_TEST.EMPTY;

const withdraw = ({ suffix }: StepUpWithdrawal): ReturnType<typeof ApiHelper.request<StepUpError>> =>
  ApiHelper.request<StepUpError>({
    method: PASSKEY_STEP_UP_TEST.POST,
    path: PASSKEY_STEP_UP_TEST.WITHDRAW_PATH,
    token,
    body: {
      amountMinor: PASSKEY_STEP_UP_TEST.AMOUNT_MINOR,
      currency: PASSKEY_STEP_UP_TEST.CURRENCY,
      idempotencyKey: `${PASSKEY_STEP_UP_TEST.WITHDRAW_KEY}${PASSKEY_STEP_UP_TEST.KEY_SEPARATOR}${suffix}`
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

describe('Passkey step-up before withdrawal', () => {
  it('never blocks a user who has no passkey, so nobody is locked out of their own money', async () => {
    const attempted = await withdraw({ suffix: PASSKEY_STEP_UP_TEST.NO_PASSKEY });

    expect(attempted.status).not.toBe(PASSKEY_STEP_UP_TEST.FORBIDDEN);
    expect(attempted.body.error?.message).not.toBe(PASSKEY_STEP_UP_TEST.REQUIRED_MESSAGE);
  });

  it('refuses a withdrawal once a passkey exists and nothing has been confirmed', async () => {
    await seedCredential();

    const refused = await withdraw({ suffix: PASSKEY_STEP_UP_TEST.UNCONFIRMED });

    expect(refused.status).toBe(PASSKEY_STEP_UP_TEST.FORBIDDEN);
    expect(refused.body.error?.message).toBe(PASSKEY_STEP_UP_TEST.REQUIRED_MESSAGE);
  });

  it('refuses to attach a new payout destination without a fresh confirmation', async () => {
    const refused = await ApiHelper.request<{ error?: { message: string } }>({
      method: PASSKEY_STEP_UP_TEST.POST,
      path: PASSKEY_STEP_UP_TEST.METHOD_CONFIRM_PATH,
      token,
      body: { sessionId: PASSKEY_STEP_UP_TEST.SESSION_ID }
    });

    expect(refused.status).toBe(PASSKEY_STEP_UP_TEST.FORBIDDEN);
    expect(refused.body.error?.message).toBe(PASSKEY_STEP_UP_TEST.REQUIRED_MESSAGE);
  });

  it('refuses to turn off two-factor without a fresh confirmation, before it reveals whether it is on', async () => {
    const refused = await ApiHelper.request<{ error?: { message: string } }>({
      method: PASSKEY_STEP_UP_TEST.POST,
      path: PASSKEY_STEP_UP_TEST.MFA_DISABLE_PATH,
      token,
      body: { password: SEED_PASSWORD, code: PASSKEY_STEP_UP_TEST.MFA_CODE }
    });

    expect(refused.status).toBe(PASSKEY_STEP_UP_TEST.FORBIDDEN);
    expect(refused.body.error?.message).toBe(PASSKEY_STEP_UP_TEST.REQUIRED_MESSAGE);
  });
});

describe('Passkey step-up before withdrawal: challenges', () => {
  it('offers a challenge limited to the credentials the caller actually registered', async () => {
    const options = await ApiHelper.request<PasskeyOptions>({
      method: PASSKEY_STEP_UP_TEST.POST,
      path: PASSKEY_STEP_UP_TEST.OPTIONS_PATH,
      token,
      body: {}
    });

    expect(options.body.challenge).toBeTruthy();
    expect(options.body.allowCredentials?.map(({ id }) => id)).toEqual([PASSKEY_STEP_UP_TEST.CREDENTIAL_ID]);
  });

  it('refuses a forged confirmation, so the grant cannot be faked', async () => {
    const forged = await ApiHelper.request({
      method: PASSKEY_STEP_UP_TEST.POST,
      path: PASSKEY_STEP_UP_TEST.VERIFY_PATH,
      token,
      body: {
        response: {
          id: PASSKEY_STEP_UP_TEST.CREDENTIAL_ID,
          rawId: PASSKEY_STEP_UP_TEST.CREDENTIAL_ID,
          type: PASSKEY_STEP_UP_TEST.PUBLIC_KEY_TYPE,
          clientExtensionResults: {},
          response: { clientDataJSON: PASSKEY_STEP_UP_TEST.EMPTY, authenticatorData: PASSKEY_STEP_UP_TEST.EMPTY, signature: PASSKEY_STEP_UP_TEST.EMPTY }
        }
      }
    });

    expect([PASSKEY_STEP_UP_TEST.UNAUTHORIZED, PASSKEY_STEP_UP_TEST.BAD_REQUEST]).toContain(forged.status);

    const stillRefused = await withdraw({ suffix: PASSKEY_STEP_UP_TEST.AFTER_FORGERY });

    expect(stillRefused.status).toBe(PASSKEY_STEP_UP_TEST.FORBIDDEN);
  });
});
