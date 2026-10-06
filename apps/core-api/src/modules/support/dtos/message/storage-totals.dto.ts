import { z } from 'zod';

export const StorageTotalsSchema = z.object({
  totalBytes: z.number({ message: 'Total bytes must be a number' }),

  ownBytes: z.number({ message: 'Own bytes must be a number' }),

  fileCount: z.number({ message: 'File count must be a number' }).int()
});

export type StorageTotalsDto = z.infer<typeof StorageTotalsSchema>;
