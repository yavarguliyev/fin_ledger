import { z } from 'zod';

export const BaseAnalyticsEventSchema = z.object({
  currency: z
    .string({ message: 'Currency must be a string' })
    .min(1, { message: 'Currency is required' })
    .length(3, { message: 'Currency must be a 3-character ISO code' }),

  amountMinor: z
    .number({ message: 'Amount must be an integer (minor units)' })
    .int({ message: 'Amount must be an integer (minor units)' })
    .min(1, { message: 'Amount must be greater than 0' }),

  userId: z.string({ message: 'User Id must be a string' }).optional(),

  paymentId: z.string({ message: 'Payment must be a string' }).optional(),

  walletId: z.string({ message: 'Wallet Id must be a string' }).optional(),

  transactionId: z.string({ message: 'TransactionId must be a string' }).optional(),

  status: z.string({ message: 'Status must be a string' }).optional(),

  paymentType: z.string({ message: 'PaymentType must be a string' }).optional(),

  timestamp: z.string({ message: 'Timestamp must be a string' }).optional(),

  failureReason: z.string({ message: 'Failure Reason must be a string' }).optional()
});

export type BaseAnalyticsEvent = z.infer<typeof BaseAnalyticsEventSchema>;
export type BaseAnalyticsEventDto = z.infer<typeof BaseAnalyticsEventSchema>;
