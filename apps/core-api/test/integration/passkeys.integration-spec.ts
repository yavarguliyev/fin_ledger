import { PASSKEY_TEST } from '../constants/passkeys.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { PasskeyOptions, PasskeySummary } from '../interfaces/passkey.interface';

describe('Passkeys', () => {
  let token = '';

  const seedCredential = (): Promise<unknown> =>
    DbHelper.query({
      sql: PASSKEY_TEST.SEED_SQL,
      params: [PASSKEY_TEST.EMAIL, PASSKEY_TEST.CREDENTIAL_ID, PASSKEY_TEST.PUBLIC_KEY, PASSKEY_TEST.DEVICE_LABEL]
    });

  const countCredentials = async (): Promise<number> => {
    const [row] = await DbHelper.query<{ count: number }>({ sql: PASSKEY_TEST.COUNT_SQL, params: [PASSKEY_TEST.EMAIL] });

    return row?.count ?? 0;
  };

  beforeAll(async () => {
    token = await ApiHelper.login({ email: PASSKEY_TEST.EMAIL });
  });

  afterAll(async () => {
    await DbHelper.query({ sql: PASSKEY_TEST.CLEAN_SQL, params: [PASSKEY_TEST.CREDENTIAL_ID] });
    await DbHelper.close();
  });

  it('stores no biometric data by construction: the table has no column that could hold any', async () => {
    const columns = await DbHelper.query<{ column_name: string }>({ sql: PASSKEY_TEST.BIOMETRIC_COLUMNS_SQL });
    const names = columns.map(({ column_name: name }) => name.toLowerCase()).join(' ');

    PASSKEY_TEST.FORBIDDEN_WORDS.forEach(word => expect(names).not.toContain(word));
    expect(names).toContain('public_key');
  });

  it('offers registration options bound to this relying party, and never reuses the challenge', async () => {
    const first = await ApiHelper.request<PasskeyOptions>({ method: 'POST', path: PASSKEY_TEST.REGISTER_OPTIONS_PATH, token, body: {} });
    const second = await ApiHelper.request<PasskeyOptions>({ method: 'POST', path: PASSKEY_TEST.REGISTER_OPTIONS_PATH, token, body: {} });

    expect(first.status).toBe(PASSKEY_TEST.CREATED);
    expect(first.body.challenge).toEqual(expect.any(String) as string);
    expect(first.body.rp?.id).toEqual(expect.any(String) as string);
    expect(second.body.challenge).not.toBe(first.body.challenge);
  });

  it('refuses a registration whose challenge was never issued', async () => {
    const verified = await ApiHelper.request({
      method: 'POST',
      path: PASSKEY_TEST.REGISTER_VERIFY_PATH,
      token,
      body: {
        response: { id: PASSKEY_TEST.CREDENTIAL_ID, rawId: PASSKEY_TEST.CREDENTIAL_ID, type: 'public-key', response: {}, clientExtensionResults: {} }
      }
    });

    expect([PASSKEY_TEST.BAD_REQUEST, PASSKEY_TEST.UNAUTHORIZED]).toContain(verified.status);
  });

  it('lists a registered passkey without exposing its public key or counter', async () => {
    await seedCredential();

    const listed = await ApiHelper.request<PasskeySummary[]>({ path: PASSKEY_TEST.LIST_PATH, token });

    expect(listed.status).toBe(PASSKEY_TEST.OK);

    const entry = listed.body.find(({ deviceLabel }) => deviceLabel === PASSKEY_TEST.DEVICE_LABEL);
    expect(entry).toBeDefined();
    expect(Object.keys(entry ?? {})).toEqual(expect.arrayContaining(['id', 'deviceLabel', 'backedUp', 'lastUsedAt', 'createdAt']));
    expect(entry).not.toHaveProperty('publicKey');
    expect(entry).not.toHaveProperty('signCount');
  });

  it('refuses a login for a credential nobody registered', async () => {
    await ApiHelper.request({ method: 'POST', path: PASSKEY_TEST.LOGIN_OPTIONS_PATH, body: { owner: PASSKEY_TEST.OWNER } });

    const verified = await ApiHelper.request({
      method: 'POST',
      path: PASSKEY_TEST.LOGIN_VERIFY_PATH,
      body: {
        owner: PASSKEY_TEST.OWNER,
        response: { id: 'never-registered', rawId: 'never-registered', type: 'public-key', response: {}, clientExtensionResults: {} }
      }
    });

    expect(verified.status).toBe(PASSKEY_TEST.UNAUTHORIZED);
  });

  it('refuses a login whose challenge was never issued', async () => {
    const verified = await ApiHelper.request({
      method: 'POST',
      path: PASSKEY_TEST.LOGIN_VERIFY_PATH,
      body: {
        owner: 'owner-with-no-challenge',
        response: { id: PASSKEY_TEST.CREDENTIAL_ID, rawId: PASSKEY_TEST.CREDENTIAL_ID, type: 'public-key', response: {}, clientExtensionResults: {} }
      }
    });

    expect(verified.status).toBe(PASSKEY_TEST.BAD_REQUEST);
  });

  it('will not let one account delete another account passkey', async () => {
    const [credential] = await DbHelper.query<{ id: string }>({
      sql: 'SELECT id FROM user_credentials WHERE credential_id = $1',
      params: [PASSKEY_TEST.CREDENTIAL_ID]
    });

    const otherToken = await ApiHelper.login({ email: 'player25@realtime-wallet-payments.com' });

    await expect(
      ApiHelper.request({ method: 'DELETE', path: `${PASSKEY_TEST.LIST_PATH}/${credential?.id}`, token: otherToken })
    ).resolves.toMatchObject({ status: PASSKEY_TEST.NOT_FOUND });

    await expect(countCredentials()).resolves.toBe(1);
  });

  it('removes the owner own passkey and leaves password login working', async () => {
    const [credential] = await DbHelper.query<{ id: string }>({
      sql: 'SELECT id FROM user_credentials WHERE credential_id = $1',
      params: [PASSKEY_TEST.CREDENTIAL_ID]
    });

    await expect(ApiHelper.request({ method: 'DELETE', path: `${PASSKEY_TEST.LIST_PATH}/${credential?.id}`, token })).resolves.toMatchObject({
      status: PASSKEY_TEST.OK
    });

    await expect(countCredentials()).resolves.toBe(0);
    await expect(ApiHelper.login({ email: PASSKEY_TEST.EMAIL })).resolves.toEqual(expect.any(String) as string);
  });
});
