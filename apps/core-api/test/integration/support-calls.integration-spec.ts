import { ApiHelper } from '../helpers/api.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CALLS_TEST } from '../constants/support-calls.constant';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SupportMessage } from '../interfaces/support-chat.interface';
import { CallAction, CallPost, CallStart, CallStarted } from '../interfaces/support-calls.interface';

let customer: string = SUPPORT_CALLS_TEST.EMPTY;

let stranger: string = SUPPORT_CALLS_TEST.EMPTY;

let staff: string = SUPPORT_CALLS_TEST.EMPTY;

let conversationId: string = SUPPORT_CALLS_TEST.EMPTY;

const callPath = ({ callId, action }: CallAction): string => `${SUPPORT_CALLS_TEST.SEGMENT}${callId}${action}`;

const post = <T>({ token, path, body }: CallPost): ReturnType<typeof ApiHelper.request<T>> =>
  ApiHelper.request<T>({ method: SUPPORT_CALLS_TEST.POST, path: `${SUPPORT_CALLS_TEST.CALLS_PATH}${path}`, token, body });

const start = ({ media }: CallStart): ReturnType<typeof ApiHelper.request<CallStarted>> =>
  post<CallStarted>({ token: customer, path: SUPPORT_CALLS_TEST.EMPTY, body: { conversationId, media, sdp: SUPPORT_CALLS_TEST.SDP } });

const lastLog = async (): Promise<SupportMessage | undefined> => {
  const thread = await SupportTestHelper.thread({ token: customer, conversationId });
  return thread.body.filter(({ kind }) => kind === SUPPORT_CALLS_TEST.SYSTEM_KIND).pop();
};

beforeAll(async () => {
  ({ customer, staff, conversationId } = await SupportTestHelper.start({
    customerEmail: SUPPORT_CALLS_TEST.CUSTOMER_EMAIL,
    otherEmails: [SUPPORT_CALLS_TEST.STRANGER_EMAIL]
  }));
  stranger = await ApiHelper.login({ email: SUPPORT_CALLS_TEST.STRANGER_EMAIL });
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
    const call = await start({ media: SUPPORT_CALLS_TEST.AUDIO });
    const { callId } = call.body;

    expect(call.status).toBe(SUPPORT_CALLS_TEST.CREATED);
    expect((await start({ media: SUPPORT_CALLS_TEST.AUDIO })).status).toBe(SUPPORT_CALLS_TEST.CONFLICT);
    expect((await post({ token: customer, path: callPath({ callId, action: SUPPORT_CALLS_TEST.ANSWER }), body: { sdp: SUPPORT_CALLS_TEST.SDP } })).status).toBe(SUPPORT_CALLS_TEST.FORBIDDEN);
    expect((await post({ token: staff, path: callPath({ callId, action: SUPPORT_CALLS_TEST.ANSWER }), body: { sdp: SUPPORT_CALLS_TEST.SDP } })).status).toBe(SUPPORT_CALLS_TEST.CREATED);
    expect((await post({ token: staff, path: callPath({ callId, action: SUPPORT_CALLS_TEST.CANDIDATES }), body: { candidate: SUPPORT_CALLS_TEST.CANDIDATE } })).status).toBe(SUPPORT_CALLS_TEST.CREATED);
    expect((await post({ token: stranger, path: callPath({ callId, action: SUPPORT_CALLS_TEST.CANDIDATES }), body: { candidate: SUPPORT_CALLS_TEST.CANDIDATE } })).status).toBe(SUPPORT_CALLS_TEST.NOT_FOUND);

    expect((await post({ token: staff, path: callPath({ callId, action: SUPPORT_CALLS_TEST.END }), body: { reason: SUPPORT_CALLS_TEST.HANGUP } })).status).toBe(SUPPORT_CALLS_TEST.CREATED);
    expect((await lastLog())?.body).toContain(SUPPORT_CALLS_TEST.VOICE_LOG_PREFIX);
    expect((await post({ token: staff, path: callPath({ callId, action: SUPPORT_CALLS_TEST.END }), body: { reason: SUPPORT_CALLS_TEST.HANGUP } })).status).toBe(SUPPORT_CALLS_TEST.NOT_FOUND);
  });

  it('logs an unanswered call as missed', async () => {
    const { callId } = (await start({ media: SUPPORT_CALLS_TEST.VIDEO })).body;

    await post({ token: customer, path: callPath({ callId, action: SUPPORT_CALLS_TEST.END }), body: { reason: SUPPORT_CALLS_TEST.MISSED } });

    expect((await lastLog())?.body).toBe(SUPPORT_CALLS_TEST.MISSED_VIDEO_LOG);
  });
});
