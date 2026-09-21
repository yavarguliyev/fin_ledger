import { z } from 'zod';
import { ProviderChargeStatus } from '@common/shared-libs';

export const OperationResultSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  status: z.enum(ProviderChargeStatus, { message: 'Invalid charge status' })
});

export type OperationResultDto = z.infer<typeof OperationResultSchema>;
