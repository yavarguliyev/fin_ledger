import { z } from 'zod';

export const SharedDeviceSchema = z.object({
  visitorId: z.string({ message: 'Visitor ID must be a string' }),

  accountCount: z.number({ message: 'Account count must be a number' }).int(),

  emails: z.array(z.string({ message: 'Each email must be a string' }), { message: 'Emails must be an array' }),

  lastSeenAt: z.iso.datetime({ message: 'Last seen at must be a valid ISO datetime' })
});

export type SharedDeviceDto = z.infer<typeof SharedDeviceSchema>;
