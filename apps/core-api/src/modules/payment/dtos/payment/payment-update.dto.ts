import { z } from 'zod';

export const PaymentUpdateSchema = z.object({
  ledgerTransactionId: z.string({ message: 'Ledger transaction ID must be a string' }).optional(),

  failureCode: z.string({ message: 'Failure code must be a string' }).optional(),

  completedAt: z.string({ message: 'Completed at must be a string' }).optional(),

  failedAt: z.string({ message: 'Failed at must be a string' }).optional(),

  status: z.string({ message: 'Status must be a string' }).optional(),

  provider: z.string({ message: 'Provider must be a string' }).optional(),

  providerChargeId: z.string({ message: 'Provider charge ID must be a string' }).optional(),

  failureReason: z.string({ message: 'Failure reason must be a string' }).optional(),

  metadata: z.record(z.string(), z.unknown(), { message: 'Metadata must be an object' }).optional()
});

export type PaymentUpdateDto = z.infer<typeof PaymentUpdateSchema>;
