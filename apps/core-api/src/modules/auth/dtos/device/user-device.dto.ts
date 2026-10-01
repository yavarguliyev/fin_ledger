import { z } from 'zod';

export const UserDeviceSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  visitorId: z.string({ message: 'Visitor ID must be a string' }),

  userAgent: z.string({ message: 'User agent must be a string' }).nullable(),

  lastIp: z.string({ message: 'Last IP must be a string' }).nullable(),

  firstSeenAt: z.iso.datetime({ message: 'First seen at must be a valid ISO datetime' }),

  lastSeenAt: z.iso.datetime({ message: 'Last seen at must be a valid ISO datetime' })
});

export type UserDeviceDto = z.infer<typeof UserDeviceSchema>;
