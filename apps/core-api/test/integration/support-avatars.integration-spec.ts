import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { SUPPORT_AVATARS_TEST as T } from '../constants/support-avatars.constant';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { AvatarCarrier } from '../interfaces/support-avatars.interface';
import { SupportSession } from '../interfaces/support-test.interface';

let session: SupportSession = { customer: '', staff: '', conversationId: '' };

beforeAll(async () => {
  session = await SupportTestHelper.start({ customerEmail: T.CUSTOMER_EMAIL });
  await DbHelper.query({ sql: T.SET_AVATAR_SQL, params: [T.STAFF_EMAIL, T.AVATAR_KEY] });
});

afterAll(async () => {
  await DbHelper.query({ sql: T.CLEAR_AVATAR_SQL, params: [T.STAFF_EMAIL] });
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[T.CUSTOMER_EMAIL]] });
  await DbHelper.close();
});

describe('Support profile photos', () => {
  it('sends the staff photo as a signed link in the contact list, never the storage key', async () => {
    const staffId = await SupportTestHelper.userId({ email: T.STAFF_EMAIL });
    const contacts = (await ApiHelper.request<AvatarCarrier[]>({ path: T.CONTACTS_PATH, token: session.customer })).body;
    const staff = contacts.find(contact => contact.userId === staffId);

    expect(staff?.avatarUrl).toMatch(T.SIGNED_URL);
    expect(staff?.avatarKey).toBeUndefined();
  });

  it('puts both people’s photos on the conversation and the contact card', async () => {
    const forCustomer = ((await SupportTestHelper.list({ token: session.customer })).body as unknown as AvatarCarrier[]).find(item => item.id === session.conversationId);
    expect(forCustomer?.assignedStaffAvatarUrl).toMatch(T.SIGNED_URL);
    expect(forCustomer?.customerAvatarUrl).toBeNull();

    const card = await ApiHelper.request<AvatarCarrier>({ path: `${T.CONVERSATIONS_PATH}${session.conversationId}${T.CONTACT}`, token: session.customer });
    expect(card.body.avatarUrl).toMatch(T.SIGNED_URL);
  });
});
