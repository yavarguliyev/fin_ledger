import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { LedgerEntryResponseDto } from '../../dtos/entry/ledger-entry-response.dto';
import { CreateLedgerTransactionDto } from '../../dtos/input/create-ledger-transaction.dto';
import { PostLedgerTransactionDto } from '../../dtos/step/post-ledger-transaction.dto';
import { LedgerBaseUseCase } from '../base/base-ledger.use-case';

@Injectable()
export class CreateLedgerTransactionUseCase extends LedgerBaseUseCase<CreateLedgerTransactionDto, LedgerEntryResponseDto[]> {
  async execute (dto: CreateLedgerTransactionDto): Promise<LedgerEntryResponseDto[]> {
    const { adapter } = dto;
    if (adapter) return this.post({ ...dto, adapter });
    return this.postgresService.getWriteConnection().transaction({ callback: tx => this.post({ ...dto, adapter: tx }) });
  }

  private async post (dto: PostLedgerTransactionDto): Promise<LedgerEntryResponseDto[]> {
    const { entries, transaction, adapter } = dto;

    const existing = await this.ledgerTransactionRepository.findByIdempotencyKey({ idempotencyKey: transaction.idempotencyKey, adapter });
    if (existing) return this.ledgerEntryRepository.findByTransactionId({ transactionId: existing.id, adapter });

    const created = await this.ledgerTransactionRepository.createTransaction({ ...transaction, adapter });
    if (!created) throw new InternalServerErrorException('Failed to create ledger transaction');

    return this.ledgerEntryRepository.createBalancedEntries({ entries, transactionId: created.id, adapter });
  }
}
