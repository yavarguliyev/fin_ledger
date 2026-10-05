import { CurrencyHelper } from '../../../core/helpers/wallet/currency.helper';
import { StatCard } from '../../../core/interfaces/ui/stat-card.interface';
import { ADMIN_TABLE } from '../../../core/constants/admin/admin-table.constant';
import { VOLUME_CURRENCY } from '../../../core/constants/admin/volume-currency.constant';
import { StatCardsInputDto } from '../../../core/interfaces/admin/stat-cards-input.interface';
import { StatValueDto } from '../../../core/interfaces/admin/stat-value.interface';
import { VolumeChoiceDto } from '../../../core/interfaces/admin/volume-choice.interface';

export class StatCardHelper {
  static build ({ stats, currency }: StatCardsInputDto): StatCard[] {
    return [
      { label: 'Total Users', icon: '👥', value: StatCardHelper.count({ value: stats?.totalUsers }) },
      { label: 'Active Wallets', icon: '👛', value: StatCardHelper.count({ value: stats?.activeWallets }) },
      StatCardHelper.volume({ volumes: stats?.volumes ?? [], currency }),
      { label: 'Pending', icon: '⏳', value: StatCardHelper.count({ value: stats?.pending }) }
    ];
  }

  private static count ({ value }: StatValueDto): string {
    return value == null ? ADMIN_TABLE.ZERO_COUNT : String(value);
  }

  private static volume ({ volumes, currency }: VolumeChoiceDto): StatCard {
    const card = { label: ADMIN_TABLE.VOLUME_LABEL, icon: VOLUME_CURRENCY.ICON };
    const ranked = [...volumes].sort((a, b) => b.amountMinor - a.amountMinor);
    const shown = ranked.find(volume => volume.currency === currency) ?? ranked[0];
    if (!shown) return { ...card, value: ADMIN_TABLE.ZERO_VOLUME };

    return {
      ...card,
      value: CurrencyHelper.formatCurrencyCompact({ amountMinor: shown.amountMinor, currency: shown.currency }),
      ...(ranked.length > 1 && { choices: ranked.map(({ currency: key }) => ({ key, label: key, active: key === shown.currency })) })
    };
  }
}
