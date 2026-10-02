import { z } from 'zod';
import { SendEmailSchema } from '@common/libs';

export const SealedEmailSchema = SendEmailSchema.omit({ url: true }).extend({
  url: z.string({ message: 'URL must be a string' }).optional(),

  sealedUrl: z.string({ message: 'Sealed URL must be a string' }).optional()
});

export type SealedEmailDto = z.infer<typeof SealedEmailSchema>;
