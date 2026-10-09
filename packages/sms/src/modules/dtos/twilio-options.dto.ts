import { z } from 'zod';

import { BaseSmsTransportSchema } from './base-sms-transport.dto';

export const TwilioOptionsSchema = BaseSmsTransportSchema.extend({
  accountSid: z.string({ message: 'Twilio account SID must be a string' }),

  authToken: z.string({ message: 'Twilio auth token must be a string' }),

  baseUrl: z.string({ message: 'Base URL must be a string' }).optional()
});

export type TwilioOptionsDto = z.infer<typeof TwilioOptionsSchema>;
