import { Injectable } from '@nestjs/common';

import { AdminBaseUseCase } from '../base/admin-base.use-case';
import { AdminDashboardDto } from '../../dtos/admin-dashboard.dto';
import { UserRepository } from '../../../user/repositories/user.repository';
import { WalletTransactionRepository } from '../../../wallet-transactions/repositories/wallet-transaction.repository';

@Injectable()
export class GetAdminDashboardUseCase extends AdminBaseUseCase<void, AdminDashboardDto> {
  constructor (
    protected override readonly userRepository: UserRepository,
    protected override readonly walletTransactionRepository: WalletTransactionRepository
  ) {
    super(userRepository, walletTransactionRepository);
  }

  async execute (): Promise<AdminDashboardDto> {
    const [users, pendingTransactions] = await Promise.all([
      this.userRepository.findAllWithWallets(),
      this.walletTransactionRepository.countPending()
    ]);

    const totalUsers = users.length;
    const activeWallets = users.filter(u => u.status === 'ACTIVE').length;
    const totalVolumeMinor = users.reduce((sum, u) => {
      const available = Number(u.available_balance_minor ?? 0);
      const reserved = Number(u.reserved_balance_minor ?? 0);
      return sum + available + reserved;
    }, 0);

    return { stats: { totalUsers, activeWallets, totalVolumeMinor, pending: pendingTransactions }, users };
  }
}
