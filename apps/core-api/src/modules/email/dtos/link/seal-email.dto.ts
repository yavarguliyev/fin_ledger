import { z } from 'zod';
import { SendEmailSchema } from '@common/libs';

export const SealEmailSchema = z.object({
  payload: SendEmailSchema,

  key: z.custom<Buffer>()
});

export type SealEmailDto = z.infer<typeof SealEmailSchema>;
