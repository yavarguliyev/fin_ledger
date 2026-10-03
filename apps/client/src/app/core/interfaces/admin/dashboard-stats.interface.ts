import { CurrencyVolume } from './currency-volume.interface';

export interface DashboardStats {
  totalUsers: number;
  activeWallets: number;
  volumes: CurrencyVolume[];
  pending: number;
}
