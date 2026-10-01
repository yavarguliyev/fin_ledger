import { Pool } from 'pg';

import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';

const INSUFFICIENT_PRIVILEGE = '42501';

describe('API database login', () => {
  const app = new Pool({ connectionString: process.env[TEST_ENV_KEYS.APP_DATABASE_URL] });

  const denied = async (sql: string): Promise<unknown> =>
    app.query(sql).then(
      () => 'allowed',
      (error: { code?: string }) => error.code
    );

  afterAll(async () => {
    await app.end();
    await DbHelper.close();
  });

  it('is the login the running API uses', async () => {
    await ApiHelper.request({ method: 'GET', path: '/game-events' });

    const sessions = await DbHelper.query<{ usename: string }>({
      sql: "SELECT DISTINCT usename FROM pg_stat_activity WHERE datname = current_database() AND backend_type = 'client backend' AND pid <> pg_backend_pid()"
    });

    expect(sessions.map(({ usename }) => usename)).toContain('app_api');
    await expect(app.query('SELECT current_user AS name')).resolves.toMatchObject({ rows: [{ name: 'app_api' }] });
  });

  it('cannot change or wipe the schema', async () => {
    await expect(denied('DROP TABLE payments')).resolves.toBe(INSUFFICIENT_PRIVILEGE);
    await expect(denied('ALTER TABLE payments ADD COLUMN injected text')).resolves.toBe(INSUFFICIENT_PRIVILEGE);
    await expect(denied('TRUNCATE ledger_entries')).resolves.toBe(INSUFFICIENT_PRIVILEGE);
    await expect(denied('CREATE TABLE injected (id int)')).resolves.toBe(INSUFFICIENT_PRIVILEGE);
  });

  it('can delete only where the code needs to', async () => {
    await expect(denied('DELETE FROM payments WHERE false')).resolves.toBe(INSUFFICIENT_PRIVILEGE);
    await expect(denied('DELETE FROM ledger_entries WHERE false')).resolves.toBe(INSUFFICIENT_PRIVILEGE);
    await expect(denied('DELETE FROM wallets WHERE false')).resolves.toBe(INSUFFICIENT_PRIVILEGE);
    await expect(denied('DELETE FROM notifications WHERE false')).resolves.toBe('allowed');
    await expect(denied('DELETE FROM users WHERE false')).resolves.toBe('allowed');
  });
});
