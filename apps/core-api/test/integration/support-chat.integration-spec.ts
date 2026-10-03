import { ApiHelper } from '../helpers/api.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';

let customer = '';

let other = '';

let staff = '';

let conversationId = '';

let staffId = '';

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [SUPPORT_CHAT_TEST.CUSTOMER_EMAIL, SUPPORT_CHAT_TEST.OTHER_EMAIL] });
  await DbHelper.query({
    sql: SUPPORT_CHAT_TEST.CLEAN_SQL,
    params: [[SUPPORT_CHAT_TEST.CUSTOMER_EMAIL, SUPPORT_CHAT_TEST.OTHER_EMAIL]]
  });

  customer = await ApiHelper.login({ email: SUPPORT_CHAT_TEST.CUSTOMER_EMAIL });
  other = await ApiHelper.login({ email: SUPPORT_CHAT_TEST.OTHER_EMAIL });
  staff = await ApiHelper.login({ email: SUPPORT_CHAT_TEST.STAFF_EMAIL });

  staffId = await SupportTestHelper.userId({ email: SUPPORT_CHAT_TEST.STAFF_EMAIL });
});

afterAll(async () => {
  await DbHelper.query({
    sql: SUPPORT_CHAT_TEST.CLEAN_SQL,
    params: [[SUPPORT_CHAT_TEST.CUSTOMER_EMAIL, SUPPORT_CHAT_TEST.OTHER_EMAIL]]
  });
  await DbHelper.close();
});

describe('Support chat', () => {
  it('opens one conversation per customer and staff member, however many times they ask', async () => {
    const first = await SupportTestHelper.open({ token: customer, staffUserId: staffId, subject: SUPPORT_CHAT_TEST.SUBJECT });
    const second = await SupportTestHelper.open({ token: customer, staffUserId: staffId, subject: SUPPORT_CHAT_TEST.SUBJECT });

    expect(first.status).toBe(SUPPORT_CHAT_TEST.CREATED);
    expect(second.body.id).toBe(first.body.id);

    conversationId = first.body.id;
  });

  it('refuses to let staff open a conversation, because staff answer them', async () => {
    const refused = await SupportTestHelper.open({ token: staff, staffUserId: staffId, subject: SUPPORT_CHAT_TEST.SUBJECT });

    expect(refused.status).toBe(SUPPORT_CHAT_TEST.BAD_REQUEST);
  });

  it('lets the customer write and read their own thread', async () => {
    const sent = await SupportTestHelper.send({ token: customer, conversationId, body: SUPPORT_CHAT_TEST.CUSTOMER_TEXT });

    expect(sent.status).toBe(SUPPORT_CHAT_TEST.CREATED);

    const listed = await SupportTestHelper.thread({ token: customer, conversationId });

    expect(listed.body.map(({ body }) => body)).toEqual([SUPPORT_CHAT_TEST.CUSTOMER_TEXT]);
  });

  it('shows the conversation to staff and records who picked it up', async () => {
    const queue = await SupportTestHelper.list({ token: staff });
    const mine = queue.body.find(({ id }) => id === conversationId);

    expect(mine).toBeDefined();
    expect(mine?.unreadCount).toBe(1);

    const replied = await SupportTestHelper.send({ token: staff, conversationId, body: SUPPORT_CHAT_TEST.STAFF_TEXT });

    expect(replied.status).toBe(SUPPORT_CHAT_TEST.CREATED);

    const [row] = await DbHelper.query<{ assignedStaffId: string | null }>({
      sql: SUPPORT_CHAT_TEST.ASSIGNED_SQL,
      params: [conversationId]
    });

    expect(row?.assignedStaffId).toBeTruthy();
  });
});

describe('Support chat: privacy between customers', () => {
  it('hides one customer conversation from another, and refuses their messages', async () => {
    const queue = await SupportTestHelper.list({ token: other });

    expect(queue.body.some(({ id }) => id === conversationId)).toBe(false);

    const peek = await SupportTestHelper.thread({ token: other, conversationId });

    expect(peek.status).toBe(SUPPORT_CHAT_TEST.NOT_FOUND);

    const intrusion = await SupportTestHelper.send({ token: other, conversationId, body: SUPPORT_CHAT_TEST.OTHER_TEXT });

    expect(intrusion.status).toBe(SUPPORT_CHAT_TEST.NOT_FOUND);
  });

  it('counts the staff reply as unread until the customer opens it', async () => {
    const before = await SupportTestHelper.list({ token: customer });

    expect(before.body.find(({ id }) => id === conversationId)?.unreadCount).toBe(1);

    await ApiHelper.request({ method: 'POST', path: `${SUPPORT_CHAT_TEST.CONVERSATIONS_PATH}/${conversationId}/read`, token: customer, body: {} });

    const after = await SupportTestHelper.list({ token: customer });

    expect(after.body.find(({ id }) => id === conversationId)?.unreadCount).toBe(0);
  });
});
