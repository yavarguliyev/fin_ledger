import { Injectable } from '@nestjs/common';
import { UserRoles } from '@common/libs';

import { WalletTransactionRepository } from '../../repositories/wallet-transaction.repository';
import { WalletTransactionSummaryDto } from '../../dtos/summary/wallet-transaction-summary.dto';
import { WalletTransactionsBaseUseCase } from '../base/wallet-transactions.base.use-case';

@Injectable()
export class GetWalletTransactionSummaryUseCase extends WalletTransactionsBaseUseCase<string, WalletTransactionSummaryDto> {
  constructor (protected override readonly walletTransactionRepository: WalletTransactionRepository) {
    super(walletTransactionRepository);
  }

  async execute (walletId: string, role?: UserRoles): Promise<WalletTransactionSummaryDto> {
    const isAdmin = role && [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR].includes(role);

    if (isAdmin) {
      return this.walletTransactionRepository.getSummaryAll();
    }

    return this.walletTransactionRepository.getSummaryByWalletId(walletId);
  }
}
