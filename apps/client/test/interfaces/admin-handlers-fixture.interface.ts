import { WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';

import { AdminDashboard } from '../../src/app/core/interfaces/admin/admin-dashboard.interface';
import { AdminUserPage } from '../../src/app/core/interfaces/admin/admin-user-page.interface';
import { AdminUser } from '../../src/app/core/interfaces/admin/admin-user.interface';
import { DashboardStats } from '../../src/app/core/interfaces/admin/dashboard-stats.interface';
import { AdminHandlers } from '../../src/app/features/admin/admin-handlers';

export interface AdminHandlersFixtureDto {
  response: Observable<AdminDashboard>;
  page?: Observable<AdminUserPage>;
  authEnding: boolean;
}

export interface AdminHandlersFixture {
  handlers: AdminHandlers;
  users: WritableSignal<AdminUser[]>;
  loading: WritableSignal<boolean>;
  selected: WritableSignal<AdminUser | null>;
  shownStats: WritableSignal<DashboardStats | null>;
}
