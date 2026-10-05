import { ApiHelper } from '../helpers/api.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CHAT_TEST as C } from '../constants/support-chat.constant';
import { SUPPORT_RECORDINGS_TEST as R } from '../constants/support-recordings.constant';
import { RecordingDto, RecordingIdRow } from '../interfaces/support-recordings.interface';

let customer = '';

let conversationId = '';

const recording = ({ content, durationSeconds }: RecordingDto): FormData => {
  const form = new FormData();
  form.append(R.DURATION_FIELD, durationSeconds);
  form.append(
    R.FILES_FIELD,
    new Blob([content], { type: R.AUDIO_TYPE }),
    R.AUDIO_NAME
  );
  return form;
};

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [R.CUSTOMER_EMAIL] });
  await DbHelper.query({ sql: C.CLEAN_SQL, params: [[R.CUSTOMER_EMAIL]] });
  customer = await ApiHelper.login({ email: R.CUSTOMER_EMAIL });

  const staffUserId = await SupportTestHelper.userId({ email: C.STAFF_EMAIL });
  const opened = await SupportTestHelper.open({ token: customer, staffUserId });
  conversationId = opened.body.id;
});

afterAll(async () => {
  await DbHelper.query({ sql: C.CLEAN_SQL, params: [[R.CUSTOMER_EMAIL]] });
  await DbHelper.close();
});

describe('Support voice and video messages', () => {
  it('refuses a voice note whose bytes are not really audio, even with codec details in the type', async () => {
    expect((await SupportTestHelper.multipart({ method: 'POST', conversationId, path: R.ATTACHMENTS_PATH, token: customer, form: recording({ content: R.FAKE_AUDIO, durationSeconds: R.SHORT_SECONDS }) })).status).toBe(R.UNSUPPORTED);
  });

  it('refuses a recording longer than the limit', async () => {
    expect((await SupportTestHelper.multipart({ method: 'POST', conversationId, path: R.ATTACHMENTS_PATH, token: customer, form: recording({ content: R.FAKE_AUDIO, durationSeconds: R.TOO_LONG_SECONDS }) })).status).toBe(
      R.BAD_REQUEST
    );
  });

  it('does not allow editing a voice note, like WhatsApp', async () => {
    const [row] = await DbHelper.query<RecordingIdRow>({
      sql: R.VOICE_ROW_SQL,
      params: [conversationId, R.CUSTOMER_EMAIL]
    });
    const form = new FormData();
    form.append(R.BODY_FIELD, R.NEW_TEXT);

    expect((await SupportTestHelper.multipart({ method: 'PATCH', conversationId, path: R.MESSAGE_PATH(row?.id as string), token: customer, form })).status).toBe(R.BAD_REQUEST);
  });
});
