import { z } from 'zod';

export const ConfigKeysSchema = z.object({
  SOURCE: z.string(),

  REGION: z.string(),

  ENDPOINT: z.string(),

  ACCESS_KEY_ID: z.string(),

  SECRET_ACCESS_KEY: z.string()
});

export type ConfigKeysDto = z.infer<typeof ConfigKeysSchema>;
