import { Inject } from '@nestjs/common';
import { PostgresService } from '@common/libs';

import { LedgerAccountRepository } from '../../repositories/ledger-account.repository';
import { LedgerEntryRepository } from '../../repositories/ledger-entry.repository';
import { LedgerTransactionRepository } from '../../repositories/ledger-transaction.repository';

export abstract class LedgerBaseUseCase<TInput, TOutput> {
  @Inject(PostgresService)
  protected readonly postgresService!: PostgresService;

  @Inject(LedgerAccountRepository)
  protected readonly ledgerAccountRepository!: LedgerAccountRepository;

  @Inject(LedgerEntryRepository)
  protected readonly ledgerEntryRepository!: LedgerEntryRepository;

  @Inject(LedgerTransactionRepository)
  protected readonly ledgerTransactionRepository!: LedgerTransactionRepository;

  abstract execute(input: TInput): Promise<TOutput>;
}
