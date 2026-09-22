import { AdminStats } from './admin-stats.interface';
import { UserWithWallet } from './user-with-wallet.interface';

export interface AdminDashboard {
  stats: AdminStats;
  users: UserWithWallet[];
}
