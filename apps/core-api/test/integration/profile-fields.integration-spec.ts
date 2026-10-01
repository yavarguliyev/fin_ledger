import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';

interface ProfileUser {
  countryCode: string | null;
  dateOfBirth: string | null;
  createdAt: string;
}

const EMAIL = 'player8@realtime-wallet-payments.com';
const ADULT_BIRTH_DATE = '1990-04-17';

describe('Profile identity fields', () => {
  let token: string;
  let userId: string;

  const update = (body: Record<string, unknown>): ReturnType<typeof ApiHelper.request<{ user: ProfileUser }>> =>
    ApiHelper.request<{ user: ProfileUser }>({ method: 'PATCH', path: '/users', token, body });

  const kycStatus = async (status: string): Promise<void> => {
    await DbHelper.query({ sql: 'UPDATE users SET kyc_status = $1 WHERE id = $2', params: [status, userId] });
  };

  beforeAll(async () => {
    token = await ApiHelper.login({ email: EMAIL, password: SEED_PASSWORD });
    const [user] = await DbHelper.query<{ id: string }>({ sql: 'SELECT id FROM users WHERE email = $1', params: [EMAIL] });
    userId = user?.id as string;

    await kycStatus('NOT_STARTED');
  });

  afterAll(async () => {
    await kycStatus('NOT_STARTED');
    await DbHelper.close();
  });

  it('returns the account creation date, so the profile does not have to guess it from a wallet', async () => {
    const response = await update({ displayName: 'Seed Player' });

    expect(response.status).toBe(200);
    expect(Date.parse(response.body?.user.createdAt ?? '')).not.toBeNaN();
  });

  it('saves country and date of birth to the database', async () => {
    const response = await update({ displayName: 'Seed Player', countryCode: 'GB', dateOfBirth: ADULT_BIRTH_DATE });
    expect(response.status).toBe(200);

    const [row] = await DbHelper.query<{ country_code: string; date_of_birth: string }>({
      sql: 'SELECT country_code, date_of_birth::text AS date_of_birth FROM users WHERE id = $1',
      params: [userId]
    });

    expect(row?.country_code).toBe('GB');
    expect(row?.date_of_birth).toBe(ADULT_BIRTH_DATE);
    expect(response.body?.user.dateOfBirth).toBe(ADULT_BIRTH_DATE);
  });

  it('returns the date of birth as a plain calendar date, so a date input can show it and no timezone shifts it', async () => {
    await update({ displayName: 'Seed Player', dateOfBirth: ADULT_BIRTH_DATE });

    const again = await ApiHelper.request<{ user: ProfileUser }>({ method: 'PATCH', path: '/users', token, body: { displayName: 'Seed Player' } });

    expect(again.body?.user.dateOfBirth).toBe(ADULT_BIRTH_DATE);
    expect(again.body?.user.dateOfBirth).not.toContain('T');
  });

  it('serves the stored values on a fresh read, so a reloaded page shows what the database holds', async () => {
    await update({ displayName: 'Seed Player', countryCode: 'GB', dateOfBirth: ADULT_BIRTH_DATE });

    const current = await ApiHelper.request<{ user: ProfileUser }>({ method: 'GET', path: '/users/me', token });

    expect(current.status).toBe(200);
    expect(current.body?.user.countryCode).toBe('GB');
    expect(current.body?.user.dateOfBirth).toBe(ADULT_BIRTH_DATE);
  });

  it('refuses a country code that is not two letters', async () => {
    await kycStatus('NOT_STARTED');

    await expect(update({ displayName: 'Seed Player', countryCode: 'GBR' })).resolves.toMatchObject({ status: 400 });
    await expect(update({ displayName: 'Seed Player', countryCode: 'gb' })).resolves.toMatchObject({ status: 400 });
  });

  it('refuses a date of birth under the age limit', async () => {
    const tooYoung = new Date();
    tooYoung.setFullYear(tooYoung.getFullYear() - 10);

    await expect(update({ displayName: 'Seed Player', dateOfBirth: tooYoung.toISOString().slice(0, 10) })).resolves.toMatchObject({ status: 400 });
  });

  it('locks country and date of birth once identity verification is approved', async () => {
    await kycStatus('APPROVED');

    await expect(update({ displayName: 'Seed Player', countryCode: 'FR' })).resolves.toMatchObject({ status: 409 });
    await expect(update({ displayName: 'Renamed Player' })).resolves.toMatchObject({ status: 200 });

    const [row] = await DbHelper.query<{ country_code: string }>({ sql: 'SELECT country_code FROM users WHERE id = $1', params: [userId] });
    expect(row?.country_code).toBe('GB');
  });
});
