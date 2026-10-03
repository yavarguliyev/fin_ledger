import { ApiHelper } from '../helpers/api.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_ATTACHMENTS_TEST } from '../constants/support-attachments.constant';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SupportMessage } from '../interfaces/support-chat.interface';

let customer = '';

let staff = '';

let conversationId = '';

let messageId = '';

const form = (field: string, files: Array<{ content: Buffer; name: string; type: string }>): FormData => {
  const data = new FormData();
  files.forEach(({ content, name, type }) => data.append(field, new Blob([new Uint8Array(content)], { type }), name));
  return data;
};

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

  const staffUserId = await SupportTestHelper.userId({ email: SUPPORT_CHAT_TEST.STAFF_EMAIL });
  const opened = await SupportTestHelper.open({ token: customer, staffUserId });
  conversationId = opened.body.id;

  const sent = await SupportTestHelper.send({ token: customer, conversationId, body: SUPPORT_ATTACHMENTS_TEST.ORIGINAL_TEXT });
  messageId = sent.body.id;
});

afterAll(async () => {
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[SUPPORT_ATTACHMENTS_TEST.CUSTOMER_EMAIL]] });
  await DbHelper.close();
});

describe('Support attachment limits', () => {
  it('refuses more than five files in one send', async () => {
    const files = Array.from({ length: SUPPORT_ATTACHMENTS_TEST.MAX_FILES + 1 }, () => png);

    expect((await SupportTestHelper.multipart({ method: 'POST', conversationId, path: '/attachments', token: customer, form: form(SUPPORT_ATTACHMENTS_TEST.FIELD_NAME, files) })).status).toBe(
      SUPPORT_ATTACHMENTS_TEST.BAD_REQUEST
    );
  });

  it('refuses a file over the size limit', async () => {
    const big = { ...png, content: Buffer.alloc(SUPPORT_ATTACHMENTS_TEST.MAX_FILE_SIZE_BYTES + 1) };

    expect((await SupportTestHelper.multipart({ method: 'POST', conversationId, path: '/attachments', token: customer, form: form(SUPPORT_ATTACHMENTS_TEST.FIELD_NAME, [big]) })).status).toBe(
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

    expect((await SupportTestHelper.multipart({ method: 'POST', conversationId, path: '/attachments', token: customer, form: form(SUPPORT_ATTACHMENTS_TEST.FIELD_NAME, [exe]) })).status).toBe(
      SUPPORT_ATTACHMENTS_TEST.UNSUPPORTED
    );
    expect((await SupportTestHelper.multipart({ method: 'POST', conversationId, path: '/attachments', token: customer, form: form(SUPPORT_ATTACHMENTS_TEST.FIELD_NAME, [fake]) })).status).toBe(
      SUPPORT_ATTACHMENTS_TEST.UNSUPPORTED
    );
  });
});

describe('Support message edits', () => {
  it('lets the sender edit their message and marks it as edited', async () => {
    const data = new FormData();
    data.append('body', SUPPORT_ATTACHMENTS_TEST.EDITED_TEXT);

    const response = await SupportTestHelper.multipart({ method: 'PATCH', conversationId, path: `/messages/${messageId}`, token: customer, form: data });
    const edited = (await response.json()) as SupportMessage & { editedAt: string | null };

    expect(response.status).toBe(SUPPORT_ATTACHMENTS_TEST.OK);
    expect(edited.body).toBe(SUPPORT_ATTACHMENTS_TEST.EDITED_TEXT);
    expect(edited.editedAt).toBeTruthy();
  });

  it('refuses to let anyone else edit the message', async () => {
    const data = new FormData();
    data.append('body', SUPPORT_ATTACHMENTS_TEST.FAKE_TEXT);

    expect((await SupportTestHelper.multipart({ method: 'PATCH', conversationId, path: `/messages/${messageId}`, token: staff, form: data })).status).toBe(SUPPORT_ATTACHMENTS_TEST.FORBIDDEN);
  });

  it('refuses an edit that changes nothing', async () => {
    expect((await SupportTestHelper.multipart({ method: 'PATCH', conversationId, path: `/messages/${messageId}`, token: customer, form: new FormData() })).status).toBe(SUPPORT_ATTACHMENTS_TEST.BAD_REQUEST);
  });
});
