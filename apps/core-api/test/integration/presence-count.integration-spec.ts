import { randomUUID } from 'node:crypto';
import Redis from 'ioredis';

import { PRESENCE_COUNT_TEST as T } from '../constants/presence-count.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { PresenceSeedHelper } from '../helpers/presence-seed.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { PresenceTotal, TokenRef } from '../interfaces/token-ref.interface';

describe('Presence count beyond the list cap', () => {
  const redis = new Redis(process.env[TEST_ENV_KEYS.REDIS_URL] as string);
  const extraIds = Array.from({ length: T.EXTRA_USERS }, () => randomUUID());
  let staff: string = T.EMPTY;
  let customer: string = T.EMPTY;

  const count = ({ token }: TokenRef): Promise<number> =>
    ApiHelper.request<PresenceTotal>({ path: T.COUNT_PATH, token }).then(response => response.body.total);

  beforeAll(async () => {
    await TestUserHelper.ensure({ emails: [T.CUSTOMER_EMAIL] });
    staff = await ApiHelper.login({ email: T.STAFF_EMAIL });
    customer = await ApiHelper.login({ email: T.CUSTOMER_EMAIL });
    await PresenceSeedHelper.seed({ redis, userIds: extraIds, displayName: T.DISPLAY_NAME });
    await ApiHelper.request({ method: T.POST, path: T.HEARTBEAT_PATH, token: staff, body: {} });
  });

  afterAll(async () => {
    await PresenceSeedHelper.clear({ redis, userIds: extraIds });
    await DbHelper.close();
  });

  it('gives staff the real total while the list stops at the page size', async () => {
    const listed = await ApiHelper.request<unknown[]>({ path: T.PRESENCE_PATH, token: staff });

    expect(listed.body.length).toBeLessThanOrEqual(T.PAGE_SIZE);
    await expect(count({ token: staff })).resolves.toBeGreaterThanOrEqual(T.EXTRA_USERS);
  });

  it('counts only online staff for a customer, never the players', async () => {
    const total = await count({ token: customer });
    const listed = await ApiHelper.request<unknown[]>({ path: T.PRESENCE_PATH, token: customer });

    expect(total).toBe(listed.body.length);
    expect(total).toBeLessThan(T.EXTRA_USERS);
  });
});
