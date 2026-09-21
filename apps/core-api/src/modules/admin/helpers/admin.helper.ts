import { WalletStatus } from '@common/libs';

import { AdminStatsDto } from '../dtos/dashboard/admin-stats.dto';
import { BuildAdminStatsDto } from '../dtos/helper/build-admin-stats.dto';

export class AdminHelper {
  static buildStats (params: BuildAdminStatsDto): AdminStatsDto {
    const { users, pending } = params;

    return {
      totalUsers: users.length,
      activeWallets: users.filter(user => user.status === WalletStatus.ACTIVE).length,
      totalVolumeMinor: users.reduce((sum, user) => sum + Number(user.available_balance_minor ?? 0) + Number(user.reserved_balance_minor ?? 0), 0),
      pending
    };
  }
}
