import { ApiHelper } from '../helpers/api.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CALLS_TEST } from '../constants/support-calls.constant';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SupportConversation, SupportMessage } from '../interfaces/support-chat.interface';

let customer = '';

let stranger = '';

let staff = '';

let conversationId = '';

const post = <T>(token: string, path: string, body: object): ReturnType<typeof ApiHelper.request<T>> =>
  ApiHelper.request<T>({ method: 'POST', path: `${SUPPORT_CALLS_TEST.CALLS_PATH}${path}`, token, body });

const start = (media: string): ReturnType<typeof ApiHelper.request<{ callId: string }>> =>
  post<{ callId: string }>(customer, '', { conversationId, media, sdp: SUPPORT_CALLS_TEST.SDP });

const lastLog = async (): Promise<SupportMessage | undefined> => {
  const thread = await ApiHelper.request<SupportMessage[]>({
    path: `${SUPPORT_CHAT_TEST.CONVERSATIONS_PATH}/${conversationId}/messages`,
    token: customer
  });
  return thread.body.filter(({ kind }) => kind === SUPPORT_CALLS_TEST.SYSTEM_KIND).pop();
};

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [SUPPORT_CALLS_TEST.CUSTOMER_EMAIL, SUPPORT_CALLS_TEST.STRANGER_EMAIL] });
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[SUPPORT_CALLS_TEST.CUSTOMER_EMAIL]] });
  customer = await ApiHelper.login({ email: SUPPORT_CALLS_TEST.CUSTOMER_EMAIL });
  stranger = await ApiHelper.login({ email: SUPPORT_CALLS_TEST.STRANGER_EMAIL });
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
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[SUPPORT_CALLS_TEST.CUSTOMER_EMAIL]] });
  await DbHelper.close();
});

describe('Support calls', () => {
  it('hands the browser its connection servers', async () => {
    const config = await ApiHelper.request<{ iceServers: unknown[] }>({ path: SUPPORT_CALLS_TEST.CONFIG_PATH, token: customer });

    expect(config.status).toBe(SUPPORT_CALLS_TEST.OK);
    expect(Array.isArray(config.body.iceServers)).toBe(true);
  });

  it('rings the other person, refuses a second call while one is live, and only lets the callee answer', async () => {
    const call = await start(SUPPORT_CALLS_TEST.AUDIO);
    const { callId } = call.body;

    expect(call.status).toBe(SUPPORT_CALLS_TEST.CREATED);
    expect((await start(SUPPORT_CALLS_TEST.AUDIO)).status).toBe(SUPPORT_CALLS_TEST.CONFLICT);
    expect((await post(customer, `/${callId}/answer`, { sdp: SUPPORT_CALLS_TEST.SDP })).status).toBe(SUPPORT_CALLS_TEST.FORBIDDEN);
    expect((await post(staff, `/${callId}/answer`, { sdp: SUPPORT_CALLS_TEST.SDP })).status).toBe(SUPPORT_CALLS_TEST.CREATED);
    expect((await post(staff, `/${callId}/candidates`, { candidate: SUPPORT_CALLS_TEST.CANDIDATE })).status).toBe(SUPPORT_CALLS_TEST.CREATED);
    expect((await post(stranger, `/${callId}/candidates`, { candidate: SUPPORT_CALLS_TEST.CANDIDATE })).status).toBe(SUPPORT_CALLS_TEST.NOT_FOUND);

    expect((await post(staff, `/${callId}/end`, { reason: SUPPORT_CALLS_TEST.HANGUP })).status).toBe(SUPPORT_CALLS_TEST.CREATED);
    expect((await lastLog())?.body).toContain(SUPPORT_CALLS_TEST.VOICE_LOG_PREFIX);
    expect((await post(staff, `/${callId}/end`, { reason: SUPPORT_CALLS_TEST.HANGUP })).status).toBe(SUPPORT_CALLS_TEST.NOT_FOUND);
  });

  it('logs an unanswered call as missed', async () => {
    const { callId } = (await start(SUPPORT_CALLS_TEST.VIDEO)).body;

    await post(customer, `/${callId}/end`, { reason: SUPPORT_CALLS_TEST.MISSED });

    expect((await lastLog())?.body).toBe(SUPPORT_CALLS_TEST.MISSED_VIDEO_LOG);
  });
});
