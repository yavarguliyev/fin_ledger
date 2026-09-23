import { Client } from 'pg';
import { RETENTION } from '../../src/modules/retention/constants/retention.constant';

import { DbHelper } from '../helpers/db.helper';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

const OUTBOX_DAYS = 7;
const WEBHOOK_DAYS = 90;

describe('Retention of append-only tables', () => {
  let aggregateId: string;
  let app: Client;

  const seedPublishedOutbox = async ({ ageDays }: { ageDays: number }): Promise<string> => {
    const [row] = await DbHelper.query<{ id: string }>({
      sql: `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, aggregate_version, payload, status, published_at)
            VALUES ('User', $1, 'none', $2, '{"retention": true}'::jsonb, 'PUBLISHED', now() - make_interval(days => $3))
            RETURNING id`,
      params: [aggregateId, Date.now() + ageDays, ageDays]
    });

    return row?.id as string;
  };

  beforeAll(async () => {
    const [user] = await DbHelper.query<{ id: string }>({ sql: 'SELECT id FROM users LIMIT 1' });
    aggregateId = user?.id as string;

    app = new Client({ connectionString: process.env[TEST_ENV_KEYS.APP_DATABASE_URL] });
    await app.connect();
  });

  afterAll(async () => {
    await app.end();
    await DbHelper.close();
  });

  it('removes published outbox rows past the window and keeps the recent ones', async () => {
    const stale = await seedPublishedOutbox({ ageDays: OUTBOX_DAYS + 3 });
    const fresh = await seedPublishedOutbox({ ageDays: 1 });

    await DbHelper.query({ sql: RETENTION.DELETE_OUTBOX_SQL, params: [OUTBOX_DAYS] });

    const remaining = await DbHelper.query<{ id: string }>({
      sql: 'SELECT id FROM outbox_events WHERE id = ANY($1)',
      params: [[stale, fresh]]
    });

    expect(remaining.map(row => row.id)).toEqual([fresh]);
  });

  it('leaves unpublished rows alone however old they are', async () => {
    const [pending] = await DbHelper.query<{ id: string }>({
      sql: `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, aggregate_version, payload, available_at)
            VALUES ('User', $1, 'none', $2, '{"retention": true}'::jsonb, now() - make_interval(days => $3))
            RETURNING id`,
      params: [aggregateId, Date.now() + 999, OUTBOX_DAYS + 30]
    });

    await DbHelper.query({ sql: RETENTION.DELETE_OUTBOX_SQL, params: [OUTBOX_DAYS] });

    await expect(DbHelper.query({ sql: 'SELECT id FROM outbox_events WHERE id = $1', params: [pending?.id] })).resolves.toHaveLength(1);
  });

  it('refuses the delete to the API login, so only the worker can prune', async () => {
    await expect(app.query(RETENTION.DELETE_OUTBOX_SQL, [OUTBOX_DAYS])).rejects.toThrow(/permission denied/i);
    await expect(app.query(RETENTION.DELETE_WEBHOOKS_SQL, [WEBHOOK_DAYS])).rejects.toThrow(/permission denied/i);
  });
});
