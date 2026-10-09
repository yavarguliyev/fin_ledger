import { z } from 'zod';

import { ConfigValuesSchema } from '../config/config-values.dto';

export const ApplyConfigSchema = z.object({
  env: z.custom<NodeJS.ProcessEnv>(),

  values: ConfigValuesSchema
});

export type ApplyConfigDto = z.infer<typeof ApplyConfigSchema>;
