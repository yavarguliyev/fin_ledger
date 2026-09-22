import { z } from 'zod';

export const SecretValueSchema = z.object({
  secret: z.string({ message: 'Secret must be a string' })
});

export type SecretValueDto = z.infer<typeof SecretValueSchema>;
