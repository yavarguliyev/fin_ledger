import { z } from 'zod';
import { PaymentStatus, PaymentType } from '@common/libs';

export const PaymentAnalyticsEventPayloadSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  paymentId: z.string({ message: 'Payment ID must be a string' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  currency: z.string({ message: 'Currency must be a string' }),

  status: z.enum(PaymentStatus, { message: 'Payment status must be a valid payment status' }),

  paymentType: z.enum(PaymentType, { message: 'Payment type must be a valid payment type' }),

  timestamp: z.string({ message: 'Timestamp must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  providerTransactionId: z.string({ message: 'Provider transaction ID must be a string' }).optional(),

  externalReference: z.string({ message: 'External reference must be a string' }).optional(),

  failureReason: z.string({ message: 'Failure reason must be a string' }).optional()
});

export type PaymentAnalyticsEventPayloadDto = z.infer<typeof PaymentAnalyticsEventPayloadSchema>;
