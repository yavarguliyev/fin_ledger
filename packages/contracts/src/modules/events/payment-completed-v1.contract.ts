import { z } from 'zod';

export const PaymentCompletedV1Schema = z.object({
  paymentId: z.string({ message: 'Payment ID must be a string' }).min(1),

  userId: z.string({ message: 'User ID must be a string' }).min(1),

  walletId: z.string({ message: 'Wallet ID must be a string' }).min(1),

  amountMinor: z.number({ message: 'Amount must be a number' }).int(),

  currency: z.string({ message: 'Currency must be a string' }).min(1),

  status: z.string({ message: 'Status must be a string' }).min(1),

  paymentType: z.string({ message: 'Payment type must be a string' }).min(1),

  timestamp: z.iso.datetime({ offset: true, message: 'Timestamp must be an ISO date-time' }),

  providerTransactionId: z.string({ message: 'Provider transaction ID must be a string' }).optional(),

  externalReference: z.string({ message: 'External reference must be a string' }).optional(),

  failureReason: z.string({ message: 'Failure reason must be a string' }).optional()
});

export type PaymentCompletedV1 = z.infer<typeof PaymentCompletedV1Schema>;
