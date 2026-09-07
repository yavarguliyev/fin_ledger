import { z } from 'zod';
import { PaymentStatus, PaymentType } from '@common/libs';

export const InternalPaymentRecordSchema = z.object({
  idempotencyKey: z.string({ message: 'Idempotency key must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  ledgerAccountId: z.string({ message: 'Ledger account ID must be a string' }),

  paymentMethodId: z.string({ message: 'Payment method ID must be a string' }).optional(),

  amountMinor: z.number({ message: 'Amount must be an integer' }).int({ message: 'Amount must be an integer' }),

  currency: z.string({ message: 'Currency must be a string' }),

  type: z.enum(PaymentType, { message: 'Payment type must be a valid payment type' }),

  status: z.enum(PaymentStatus, { message: 'Payment status must be a valid payment status' }),

  transactionId: z.string({ message: 'Transaction ID must be a string' }).optional(),

  failureReason: z.string({ message: 'Failure reason must be a string' }).optional(),

  metadata: z.record(z.string(), z.unknown(), { message: 'Metadata must be an object' }).optional()
});

export type InternalPaymentRecordDto = z.infer<typeof InternalPaymentRecordSchema>;
