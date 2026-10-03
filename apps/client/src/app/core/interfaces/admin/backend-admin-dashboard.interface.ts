import { BackendUserWithWallet } from './backend-user-with-wallet.interface';
import { DashboardStats } from './dashboard-stats.interface';

export interface BackendAdminDashboard {
  stats: DashboardStats;
  users: BackendUserWithWallet[];
}
