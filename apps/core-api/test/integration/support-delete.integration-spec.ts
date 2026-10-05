import { SupportActionsTestHelper as A } from '../helpers/support-actions.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SUPPORT_DELETE_TEST } from '../constants/support-delete.constant';
import { SupportMessage } from '../interfaces/support-chat.interface';

let customer = '';

let staff = '';

let conversationId = '';

beforeAll(async () => {
  ({ customer, staff, conversationId } = await SupportTestHelper.start({ customerEmail: SUPPORT_DELETE_TEST.CUSTOMER_EMAIL }));
});

afterAll(async () => {
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[SUPPORT_DELETE_TEST.CUSTOMER_EMAIL]] });
  await DbHelper.close();
});

describe('Support message edit window and deletion', () => {
  it('stops edits once the 15 minute window has passed', async () => {
    const messageId = (await SupportTestHelper.send({ token: customer, conversationId, body: SUPPORT_DELETE_TEST.OLD_TEXT })).body.id;
    await DbHelper.query({ sql: SUPPORT_DELETE_TEST.BACKDATE_SQL, params: [messageId, SUPPORT_DELETE_TEST.PAST_EDIT_WINDOW] });

    expect((await A.editText({ token: customer, conversationId, messageId: messageId, text: SUPPORT_DELETE_TEST.KEEP_TEXT })).status).toBe(SUPPORT_DELETE_TEST.BAD_REQUEST);
  });

  it('hides a message only for the sender who deleted it for themselves', async () => {
    const messageId = (await SupportTestHelper.send({ token: customer, conversationId, body: SUPPORT_DELETE_TEST.KEEP_TEXT })).body.id;

    expect((await A.remove({ token: customer, conversationId, messageId: messageId, scope: SUPPORT_DELETE_TEST.ME })).status).toBe(SUPPORT_DELETE_TEST.OK);
    expect((await SupportTestHelper.thread({ token: customer, conversationId })).body.some(({ id }) => id === messageId)).toBe(false);
    expect((await SupportTestHelper.thread({ token: staff, conversationId })).body.some(({ id }) => id === messageId)).toBe(true);
  });

  it('refuses to let anyone, staff included, delete a message they did not send', async () => {
    const messageId = (await SupportTestHelper.send({ token: customer, conversationId, body: SUPPORT_DELETE_TEST.KEEP_TEXT })).body.id;

    expect((await A.remove({ token: staff, conversationId, messageId: messageId, scope: SUPPORT_DELETE_TEST.EVERYONE })).status).toBe(SUPPORT_DELETE_TEST.FORBIDDEN);
    expect((await A.remove({ token: staff, conversationId, messageId: messageId, scope: SUPPORT_DELETE_TEST.ME })).status).toBe(SUPPORT_DELETE_TEST.FORBIDDEN);
  });

  it('replaces a message deleted for everyone with an empty tombstone both sides see', async () => {
    const messageId = (await SupportTestHelper.send({ token: customer, conversationId, body: SUPPORT_DELETE_TEST.GONE_TEXT })).body.id;

    expect((await A.remove({ token: customer, conversationId, messageId: messageId, scope: SUPPORT_DELETE_TEST.EVERYONE })).status).toBe(SUPPORT_DELETE_TEST.OK);

    const seen = (await SupportTestHelper.thread({ token: staff, conversationId })).body.find(({ id }) => id === messageId) as (SupportMessage & { deletedAt: string | null }) | undefined;

    expect(seen?.body).toBeNull();
    expect(seen?.deletedAt).toBeTruthy();
  });

  it('stops deleting for everyone after 48 hours', async () => {
    const messageId = (await SupportTestHelper.send({ token: customer, conversationId, body: SUPPORT_DELETE_TEST.OLD_TEXT })).body.id;
    await DbHelper.query({ sql: SUPPORT_DELETE_TEST.BACKDATE_SQL, params: [messageId, SUPPORT_DELETE_TEST.PAST_DELETE_WINDOW] });

    expect((await A.remove({ token: customer, conversationId, messageId: messageId, scope: SUPPORT_DELETE_TEST.EVERYONE })).status).toBe(SUPPORT_DELETE_TEST.BAD_REQUEST);
  });
});
