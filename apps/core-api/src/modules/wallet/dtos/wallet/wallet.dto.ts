import { z } from 'zod';
import { DatabaseAdapter, WalletStatus, WalletTransactionType } from '@common/libs';
import { WalletRepository } from '../../repositories/wallet.repository';

export const WalletSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  createdAt: z.string({ message: 'Created at must be a string' }),

  updatedAt: z.string({ message: 'Updated at must be a string' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  availableBalanceMinor: z.number({ message: 'Available balance must be a number' }).int({ message: 'Available balance must be an integer' }),

  reservedBalanceMinor: z.number({ message: 'Reserved balance must be a number' }).int({ message: 'Reserved balance must be an integer' }),

  ledgerAccountId: z.string({ message: 'Ledger account ID must be a string' }).optional(),

  version: z.number({ message: 'Version must be a number' }).int({ message: 'Version must be an integer' }).optional(),

  status: z.enum(WalletStatus, { message: 'Status must be a valid wallet status' }).optional()
});

export type WalletDto = z.infer<typeof WalletSchema>;

export type WalletInput = { walletId: string; amountMinor: number; adapter?: DatabaseAdapter | undefined };

export type WalletCurrencyInput = { userId: string; currency: string };

export type PerformWalletBalanceUpdateDto = {
  wallet: WalletDto;
  amountMinor: number;
  tx: DatabaseAdapter | undefined;
  balanceWalletTransactionType: WalletTransactionType;
  walletRepository: WalletRepository;
};

export type UpdateWalletStatusInput = {
  walletId: string;
  status: WalletStatus;
};
