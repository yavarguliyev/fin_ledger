import { Client } from 'pg';

import { DbHelper } from '../helpers/db.helper';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

interface Owner {
  userId: string;
  walletId: string;
}

describe('Row-level security', () => {
  let alice: Owner;
  let bob: Owner;
  let app: Client;

  const asActor = async ({ actorId, sql, params }: { actorId: string | null; sql: string; params: unknown[] }): Promise<unknown[]> => {
    await app.query('BEGIN');

    try {
      await app.query('SELECT set_config($1, $2, true)', ['app.current_user_id', actorId ?? '']);
      const result = await app.query(sql, params);
      return result.rows;
    } finally {
      await app.query('COMMIT');
    }
  };

  beforeAll(async () => {
    const owners = await DbHelper.query<Owner>({
      sql: 'SELECT w.user_id AS "userId", w.id AS "walletId" FROM wallets w JOIN users u ON u.id = w.user_id WHERE u.role = $1 ORDER BY w.created_at LIMIT 2',
      params: ['USER']
    });

    alice = owners[0] as Owner;
    bob = owners[1] as Owner;
    app = new Client({ connectionString: process.env[TEST_ENV_KEYS.APP_DATABASE_URL] });

    await app.connect();
  });

  afterAll(async () => {
    await app.end();
    await DbHelper.close();
  });

  it('runs the API login without the bypass that made the policies decorative', async () => {
    const [role] = await DbHelper.query<{ rolbypassrls: boolean }>({
      sql: 'SELECT rolbypassrls FROM pg_roles WHERE rolname = $1',
      params: ['app_api']
    });

    expect(role?.rolbypassrls).toBe(false);
  });

  it('lets an owner read their own wallet', async () => {
    const rows = await asActor({ actorId: alice.userId, sql: 'SELECT id FROM wallets WHERE id = $1', params: [alice.walletId] });
    expect(rows).toHaveLength(1);
  });

  it("hides another user's wallet even when the query asks for it directly", async () => {
    const rows = await asActor({ actorId: alice.userId, sql: 'SELECT id FROM wallets WHERE id = $1', params: [bob.walletId] });
    expect(rows).toEqual([]);
  });

  it('returns nothing at all when no actor is set, so a missing scope fails closed', async () => {
    const rows = await asActor({ actorId: null, sql: 'SELECT id FROM wallets', params: [] });
    expect(rows).toEqual([]);
  });

  it('lets staff read every wallet through the staff policy', async () => {
    const [admin] = await DbHelper.query<{ id: string }>({ sql: "SELECT id FROM users WHERE role = 'GLOBAL_ADMIN' LIMIT 1" });
    const rows = await asActor({
      actorId: admin?.id ?? null,
      sql: 'SELECT id FROM wallets WHERE id = ANY($1)',
      params: [[alice.walletId, bob.walletId]]
    });

    expect(rows).toHaveLength(2);
  });
});
