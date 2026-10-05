import { SupportActionsTestHelper as A } from '../helpers/support-actions.helper';
import { ApiHelper } from '../helpers/api.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CHAT_TEST as C } from '../constants/support-chat.constant';
import { SUPPORT_REACTION_TEST as T } from '../constants/support-reaction.constant';

let customer = '';

let staff = '';

let outsider = '';

let customerId = '';

let path = '';

beforeAll(async () => {
  const session = await SupportTestHelper.start({ customerEmail: C.CUSTOMER_EMAIL, otherEmails: [C.OTHER_EMAIL] });
  const { conversationId } = session;

  ({ customer, staff } = session);
  outsider = await ApiHelper.login({ email: C.OTHER_EMAIL });
  customerId = await SupportTestHelper.userId({ email: C.CUSTOMER_EMAIL });

  const sent = await SupportTestHelper.send({ token: staff, conversationId, body: T.TEXT });
  path = `${SupportTestHelper.messagesPath({ conversationId })}/${sent.body.id}${T.REACTION_SUFFIX}`;
});

afterAll(async () => {
  await DbHelper.query({ sql: C.CLEAN_SQL, params: [[C.CUSTOMER_EMAIL, C.OTHER_EMAIL]] });
  await DbHelper.close();
});

describe('Reacting to a message', () => {
  it('keeps one reaction per person, replacing it when they pick another', async () => {
    await A.react({ token: customer, path, emoji: T.THUMBS });
    const changed = await A.react({ token: customer, path, emoji: T.HEART });

    expect(changed.status).toBe(C.OK);
    expect(changed.body).toEqual([{ emoji: T.HEART, userId: customerId }]);
  });

  it('shows everyone’s reactions and removes only mine', async () => {
    const both = await A.react({ token: staff, path, emoji: T.THUMBS });
    const afterRemove = await A.react({ token: customer, path });

    expect(both.body.map(reaction => reaction.emoji)).toEqual([T.HEART, T.THUMBS]);
    expect(afterRemove.body.map(reaction => reaction.emoji)).toEqual([T.THUMBS]);
  });

  it('accepts any single emoji, flags included', async () => {
    await expect(A.react({ token: customer, path, emoji: T.ANY_EMOJI })).resolves.toMatchObject({ status: C.OK });
    await expect(A.react({ token: customer, path, emoji: T.FLAG })).resolves.toMatchObject({ status: C.OK });
  });

  it('refuses text, more than one emoji, and anyone outside the conversation', async () => {
    await expect(A.react({ token: customer, path, emoji: T.PLAIN_TEXT })).resolves.toMatchObject({ status: T.BAD_REQUEST });
    await expect(A.react({ token: customer, path, emoji: T.TWO_EMOJIS })).resolves.toMatchObject({ status: T.BAD_REQUEST });
    await expect(A.react({ token: outsider, path, emoji: T.THUMBS })).resolves.toMatchObject({ status: C.NOT_FOUND });
  });
});
