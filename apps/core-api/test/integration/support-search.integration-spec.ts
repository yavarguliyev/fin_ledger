import { ApiHelper } from '../helpers/api.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CHAT_TEST as C } from '../constants/support-chat.constant';
import { MESSAGE_SEARCH_TEST as T } from '../constants/message-search.constant';
import { MessageHit, MessageSearchDto } from '../interfaces/message-hit.interface';

describe('Searching inside a conversation', () => {
  let customer = '';
  let outsider = '';
  let conversationId = '';

  const search = ({ token, q }: MessageSearchDto): ReturnType<typeof ApiHelper.request<MessageHit[]>> =>
    ApiHelper.request<MessageHit[]>({ path: `${C.CONVERSATIONS_PATH}/${conversationId}${T.SEARCH_SUFFIX}${encodeURIComponent(q)}`, token });

  beforeAll(async () => {
    ({ customer, conversationId } = await SupportTestHelper.start({ customerEmail: C.CUSTOMER_EMAIL, otherEmails: [C.OTHER_EMAIL] }));
    outsider = await ApiHelper.login({ email: C.OTHER_EMAIL });

    for (const body of [T.PERCENT_TEXT, T.PLAIN_TEXT, T.OTHER_TEXT]) {
      await SupportTestHelper.send({ token: customer, conversationId, body });
    }
  });

  afterAll(async () => {
    await DbHelper.query({ sql: C.CLEAN_SQL, params: [[C.CUSTOMER_EMAIL, C.OTHER_EMAIL]] });
    await DbHelper.close();
  });

  it('finds every message containing the text, ignoring case, newest first', async () => {
    const response = await search({ token: customer, q: T.BONUS });

    expect(response.status).toBe(C.OK);
    expect(response.body.map(hit => hit.body)).toEqual([T.PLAIN_TEXT, T.PERCENT_TEXT]);
  });

  it('treats % and _ as plain characters, not wildcards', async () => {
    await expect(search({ token: customer, q: T.PERCENT })).resolves.toMatchObject({ body: [{ body: T.PERCENT_TEXT }] });
    await expect(search({ token: customer, q: `${T.UNDERSCORE}${T.UNDERSCORE}` })).resolves.toMatchObject({ body: [] });
  });

  it('refuses someone outside the conversation, and a one-letter search', async () => {
    await expect(search({ token: outsider, q: T.BONUS })).resolves.toMatchObject({ status: C.NOT_FOUND });
    await expect(search({ token: customer, q: T.TOO_SHORT })).resolves.toMatchObject({ status: T.BAD_REQUEST });
  });
});
