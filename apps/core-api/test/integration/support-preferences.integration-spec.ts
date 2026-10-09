import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SUPPORT_PREFERENCES_TEST as T } from '../constants/support-preferences.constant';
import { ChatPreferences, ListedConversation, PreferenceRequestDto, SeededConversation } from '../interfaces/support-preferences.interface';
import { SupportSession } from '../interfaces/support-test.interface';

let session: SupportSession = { customer: '', staff: '', conversationId: '' };
let outsider = '';

const put = ({ token, path, body, conversationId = session.conversationId }: PreferenceRequestDto): ReturnType<typeof ApiHelper.request<ChatPreferences>> =>
  ApiHelper.request<ChatPreferences>({ method: T.PUT, path: `${T.CONVERSATIONS_PATH}${conversationId}${path}`, token, body });

const listed = async (): Promise<ChatPreferences | undefined> => {
  const conversations = (await SupportTestHelper.list({ token: session.customer })).body as unknown as ListedConversation[];
  return conversations.find(item => item.id === session.conversationId);
};

beforeAll(async () => {
  session = await SupportTestHelper.start({ customerEmail: T.CUSTOMER_EMAIL, otherEmails: [T.OUTSIDER_EMAIL] });
  outsider = await ApiHelper.login({ email: T.OUTSIDER_EMAIL });
});

afterAll(async () => {
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[T.CUSTOMER_EMAIL, T.OUTSIDER_EMAIL]] });
  await DbHelper.close();
});

describe('Support chat preferences', () => {
  it('mutes for eight hours, for always, and unmutes, and the chat list follows', async () => {
    const timed = await put({ token: session.customer, path: T.MUTE, body: { duration: T.EIGHT_HOURS } });
    expect(timed.body.muted).toBe(true);
    expect(Math.abs(Date.parse(timed.body.mutedUntil ?? '') - Date.now() - T.EIGHT_HOURS_MS)).toBeLessThan(T.TOLERANCE_MS);

    const always = await put({ token: session.customer, path: T.MUTE, body: { duration: T.ALWAYS } });
    expect(always.body).toMatchObject({ muted: true, mutedUntil: null });
    expect((await listed())?.muted).toBe(true);

    expect((await put({ token: session.customer, path: T.MUTE, body: { duration: T.OFF } })).body.muted).toBe(false);
    expect((await listed())?.muted).toBe(false);
  });

  it('keeps preferences per person, so the staff side is untouched', async () => {
    await put({ token: session.customer, path: T.FAVOURITE, body: { favourite: true } });
    const staffView = (await SupportTestHelper.list({ token: session.staff })).body as unknown as ListedConversation[];

    expect((await listed())?.favourite).toBe(true);
    expect(staffView.find(item => item.id === session.conversationId)?.favourite).toBe(false);
  });

  it('shares the chat theme with both people, posts a notice and rejects an unknown theme', async () => {
    expect((await put({ token: session.customer, path: T.THEME, body: { theme: T.OCEAN } })).body.theme).toBe(T.OCEAN);
    expect((await put({ token: session.customer, path: T.THEME, body: { theme: T.UNKNOWN_THEME } })).status).toBe(T.BAD_REQUEST);

    const staffView = (await SupportTestHelper.list({ token: session.staff })).body as unknown as ListedConversation[];
    expect((await listed())?.theme).toBe(T.OCEAN);
    expect(staffView.find(item => item.id === session.conversationId)?.theme).toBe(T.OCEAN);
    const thread = (await SupportTestHelper.thread({ token: session.staff, conversationId: session.conversationId })).body;
    expect(thread.some(message => message.body === T.THEME_NOTICE)).toBe(true);
  });

  it('pins at most three chats', async () => {
    const seeded = await DbHelper.query<SeededConversation>({ sql: T.SEED_PINNED_SQL, params: [T.CUSTOMER_EMAIL, T.SEED_PINS] });
    expect((await put({ token: session.customer, path: T.PIN, body: { pinned: true } })).status).toBe(T.CONFLICT);

    const [first] = seeded;
    await put({ token: session.customer, path: T.PIN, body: { pinned: false }, conversationId: first?.conversationId ?? '' });
    const pinned = await put({ token: session.customer, path: T.PIN, body: { pinned: true } });
    expect(pinned.status).toBe(T.OK);
    expect(pinned.body.pinnedAt).not.toBeNull();
  });

  it('refuses someone outside the conversation', async () => {
    expect((await put({ token: outsider, path: T.FAVOURITE, body: { favourite: true } })).status).toBe(T.NOT_FOUND);
  });
});
