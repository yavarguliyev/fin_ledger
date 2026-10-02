import { z } from 'zod';

import { SealedEmailSchema } from './sealed-email.dto';

export const OpenEmailSchema = z.object({
  payload: SealedEmailSchema,

  key: z.custom<Buffer>()
});

export type OpenEmailDto = z.infer<typeof OpenEmailSchema>;
