import { ApiHelper } from '../helpers/api.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_PRESENCE_TEST } from '../constants/support-presence.constant';
import { PresenceEntry } from '../interfaces/support-chat.interface';

let customer = '';

let other = '';

let staff = '';

const heartbeat = (token: string): ReturnType<typeof ApiHelper.request> =>
  ApiHelper.request({ method: 'POST', path: SUPPORT_PRESENCE_TEST.HEARTBEAT_PATH, token, body: {} });

const presence = (token: string): ReturnType<typeof ApiHelper.request<PresenceEntry[]>> =>
  ApiHelper.request<PresenceEntry[]>({ path: SUPPORT_PRESENCE_TEST.PRESENCE_PATH, token });

const idOf = async (email: string): Promise<string> => {
  const [row] = await DbHelper.query<{ id: string }>({ sql: 'SELECT id FROM users WHERE email = $1', params: [email] });

  return row?.id ?? '';
};

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [SUPPORT_PRESENCE_TEST.CUSTOMER_EMAIL, SUPPORT_PRESENCE_TEST.OTHER_EMAIL] });
  customer = await ApiHelper.login({ email: SUPPORT_PRESENCE_TEST.CUSTOMER_EMAIL });
  other = await ApiHelper.login({ email: SUPPORT_PRESENCE_TEST.OTHER_EMAIL });
  staff = await ApiHelper.login({ email: SUPPORT_PRESENCE_TEST.STAFF_EMAIL });

  await heartbeat(customer);
  await heartbeat(other);
  await heartbeat(staff);
});

afterAll(async () => DbHelper.close());

describe('Support presence', () => {
  it('shows a customer the staff who can help, and nobody else', async () => {
    const otherId = await idOf(SUPPORT_PRESENCE_TEST.OTHER_EMAIL);
    const staffId = await idOf(SUPPORT_PRESENCE_TEST.STAFF_EMAIL);

    const visible = await presence(customer);

    expect(visible.status).toBe(SUPPORT_PRESENCE_TEST.OK);
    expect(visible.body.map(({ userId }) => userId)).toContain(staffId);
    expect(visible.body.map(({ userId }) => userId)).not.toContain(otherId);
    expect(visible.body.every(({ role }) => role !== SUPPORT_PRESENCE_TEST.USER_ROLE)).toBe(true);
  });

  it('drops someone from the list the moment they sign out', async () => {
    const otherId = await idOf(SUPPORT_PRESENCE_TEST.OTHER_EMAIL);

    await heartbeat(other);
    await ApiHelper.request({ method: 'POST', path: SUPPORT_PRESENCE_TEST.LEAVE_PATH, token: other, body: {} });

    const seen = await presence(staff);

    expect(seen.body.some(({ userId }) => userId === otherId)).toBe(false);

    await heartbeat(other);
  });

  it('remembers when someone was last around, so staff can see it after they leave', async () => {
    const otherId = await idOf(SUPPORT_PRESENCE_TEST.OTHER_EMAIL);
    const remembered = await ApiHelper.request<{ userId: string; lastSeenAt: string | null }>({
      path: `${SUPPORT_PRESENCE_TEST.LAST_SEEN_PATH}?userId=${otherId}`,
      token: staff
    });

    expect(remembered.status).toBe(SUPPORT_PRESENCE_TEST.OK);
    expect(remembered.body.lastSeenAt).toBeTruthy();
  });

  it('keeps last seen to the support team only', async () => {
    const staffId = await idOf(SUPPORT_PRESENCE_TEST.STAFF_EMAIL);
    const refused = await ApiHelper.request({
      path: `${SUPPORT_PRESENCE_TEST.LAST_SEEN_PATH}?userId=${staffId}`,
      token: customer
    });

    expect(refused.status).toBe(SUPPORT_PRESENCE_TEST.FORBIDDEN);
  });
});

describe('Support presence: listing', () => {
  it('never lists the caller themselves, so the sidebar is only other people', async () => {
    const customerId = await idOf(SUPPORT_PRESENCE_TEST.CUSTOMER_EMAIL);

    const visible = await presence(customer);

    expect(visible.body.map(({ userId }) => userId)).not.toContain(customerId);
  });

  it('shows staff everyone who is online, which is the point of the desk', async () => {
    const customerId = await idOf(SUPPORT_PRESENCE_TEST.CUSTOMER_EMAIL);
    const otherId = await idOf(SUPPORT_PRESENCE_TEST.OTHER_EMAIL);

    const visible = await presence(staff);
    const ids = visible.body.map(({ userId }) => userId);

    expect(ids).toContain(customerId);
    expect(ids).toContain(otherId);
  });

  it('reports a fresh heartbeat as online with a name to show', async () => {
    const visible = await presence(customer);
    const entry = visible.body.find(({ role }) => role === SUPPORT_PRESENCE_TEST.STAFF_ROLE);

    expect(entry?.state).toBe(SUPPORT_PRESENCE_TEST.ONLINE);
    expect(entry?.displayName).toBeTruthy();
  });
});
