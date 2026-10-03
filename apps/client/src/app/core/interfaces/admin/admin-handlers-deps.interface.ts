import { Signal } from '@angular/core';

import { AdminUser } from './admin-user.interface';
import { DashboardStats } from './dashboard-stats.interface';
import { AdminApiService } from '../../services/admin-api.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

export interface AdminHandlersDeps {
  adminApi: AdminApiService;
  userService: UserService;
  toast: ToastService;
  allUsers: Signal<AdminUser[]>;
  updateUsers: (fn: (users: AdminUser[]) => AdminUser[]) => void;
  setDashboardStats: (stats: DashboardStats) => void;
  setLoading: (loading: boolean) => void;
  setSelectedUser: (user: AdminUser | null) => void;
  isAuthEnding: () => boolean;
}
