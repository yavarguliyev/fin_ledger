import { randomUUID } from 'node:crypto';
import Redis from 'ioredis';

import { PRESENCE_SWEEP_TEST as T } from '../constants/presence-sweep.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { TokenRef } from '../interfaces/token-ref.interface';

describe('Presence index upkeep', () => {
  const redis = new Redis(process.env[TEST_ENV_KEYS.REDIS_URL] as string);
  let staff: string = T.EMPTY;
  let player: string = T.EMPTY;

  const heartbeat = ({ token }: TokenRef): ReturnType<typeof ApiHelper.request> =>
    ApiHelper.request({ method: T.POST, path: T.HEARTBEAT_PATH, token, body: {} });

  beforeAll(async () => {
    await TestUserHelper.ensure({ emails: [T.PLAYER_EMAIL] });
    staff = await ApiHelper.login({ email: T.STAFF_EMAIL });
    player = await ApiHelper.login({ email: T.PLAYER_EMAIL });
  });

  afterAll(async () => {
    await redis.quit();
    await DbHelper.close();
  });

  it('indexes staff separately, so a customer list reads only online staff', async () => {
    await expect(heartbeat({ token: staff })).resolves.toMatchObject({ status: T.CREATED });
    await expect(heartbeat({ token: player })).resolves.toMatchObject({ status: T.CREATED });

    await expect(redis.zscore(T.STAFF_INDEX_KEY, await TestUserHelper.idOf({ email: T.STAFF_EMAIL }))).resolves.not.toBeNull();
    await expect(redis.zscore(T.STAFF_INDEX_KEY, await TestUserHelper.idOf({ email: T.PLAYER_EMAIL }))).resolves.toBeNull();
    await expect(redis.zscore(T.INDEX_KEY, await TestUserHelper.idOf({ email: T.PLAYER_EMAIL }))).resolves.not.toBeNull();
  });

  it('drops users whose presence expired without a leave on the next heartbeat', async () => {
    const vanished = randomUUID();

    await redis.zadd(T.INDEX_KEY, Date.now() - T.STALE_AGE_MS, vanished);
    await redis.zadd(T.STAFF_INDEX_KEY, Date.now() - T.STALE_AGE_MS, vanished);
    await redis.del(T.SWEEP_LOCK_KEY);

    await expect(heartbeat({ token: player })).resolves.toMatchObject({ status: T.CREATED });

    await expect(redis.zscore(T.INDEX_KEY, vanished)).resolves.toBeNull();
    await expect(redis.zscore(T.STAFF_INDEX_KEY, vanished)).resolves.toBeNull();
    await expect(redis.zscore(T.INDEX_KEY, await TestUserHelper.idOf({ email: T.PLAYER_EMAIL }))).resolves.not.toBeNull();
  });
});
