import { z } from 'zod';

import { StorageFileSchema } from '../message/storage-file.dto';
import { StorageTotalsSchema } from '../message/storage-totals.dto';

export const StorageSummaryResponseSchema = StorageTotalsSchema.extend({
  customerTotalBytes: z.number({ message: 'Customer total bytes must be a number' }).optional(),

  files: z.array(StorageFileSchema)
});

export type StorageSummaryResponseDto = z.infer<typeof StorageSummaryResponseSchema>;
