import { z } from 'zod';

export const VerifyTotpSchema = z.object({
  secret: z.string({ message: 'Secret must be a string' }),

  code: z.string({ message: 'Code must be a string' }),

  lastUsedStep: z.number({ message: 'Last used step must be a number' }).int().nullable()
});

export type VerifyTotpDto = z.infer<typeof VerifyTotpSchema>;
