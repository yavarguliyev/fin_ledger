import { z } from 'zod';

export const ThreadPoolConfigSchema = z.object({
  env: z.custom<NodeJS.ProcessEnv>(),

  cpus: z.number({ message: 'CPU count must be a number' }).int().positive()
});

export type ThreadPoolConfigDto = z.infer<typeof ThreadPoolConfigSchema>;
