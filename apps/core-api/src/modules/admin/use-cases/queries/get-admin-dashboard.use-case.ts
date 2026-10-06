import { Injectable } from '@nestjs/common';

import { AdminBaseUseCase } from '../base/admin-base.use-case';
import { AdminDashboardDto } from '../../dtos/dashboard/admin-dashboard.dto';

@Injectable()
export class GetAdminDashboardUseCase extends AdminBaseUseCase<void, AdminDashboardDto> {
  async execute (): Promise<AdminDashboardDto> {
    const [totals, volumes, pending] = await Promise.all([
      this.userRepository.playerTotals(),
      this.userRepository.playerVolumes(),
      this.walletTransactionRepository.countPending()
    ]);
    return { stats: { ...totals, volumes, pending } };
  }
}
