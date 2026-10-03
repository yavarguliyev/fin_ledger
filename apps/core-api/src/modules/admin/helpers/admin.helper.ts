import { WalletStatus } from '@common/libs';

import { AdminStatsDto } from '../dtos/dashboard/admin-stats.dto';
import { CurrencyVolumeDto } from '../dtos/dashboard/currency-volume.dto';
import { BuildAdminStatsDto } from '../dtos/helper/build-admin-stats.dto';
import { VolumesByCurrencyDto } from '../dtos/helper/volumes-by-currency.dto';

export class AdminHelper {
  static buildStats (params: BuildAdminStatsDto): AdminStatsDto {
    const { users, pending } = params;

    return {
      totalUsers: users.length,
      activeWallets: users.filter(user => user.status === WalletStatus.ACTIVE).length,
      volumes: AdminHelper.volumesByCurrency({ users }),
      pending
    };
  }

  private static volumesByCurrency ({ users }: VolumesByCurrencyDto): CurrencyVolumeDto[] {
    const totals = new Map<string, number>();

    for (const user of users) {
      if (!user.currency) continue;
      const balance = Number(user.available_balance_minor ?? 0) + Number(user.reserved_balance_minor ?? 0);
      totals.set(user.currency, (totals.get(user.currency) ?? 0) + balance);
    }

    return [...totals]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([currency, amountMinor]) => ({ currency, amountMinor }));
  }
}
