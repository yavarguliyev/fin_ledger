import { SupportTestHelper } from '../helpers/support.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_ATTACHMENTS_TEST as T } from '../constants/support-attachments.constant';
import { SUPPORT_CHAT_TEST as C } from '../constants/support-chat.constant';
import { AttachmentEditDto, AttachmentFile, AttachmentTextDto, AttachmentUploadDto, EditedMessage } from '../interfaces/support-attachments.interface';

let customer = '';

let staff = '';

let conversationId = '';

let messageId = '';

const png: AttachmentFile = { content: Buffer.from(T.PNG_BYTES), name: T.PNG_NAME, type: T.PNG_TYPE };

const upload = async ({ files }: AttachmentUploadDto): Promise<number> => {
  const form = new FormData();
  files.forEach(({ content, name, type }) => form.append(T.FIELD_NAME, new Blob([new Uint8Array(content)], { type }), name));
  return (await SupportTestHelper.multipart({ method: 'POST', conversationId, path: T.ATTACHMENTS_PATH, token: customer, form })).status;
};

const textForm = ({ text }: AttachmentTextDto): FormData => {
  const form = new FormData();
  form.append(T.BODY_FIELD, text);
  return form;
};

const edit = ({ token, form }: AttachmentEditDto): Promise<Response> =>
  SupportTestHelper.multipart({ method: 'PATCH', conversationId, path: T.MESSAGE_PATH(messageId), token, form });

beforeAll(async () => {
  ({ customer, staff, conversationId } = await SupportTestHelper.start({ customerEmail: T.CUSTOMER_EMAIL }));

  const sent = await SupportTestHelper.send({ token: customer, conversationId, body: T.ORIGINAL_TEXT });
  messageId = sent.body.id;
});

afterAll(async () => {
  await DbHelper.query({ sql: C.CLEAN_SQL, params: [[T.CUSTOMER_EMAIL]] });
  await DbHelper.close();
});

describe('Support attachment limits', () => {
  it('refuses more than five files in one send', async () => {
    await expect(upload({ files: Array.from({ length: T.MAX_FILES + 1 }, () => png) })).resolves.toBe(T.BAD_REQUEST);
  });

  it('refuses a file over the size limit', async () => {
    await expect(upload({ files: [{ ...png, content: Buffer.alloc(T.MAX_FILE_SIZE_BYTES + 1) }] })).resolves.toBe(T.PAYLOAD_TOO_LARGE);
  });

  it('refuses a file type that is not allowed, and a text file pretending to be a picture', async () => {
    const exe = { content: Buffer.from(T.FAKE_TEXT), name: T.EXE_NAME, type: T.EXE_TYPE };
    const fake = { ...png, content: Buffer.from(T.FAKE_TEXT) };

    await expect(upload({ files: [exe] })).resolves.toBe(T.UNSUPPORTED);
    await expect(upload({ files: [fake] })).resolves.toBe(T.UNSUPPORTED);
  });
});

describe('Support message edits', () => {
  it('lets the sender edit their message and marks it as edited', async () => {
    const response = await edit({ token: customer, form: textForm({ text: T.EDITED_TEXT }) });
    const edited = (await response.json()) as EditedMessage;

    expect(response.status).toBe(T.OK);
    expect(edited.body).toBe(T.EDITED_TEXT);
    expect(edited.editedAt).toBeTruthy();
  });

  it('refuses to let anyone else edit the message', async () => {
    expect((await edit({ token: staff, form: textForm({ text: T.FAKE_TEXT }) })).status).toBe(T.FORBIDDEN);
  });

  it('refuses an edit that changes nothing', async () => {
    expect((await edit({ token: customer, form: new FormData() })).status).toBe(T.BAD_REQUEST);
  });
});
