import { z } from 'zod';

import { BaseSmsTransportSchema } from './base-sms-transport.dto';

export const SnsSmsOptionsSchema = BaseSmsTransportSchema.extend({
  region: z.string({ message: 'SNS region must be a string' }),

  endpoint: z.string({ message: 'SNS endpoint must be a string' }).optional(),

  accessKeyId: z.string({ message: 'SNS access key ID must be a string' }).optional(),

  secretAccessKey: z.string({ message: 'SNS secret access key must be a string' }).optional()
});

export type SnsSmsOptionsDto = z.infer<typeof SnsSmsOptionsSchema>;
