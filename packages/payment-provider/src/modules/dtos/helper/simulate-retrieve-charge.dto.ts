import { z } from 'zod';

import { RetrieveChargeSchema } from '../operation/retrieve-charge.dto';

export const SimulateRetrieveChargeSchema = z.object({
  dto: RetrieveChargeSchema,

  provider: z.string({ message: 'Provider must be a string' })
});

export type SimulateRetrieveChargeDto = z.infer<typeof SimulateRetrieveChargeSchema>;
