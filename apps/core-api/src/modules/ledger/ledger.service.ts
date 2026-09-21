import { Inject, Injectable } from '@nestjs/common';
import { Cacheable, CacheEvict, PaginatedResponseDto, REDIS_CACHE_PROVIDER, RedisCacheProvider } from '@common/libs';

import { CreateLedgerAccountUseCase } from './use-cases/commands/create-ledger-account.use-case';
import { CreateLedgerTransactionUseCase } from './use-cases/commands/create-ledger-transaction.use-case';
import { GetLedgerAccountUseCase } from './use-cases/queries/get-ledger-account.use-case';
import { GetAccountEntriesUseCase } from './use-cases/queries/get-account-entries.use-case';
import { GetTransactionEntriesUseCase } from './use-cases/queries/get-transaction-entries.use-case';
import { GetSystemAccountUseCase } from './use-cases/queries/get-system-account.use-case';
import { LedgerAccountDto } from './dtos/account/ledger-account.dto';
import { LedgerEntryResponseDto } from './dtos/entry/ledger-entry-response.dto';
import { CreateLedgerAccountDto } from './dtos/input/create-ledger-account.dto';
import { CreateLedgerTransactionDto } from './dtos/input/create-ledger-transaction.dto';
import { GetSystemAccountDto } from './dtos/input/get-system-account.dto';
import { ListAccountEntriesDto } from './dtos/input/list-account-entries.dto';
import { GetLedgerAccountDto } from './dtos/request/get-ledger-account.dto';
import { GetTransactionEntriesDto } from './dtos/request/get-transaction-entries.dto';

@Injectable()
export class LedgerService {
  protected readonly [REDIS_CACHE_PROVIDER]: RedisCacheProvider;
  constructor (
    @Inject(REDIS_CACHE_PROVIDER) protected readonly redisCacheProvider: RedisCacheProvider,
    private readonly createLedgerAccountUseCase: CreateLedgerAccountUseCase,
    private readonly createLedgerTransactionUseCase: CreateLedgerTransactionUseCase,
    private readonly getSystemAccountUseCase: GetSystemAccountUseCase,
    private readonly getLedgerAccountUseCase: GetLedgerAccountUseCase,
    private readonly getAccountEntriesUseCase: GetAccountEntriesUseCase,
    private readonly getTransactionEntriesUseCase: GetTransactionEntriesUseCase
  ) {
    this[REDIS_CACHE_PROVIDER] = redisCacheProvider;
  }

  @Cacheable({ keyPrefix: 'ledger:system', ttlSeconds: 600 })
  async getSystemAccount (dto: GetSystemAccountDto): Promise<string> {
    return this.getSystemAccountUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['ledger'], isPattern: true })
  async createAccount (dto: CreateLedgerAccountDto): Promise<LedgerAccountDto> {
    return this.createLedgerAccountUseCase.execute(dto);
  }

  @Cacheable({ keyPrefix: 'ledger:account', ttlSeconds: 300 })
  async getAccount (dto: GetLedgerAccountDto): Promise<LedgerAccountDto | null> {
    return this.getLedgerAccountUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['ledger', 'wallet:transaction'], isPattern: true })
  async createTransaction (dto: CreateLedgerTransactionDto): Promise<LedgerEntryResponseDto[]> {
    return this.createLedgerTransactionUseCase.execute(dto);
  }

  @Cacheable({ keyPrefix: 'ledger:transaction', ttlSeconds: 180 })
  async getTransactionEntries (dto: GetTransactionEntriesDto): Promise<LedgerEntryResponseDto[]> {
    return this.getTransactionEntriesUseCase.execute(dto);
  }

  @Cacheable({ keyPrefix: 'ledger:entries', ttlSeconds: 120 })
  async getAccountEntries (dto: ListAccountEntriesDto): Promise<PaginatedResponseDto<LedgerEntryResponseDto>> {
    return this.getAccountEntriesUseCase.execute(dto);
  }
}
