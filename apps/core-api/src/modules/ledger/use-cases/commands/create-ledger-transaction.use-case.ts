import { Injectable } from '@nestjs/common';
import { PostgresService } from '@common/libs';

import { LedgerEntryRepository } from '../../repositories/ledger-entry.repository';
import { LedgerAccountRepository } from '../../repositories/ledger-account.repository';
import { LedgerEntry } from '../../dtos/entry/ledger-entry.dto';
import { LedgerEntryResponseDto } from '../../dtos/entry/ledger-entry-response.dto';
import { LedgerBaseUseCase } from '../base/base-ledger.use-case';
import { executeInTx } from '../../helpers/create-ledger-transaction.helper';

@Injectable()
export class CreateLedgerTransactionUseCase extends LedgerBaseUseCase<LedgerEntry, LedgerEntryResponseDto[]> {
  constructor (
    private readonly postgresService: PostgresService,
    private readonly entryRepository: LedgerEntryRepository,
    private readonly accountRepository: LedgerAccountRepository
  ) {
    super();
  }

  async execute ({ entries, adapter }: LedgerEntry): Promise<LedgerEntryResponseDto[]> {
    if (adapter) return executeInTx({ entries, entryRepository: this.entryRepository, accountRepository: this.accountRepository, tx: adapter });
    return this.postgresService
      .getWriteConnection()
      .transaction(tx => executeInTx({ entries, entryRepository: this.entryRepository, accountRepository: this.accountRepository, tx }));
  }
}
