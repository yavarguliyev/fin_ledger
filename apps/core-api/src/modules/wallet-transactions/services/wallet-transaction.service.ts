import { Injectable } from '@nestjs/common';
import { PaginatedResponseDto, WalletTransactionType } from '@common/libs';

import { WalletTransactionRecordDto, WalletTransactionSummaryDto } from '../../wallet';
import { GetWalletTransactionsUseCase } from '../use-cases/queries/get-wallet-transactions.use-case';
import { GetWalletTransactionSummaryUseCase } from '../use-cases/queries/get-wallet-transaction-summary.use-case';
import { GetWalletOverviewUseCase } from '../use-cases/queries/get-wallet-overview.use-case';
import { WalletOverviewResponseDto } from '../dtos/response/wallet-overview-response.dto';
import { ListWalletTransactionsDto } from '../dtos/input/list-wallet-transactions.dto';
import { GetWalletSummaryDto } from '../dtos/input/get-wallet-summary.dto';

@Injectable()
export class WalletTransactionService {
  constructor (
    private readonly getWalletTransactionsUseCase: GetWalletTransactionsUseCase,
    private readonly getWalletTransactionSummaryUseCase: GetWalletTransactionSummaryUseCase,
    private readonly getWalletOverviewUseCase: GetWalletOverviewUseCase
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

  async getWalletOverview (dto: ListWalletTransactionsDto): Promise<WalletOverviewResponseDto> {
    return this.getWalletOverviewUseCase.execute(dto);
  }
}
