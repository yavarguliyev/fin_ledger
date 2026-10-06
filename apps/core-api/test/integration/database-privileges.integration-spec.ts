import { Pool } from 'pg';

import { DATABASE_PRIVILEGES_TEST as T } from '../constants/database-privileges.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { PrivilegeProbe, SessionUser } from '../interfaces/database-privileges.interface';

describe('API database login', () => {
  const app = new Pool({ connectionString: process.env[TEST_ENV_KEYS.APP_DATABASE_URL] });

  const denied = async ({ sql }: PrivilegeProbe): Promise<unknown> =>
    app.query(sql).then(
      () => T.ALLOWED,
      (error: { code?: string }) => error.code
    );

  afterAll(async () => {
    await app.end();
    await DbHelper.close();
  });

  it('is the login the running API uses', async () => {
    await ApiHelper.request({ method: T.GET, path: T.WARM_UP_PATH });

    const sessions = await DbHelper.query<SessionUser>({ sql: T.SESSIONS_SQL });

    expect(sessions.map(({ usename }) => usename)).toContain(T.API_LOGIN);
    await expect(app.query(T.CURRENT_USER_SQL)).resolves.toMatchObject({ rows: [{ name: T.API_LOGIN }] });
  });

  it('cannot change or wipe the schema', async () => {
    for (const sql of T.SCHEMA_CHANGES) {
      await expect(denied({ sql })).resolves.toBe(T.INSUFFICIENT_PRIVILEGE);
    }
  });

  it('can delete only where the code needs to', async () => {
    for (const sql of T.DENIED_DELETES) {
      await expect(denied({ sql })).resolves.toBe(T.INSUFFICIENT_PRIVILEGE);
    }
    for (const sql of T.ALLOWED_DELETES) {
      await expect(denied({ sql })).resolves.toBe(T.ALLOWED);
    }
  });
});
