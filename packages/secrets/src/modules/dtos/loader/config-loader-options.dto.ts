import { z } from 'zod';

import { ConfigKeysSchema } from '../config/config-keys.dto';

export const ConfigLoaderOptionsSchema = z.object({
  context: z.string({ message: 'Logger context must be a string' }),

  label: z.string({ message: 'Label must be a string' }),

  keys: ConfigKeysSchema
});

export type ConfigLoaderOptionsDto = z.infer<typeof ConfigLoaderOptionsSchema>;
