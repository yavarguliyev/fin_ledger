import { z } from 'zod';
import { DatabaseAdapter, PaymentStatus } from '@common/libs';

export const HandlePaymentOptionsSchema = z.object({
  status: z.enum(PaymentStatus, { message: 'Payment status must be a valid payment status' }),

  userId: z.string({ message: 'User ID must be a string' }),

  walletId: z.string({ message: 'Wallet ID must be a string' }),

  paymentId: z.string({ message: 'Payment ID must be a string' }),

  id: z.string({ message: 'ID must be a string' }),

  input: z.object({
    currency: z.string({ message: 'Currency must be a string' }),

    amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' })
  }),

  failureReason: z.string({ message: 'Failure reason must be a string' }).optional()
});

export type HandlePaymentOptionsDto = z.infer<typeof HandlePaymentOptionsSchema> & { tx: DatabaseAdapter };
