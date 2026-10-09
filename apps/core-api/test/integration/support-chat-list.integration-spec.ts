import { DbHelper } from '../helpers/db.helper';
import { SupportActionsTestHelper } from '../helpers/support-actions.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SUPPORT_CHAT_LIST_TEST as T } from '../constants/support-chat-list.constant';
import { ListedLastMessage } from '../interfaces/support-chat-list.interface';
import { SupportSession } from '../interfaces/support-test.interface';

let session: SupportSession = { customer: '', staff: '', conversationId: '' };

const listed = async (token: string): Promise<ListedLastMessage | undefined> =>
  ((await SupportTestHelper.list({ token })).body as unknown as ListedLastMessage[]).find(item => item.id === session.conversationId);

beforeAll(async () => {
  session = await SupportTestHelper.start({ customerEmail: T.CUSTOMER_EMAIL });
});

afterAll(async () => {
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[T.CUSTOMER_EMAIL]] });
  await DbHelper.close();
});

describe('Support chat list last message', () => {
  it('tells who sent the last message, what it is and whether the other side has read it', async () => {
    const { customer, staff, conversationId } = session;
    await SupportTestHelper.send({ token: customer, conversationId, body: T.FIRST });
    const customerId = await SupportTestHelper.userId({ email: T.CUSTOMER_EMAIL });

    expect(await listed(customer)).toMatchObject({ lastMessagePreview: T.FIRST, lastMessageSenderId: customerId, lastMessageKind: T.TEXT_KIND, lastMessageSeen: false });

    await SupportActionsTestHelper.markRead({ token: staff, conversationId });
    expect((await listed(customer))?.lastMessageSeen).toBe(true);
  });

  it('shows each person the last message they can still see', async () => {
    const { customer, staff, conversationId } = session;
    const typo = (await SupportTestHelper.send({ token: customer, conversationId, body: T.SECOND })).body.id;
    await SupportActionsTestHelper.remove({ token: customer, conversationId, messageId: typo, scope: T.ME });

    expect((await listed(customer))?.lastMessagePreview).toBe(T.FIRST);
    expect((await listed(staff))?.lastMessagePreview).toBe(T.SECOND);
  });
});
