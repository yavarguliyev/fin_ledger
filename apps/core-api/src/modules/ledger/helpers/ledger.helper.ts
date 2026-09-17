import { ConflictException, NotFoundException } from '@nestjs/common';
import { AccountType, WalletTransactionType } from '@common/libs';

import { LedgerEntryExecuteInTx, LedgerEntryDto } from '../dtos/entry/ledger-entry.dto';
import { LedgerEntryResponseDto } from '../dtos/entry/ledger-entry-response.dto';
import { CreateLedgerEntriesParamsDto } from '../dtos/entry/create-ledger-entries-params.dto';

export class LedgerHelper {
  static readonly CREDIT_INCREASE_ACCOUNT_TYPES = new Set([AccountType.LIABILITY, AccountType.REVENUE]);

  static async executeInTx (options: LedgerEntryExecuteInTx): Promise<LedgerEntryResponseDto[]> {
    const { entries, entryRepository, accountRepository, tx } = options;
    const createdEntries = await entryRepository.createBalancedEntries(entries, tx);

    for (const entry of entries) {
      const account = await accountRepository.findByIdForUpdate(entry.accountId, tx);

      if (!account) throw new NotFoundException(`Ledger account ${entry.accountId} not found`);
      if (account.currency !== entry.currency) throw new ConflictException(`Ledger account ${entry.accountId} currency does not match entry currency`);

      const isIncrease = LedgerHelper.CREDIT_INCREASE_ACCOUNT_TYPES.has(account.accountType)
        ? entry.entryType === WalletTransactionType.CREDIT
        : entry.entryType === WalletTransactionType.DEBIT;

      const delta = isIncrease ? entry.amountMinor : -entry.amountMinor;
      await accountRepository.adjustBalance(entry.accountId, delta, tx);
    }

    return createdEntries;
  }

  static createLedgerEntries (params: CreateLedgerEntriesParamsDto): LedgerEntryDto[] {
    const { wallet, systemAccountId, amountMinor, referenceValue, isDebit } = params;
    const baseEntry = { amountMinor, currency: wallet.currency, ...(referenceValue && { reference: referenceValue }) };

    const [walletEntryType, systemEntryType] = isDebit
      ? [WalletTransactionType.DEBIT, WalletTransactionType.CREDIT]
      : [WalletTransactionType.CREDIT, WalletTransactionType.DEBIT];

    const walletEntry = {
      accountId: wallet.ledgerAccountId!,
      entryType: walletEntryType,
      description: `${isDebit ? 'Debit' : 'Credit'} wallet: ${referenceValue ?? ''}`,
      ...baseEntry
    };

    const systemEntry = {
      accountId: systemAccountId,
      entryType: systemEntryType,
      description: `${isDebit ? 'Debit' : 'Credit'} wallet system settlement: ${referenceValue ?? ''}`,
      ...baseEntry
    };

    return [walletEntry, systemEntry];
  }
}
