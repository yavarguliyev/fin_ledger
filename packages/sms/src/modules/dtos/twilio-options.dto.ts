import { z } from 'zod';

export const TwilioOptionsSchema = z.object({
  accountSid: z.string({ message: 'Twilio account SID must be a string' }),

  authToken: z.string({ message: 'Twilio auth token must be a string' }),

  from: z.string({ message: 'From must be a string' }),

  baseUrl: z.string({ message: 'Base URL must be a string' }).optional()
});

export type TwilioOptionsDto = z.infer<typeof TwilioOptionsSchema>;
