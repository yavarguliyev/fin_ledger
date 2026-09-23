import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

describe('Health and metrics endpoints', () => {
  afterAll(async () => DbHelper.close());

  it('answers liveness without touching a dependency', async () => {
    await expect(ApiHelper.request({ method: 'GET', path: '/health/live' })).resolves.toMatchObject({ status: 200, body: { status: 'ok' } });
  });

  it('reports the database as up on readiness, with its pool gauges', async () => {
    const response = await ApiHelper.request<{ status: string; info: Record<string, { status: string; totalCount: number }> }>({
      method: 'GET',
      path: '/health/ready'
    });

    expect(response.status).toBe(200);
    expect(response.body?.status).toBe('ok');
    expect(response.body?.info?.['database']?.status).toBe('up');
    expect(response.body?.info?.['database']?.totalCount).toBeGreaterThan(0);
  });

  it('scrapes in Prometheus text format with the gauges this service adds', async () => {
    const response = await fetch(`${process.env[TEST_ENV_KEYS.API_URL] as string}/metrics`);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/plain');

    const body = await response.text();

    ['core_api_db_pool_connections_total', 'core_api_db_pool_connections_waiting', 'core_api_outbox_events_pending', 'core_api_outbox_events_dead'].forEach(metric =>
      expect(body).toContain(metric)
    );

    expect(body).toContain('core_api_process_cpu_user_seconds_total');
  });
});
