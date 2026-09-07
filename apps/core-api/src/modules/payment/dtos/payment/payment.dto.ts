import { z } from 'zod';
import { PaymentStatus, PaymentType } from '@common/libs';

export const PaymentSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  ledgerAccountId: z.string({ message: 'Ledger account ID must be a string' }),

  paymentMethodId: z.string({ message: 'Payment method ID must be a string' }).nullable().optional(),

  idempotencyKey: z.string({ message: 'Idempotency key must be a string' }),

  type: z.enum(PaymentType, { message: 'Payment type must be a valid payment type' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  currency: z.string({ message: 'Currency must be a string' }),

  status: z.enum(PaymentStatus, { message: 'Payment status must be a valid payment status' }),

  transactionId: z.string({ message: 'Transaction ID must be a string' }).nullable().optional(),

  failureReason: z.string({ message: 'Failure reason must be a string' }).nullable().optional(),

  metadata: z.record(z.string(), z.unknown(), { message: 'Metadata must be an object' }).optional(),

  createdAt: z.date({ message: 'Created at must be a valid date' }),

  updatedAt: z.date({ message: 'Updated at must be a valid date' })
});

export type PaymentDto = z.infer<typeof PaymentSchema>;
