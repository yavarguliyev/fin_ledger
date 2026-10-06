import { z } from 'zod';

export const WalletMovementV1Schema = z.object({
  walletId: z.string({ message: 'Wallet ID must be a string' }).min(1),

  userId: z.string({ message: 'User ID must be a string' }).optional(),

  amountMinor: z.number({ message: 'Amount must be a number' }).int(),

  currency: z.string({ message: 'Currency must be a string' }).min(1),

  transactionId: z.string({ message: 'Transaction ID must be a string' }).min(1),

  reference: z.string({ message: 'Reference must be a string' }).optional(),

  type: z.string({ message: 'Type must be a string' }).optional(),

  timestamp: z.iso.datetime({ offset: true, message: 'Timestamp must be an ISO date-time' })
});

export type WalletMovementV1 = z.infer<typeof WalletMovementV1Schema>;
