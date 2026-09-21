import { z } from 'zod';

export const WalletAnalyticsEventSchema = z.object({
  walletId: z.string({ message: 'Wallet Id must be a string' }),

  transactionId: z.string({ message: 'TransactionId must be a string' }),

  timestamp: z.string({ message: 'Timestamp must be a string' }),

  status: z.string({ message: 'Status must be a string' }),

  paymentType: z.string({ message: 'PaymentType must be a string' }),

  currency: z
    .string({ message: 'Currency must be a string' })
    .min(1, { message: 'Currency is required' })
    .length(3, { message: 'Currency must be a 3-character ISO code' }),

  amountMinor: z
    .number({ message: 'Amount must be an integer (minor units)' })
    .int({ message: 'Amount must be an integer (minor units)' })
    .min(1, { message: 'Amount must be greater than 0' }),

  reference: z
    .string({ message: 'Reference must be a string' })
    .optional()
    .transform(val => val ?? ''),

  type: z
    .string({ message: 'Reference must be a string' })
    .optional()
    .transform(val => val ?? '')
});

export type WalletAnalyticsEventDto = z.infer<typeof WalletAnalyticsEventSchema>;
