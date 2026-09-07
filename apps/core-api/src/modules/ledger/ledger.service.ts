import { Inject, Injectable } from '@nestjs/common';
import { AccountType, Cacheable, CacheEvict, DatabaseAdapter, PaginatedResponseDto, REDIS_CACHE_PROVIDER, RedisCacheProvider, UserRoles } from '@common/libs';

import { CreateLedgerAccountUseCase } from './use-cases/commands/create-ledger-account.use-case';
import { CreateLedgerTransactionUseCase } from './use-cases/commands/create-ledger-transaction.use-case';
import { GetLedgerAccountUseCase } from './use-cases/queries/get-ledger-account.use-case';
import { GetAccountEntriesUseCase } from './use-cases/queries/get-account-entries.use-case';
import { GetTransactionEntriesUseCase } from './use-cases/queries/get-transaction-entries.use-case';
import { LedgerEntryDto } from './dtos/entry/ledger-entry.dto';
import { LedgerEntryResponseDto } from './dtos/entry/ledger-entry-response.dto';
import { LedgerAccountDto } from './dtos/account/ledger-account.dto';
import { GetCreateSystemAccountUseCase } from './use-cases/queries/get-create-system-account.use-case';

@Injectable()
export class LedgerService {
  protected readonly [REDIS_CACHE_PROVIDER]: RedisCacheProvider;
  constructor (
    @Inject(REDIS_CACHE_PROVIDER) protected readonly redisCacheProvider: RedisCacheProvider,
    private readonly createLedgerAccountUseCase: CreateLedgerAccountUseCase,
    private readonly createLedgerTransactionUseCase: CreateLedgerTransactionUseCase,
    private readonly getCreateSystemAccountUseCase: GetCreateSystemAccountUseCase,
    private readonly getLedgerAccountUseCase: GetLedgerAccountUseCase,
    private readonly getAccountEntriesUseCase: GetAccountEntriesUseCase,
    private readonly getTransactionEntriesUseCase: GetTransactionEntriesUseCase
  ) {
    this[REDIS_CACHE_PROVIDER] = redisCacheProvider;
  }

  @Cacheable({ keyPrefix: 'ledger:system', ttlSeconds: 600 })
  async getOrCreateSystemAccount (currency: string, adapter?: DatabaseAdapter): Promise<string> {
    return this.getCreateSystemAccountUseCase.execute({ currency, adapter });
  }

  @CacheEvict({ keyPrefix: ['ledger'], isPattern: true })
  async createAccount (userId: string, accountType: AccountType, currency: string, adapter?: DatabaseAdapter): Promise<LedgerAccountDto> {
    return this.createLedgerAccountUseCase.execute({ userId, accountType, currency, adapter });
  }

  @Cacheable({ keyPrefix: 'ledger:account', ttlSeconds: 300 })
  async getAccount (id: string): Promise<LedgerAccountDto | null> {
    return this.getLedgerAccountUseCase.execute(id);
  }

  @CacheEvict({ keyPrefix: ['ledger', 'wallet:transaction'], isPattern: true })
  async createTransaction (entries: LedgerEntryDto[], adapter?: DatabaseAdapter): Promise<LedgerEntryResponseDto[]> {
    return this.createLedgerTransactionUseCase.execute({ entries, adapter });
  }

  @Cacheable({ keyPrefix: 'ledger:transaction', ttlSeconds: 180 })
  async getTransactionEntries (transactionId: string): Promise<LedgerEntryResponseDto[]> {
    return this.getTransactionEntriesUseCase.execute(transactionId);
  }

  @Cacheable({ keyPrefix: 'ledger:entries', ttlSeconds: 120 })
  async getAccountEntries (accountId: string, page = 1, limit = 25, role?: UserRoles): Promise<PaginatedResponseDto<LedgerEntryResponseDto>> {
    return this.getAccountEntriesUseCase.execute({ accountId, page, limit, role });
  }
}
