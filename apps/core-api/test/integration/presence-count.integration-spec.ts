import { randomUUID } from 'node:crypto';
import Redis from 'ioredis';

import { PRESENCE_COUNT_TEST as T } from '../constants/presence-count.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { TestUserHelper } from '../helpers/test-user.helper';

describe('Presence count beyond the list cap', () => {
  const redis = new Redis(process.env[TEST_ENV_KEYS.REDIS_URL] as string);
  const extraIds = Array.from({ length: T.EXTRA_USERS }, () => randomUUID());
  let staff = '';
  let customer = '';

  const count = (token: string): Promise<number> =>
    ApiHelper.request<{ total: number }>({ path: T.COUNT_PATH, token }).then(response => response.body.total);

  beforeAll(async () => {
    await TestUserHelper.ensure({ emails: [T.CUSTOMER_EMAIL] });
    staff = await ApiHelper.login({ email: T.STAFF_EMAIL });
    customer = await ApiHelper.login({ email: T.CUSTOMER_EMAIL });
    const lastSeenAt = new Date().toISOString();
    const pipeline = redis.pipeline();

    for (const userId of extraIds) {
      pipeline.set(`${T.KEY_PREFIX}${userId}`, JSON.stringify({ userId, displayName: T.DISPLAY_NAME, role: T.ROLE, lastSeenAt }), T.EXPIRE_FLAG, T.TTL_SECONDS);
      pipeline.zadd(T.INDEX_KEY, Date.now(), userId);
    }

    await pipeline.exec();
    await ApiHelper.request({ method: 'POST', path: T.HEARTBEAT_PATH, token: staff, body: {} });
  });

  afterAll(async () => {
    await redis.del(...extraIds.map(userId => `${T.KEY_PREFIX}${userId}`));
    await redis.zrem(T.INDEX_KEY, ...extraIds);
    await redis.quit();
    await DbHelper.close();
  });

  it('gives staff the real total while the list stops at the page size', async () => {
    const listed = await ApiHelper.request<unknown[]>({ path: T.PRESENCE_PATH, token: staff });

    expect(listed.body.length).toBeLessThanOrEqual(T.PAGE_SIZE);
    await expect(count(staff)).resolves.toBeGreaterThanOrEqual(T.EXTRA_USERS);
  });

  it('counts only online staff for a customer, never the players', async () => {
    const total = await count(customer);
    const listed = await ApiHelper.request<unknown[]>({ path: T.PRESENCE_PATH, token: customer });

    expect(total).toBe(listed.body.length);
    expect(total).toBeLessThan(T.EXTRA_USERS);
  });
});
