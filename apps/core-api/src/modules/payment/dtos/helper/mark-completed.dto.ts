import { z } from 'zod';

import { PaymentRepository } from '../../repositories/payment.repository';

export const MarkCompletedSchema = z.object({
  paymentRepository: z.custom<PaymentRepository>(),

  paymentId: z.string({ message: 'Payment ID must be a string' }),

  providerChargeId: z.string({ message: 'Provider charge ID must be a string' }).optional(),

  ledgerTransactionId: z.string({ message: 'Ledger transaction ID must be a string' })
});

export type MarkCompletedDto = z.infer<typeof MarkCompletedSchema>;
