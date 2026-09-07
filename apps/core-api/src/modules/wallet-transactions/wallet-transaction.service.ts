import { Inject, Injectable } from '@nestjs/common';
import { Cacheable, PaginatedResponseDto, REDIS_CACHE_PROVIDER, RedisCacheProvider, WalletTransactionType, UserRoles } from '@common/libs';

import { GetWalletTransactionsUseCase } from './use-cases/queries/get-wallet-transactions.use-case';
import { GetWalletTransactionSummaryUseCase } from './use-cases/queries/get-wallet-transaction-summary.use-case';
import { WalletTransactionRecordDto } from './dtos/transaction/wallet-transaction-record.dto';
import { WalletTransactionSummaryDto } from './dtos/summary/wallet-transaction-summary.dto';
import { WalletPaginatedRequestDto } from './dtos/common/wallet-transaction-paginated-request.dto';

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
  async getWalletTransactions (query: WalletPaginatedRequestDto, role: UserRoles): Promise<PaginatedResponseDto<WalletTransactionRecordDto>> {
    return this.getWalletTransactionsUseCase.execute({ query, role });
  }

  @Cacheable({ keyPrefix: 'wallet:transaction:bets', ttlSeconds: 30 })
  async getWalletBets (query: WalletPaginatedRequestDto, role: UserRoles): Promise<PaginatedResponseDto<WalletTransactionRecordDto>> {
    return this.getWalletTransactionsUseCase.execute({ query, type: WalletTransactionType.BET, role });
  }

  @Cacheable({ keyPrefix: 'wallet:transaction:summary', ttlSeconds: 60 })
  async getWalletTransactionSummary (walletId: string, role: UserRoles): Promise<WalletTransactionSummaryDto> {
    return this.getWalletTransactionSummaryUseCase.execute(walletId, role);
  }
}
