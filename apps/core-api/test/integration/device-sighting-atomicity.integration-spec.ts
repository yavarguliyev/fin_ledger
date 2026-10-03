import { DEVICE_SIGHTING } from '../constants/device-sighting.constant';
import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { CountQueryDto, CountRow } from '../interfaces/device-sighting.interface';

const count = async ({ sql, params }: CountQueryDto): Promise<number> => {
  const [row] = await DbHelper.query<CountRow>({ sql, params });
  return row?.count ?? 0;
};

let userId = '';

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [DEVICE_SIGHTING.EMAIL] });
  userId = await TestUserHelper.idOf({ email: DEVICE_SIGHTING.EMAIL });
  await DbHelper.query({ sql: DEVICE_SIGHTING.CREATE_FUNCTION_SQL });
  await DbHelper.query({ sql: DEVICE_SIGHTING.CREATE_TRIGGER_SQL });
});

afterAll(async () => {
  await DbHelper.query({ sql: DEVICE_SIGHTING.DROP_TRIGGER_SQL });
  await DbHelper.query({ sql: DEVICE_SIGHTING.DROP_FUNCTION_SQL });
  await DbHelper.close();
});

describe('Device sighting atomicity', () => {
  it('keeps neither the device nor the login event when the new-device event cannot be queued, and still signs in', async () => {
    const response = await ApiHelper.request({
      method: 'POST',
      path: DEVICE_SIGHTING.LOGIN_PATH,
      deviceId: DEVICE_SIGHTING.FAILING_DEVICE,
      body: { email: DEVICE_SIGHTING.EMAIL, password: SEED_PASSWORD }
    });

    expect(response.status).toBe(DEVICE_SIGHTING.CREATED);
    await expect(count({ sql: DEVICE_SIGHTING.DEVICES_SQL, params: [userId] })).resolves.toBe(0);
    await expect(count({ sql: DEVICE_SIGHTING.LOGIN_EVENTS_SQL, params: [userId] })).resolves.toBe(0);
    await expect(count({ sql: DEVICE_SIGHTING.OUTBOX_SQL, params: [userId, DEVICE_SIGHTING.NEW_DEVICE_EVENT] })).resolves.toBe(0);
  });

  it('writes the device, the login event and one new-device event together once the outbox accepts it', async () => {
    await DbHelper.query({ sql: DEVICE_SIGHTING.DROP_TRIGGER_SQL });

    await ApiHelper.request({
      method: 'POST',
      path: DEVICE_SIGHTING.LOGIN_PATH,
      deviceId: DEVICE_SIGHTING.FAILING_DEVICE,
      body: { email: DEVICE_SIGHTING.EMAIL, password: SEED_PASSWORD }
    });

    await expect(count({ sql: DEVICE_SIGHTING.DEVICES_SQL, params: [userId] })).resolves.toBe(1);
    await expect(count({ sql: DEVICE_SIGHTING.LOGIN_EVENTS_SQL, params: [userId] })).resolves.toBe(1);
    await expect(count({ sql: DEVICE_SIGHTING.OUTBOX_SQL, params: [userId, DEVICE_SIGHTING.NEW_DEVICE_EVENT] })).resolves.toBe(1);
  });
});
