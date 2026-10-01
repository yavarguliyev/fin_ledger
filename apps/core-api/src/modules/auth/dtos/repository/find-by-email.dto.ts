import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

export const FindByEmailSchema = z.object({
  email: z.email({ message: 'Email must be a valid email' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type FindByEmailDto = z.infer<typeof FindByEmailSchema>;
