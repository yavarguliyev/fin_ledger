import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { PASSKEY_LOOKUP_TEST } from '../constants/passkey-lookup.constant';

describe('Passkey login credential lookup', () => {
  beforeAll(async () => {
    await DbHelper.query({ sql: PASSKEY_LOOKUP_TEST.CLEAN_SQL, params: [PASSKEY_LOOKUP_TEST.CREDENTIAL_ID] });
    await DbHelper.query({
      sql: PASSKEY_LOOKUP_TEST.SEED_SQL,
      params: [PASSKEY_LOOKUP_TEST.EMAIL, PASSKEY_LOOKUP_TEST.CREDENTIAL_ID, PASSKEY_LOOKUP_TEST.PUBLIC_KEY, PASSKEY_LOOKUP_TEST.DEVICE_LABEL]
    });
  });

  afterAll(async () => {
    await DbHelper.query({ sql: PASSKEY_LOOKUP_TEST.CLEAN_SQL, params: [PASSKEY_LOOKUP_TEST.CREDENTIAL_ID] });
    await DbHelper.close();
  });

  it('finds a registered credential even though the caller has no session yet', async () => {
    await ApiHelper.request({ method: 'POST', path: PASSKEY_LOOKUP_TEST.LOGIN_OPTIONS_PATH, body: { owner: PASSKEY_LOOKUP_TEST.OWNER } });

    const verified = await ApiHelper.request<{ error?: { message: string } }>({
      method: 'POST',
      path: PASSKEY_LOOKUP_TEST.LOGIN_VERIFY_PATH,
      body: {
        owner: PASSKEY_LOOKUP_TEST.OWNER,
        response: {
          id: PASSKEY_LOOKUP_TEST.CREDENTIAL_ID,
          rawId: PASSKEY_LOOKUP_TEST.CREDENTIAL_ID,
          type: 'public-key',
          clientExtensionResults: {},
          response: { clientDataJSON: '', authenticatorData: '', signature: '' }
        }
      }
    });

    expect(verified.status).toBe(PASSKEY_LOOKUP_TEST.UNAUTHORIZED);
    expect(verified.body.error?.message).not.toBe(PASSKEY_LOOKUP_TEST.NOT_REGISTERED_MESSAGE);
  });
});
