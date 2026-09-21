import { EntryType } from '@common/libs';

import { LedgerEntryDto } from '../dtos/entry/ledger-entry.dto';
import { CreateLedgerEntriesDto } from '../dtos/helper/create-ledger-entries.dto';

export class LedgerHelper {
  static createLedgerEntries (params: CreateLedgerEntriesDto): LedgerEntryDto[] {
    const { wallet, systemAccountId, amountMinor, referenceValue, isDebit } = params;
    const baseEntry = { amountMinor, currency: wallet.currency, ...(referenceValue && { reference: referenceValue }) };

    const [walletEntryType, systemEntryType] = isDebit
      ? [EntryType.DEBIT, EntryType.CREDIT]
      : [EntryType.CREDIT, EntryType.DEBIT];

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
