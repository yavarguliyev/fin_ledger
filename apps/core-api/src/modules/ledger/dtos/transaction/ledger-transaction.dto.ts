import { z } from 'zod';

export const LedgerTransactionSchema = z.object({
  referenceType: z
    .string({ message: 'Reference type must be a string' })
    .min(1, { message: 'Reference type is required' })
    .max(50, { message: 'Reference type must be at most 50 characters' }),

  referenceId: z.string({ message: 'Reference ID must be a string' }).min(1, { message: 'Reference ID is required' }).optional(),

  description: z.string({ message: 'Description must be a string' }).min(1, { message: 'Description is required' }),

  idempotencyKey: z
    .string({ message: 'Idempotency key must be a string' })
    .min(1, { message: 'Idempotency key is required' })
    .max(255, { message: 'Idempotency key must be at most 255 characters' }),

  actorUserId: z.string({ message: 'Actor user ID must be a string' }).min(1, { message: 'Actor user ID is required' }).optional()
});

export type LedgerTransactionDto = z.infer<typeof LedgerTransactionSchema>;
