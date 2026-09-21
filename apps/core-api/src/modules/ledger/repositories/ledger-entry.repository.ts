import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService, EntryType, QueryOptionsDto } from '@common/libs';

import { LedgerEntryDto } from '../dtos/entry/ledger-entry.dto';
import { LedgerEntryResponseDto } from '../dtos/entry/ledger-entry-response.dto';
import { CreateBalancedEntriesDto } from '../dtos/repository/create-balanced-entries.dto';
import { FindTransactionEntriesDto } from '../dtos/repository/find-transaction-entries.dto';
import { FindAccountEntriesDto } from '../dtos/repository/find-account-entries.dto';

@Injectable()
export class LedgerEntryRepository extends BaseRepository<LedgerEntryResponseDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'ledger_entries',
      columnMappings: {
        transactionId: 'transaction_id',
        accountId: 'account_id',
        entryType: 'entry_type',
        amountMinor: 'amount_minor',
        createdAt: 'created_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'transactionId', 'accountId', 'entryType', 'amountMinor', 'currency', 'description', 'reference', 'sequence', 'createdAt'];
  }

  private assertBalanced (entries: LedgerEntryDto[]): void {
    const totals = new Map<string, { debit: number; credit: number }>();

    for (const entry of entries) {
      const total = totals.get(entry.currency) ?? { debit: 0, credit: 0 };
      if (entry.entryType === EntryType.DEBIT) total.debit += entry.amountMinor;
      else total.credit += entry.amountMinor;
      totals.set(entry.currency, total);
    }

    for (const total of totals.values()) {
      if (total.debit !== total.credit) throw new BadRequestException('Ledger entries are not balanced');
    }
  }

  async createBalancedEntries (dto: CreateBalancedEntriesDto): Promise<LedgerEntryResponseDto[]> {
    const { entries, transactionId, adapter } = dto;
    this.assertBalanced(entries);

    const created: LedgerEntryResponseDto[] = [];

    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      if (!entry) continue;

      const row = await this.create({
        data: {
          transactionId,
          accountId: entry.accountId,
          entryType: entry.entryType,
          amountMinor: entry.amountMinor,
          currency: entry.currency,
          description: entry.description,
          ...(entry.reference && { reference: entry.reference }),
          sequence: index + 1
        },
        adapter
      });

      if (row) created.push(row);
    }

    return created;
  }

  async findByTransactionId ({ transactionId, adapter }: FindTransactionEntriesDto): Promise<LedgerEntryResponseDto[]> {
    return this.findAll({ where: { transaction_id: transactionId }, orderBy: 'sequence', orderDirection: 'ASC', adapter });
  }

  async findPaginated (dto: FindAccountEntriesDto): Promise<LedgerEntryResponseDto[]> {
    const { limit, offset } = dto;
    return this.findAll({ ...this.buildWhere(dto), orderBy: 'created_at', orderDirection: 'DESC', limit, offset });
  }

  async countEntries (dto: FindAccountEntriesDto): Promise<number> {
    return this.count(this.buildWhere(dto));
  }

  private buildWhere = ({ accountId }: FindAccountEntriesDto): QueryOptionsDto => ({ ...(accountId && { where: { account_id: accountId } }) });
}
