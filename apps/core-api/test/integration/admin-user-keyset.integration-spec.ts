import { ADMIN_USER_KEYSET_TEST as T } from '../constants/admin-user-keyset.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import {
  AdminStatsBody,
  AdminUserPageCursor,
  AdminUserPageQuery,
  AdminUserPageRow,
  PlayerCountRow,
  PlayerIdRow
} from '../interfaces/admin-user-page.interface';

let admin: string = T.EMPTY;

const page = ({ query }: AdminUserPageQuery): ReturnType<typeof ApiHelper.request<AdminUserPageRow[]>> =>
  ApiHelper.request<AdminUserPageRow[]>({ path: `${T.USERS_PATH}${T.QUERY_SEPARATOR}${new URLSearchParams(query).toString()}`, token: admin });

const cursorAfter = ({ row }: AdminUserPageCursor): Record<string, string> => ({
  limit: String(T.PAGE),
  before: row?.created_at ?? T.EMPTY,
  beforeId: row?.id ?? T.EMPTY
});

beforeAll(async () => {
  admin = await ApiHelper.login({ email: T.ADMIN_EMAIL });
});

afterAll(async () => DbHelper.close());

describe('Admin user list paged by cursor', () => {
  it('walks every player newest first, keeping each player and their wallets on one page', async () => {
    const ids: string[] = [];
    let response = await page({ query: { limit: String(T.PAGE) } });

    while (response.body.length > 0) {
      expect(response.status).toBe(T.OK);
      const pageIds = [...new Set(response.body.map(row => row.id))];
      expect(pageIds.length).toBeLessThanOrEqual(T.PAGE);
      ids.push(...pageIds);
      response = await page({ query: cursorAfter({ row: response.body.at(-1) }) });
    }

    const expected = await DbHelper.query<PlayerIdRow>({ sql: T.PLAYER_IDS_SQL });
    expect(ids).toEqual(expected.map(row => row.id));
  });

  it('refuses half a cursor', async () => {
    await expect(page({ query: { before: new Date().toISOString() } })).resolves.toMatchObject({ status: T.BAD_REQUEST });
  });

  it('counts players and active wallets in SQL for the dashboard stats', async () => {
    const dashboard = await ApiHelper.request<AdminStatsBody>({ path: T.DASHBOARD_PATH, token: admin });
    const [counts] = await DbHelper.query<PlayerCountRow>({ sql: T.COUNTS_SQL });

    expect(dashboard.body?.stats).toMatchObject({ totalUsers: counts?.total, activeWallets: counts?.active });
  });
});
