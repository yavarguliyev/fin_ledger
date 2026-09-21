import { z } from 'zod';

export const PlaceBetRequestSchema = z.object({
  walletId: z.string({ message: 'Wallet ID must be a string' }).min(1, { message: 'Wallet ID is required' }),

  eventId: z.string({ message: 'Event ID must be a string' }).min(1, { message: 'Event ID is required' }),

  selection: z
    .string({ message: 'Selection must be a string' })
    .min(1, { message: 'Selection is required' })
    .max(100, { message: 'Selection must be at most 100 characters' }),

  stakeMinor: z
    .number({ message: 'Stake must be a number' })
    .int({ message: 'Stake must be an integer' })
    .positive({ message: 'Stake must be greater than zero' }),

  idempotencyKey: z
    .string({ message: 'Idempotency key must be a string' })
    .min(1, { message: 'Idempotency key is required' })
    .max(255, { message: 'Idempotency key must be at most 255 characters' })
});

export type PlaceBetRequestDto = z.infer<typeof PlaceBetRequestSchema>;
