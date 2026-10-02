import { randomUUID } from 'node:crypto';

import { ApiHelper } from '../helpers/api.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CHAT_TEST as C } from '../constants/support-chat.constant';
import { SUPPORT_REPLY_TEST as T } from '../constants/support-reply.constant';
import { SupportConversation, SupportMessage } from '../interfaces/support-chat.interface';

const messagesPath = (conversationId: string): string => `${C.CONVERSATIONS_PATH}/${conversationId}/messages`;

describe('Replying to a message', () => {
  let customer = '';
  let staff = '';
  let conversationId = '';
  let originalId = '';

  const send = (token: string, body: string, replyToMessageId?: string): ReturnType<typeof ApiHelper.request<SupportMessage>> =>
    ApiHelper.request<SupportMessage>({ method: 'POST', path: messagesPath(conversationId), token, body: { body, ...(replyToMessageId && { replyToMessageId }) } });

  beforeAll(async () => {
    await TestUserHelper.ensure({ emails: [C.CUSTOMER_EMAIL] });
    await DbHelper.query({ sql: C.CLEAN_SQL, params: [[C.CUSTOMER_EMAIL]] });
    customer = await ApiHelper.login({ email: C.CUSTOMER_EMAIL });
    staff = await ApiHelper.login({ email: C.STAFF_EMAIL });

    const [row] = await DbHelper.query<{ id: string }>({ sql: C.USER_ID_SQL, params: [C.STAFF_EMAIL] });
    const opened = await ApiHelper.request<SupportConversation>({ method: 'POST', path: C.CONVERSATIONS_PATH, token: customer, body: { staffUserId: row?.id } });
    conversationId = opened.body.id;
    originalId = (await send(customer, T.ORIGINAL)).body.id;
  });

  afterAll(async () => {
    await DbHelper.query({ sql: C.CLEAN_SQL, params: [[C.CUSTOMER_EMAIL]] });
    await DbHelper.close();
  });

  it('returns the reply with a quote of the original, live and in the thread', async () => {
    const reply = await send(staff, T.REPLY, originalId);
    const thread = await ApiHelper.request<SupportMessage[]>({ path: messagesPath(conversationId), token: customer });

    expect(reply.status).toBe(C.CREATED);
    expect(reply.body.replyTo).toMatchObject({ id: originalId, body: T.ORIGINAL, deleted: false });
    expect(thread.body.at(-1)?.replyTo).toMatchObject({ id: originalId, body: T.ORIGINAL });
  });

  it('refuses to quote a message from another conversation', async () => {
    const [other] = await DbHelper.query<{ id: string }>({ sql: T.OTHER_MESSAGE_SQL, params: [conversationId] });

    await expect(send(customer, T.STRAY, other?.id ?? randomUUID())).resolves.toMatchObject({ status: T.BAD_REQUEST });
  });
});
