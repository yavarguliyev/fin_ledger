import { ApiHelper } from '../helpers/api.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SUPPORT_RECORDINGS_TEST } from '../constants/support-recordings.constant';

let customer = '';

let conversationId = '';

const recording = (content: string, durationSeconds: string): FormData => {
  const form = new FormData();
  form.append(SUPPORT_RECORDINGS_TEST.DURATION_FIELD, durationSeconds);
  form.append(
    SUPPORT_RECORDINGS_TEST.FILES_FIELD,
    new Blob([content], { type: SUPPORT_RECORDINGS_TEST.AUDIO_TYPE }),
    SUPPORT_RECORDINGS_TEST.AUDIO_NAME
  );
  return form;
};

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [SUPPORT_RECORDINGS_TEST.CUSTOMER_EMAIL] });
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[SUPPORT_RECORDINGS_TEST.CUSTOMER_EMAIL]] });
  customer = await ApiHelper.login({ email: SUPPORT_RECORDINGS_TEST.CUSTOMER_EMAIL });

  const staffUserId = await SupportTestHelper.userId({ email: SUPPORT_CHAT_TEST.STAFF_EMAIL });
  const opened = await SupportTestHelper.open({ token: customer, staffUserId });
  conversationId = opened.body.id;
});

afterAll(async () => {
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[SUPPORT_RECORDINGS_TEST.CUSTOMER_EMAIL]] });
  await DbHelper.close();
});

describe('Support voice and video messages', () => {
  it('refuses a voice note whose bytes are not really audio, even with codec details in the type', async () => {
    expect((await SupportTestHelper.multipart({ method: 'POST', conversationId, path: '/attachments', token: customer, form: recording(SUPPORT_RECORDINGS_TEST.FAKE_AUDIO, '3') })).status).toBe(SUPPORT_RECORDINGS_TEST.UNSUPPORTED);
  });

  it('refuses a recording longer than the limit', async () => {
    expect((await SupportTestHelper.multipart({ method: 'POST', conversationId, path: '/attachments', token: customer, form: recording(SUPPORT_RECORDINGS_TEST.FAKE_AUDIO, SUPPORT_RECORDINGS_TEST.TOO_LONG_SECONDS) })).status).toBe(
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

    expect((await SupportTestHelper.multipart({ method: 'PATCH', conversationId, path: `/messages/${row?.id}`, token: customer, form: form })).status).toBe(SUPPORT_RECORDINGS_TEST.BAD_REQUEST);
  });
});
