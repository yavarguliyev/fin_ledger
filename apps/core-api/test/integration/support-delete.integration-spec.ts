import { ApiHelper } from '../helpers/api.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SUPPORT_DELETE_TEST } from '../constants/support-delete.constant';
import { SupportConversation, SupportMessage } from '../interfaces/support-chat.interface';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

describe('Support message edit window and deletion', () => {
  let customer = '';
  let staff = '';
  let conversationId = '';

  const messagesPath = (): string => `${SUPPORT_CHAT_TEST.CONVERSATIONS_PATH}/${conversationId}/messages`;

  const send = async (body: string): Promise<string> =>
    (await ApiHelper.request<SupportMessage>({ method: 'POST', path: messagesPath(), token: customer, body: { body } })).body.id;

  const thread = async (token: string): Promise<SupportMessage[]> => (await ApiHelper.request<SupportMessage[]>({ path: messagesPath(), token })).body;

  const remove = (token: string, messageId: string, scope: string): Promise<{ status: number }> =>
    ApiHelper.request({ method: 'DELETE', path: `${messagesPath()}/${messageId}?scope=${scope}`, token });

  const editText = (messageId: string, text: string): Promise<Response> => {
    const form = new FormData();
    form.append('body', text);
    return fetch(`${process.env[TEST_ENV_KEYS.API_URL]}${messagesPath()}/${messageId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customer}`, 'X-Forwarded-For': ApiHelper.randomIp() },
      body: form
    });
  };

  beforeAll(async () => {
    await TestUserHelper.ensure({ emails: [SUPPORT_DELETE_TEST.CUSTOMER_EMAIL] });
    await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[SUPPORT_DELETE_TEST.CUSTOMER_EMAIL]] });
    customer = await ApiHelper.login({ email: SUPPORT_DELETE_TEST.CUSTOMER_EMAIL });
    staff = await ApiHelper.login({ email: SUPPORT_CHAT_TEST.STAFF_EMAIL });

    const [row] = await DbHelper.query<{ id: string }>({ sql: SUPPORT_CHAT_TEST.USER_ID_SQL, params: [SUPPORT_CHAT_TEST.STAFF_EMAIL] });
    const opened = await ApiHelper.request<SupportConversation>({
      method: 'POST',
      path: SUPPORT_CHAT_TEST.CONVERSATIONS_PATH,
      token: customer,
      body: { staffUserId: row?.id }
    });
    conversationId = opened.body.id;
  });

  afterAll(async () => {
    await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[SUPPORT_DELETE_TEST.CUSTOMER_EMAIL]] });
    await DbHelper.close();
  });

  it('stops edits once the 15 minute window has passed', async () => {
    const messageId = await send(SUPPORT_DELETE_TEST.OLD_TEXT);
    await DbHelper.query({ sql: SUPPORT_DELETE_TEST.BACKDATE_SQL, params: [messageId, SUPPORT_DELETE_TEST.PAST_EDIT_WINDOW] });

    expect((await editText(messageId, SUPPORT_DELETE_TEST.KEEP_TEXT)).status).toBe(SUPPORT_DELETE_TEST.BAD_REQUEST);
  });

  it('hides a message only for the sender who deleted it for themselves', async () => {
    const messageId = await send(SUPPORT_DELETE_TEST.KEEP_TEXT);

    expect((await remove(customer, messageId, SUPPORT_DELETE_TEST.ME)).status).toBe(SUPPORT_DELETE_TEST.OK);
    expect((await thread(customer)).some(({ id }) => id === messageId)).toBe(false);
    expect((await thread(staff)).some(({ id }) => id === messageId)).toBe(true);
  });

  it('refuses to let anyone, staff included, delete a message they did not send', async () => {
    const messageId = await send(SUPPORT_DELETE_TEST.KEEP_TEXT);

    expect((await remove(staff, messageId, SUPPORT_DELETE_TEST.EVERYONE)).status).toBe(SUPPORT_DELETE_TEST.FORBIDDEN);
    expect((await remove(staff, messageId, SUPPORT_DELETE_TEST.ME)).status).toBe(SUPPORT_DELETE_TEST.FORBIDDEN);
  });

  it('replaces a message deleted for everyone with an empty tombstone both sides see', async () => {
    const messageId = await send(SUPPORT_DELETE_TEST.GONE_TEXT);

    expect((await remove(customer, messageId, SUPPORT_DELETE_TEST.EVERYONE)).status).toBe(SUPPORT_DELETE_TEST.OK);

    const seen = (await thread(staff)).find(({ id }) => id === messageId) as (SupportMessage & { deletedAt: string | null }) | undefined;

    expect(seen?.body).toBeNull();
    expect(seen?.deletedAt).toBeTruthy();
  });

  it('stops deleting for everyone after 48 hours', async () => {
    const messageId = await send(SUPPORT_DELETE_TEST.OLD_TEXT);
    await DbHelper.query({ sql: SUPPORT_DELETE_TEST.BACKDATE_SQL, params: [messageId, SUPPORT_DELETE_TEST.PAST_DELETE_WINDOW] });

    expect((await remove(customer, messageId, SUPPORT_DELETE_TEST.EVERYONE)).status).toBe(SUPPORT_DELETE_TEST.BAD_REQUEST);
  });
});
