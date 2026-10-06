import { AdminUserPage } from './admin-user-page.interface';
import { DashboardStats } from './dashboard-stats.interface';

export interface AdminDashboard extends AdminUserPage {
  stats: DashboardStats;
}
