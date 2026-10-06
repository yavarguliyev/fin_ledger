import { z } from 'zod';

import { SendEmailSchema } from './send-email.dto';

export const ComposeMailSchema = z.object({
  email: SendEmailSchema,

  from: z.string({ message: 'From must be a string' })
});

export type ComposeMailDto = z.infer<typeof ComposeMailSchema>;
