import { z } from 'zod';

export const LoadSecretsSchema = z.object({
  env: z.custom<NodeJS.ProcessEnv>(),

  envFiles: z.array(z.string({ message: 'Env file must be a string' }))
});

export type LoadSecretsDto = z.infer<typeof LoadSecretsSchema>;
