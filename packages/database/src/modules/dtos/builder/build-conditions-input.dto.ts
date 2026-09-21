import { z } from 'zod';

import { QueryOptionsSchema } from '../query/query-options.dto';

export const BuildConditionsInputSchema = z.object({
  options: QueryOptionsSchema,

  params: z.array(z.unknown()),

  startParamIndex: z.number().int()
});

export type BuildConditionsInputDto = z.infer<typeof BuildConditionsInputSchema>;
