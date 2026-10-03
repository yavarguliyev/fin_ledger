import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { SseReaderHelper } from '../helpers/sse-reader.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { CALL_RENEGOTIATE_TEST as T } from '../constants/call-renegotiate.constant';
import { SUPPORT_CALLS_TEST as CALLS } from '../constants/support-calls.constant';
import { SUPPORT_CHAT_TEST as CHAT } from '../constants/support-chat.constant';
import { StreamTicketResponse } from '../interfaces/stream-ticket-response.interface';
import { SupportConversation } from '../interfaces/support-chat.interface';

let customer = '';
let stranger = '';
let staff = '';
let callId = '';

const post = (token: string, path: string, body: object): ReturnType<typeof ApiHelper.request> =>
  ApiHelper.request({ method: 'POST', path: `${CALLS.CALLS_PATH}${path}`, token, body });

const openStream = async (token: string): Promise<SseReaderHelper> => {
  const ticket = await ApiHelper.request<StreamTicketResponse>({ method: 'POST', path: CHAT.STREAM_TICKET_PATH, token, body: {} });
  return SseReaderHelper.open({ path: `${CHAT.STREAM_PATH}${ticket.body.ticket}` });
};

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [T.CUSTOMER_EMAIL, T.STRANGER_EMAIL] });
  await DbHelper.query({ sql: CHAT.CLEAN_SQL, params: [[T.CUSTOMER_EMAIL]] });
  customer = await ApiHelper.login({ email: T.CUSTOMER_EMAIL });
  stranger = await ApiHelper.login({ email: T.STRANGER_EMAIL });
  staff = await ApiHelper.login({ email: CHAT.STAFF_EMAIL });

  const [row] = await DbHelper.query<{ id: string }>({ sql: CHAT.USER_ID_SQL, params: [CHAT.STAFF_EMAIL] });
  const opened = await ApiHelper.request<SupportConversation>({ method: 'POST', path: CHAT.CONVERSATIONS_PATH, token: customer, body: { staffUserId: row?.id } });
  const started = await ApiHelper.request<{ callId: string }>({
    method: 'POST',
    path: CALLS.CALLS_PATH,
    token: customer,
    body: { conversationId: opened.body.id, media: CALLS.AUDIO, sdp: CALLS.SDP }
  });
  callId = started.body.callId;
  await post(staff, `/${callId}${T.ANSWER_SUFFIX}`, { sdp: CALLS.SDP });
});

afterAll(async () => {
  await post(customer, `/${callId}${T.END_SUFFIX}`, { reason: CALLS.HANGUP });
  await DbHelper.query({ sql: CHAT.CLEAN_SQL, params: [[T.CUSTOMER_EMAIL]] });
  await DbHelper.close();
});

describe('Restarting a call after a network drop', () => {
  it('relays a restart offer to the other person on the call', async () => {
    const stream = await openStream(staff);

    try {
      const sent = await post(customer, `/${callId}${T.RENEGOTIATE_SUFFIX}`, { sdp: T.RESTART_SDP, sdpType: T.OFFER });
      const event = await stream.waitFor({ type: T.EVENT, timeoutMs: CHAT.STREAM_WAIT_MS });

      expect(sent.status).toBe(CALLS.CREATED);
      expect(event.call).toMatchObject({ callId, sdp: T.RESTART_SDP, sdpType: T.OFFER });
    } finally {
      stream.close();
    }
  });

  it('refuses someone outside the call and an unknown description type', async () => {
    await expect(post(stranger, `/${callId}${T.RENEGOTIATE_SUFFIX}`, { sdp: T.RESTART_SDP, sdpType: T.OFFER })).resolves.toMatchObject({ status: CALLS.NOT_FOUND });
    await expect(post(customer, `/${callId}${T.RENEGOTIATE_SUFFIX}`, { sdp: T.RESTART_SDP, sdpType: T.NOT_A_TYPE })).resolves.toMatchObject({ status: T.BAD_REQUEST });
  });
});
