import { ApiHelper } from '../helpers/api.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_ATTACHMENTS_TEST } from '../constants/support-attachments.constant';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SupportConversation, SupportMessage } from '../interfaces/support-chat.interface';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

let customer = '';

let staff = '';

let conversationId = '';

let messageId = '';

const form = (field: string, files: Array<{ content: Buffer; name: string; type: string }>): FormData => {
  const data = new FormData();
  files.forEach(({ content, name, type }) => data.append(field, new Blob([new Uint8Array(content)], { type }), name));
  return data;
};

const multipart = (method: string, path: string, token: string, body: FormData): Promise<Response> =>
  fetch(`${process.env[TEST_ENV_KEYS.API_URL]}/support/conversations/${conversationId}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'X-Forwarded-For': ApiHelper.randomIp() },
    body
  });

const png = {
  content: Buffer.from(SUPPORT_ATTACHMENTS_TEST.PNG_BYTES),
  name: SUPPORT_ATTACHMENTS_TEST.PNG_NAME,
  type: SUPPORT_ATTACHMENTS_TEST.PNG_TYPE
};

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [SUPPORT_ATTACHMENTS_TEST.CUSTOMER_EMAIL] });
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[SUPPORT_ATTACHMENTS_TEST.CUSTOMER_EMAIL]] });

  customer = await ApiHelper.login({ email: SUPPORT_ATTACHMENTS_TEST.CUSTOMER_EMAIL });
  staff = await ApiHelper.login({ email: SUPPORT_CHAT_TEST.STAFF_EMAIL });

  const [row] = await DbHelper.query<{ id: string }>({ sql: SUPPORT_CHAT_TEST.USER_ID_SQL, params: [SUPPORT_CHAT_TEST.STAFF_EMAIL] });
  const opened = await ApiHelper.request<SupportConversation>({
    method: 'POST',
    path: SUPPORT_CHAT_TEST.CONVERSATIONS_PATH,
    token: customer,
    body: { staffUserId: row?.id }
  });
  conversationId = opened.body.id;

  const sent = await ApiHelper.request<SupportMessage>({
    method: 'POST',
    path: `${SUPPORT_CHAT_TEST.CONVERSATIONS_PATH}/${conversationId}/messages`,
    token: customer,
    body: { body: SUPPORT_ATTACHMENTS_TEST.ORIGINAL_TEXT }
  });
  messageId = sent.body.id;
});

afterAll(async () => {
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[SUPPORT_ATTACHMENTS_TEST.CUSTOMER_EMAIL]] });
  await DbHelper.close();
});

describe('Support attachment limits', () => {
  it('refuses more than five files in one send', async () => {
    const files = Array.from({ length: SUPPORT_ATTACHMENTS_TEST.MAX_FILES + 1 }, () => png);

    expect((await multipart('POST', '/attachments', customer, form(SUPPORT_ATTACHMENTS_TEST.FIELD_NAME, files))).status).toBe(
      SUPPORT_ATTACHMENTS_TEST.BAD_REQUEST
    );
  });

  it('refuses a file over the size limit', async () => {
    const big = { ...png, content: Buffer.alloc(SUPPORT_ATTACHMENTS_TEST.MAX_FILE_SIZE_BYTES + 1) };

    expect((await multipart('POST', '/attachments', customer, form(SUPPORT_ATTACHMENTS_TEST.FIELD_NAME, [big]))).status).toBe(
      SUPPORT_ATTACHMENTS_TEST.PAYLOAD_TOO_LARGE
    );
  });

  it('refuses a file type that is not allowed, and a text file pretending to be a picture', async () => {
    const exe = {
      content: Buffer.from(SUPPORT_ATTACHMENTS_TEST.FAKE_TEXT),
      name: SUPPORT_ATTACHMENTS_TEST.EXE_NAME,
      type: SUPPORT_ATTACHMENTS_TEST.EXE_TYPE
    };
    const fake = { ...png, content: Buffer.from(SUPPORT_ATTACHMENTS_TEST.FAKE_TEXT) };

    expect((await multipart('POST', '/attachments', customer, form(SUPPORT_ATTACHMENTS_TEST.FIELD_NAME, [exe]))).status).toBe(
      SUPPORT_ATTACHMENTS_TEST.UNSUPPORTED
    );
    expect((await multipart('POST', '/attachments', customer, form(SUPPORT_ATTACHMENTS_TEST.FIELD_NAME, [fake]))).status).toBe(
      SUPPORT_ATTACHMENTS_TEST.UNSUPPORTED
    );
  });
});

describe('Support message edits', () => {
  it('lets the sender edit their message and marks it as edited', async () => {
    const data = new FormData();
    data.append('body', SUPPORT_ATTACHMENTS_TEST.EDITED_TEXT);

    const response = await multipart('PATCH', `/messages/${messageId}`, customer, data);
    const edited = (await response.json()) as SupportMessage & { editedAt: string | null };

    expect(response.status).toBe(SUPPORT_ATTACHMENTS_TEST.OK);
    expect(edited.body).toBe(SUPPORT_ATTACHMENTS_TEST.EDITED_TEXT);
    expect(edited.editedAt).toBeTruthy();
  });

  it('refuses to let anyone else edit the message', async () => {
    const data = new FormData();
    data.append('body', SUPPORT_ATTACHMENTS_TEST.FAKE_TEXT);

    expect((await multipart('PATCH', `/messages/${messageId}`, staff, data)).status).toBe(SUPPORT_ATTACHMENTS_TEST.FORBIDDEN);
  });

  it('refuses an edit that changes nothing', async () => {
    expect((await multipart('PATCH', `/messages/${messageId}`, customer, new FormData())).status).toBe(SUPPORT_ATTACHMENTS_TEST.BAD_REQUEST);
  });
});
