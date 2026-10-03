import { z } from 'zod';

export const FindAccountEntriesSchema = z.object({
  accountId: z.string({ message: 'Account ID must be a string' }).optional(),

  limit: z.number({ message: 'Limit must be a number' }).int().positive(),

  before: z.string({ message: 'Before must be a string' }).optional(),

  beforeId: z.string({ message: 'Before ID must be a string' }).optional()
});

export type FindAccountEntriesDto = z.infer<typeof FindAccountEntriesSchema>;
