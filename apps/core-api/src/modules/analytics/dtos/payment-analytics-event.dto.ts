import { z } from 'zod';

export const PaymentAnalyticsEventSchema = z.object({
  userId: z.string({ message: 'User Id must be a string' }),

  paymentId: z.string({ message: 'Payment must be a string' }),

  walletId: z.string({ message: 'Wallet Id must be a string' }),

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

  failureReason: z
    .string({ message: 'Failure Reason must be a string' })
    .optional()
    .transform(val => val ?? '')
});

export type PaymentAnalyticsEventDto = z.infer<typeof PaymentAnalyticsEventSchema>;
