import { z } from 'zod';

export const OutboxBackoffSchema = z.object({
  attempts: z.number({ message: 'Attempts must be a number' }).int().nonnegative()
});

export type OutboxBackoffDto = z.infer<typeof OutboxBackoffSchema>;
