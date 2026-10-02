import { SEEDED_PROFILE_TEST as T } from '../constants/seeded-profile.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { SeededProfileRow } from '../interfaces/seeded-profile-row.interface';

describe('Seeded players can edit their identity fields', () => {
  const row = async (): Promise<SeededProfileRow | undefined> =>
    (await DbHelper.query<SeededProfileRow>({ sql: T.STATUS_SQL, params: [T.EMAIL] }))[0];

  afterAll(async () => DbHelper.close());

  it('starts seeded players unverified, so country and date of birth are not locked', async () => {
    await expect(row()).resolves.toMatchObject({ kyc_status: T.NOT_STARTED });
  });

  it('saves a new country and date of birth for a seeded player', async () => {
    const token = await ApiHelper.login({ email: T.EMAIL });
    const body = { displayName: T.DISPLAY_NAME, countryCode: T.COUNTRY_CODE, dateOfBirth: T.DATE_OF_BIRTH };

    await expect(ApiHelper.request({ method: 'PATCH', path: T.PATH, token, body })).resolves.toMatchObject({ status: T.OK_STATUS });
    await expect(row()).resolves.toEqual({ kyc_status: T.NOT_STARTED, country_code: T.COUNTRY_CODE, date_of_birth: T.DATE_OF_BIRTH });
  });
});
