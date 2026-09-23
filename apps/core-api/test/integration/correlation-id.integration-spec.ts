import { CORRELATION } from '@common/shared-libs';
import { CryptoHelper } from '@common/shared-libs';

import { DbHelper } from '../helpers/db.helper';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

const apiUrl = (): string => process.env[TEST_ENV_KEYS.API_URL] as string;

describe('Correlation IDs', () => {
  afterAll(async () => DbHelper.close());

  it('echoes the caller\'s id back and stamps it on the outbox rows the request wrote', async () => {
    const correlationId = CryptoHelper.uuid();
    const email = `correlation+${correlationId}@seed.local`;

    const response = await fetch(`${apiUrl()}/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', [CORRELATION.HEADER]: correlationId },
      body: JSON.stringify({ email, password: 'CorrelationPass123!', displayName: 'Correlation Probe', termsAccepted: true })
    });

    expect(response.status).toBe(201);
    expect(response.headers.get(CORRELATION.HEADER)).toBe(correlationId);

    const rows = await DbHelper.query<{ trace_id: string; event_type: string }>({
      sql: 'SELECT trace_id, event_type FROM outbox_events WHERE trace_id = $1',
      params: [correlationId]
    });

    expect(rows.length).toBeGreaterThan(0);
    rows.forEach(row => expect(row.trace_id).toBe(correlationId));
  });

  it('issues an id when the caller does not supply one', async () => {
    const response = await fetch(`${apiUrl()}/game-events`);
    const issued = response.headers.get(CORRELATION.HEADER);

    expect(issued).toBeTruthy();
    expect(issued).not.toBe('');
  });
});
