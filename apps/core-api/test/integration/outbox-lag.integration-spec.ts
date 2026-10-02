import { OUTBOX_LAG_TEST as T } from '../constants/outbox-lag.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { DbHelper } from '../helpers/db.helper';

const lagSeconds = async (): Promise<number> => {
  const root = (process.env[TEST_ENV_KEYS.API_URL] as string).replace(T.API_SUFFIX, '');
  const body = await (await fetch(`${root}${T.METRICS_PATH}`)).text();
  return Number(T.METRIC_PATTERN.exec(body)?.[1]);
};

describe('Outbox lag metric', () => {
  let probeId = '';

  afterAll(async () => {
    if (probeId) await DbHelper.query({ sql: T.CLEANUP_SQL, params: [probeId] });
    await DbHelper.close();
  });

  it('reports the age of the oldest pending outbox event in seconds', async () => {
    const [row] = await DbHelper.query<{ id: string }>({ sql: T.INSERT_SQL, params: [T.AGE_SECONDS] });
    probeId = row?.id as string;

    await expect(lagSeconds()).resolves.toBeGreaterThanOrEqual(T.AGE_SECONDS);
  });
});
