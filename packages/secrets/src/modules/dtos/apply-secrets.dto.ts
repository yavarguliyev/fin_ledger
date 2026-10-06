import { z } from 'zod';

import { SecretValuesSchema } from './secret-values.dto';

export const ApplySecretsSchema = z.object({
  env: z.custom<NodeJS.ProcessEnv>(),

  values: SecretValuesSchema
});

export type ApplySecretsDto = z.infer<typeof ApplySecretsSchema>;
