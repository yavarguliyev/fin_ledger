import { Injectable } from '@nestjs/common';

import { LedgerEntryRepository } from '../../repositories/ledger-entry.repository';
import { LedgerEntryResponseDto } from '../../dtos/entry/ledger-entry-response.dto';
import { LedgerBaseUseCase } from '../base/base-ledger.use-case';

@Injectable()
export class GetTransactionEntriesUseCase extends LedgerBaseUseCase<string, LedgerEntryResponseDto[]> {
  constructor (private readonly ledgerEntryRepository: LedgerEntryRepository) {
    super();
  }

  async execute (transactionId: string): Promise<LedgerEntryResponseDto[]> {
    return this.ledgerEntryRepository.findByTransactionId(transactionId);
  }
}
