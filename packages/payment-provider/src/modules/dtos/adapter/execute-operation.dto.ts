import { z } from 'zod';
import { ProviderChargeStatus } from '@common/shared-libs';

import { SimulatedResultSchema } from './simulated-result.dto';

export const ExecuteOperationSchema = SimulatedResultSchema.extend({
  operation: z.custom<() => Promise<string | { id: string; status?: ProviderChargeStatus }>>()
});

export type ExecuteOperationDto = z.infer<typeof ExecuteOperationSchema>;
