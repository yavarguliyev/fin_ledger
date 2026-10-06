import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { SupportActionsTestHelper as A } from '../helpers/support-actions.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SUPPORT_STAR_TEST as T } from '../constants/support-star.constant';
import { StarredMessage, SupportSession, SupportStarDto, SupportThreadDto } from '../interfaces/support-test.interface';

let session: SupportSession = { customer: '', staff: '', conversationId: '' };

const star = ({ token, conversationId, messageId, method }: SupportStarDto): ReturnType<typeof ApiHelper.request<StarredMessage[]>> =>
  ApiHelper.request<StarredMessage[]>({ method, path: `${T.CONVERSATIONS_PATH}${conversationId}${T.MESSAGES}${messageId}${T.STAR}`, token, body: {} });

const starred = ({ token, conversationId }: SupportThreadDto): ReturnType<typeof ApiHelper.request<StarredMessage[]>> =>
  ApiHelper.request<StarredMessage[]>({ path: `${T.CONVERSATIONS_PATH}${conversationId}${T.STARRED}`, token });

beforeAll(async () => {
  session = await SupportTestHelper.start({ customerEmail: T.CUSTOMER_EMAIL, otherEmails: [T.OUTSIDER_EMAIL] });
});

afterAll(async () => {
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[T.CUSTOMER_EMAIL, T.OUTSIDER_EMAIL]] });
  await DbHelper.close();
});

describe('Starred support messages', () => {
  it('keeps stars private to the user who set them, and unstars on request', async () => {
    const { customer, staff, conversationId } = session;
    const messageId = (await SupportTestHelper.send({ token: customer, conversationId, body: T.KEEP_TEXT })).body.id;

    const afterStar = await star({ token: customer, conversationId, messageId, method: T.PUT });
    expect(afterStar.status).toBe(T.OK);
    expect(afterStar.body.map(row => row.body)).toEqual([T.KEEP_TEXT]);
    expect((await starred({ token: staff, conversationId })).body).toEqual([]);
    const everywhere = await ApiHelper.request<StarredMessage[]>({ path: T.ALL_STARRED_PATH, token: customer });
    expect(everywhere.body.map(row => row.messageId)).toContain(messageId);

    expect((await star({ token: customer, conversationId, messageId, method: T.DELETE })).body).toEqual([]);
  });

  it('refuses a deleted message and hides the conversation from outsiders', async () => {
    const { customer, conversationId } = session;
    const messageId = (await SupportTestHelper.send({ token: customer, conversationId, body: T.GONE_TEXT })).body.id;
    await A.remove({ token: customer, conversationId, messageId, scope: T.EVERYONE });

    expect((await star({ token: customer, conversationId, messageId, method: T.PUT })).status).toBe(T.BAD_REQUEST);

    const outsider = await ApiHelper.login({ email: T.OUTSIDER_EMAIL });
    expect((await starred({ token: outsider, conversationId })).status).toBe(T.NOT_FOUND);
  });
});
