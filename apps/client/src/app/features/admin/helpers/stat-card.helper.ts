import { CurrencyHelper } from '../../../core/helpers/wallet/currency.helper';
import { StatCard } from '../../../core/interfaces/ui/stat-card.interface';
import { ADMIN_TABLE } from '../../../core/constants/admin/admin-table.constant';
import { DashboardStatsRefDto } from '../../../core/dtos/admin/dashboard-stats-ref.dto';
import { StatValueDto } from '../../../core/dtos/admin/stat-value.dto';

export class StatCardHelper {
  static build ({ stats }: DashboardStatsRefDto): StatCard[] {
    const definitions = [
      { label: 'Total Users', icon: '👥', value: stats?.totalUsers },
      { label: 'Active Wallets', icon: '👛', value: stats?.activeWallets },
      { label: ADMIN_TABLE.VOLUME_LABEL, icon: '💰', value: stats?.totalVolumeMinor },
      { label: 'Pending', icon: '⏳', value: stats?.pending }
    ];

    return definitions.map(({ label, icon, value }) => ({ label, icon, value: StatCardHelper.value({ label, value }) }));
  }

  private static value ({ label, value }: StatValueDto): string {
    const isVolume = label === ADMIN_TABLE.VOLUME_LABEL;
    if (value == null) return isVolume ? ADMIN_TABLE.ZERO_VOLUME : ADMIN_TABLE.ZERO_COUNT;
    return isVolume ? CurrencyHelper.formatCurrencyCompact({ amountMinor: value }) : String(value);
  }
}
