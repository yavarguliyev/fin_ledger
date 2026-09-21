import { z } from 'zod';

export const ValidateConfigSchema = z.object({
  config: z.record(z.string(), z.unknown(), { message: 'Config must be an object' })
});

export type ValidateConfigDto = z.infer<typeof ValidateConfigSchema>;
