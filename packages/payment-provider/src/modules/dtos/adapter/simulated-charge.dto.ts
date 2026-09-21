import { z } from 'zod';

import { SimulatedResultSchema } from './simulated-result.dto';

export const SimulatedChargeSchema = SimulatedResultSchema.extend({
  provider: z.string({ message: 'Provider must be a string' })
});

export type SimulatedChargeDto = z.infer<typeof SimulatedChargeSchema>;
