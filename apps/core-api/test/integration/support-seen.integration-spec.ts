import { SupportActionsTestHelper as A } from '../helpers/support-actions.helper';
import { ApiHelper } from '../helpers/api.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';

let customer = '';

let staff = '';

let conversationId = '';

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [SUPPORT_CHAT_TEST.CUSTOMER_EMAIL] });
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[SUPPORT_CHAT_TEST.CUSTOMER_EMAIL]] });

  customer = await ApiHelper.login({ email: SUPPORT_CHAT_TEST.CUSTOMER_EMAIL });
  staff = await ApiHelper.login({ email: SUPPORT_CHAT_TEST.STAFF_EMAIL });

  const staffUserId = await SupportTestHelper.userId({ email: SUPPORT_CHAT_TEST.STAFF_EMAIL });

  const opened = await SupportTestHelper.open({ token: customer, staffUserId });

  conversationId = opened.body.id;
});

afterAll(async () => {
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[SUPPORT_CHAT_TEST.CUSTOMER_EMAIL]] });
  await DbHelper.close();
});

describe('Support read receipts', () => {
  it('leaves a new message unseen until somebody else opens the thread', async () => {
    await SupportTestHelper.send({ token: customer, conversationId, body: SUPPORT_CHAT_TEST.CUSTOMER_TEXT });

    const mine = await SupportTestHelper.thread({ token: customer, conversationId });

    expect(mine.body.at(-1)?.seen).toBe(false);
  });

  it('does not count the sender reading their own thread as seen', async () => {
    await A.markRead({ token: customer, conversationId });

    const mine = await SupportTestHelper.thread({ token: customer, conversationId });

    expect(mine.body.at(-1)?.seen).toBe(false);
  });

  it('marks the message seen once staff open the conversation', async () => {
    await A.markRead({ token: staff, conversationId });

    const mine = await SupportTestHelper.thread({ token: customer, conversationId });

    expect(mine.body.at(-1)?.seen).toBe(true);
  });

  it('keeps a later reply unseen until the customer reads it again', async () => {
    const replied = await SupportTestHelper.send({ token: staff, conversationId, body: SUPPORT_CHAT_TEST.STAFF_REPLY });

    expect(replied.status).toBe(SUPPORT_CHAT_TEST.CREATED);

    const beforeRead = await SupportTestHelper.thread({ token: staff, conversationId });

    expect(beforeRead.body.at(-1)?.seen).toBe(false);

    await A.markRead({ token: customer, conversationId });

    const afterRead = await SupportTestHelper.thread({ token: staff, conversationId });

    expect(afterRead.body.at(-1)?.seen).toBe(true);
  });
});
