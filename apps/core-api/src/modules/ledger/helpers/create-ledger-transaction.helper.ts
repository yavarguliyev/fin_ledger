import { ConflictException, NotFoundException } from '@nestjs/common';
import { AccountType, WalletTransactionType } from '@common/libs';

import { LedgerEntryExecuteInTx } from '../dtos/entry/ledger-entry.dto';
import { LedgerEntryResponseDto } from '../dtos/entry/ledger-entry-response.dto';

export const CREDIT_INCREASE_ACCOUNT_TYPES = new Set([AccountType.LIABILITY, AccountType.REVENUE]);

export const executeInTx = async (options: LedgerEntryExecuteInTx): Promise<LedgerEntryResponseDto[]> => {
  const { entries, entryRepository, accountRepository, tx } = options;

  const createdEntries = await entryRepository.createBalancedEntries(entries, tx);

  for (const entry of entries) {
    const account = await accountRepository.findByIdForUpdate(entry.accountId, tx);

    if (!account) throw new NotFoundException(`Ledger account ${entry.accountId} not found`);
    if (account.currency !== entry.currency) throw new ConflictException(`Ledger account ${entry.accountId} currency does not match entry currency`);

    const isIncrease = CREDIT_INCREASE_ACCOUNT_TYPES.has(account.accountType)
      ? entry.entryType === WalletTransactionType.CREDIT
      : entry.entryType === WalletTransactionType.DEBIT;

    const delta = isIncrease ? entry.amountMinor : -entry.amountMinor;
    await accountRepository.adjustBalance(entry.accountId, delta, tx);
  }

  return createdEntries;
};
