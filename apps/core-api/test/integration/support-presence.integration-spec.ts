import { SupportActionsTestHelper as A } from '../helpers/support-actions.helper';
import { ApiHelper } from '../helpers/api.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_PRESENCE_TEST } from '../constants/support-presence.constant';

let customer = '';

let other = '';

let staff = '';

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [SUPPORT_PRESENCE_TEST.CUSTOMER_EMAIL, SUPPORT_PRESENCE_TEST.OTHER_EMAIL] });
  customer = await ApiHelper.login({ email: SUPPORT_PRESENCE_TEST.CUSTOMER_EMAIL });
  other = await ApiHelper.login({ email: SUPPORT_PRESENCE_TEST.OTHER_EMAIL });
  staff = await ApiHelper.login({ email: SUPPORT_PRESENCE_TEST.STAFF_EMAIL });

  await A.heartbeat({ token: customer });
  await A.heartbeat({ token: other });
  await A.heartbeat({ token: staff });
});

afterAll(async () => DbHelper.close());

describe('Support presence', () => {
  it('shows a customer the staff who can help, and nobody else', async () => {
    const otherId = await SupportTestHelper.userId({ email: SUPPORT_PRESENCE_TEST.OTHER_EMAIL });
    const staffId = await SupportTestHelper.userId({ email: SUPPORT_PRESENCE_TEST.STAFF_EMAIL });

    const visible = await A.presence({ token: customer });

    expect(visible.status).toBe(SUPPORT_PRESENCE_TEST.OK);
    expect(visible.body.map(({ userId }) => userId)).toContain(staffId);
    expect(visible.body.map(({ userId }) => userId)).not.toContain(otherId);
    expect(visible.body.every(({ role }) => role !== SUPPORT_PRESENCE_TEST.USER_ROLE)).toBe(true);
  });

  it('drops someone from the list the moment they sign out', async () => {
    const otherId = await SupportTestHelper.userId({ email: SUPPORT_PRESENCE_TEST.OTHER_EMAIL });

    await A.heartbeat({ token: other });
    await ApiHelper.request({ method: 'POST', path: SUPPORT_PRESENCE_TEST.LEAVE_PATH, token: other, body: {} });

    const seen = await A.presence({ token: staff });

    expect(seen.body.some(({ userId }) => userId === otherId)).toBe(false);

    await A.heartbeat({ token: other });
  });

  it('remembers when someone was last around, so staff can see it after they leave', async () => {
    const otherId = await SupportTestHelper.userId({ email: SUPPORT_PRESENCE_TEST.OTHER_EMAIL });
    const remembered = await ApiHelper.request<{ userId: string; lastSeenAt: string | null }>({
      path: `${SUPPORT_PRESENCE_TEST.LAST_SEEN_PATH}?userId=${otherId}`,
      token: staff
    });

    expect(remembered.status).toBe(SUPPORT_PRESENCE_TEST.OK);
    expect(remembered.body.lastSeenAt).toBeTruthy();
  });

  it('keeps last seen to the support team only', async () => {
    const staffId = await SupportTestHelper.userId({ email: SUPPORT_PRESENCE_TEST.STAFF_EMAIL });
    const refused = await ApiHelper.request({
      path: `${SUPPORT_PRESENCE_TEST.LAST_SEEN_PATH}?userId=${staffId}`,
      token: customer
    });

    expect(refused.status).toBe(SUPPORT_PRESENCE_TEST.FORBIDDEN);
  });
});

describe('Support presence: listing', () => {
  it('never lists the caller themselves, so the sidebar is only other people', async () => {
    const customerId = await SupportTestHelper.userId({ email: SUPPORT_PRESENCE_TEST.CUSTOMER_EMAIL });

    const visible = await A.presence({ token: customer });

    expect(visible.body.map(({ userId }) => userId)).not.toContain(customerId);
  });

  it('shows staff everyone who is online, which is the point of the desk', async () => {
    const customerId = await SupportTestHelper.userId({ email: SUPPORT_PRESENCE_TEST.CUSTOMER_EMAIL });
    const otherId = await SupportTestHelper.userId({ email: SUPPORT_PRESENCE_TEST.OTHER_EMAIL });

    const visible = await A.presence({ token: staff });
    const ids = visible.body.map(({ userId }) => userId);

    expect(ids).toContain(customerId);
    expect(ids).toContain(otherId);
  });

  it('reports a fresh heartbeat as online with a name to show', async () => {
    const visible = await A.presence({ token: customer });
    const entry = visible.body.find(({ role }) => role === SUPPORT_PRESENCE_TEST.STAFF_ROLE);

    expect(entry?.state).toBe(SUPPORT_PRESENCE_TEST.ONLINE);
    expect(entry?.displayName).toBeTruthy();
  });
});
