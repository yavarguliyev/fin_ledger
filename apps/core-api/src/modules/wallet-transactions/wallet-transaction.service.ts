import { Inject, Injectable } from '@nestjs/common';
import { Cacheable, PaginatedResponseDto, REDIS_CACHE_PROVIDER, RedisCacheProvider, WalletTransactionType } from '@common/libs';

import { GetWalletTransactionsUseCase } from './use-cases/queries/get-wallet-transactions.use-case';
import { GetWalletTransactionSummaryUseCase } from './use-cases/queries/get-wallet-transaction-summary.use-case';
import { WalletTransactionRecordDto } from './dtos/transaction/wallet-transaction-record.dto';
import { WalletTransactionSummaryDto } from './dtos/summary/wallet-transaction-summary.dto';
import { ListWalletTransactionsDto } from './dtos/input/list-wallet-transactions.dto';
import { GetWalletSummaryDto } from './dtos/input/get-wallet-summary.dto';

@Injectable()
export class WalletTransactionService {
  protected readonly [REDIS_CACHE_PROVIDER]: RedisCacheProvider;

  constructor (
    @Inject(REDIS_CACHE_PROVIDER) protected readonly redisCacheProvider: RedisCacheProvider,
    private readonly getWalletTransactionsUseCase: GetWalletTransactionsUseCase,
    private readonly getWalletTransactionSummaryUseCase: GetWalletTransactionSummaryUseCase
  ) {
    this[REDIS_CACHE_PROVIDER] = redisCacheProvider;
  }

  @Cacheable({ keyPrefix: 'wallet:transaction', ttlSeconds: 60 })
  async getWalletTransactions (dto: ListWalletTransactionsDto): Promise<PaginatedResponseDto<WalletTransactionRecordDto>> {
    return this.getWalletTransactionsUseCase.execute(dto);
  }

  @Cacheable({ keyPrefix: 'wallet:transaction:bets', ttlSeconds: 30 })
  async getWalletBets (dto: ListWalletTransactionsDto): Promise<PaginatedResponseDto<WalletTransactionRecordDto>> {
    return this.getWalletTransactionsUseCase.execute({ ...dto, type: WalletTransactionType.BET_STAKE });
  }

  @Cacheable({ keyPrefix: 'wallet:transaction:summary', ttlSeconds: 60 })
  async getWalletTransactionSummary (dto: GetWalletSummaryDto): Promise<WalletTransactionSummaryDto[]> {
    return this.getWalletTransactionSummaryUseCase.execute(dto);
  }
}
