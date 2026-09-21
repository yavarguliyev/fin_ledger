import { Injectable } from '@nestjs/common';
import { STAFF_ROLES } from '@common/libs';

import { WalletTransactionSummaryDto } from '../../dtos/summary/wallet-transaction-summary.dto';
import { GetWalletSummaryDto } from '../../dtos/input/get-wallet-summary.dto';
import { WalletTransactionsBaseUseCase } from '../base/wallet-transactions.base.use-case';

@Injectable()
export class GetWalletTransactionSummaryUseCase extends WalletTransactionsBaseUseCase<GetWalletSummaryDto, WalletTransactionSummaryDto[]> {
  async execute ({ walletId, role }: GetWalletSummaryDto): Promise<WalletTransactionSummaryDto[]> {
    const isStaff = role && STAFF_ROLES.includes(role);
    return this.walletTransactionRepository.getSummary({ ...(!isStaff && { walletId }) });
  }
}
