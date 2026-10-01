import { ApiHelper } from '../helpers/api.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SUPPORT_RECORDINGS_TEST } from '../constants/support-recordings.constant';
import { SupportConversation } from '../interfaces/support-chat.interface';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

describe('Support voice and video messages', () => {
  let customer = '';
  let conversationId = '';

  const call = (method: string, path: string, body: FormData): Promise<Response> =>
    fetch(`${process.env[TEST_ENV_KEYS.API_URL]}${SUPPORT_CHAT_TEST.CONVERSATIONS_PATH}/${conversationId}${path}`, {
      method,
      headers: { Authorization: `Bearer ${customer}`, 'X-Forwarded-For': ApiHelper.randomIp() },
      body
    });

  const recording = (content: string, durationSeconds: string): FormData => {
    const form = new FormData();
    form.append(SUPPORT_RECORDINGS_TEST.DURATION_FIELD, durationSeconds);
    form.append(SUPPORT_RECORDINGS_TEST.FILES_FIELD, new Blob([content], { type: SUPPORT_RECORDINGS_TEST.AUDIO_TYPE }), SUPPORT_RECORDINGS_TEST.AUDIO_NAME);
    return form;
  };

  beforeAll(async () => {
    await TestUserHelper.ensure({ emails: [SUPPORT_RECORDINGS_TEST.CUSTOMER_EMAIL] });
    await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[SUPPORT_RECORDINGS_TEST.CUSTOMER_EMAIL]] });
    customer = await ApiHelper.login({ email: SUPPORT_RECORDINGS_TEST.CUSTOMER_EMAIL });

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
    await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[SUPPORT_RECORDINGS_TEST.CUSTOMER_EMAIL]] });
    await DbHelper.close();
  });

  it('refuses a voice note whose bytes are not really audio, even with codec details in the type', async () => {
    expect((await call('POST', '/attachments', recording(SUPPORT_RECORDINGS_TEST.FAKE_AUDIO, '3'))).status).toBe(SUPPORT_RECORDINGS_TEST.UNSUPPORTED);
  });

  it('refuses a recording longer than the limit', async () => {
    expect((await call('POST', '/attachments', recording(SUPPORT_RECORDINGS_TEST.FAKE_AUDIO, SUPPORT_RECORDINGS_TEST.TOO_LONG_SECONDS))).status).toBe(
      SUPPORT_RECORDINGS_TEST.BAD_REQUEST
    );
  });

  it('does not allow editing a voice note, like WhatsApp', async () => {
    const [row] = await DbHelper.query<{ id: string }>({
      sql: SUPPORT_RECORDINGS_TEST.VOICE_ROW_SQL,
      params: [conversationId, SUPPORT_RECORDINGS_TEST.CUSTOMER_EMAIL]
    });
    const form = new FormData();
    form.append('body', SUPPORT_RECORDINGS_TEST.NEW_TEXT);

    expect((await call('PATCH', `/messages/${row?.id}`, form)).status).toBe(SUPPORT_RECORDINGS_TEST.BAD_REQUEST);
  });
});
