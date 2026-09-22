import { Injectable } from '@nestjs/common';
import { PaginatedResponseDto, WalletTransactionType } from '@common/libs';

import { GetWalletTransactionsUseCase } from './use-cases/queries/get-wallet-transactions.use-case';
import { GetWalletTransactionSummaryUseCase } from './use-cases/queries/get-wallet-transaction-summary.use-case';
import { WalletTransactionRecordDto } from './dtos/transaction/wallet-transaction-record.dto';
import { WalletTransactionSummaryDto } from './dtos/summary/wallet-transaction-summary.dto';
import { ListWalletTransactionsDto } from './dtos/input/list-wallet-transactions.dto';
import { GetWalletSummaryDto } from './dtos/input/get-wallet-summary.dto';

@Injectable()
export class WalletTransactionService {
  constructor (
    private readonly getWalletTransactionsUseCase: GetWalletTransactionsUseCase,
    private readonly getWalletTransactionSummaryUseCase: GetWalletTransactionSummaryUseCase
  ) {}

  async getWalletTransactions (dto: ListWalletTransactionsDto): Promise<PaginatedResponseDto<WalletTransactionRecordDto>> {
    return this.getWalletTransactionsUseCase.execute(dto);
  }

  async getWalletBets (dto: ListWalletTransactionsDto): Promise<PaginatedResponseDto<WalletTransactionRecordDto>> {
    return this.getWalletTransactionsUseCase.execute({ ...dto, type: WalletTransactionType.BET_STAKE });
  }

  async getWalletTransactionSummary (dto: GetWalletSummaryDto): Promise<WalletTransactionSummaryDto[]> {
    return this.getWalletTransactionSummaryUseCase.execute(dto);
  }
}
