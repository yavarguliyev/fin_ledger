import { Injectable } from '@nestjs/common';

import { AdminBaseUseCase } from '../base/admin-base.use-case';
import { AdminHelper } from '../../helpers/admin.helper';
import { AdminDashboardDto } from '../../dtos/dashboard/admin-dashboard.dto';

@Injectable()
export class GetAdminDashboardUseCase extends AdminBaseUseCase<void, AdminDashboardDto> {
  async execute (): Promise<AdminDashboardDto> {
    const [users, pending] = await Promise.all([this.userRepository.findAllWithWallets(), this.walletTransactionRepository.countPending()]);
    return { stats: AdminHelper.buildStats({ users, pending }), users };
  }
}
