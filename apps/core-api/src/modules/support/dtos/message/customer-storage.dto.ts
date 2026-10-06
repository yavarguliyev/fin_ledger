import { z } from 'zod';

export const CustomerStorageSchema = z.object({
  totalBytes: z.number({ message: 'Total bytes must be a number' })
});

export type CustomerStorageDto = z.infer<typeof CustomerStorageSchema>;
