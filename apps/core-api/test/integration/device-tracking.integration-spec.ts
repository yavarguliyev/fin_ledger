import { DEVICE_TRACKING } from '../constants/device-tracking.constant';
import { EMAIL_TOPICS } from '../constants/email-topics.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { EmailInboxHelper } from '../helpers/email-inbox.helper';
import { SharedDevice } from '../interfaces/shared-device.interface';

const signIn = (email: string, deviceId: string): Promise<{ status: number }> =>
  ApiHelper.request({ method: 'POST', path: DEVICE_TRACKING.LOGIN_PATH, deviceId, body: { email, password: DEVICE_TRACKING.PASSWORD } });

const enrol = async (email: string): Promise<void> => {
  await ApiHelper.request({
    method: 'POST',
    path: DEVICE_TRACKING.REGISTER_PATH,
    body: { email, password: DEVICE_TRACKING.PASSWORD, displayName: email, termsAccepted: true }
  });

  const sent = await EmailInboxHelper.waitFor({ to: email, topic: EMAIL_TOPICS.EMAIL_VERIFICATION });

  await ApiHelper.request({
    method: 'POST',
    path: DEVICE_TRACKING.VERIFY_EMAIL_PATH,
    body: { token: new URL(sent.url).searchParams.get('token') }
  });
};

const devices = async (email: string): Promise<number> => {
  const [row] = await DbHelper.query<{ count: number }>({
    sql: 'SELECT count(*)::int AS count FROM user_devices d JOIN users u ON u.id = d.user_id WHERE u.email = $1',
    params: [email]
  });

  return row?.count ?? 0;
};

const newDeviceLogins = async (email: string): Promise<number> => {
  const [row] = await DbHelper.query<{ count: number }>({
    sql: 'SELECT count(*)::int AS count FROM login_events e JOIN users u ON u.id = e.user_id WHERE u.email = $1 AND e.is_new_device',
    params: [email]
  });

  return row?.count ?? 0;
};

beforeAll(async () => {
  await enrol(DEVICE_TRACKING.FIRST_EMAIL);
  await enrol(DEVICE_TRACKING.SECOND_EMAIL);
});

afterAll(async () => DbHelper.close());

describe('Device tracking', () => {
  it('records a device the first time it is seen and alerts the account', async () => {
    await expect(signIn(DEVICE_TRACKING.FIRST_EMAIL, DEVICE_TRACKING.KNOWN_DEVICE)).resolves.toMatchObject({
      status: DEVICE_TRACKING.CREATED
    });

    await expect(devices(DEVICE_TRACKING.FIRST_EMAIL)).resolves.toBe(1);
    await expect(newDeviceLogins(DEVICE_TRACKING.FIRST_EMAIL)).resolves.toBe(1);
    await expect(EmailInboxHelper.waitFor({ to: DEVICE_TRACKING.FIRST_EMAIL, topic: EMAIL_TOPICS.NEW_DEVICE })).resolves.toBeDefined();
  });

  it('does not treat the same device as new on the next sign-in', async () => {
    await signIn(DEVICE_TRACKING.FIRST_EMAIL, DEVICE_TRACKING.KNOWN_DEVICE);

    await expect(devices(DEVICE_TRACKING.FIRST_EMAIL)).resolves.toBe(1);
    await expect(newDeviceLogins(DEVICE_TRACKING.FIRST_EMAIL)).resolves.toBe(1);
  });

  it('records a second device separately', async () => {
    await signIn(DEVICE_TRACKING.FIRST_EMAIL, DEVICE_TRACKING.OTHER_DEVICE);

    await expect(devices(DEVICE_TRACKING.FIRST_EMAIL)).resolves.toBe(2);
    await expect(newDeviceLogins(DEVICE_TRACKING.FIRST_EMAIL)).resolves.toBe(2);
  });

  it('still records a sign-in with no device header, without inventing a device', async () => {
    const before = await devices(DEVICE_TRACKING.SECOND_EMAIL);

    await ApiHelper.request({
      method: 'POST',
      path: DEVICE_TRACKING.LOGIN_PATH,
      body: { email: DEVICE_TRACKING.SECOND_EMAIL, password: DEVICE_TRACKING.PASSWORD }
    });

    await expect(devices(DEVICE_TRACKING.SECOND_EMAIL)).resolves.toBe(before);

    const [row] = await DbHelper.query<{ count: number }>({
      sql: 'SELECT count(*)::int AS count FROM login_events e JOIN users u ON u.id = e.user_id WHERE u.email = $1',
      params: [DEVICE_TRACKING.SECOND_EMAIL]
    });

    expect(row?.count).toBeGreaterThan(0);
  });
});

describe('Device tracking: staff view', () => {
  it('shows staff the accounts that share a device, and keeps moderators out', async () => {
    await signIn(DEVICE_TRACKING.FIRST_EMAIL, DEVICE_TRACKING.SHARED_DEVICE);
    await signIn(DEVICE_TRACKING.SECOND_EMAIL, DEVICE_TRACKING.SHARED_DEVICE);

    const admin = await ApiHelper.login({ email: DEVICE_TRACKING.ADMIN_EMAIL });
    const shared = await ApiHelper.request<SharedDevice[]>({ path: DEVICE_TRACKING.SHARED_DEVICES_PATH, token: admin });

    expect(shared.status).toBe(DEVICE_TRACKING.OK);

    const entry = shared.body.find(({ visitorId }) => visitorId === DEVICE_TRACKING.SHARED_DEVICE);
    expect(entry?.accountCount).toBe(DEVICE_TRACKING.SHARED_ACCOUNTS);
    expect(entry?.emails).toEqual(expect.arrayContaining([DEVICE_TRACKING.FIRST_EMAIL, DEVICE_TRACKING.SECOND_EMAIL]));
  });
});
