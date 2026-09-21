import { z } from 'zod';

export const FindAccountEntriesSchema = z.object({
  accountId: z.string({ message: 'Account ID must be a string' }).optional(),

  limit: z.number({ message: 'Limit must be a number' }).int().positive(),

  offset: z.number({ message: 'Offset must be a number' }).int().nonnegative()
});

export type FindAccountEntriesDto = z.infer<typeof FindAccountEntriesSchema>;
