import { Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService, UnknownRecord, WalletTransactionStatus, WalletTransactionType } from '@common/libs';

import { WalletTransactionRecordDto } from '../dtos/transaction/wallet-transaction-record.dto';
import { WalletTransactionSummaryDto } from '../dtos/summary/wallet-transaction-summary.dto';
import { CreateWalletTransactionDto } from '../dtos/repository/create-wallet-transaction.dto';
import { FindWalletTransactionsDto } from '../dtos/repository/find-wallet-transactions.dto';
import { SummariseWalletTransactionsDto } from '../dtos/repository/summarise-wallet-transactions.dto';
import { WalletTransactionSummaryRowDto } from '../dtos/repository/wallet-transaction-summary-row.dto';

@Injectable()
export class WalletTransactionRepository extends BaseRepository<WalletTransactionRecordDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'wallet_transactions',
      columnMappings: {
        walletId: 'wallet_id',
        amountMinor: 'amount_minor',
        balanceAfterMinor: 'balance_after_minor',
        externalReference: 'external_reference',
        idempotencyKey: 'idempotency_key',
        ledgerTransactionId: 'ledger_transaction_id',
        createdAt: 'created_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return [
      'id',
      'walletId',
      'type',
      'amountMinor',
      'currency',
      'status',
      'reference',
      'externalReference',
      'balanceAfterMinor',
      'idempotencyKey',
      'ledgerTransactionId',
      'createdAt'
    ];
  }

  async createTransaction (input: CreateWalletTransactionDto): Promise<WalletTransactionRecordDto | null> {
    const { status = WalletTransactionStatus.COMPLETED, reference, ledgerTransactionId, adapter, ...rest } = input;

    return this.create({
      data: {
        ...rest,
        status,
        ...(reference && { reference }),
        ...(ledgerTransactionId && { ledgerTransactionId })
      },
      adapter
    });
  }

  async findPaginated (dto: FindWalletTransactionsDto): Promise<WalletTransactionRecordDto[]> {
    const { limit, offset } = dto;
    return this.findAll({ where: this.buildWhere(dto), orderBy: 'created_at', orderDirection: 'DESC', limit, offset });
  }

  async countTransactions (dto: FindWalletTransactionsDto): Promise<number> {
    return this.count({ where: this.buildWhere(dto) });
  }

  async countPending (): Promise<number> {
    return this.count({ where: { status: WalletTransactionStatus.PENDING } });
  }

  async getSummary ({ walletId }: SummariseWalletTransactionsDto): Promise<WalletTransactionSummaryDto[]> {
    const rows = await this.aggregateByGroup<WalletTransactionSummaryRowDto>({
      groupBy: 'currency',
      aggregates: [
        { alias: 'deposits', fn: 'SUM', column: 'amountMinor', filter: { type: WalletTransactionType.DEPOSIT } },
        { alias: 'withdrawals', fn: 'SUM', column: 'amountMinor', filter: { type: WalletTransactionType.WITHDRAWAL } },
        { alias: 'winnings', fn: 'SUM', column: 'amountMinor', filter: { type: WalletTransactionType.BET_PAYOUT } },
        { alias: 'betsCount', fn: 'COUNT', filter: { type: WalletTransactionType.BET_STAKE } }
      ],
      where: walletId ? { wallet_id: walletId } : {}
    });

    return rows.map(row => ({
      currency: row.currency,
      totalDepositsMinor: Number(row.deposits),
      totalWithdrawalsMinor: Math.abs(Number(row.withdrawals)),
      totalWinningsMinor: Number(row.winnings),
      betsCount: Number(row.betsCount)
    }));
  }

  private buildWhere = ({ walletId, type }: FindWalletTransactionsDto): UnknownRecord => ({
    ...(walletId && { wallet_id: walletId }),
    ...(type && { type })
  });
}
