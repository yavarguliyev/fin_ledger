import { ApiHelper } from '../helpers/api.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CHAT_TEST as T } from '../constants/support-chat.constant';

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

    const staffUserId = await SupportTestHelper.userId({ email: T.STAFF_EMAIL });
    customerId = await SupportTestHelper.userId({ email: T.CUSTOMER_EMAIL });

    const opened = await SupportTestHelper.open({ token: customer, staffUserId });
    conversationId = opened.body.id;
  });

  afterAll(async () => {
    await DbHelper.query({ sql: T.CLEAN_SQL, params: [[T.CUSTOMER_EMAIL, T.OTHER_EMAIL]] });
    await DbHelper.close();
  });

  it('tells the other side, live, who is typing in which conversation', async () => {
    const stream = await SupportTestHelper.openStream({ token: staff });

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
