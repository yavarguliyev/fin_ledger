import { z } from 'zod';

import { BaseTransportSchema } from './base-transport.dto';

export const SmtpOptionsSchema = BaseTransportSchema.extend({
  host: z.string({ message: 'SMTP host must be a string' }),

  port: z.number({ message: 'SMTP port must be a number' }).int().positive(),

  user: z.string({ message: 'SMTP user must be a string' }).optional(),

  pass: z.string({ message: 'SMTP password must be a string' }).optional()
});

export type SmtpOptionsDto = z.infer<typeof SmtpOptionsSchema>;
