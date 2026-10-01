import { z } from 'zod';
import { PaymentProvider, PaymentStatus, PaymentType } from '@common/libs';

export const PaymentSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  paymentMethodId: z.string({ message: 'Payment method ID must be a string' }).nullable().optional(),

  idempotencyKey: z.string({ message: 'Idempotency key must be a string' }),

  type: z.enum(PaymentType, { message: 'Payment type must be a valid payment type' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }),

  currency: z.string({ message: 'Currency must be a string' }),

  status: z.enum(PaymentStatus, { message: 'Payment status must be a valid payment status' }),

  provider: z.enum(PaymentProvider, { message: 'Invalid payment provider' }).optional(),

  providerChargeId: z.string({ message: 'Provider charge ID must be a string' }).nullable().optional(),

  ledgerTransactionId: z.string({ message: 'Ledger transaction ID must be a string' }).nullable().optional(),

  failureReason: z.string({ message: 'Failure reason must be a string' }).nullable().optional(),

  reconcileAttempts: z.number({ message: 'Reconcile attempts must be a number' }).int().optional(),

  metadata: z.record(z.string(), z.unknown(), { message: 'Metadata must be an object' }).optional(),

  createdAt: z.date({ message: 'Created at must be a valid date' }),

  updatedAt: z.date({ message: 'Updated at must be a valid date' })
});

export type PaymentDto = z.infer<typeof PaymentSchema>;
