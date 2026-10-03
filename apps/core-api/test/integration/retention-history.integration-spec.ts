import { RETENTION } from '../../src/modules/retention/constants/retention.constant';

import { DbHelper } from '../helpers/db.helper';
import { RETENTION_HISTORY_TEST as T } from '../constants/retention-history.constant';
import { IdRow, PrivilegeRow, SeedLogin, SeedNotification } from '../interfaces/retention-history.interface';

let userId = '';

const seedNotification = async ({ status, ageDays }: SeedNotification): Promise<string> =>
  (await DbHelper.query<IdRow>({ sql: T.NOTIFICATION_SQL, params: [userId, status, ageDays] }))[0]?.id ?? '';

const seedLogin = async ({ ageDays }: SeedLogin): Promise<string> =>
  (await DbHelper.query<IdRow>({ sql: T.LOGIN_SQL, params: [userId, ageDays] }))[0]?.id ?? '';

beforeAll(async () => {
  userId = (await DbHelper.query<IdRow>({ sql: T.ANY_USER_SQL }))[0]?.id ?? '';
});

afterAll(async () => DbHelper.close());

describe('Retention of notifications and login history', () => {
  it('removes read notifications past the window, keeping recent ones and anything unread', async () => {
    const oldRead = await seedNotification({ status: T.READ, ageDays: T.NOTIFICATION_DAYS + T.PAST_WINDOW_DAYS });
    const oldUnread = await seedNotification({ status: T.UNREAD, ageDays: T.NOTIFICATION_DAYS + T.PAST_WINDOW_DAYS });
    const recentRead = await seedNotification({ status: T.READ, ageDays: T.NOTIFICATION_DAYS - T.PAST_WINDOW_DAYS });

    await DbHelper.query({ sql: RETENTION.DELETE_NOTIFICATIONS_SQL, params: [T.NOTIFICATION_DAYS] });
    const kept = await DbHelper.query<IdRow>({ sql: T.EXISTS_NOTIFICATIONS_SQL, params: [[oldRead, oldUnread, recentRead]] });

    expect(kept.map(row => row.id).sort()).toEqual([oldUnread, recentRead].sort());
  });

  it('removes login events past the window and keeps the recent ones', async () => {
    const old = await seedLogin({ ageDays: T.LOGIN_EVENT_DAYS + T.PAST_WINDOW_DAYS });
    const recent = await seedLogin({ ageDays: T.LOGIN_EVENT_DAYS - T.PAST_WINDOW_DAYS });

    await DbHelper.query({ sql: RETENTION.DELETE_LOGIN_EVENTS_SQL, params: [T.LOGIN_EVENT_DAYS] });

    await expect(DbHelper.query<IdRow>({ sql: T.EXISTS_LOGINS_SQL, params: [[old, recent]] })).resolves.toEqual([{ id: recent }]);
  });

  it.each(T.TABLES)('lets the worker prune %s', async table => {
    await expect(DbHelper.query<PrivilegeRow>({ sql: T.PRIVILEGE_SQL, params: [T.WORKER_ROLE, table, T.DELETE] })).resolves.toEqual([
      { allowed: true }
    ]);
  });
});
