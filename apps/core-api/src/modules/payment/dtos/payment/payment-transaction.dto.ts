import { z } from 'zod';

export const PaymentTransactionSchema = z.object({
  paymentId: z.string({ message: 'Payment ID must be a string' }),

  currency: z.string({ message: 'Currency must be a string' }),

  amountMinor: z.number({ message: 'Amount must be a number' }).int({ message: 'Amount must be an integer' }).optional()
});

export type PaymentTransactionDto = z.infer<typeof PaymentTransactionSchema>;
