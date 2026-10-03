import { HTTP_STATUS } from '../constants/http-status.constant';
import { PROFILE_FIELDS_TEST as T } from '../constants/profile-fields.constant';
import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { KycStatusDto, ProfileFieldsRow, ProfileUpdateDto, ProfileUserBody } from '../interfaces/profile-fields.interface';

let token: string;

let userId: string;

const update = ({ body }: ProfileUpdateDto): ReturnType<typeof ApiHelper.request<ProfileUserBody>> =>
  ApiHelper.request<ProfileUserBody>({ method: 'PATCH', path: T.USERS_PATH, token, body });

const kycStatus = async ({ status }: KycStatusDto): Promise<void> => {
  await DbHelper.query({ sql: T.KYC_SQL, params: [status, userId] });
};

beforeAll(async () => {
  token = await ApiHelper.login({ email: T.EMAIL, password: SEED_PASSWORD });
  userId = await TestUserHelper.idOf({ email: T.EMAIL });

  await kycStatus({ status: T.KYC_NOT_STARTED });
});

afterAll(async () => {
  await kycStatus({ status: T.KYC_NOT_STARTED });
  await DbHelper.close();
});

describe('Profile identity fields', () => {
  it('returns the account creation date, so the profile does not have to guess it from a wallet', async () => {
    const response = await update({ body: { displayName: T.DISPLAY_NAME } });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(Date.parse(response.body?.user.createdAt ?? '')).not.toBeNaN();
  });

  it('saves country and date of birth to the database', async () => {
    const response = await update({ body: { displayName: T.DISPLAY_NAME, countryCode: T.COUNTRY, dateOfBirth: T.ADULT_BIRTH_DATE } });
    expect(response.status).toBe(HTTP_STATUS.OK);

    const [row] = await DbHelper.query<ProfileFieldsRow>({ sql: T.FIELDS_SQL, params: [userId] });

    expect(row?.country_code).toBe(T.COUNTRY);
    expect(row?.date_of_birth).toBe(T.ADULT_BIRTH_DATE);
    expect(response.body?.user.dateOfBirth).toBe(T.ADULT_BIRTH_DATE);
  });

  it('returns the date of birth as a plain calendar date, so a date input can show it and no timezone shifts it', async () => {
    await update({ body: { displayName: T.DISPLAY_NAME, dateOfBirth: T.ADULT_BIRTH_DATE } });

    const again = await update({ body: { displayName: T.DISPLAY_NAME } });

    expect(again.body?.user.dateOfBirth).toBe(T.ADULT_BIRTH_DATE);
    expect(again.body?.user.dateOfBirth).not.toContain(T.TIME_SEPARATOR);
  });

  it('serves the stored values on a fresh read, so a reloaded page shows what the database holds', async () => {
    await update({ body: { displayName: T.DISPLAY_NAME, countryCode: T.COUNTRY, dateOfBirth: T.ADULT_BIRTH_DATE } });

    const current = await ApiHelper.request<ProfileUserBody>({ method: 'GET', path: T.ME_PATH, token });

    expect(current.status).toBe(HTTP_STATUS.OK);
    expect(current.body?.user.countryCode).toBe(T.COUNTRY);
    expect(current.body?.user.dateOfBirth).toBe(T.ADULT_BIRTH_DATE);
  });

  it('refuses a country code that is not two letters', async () => {
    await kycStatus({ status: T.KYC_NOT_STARTED });

    await expect(update({ body: { displayName: T.DISPLAY_NAME, countryCode: T.THREE_LETTER_COUNTRY } })).resolves.toMatchObject({ status: HTTP_STATUS.BAD_REQUEST });
    await expect(update({ body: { displayName: T.DISPLAY_NAME, countryCode: T.LOWERCASE_COUNTRY } })).resolves.toMatchObject({ status: HTTP_STATUS.BAD_REQUEST });
  });
});

describe('Profile identity fields: validation', () => {
  it('refuses a date of birth under the age limit', async () => {
    const tooYoung = new Date();
    tooYoung.setFullYear(tooYoung.getFullYear() - T.UNDERAGE_YEARS);
    const dateOfBirth = tooYoung.toISOString().slice(0, T.ISO_DATE_LENGTH);

    await expect(update({ body: { displayName: T.DISPLAY_NAME, dateOfBirth } })).resolves.toMatchObject({ status: HTTP_STATUS.BAD_REQUEST });
  });

  it('locks country and date of birth once identity verification is approved', async () => {
    await kycStatus({ status: T.KYC_APPROVED });

    await expect(update({ body: { displayName: T.DISPLAY_NAME, countryCode: T.OTHER_COUNTRY } })).resolves.toMatchObject({ status: HTTP_STATUS.CONFLICT });
    await expect(update({ body: { displayName: T.RENAMED } })).resolves.toMatchObject({ status: HTTP_STATUS.OK });

    const [row] = await DbHelper.query<ProfileFieldsRow>({ sql: T.COUNTRY_SQL, params: [userId] });
    expect(row?.country_code).toBe(T.COUNTRY);
  });
});
