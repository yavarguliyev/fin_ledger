import { CurrencyHelper } from '../../../core/helpers/wallet/currency.helper';
import { StatCard } from '../../../core/interfaces/ui/stat-card.interface';
import { ADMIN_TABLE } from '../../../core/constants/admin/admin-table.constant';
import { DashboardStatsRefDto } from '../../../core/interfaces/admin/dashboard-stats-ref.interface';
import { StatValueDto } from '../../../core/interfaces/admin/stat-value.interface';
import { CurrencyVolumesDto } from '../../../core/interfaces/admin/currency-volumes.interface';

export class StatCardHelper {
  static build ({ stats }: DashboardStatsRefDto): StatCard[] {
    return [
      { label: 'Total Users', icon: '👥', value: StatCardHelper.count({ value: stats?.totalUsers }) },
      { label: 'Active Wallets', icon: '👛', value: StatCardHelper.count({ value: stats?.activeWallets }) },
      { label: ADMIN_TABLE.VOLUME_LABEL, icon: '💰', value: StatCardHelper.volume({ volumes: stats?.volumes ?? [] }) },
      { label: 'Pending', icon: '⏳', value: StatCardHelper.count({ value: stats?.pending }) }
    ];
  }

  private static count ({ value }: StatValueDto): string {
    return value == null ? ADMIN_TABLE.ZERO_COUNT : String(value);
  }

  private static volume ({ volumes }: CurrencyVolumesDto): string {
    if (volumes.length === 0) return ADMIN_TABLE.ZERO_VOLUME;
    return volumes.map(({ currency, amountMinor }) => CurrencyHelper.formatCurrencyCompact({ amountMinor, currency })).join(ADMIN_TABLE.VOLUME_SEPARATOR);
  }
}
