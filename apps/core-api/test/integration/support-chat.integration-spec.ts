import { ApiHelper } from '../helpers/api.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SupportConversation, SupportMessage } from '../interfaces/support-chat.interface';

let customer = '';

let other = '';

let staff = '';

let conversationId = '';

let staffId = '';

const open = (token: string): ReturnType<typeof ApiHelper.request<SupportConversation>> =>
  ApiHelper.request<SupportConversation>({
    method: 'POST',
    path: SUPPORT_CHAT_TEST.CONVERSATIONS_PATH,
    token,
    body: { subject: SUPPORT_CHAT_TEST.SUBJECT, staffUserId: staffId }
  });

const send = (token: string, id: string, body: string): ReturnType<typeof ApiHelper.request<SupportMessage>> =>
  ApiHelper.request<SupportMessage>({ method: 'POST', path: `${SUPPORT_CHAT_TEST.CONVERSATIONS_PATH}/${id}/messages`, token, body: { body } });

const thread = (token: string, id: string): ReturnType<typeof ApiHelper.request<SupportMessage[]>> =>
  ApiHelper.request<SupportMessage[]>({ path: `${SUPPORT_CHAT_TEST.CONVERSATIONS_PATH}/${id}/messages`, token });

const conversations = (token: string): ReturnType<typeof ApiHelper.request<SupportConversation[]>> =>
  ApiHelper.request<SupportConversation[]>({ path: SUPPORT_CHAT_TEST.CONVERSATIONS_PATH, token });

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [SUPPORT_CHAT_TEST.CUSTOMER_EMAIL, SUPPORT_CHAT_TEST.OTHER_EMAIL] });
  await DbHelper.query({
    sql: SUPPORT_CHAT_TEST.CLEAN_SQL,
    params: [[SUPPORT_CHAT_TEST.CUSTOMER_EMAIL, SUPPORT_CHAT_TEST.OTHER_EMAIL]]
  });

  customer = await ApiHelper.login({ email: SUPPORT_CHAT_TEST.CUSTOMER_EMAIL });
  other = await ApiHelper.login({ email: SUPPORT_CHAT_TEST.OTHER_EMAIL });
  staff = await ApiHelper.login({ email: SUPPORT_CHAT_TEST.STAFF_EMAIL });

  const [row] = await DbHelper.query<{ id: string }>({ sql: SUPPORT_CHAT_TEST.USER_ID_SQL, params: [SUPPORT_CHAT_TEST.STAFF_EMAIL] });
  staffId = row?.id ?? '';
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
    const first = await open(customer);
    const second = await open(customer);

    expect(first.status).toBe(SUPPORT_CHAT_TEST.CREATED);
    expect(second.body.id).toBe(first.body.id);

    conversationId = first.body.id;
  });

  it('refuses to let staff open a conversation, because staff answer them', async () => {
    const refused = await open(staff);

    expect(refused.status).toBe(SUPPORT_CHAT_TEST.BAD_REQUEST);
  });

  it('lets the customer write and read their own thread', async () => {
    const sent = await send(customer, conversationId, SUPPORT_CHAT_TEST.CUSTOMER_TEXT);

    expect(sent.status).toBe(SUPPORT_CHAT_TEST.CREATED);

    const listed = await thread(customer, conversationId);

    expect(listed.body.map(({ body }) => body)).toEqual([SUPPORT_CHAT_TEST.CUSTOMER_TEXT]);
  });

  it('shows the conversation to staff and records who picked it up', async () => {
    const queue = await conversations(staff);
    const mine = queue.body.find(({ id }) => id === conversationId);

    expect(mine).toBeDefined();
    expect(mine?.unreadCount).toBe(1);

    const replied = await send(staff, conversationId, SUPPORT_CHAT_TEST.STAFF_TEXT);

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
    const queue = await conversations(other);

    expect(queue.body.some(({ id }) => id === conversationId)).toBe(false);

    const peek = await thread(other, conversationId);

    expect(peek.status).toBe(SUPPORT_CHAT_TEST.NOT_FOUND);

    const intrusion = await send(other, conversationId, SUPPORT_CHAT_TEST.OTHER_TEXT);

    expect(intrusion.status).toBe(SUPPORT_CHAT_TEST.NOT_FOUND);
  });

  it('counts the staff reply as unread until the customer opens it', async () => {
    const before = await conversations(customer);

    expect(before.body.find(({ id }) => id === conversationId)?.unreadCount).toBe(1);

    await ApiHelper.request({ method: 'POST', path: `${SUPPORT_CHAT_TEST.CONVERSATIONS_PATH}/${conversationId}/read`, token: customer, body: {} });

    const after = await conversations(customer);

    expect(after.body.find(({ id }) => id === conversationId)?.unreadCount).toBe(0);
  });
});
