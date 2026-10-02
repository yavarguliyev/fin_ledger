import { ApiHelper } from '../helpers/api.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { DbHelper } from '../helpers/db.helper';
import { SseReaderHelper } from '../helpers/sse-reader.helper';
import { SUPPORT_CHAT_TEST as T } from '../constants/support-chat.constant';
import { SupportConversation } from '../interfaces/support-chat.interface';
import { StreamTicketResponse } from '../interfaces/stream-ticket-response.interface';

const openStream = async (token: string): Promise<SseReaderHelper> => {
  const ticket = await ApiHelper.request<StreamTicketResponse>({ method: 'POST', path: T.STREAM_TICKET_PATH, token, body: {} });
  return SseReaderHelper.open({ path: `${T.STREAM_PATH}${ticket.body.ticket}` });
};

describe('Support typing indicator', () => {
  let customer = '';
  let staff = '';
  let outsider = '';
  let customerId = '';
  let conversationId = '';

  const typing = (token: string): ReturnType<typeof ApiHelper.request> =>
    ApiHelper.request({ method: 'POST', path: `${T.CONVERSATIONS_PATH}/${conversationId}/typing`, token, body: {} });

  beforeAll(async () => {
    await TestUserHelper.ensure({ emails: [T.CUSTOMER_EMAIL, T.OTHER_EMAIL] });
    await DbHelper.query({ sql: T.CLEAN_SQL, params: [[T.CUSTOMER_EMAIL, T.OTHER_EMAIL]] });

    customer = await ApiHelper.login({ email: T.CUSTOMER_EMAIL });
    staff = await ApiHelper.login({ email: T.STAFF_EMAIL });
    outsider = await ApiHelper.login({ email: T.OTHER_EMAIL });

    const [staffRow] = await DbHelper.query<{ id: string }>({ sql: T.USER_ID_SQL, params: [T.STAFF_EMAIL] });
    const [customerRow] = await DbHelper.query<{ id: string }>({ sql: T.USER_ID_SQL, params: [T.CUSTOMER_EMAIL] });
    customerId = customerRow?.id ?? '';

    const opened = await ApiHelper.request<SupportConversation>({ method: 'POST', path: T.CONVERSATIONS_PATH, token: customer, body: { staffUserId: staffRow?.id } });
    conversationId = opened.body.id;
  });

  afterAll(async () => {
    await DbHelper.query({ sql: T.CLEAN_SQL, params: [[T.CUSTOMER_EMAIL, T.OTHER_EMAIL]] });
    await DbHelper.close();
  });

  it('tells the other side, live, who is typing in which conversation', async () => {
    const stream = await openStream(staff);

    try {
      const sent = await typing(customer);
      const event = await stream.waitFor({ type: T.TYPING_EVENT, timeoutMs: T.STREAM_WAIT_MS });

      expect(sent.status).toBe(T.CREATED);
      expect(event).toMatchObject({ conversationId, typingUserId: customerId });
    } finally {
      stream.close();
    }
  });

  it('refuses typing in a conversation the caller is not part of', async () => {
    await expect(typing(outsider)).resolves.toMatchObject({ status: T.NOT_FOUND });
  });
});
