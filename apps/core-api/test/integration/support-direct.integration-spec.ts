import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SUPPORT_PRESENCE_TEST } from '../constants/support-presence.constant';
import { PresenceEntry, SupportConversation, SupportMessage } from '../interfaces/support-chat.interface';

describe('Support direct conversations', () => {
  let customer = '';
  let moderator = '';
  let admin = '';
  let moderatorId = '';
  let adminId = '';

  const idOf = async (email: string): Promise<string> => {
    const [row] = await DbHelper.query<{ id: string }>({ sql: SUPPORT_CHAT_TEST.USER_ID_SQL, params: [email] });
    return row?.id ?? '';
  };

  const open = (staffUserId: string): ReturnType<typeof ApiHelper.request<SupportConversation>> =>
    ApiHelper.request<SupportConversation>({ method: 'POST', path: SUPPORT_CHAT_TEST.CONVERSATIONS_PATH, token: customer, body: { staffUserId } });

  const thread = (token: string, id: string): ReturnType<typeof ApiHelper.request<SupportMessage[]>> =>
    ApiHelper.request<SupportMessage[]>({ path: `${SUPPORT_CHAT_TEST.CONVERSATIONS_PATH}/${id}/messages`, token });

  const contacts = (): ReturnType<typeof ApiHelper.request<PresenceEntry[]>> =>
    ApiHelper.request<PresenceEntry[]>({ path: SUPPORT_CHAT_TEST.CONTACTS_PATH, token: customer });

  beforeAll(async () => {
    await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[SUPPORT_CHAT_TEST.OTHER_EMAIL]] });

    customer = await ApiHelper.login({ email: SUPPORT_CHAT_TEST.OTHER_EMAIL });
    moderator = await ApiHelper.login({ email: SUPPORT_CHAT_TEST.STAFF_EMAIL });
    admin = await ApiHelper.login({ email: SUPPORT_CHAT_TEST.ADMIN_EMAIL });
    moderatorId = await idOf(SUPPORT_CHAT_TEST.STAFF_EMAIL);
    adminId = await idOf(SUPPORT_CHAT_TEST.ADMIN_EMAIL);
  });

  afterAll(async () => {
    await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[SUPPORT_CHAT_TEST.OTHER_EMAIL]] });
    await DbHelper.close();
  });

  it('lists every active staff member as a contact a player can write to', async () => {
    const listed = await contacts();
    const ids = listed.body.map(({ userId }) => userId);

    expect(listed.body).toHaveLength(SUPPORT_CHAT_TEST.STAFF_CONTACT_COUNT);
    expect(ids).toEqual(expect.arrayContaining([moderatorId, adminId]));
  });

  it('gives a player a separate conversation with each staff member', async () => {
    const withModerator = await open(moderatorId);
    const withAdmin = await open(adminId);

    expect(withModerator.status).toBe(SUPPORT_CHAT_TEST.CREATED);
    expect(withAdmin.body.id).not.toBe(withModerator.body.id);
    expect(withAdmin.body.assignedStaffId).toBe(adminId);
  });

  it('keeps one staff member out of a conversation addressed to another', async () => {
    const withModerator = await open(moderatorId);

    const peek = await thread(admin, withModerator.body.id);
    const own = await thread(moderator, withModerator.body.id);

    expect(peek.status).toBe(SUPPORT_CHAT_TEST.NOT_FOUND);
    expect(own.status).toBe(SUPPORT_CHAT_TEST.OK);
  });

  it('refuses a conversation with someone who is not on the support team', async () => {
    const refused = await open(await idOf(SUPPORT_CHAT_TEST.CUSTOMER_EMAIL));

    expect(refused.status).toBe(SUPPORT_CHAT_TEST.NOT_FOUND);
  });

  it('shows a staff member online after a heartbeat and offline with a last seen time after logout', async () => {
    await ApiHelper.request({ method: 'POST', path: SUPPORT_PRESENCE_TEST.HEARTBEAT_PATH, token: moderator, body: {} });

    const online = await contacts();

    expect(online.body.find(({ userId }) => userId === moderatorId)?.state).toBe(SUPPORT_CHAT_TEST.ONLINE);

    await ApiHelper.request({ method: 'POST', path: SUPPORT_CHAT_TEST.LOGOUT_PATH, token: moderator, body: {} });

    const offline = (await contacts()).body.find(({ userId }) => userId === moderatorId);

    expect(offline?.state).toBe(SUPPORT_CHAT_TEST.OFFLINE);
    expect(offline?.lastSeenAt).toBeTruthy();
  });
});
