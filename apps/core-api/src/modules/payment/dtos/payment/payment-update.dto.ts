import { z } from 'zod';

export const PaymentUpdateSchema = z.object({
  transactionId: z.string({ message: 'Transaction ID must be a string' }).optional(),

  status: z.string({ message: 'Status must be a string' }).optional(),

  failureReason: z.string({ message: 'Failure reason must be a string' }).optional(),

  metadata: z.record(z.string(), z.unknown(), { message: 'Metadata must be an object' }).optional()
});

export type PaymentUpdateDto = z.infer<typeof PaymentUpdateSchema>;
