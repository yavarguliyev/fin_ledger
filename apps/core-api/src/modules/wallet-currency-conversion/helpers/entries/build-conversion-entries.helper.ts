import { WalletTransactionType } from '@common/libs';

import { LedgerEntryDto } from '../../../ledger/dtos/entry/ledger-entry.dto';
import { LedgerEntryParamsDto } from '../../../ledger/dtos/entry/ledger-entry-params.dto';

export const buildConversionEntries = (options: LedgerEntryParamsDto): LedgerEntryDto[] => {
  const { ledgerAccountId, systemAccountId, amountMinor, currency, descriptionPrefix, reference, direction } = options;

  const baseEntry = { amountMinor, currency, reference };
  const conversionDescription = 'Wallet currency conversion';

  const [ledgerEntryType, systemEntryType] =
    direction === 'source'
      ? [WalletTransactionType.DEBIT, WalletTransactionType.CREDIT]
      : [WalletTransactionType.CREDIT, WalletTransactionType.DEBIT];

  const ledgerEntry = {
    accountId: ledgerAccountId,
    entryType: ledgerEntryType,
    description: `${conversionDescription} ${descriptionPrefix}`,
    ...baseEntry
  };

  const systemEntry = {
    accountId: systemAccountId,
    entryType: systemEntryType,
    description: `${conversionDescription} settlement`,
    ...baseEntry
  };

  return [ledgerEntry, systemEntry];
};
