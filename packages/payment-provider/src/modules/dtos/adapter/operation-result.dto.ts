import { z } from 'zod';
import { ProviderChargeStatus } from '@common/shared-libs';

import { ProviderFailureSchema } from '../operation/provider-failure.dto';

export const OperationResultSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  status: z.enum(ProviderChargeStatus, { message: 'Invalid charge status' }),

  failure: ProviderFailureSchema.optional(),

  clientSecret: z.string().optional()
});

export type OperationResultDto = z.infer<typeof OperationResultSchema>;
