import { CurrencyVolume } from './currency-volume.interface';

export interface AdminDashboardBody {
  stats: { volumes: CurrencyVolume[] };
}
