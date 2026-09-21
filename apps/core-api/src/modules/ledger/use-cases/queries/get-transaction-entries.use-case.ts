import { Injectable } from '@nestjs/common';

import { LedgerEntryResponseDto } from '../../dtos/entry/ledger-entry-response.dto';
import { GetTransactionEntriesDto } from '../../dtos/request/get-transaction-entries.dto';
import { LedgerBaseUseCase } from '../base/base-ledger.use-case';

@Injectable()
export class GetTransactionEntriesUseCase extends LedgerBaseUseCase<GetTransactionEntriesDto, LedgerEntryResponseDto[]> {
  async execute ({ id }: GetTransactionEntriesDto): Promise<LedgerEntryResponseDto[]> {
    return this.ledgerEntryRepository.findByTransactionId({ transactionId: id });
  }
}
