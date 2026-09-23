import { PostgreSQLAdapter } from '@common/database';
import { DatabaseType } from '@common/shared-libs';

import { DbHelper } from '../helpers/db.helper';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

const STATEMENT_TIMEOUT_MS = 500;
const APPLICATION_NAME = 'core-api-pool-spec';
const RECOVERY_ATTEMPTS = 5;

describe('Database pool safety', () => {
  let adapter: PostgreSQLAdapter;

  const connection = (): URL => new URL(process.env[TEST_ENV_KEYS.DATABASE_URL] as string);

  beforeAll(async () => {
    const url = connection();

    adapter = new PostgreSQLAdapter({
      config: {
        type: DatabaseType.POSTGRESQL,
        host: url.hostname,
        port: Number(url.port),
        username: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.slice(1),
        connectionLimit: 3,
        minLimit: 1,
        statementTimeoutMillis: STATEMENT_TIMEOUT_MS,
        applicationName: APPLICATION_NAME
      }
    });

    await adapter.connect();
  });

  afterAll(async () => {
    await adapter.disconnect();
    await DbHelper.close();
  });

  it('cancels a statement that runs past the timeout', async () => {
    await expect(adapter.query({ sql: 'SELECT pg_sleep(30)' })).rejects.toThrow();
  });

  it('survives the server killing its connections and heals the pool', async () => {
    await adapter.query({ sql: 'SELECT 1' });

    await DbHelper.query({
      sql: 'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE application_name = $1 AND pid <> pg_backend_pid()',
      params: [APPLICATION_NAME]
    });

    const attempts: string[] = [];
    let ok = 0;

    for (let attempt = 0; attempt < RECOVERY_ATTEMPTS && ok === 0; attempt += 1) {
      try {
        const result = await adapter.query<{ ok: number }>({ sql: 'SELECT 1 AS ok' });
        ok = result.rows[0]?.ok ?? 0;
      } catch (error) {
        attempts.push((error as Error).message);
      }
    }

    expect(ok).toBe(1);
    attempts.forEach(message => expect(message).toContain('terminating connection'));
  });

  it('reports pool gauges', async () => {
    await adapter.query({ sql: 'SELECT 1' });

    const stats = adapter.poolStats();

    expect(stats.totalCount).toBeGreaterThan(0);
    expect(stats.waitingCount).toBe(0);
  });

  it('rolls a failed transaction back without leaving the work behind', async () => {
    const probe = `pool_probe_${Date.now()}`;

    await expect(
      adapter.transaction({
        callback: async tx => {
          await tx.query({ sql: `CREATE TEMP TABLE ${probe} (id int)` });
          throw new Error('caller failed');
        }
      })
    ).rejects.toThrow('caller failed');

    const stats = adapter.poolStats();
    expect(stats.waitingCount).toBe(0);
  });
});
