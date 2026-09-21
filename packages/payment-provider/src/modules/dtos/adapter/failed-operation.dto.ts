import { z } from 'zod';
import { ProviderError } from '@common/shared-libs';

import { SimulatedResultSchema } from './simulated-result.dto';

export const FailedOperationSchema = SimulatedResultSchema.extend({
  failure: z.custom<ProviderError>()
});

export type FailedOperationDto = z.infer<typeof FailedOperationSchema>;
