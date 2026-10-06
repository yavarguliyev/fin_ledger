import { z } from 'zod';

import { BaseTransportSchema } from './base-transport.dto';

export const SesOptionsSchema = BaseTransportSchema.extend({
  region: z.string({ message: 'SES region must be a string' }),

  endpoint: z.string({ message: 'SES endpoint must be a string' }).optional(),

  accessKeyId: z.string({ message: 'SES access key ID must be a string' }).optional(),

  secretAccessKey: z.string({ message: 'SES secret access key must be a string' }).optional()
});

export type SesOptionsDto = z.infer<typeof SesOptionsSchema>;
