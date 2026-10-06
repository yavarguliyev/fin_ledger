import { Client } from 'pg';
import { RETENTION } from '../../src/modules/retention/constants/retention.constant';

import { DbHelper } from '../helpers/db.helper';
import { RETENTION_TEST as T } from '../constants/retention.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { RetentionAgeDto, RetentionIdRow } from '../interfaces/retention.interface';

let aggregateId: string;

let app: Client;

const seedPublishedOutbox = async ({ ageDays }: RetentionAgeDto): Promise<string> => {
  const [row] = await DbHelper.query<RetentionIdRow>({ sql: T.PUBLISHED_SQL, params: [aggregateId, Date.now() * T.VERSION_SPREAD + ageDays, ageDays] });
  return row?.id as string;
};

beforeAll(async () => {
  const [user] = await DbHelper.query<RetentionIdRow>({ sql: T.FIRST_USER_SQL });

  aggregateId = user?.id as string;
  app = new Client({ connectionString: process.env[TEST_ENV_KEYS.APP_DATABASE_URL] });

  await app.connect();
});

afterAll(async () => {
  await app.end();
  await DbHelper.close();
});

describe('Retention of append-only tables', () => {
  it('removes published outbox rows past the window and keeps the recent ones', async () => {
    const stale = await seedPublishedOutbox({ ageDays: T.OUTBOX_DAYS + T.STALE_EXTRA_DAYS });
    const fresh = await seedPublishedOutbox({ ageDays: T.FRESH_DAYS });

    await DbHelper.query({ sql: RETENTION.DELETE_OUTBOX_SQL, params: [T.OUTBOX_DAYS] });

    const remaining = await DbHelper.query<RetentionIdRow>({ sql: T.IDS_SQL, params: [[stale, fresh]] });
    expect(remaining.map(row => row.id)).toEqual([fresh]);
  });

  it('leaves unpublished rows alone however old they are', async () => {
    const [pending] = await DbHelper.query<RetentionIdRow>({
      sql: T.PENDING_SQL,
      params: [aggregateId, Date.now() + T.PENDING_VERSION_OFFSET, T.OUTBOX_DAYS + T.PENDING_EXTRA_DAYS]
    });

    await DbHelper.query({ sql: RETENTION.DELETE_OUTBOX_SQL, params: [T.OUTBOX_DAYS] });
    await expect(DbHelper.query({ sql: T.IDS_SQL, params: [[pending?.id]] })).resolves.toHaveLength(1);
  });

  it('refuses the delete to the API login, so only the worker can prune', async () => {
    await expect(app.query(RETENTION.DELETE_OUTBOX_SQL, [T.OUTBOX_DAYS])).rejects.toThrow(T.PERMISSION_DENIED);
    await expect(app.query(RETENTION.DELETE_WEBHOOKS_SQL, [T.WEBHOOK_DAYS])).rejects.toThrow(T.PERMISSION_DENIED);
  });
});
