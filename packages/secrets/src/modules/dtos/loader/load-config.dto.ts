import { z } from 'zod';

export const LoadConfigSchema = z.object({
  env: z.custom<NodeJS.ProcessEnv>(),

  envFiles: z.array(z.string({ message: 'Env file must be a string' }))
});

export type LoadConfigDto = z.infer<typeof LoadConfigSchema>;
