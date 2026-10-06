import { HEALTH_METRICS_TEST as T } from '../constants/health-metrics.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { DbHelper } from '../helpers/db.helper';
import { ReadinessBody } from '../interfaces/health-metrics.interface';

const rootUrl = (): string => (process.env[TEST_ENV_KEYS.API_URL] as string).replace(T.API_SUFFIX, T.EMPTY);

describe('Health and metrics endpoints', () => {
  afterAll(async () => DbHelper.close());

  it('answers liveness without touching a dependency', async () => {
    const response = await fetch(`${rootUrl()}${T.LIVE_PATH}`);

    expect(response.status).toBe(T.OK);
    await expect(response.json()).resolves.toMatchObject({ status: T.OK_STATUS });
  });

  it('reports the database as up on readiness, with its pool gauges', async () => {
    const response = await fetch(`${rootUrl()}${T.READY_PATH}`);
    const body = (await response.json()) as ReadinessBody;

    expect(response.status).toBe(T.OK);
    expect(body.status).toBe(T.OK_STATUS);
    T.DEPENDENCIES.forEach(dependency => expect(body.info?.[dependency]?.status).toBe(T.UP_STATUS));
    expect(body.info?.[T.DATABASE]?.totalCount).toBeGreaterThan(T.NO_CONNECTIONS);
  });

  it('scrapes in Prometheus text format with the gauges this service adds', async () => {
    const response = await fetch(`${rootUrl()}${T.METRICS_PATH}`);

    expect(response.status).toBe(T.OK);
    expect(response.headers.get(T.CONTENT_TYPE)).toContain(T.TEXT_PLAIN);

    const body = await response.text();

    T.METRICS.forEach(metric => expect(body).toContain(metric));
  });
});
