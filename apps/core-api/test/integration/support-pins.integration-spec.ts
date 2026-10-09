import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SUPPORT_PINS_TEST as T } from '../constants/support-pins.constant';
import { PinnedMessage, PinRequestDto } from '../interfaces/support-pins.interface';
import { SupportSession } from '../interfaces/support-test.interface';

let session: SupportSession = { customer: '', staff: '', conversationId: '' };
let ids: string[] = [];

const pin = ({ token, messageId, method, duration = T.DAY }: PinRequestDto): ReturnType<typeof ApiHelper.request<PinnedMessage[]>> =>
  ApiHelper.request<PinnedMessage[]>({ method, path: `${T.CONVERSATIONS_PATH}${session.conversationId}${T.MESSAGES}${messageId}${T.PIN}`, token, body: { duration } });

const pins = async (token: string): Promise<(string | null)[]> =>
  (await ApiHelper.request<PinnedMessage[]>({ path: `${T.CONVERSATIONS_PATH}${session.conversationId}${T.PINS}`, token })).body.map(message => message.body);

beforeAll(async () => {
  session = await SupportTestHelper.start({ customerEmail: T.CUSTOMER_EMAIL, otherEmails: [T.OUTSIDER_EMAIL] });
  for (const body of T.TEXTS) ids.push((await SupportTestHelper.send({ token: session.customer, conversationId: session.conversationId, body })).body.id);
});

afterAll(async () => {
  ids = [];
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[T.CUSTOMER_EMAIL, T.OUTSIDER_EMAIL]] });
  await DbHelper.close();
});

describe('Support pinned messages', () => {
  it('lets either side pin, shows the pins to both, and posts a notice in the chat', async () => {
    const [first = '', second = ''] = ids;
    expect((await pin({ token: session.customer, messageId: first, method: T.PUT })).status).toBe(T.OK);
    await pin({ token: session.staff, messageId: second, method: T.PUT });

    expect(await pins(session.customer)).toEqual([T.TEXTS[1], T.TEXTS[0]]);
    expect(await pins(session.staff)).toEqual([T.TEXTS[1], T.TEXTS[0]]);
    const thread = (await SupportTestHelper.thread({ token: session.staff, conversationId: session.conversationId })).body;
    expect(thread.filter(message => message.body === T.NOTICE)).toHaveLength(2);
  });

  it('keeps at most three pins by dropping the oldest', async () => {
    for (const messageId of ids.slice(2)) await pin({ token: session.customer, messageId, method: T.PUT });

    expect(await pins(session.customer)).toEqual([T.TEXTS[3], T.TEXTS[2], T.TEXTS[1]]);
  });

  it('unpins for both sides', async () => {
    await pin({ token: session.staff, messageId: ids[3] ?? '', method: T.DELETE });

    expect(await pins(session.customer)).toEqual([T.TEXTS[2], T.TEXTS[1]]);
  });

  it('rejects an unknown duration, a system notice and someone outside the chat', async () => {
    expect((await pin({ token: session.customer, messageId: ids[0] ?? '', method: T.PUT, duration: T.FOREVER })).status).toBe(T.BAD_REQUEST);

    const thread = (await SupportTestHelper.thread({ token: session.customer, conversationId: session.conversationId })).body;
    const notice = thread.find(message => message.body === T.NOTICE)?.id ?? '';
    expect((await pin({ token: session.customer, messageId: notice, method: T.PUT })).status).toBe(T.NOT_FOUND);

    const outsider = await ApiHelper.login({ email: T.OUTSIDER_EMAIL });
    expect((await pin({ token: outsider, messageId: ids[0] ?? '', method: T.PUT })).status).toBe(T.NOT_FOUND);
  });
});
