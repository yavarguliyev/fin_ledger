import { z } from 'zod';
import { DatabaseAdapter, WalletTransactionType } from '@common/libs';

import { LedgerEntryRepository } from '../../repositories/ledger-entry.repository';
import { LedgerAccountRepository } from '../../repositories/ledger-account.repository';

export const LedgerEntrySchema = z.object({
  accountId: z.string({ message: 'Account ID must be a string' }),

  entryType: z.enum(WalletTransactionType, { message: 'Entry type must be a valid wallet transaction type' }),

  description: z.string({ message: 'Description must be a string' }),

  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  reference: z.string({ message: 'Reference must be a string' }).optional()
});

export type LedgerEntryDto = z.infer<typeof LedgerEntrySchema>;

export type LedgerEntryExecuteInTx = {
  entries: LedgerEntryDto[];
  entryRepository: LedgerEntryRepository;
  accountRepository: LedgerAccountRepository;
  tx: DatabaseAdapter;
};

export type LedgerEntry = { entries: LedgerEntryDto[]; adapter?: DatabaseAdapter | undefined };
