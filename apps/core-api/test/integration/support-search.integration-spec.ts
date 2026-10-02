import { ApiHelper } from '../helpers/api.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CHAT_TEST as C } from '../constants/support-chat.constant';
import { MESSAGE_SEARCH_TEST as T } from '../constants/message-search.constant';
import { SupportConversation } from '../interfaces/support-chat.interface';
import { MessageHit } from '../interfaces/message-hit.interface';

describe('Searching inside a conversation', () => {
  let customer = '';
  let outsider = '';
  let conversationId = '';

  const search = (token: string, q: string): ReturnType<typeof ApiHelper.request<MessageHit[]>> =>
    ApiHelper.request<MessageHit[]>({ path: `${C.CONVERSATIONS_PATH}/${conversationId}${T.SEARCH_SUFFIX}${encodeURIComponent(q)}`, token });

  beforeAll(async () => {
    await TestUserHelper.ensure({ emails: [C.CUSTOMER_EMAIL, C.OTHER_EMAIL] });
    await DbHelper.query({ sql: C.CLEAN_SQL, params: [[C.CUSTOMER_EMAIL, C.OTHER_EMAIL]] });
    customer = await ApiHelper.login({ email: C.CUSTOMER_EMAIL });
    outsider = await ApiHelper.login({ email: C.OTHER_EMAIL });

    const [staff] = await DbHelper.query<{ id: string }>({ sql: C.USER_ID_SQL, params: [C.STAFF_EMAIL] });
    const opened = await ApiHelper.request<SupportConversation>({ method: 'POST', path: C.CONVERSATIONS_PATH, token: customer, body: { staffUserId: staff?.id } });
    conversationId = opened.body.id;

    for (const body of [T.PERCENT_TEXT, T.PLAIN_TEXT, T.OTHER_TEXT]) {
      await ApiHelper.request({ method: 'POST', path: `${C.CONVERSATIONS_PATH}/${conversationId}/messages`, token: customer, body: { body } });
    }
  });

  afterAll(async () => {
    await DbHelper.query({ sql: C.CLEAN_SQL, params: [[C.CUSTOMER_EMAIL, C.OTHER_EMAIL]] });
    await DbHelper.close();
  });

  it('finds every message containing the text, ignoring case, newest first', async () => {
    const response = await search(customer, T.BONUS);

    expect(response.status).toBe(C.OK);
    expect(response.body.map(hit => hit.body)).toEqual([T.PLAIN_TEXT, T.PERCENT_TEXT]);
  });

  it('treats % and _ as plain characters, not wildcards', async () => {
    await expect(search(customer, T.PERCENT)).resolves.toMatchObject({ body: [{ body: T.PERCENT_TEXT }] });
    await expect(search(customer, `${T.UNDERSCORE}${T.UNDERSCORE}`)).resolves.toMatchObject({ body: [] });
  });

  it('refuses someone outside the conversation, and a one-letter search', async () => {
    await expect(search(outsider, T.BONUS)).resolves.toMatchObject({ status: C.NOT_FOUND });
    await expect(search(customer, T.TOO_SHORT)).resolves.toMatchObject({ status: T.BAD_REQUEST });
  });
});
