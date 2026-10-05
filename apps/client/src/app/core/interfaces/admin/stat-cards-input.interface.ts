import { DashboardStats } from './dashboard-stats.interface';

export interface StatCardsInputDto {
  stats: DashboardStats | null;
  currency: string | null;
}
