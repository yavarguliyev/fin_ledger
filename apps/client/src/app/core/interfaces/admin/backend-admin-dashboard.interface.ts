import { BackendUserWithWallet } from './backend-user-with-wallet.interface';

export interface BackendAdminDashboard {
  stats: { totalUsers: number; activeWallets: number; totalVolumeMinor: number; pending: number };
  users: BackendUserWithWallet[];
}
