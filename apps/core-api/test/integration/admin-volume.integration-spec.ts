import { CacheResetHelper } from '../helpers/cache-reset.helper';
import { CACHE_RESET } from '../constants/cache-reset.constant';
import { ADMIN_VOLUME_TEST as T } from '../constants/admin-volume.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { AdminDashboardBody } from '../interfaces/admin-dashboard-body.interface';
import { CurrencyVolume } from '../interfaces/currency-volume.interface';

describe('Admin dashboard volume', () => {
  let admin: string;

  beforeAll(async () => {
    await TestUserHelper.ensure({ emails: [T.OWNER_EMAIL] });
    const owner = await ApiHelper.login({ email: T.OWNER_EMAIL });
    await ApiHelper.request({ method: 'POST', path: T.WALLETS_PATH, token: owner, body: { currency: T.CURRENCY } });
    admin = await ApiHelper.login({ email: T.ADMIN_EMAIL });
  });

  afterAll(async () => DbHelper.close());

  it('totals balances per currency instead of adding different currencies together', async () => {
    await CacheResetHelper.clear({ pattern: CACHE_RESET.ADMIN_DASHBOARD_PATTERN });
    const dashboard = await ApiHelper.request<AdminDashboardBody>({ method: 'GET', path: T.DASHBOARD_PATH, token: admin });
    const expected = await DbHelper.query<CurrencyVolume>({ sql: T.VOLUMES_SQL, params: [T.PLAYER_ROLE] });

    expect(dashboard.status).toBe(T.OK);
    expect(dashboard.body?.stats.volumes).toEqual(expected);
    expect(expected.map(volume => volume.currency)).toContain(T.CURRENCY);
    expect(expected.length).toBeGreaterThan(1);
  });
});
