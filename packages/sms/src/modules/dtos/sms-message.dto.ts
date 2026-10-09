import { z } from 'zod';

import { BaseSmsTransportSchema } from './base-sms-transport.dto';

export const SmsMessageSchema = BaseSmsTransportSchema.extend({
  to: z.string({ message: 'Recipient must be a string' }),

  body: z.string({ message: 'Body must be a string' })
});

export type SmsMessageDto = z.infer<typeof SmsMessageSchema>;
