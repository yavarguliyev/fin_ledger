import { randomUUID } from 'node:crypto';

import { ApiHelper } from '../helpers/api.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CHAT_TEST as C } from '../constants/support-chat.constant';
import { SUPPORT_REPLY_TEST as T } from '../constants/support-reply.constant';

describe('Replying to a message', () => {
  let customer = '';
  let staff = '';
  let conversationId = '';
  let originalId = '';

  beforeAll(async () => {
    await TestUserHelper.ensure({ emails: [C.CUSTOMER_EMAIL] });
    await DbHelper.query({ sql: C.CLEAN_SQL, params: [[C.CUSTOMER_EMAIL]] });
    customer = await ApiHelper.login({ email: C.CUSTOMER_EMAIL });
    staff = await ApiHelper.login({ email: C.STAFF_EMAIL });

    const staffUserId = await SupportTestHelper.userId({ email: C.STAFF_EMAIL });
    const opened = await SupportTestHelper.open({ token: customer, staffUserId });
    conversationId = opened.body.id;
    originalId = (await SupportTestHelper.send({ token: customer, conversationId, body: T.ORIGINAL })).body.id;
  });

  afterAll(async () => {
    await DbHelper.query({ sql: C.CLEAN_SQL, params: [[C.CUSTOMER_EMAIL]] });
    await DbHelper.close();
  });

  it('returns the reply with a quote of the original, live and in the thread', async () => {
    const reply = await SupportTestHelper.send({ token: staff, conversationId, body: T.REPLY, replyToMessageId: originalId });
    const thread = await SupportTestHelper.thread({ token: customer, conversationId });

    expect(reply.status).toBe(C.CREATED);
    expect(reply.body.replyTo).toMatchObject({ id: originalId, body: T.ORIGINAL, deleted: false });
    expect(thread.body.at(-1)?.replyTo).toMatchObject({ id: originalId, body: T.ORIGINAL });
  });

  it('refuses to quote a message from another conversation', async () => {
    const [other] = await DbHelper.query<{ id: string }>({ sql: T.OTHER_MESSAGE_SQL, params: [conversationId] });

    await expect(SupportTestHelper.send({ token: customer, conversationId, body: T.STRAY, replyToMessageId: other?.id ?? randomUUID() })).resolves.toMatchObject({ status: T.BAD_REQUEST });
  });
});
