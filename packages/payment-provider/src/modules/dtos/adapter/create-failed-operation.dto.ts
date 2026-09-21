import { z } from 'zod';

import { SimulatedResultSchema } from './simulated-result.dto';

export const CreateFailedOperationSchema = SimulatedResultSchema.extend({
  error: z.unknown()
});

export type CreateFailedOperationDto = z.infer<typeof CreateFailedOperationSchema>;
