import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { USER_ADDRESS_TEST as T } from '../constants/user-address.constant';
import { AddressCount, SavedAddress } from '../interfaces/user-address.interface';

let owner = '';

let other = '';

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [T.OWNER_EMAIL, T.OTHER_EMAIL] });
  owner = await ApiHelper.login({ email: T.OWNER_EMAIL });
  other = await ApiHelper.login({ email: T.OTHER_EMAIL });
});

afterAll(async () => DbHelper.close());

describe('Postal address', () => {
  it('saves a map-picked address and returns it with its source', async () => {
    const saved = await ApiHelper.request<SavedAddress>({ method: T.PUT, path: T.ADDRESS_PATH, token: owner, body: T.MAP_ADDRESS });
    expect(saved.status).toBe(T.OK);

    const read = await ApiHelper.request<SavedAddress>({ path: T.ADDRESS_PATH, token: owner });
    expect(read.body).toMatchObject({ line1: T.MAP_ADDRESS.line1, countryCode: T.MAP_ADDRESS.countryCode, latitude: T.MAP_ADDRESS.latitude, source: T.MAP_ADDRESS.source });
  });

  it('never shows one player another player’s address', async () => {
    const read = await ApiHelper.request<SavedAddress | null>({ path: T.ADDRESS_PATH, token: other });
    expect(read.body).toBeFalsy();
  });

  it('rejects a malformed country and a too-short search before calling the geocoder', async () => {
    const bad = await ApiHelper.request({ method: T.PUT, path: T.ADDRESS_PATH, token: owner, body: { ...T.MAP_ADDRESS, countryCode: T.BAD_COUNTRY } });
    expect(bad.status).toBe(T.BAD_REQUEST);
    expect((await ApiHelper.request({ path: T.SEARCH_PATH, token: owner })).status).toBe(T.BAD_REQUEST);
  });

  it('erases the address when the player is anonymized', async () => {
    const admin = await ApiHelper.login({ email: T.ADMIN_EMAIL });
    const userId = await TestUserHelper.idOf({ email: T.OWNER_EMAIL });

    expect((await ApiHelper.request({ method: T.POST, path: T.ANONYMIZE_PATH(userId), token: admin })).status).toBeLessThan(T.BAD_REQUEST);

    const rows = await DbHelper.query<AddressCount>({ sql: T.COUNT_SQL, params: [userId] });
    expect(rows[0]?.count).toBe(T.NONE);
  });
});
