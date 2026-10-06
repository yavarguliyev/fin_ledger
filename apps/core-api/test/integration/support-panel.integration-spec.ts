import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SUPPORT_PANEL_TEST as T } from '../constants/support-panel.constant';
import { PanelDeleted, PanelDeleteDto, PanelFile, PanelLink, PanelRequestDto, PanelStorage, PanelUploadDto } from '../interfaces/support-panel.interface';
import { SupportSession } from '../interfaces/support-test.interface';

let session: SupportSession = { customer: '', staff: '', conversationId: '' };

const panel = <R>({ token, tab, query = '' }: PanelRequestDto): ReturnType<typeof ApiHelper.request<R>> =>
  ApiHelper.request<R>({ path: `${T.CONVERSATIONS_PATH}${session.conversationId}${tab}${query}`, token });

const upload = async ({ token, bytes, name, type }: PanelUploadDto): Promise<PanelFile[]> => {
  const form = new FormData();
  form.append(T.FIELD_NAME, new Blob([new Uint8Array(bytes)], { type }), name);
  const response = await SupportTestHelper.multipart({ method: T.POST, conversationId: session.conversationId, path: T.ATTACHMENTS, token, form });
  return (await response.json()) as PanelFile[];
};

const removeFiles = ({ token, messageIds }: PanelDeleteDto): ReturnType<typeof ApiHelper.request<PanelDeleted>> =>
  ApiHelper.request<PanelDeleted>({ method: T.DELETE, path: `${T.CONVERSATIONS_PATH}${session.conversationId}${T.STORAGE}`, token, body: { messageIds } });

beforeAll(async () => {
  session = await SupportTestHelper.start({ customerEmail: T.CUSTOMER_EMAIL, otherEmails: [T.OUTSIDER_EMAIL] });
  const { customer, staff, conversationId } = session;

  await SupportTestHelper.send({ token: customer, conversationId, body: T.LINK_TEXT });
  await upload({ token: customer, bytes: T.PNG_BYTES, name: T.FIRST_PNG, type: T.PNG_TYPE });
  await upload({ token: staff, bytes: T.PNG_BYTES, name: T.SECOND_PNG, type: T.PNG_TYPE });
  await upload({ token: customer, bytes: T.PDF_BYTES, name: T.PDF_NAME, type: T.PDF_TYPE });
});

afterAll(async () => {
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[T.CUSTOMER_EMAIL, T.OUTSIDER_EMAIL]] });
  await DbHelper.close();
});

describe('Support conversation info panel', () => {
  it('gives the customer only the team and staff name, and staff the full customer card', async () => {
    const forCustomer = await panel<Record<string, unknown>>({ token: session.customer, tab: T.CONTACT });
    expect(Object.keys(forCustomer.body).sort()).toEqual([...T.CUSTOMER_KEYS].sort());

    const forStaff = await panel<Record<string, unknown>>({ token: session.staff, tab: T.CONTACT });
    T.STAFF_FIELDS.forEach(field => expect(forStaff.body).toHaveProperty(field));
  });

  it('pages media newest first and keeps docs and links in their own tabs', async () => {
    const first = await panel<PanelFile[]>({ token: session.customer, tab: T.MEDIA, query: `?limit=${T.PAGE_ONE}` });
    expect(first.body.map(file => file.attachment?.fileName)).toEqual([T.SECOND_PNG]);

    const [last] = first.body;
    const cursor = `?limit=${T.PAGE_ONE}&before=${encodeURIComponent(last?.createdAt ?? '')}&beforeId=${last?.id ?? ''}`;
    const second = await panel<PanelFile[]>({ token: session.customer, tab: T.MEDIA, query: cursor });
    expect(second.body.map(file => file.attachment?.fileName)).toEqual([T.FIRST_PNG]);

    const docs = await panel<PanelFile[]>({ token: session.customer, tab: T.DOCS });
    expect(docs.body.map(file => file.attachment?.fileName)).toEqual([T.PDF_NAME]);

    const links = await panel<PanelLink[]>({ token: session.staff, tab: T.LINKS });
    expect(links.body.map(link => link.url)).toEqual([T.LINK_URL]);
  });

  it('deletes only the caller’s own files and updates the totals', async () => {
    const before = await panel<PanelStorage>({ token: session.customer, tab: T.STORAGE });
    expect(before.body.customerTotalBytes).toBeUndefined();
    expect((await panel<PanelStorage>({ token: session.staff, tab: T.STORAGE })).body.customerTotalBytes).toBeGreaterThan(0);

    const all = before.body.files.map(file => file.messageId);
    const mine = before.body.files.filter(file => file.mine).map(file => file.messageId);
    expect((await removeFiles({ token: session.customer, messageIds: all })).body.deleted).toBe(mine.length);

    const after = await panel<PanelStorage>({ token: session.customer, tab: T.STORAGE });
    expect(after.body.ownBytes).toBe(0);
    expect(after.body.fileCount).toBe(before.body.fileCount - mine.length);
    expect((await panel<PanelFile[]>({ token: session.customer, tab: T.DOCS })).body).toEqual([]);
  });

  it('hides every tab from someone outside the conversation', async () => {
    const outsider = await ApiHelper.login({ email: T.OUTSIDER_EMAIL });
    for (const tab of [T.CONTACT, T.MEDIA, T.DOCS, T.LINKS, T.STORAGE]) expect((await panel({ token: outsider, tab })).status).toBe(T.NOT_FOUND);
  });
});
