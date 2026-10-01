import { z } from 'zod';

export const ClaimBatchSchema = z.object({ size: z.number({ message: 'Size must be a number' }).int().positive() });

export type ClaimBatchDto = z.infer<typeof ClaimBatchSchema>;
