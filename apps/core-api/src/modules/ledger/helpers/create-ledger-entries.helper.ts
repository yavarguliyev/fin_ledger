import { WalletTransactionType } from '@common/libs';

import { CreateLedgerEntriesParamsDto } from '../dtos/entry/create-ledger-entries-params.dto';
import { LedgerEntryDto } from '../dtos/entry/ledger-entry.dto';

export const createLedgerEntries = (params: CreateLedgerEntriesParamsDto): LedgerEntryDto[] => {
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
};
