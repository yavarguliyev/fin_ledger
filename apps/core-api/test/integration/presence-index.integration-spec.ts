import { randomUUID } from 'node:crypto';
import Redis from 'ioredis';

import { PRESENCE_INDEX_TEST as T } from '../constants/presence-index.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { PresenceSeedHelper } from '../helpers/presence-seed.helper';
import { TestUserHelper } from '../helpers/test-user.helper';

const callsOn = async (redis: Redis): Promise<Record<string, number>> => {
  const info = await redis.info(T.COMMANDSTATS);
  return Object.fromEntries(T.COMMANDS.map(command => [command, Number(T.CALLS_PATTERN(command).exec(info)?.[1] ?? 0)]));
};

describe('Presence lookups do not grow with the number of users online', () => {
  const redis = new Redis(process.env[TEST_ENV_KEYS.REDIS_URL] as string);
  const extraIds = Array.from({ length: T.EXTRA_USERS }, () => randomUUID());
  let staff = '';

  beforeAll(async () => {
    staff = await ApiHelper.login({ email: T.STAFF_EMAIL });
    await PresenceSeedHelper.seed({ redis, userIds: extraIds, displayName: T.DISPLAY_NAME });
  });

  afterAll(async () => {
    await PresenceSeedHelper.clear({ redis, userIds: extraIds });
    await DbHelper.close();
  });

  it('lists everyone online with one range read and one batched fetch, and no key scan', async () => {
    const before = await callsOn(redis);
    const response = await ApiHelper.request<{ userId: string }[]>({ path: T.PRESENCE_PATH, token: staff });
    const after = await callsOn(redis);

    expect(response.status).toBe(T.OK);
    expect(response.body?.map(entry => entry.userId)).toEqual(expect.arrayContaining(extraIds));
    const delta = Object.fromEntries(T.COMMANDS.map(command => [command, (after[command] ?? 0) - (before[command] ?? 0)]));

    expect(delta).toMatchObject(T.EXPECTED_CALLS);
    expect(delta['get']).toBeLessThan(T.EXTRA_USERS);
  });

  it('takes a user out of the index when they leave', async () => {
    await TestUserHelper.ensure({ emails: [T.LEAVER_EMAIL] });
    const leaver = await ApiHelper.login({ email: T.LEAVER_EMAIL });
    const leaverId = await TestUserHelper.idOf({ email: T.LEAVER_EMAIL });

    await ApiHelper.request({ method: 'POST', path: T.HEARTBEAT_PATH, token: leaver, body: {} });
    await expect(redis.zscore(T.INDEX_KEY, leaverId)).resolves.not.toBeNull();

    await ApiHelper.request({ method: 'POST', path: T.LEAVE_PATH, token: leaver, body: {} });
    await expect(redis.zscore(T.INDEX_KEY, leaverId)).resolves.toBeNull();
  });
});
