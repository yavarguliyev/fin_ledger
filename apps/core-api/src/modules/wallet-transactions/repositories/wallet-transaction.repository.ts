import { Injectable } from '@nestjs/common';
import { BaseRepository, DatabaseAdapter, PostgresService, WalletTransactionStatus, WalletTransactionType } from '@common/libs';

import { WalletTransactionRecordDto } from '../dtos/transaction/wallet-transaction-record.dto';
import { CreateWalletTransactionDto } from '../dtos/transaction/create-wallet-transaction.dto';
import { WalletTransactionSummaryDto } from '../dtos/summary/wallet-transaction-summary.dto';

@Injectable()
export class WalletTransactionRepository extends BaseRepository<WalletTransactionRecordDto> {
  constructor (postgresService: PostgresService) {
    super(postgresService, 'wallet_transactions', {
      walletId: 'wallet_id',
      amountMinor: 'amount_minor',
      transactionId: 'transaction_id',
      ledgerEntryId: 'ledger_entry_id',
      conversionId: 'conversion_id',
      createdAt: 'created_at'
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
      'transactionId',
      'ledgerEntryId',
      'conversionId',
      'createdAt'
    ];
  }

  async createTransaction (input: CreateWalletTransactionDto): Promise<WalletTransactionRecordDto | null> {
    const { status = WalletTransactionStatus.COMPLETED, reference, ledgerEntryId, conversionId, adapter, ...rest } = input;

    return this.create(
      {
        ...rest,
        status,
        ...(reference && { reference }),
        ...(ledgerEntryId && { ledgerEntryId }),
        ...(conversionId && { conversionId })
      },
      undefined,
      adapter
    );
  }

  async findByWalletIdPaginated (
    walletId: string,
    limit: number,
    offset: number,
    type?: WalletTransactionType
  ): Promise<WalletTransactionRecordDto[]> {
    const where: Record<string, string> = { wallet_id: walletId };
    if (type) where['type'] = type;
    return this.findAll({ where, orderBy: 'created_at', orderDirection: 'DESC', limit, offset });
  }

  async findAllPaginated (limit: number, offset: number, type?: WalletTransactionType): Promise<WalletTransactionRecordDto[]> {
    const where: Record<string, string> = {};
    if (type) where['type'] = type;
    return this.findAll({ where, orderBy: 'created_at', orderDirection: 'DESC', limit, offset });
  }

  async findByWalletId (walletId: string, adapter?: DatabaseAdapter): Promise<WalletTransactionRecordDto[]> {
    return this.findAll({ where: { wallet_id: walletId } }, adapter);
  }

  async countByWalletId (walletId: string, type?: WalletTransactionType): Promise<number> {
    const where: Record<string, string> = { wallet_id: walletId };
    if (type) where['type'] = type;
    return this.count({ where });
  }

  async countAll (type?: WalletTransactionType): Promise<number> {
    const where: Record<string, string> = {};
    if (type) where['type'] = type;
    return this.count({ where });
  }

  async getSummaryByWalletId (walletId: string, adapter?: DatabaseAdapter): Promise<WalletTransactionSummaryDto> {
    const [deposits, credits, withdrawals, debits, winnings, betsCount] = await Promise.all([
      this.sum('amountMinor', { where: { wallet_id: walletId, type: WalletTransactionType.DEPOSIT } }, adapter),
      this.sum('amountMinor', { where: { wallet_id: walletId, type: WalletTransactionType.CREDIT } }, adapter),
      this.sum('amountMinor', { where: { wallet_id: walletId, type: WalletTransactionType.WITHDRAWAL } }, adapter),
      this.sum('amountMinor', { where: { wallet_id: walletId, type: WalletTransactionType.DEBIT } }, adapter),
      this.sum('amountMinor', { where: { wallet_id: walletId, type: WalletTransactionType.WINNING } }, adapter),
      this.count({ where: { wallet_id: walletId, type: WalletTransactionType.BET } }, adapter)
    ]);

    return {
      totalDepositsMinor: deposits + credits,
      totalWithdrawalsMinor: withdrawals + debits,
      totalWinningsMinor: winnings,
      betsCount
    };
  }

  async getSummaryAll (adapter?: DatabaseAdapter): Promise<WalletTransactionSummaryDto> {
    const [deposits, credits, withdrawals, debits, winnings, betsCount] = await Promise.all([
      this.sum('amountMinor', { where: { type: WalletTransactionType.DEPOSIT } }, adapter),
      this.sum('amountMinor', { where: { type: WalletTransactionType.CREDIT } }, adapter),
      this.sum('amountMinor', { where: { type: WalletTransactionType.WITHDRAWAL } }, adapter),
      this.sum('amountMinor', { where: { type: WalletTransactionType.DEBIT } }, adapter),
      this.sum('amountMinor', { where: { type: WalletTransactionType.WINNING } }, adapter),
      this.count({ where: { type: WalletTransactionType.BET } }, adapter)
    ]);

    return {
      totalDepositsMinor: deposits + credits,
      totalWithdrawalsMinor: withdrawals + debits,
      totalWinningsMinor: winnings,
      betsCount
    };
  }

  async countPending (adapter?: DatabaseAdapter): Promise<number> {
    return this.count({ where: { status: WalletTransactionStatus.PENDING } }, adapter);
  }
}
