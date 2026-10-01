import { z } from 'zod';

export const LoginEventSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  userId: z.string({ message: 'User ID must be a string' }),

  visitorId: z.string({ message: 'Visitor ID must be a string' }).nullable(),

  userAgent: z.string({ message: 'User agent must be a string' }).nullable(),

  ip: z.string({ message: 'IP must be a string' }).nullable(),

  isNewDevice: z.boolean({ message: 'Is new device must be a boolean' }),

  createdAt: z.iso.datetime({ message: 'Created at must be a valid ISO datetime' })
});

export type LoginEventDto = z.infer<typeof LoginEventSchema>;
