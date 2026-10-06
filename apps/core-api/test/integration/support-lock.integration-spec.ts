import Redis from 'ioredis';

import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { SupportTestHelper } from '../helpers/support.helper';
import { SUPPORT_CHAT_TEST } from '../constants/support-chat.constant';
import { SUPPORT_LOCK_TEST as T } from '../constants/support-lock.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { LockCallDto, LockState } from '../interfaces/support-lock.interface';
import { SupportSession, SupportTokenDto } from '../interfaces/support-test.interface';

let session: SupportSession = { customer: '', staff: '', conversationId: '' };

const lockCall = ({ path }: LockCallDto): ReturnType<typeof ApiHelper.request<LockState>> =>
  ApiHelper.request<LockState>({ method: T.POST, path, token: session.customer, body: { conversationId: session.conversationId } });

const threadStatus = async ({ token }: SupportTokenDto): Promise<number> => (await SupportTestHelper.thread({ token, conversationId: session.conversationId })).status;

beforeAll(async () => {
  session = await SupportTestHelper.start({ customerEmail: T.CUSTOMER_EMAIL });
  await SupportTestHelper.send({ token: session.customer, conversationId: session.conversationId, body: T.TEXT });
});

afterAll(async () => {
  await DbHelper.query({ sql: T.CLEAN_SQL, params: [T.CREDENTIAL_ID] });
  await DbHelper.query({ sql: SUPPORT_CHAT_TEST.CLEAN_SQL, params: [[T.CUSTOMER_EMAIL]] });
  await DbHelper.close();
});

describe('Locked chats', () => {
  it('needs a passkey before a chat can be locked', async () => {
    expect((await lockCall({ path: T.LOCK_PATH })).status).toBe(T.FORBIDDEN);
  });

  it('hides a locked chat from its owner only, and keeps the preview out of the list', async () => {
    await DbHelper.query({ sql: T.SEED_SQL, params: [T.CUSTOMER_EMAIL, T.CREDENTIAL_ID, T.PUBLIC_KEY, T.DEVICE_LABEL] });

    expect((await lockCall({ path: T.LOCK_PATH })).body).toEqual({ locked: true, open: false });
    expect(await threadStatus({ token: session.customer })).toBe(T.FORBIDDEN);
    expect(await threadStatus({ token: session.staff })).toBe(T.OK);

    const list = await SupportTestHelper.list({ token: session.customer });
    expect(list.body.find(row => row.id === session.conversationId)).toMatchObject({ locked: true, lastMessagePreview: null });
  });

  it('opens only after a fresh passkey confirmation, which is used up', async () => {
    expect((await lockCall({ path: T.UNLOCK_PATH })).status).toBe(T.FORBIDDEN);

    const userId = await SupportTestHelper.userId({ email: T.CUSTOMER_EMAIL });
    const redis = new Redis(process.env[TEST_ENV_KEYS.REDIS_URL] as string);
    await redis.set(`${T.GRANT_PREFIX}${userId}`, JSON.stringify(T.GRANT_VALUE), T.EXPIRE_FLAG, T.GRANT_TTL_SECONDS);
    await redis.quit();

    expect((await lockCall({ path: T.UNLOCK_PATH })).body).toEqual({ locked: true, open: true });
    expect(await threadStatus({ token: session.customer })).toBe(T.OK);
    expect((await lockCall({ path: T.UNLOCK_PATH })).status).toBe(T.FORBIDDEN);
  });

  it('removes the lock while it is open', async () => {
    const removed = await ApiHelper.request<LockState>({ method: T.DELETE, path: `${T.CONVERSATIONS_PATH}${session.conversationId}${T.LOCK}`, token: session.customer });

    expect(removed.body).toEqual({ locked: false, open: true });
  });
});
