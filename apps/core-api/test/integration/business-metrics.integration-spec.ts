import { randomUUID } from 'node:crypto';

import { BUSINESS_METRICS_TEST as T } from '../constants/business-metrics.constant';
import { DbHelper } from '../helpers/db.helper';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

const scrape = async (): Promise<string> => {
  const response = await fetch(`${(process.env[TEST_ENV_KEYS.API_URL] as string).replace(T.API_SUFFIX, '')}${T.METRICS_PATH}`);
  expect(response.status).toBe(T.OK);
  return response.text();
};

describe('Business metrics', () => {
  let paymentId = '';

  afterAll(async () => {
    if (paymentId) await DbHelper.query({ sql: T.CLEANUP_SQL, params: [paymentId] });
    await DbHelper.close();
  });

  it('counts a deposit created in the last minute, reading past row-level security', async () => {
    const [wallet] = await DbHelper.query<{ id: string; currency: string }>({ sql: T.WALLET_SQL, params: [T.EMAIL] });
    const [row] = await DbHelper.query<{ id: string }>({ sql: T.PAYMENT_SQL, params: [randomUUID(), T.EMAIL, wallet?.id, wallet?.currency] });
    paymentId = row?.id ?? '';

    const body = await scrape();

    expect(Number(body.match(T.CREATED_DEPOSITS)?.[1] ?? 0)).toBeGreaterThanOrEqual(1);
  });

  it('always reports the bet series, at zero when nothing happened', async () => {
    const body = await scrape();

    expect(body).toMatch(T.BETS_PLACED);
  });
});
