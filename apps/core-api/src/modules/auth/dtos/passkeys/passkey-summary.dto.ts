import { z } from 'zod';

export const PasskeySummarySchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  deviceLabel: z.string({ message: 'Device label must be a string' }).nullable(),

  backedUp: z.boolean({ message: 'Backed up must be a boolean' }),

  lastUsedAt: z.string({ message: 'Last used at must be a string' }).nullable(),

  createdAt: z.string({ message: 'Created at must be a string' })
});

export type PasskeySummaryDto = z.infer<typeof PasskeySummarySchema>;
