import { DbHelper } from '../helpers/db.helper';

const rootUrl = (): string => (process.env[TEST_ENV_KEYS.API_URL] as string).replace(/\/api\/v\d+$/, '');
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

describe('Health and metrics endpoints', () => {
  afterAll(async () => DbHelper.close());

  it('answers liveness without touching a dependency', async () => {
    const response = await fetch(`${rootUrl()}/health/live`);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: 'ok' });
  });

  it('reports the database as up on readiness, with its pool gauges', async () => {
    const response = await fetch(`${rootUrl()}/health/ready`);
    const body = (await response.json()) as { status: string; info: Record<string, { status: string; totalCount: number }> };

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.info?.['database']?.status).toBe('up');
    expect(body.info?.['redis']?.status).toBe('up');
    expect(body.info?.['broker']?.status).toBe('up');
    expect(body.info?.['database']?.totalCount).toBeGreaterThan(0);
  });

  it('scrapes in Prometheus text format with the gauges this service adds', async () => {
    const response = await fetch(`${rootUrl()}/metrics`);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/plain');

    const body = await response.text();

    [
      'core_api_db_pool_connections_total',
      'core_api_db_pool_connections_waiting',
      'core_api_outbox_events_pending',
      'core_api_outbox_events_dead'
    ].forEach(metric => expect(body).toContain(metric));

    expect(body).toContain('core_api_process_cpu_user_seconds_total');
  });
});
