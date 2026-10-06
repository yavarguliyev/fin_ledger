import { Injectable } from '@nestjs/common';

import { ListWalletTransactionsDto } from '../../dtos/input/list-wallet-transactions.dto';
import { WalletOverviewResponseDto } from '../../dtos/response/wallet-overview-response.dto';
import { GetWalletTransactionsUseCase } from './get-wallet-transactions.use-case';
import { GetWalletTransactionSummaryUseCase } from './get-wallet-transaction-summary.use-case';

@Injectable()
export class GetWalletOverviewUseCase {
  constructor (
    private readonly getTransactions: GetWalletTransactionsUseCase,
    private readonly getSummary: GetWalletTransactionSummaryUseCase
  ) {}

  async execute (dto: ListWalletTransactionsDto): Promise<WalletOverviewResponseDto> {
    const { walletId, role } = dto;
    const [summary, recent] = await Promise.all([this.getSummary.execute({ walletId, ...(role && { role }) }), this.getTransactions.execute(dto)]);
    return { summary, recent };
  }
}
