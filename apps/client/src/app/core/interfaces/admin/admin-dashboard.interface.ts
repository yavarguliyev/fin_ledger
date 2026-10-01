import { DashboardStats } from './dashboard-stats.interface';
import { UserWithWallet } from './user-with-wallet.interface';

export interface AdminDashboard {
  stats: DashboardStats;
  users: UserWithWallet[];
}
