import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SUPPORT_HISTORY_TEST as T } from '../constants/support-history.constant';
import { ClearedBody, DeletedBody, HistoryRequestDto } from '../interfaces/support-history.interface';
import { SupportSession } from '../interfaces/support-test.interface';

let session: SupportSession = { customer: '', staff: '', conversationId: '' };

const post = <R>({ token, path, body }: HistoryRequestDto): ReturnType<typeof ApiHelper.request<R>> =>
  ApiHelper.request<R>({ method: T.POST, path: `${T.CONVERSATIONS_PATH}${session.conversationId}${path}`, token, body });

const send = async (token: string, body: string): Promise<string> => (await SupportTestHelper.send({ token, conversationId: session.conversationId, body })).body.id;

const bodies = async (token: string): Promise<(string | null)[]> =>
  (await SupportTestHelper.thread({ token, conversationId: session.conversationId })).body.map(message => message.body).filter(body => body !== null);

beforeAll(async () => {
  session = await SupportTestHelper.start({ customerEmail: T.CUSTOMER_EMAIL });
});

afterAll(async () => {
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[T.CUSTOMER_EMAIL]] });
  await DbHelper.close();
});

describe('Support chat history', () => {
  it('clears the chat for me only and can keep starred messages', async () => {
    const { customer, staff, conversationId } = session;
    const keep = await send(customer, T.KEEP);
    await send(customer, T.FIRST);
    await send(staff, T.STAFF_REPLY);
    await ApiHelper.request({ method: T.PUT, path: `${T.CONVERSATIONS_PATH}${conversationId}${T.MESSAGES}${keep}${T.STAR}`, token: customer, body: {} });

    const cleared = await post<ClearedBody>({ token: customer, path: T.CLEAR, body: { keepStarred: true } });

    expect(cleared.status).toBe(T.OK);
    expect(await bodies(customer)).toEqual([T.KEEP]);
    expect(await bodies(staff)).toEqual(expect.arrayContaining([T.KEEP, T.FIRST, T.STAFF_REPLY]));
  });

  it('deletes several messages at once and reports the ones it could not delete', async () => {
    const { customer, staff } = session;
    const ids = [await send(customer, T.MINE_ONE), await send(customer, T.MINE_TWO), await send(staff, T.STAFF_TWO)];

    const everyone = await post<DeletedBody>({ token: customer, path: T.DELETE_MANY, body: { messageIds: ids, scope: T.EVERYONE } });
    expect(everyone.body).toEqual({ deleted: 2, failed: 1 });
    expect(await bodies(staff)).not.toEqual(expect.arrayContaining([T.MINE_ONE]));

    const mineThree = await send(customer, T.MINE_THREE);
    const forMe = await post<DeletedBody>({ token: customer, path: T.DELETE_MANY, body: { messageIds: [mineThree, ids[2]], scope: T.ME } });
    expect(forMe.body).toEqual({ deleted: 2, failed: 0 });
    expect(await bodies(customer)).not.toContain(T.MINE_THREE);
    expect(await bodies(staff)).toContain(T.MINE_THREE);
    expect(await bodies(customer)).not.toContain(T.STAFF_TWO);
    expect(await bodies(staff)).toContain(T.STAFF_TWO);
  });

  it('rejects an empty selection', async () => {
    expect((await post({ token: session.customer, path: T.DELETE_MANY, body: { messageIds: [], scope: T.ME } })).status).toBe(T.BAD_REQUEST);
  });
});
