import { SupportActionsTestHelper as A } from '../helpers/support-actions.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SUPPORT_PREVIEW_TEST as T } from '../constants/support-preview.constant';
import { ListedLastMessage } from '../interfaces/support-chat-list.interface';
import { SupportSession } from '../interfaces/support-test.interface';

let session: SupportSession = { customer: '', staff: '', conversationId: '' };

const row = async (): Promise<ListedLastMessage | undefined> =>
  ((await SupportTestHelper.list({ token: session.customer })).body as unknown as ListedLastMessage[]).find(item => item.id === session.conversationId);

const preview = async (): Promise<string | null | undefined> => (await row())?.lastMessagePreview;

beforeAll(async () => {
  session = await SupportTestHelper.start({ customerEmail: T.CUSTOMER_EMAIL });
});

afterAll(async () => {
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[T.CUSTOMER_EMAIL]] });
  await DbHelper.close();
});

describe('Support conversation preview', () => {
  it('follows the latest message through send and edit, and marks it deleted like WhatsApp', async () => {
    const { customer: token, conversationId } = session;
    await SupportTestHelper.send({ token, conversationId, body: T.FIRST_TEXT });
    const messageId = (await SupportTestHelper.send({ token, conversationId, body: T.SECOND_TEXT })).body.id;
    expect(await preview()).toBe(T.SECOND_TEXT);

    expect((await A.editText({ token, conversationId, messageId, text: T.EDITED_TEXT })).status).toBe(T.OK);
    expect(await preview()).toBe(T.EDITED_TEXT);

    expect((await A.remove({ token, conversationId, messageId, scope: T.EVERYONE })).status).toBe(T.OK);
    expect(await row()).toMatchObject({ lastMessagePreview: null, lastMessageDeleted: true });
  });
});
