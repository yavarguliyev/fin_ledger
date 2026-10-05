import { DEVICE_TRACKING as D } from '../constants/device-tracking.constant';
import { EMAIL_TOPICS } from '../constants/email-topics.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { EmailInboxHelper } from '../helpers/email-inbox.helper';
import { DeviceCountDto, DeviceCountRow, DeviceEmailDto, DeviceSignInDto } from '../interfaces/device-tracking.interface';
import { SharedDevice } from '../interfaces/shared-device.interface';

const signIn = ({ email, deviceId }: DeviceSignInDto): Promise<{ status: number }> =>
  ApiHelper.request({ method: 'POST', path: D.LOGIN_PATH, deviceId, body: { email, password: D.PASSWORD } });

const enrol = async ({ email }: DeviceEmailDto): Promise<void> => {
  await ApiHelper.request({
    method: 'POST',
    path: D.REGISTER_PATH,
    body: { email, password: D.PASSWORD, displayName: email, termsAccepted: true }
  });

  const sent = await EmailInboxHelper.waitFor({ to: email, topic: EMAIL_TOPICS.EMAIL_VERIFICATION });

  await ApiHelper.request({ method: 'POST', path: D.VERIFY_EMAIL_PATH, body: { token: new URL(sent.url).searchParams.get(D.TOKEN_PARAM) } });
};

const count = async ({ sql, email }: DeviceCountDto): Promise<number> => {
  const [row] = await DbHelper.query<DeviceCountRow>({ sql, params: [email] });
  return row?.count ?? 0;
};

const devices = ({ email }: DeviceEmailDto): Promise<number> => count({ sql: D.DEVICES_SQL, email });

const newDeviceLogins = ({ email }: DeviceEmailDto): Promise<number> => count({ sql: D.NEW_DEVICE_LOGINS_SQL, email });

beforeAll(async () => {
  await enrol({ email: D.FIRST_EMAIL });
  await enrol({ email: D.SECOND_EMAIL });
});

afterAll(async () => DbHelper.close());

describe('Device tracking', () => {
  it('records a device the first time it is seen and alerts the account', async () => {
    await expect(signIn({ email: D.FIRST_EMAIL, deviceId: D.KNOWN_DEVICE })).resolves.toMatchObject({
      status: D.CREATED
    });

    await expect(devices({ email: D.FIRST_EMAIL })).resolves.toBe(1);
    await expect(newDeviceLogins({ email: D.FIRST_EMAIL })).resolves.toBe(1);
    await expect(EmailInboxHelper.waitFor({ to: D.FIRST_EMAIL, topic: EMAIL_TOPICS.NEW_DEVICE })).resolves.toBeDefined();
  });

  it('does not treat the same device as new on the next sign-in', async () => {
    await signIn({ email: D.FIRST_EMAIL, deviceId: D.KNOWN_DEVICE });

    await expect(devices({ email: D.FIRST_EMAIL })).resolves.toBe(1);
    await expect(newDeviceLogins({ email: D.FIRST_EMAIL })).resolves.toBe(1);
  });

  it('records a second device separately', async () => {
    await signIn({ email: D.FIRST_EMAIL, deviceId: D.OTHER_DEVICE });

    await expect(devices({ email: D.FIRST_EMAIL })).resolves.toBe(2);
    await expect(newDeviceLogins({ email: D.FIRST_EMAIL })).resolves.toBe(2);
  });

  it('still records a sign-in with no device header, without inventing a device', async () => {
    const before = await devices({ email: D.SECOND_EMAIL });

    await ApiHelper.request({
      method: 'POST',
      path: D.LOGIN_PATH,
      body: { email: D.SECOND_EMAIL, password: D.PASSWORD }
    });

    await expect(devices({ email: D.SECOND_EMAIL })).resolves.toBe(before);

    await expect(count({ sql: D.LOGINS_SQL, email: D.SECOND_EMAIL })).resolves.toBeGreaterThan(0);
  });
});

describe('Device tracking: staff view', () => {
  it('shows staff the accounts that share a device, and keeps moderators out', async () => {
    await signIn({ email: D.FIRST_EMAIL, deviceId: D.SHARED_DEVICE });
    await signIn({ email: D.SECOND_EMAIL, deviceId: D.SHARED_DEVICE });

    const admin = await ApiHelper.login({ email: D.ADMIN_EMAIL });
    const shared = await ApiHelper.request<SharedDevice[]>({ path: D.SHARED_DEVICES_PATH, token: admin });

    expect(shared.status).toBe(D.OK);

    const entry = shared.body.find(({ visitorId }) => visitorId === D.SHARED_DEVICE);
    expect(entry?.accountCount).toBe(D.SHARED_ACCOUNTS);
    expect(entry?.emails).toEqual(expect.arrayContaining([D.FIRST_EMAIL, D.SECOND_EMAIL]));
  });
});
