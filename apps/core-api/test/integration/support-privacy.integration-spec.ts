import { ApiHelper } from '../helpers/api.helper';
import { AuditLogHelper } from '../helpers/audit-log.helper';
import { DbHelper } from '../helpers/db.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SUPPORT_PRIVACY_TEST as T } from '../constants/support-privacy.constant';
import { DownloadLink, PrivacyDownloadDto, PrivacyState, PrivacyToggleDto, UploadedMessage } from '../interfaces/support-privacy.interface';
import { SupportSession } from '../interfaces/support-test.interface';

let session: SupportSession = { customer: '', staff: '', conversationId: '' };

let fileMessageId = '';

const toggle = ({ token, enabled }: PrivacyToggleDto): ReturnType<typeof ApiHelper.request<PrivacyState>> =>
  ApiHelper.request<PrivacyState>({ method: T.PUT, path: `${T.CONVERSATIONS_PATH}${session.conversationId}${T.PRIVACY}`, token, body: { enabled } });

const download = ({ token, messageId }: PrivacyDownloadDto): ReturnType<typeof ApiHelper.request<DownloadLink>> =>
  ApiHelper.request<DownloadLink>({ path: `${T.CONVERSATIONS_PATH}${session.conversationId}${T.MESSAGES}${messageId}${T.DOWNLOAD}`, token });

beforeAll(async () => {
  session = await SupportTestHelper.start({ customerEmail: T.CUSTOMER_EMAIL });
  await SupportTestHelper.send({ token: session.customer, conversationId: session.conversationId, body: T.TEXT });

  const form = new FormData();
  form.append(T.FIELD_NAME, new Blob([new Uint8Array(T.PNG_BYTES)], { type: T.PNG_TYPE }), T.PNG_NAME);
  const uploaded = await SupportTestHelper.multipart({ method: T.POST, conversationId: session.conversationId, path: T.ATTACHMENTS, token: session.customer, form });
  fileMessageId = ((await uploaded.json()) as UploadedMessage[])[0]?.id ?? '';
});

afterAll(async () => {
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[T.CUSTOMER_EMAIL]] });
  await DbHelper.close();
});

describe('Advanced chat privacy', () => {
  it('posts a notice, hides the list preview and records an audit entry', async () => {
    expect((await toggle({ token: session.customer, enabled: true })).body.privacyEnabled).toBe(true);

    const thread = await SupportTestHelper.thread({ token: session.staff, conversationId: session.conversationId });
    expect(thread.body.map(message => message.body)).toContain(T.ON_NOTICE);

    const list = await SupportTestHelper.list({ token: session.staff });
    const row = list.body.find(conversation => conversation.id === session.conversationId);
    expect(row).toMatchObject({ privacyEnabled: true, lastMessagePreview: null });

    await expect(AuditLogHelper.waitFor({ entityId: session.conversationId, action: T.AUDIT_ACTION })).resolves.toMatchObject({ action: T.AUDIT_ACTION });
  });

  it('lets only the sender download while it is on', async () => {
    expect((await download({ token: session.staff, messageId: fileMessageId })).status).toBe(T.FORBIDDEN);

    const own = await download({ token: session.customer, messageId: fileMessageId });
    expect(own.status).toBe(T.OK);
    expect(own.body.url).toContain(T.ATTACHMENT_DISPOSITION);
  });

  it('allows the other side to download again once it is off', async () => {
    await toggle({ token: session.staff, enabled: false });

    expect((await download({ token: session.staff, messageId: fileMessageId })).status).toBe(T.OK);
  });
});
