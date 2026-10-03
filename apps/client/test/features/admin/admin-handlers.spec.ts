import { signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { HttpRequestError } from '../../../src/app/core/errors/http-request.error';
import { AdminDashboard } from '../../../src/app/core/interfaces/admin/admin-dashboard.interface';
import { AdminUser } from '../../../src/app/core/interfaces/admin/admin-user.interface';
import { DashboardStats } from '../../../src/app/core/interfaces/admin/dashboard-stats.interface';
import { AdminHandlers } from '../../../src/app/features/admin/admin-handlers';
import { ADMIN_HANDLERS_TEST as T } from '../../constants/admin-handlers.constant';
import { aToast, aUserService, anAdminApi } from '../../fakes/admin.fake';
import { AdminHandlersFixture, AdminHandlersFixtureDto } from '../../interfaces/admin-handlers-fixture.interface';

const stats: DashboardStats = { totalUsers: 1, activeWallets: 1, pending: 0, volumes: [] };
const dashboard: AdminDashboard = {
  stats,
  users: [
    {
      id: T.USER_ID,
      email: T.EMAIL,
      displayName: T.NAME,
      createdAt: T.CREATED_AT,
      role: T.ROLE,
      userStatus: T.ACTIVE,
      walletId: T.WALLET_ID,
      isEmailVerified: true,
      deletedAt: null,
      currency: T.CURRENCY,
      status: T.ACTIVE,
      availableBalanceMinor: T.AVAILABLE_MINOR,
      reservedBalanceMinor: T.RESERVED_MINOR
    }
  ]
};

const build = ({ response, authEnding }: AdminHandlersFixtureDto): AdminHandlersFixture => {
  const users = signal<AdminUser[]>([]);
  const loading = signal(true);
  const selected = signal<AdminUser | null>(null);
  const shownStats = signal<DashboardStats | null>(null);
  const handlers = new AdminHandlers({
    adminApi: anAdminApi({ dashboard: response }),
    userService: aUserService(),
    toast: aToast(),
    allUsers: users,
    updateUsers: users.update.bind(users),
    setDashboardStats: shownStats.set.bind(shownStats),
    setLoading: loading.set.bind(loading),
    setSelectedUser: selected.set.bind(selected),
    isAuthEnding: (): boolean => authEnding
  });
  return { handlers, users, loading, selected, shownStats };
};

const failure = (): Observable<AdminDashboard> => throwError(() => new HttpRequestError({ message: T.MESSAGE, status: T.STATUS }));

describe('Admin handlers', () => {
  it('loads the dashboard into the users and stats it was given', () => {
    const { handlers, users, loading, shownStats } = build({ response: of(dashboard), authEnding: false });
    handlers.loadDashboardData();

    expect(users()[0]?.balance).toBe(T.BALANCE_MINOR);
    expect(shownStats()).toEqual(stats);
    expect(loading()).toBe(false);
    expect(handlers.failed()).toBe(false);
  });

  it('selects only a user that is in the list', () => {
    const { handlers, selected } = build({ response: of(dashboard), authEnding: false });
    handlers.loadDashboardData();
    handlers.onView({ userId: T.OTHER_ID });

    expect(selected()).toBeNull();

    handlers.onView({ userId: T.USER_ID });

    expect(selected()?.email).toBe(T.EMAIL);
  });

  it('reports a failed load as an error unless the session is ending', () => {
    const live = build({ response: failure(), authEnding: false });
    live.handlers.loadDashboardData();

    expect(live.handlers.failed()).toBe(true);
    expect(live.loading()).toBe(false);

    const ending = build({ response: failure(), authEnding: true });
    ending.handlers.loadDashboardData();

    expect(ending.handlers.failed()).toBe(false);
    expect(ending.loading()).toBe(false);
  });
});
