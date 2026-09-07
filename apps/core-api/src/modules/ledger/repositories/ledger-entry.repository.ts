import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BaseRepository, PostgresService, DatabaseAdapter, WalletTransactionType } from '@common/libs';

import { LedgerEntryDto } from '../dtos/entry/ledger-entry.dto';
import { LedgerEntryResponseDto } from '../dtos/entry/ledger-entry-response.dto';

@Injectable()
export class LedgerEntryRepository extends BaseRepository<LedgerEntryResponseDto> {
  constructor (postgresService: PostgresService) {
    super(postgresService, 'ledger_entries', {
      transactionId: 'transaction_id',
      accountId: 'account_id',
      entryType: 'entry_type',
      amountMinor: 'amount_minor',
      createdAt: 'created_at'
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'transactionId', 'accountId', 'entryType', 'amountMinor', 'currency', 'description', 'reference', 'sequence', 'createdAt'];
  }

  async createBalancedEntries (entries: LedgerEntryDto[], adapter?: DatabaseAdapter): Promise<LedgerEntryResponseDto[]> {
    const totals = new Map<string, { debit: number; credit: number }>();

    for (const entry of entries) {
      const total = totals.get(entry.currency) ?? { debit: 0, credit: 0 };
      if (entry.entryType === WalletTransactionType.DEBIT) total.debit += entry.amountMinor;
      else total.credit += entry.amountMinor;
      totals.set(entry.currency, total);
    }

    for (const total of totals.values()) {
      if (total.debit !== total.credit) throw new BadRequestException('Ledger entries are not balanced');
    }

    const transactionId = randomUUID();
    const created: LedgerEntryResponseDto[] = [];

    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      if (!entry) continue;

      const row = await this.create(
        {
          transactionId,
          accountId: entry.accountId,
          entryType: entry.entryType,
          amountMinor: entry.amountMinor,
          currency: entry.currency,
          description: entry.description,
          ...(entry.reference && { reference: entry.reference }),
          sequence: index + 1
        },
        undefined,
        adapter
      );

      if (row) created.push(row);
    }

    return created;
  }

  async findByTransactionId (transactionId: string): Promise<LedgerEntryResponseDto[]> {
    return this.findAll({ where: { transaction_id: transactionId }, orderBy: 'sequence', orderDirection: 'ASC' });
  }

  async findByAccountIdPaginated (accountId: string, limit: number, offset: number): Promise<LedgerEntryResponseDto[]> {
    return this.findAll({ where: { account_id: accountId }, orderBy: 'created_at', orderDirection: 'DESC', limit, offset });
  }

  async findAllPaginated (limit: number, offset: number): Promise<LedgerEntryResponseDto[]> {
    return this.findAll({ orderBy: 'created_at', orderDirection: 'DESC', limit, offset });
  }

  async countByAccountId (accountId: string): Promise<number> {
    return this.count({ where: { account_id: accountId } });
  }

  async countAll (): Promise<number> {
    return this.count({});
  }
}
